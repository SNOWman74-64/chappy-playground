import { API_BASE } from "./config.js";

const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
const MAX_IMAGE_EDGE = 4096;
const REQUEST_TIMEOUT_MS = 20_000;
const SECRET_STORAGE_KEY = "mhxx-palico-upload-secret";
const IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

const tabs = [
  { key: "inbox", label: "Inbox" },
  { key: "keep", label: "採用" },
  { key: "hold", label: "保留" },
  { key: "all", label: "全猫" },
];

const state = {
  apiBase: String(API_BASE || "").trim().replace(/\/+$/, ""),
  activeTab: "inbox",
  query: "",
  palicos: [],
  nextCursor: null,
  loading: false,
  loadingMore: false,
  loadError: null,
};

let selectedFile = null;
let selectedFileInfo = null;
let previewUrl = null;
let uploadKey = null;
let uploadPayloadSignature = "";
let loadRun = 0;
let uploadBusy = false;

const $ = (selector) => document.querySelector(selector);

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function setText(selector, text) {
  const element = $(selector);
  if (element) element.textContent = text;
}

function getSessionSecret() {
  try {
    return sessionStorage.getItem(SECRET_STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

function saveSessionSecret(secret) {
  try {
    sessionStorage.setItem(SECRET_STORAGE_KEY, secret);
  } catch {
    // Private browsing can disable sessionStorage; upload can still continue.
  }
}

function forgetSessionSecret() {
  try {
    sessionStorage.removeItem(SECRET_STORAGE_KEY);
  } catch {
    // Nothing else is needed when storage is unavailable.
  }
}

function apiUrl(path) {
  return `${state.apiBase}${path}`;
}

function imageUrl(palico) {
  if (!palico?.id || !state.apiBase) return "";
  return apiUrl(`/api/palicos/${encodeURIComponent(String(palico.id))}/image`);
}

function valueAt(palico, ...keys) {
  for (const key of keys) {
    const value = palico?.[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return "";
}

function displayValue(value) {
  if (value === undefined || value === null || value === "") return "—";
  if (Array.isArray(value)) return value.map(displayValue).join(", ");
  if (typeof value === "object") return Object.values(value).map(displayValue).join(" / ");
  return String(value);
}

function reviewStatus(palico) {
  const raw = valueAt(palico, "reviewStatus", "status", "verdict", "reviewDecision", "reviewedAs") || palico?.review?.status;
  const normalized = String(raw || "").trim().toLowerCase();
  if (["採用", "keep", "kept", "accepted", "accept", "approved"].includes(normalized)) return "keep";
  if (["保留", "hold", "held", "on_hold", "pending"].includes(normalized)) return "hold";
  if (["見送り", "reject", "rejected"].includes(normalized)) return "reject";
  return "inbox";
}

function reviewLabel(status) {
  if (status === "keep") return "採用";
  if (status === "hold") return "保留";
  if (status === "reject") return "見送り";
  return "未確認";
}

function apiVerdictForTab(key) {
  if (key === "inbox") return "unreviewed";
  if (key === "keep") return "keep";
  if (key === "hold") return "hold";
  return "";
}

function filteredPalicos() {
  const query = state.query.trim().toLocaleLowerCase();
  return state.palicos.filter((palico) => {
    // The active tab is also sent as `verdict` to the API. Keep this local guard
    // for the immediate post-upload render and for responses from older APIs.
    const statusMatches = state.activeTab === "all" || reviewStatus(palico) === state.activeTab;
    if (!statusMatches) return false;
    if (!query) return true;
    return JSON.stringify(palico).toLocaleLowerCase().includes(query);
  });
}

function renderTabs() {
  const container = $("#tabs");
  container.replaceChildren();
  tabs.forEach((tab) => {
    const button = createElement("button", "tab");
    button.type = "button";
    button.setAttribute("aria-selected", String(state.activeTab === tab.key));
    button.setAttribute("aria-controls", "card-grid");
    button.textContent = tab.label;
    button.addEventListener("click", () => {
      if (state.activeTab === tab.key) return;
      loadRun += 1;
      state.loading = false;
      state.loadingMore = false;
      state.activeTab = tab.key;
      state.palicos = [];
      state.nextCursor = null;
      state.loadError = null;
      render();
      if (state.apiBase) loadPalicos();
    });
    container.append(button);
  });
}

function detailItem(label, value) {
  const item = createElement("div", "detail-item");
  item.append(createElement("span", "detail-label", label));
  item.append(createElement("span", "detail-value", displayValue(value)));
  return item;
}

function reviewRows(palico) {
  const rows = [];
  const review = palico?.review;
  if (review && typeof review === "object" && !Array.isArray(review)) {
    Object.entries(review).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") rows.push([key, value]);
    });
  }
  [
    ["レビュー日時", valueAt(palico, "reviewedAt", "reviewAt")],
    ["レビュアー", valueAt(palico, "reviewedBy", "reviewer")],
    ["レビューコメント", valueAt(palico, "reviewNote", "reviewComment")],
  ].forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && !rows.some(([existing]) => existing === key)) rows.push([key, value]);
  });
  return rows;
}

function buildReviewData(palico) {
  const rows = reviewRows(palico);
  if (!rows.length) return null;
  const section = createElement("section", "review-data");
  section.append(createElement("h3", "review-data-title", "REVIEW DATA"));
  rows.forEach(([key, value]) => {
    const row = createElement("div", "review-row");
    row.append(createElement("span", null, key));
    row.append(createElement("strong", null, displayValue(value)));
    section.append(row);
  });
  return section;
}

function buildCard(palico) {
  const article = createElement("article", "palico-card");
  const photo = createElement("figure", "palico-photo");
  const source = imageUrl(palico);
  const name = valueAt(palico, "name", "nickname") || "名前未設定";
  if (source) {
    const link = createElement("a");
    link.href = source;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", `${displayValue(name)}の元画像を開く`);
    const image = createElement("img");
    image.src = source;
    image.alt = `${displayValue(name)}のスクリーンショット`;
    image.loading = "lazy";
    link.append(image);
    link.append(createElement("span", "photo-open-label", "元画像を開く"));
    photo.append(link);
  } else {
    photo.append(createElement("div", "photo-placeholder", "画像未登録"));
  }
  const caption = valueAt(palico, "caption", "imageCaption");
  if (caption) photo.append(createElement("figcaption", "sr-only", caption));
  article.append(photo);

  const body = createElement("div", "card-body");
  const top = createElement("div", "card-top");
  const titleBlock = createElement("div");
  titleBlock.append(createElement("h3", "card-name", displayValue(name)));
  const supportType = valueAt(palico, "supportType") || palico?.support?.type || "傾向未設定";
  const level = valueAt(palico, "level");
  const subtitle = [supportType, level ? `Lv.${displayValue(level)}` : ""].filter(Boolean).join(" · ");
  titleBlock.append(createElement("p", "card-subtitle", subtitle));
  top.append(titleBlock);
  const status = reviewStatus(palico);
  top.append(createElement("span", `status-badge ${status}`, reviewLabel(status)));
  body.append(top);

  const details = createElement("div", "card-details");
  const supportPattern = valueAt(palico, "supportPattern") || palico?.support?.pattern;
  const skillPattern = valueAt(palico, "skillPattern") || palico?.skill?.pattern;
  const supportMoves = valueAt(palico, "supportMoves");
  const skills = valueAt(palico, "skills");
  if (supportPattern) details.append(detailItem("サポート配列", supportPattern));
  if (skillPattern) details.append(detailItem("スキル配列", skillPattern));
  if (Array.isArray(supportMoves) && supportMoves.length) details.append(detailItem("サポート行動", supportMoves.map((move) => `${displayValue(move?.name)}${move?.group ? ` (${displayValue(move.group)})` : ""}`).join(", ")));
  if (Array.isArray(skills) && skills.length) details.append(detailItem("オトモスキル", skills.map((skill) => `${displayValue(skill?.name)}${skill?.group ? ` (${displayValue(skill.group)})` : ""}`).join(", ")));
  const id = valueAt(palico, "id");
  if (id) details.append(detailItem("ID", id));
  if (details.childElementCount) body.append(details);

  const memo = valueAt(palico, "memo", "note");
  if (memo) body.append(createElement("p", "card-memo", memo));
  const review = buildReviewData(palico);
  if (review) body.append(review);
  article.append(body);
  return article;
}

function renderEmpty(container) {
  const empty = createElement("div", "empty-state");
  const title = state.query ? "検索結果がありません" : state.activeTab === "inbox" ? "Inboxは空です" : "このタブにはまだ猫がいません";
  const copy = state.query ? "検索語を変えて試してください。" : state.activeTab === "inbox" ? "猫を追加すると、確認前のスクリーンショットがここに表示されます。" : "追加した猫は、レビュー状態に応じてここで整理できます。";
  empty.append(createElement("strong", null, title));
  empty.append(createElement("p", null, copy));
  container.append(empty);
}

function renderStatus() {
  const container = $("#global-status");
  container.replaceChildren();
  if (!state.loadError) return;
  const message = createElement("div", "status-message error");
  message.append(createElement("span", null, state.loadError.message));
  if (state.loadError.retry) {
    const retry = createElement("button", "button button-secondary", "再試行");
    retry.type = "button";
    retry.addEventListener("click", state.loadError.retry);
    message.append(retry);
  }
  container.append(message);
}

function render() {
  renderTabs();
  const list = $("#card-grid");
  list.replaceChildren();
  const visible = filteredPalicos();
  if (!visible.length) renderEmpty(list);
  else visible.forEach((palico) => list.append(buildCard(palico)));
  setText("#collection-count", `${state.palicos.length}匹${state.nextCursor ? "以上" : ""}`);
  setText("#list-result", state.query ? `${visible.length}匹を表示` : `${visible.length}匹を表示中`);
  const loadMore = $("#load-more");
  loadMore.hidden = !state.nextCursor;
  loadMore.disabled = state.loadingMore;
  loadMore.textContent = state.loadingMore ? "読み込み中…" : "さらに読み込む";
  renderStatus();
}

function setSetupState() {
  $("#setup-panel").hidden = Boolean(state.apiBase);
  $("#open-add").disabled = false;
}

function requestTimeoutError() {
  const error = new Error("timeout");
  error.code = "TIMEOUT";
  return error;
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (error?.name === "AbortError") throw requestTimeoutError();
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

async function responseMessage(response) {
  let detail = "";
  try {
    const payload = await response.clone().json();
    detail = payload?.message || payload?.error || payload?.detail || "";
  } catch {
    try {
      detail = (await response.clone().text()).trim().slice(0, 220);
    } catch {
      detail = "";
    }
  }
  const suffix = detail ? `: ${String(detail)}` : "";
  if (response.status === 401) return `認証に失敗しました（HTTP 401）${suffix}`;
  if (response.status === 403) return `アクセスが拒否されました（HTTP 403）${suffix}`;
  if (response.status === 413) return `画像またはリクエストが大きすぎます（HTTP 413）${suffix}`;
  if (response.status === 415) return `対応していない画像形式です（HTTP 415）${suffix}`;
  return `サーバーエラー（HTTP ${response.status}）${suffix}`;
}

function loadErrorFor(error, retry) {
  if (error?.code === "TIMEOUT") return { message: "通信がタイムアウトしました。接続を確認して再試行してください。", retry };
  if (error instanceof TypeError) return { message: "APIに接続できませんでした。接続先とネットワークを確認してください。", retry };
  return { message: "猫の読み込みに失敗しました。再試行してください。", retry };
}

function mergePalicos(items, replace = false) {
  const incoming = Array.isArray(items) ? items.filter((item) => item && typeof item === "object") : [];
  if (replace) {
    state.palicos = incoming;
    return;
  }
  const byId = new Map(state.palicos.map((item, index) => [String(item.id || `index-${index}`), item]));
  incoming.forEach((item, index) => byId.set(String(item.id || `incoming-${index}-${Date.now()}`), item));
  state.palicos = [...byId.values()];
}

async function loadPalicos({ append = false } = {}) {
  if (!state.apiBase || state.loading || state.loadingMore) return;
  if (append && !state.nextCursor) return;
  const run = ++loadRun;
  if (append) state.loadingMore = true;
  else state.loading = true;
  state.loadError = null;
  render();
  const params = new URLSearchParams({ limit: "50" });
  const verdict = apiVerdictForTab(state.activeTab);
  if (verdict) params.set("verdict", verdict);
  if (append && state.nextCursor) params.set("cursor", state.nextCursor);
  const cursor = `?${params.toString()}`;
  try {
    const response = await fetchWithTimeout(apiUrl(`/api/palicos${cursor}`), { headers: { Accept: "application/json" }, cache: "no-store" });
    if (!response.ok) {
      const message = await responseMessage(response);
      throw Object.assign(new Error(message), { httpStatus: response.status });
    }
    const payload = await response.json();
    if (!payload || !Array.isArray(payload.palicos)) throw new Error("invalid-payload");
    if (run !== loadRun) return;
    mergePalicos(payload.palicos, !append);
    state.nextCursor = typeof payload.nextCursor === "string" && payload.nextCursor ? payload.nextCursor : null;
  } catch (error) {
    if (run !== loadRun) return;
    state.loadError = error?.message && error.message !== "invalid-payload" && error.httpStatus ? { message: error.message, retry: () => loadPalicos({ append }) } : loadErrorFor(error, () => loadPalicos({ append }));
  } finally {
    if (run !== loadRun) return;
    state.loading = false;
    state.loadingMore = false;
    render();
  }
}

function clearPreview() {
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = null;
  selectedFile = null;
  selectedFileInfo = null;
  $("#image-file").value = "";
  $("#image-preview").hidden = true;
  $("#preview-image").removeAttribute("src");
  setText("#preview-name", "");
  setText("#preview-details", "");
  refreshUploadKey();
}

function selectedPayloadSignature() {
  return [selectedFile?.name || "", selectedFile?.size || "", selectedFile?.lastModified || "", selectedFile?.type || "", $("#support-type")?.value || "", $("#memo")?.value || ""].join("\u001f");
}

function refreshUploadKey() {
  const signature = selectedPayloadSignature();
  if (signature !== uploadPayloadSignature) {
    uploadPayloadSignature = signature;
    uploadKey = null;
  }
}

function setDialogStatus(message, kind = "") {
  const status = $("#dialog-status");
  status.className = `dialog-status${kind ? ` ${kind}` : ""}`;
  status.textContent = message;
}

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function decodeImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      if (!image.naturalWidth || !image.naturalHeight) reject(new Error("invalid-image"));
      else resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("invalid-image"));
    };
    image.src = url;
  });
}

async function prepareImage(file) {
  if (!IMAGE_TYPES.has(file.type)) throw new Error("unsupported-image");
  if (file.size > MAX_IMAGE_BYTES) throw new Error("image-too-large");
  const image = await decodeImage(file);
  const longestEdge = Math.max(image.naturalWidth, image.naturalHeight);
  const scale = longestEdge > MAX_IMAGE_EDGE ? MAX_IMAGE_EDGE / longestEdge : 1;
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { alpha: true });
  if (!context) throw new Error("canvas-unavailable");
  context.drawImage(image, 0, 0, width, height);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("image-encode-failed");
  if (blob.size > MAX_IMAGE_BYTES) throw new Error("processed-image-too-large");
  return { blob, width, height };
}

async function chooseImage(file) {
  clearPreview();
  if (!file) return;
  if (!IMAGE_TYPES.has(file.type)) {
    setDialogStatus("対応していない画像形式です。PNG、JPEG、WebPを選択してください。", "error");
    return;
  }
  if (file.size > MAX_IMAGE_BYTES) {
    setDialogStatus("画像が大きすぎます。15MB以下の画像を選択してください。", "error");
    return;
  }
  try {
    const image = await decodeImage(file);
    selectedFile = file;
    selectedFileInfo = { width: image.naturalWidth, height: image.naturalHeight };
    previewUrl = URL.createObjectURL(file);
    $("#preview-image").src = previewUrl;
    $("#image-preview").hidden = false;
    setText("#preview-name", file.name);
    setText("#preview-details", `${image.naturalWidth} × ${image.naturalHeight} · ${formatBytes(file.size)}`);
    setDialogStatus("");
    refreshUploadKey();
  } catch {
    setDialogStatus("画像を読み込めませんでした。PNG、JPEG、WebPの画像を選択してください。", "error");
  }
}

function openDialog() {
  const dialog = $("#add-dialog");
  $("#upload-secret").value = getSessionSecret();
  setDialogStatus(state.apiBase ? "" : "APIの接続先を設定するとアップロードできます。", state.apiBase ? "" : "error");
  if (typeof dialog.showModal === "function") dialog.showModal();
  else dialog.setAttribute("open", "");
  window.setTimeout(() => $("#image-file").focus(), 0);
}

function closeDialog() {
  const dialog = $("#add-dialog");
  if (typeof dialog.close === "function") dialog.close();
  else dialog.removeAttribute("open");
  clearPreview();
  $("#support-type").value = "";
  $("#memo").value = "";
  resetUploadButton();
  setUploadBusy(false);
  setDialogStatus("");
}

function resetUploadButton() {
  const button = $("#submit-upload");
  button.disabled = false;
  button.textContent = "Inboxに追加";
}

function setUploadBusy(busy) {
  uploadBusy = busy;
  ["#close-dialog", "#cancel-dialog", "#clear-image", "#image-file", "#support-type", "#memo", "#upload-secret"].forEach((selector) => {
    const element = $(selector);
    if (element) element.disabled = busy;
  });
  $("#submit-upload").disabled = busy;
}

function uploadErrorMessage(error) {
  if (error?.message === "unsupported-image") return { message: "対応していない画像形式です。PNG、JPEG、WebPを選択してください。", uncertain: false };
  if (error?.message === "image-too-large" || error?.message === "processed-image-too-large") return { message: "画像が大きすぎます。15MB以下の画像を選択してください。", uncertain: false };
  if (error?.message === "invalid-image") return { message: "画像を読み込めませんでした。PNG、JPEG、WebPの画像を選択してください。", uncertain: false };
  if (error?.message === "canvas-unavailable" || error?.message === "image-encode-failed") return { message: "画像の準備に失敗しました。別の画像で試してください。", uncertain: false };
  if (error?.code === "TIMEOUT") return { message: "アップロードがタイムアウトしました。同じ内容で再試行できます。", uncertain: true };
  if (error instanceof TypeError) return { message: "APIに接続できませんでした。同じ内容で再試行できます。", uncertain: true };
  if (error?.uncertain && error?.httpStatus) return { message: `${error.message || `サーバーエラー（HTTP ${error.httpStatus}）`}。同じ内容で再試行できます。`, uncertain: true };
  if (error?.uncertain) return { message: "サーバーから確定応答がありませんでした。同じ内容で再試行できます。", uncertain: true };
  return { message: error?.message || "アップロードに失敗しました。", uncertain: false };
}

function newUploadKey() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function submitUpload(event) {
  event.preventDefault();
  refreshUploadKey();
  if (!state.apiBase) {
    setDialogStatus("APIの接続先が未設定です。config.js の API_BASE を設定してください。", "error");
    return;
  }
  if (!selectedFile) {
    setDialogStatus("スクリーンショットを選択してください。", "error");
    $("#image-file").focus();
    return;
  }
  const secret = $("#upload-secret").value.trim();
  if (!secret) {
    setDialogStatus("共有アップロードシークレットを入力してください。", "error");
    $("#upload-secret").focus();
    return;
  }
  const submitButton = $("#submit-upload");
  setUploadBusy(true);
  submitButton.textContent = "画像を準備中…";
  setDialogStatus("画像を読み込んでいます…");
  try {
    const prepared = await prepareImage(selectedFile);
    if (!uploadKey) uploadKey = newUploadKey();
    const payload = new FormData();
    payload.append("image", prepared.blob, "palico.png");
    const supportType = $("#support-type").value;
    const memo = $("#memo").value.trim();
    if (supportType) payload.append("supportType", supportType);
    if (memo) payload.append("memo", memo);
    submitButton.textContent = "アップロード中…";
    setDialogStatus("Inboxに追加しています…");
    const response = await fetchWithTimeout(apiUrl("/api/palicos"), { method: "POST", headers: { Authorization: `Bearer ${secret}`, "Idempotency-Key": uploadKey }, body: payload });
    if (!response.ok) {
      const message = await responseMessage(response);
      const uncertain = response.status === 408 || response.status === 425 || response.status >= 500;
      throw Object.assign(new Error(message), { httpStatus: response.status, uncertain });
    }
    let result;
    try {
      result = await response.json();
    } catch {
      throw Object.assign(new Error("サーバーの応答を読み取れませんでした。"), { uncertain: true, code: "INVALID_SUCCESS" });
    }
    const palico = result?.palico && typeof result.palico === "object" ? result.palico : result;
    if (!palico || typeof palico !== "object" || Array.isArray(palico) || !palico.id || !palico.verdict) throw Object.assign(new Error("サーバーの応答を読み取れませんでした。"), { uncertain: true, code: "INVALID_SUCCESS" });
    mergePalicos([palico]);
    state.activeTab = "inbox";
    state.palicos = [palico];
    state.nextCursor = null;
    loadRun += 1;
    state.loadError = null;
    render();
    saveSessionSecret(secret);
    uploadKey = null;
    uploadPayloadSignature = "";
    setDialogStatus("追加しました。Inboxに表示しています。", "success");
    loadPalicos();
    window.setTimeout(closeDialog, 500);
  } catch (error) {
    const result = uploadErrorMessage(error);
    if (error?.httpStatus === 401 || error?.httpStatus === 403) forgetSessionSecret();
    if (!result.uncertain && error?.httpStatus !== 408 && error?.httpStatus !== 425 && !(error?.httpStatus >= 500)) uploadKey = null;
    setUploadBusy(false);
    submitButton.textContent = result.uncertain ? "再試行" : "Inboxに追加";
    setDialogStatus(result.message, "error");
  }
}

function init() {
  setSetupState();
  $("#open-add").addEventListener("click", openDialog);
  $("#close-dialog").addEventListener("click", closeDialog);
  $("#cancel-dialog").addEventListener("click", closeDialog);
  $("#clear-image").addEventListener("click", () => { clearPreview(); $("#image-file").focus(); });
  $("#image-file").addEventListener("change", (event) => chooseImage(event.target.files?.[0]));
  $("#support-type").addEventListener("change", refreshUploadKey);
  $("#memo").addEventListener("input", refreshUploadKey);
  $("#add-form").addEventListener("submit", submitUpload);
  $("#search").addEventListener("input", (event) => { state.query = event.target.value; render(); });
  $("#load-more").addEventListener("click", () => loadPalicos({ append: true }));
  $("#add-dialog").addEventListener("cancel", (event) => { event.preventDefault(); if (!uploadBusy) closeDialog(); });
  render();
  if (state.apiBase) loadPalicos();
}

init();
