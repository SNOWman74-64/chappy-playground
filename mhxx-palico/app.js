import { API_BASE } from "./config.js";

const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
const MAX_SOURCE_BYTES = 100 * 1024 * 1024;
const MAX_IMAGE_EDGE = 4096;
const REQUEST_TIMEOUT_MS = 20_000;
const SECRET_STORAGE_KEY = "mhxx-palico-upload-secret";
const IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

const tabs = [
  { key: "inbox", label: "Inbox" },
  { key: "keep", label: "採用" },
  { key: "hold", label: "保留" },
  { key: "reject", label: "見送り" },
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

const MAX_UPLOAD_ITEMS = 20;
let uploadQueue = [];
let loadRun = 0;
let selectionBusy = false;
let uploadBusy = false;
let metadataLocked = false;

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
  if (key === "reject") return "reject";
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

  if (id) {
    const reviewLink = createElement("a", "card-review-link", status === "inbox" ? "この猫をレビュー" : "レビュー内容を開く");
    reviewLink.href = `./review.html?id=${encodeURIComponent(String(id))}`;
    body.append(reviewLink);
  }

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
  if (file.size > MAX_SOURCE_BYTES) throw new Error("image-too-large");
  const image = await decodeImage(file);
  const longestEdge = Math.max(image.naturalWidth, image.naturalHeight);
  const scale = longestEdge > MAX_IMAGE_EDGE ? MAX_IMAGE_EDGE / longestEdge : 1;
  let width = Math.max(1, Math.round(image.naturalWidth * scale));
  let height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { alpha: true });
  if (!context) throw new Error("canvas-unavailable");
  try {
    // Prefer lossless PNG. Only oversized results use high-quality JPEG;
    // preserve dimensions first, then reduce them gradually if still needed.
    for (let attempt = 0; attempt < 8; attempt += 1) {
      canvas.width = width;
      canvas.height = height;
      context.drawImage(image, 0, 0, width, height);
      const png = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!png) throw new Error("image-encode-failed");
      if (png.size <= MAX_IMAGE_BYTES) return { blob: png, width, height };
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, width, height);
      context.drawImage(image, 0, 0, width, height);
      const jpeg = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.95));
      if (jpeg && jpeg.size <= MAX_IMAGE_BYTES) return { blob: jpeg, width, height };
      width = Math.max(1, Math.floor(width * 0.85));
      height = Math.max(1, Math.floor(height * 0.85));
    }
    throw new Error("processed-image-too-large");
  } finally {
    image.onload = null;
    image.onerror = null;
    image.src = "";
    canvas.width = 0;
    canvas.height = 0;
  }
}

function fileIdentity(file) {
  return [file?.name || "", file?.size || 0, file?.lastModified || 0, file?.type || ""].join("\u001f");
}

function currentMetadata() {
  return { supportType: $("#support-type").value, memo: $("#memo").value.trim() };
}

function firstMetadataSnapshot() {
  return uploadQueue.find((entry) => entry.metadataSnapshot)?.metadataSnapshot || null;
}

function hasUnresolvedUploads() {
  return uploadQueue.some((entry) => entry.status !== "success");
}

function statusLabel(entry) {
  if (entry.status === "pending") return "送信待ち";
  if (entry.status === "preparing") return "画像を準備中…";
  if (entry.status === "uploading") return "アップロード中…";
  if (entry.status === "success") return "追加済み";
  return `失敗: ${entry.error || "再試行してください"}`;
}

function renderUploadQueue() {
  const container = $("#upload-queue");
  if (!container) return;
  container.replaceChildren();
  uploadQueue.forEach((entry) => {
    const item = createElement("li", "upload-item");
    item.dataset.status = entry.status === "preparing" ? "uploading" : entry.status;
    item.dataset.itemId = entry.id;
    const thumbnail = createElement("img");
    thumbnail.src = entry.previewUrl;
    thumbnail.alt = `${entry.name}のプレビュー`;
    thumbnail.loading = "lazy";
    const meta = createElement("div", "upload-item-meta");
    meta.append(createElement("strong", "upload-item-name", entry.name));
    meta.append(createElement("span", "upload-item-status", statusLabel(entry)));
    const remove = createElement("button", "upload-item-remove", "除外");
    remove.type = "button";
    remove.setAttribute("aria-label", `${entry.name}を選択から除外`);
    remove.disabled = uploadBusy || selectionBusy;
    remove.addEventListener("click", () => removeUploadItem(entry.id));
    item.append(thumbnail, meta, remove);
    container.append(item);
  });
  const complete = uploadQueue.filter((entry) => entry.status === "success").length;
  const total = uploadQueue.length;
  setText("#upload-progress", `${complete} / ${total || MAX_UPLOAD_ITEMS}枚完了 · ${total} / ${MAX_UPLOAD_ITEMS}枚`);
  setText("#upload-queue-hint", total ? "1枚ずつ別の猫として登録します。送信済みの猫は再送しません。" : "画像を追加すると、1枚ずつ別の猫として登録します。");
  const retryNote = $("#upload-retry-note");
  if (retryNote) retryNote.hidden = !hasUnresolvedUploads() || !metadataLocked;
  syncControls();
}

function syncControls() {
  const interactionBusy = uploadBusy || selectionBusy;
  ["#close-dialog", "#cancel-dialog", "#image-file", "#upload-secret"].forEach((selector) => {
    const element = $(selector);
    if (element) element.disabled = interactionBusy;
  });
  ["#support-type", "#memo"].forEach((selector) => {
    const element = $(selector);
    if (element) element.disabled = interactionBusy || metadataLocked;
  });
  const submitButton = $("#submit-upload");
  if (submitButton) submitButton.disabled = interactionBusy || !uploadQueue.some((entry) => entry.status !== "success");
  document.querySelectorAll(".upload-item-remove").forEach((button) => { button.disabled = interactionBusy; });
}

function setUploadBusy(busy) {
  uploadBusy = busy;
  syncControls();
}

function resetUploadQueue() {
  uploadQueue.forEach((entry) => {
    if (entry.previewUrl) URL.revokeObjectURL(entry.previewUrl);
    entry.previewUrl = null;
    entry.file = null;
    entry.preparedBlob = null;
  });
  uploadQueue = [];
  metadataLocked = false;
  const input = $("#image-file");
  if (input) input.value = "";
  $("#support-type").value = "";
  $("#memo").value = "";
  renderUploadQueue();
}

function removeUploadItem(itemId) {
  if (uploadBusy || selectionBusy) return;
  const index = uploadQueue.findIndex((entry) => entry.id === itemId);
  if (index < 0) return;
  const entry = uploadQueue[index];
  if (entry.uncertain && !window.confirm("この画像はすでに保存されている可能性があります。選択から除外して再び登録すると、重複する場合があります。除外しますか？")) return;
  if (entry.previewUrl) URL.revokeObjectURL(entry.previewUrl);
  uploadQueue.splice(index, 1);
  if (!hasUnresolvedUploads()) {
    resetUploadQueue();
  } else {
    metadataLocked = Boolean(firstMetadataSnapshot());
    renderUploadQueue();
  }
}

async function chooseImages(files) {
  const selected = Array.from(files || []);
  if (!selected.length || uploadBusy || selectionBusy) return;
  selectionBusy = true;
  syncControls();
  const known = new Set(uploadQueue.map((entry) => fileIdentity(entry.file || entry)));
  const issues = [];
  let added = 0;
  let duplicate = 0;
  let capped = 0;
  try {
    for (const file of selected) {
      if (uploadQueue.length >= MAX_UPLOAD_ITEMS) {
        capped += 1;
        continue;
      }
      const identity = fileIdentity(file);
      if (known.has(identity)) {
        duplicate += 1;
        continue;
      }
      if (!IMAGE_TYPES.has(file.type)) {
        issues.push(`${file.name}: PNG、JPEG、WebPのみ対応`);
        continue;
      }
      if (file.size > MAX_SOURCE_BYTES) {
        issues.push(`${file.name}: 元画像は100MB以下にしてください`);
        continue;
      }
      let dimensions;
      try {
        const image = await decodeImage(file);
        dimensions = { width: image.naturalWidth, height: image.naturalHeight };
        image.onload = null;
        image.onerror = null;
        image.src = "";
      } catch {
        issues.push(`${file.name}: 画像を読み込めません`);
        continue;
      }
      const entry = {
        id: `upload-${newUploadKey()}`,
        file,
        name: file.name || "palico-image",
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        width: dimensions.width,
        height: dimensions.height,
        previewUrl: URL.createObjectURL(file),
        status: "pending",
        error: "",
        uncertain: false,
        idempotencyKey: newUploadKey(),
        preparedBlob: null,
        preparedWidth: dimensions.width,
        preparedHeight: dimensions.height,
        metadataSnapshot: firstMetadataSnapshot(),
      };
      uploadQueue.push(entry);
      known.add(identity);
      added += 1;
      renderUploadQueue();
    }
  } finally {
    selectionBusy = false;
    const input = $("#image-file");
    if (input) input.value = "";
    renderUploadQueue();
  }
  const parts = [];
  if (added) parts.push(`${added}枚を追加しました`);
  if (issues.length) parts.push(`${issues.length}枚を追加できませんでした（${issues.slice(0, 2).join("、")}${issues.length > 2 ? "ほか" : ""}）`);
  if (duplicate) parts.push(`${duplicate}枚は同じファイルのためスキップしました`);
  if (capped) parts.push(`上限20枚のため${capped}枚は追加しませんでした`);
  if (parts.length) setDialogStatus(parts.join("。") + "。", issues.length || capped ? "error" : "");
}

function openDialog() {
  const dialog = $("#add-dialog");
  const snapshot = firstMetadataSnapshot();
  if (snapshot && hasUnresolvedUploads()) {
    $("#support-type").value = snapshot.supportType || "";
    $("#memo").value = snapshot.memo || "";
    metadataLocked = true;
  }
  $("#upload-secret").value = getSessionSecret();
  if (!state.apiBase) setDialogStatus("APIの接続先を設定するとアップロードできます。", "error");
  else if (hasUnresolvedUploads()) setDialogStatus("未完了の画像だけを再試行できます。", "");
  else setDialogStatus("");
  renderUploadQueue();
  if (typeof dialog.showModal === "function") dialog.showModal();
  else dialog.setAttribute("open", "");
  window.setTimeout(() => $("#image-file").focus(), 0);
}

function closeDialog() {
  if (uploadBusy || selectionBusy) return;
  const dialog = $("#add-dialog");
  if (typeof dialog.close === "function") dialog.close();
  else dialog.removeAttribute("open");
  if (!hasUnresolvedUploads()) resetUploadQueue();
  syncControls();
}

function uploadErrorMessage(error) {
  if (error?.message === "unsupported-image") return { message: "対応していない画像形式です。PNG、JPEG、WebPを選択してください。", uncertain: false };
  if (error?.message === "image-too-large") return { message: "元画像が大きすぎます。100MB以下の画像を選択してください。", uncertain: false };
  if (error?.message === "processed-image-too-large") return { message: "画像を送信できるサイズに調整できませんでした。必要な部分を切り取って再試行してください。", uncertain: false };
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

async function uploadEntry(entry, secret) {
  if (!entry.preparedBlob) {
    const prepared = await prepareImage(entry.file);
    entry.preparedBlob = prepared.blob;
    entry.preparedWidth = prepared.width;
    entry.preparedHeight = prepared.height;
  }
  const payload = new FormData();
  payload.append("image", entry.preparedBlob, entry.preparedBlob.type === "image/jpeg" ? "palico.jpg" : "palico.png");
  const snapshot = entry.metadataSnapshot || currentMetadata();
  if (snapshot.supportType) payload.append("supportType", snapshot.supportType);
  if (snapshot.memo) payload.append("memo", snapshot.memo);
  const response = await fetchWithTimeout(apiUrl("/api/palicos"), {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}`, "Idempotency-Key": entry.idempotencyKey },
    body: payload,
  });
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
  if (!palico || typeof palico !== "object" || Array.isArray(palico) || !palico.id || !palico.verdict) {
    throw Object.assign(new Error("サーバーの応答を読み取れませんでした。"), { uncertain: true, code: "INVALID_SUCCESS" });
  }
  return palico;
}

function markInboxImmediately(palico) {
  state.activeTab = "inbox";
  state.query = "";
  const search = $("#search");
  if (search) search.value = "";
  state.nextCursor = null;
  state.loadError = null;
  state.loading = false;
  state.loadingMore = false;
  loadRun += 1;
  mergePalicos([palico]);
  render();
}

async function submitUpload(event) {
  event.preventDefault();
  if (uploadBusy || selectionBusy) return;
  if (!state.apiBase) {
    setDialogStatus("APIの接続先が未設定です。config.js の API_BASE を設定してください。", "error");
    return;
  }
  const pending = uploadQueue.filter((entry) => entry.status !== "success");
  if (!pending.length) {
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
  const snapshot = currentMetadata();
  pending.forEach((entry) => {
    if (!entry.metadataSnapshot) entry.metadataSnapshot = { ...snapshot };
  });
  metadataLocked = true;
  setUploadBusy(true);
  let stoppedMessage = "";
  try {
    for (const entry of pending) {
      if (entry.status === "success") continue;
      entry.status = "preparing";
      entry.error = "";
      renderUploadQueue();
      setDialogStatus(`${uploadQueue.filter((item) => item.status === "success").length} / ${uploadQueue.length}枚を処理中…`);
      try {
        entry.status = "uploading";
        renderUploadQueue();
        const palico = await uploadEntry(entry, secret);
        entry.status = "success";
        entry.error = "";
        entry.uncertain = false;
        entry.file = null;
        entry.preparedBlob = null;
        markInboxImmediately(palico);
        saveSessionSecret(secret);
      } catch (error) {
        const result = uploadErrorMessage(error);
        entry.status = "error";
        entry.error = result.message;
        entry.uncertain = entry.uncertain || result.uncertain;
        if (!result.uncertain) entry.preparedBlob = null;
        if (error?.httpStatus === 401 || error?.httpStatus === 403) forgetSessionSecret();
        renderUploadQueue();
        if (error?.httpStatus === 401 || error?.httpStatus === 403 || error?.httpStatus === 429) {
          stoppedMessage = `${result.message} 残りの画像は送信せず停止しました。${error.httpStatus === 401 ? "シークレットを確認して再試行してください。" : "原因が解消してから再試行してください。"}`;
          break;
        }
      }
    }
  } finally {
    setUploadBusy(false);
  }
  renderUploadQueue();
  if (hasUnresolvedUploads()) {
    const complete = uploadQueue.filter((entry) => entry.status === "success").length;
    const message = stoppedMessage || `${complete} / ${uploadQueue.length}枚を追加しました。未完了の画像を再試行できます。`;
    setDialogStatus(message, "error");
    $("#submit-upload").textContent = "未完了を再試行";
    return;
  }
  const total = uploadQueue.length;
  resetUploadQueue();
  setDialogStatus(`${total}匹を追加しました。Inboxに表示しています。`, "success");
  $("#submit-upload").textContent = "Inboxに追加";
  loadPalicos();
  closeDialog();
}

function init() {
  setSetupState();
  $("#open-add").addEventListener("click", openDialog);
  $("#close-dialog").addEventListener("click", closeDialog);
  $("#cancel-dialog").addEventListener("click", closeDialog);
  $("#image-file").addEventListener("change", (event) => chooseImages(event.target.files));
  $("#add-form").addEventListener("submit", submitUpload);
  $("#search").addEventListener("input", (event) => { state.query = event.target.value; render(); });
  $("#load-more").addEventListener("click", () => loadPalicos({ append: true }));
  $("#add-dialog").addEventListener("cancel", (event) => { event.preventDefault(); if (!uploadBusy && !selectionBusy) closeDialog(); });
  $("#support-type").addEventListener("change", () => { if (!metadataLocked) renderUploadQueue(); });
  $("#memo").addEventListener("input", () => { if (!metadataLocked) renderUploadQueue(); });
  render();
  renderUploadQueue();
  if (state.apiBase) loadPalicos();
}

init();
