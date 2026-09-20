import { API_BASE } from "./config.js";

const SECRET_STORAGE_KEY = "mhxx-palico-upload-secret";
const REQUEST_TIMEOUT_MS = 20_000;
const SUPPORT_TYPES = ["カリスマ", "ファイト", "ガード", "アシスト", "回復", "ボマー", "コレクト", "ビースト"];
const GROUPS = ["A", "B", "C", "fixed", "unknown"];
const VERDICTS = ["unreviewed", "keep", "hold", "reject"];

const state = {
  apiBase: String(API_BASE || "").trim().replace(/\/+$/, ""),
  current: null,
  queue: [],
  queueCursor: null,
  queueExhausted: false,
  queueSeen: new Set(),
  queueExcluded: new Set(),
  loading: false,
  queueLoading: false,
  saving: false,
  dirty: new Set(),
  skippedUnreviewed: 0,
  imageUrl: "",
  zoom: "fit",
};

const $ = (selector, root = document) => root.querySelector(selector);

function apiUrl(path) { return `${state.apiBase}${path}`; }

function getSessionSecret() {
  try { return sessionStorage.getItem(SECRET_STORAGE_KEY) || ""; } catch { return ""; }
}

function saveSessionSecret(secret) {
  try { sessionStorage.setItem(SECRET_STORAGE_KEY, secret); } catch { /* sessionStorage may be unavailable */ }
}

function valueOrNull(value) {
  const text = String(value ?? "").trim();
  return text || null;
}

/** Pure patch builder: only fields in dirty are sent, so untouched data survives. */
export function buildReviewPatch(values, dirty = new Set()) {
  const patch = {};
  const has = (field) => dirty.has(field);
  if (has("name")) patch.name = valueOrNull(values.name);
  if (has("level")) {
    const level = String(values.level ?? "").trim();
    patch.level = level === "" ? null : Number(level);
  }
  if (has("supportType")) patch.supportType = valueOrNull(values.supportType);
  if (has("supportMoves")) patch.supportMoves = Array.isArray(values.supportMoves) && values.supportMoves.length ? values.supportMoves : null;
  if (has("skills")) patch.skills = Array.isArray(values.skills) && values.skills.length ? values.skills : null;
  if (has("supportPattern")) patch.supportPattern = valueOrNull(values.supportPattern);
  if (has("skillPattern")) patch.skillPattern = valueOrNull(values.skillPattern);
  if (has("memo")) patch.memo = valueOrNull(values.memo);
  if (has("verdict")) patch.verdict = values.verdict;
  return patch;
}

function requestTimeoutError() {
  const error = new Error("timeout");
  error.code = "TIMEOUT";
  return error;
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try { return await fetch(url, { ...options, signal: controller.signal, cache: "no-store" }); }
  catch (error) { if (error?.name === "AbortError") throw requestTimeoutError(); throw error; }
  finally { window.clearTimeout(timeoutId); }
}

async function responseMessage(response) {
  let detail = "";
  try {
    const payload = await response.clone().json();
    detail = payload?.message || payload?.error || payload?.detail || "";
  } catch {
    try { detail = (await response.clone().text()).trim().slice(0, 220); } catch { detail = ""; }
  }
  const suffix = detail ? `: ${String(detail)}` : "";
  if (response.status === 401) return `認証に失敗しました（HTTP 401）${suffix}`;
  if (response.status === 404) return `猫が見つかりません（HTTP 404）${suffix}`;
  if (response.status === 429) return `利用上限に達しました（HTTP 429）${suffix}`;
  return `サーバーエラー（HTTP ${response.status}）${suffix}`;
}

function errorMessage(error) {
  if (error?.code === "TIMEOUT") return "通信がタイムアウトしました。接続を確認して再試行してください。";
  if (error instanceof TypeError) return "APIに接続できませんでした。接続先とネットワークを確認してください。";
  return error?.message || "猫の読み込みに失敗しました。再試行してください。";
}

function setStatus(message = "", kind = "") {
  const container = $("#review-status");
  container.replaceChildren();
  if (!message) return;
  const status = document.createElement("div");
  status.className = `status-message${kind ? ` ${kind}` : ""}`;
  status.textContent = message;
  container.append(status);
}

function setLoading(loading, text = "猫を読み込んでいます…") {
  state.loading = loading;
  const element = $("#review-loading");
  element.hidden = !loading;
  element.textContent = text;
}

function setQueueCount(text) { $("#queue-count").textContent = text; }

function imageEndpoint(cat) { return cat?.id ? apiUrl(`/api/palicos/${encodeURIComponent(String(cat.id))}/image`) : ""; }

async function getPalico(id) {
  const response = await fetchWithTimeout(apiUrl(`/api/palicos/${encodeURIComponent(String(id))}`), { headers: { Accept: "application/json" } });
  if (!response.ok) throw Object.assign(new Error(await responseMessage(response)), { httpStatus: response.status });
  const cat = await response.json();
  if (!cat || typeof cat !== "object" || cat.id !== id) throw new Error("サーバーの応答を確認できませんでした。");
  return cat;
}

async function loadQueuePage(reset = false) {
  if (state.queueLoading || (state.queueExhausted && !reset)) return;
  if (reset) {
    state.queue = [];
    state.queueCursor = null;
    state.queueExhausted = false;
    state.queueSeen.clear();
  }
  state.queueLoading = true;
  try {
    const params = new URLSearchParams({ verdict: "unreviewed", limit: "50" });
    if (state.queueCursor) params.set("cursor", state.queueCursor);
    const response = await fetchWithTimeout(apiUrl(`/api/palicos?${params}`), { headers: { Accept: "application/json" } });
    if (!response.ok) throw Object.assign(new Error(await responseMessage(response)), { httpStatus: response.status });
    const payload = await response.json();
    if (!payload || !Array.isArray(payload.palicos)) throw new Error("サーバーの応答を確認できませんでした。");
    payload.palicos.forEach((cat) => {
      const id = String(cat?.id || "");
      if (id && !state.queueSeen.has(id) && !state.queueExcluded.has(id)) {
        state.queueSeen.add(id);
        state.queue.push(id);
      }
    });
    state.queueCursor = typeof payload.nextCursor === "string" && payload.nextCursor ? payload.nextCursor : null;
    state.queueExhausted = !state.queueCursor;
    setQueueCount(`${state.queue.length}${state.queueCursor ? "+" : ""}匹待ち`);
  } finally {
    state.queueLoading = false;
  }
}

async function nextQueueId() {
  while (true) {
    if (state.queue.length) return state.queue.shift();
    if (state.queueExhausted) return null;
    await loadQueuePage();
  }
}

function currentValues() {
  const moveValues = (selector) => Array.from(document.querySelectorAll(`${selector} .move-row`)).map((row) => {
    const name = $(".move-name", row).value.trim();
    const group = $(".move-group", row).value;
    return name ? { name, ...(group ? { group } : {}) } : null;
  }).filter(Boolean);
  return {
    name: $("#cat-name").value,
    level: $("#cat-level").value,
    supportType: $("#cat-support-type").value,
    supportMoves: moveValues("#support-moves"),
    skills: moveValues("#skills"),
    supportPattern: $("#support-pattern").value,
    skillPattern: $("#skill-pattern").value,
    memo: $("#cat-memo").value,
    verdict: document.querySelector('input[name="verdict"]:checked')?.value || "unreviewed",
  };
}

function validateValues(values) {
  if (String(values.name).trim().length > 100) return "名前は100文字以内で入力してください。";
  if (String(values.level).trim()) {
    const level = Number(values.level);
    if (!Number.isInteger(level) || level < 1 || level > 99) return "レベルは1〜99の整数で入力してください。";
  }
  if (values.supportType && !SUPPORT_TYPES.includes(values.supportType)) return "サポート傾向を選び直してください。";
  for (const [label, moves] of [["サポート行動", values.supportMoves], ["オトモスキル", values.skills]]) {
    if (moves.length > 50) return `${label}は50行以内で入力してください。`;
    if (moves.some((move) => move.name.length > 100)) return `${label}の名前は100文字以内で入力してください。`;
    if (moves.some((move) => move.group && !GROUPS.includes(move.group))) return `${label}のグループを選び直してください。`;
  }
  if (String(values.supportPattern).trim().length > 100 || String(values.skillPattern).trim().length > 100) return "配列は100文字以内で入力してください。";
  if (String(values.memo).length > 2000) return "メモは2000文字以内で入力してください。";
  if (!VERDICTS.includes(values.verdict)) return "判定を選択してください。";
  return "";
}

function markDirty(field) {
  state.dirty.add(field);
}

function createMoveRow(container, move = {}, field) {
  const row = document.createElement("div");
  row.className = "move-row";
  const name = document.createElement("input");
  name.className = "move-name";
  name.type = "text";
  name.maxLength = 100;
  name.placeholder = "行動名 / スキル名";
  name.setAttribute("aria-label", `${field === "supportMoves" ? "サポート行動" : "オトモスキル"}の名前`);
  name.value = move?.name || "";
  const group = document.createElement("select");
  group.className = "move-group";
  group.setAttribute("aria-label", "グループ");
  group.append(new Option("未設定", ""), ...GROUPS.map((value) => new Option(value === "unknown" ? "unknown（不明）" : value, value)));
  group.value = GROUPS.includes(move?.group) ? move.group : "";
  const remove = document.createElement("button");
  remove.className = "remove-row";
  remove.type = "button";
  remove.setAttribute("aria-label", "この行を削除");
  remove.textContent = "×";
  name.addEventListener("input", () => markDirty(field));
  group.addEventListener("change", () => markDirty(field));
  remove.addEventListener("click", () => { row.remove(); markDirty(field); renderMoveEmptyState(container); });
  row.append(name, group, remove);
  container.append(row);
}

function renderMoveEmptyState(container) {
  const empty = $(".move-empty", container);
  const hasRows = container.querySelector(".move-row");
  if (hasRows && empty) empty.remove();
  if (!hasRows && !empty) {
    const copy = document.createElement("div");
    copy.className = "move-empty";
    copy.textContent = "まだ入力されていません。読めた行だけ追加してください。";
    container.append(copy);
  }
}

function renderMoves(selector, moves, field) {
  const container = $(selector);
  container.replaceChildren();
  (Array.isArray(moves) ? moves : []).forEach((move) => createMoveRow(container, move, field));
  renderMoveEmptyState(container);
}

function setFormFromCat(cat) {
  $("#cat-id").textContent = cat.id;
  $("#cat-name").value = cat.name || "";
  $("#cat-level").value = cat.level ?? "";
  $("#cat-support-type").value = SUPPORT_TYPES.includes(cat.supportType) ? cat.supportType : "";
  $("#support-pattern").value = cat.supportPattern || "";
  $("#skill-pattern").value = cat.skillPattern || "";
  $("#cat-memo").value = cat.memo || "";
  document.querySelectorAll('input[name="verdict"]').forEach((input) => { input.checked = input.value === (cat.verdict || "unreviewed"); });
  renderMoves("#support-moves", cat.supportMoves, "supportMoves");
  renderMoves("#skills", cat.skills, "skills");
  state.dirty.clear();
}

function applyImage(cat) {
  const image = $("#source-image");
  const loading = $("#image-loading");
  state.imageUrl = imageEndpoint(cat);
  state.zoom = "fit";
  image.removeAttribute("src");
  image.dataset.zoom = "fit";
  image.alt = `${cat.name || cat.id}のスクリーンショット`;
  loading.className = "image-loading";
  loading.textContent = "画像を読み込んでいます…";
  loading.hidden = false;
  $("#original-link").href = state.imageUrl || "#";
  document.querySelectorAll(".zoom-button").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.zoom === "fit")));
  if (!state.imageUrl) { loading.textContent = "画像が登録されていません。"; loading.className = "image-loading error"; return; }
  image.onload = () => { loading.hidden = true; applyZoom("fit"); };
  image.onerror = () => { loading.hidden = false; loading.textContent = "画像を読み込めませんでした。元画像リンクを再試行してください。"; loading.className = "image-loading error"; };
  image.src = state.imageUrl;
}

function applyZoom(zoom) {
  const image = $("#source-image");
  state.zoom = zoom;
  image.dataset.zoom = String(zoom);
  if (zoom === "fit") image.style.width = "100%";
  else if (image.naturalWidth) image.style.width = `${Math.max(1, Math.round(image.naturalWidth * Number(zoom)))}px`;
  document.querySelectorAll(".zoom-button").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.zoom === String(zoom))));
}

function showCat(cat) {
  state.current = cat;
  const url = new URL(window.location.href);
  url.searchParams.set("id", String(cat.id));
  window.history.replaceState({}, "", `${url.pathname}?${url.searchParams.toString()}${url.hash}`);
  setFormFromCat(cat);
  applyImage(cat);
  $("#review-content").hidden = false;
  $("#review-empty").hidden = true;
}

function showQueueEmpty() {
  state.current = null;
  const url = new URL(window.location.href);
  url.searchParams.delete("id");
  window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  $("#review-content").hidden = true;
  $("#review-empty").hidden = false;
  $("#review-empty h2").textContent = state.skippedUnreviewed ? "次の猫はありません" : "Inboxの確認は完了です";
  $("#review-empty p:not(.eyebrow)").textContent = state.skippedUnreviewed
    ? "未確認のまま次へ進めた猫は、一覧のInboxから後で確認できます。"
    : "未確認の猫はありません。一覧に戻って別の判定タブも確認できます。";
  setQueueCount(state.skippedUnreviewed ? "未確認を保留" : "0匹待ち");
}

async function loadCandidate(id, { throwOnError = false } = {}) {
  setLoading(true, "猫を読み込んでいます…");
  try {
    const cat = await getPalico(id);
    state.queueExcluded.add(String(cat.id));
    showCat(cat);
    state.queue = state.queue.filter((queuedId) => queuedId !== String(cat.id));
    setQueueCount(`${state.queue.length}${state.queueCursor ? "+" : ""}匹待ち`);
    setStatus("");
  } catch (error) {
    setStatus(errorMessage(error), "error");
    if (!state.current) { $("#review-content").hidden = true; $("#review-empty").hidden = true; }
    if (throwOnError) throw error;
  } finally { setLoading(false); }
}

async function loadNextCandidate() {
  while (true) {
    const id = await nextQueueId();
    if (!id) return false;
    try {
      const cat = await getPalico(id);
      // A second reviewer may have changed this row after the queue page was read.
      // Skip it for the server-backed inbox queue, while direct URL review remains allowed.
      if (cat.verdict !== "unreviewed") {
        state.queueExcluded.add(String(id));
        continue;
      }
      state.queueExcluded.add(String(cat.id));
      showCat(cat);
      setQueueCount(`${state.queue.length}${state.queueCursor ? "+" : ""}匹待ち`);
      return true;
    } catch (error) {
      // Put a failed candidate back so a transient GET cannot silently skip it.
      state.queue.unshift(id);
      setStatus(errorMessage(error), "error");
      throw error;
    }
  }
}

async function loadInitial() {
  if (!state.apiBase) { setLoading(false); setStatus("APIの接続先が未設定です。config.js の API_BASE を設定してください。", "error"); return; }
  setLoading(true);
  try {
    await loadQueuePage(true);
    const params = new URLSearchParams(window.location.search);
    const requestedId = params.get("id");
    if (requestedId) {
      await loadCandidate(requestedId);
      return;
    }
    if (!(await loadNextCandidate())) showQueueEmpty();
  } catch (error) {
    setStatus(errorMessage(error), "error");
    setQueueCount("読み込み失敗");
  } finally { setLoading(false); }
}

function setSavingControls(disabled) {
  ["#save-review", "#save-next", "#add-support-move", "#add-skill"].forEach((selector) => { const button = $(selector); if (button) button.disabled = disabled; });
  document.querySelectorAll(".remove-row").forEach((button) => { button.disabled = disabled; });
  document.querySelectorAll("#review-form input, #review-form select, #review-form textarea").forEach((field) => { field.disabled = disabled; });
}

function patchMatches(cat, patch) {
  return Object.entries(patch).every(([key, expected]) => {
    const actual = cat?.[key];
    if (expected === null) return actual === undefined || actual === null;
    return JSON.stringify(actual) === JSON.stringify(expected);
  });
}

async function verifySaved(id, responseCat, patch) {
  if (!responseCat || responseCat.id !== id || !VERDICTS.includes(responseCat.verdict)) throw new Error("保存結果を確認できませんでした。フォームは保持されています。");
  if (!patchMatches(responseCat, patch)) throw new Error("保存結果に入力内容が反映されていません。フォームは保持されています。");
  const verified = await getPalico(id);
  if (verified.id !== id || !VERDICTS.includes(verified.verdict)) throw new Error("保存後の猫を再確認できませんでした。フォームは保持されています。");
  if (!patchMatches(verified, patch)) throw new Error("保存後のサーバー内容が入力内容と一致しません。フォームは保持されています。");
  return verified;
}

async function saveReview(next = false) {
  if (state.saving || !state.current) return;
  const values = currentValues();
  const invalid = validateValues(values);
  if (invalid) { setStatus(invalid, "error"); return; }
  const patch = buildReviewPatch(values, state.dirty);
  const secret = $("#review-secret").value.trim();
  if (Object.keys(patch).length && !secret) { setStatus("保存するには共有シークレットを入力してください。", "error"); $("#review-secret").focus(); return; }
  state.saving = true;
  setSavingControls(true);
  setStatus(Object.keys(patch).length ? "保存しています…" : "変更がないため、サーバーの状態を確認しています…");
  try {
    let responseCat = state.current;
    if (Object.keys(patch).length) {
      const response = await fetchWithTimeout(apiUrl(`/api/palicos/${encodeURIComponent(String(state.current.id))}`), { method: "PATCH", headers: { Accept: "application/json", "Content-Type": "application/json", Authorization: `Bearer ${secret}` }, body: JSON.stringify(patch) });
      if (!response.ok) throw Object.assign(new Error(await responseMessage(response)), { httpStatus: response.status });
      responseCat = await response.json();
      saveSessionSecret(secret);
    }
    const verified = await verifySaved(state.current.id, responseCat, patch);
    state.current = verified;
    setFormFromCat(verified);
    state.queueExcluded.add(String(verified.id));
    state.queue = state.queue.filter((id) => id !== String(verified.id));
    if (!next) {
      showCat(verified);
      setStatus("保存しました。サーバーの内容を再確認済みです。", "success");
      return;
    }
    if (verified.verdict === "unreviewed") state.skippedUnreviewed += 1;
    if (await loadNextCandidate()) {
      setStatus("保存しました。次の猫を表示しています。", "success");
    } else {
      showQueueEmpty();
      setStatus(state.skippedUnreviewed ? "保存しました。今回の順番は終了です。未確認の猫はInboxに残っています。" : "保存しました。今回読み込んだInboxの確認は完了です。", "success");
    }
  } catch (error) {
    setStatus(errorMessage(error), "error");
  } finally {
    state.saving = false;
    setSavingControls(false);
  }
}

function bindEvents() {
  $("#review-secret").value = getSessionSecret();
  [["#cat-name", "name"], ["#cat-level", "level"], ["#cat-support-type", "supportType"], ["#support-pattern", "supportPattern"], ["#skill-pattern", "skillPattern"], ["#cat-memo", "memo"]].forEach(([selector, field]) => {
    $(selector).addEventListener("input", () => markDirty(field));
    $(selector).addEventListener("change", () => markDirty(field));
  });
  document.querySelectorAll('input[name="verdict"]').forEach((input) => input.addEventListener("change", () => markDirty("verdict")));
  $("#add-support-move").addEventListener("click", () => { const container = $("#support-moves"); $(".move-empty", container)?.remove(); createMoveRow(container, {}, "supportMoves"); markDirty("supportMoves"); container.querySelector(".move-row:last-child .move-name")?.focus(); });
  $("#add-skill").addEventListener("click", () => { const container = $("#skills"); $(".move-empty", container)?.remove(); createMoveRow(container, {}, "skills"); markDirty("skills"); container.querySelector(".move-row:last-child .move-name")?.focus(); });
  $("#save-review").addEventListener("click", () => saveReview(false));
  $("#save-next").addEventListener("click", () => saveReview(true));
  $("#review-form").addEventListener("submit", (event) => { event.preventDefault(); saveReview(false); });
  document.querySelectorAll(".zoom-button").forEach((button) => button.addEventListener("click", () => applyZoom(button.dataset.zoom)));
  window.addEventListener("beforeunload", (event) => { if (state.saving || state.dirty.size) { event.preventDefault(); event.returnValue = ""; } });
  document.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (!link || link.target === "_blank") return;
    if (state.saving) { event.preventDefault(); return; }
    if (!state.dirty.size) return;
    if (!window.confirm("未保存の変更があります。ページを移動しますか？")) event.preventDefault();
  });
}

if (typeof document !== "undefined") {
  bindEvents();
  loadInitial();
}
