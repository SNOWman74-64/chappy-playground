import { validateCharm, loadCharms, saveCharms } from "./charm-library/library.mjs";

const CANONICAL_FILES = {
  hunterSkills: "./canonical-data/hunter-skills.json",
  skillTrees: "./canonical-data/skill-trees.json",
  rankUnlocks: "./canonical-data/rank-unlocks.json",
  charmRules: "./canonical-data/charm-rules.json"
};

const DEFAULT_RANK = { rank: "G2", order: 2 };
const CHARM_STORAGE_KEY = "mhxx-hub-charms-v1";

const state = {
  selectedSkills: {required: ['弱点特効'], preferred: ['業物']},
  canonical: {
    hunterSkills: [],
    skillTrees: [],
    rankUnlocks: [],
    charmRules: {}
  },
  canonicalReady: false,
  canonicalErrors: [],
  storage: null,
  storageBlocked: false,
  rawStorageValue: null,
  charms: [],
  editingCharmId: null,
  worker: null,
  activeRequestId: null
};

const $ = (id) => document.getElementById(id);
const partNames={head:'頭',chest:'胴',arms:'腕',waist:'腰',legs:'脚',weapon:'武器',charm:'護石'};
const els = {
  canonicalStatus: $("canonical-status"),
  rank: $("rank"),
  skillTreeOptions: $("skill-tree-options"),
  searchForm: $("search-form"),
  searchButton: $("search-button"),
  cancelButton: $("cancel-button"),
  searchStatus: $("search-status"),
  searchError: $("search-error"),
  resultsList: $("results-list"),
  resultMeta: $("result-meta"),
  charmCountInline: $("charm-count-inline"),
  charmForm: $("charm-form"),
  libraryError: $("library-error"),
  libraryCount: $("library-count"),
  libraryHeadingCount: $("library-heading-count"),
  charmsList: $("charms-list"),
  importFile: $("import-file"),
  importLabel: $("import-label"),
  exportButton: $("export-button"),
  rawExportButton: $("raw-export-button"),
  charmSubmitButton: $("charm-submit-button"),
  charmCancelEdit: $("charm-cancel-edit")
};

function text(value, fallback = "—") {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
}

function node(tag, className, content) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (content !== undefined) element.textContent = text(content, "");
  return element;
}

function setHidden(element, hidden) {
  if (element) element.hidden = hidden;
}

function errorMessage(error, fallback) {
  if (error && typeof error.message === "string" && error.message.trim()) return error.message;
  if (typeof error === "string" && error.trim()) return error;
  return fallback;
}

function formatNumber(value, fallback = "—") {
  if (value === null || value === undefined || value === "") return fallback;
  const number = Number(value);
  if (!Number.isFinite(number)) return text(value);
  return new Intl.NumberFormat("ja-JP").format(number);
}

function formatDate(value) {
  if (!value) return "登録日不明";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "登録日不明";
  return new Intl.DateTimeFormat("ja-JP", { year: "numeric", month: "short", day: "numeric" }).format(date);
}

function asArray(value, key) {
  if (Array.isArray(value)) return value;
  if (value && Array.isArray(value[key])) return value[key];
  return [];
}

function rankEntries(payload) {
  const entries = asArray(payload, "ranks").length
    ? asArray(payload, "ranks")
    : (asArray(payload, "rankUnlocks").length ? asArray(payload, "rankUnlocks") : asArray(payload, "entries"));
  return entries
    .filter((entry) => entry && typeof entry.rank === "string" && entry.rank.trim())
    .map((entry, index) => ({
      rank: entry.rank.trim(),
      order: Number.isFinite(Number(entry.order)) ? Number(entry.order) : index
    }))
    .sort((a, b) => a.order - b.order || a.rank.localeCompare(b.rank, "ja"));
}

function collectSkillNames(payload) {
  const names = new Set();
  const nameKeys = new Set(["name", "skill", "skillName", "label", "displayName", "title"]);
  const ignoredKeys = new Set(["id", "order", "points", "threshold", "description", "effects", "skills", "rules"]);

  function visit(value, depth = 0) {
    if (depth > 5 || value === null || value === undefined) return;
    if (Array.isArray(value)) {
      value.forEach((item) => visit(item, depth + 1));
      return;
    }
    if (typeof value !== "object") return;

    Object.entries(value).forEach(([key, child]) => {
      if (nameKeys.has(key) && typeof child === "string" && child.trim()) names.add(child.trim());
      if (!ignoredKeys.has(key) && typeof key === "string" && /[^\x00-\x7f]/.test(key) && key.length <= 48) {
        names.add(key.trim());
      }
      visit(child, depth + 1);
    });
  }

  visit(payload);
  return [...names].filter(Boolean).sort((a, b) => a.localeCompare(b, "ja"));
}

function populateRankOptions(payload) {
  const entries = rankEntries(payload);
  const ranks = entries.length ? entries : [DEFAULT_RANK];
  const current = els.rank.value || DEFAULT_RANK.rank;
  els.rank.replaceChildren();
  ranks.forEach((entry) => {
    const option = node("option", "", entry.rank);
    option.value = entry.rank;
    els.rank.append(option);
  });
  els.rank.value = ranks.some((entry) => entry.rank === current)
    ? current
    : (ranks.some((entry) => entry.rank === DEFAULT_RANK.rank) ? DEFAULT_RANK.rank : ranks[0].rank);
}

function populateSkillOptions() {
  const fill = (target, values) => {
    target.replaceChildren();
    [...new Set(values)].forEach((name) => {
      const option = node("option");
      option.value = name;
      target.append(option);
    });
  };
  for (const kind of ['required','preferred']) renderSkillSelection(kind);
  fill(els.skillTreeOptions, Object.keys(state.canonical.charmRules.skillPointRanges??{}));
}

async function fetchCanonicalData() {
  const entries = Object.entries(CANONICAL_FILES);
  const settled = await Promise.allSettled(entries.map(async ([key, path]) => {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) throw new Error(`${path} (${response.status})`);
    return [key, await response.json()];
  }));

  const errors = [];
  settled.forEach((result, index) => {
    const key = entries[index][0];
    if (result.status === "fulfilled") {
      state.canonical[key] = result.value[1];
    } else {
      errors.push(key);
    }
  });
  state.canonicalErrors = errors;
  state.canonicalReady = errors.length === 0;

  populateRankOptions(state.canonical.rankUnlocks);
  populateSkillOptions();
  if (errors.length) {
    setDataReady(false);
    els.canonicalStatus.textContent = `一部未読込（${errors.length}件）`;
    els.canonicalStatus.title = `${errors.join("、")} を読み込めませんでした。`;
  } else {
    setDataReady(true);
    els.canonicalStatus.textContent = "データ読込済み";
    els.canonicalStatus.title = "4種類の canonical data を使用しています。";
  }
}

function libraryData() {
  return {
    skillTrees: state.canonical.skillTrees,
    charmRules: state.canonical.charmRules
  };
}

function getStorage() {
  try {
    const storage = window.localStorage;
    if (!storage || typeof storage.getItem !== "function" || typeof storage.setItem !== "function") return null;
    return storage;
  } catch (error) {
    showLibraryError(`このブラウザのローカル保存を利用できません。${errorMessage(error, "保存領域にアクセスできません")}`);
    return null;
  }
}

function showLibraryError(message, { rawAvailable = false } = {}) {
  els.libraryError.textContent = message;
  setHidden(els.libraryError, false);
  els.rawExportButton.hidden = !rawAvailable;
}

function clearLibraryError() {
  els.libraryError.textContent = "";
  setHidden(els.libraryError, true);
  els.rawExportButton.hidden = true;
}

function hasRawStorage() {
  return state.rawStorageValue !== null;
}

function showSearchError(message) {
  els.searchError.textContent = message;
  setHidden(els.searchError, false);
}

function clearSearchError() {
  els.searchError.textContent = "";
  setHidden(els.searchError, true);
}

function updateCharmCounts() {
  const count = state.charms.length;
  els.charmCountInline.textContent = String(count);
  els.libraryCount.textContent = `${count} 件`;
  els.libraryHeadingCount.textContent = String(count);
}

function setDataReady(ready) {
  [...els.searchForm.elements, ...els.charmForm.elements].forEach((control) => {
    control.disabled = !ready;
  });
  els.importFile.disabled = !ready;
  els.importLabel.classList.toggle("is-disabled", !ready);
  els.importLabel.setAttribute("aria-disabled", String(!ready));
  els.exportButton.disabled = !ready;
  els.searchStatus.textContent = ready ? "条件を確認して検索してください。" : "装備データを読み込み中です…";
}

function charmSkills(charm) {
  if (!charm || !charm.skills || typeof charm.skills !== "object") return [];
  return Object.entries(charm.skills).filter(([name, points]) => String(name).trim() && Number.isFinite(Number(points)));
}

function renderCharms() {
  updateCharmCounts();
  els.charmsList.replaceChildren();
  if (!state.charms.length) {
    const empty = node("div", "library-empty");
    empty.id = "charms-empty";
    empty.append(node("span", "", "＋"));
    empty.append(node("p", "", "まだお守りがありません。上のフォームから登録できます。"));
    els.charmsList.append(empty);
    return;
  }

  state.charms.forEach((charm) => {
    const item = node("article", "charm-item");
    item.dataset.charmId = text(charm.id, "");
    const content = node("div", "charm-item-content");
    const skills = node("div", "charm-skills");
    const entries = charmSkills(charm);
    entries.forEach(([name, points]) => {
      skills.append(node("span", "charm-skill", `${name} ${Number(points) > 0 ? "+" : ""}${points}`));
    });
    if (!entries.length) skills.append(node("span", "charm-skill", "スキルなし"));
    content.append(skills);
    content.append(node("div", "charm-meta", `スロット ${formatNumber(charm.slots)}　・　${text(charm.source, "manual")}　・　${formatDate(charm.registeredAt)}`));

    const actions = node("div", "charm-item-actions");
    const edit = node("button", "button button-secondary", "編集");
    edit.type = "button";
    edit.setAttribute("aria-label", `${entries.map(([name]) => name).join("、") || "このお守り"}を編集`);
    edit.addEventListener("click", () => beginEditCharm(charm));
    const remove = node("button", "button button-danger", "削除");
    remove.type = "button";
    remove.setAttribute("aria-label", `${entries.map(([name]) => name).join("、") || "このお守り"}を削除`);
    remove.addEventListener("click", () => removeCharm(charm.id));
    actions.append(edit, remove);
    item.append(content, actions);
    els.charmsList.append(item);
  });
}

function persistCharms(nextCharms) {
  if (state.storageBlocked) {
    showLibraryError("保存済みJSONを読み込めないため、上書きを停止しています。先に元データを退避するか、保存内容を復旧してください。", { rawAvailable: hasRawStorage() });
    return false;
  }
  if (!state.storage) {
    showLibraryError("保存領域を利用できないため、お守りを保存できませんでした。入力内容は残しています。");
    return false;
  }
  try {
    saveCharms(state.storage, nextCharms, libraryData());
    state.charms = nextCharms;
    state.rawStorageValue = null;
    clearLibraryError();
    renderCharms();
    return true;
  } catch (error) {
    showLibraryError(`お守りを保存できませんでした。既存の登録は保持されています。${errorMessage(error, "保存領域の容量を確認してください")}`);
    return false;
  }
}

function loadCharmLibrary() {
  state.storage = getStorage();
  state.storageBlocked = false;
  state.rawStorageValue = null;
  if (!state.storage) {
    renderCharms();
    return;
  }
  try {
    state.rawStorageValue = state.storage.getItem(CHARM_STORAGE_KEY);
    const loaded = loadCharms(state.storage, libraryData());
    state.charms = Array.isArray(loaded) ? loaded : [];
    state.rawStorageValue = null;
    clearLibraryError();
  } catch (error) {
    state.charms = [];
    state.storageBlocked = true;
    showLibraryError(`保存済みのお守りを読み込めませんでした。登録内容は上書きしていません。${errorMessage(error, "保存データが不正です")} 元データを退避してから復旧してください。`, { rawAvailable: hasRawStorage() });
  }
  renderCharms();
}

function newCharmId() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") return globalThis.crypto.randomUUID();
  return `charm-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function resetCharmEditor() {
  state.editingCharmId = null;
  els.charmForm.reset();
  els.charmSubmitButton.textContent = "お守りを登録";
  els.charmCancelEdit.hidden = true;
}

function beginEditCharm(charm) {
  if (state.storageBlocked) {
    showLibraryError("保存済みJSONを読み込めないため、編集を停止しています。先に元データを退避してください。", { rawAvailable: hasRawStorage() });
    return;
  }
  state.editingCharmId = charm.id;
  const entries = charmSkills(charm);
  $("charm-skill-1").value = entries[0]?.[0] || "";
  $("charm-points-1").value = entries[0]?.[1] ?? 1;
  $("charm-skill-2").value = entries[1]?.[0] || "";
  $("charm-points-2").value = entries[1]?.[1] ?? 1;
  $("charm-slots").value = String(charm.slots ?? 0);
  els.charmSubmitButton.textContent = "お守りを更新";
  els.charmCancelEdit.hidden = false;
  $("charm-skill-1").focus();
}

function readCharmForm() {
  const skills = {};
  let duplicateSkill = false;
  const rows = [
    [$("charm-skill-1").value, $("charm-points-1").value],
    [$("charm-skill-2").value, $("charm-points-2").value]
  ];
  rows.forEach(([name, points]) => {
    const normalizedName = name.trim();
    if (!normalizedName) return;
    if (Object.hasOwn(skills, normalizedName)) {
      duplicateSkill = true;
      return;
    }
    skills[normalizedName] = Number(points);
  });
  return {
    id: state.editingCharmId || newCharmId(),
    skills,
    slots: Number($("charm-slots").value),
    registeredAt: new Date().toISOString(),
    source: "manual",
    duplicateSkill
  };
}

function addCharm(event) {
  event.preventDefault();
  if (state.storageBlocked) {
    showLibraryError("保存済みJSONを読み込めないため、上書きを停止しています。先に元データを退避してください。", { rawAvailable: hasRawStorage() });
    return;
  }
  clearLibraryError();
  const draft = readCharmForm();
  if (draft.duplicateSkill) {
    showLibraryError("同じスキル系統を2回入力できません。入力内容はそのまま残しています。");
    return;
  }
  try {
    const { duplicateSkill: unused, ...value } = draft;
    const normalized = validateCharm(value, libraryData());
    const next = state.editingCharmId
      ? state.charms.map((charm) => charm.id === state.editingCharmId ? normalized : charm)
      : [...state.charms, normalized];
    if (persistCharms(next)) resetCharmEditor();
  } catch (error) {
    showLibraryError(`お守りを登録できませんでした。入力内容はそのまま残しています。${errorMessage(error, "入力値を確認してください")}`);
  }
}

function removeCharm(id) {
  if (state.storageBlocked) {
    showLibraryError("保存済みJSONを読み込めないため、削除を停止しています。先に元データを退避してください。", { rawAvailable: hasRawStorage() });
    return;
  }
  const next = state.charms.filter((charm) => charm.id !== id);
  if (next.length === state.charms.length) return;
  if (persistCharms(next) && state.editingCharmId === id) resetCharmEditor();
}

async function importCharms(file) {
  if (state.storageBlocked) {
    showLibraryError("保存済みJSONを読み込めないため、インポートを停止しています。先に元データを退避してください。", { rawAvailable: hasRawStorage() });
    els.importFile.value = "";
    return;
  }
  clearLibraryError();
  let parsed;
  try {
    parsed = JSON.parse(await file.text());
  } catch (error) {
    showLibraryError(`JSONを読み込めませんでした。既存のお守りは保持されています。${errorMessage(error, "JSONの形式を確認してください")}`);
    return;
  }
  const rawCharms = Array.isArray(parsed) ? parsed : (parsed && Array.isArray(parsed.charms) ? parsed.charms : null);
  if (!rawCharms) {
    showLibraryError("JSONはお守りの配列、または charms 配列を含むオブジェクトにしてください。既存のお守りは保持されています。");
    return;
  }
  try {
    const imported = rawCharms.map((charm) => {
      if (!charm || typeof charm !== "object" || Array.isArray(charm)) throw new Error("お守りの形式が不正です");
      return validateCharm({ ...charm, source: "import", id: charm.id || newCharmId() }, libraryData());
    });
    if (new Set(imported.map((charm) => charm.id)).size !== imported.length) {
      throw new Error("JSON内で護石IDが重複しています");
    }
    const byId = new Map(state.charms.map((charm) => [charm.id, charm]));
    imported.forEach((charm) => byId.set(charm.id, charm));
    if (persistCharms([...byId.values()])) resetCharmEditor();
    els.importFile.value = "";
  } catch (error) {
    showLibraryError(`JSONのお守りを登録できませんでした。既存のお守りは保持されています。${errorMessage(error, "入力値を確認してください")}`);
    els.importFile.value = "";
  }
}

function downloadJson(value, filename) {
  const blob = new Blob([value], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = node("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function exportRawStorage() {
  if (!hasRawStorage()) return;
  try {
    downloadJson(state.rawStorageValue, `mhxx-charms-recovery-${new Date().toISOString().slice(0, 10)}.json`);
    showLibraryError("読み込めない保存データを退避しました。元データは上書きしていません。", { rawAvailable: true });
  } catch (error) {
    showLibraryError(`保存データを退避できませんでした。${errorMessage(error, "ダウンロードを開始できません")}`, { rawAvailable: true });
  }
}

function exportCharms() {
  if (state.storageBlocked && hasRawStorage()) {
    exportRawStorage();
    return;
  }
  clearLibraryError();
  try {
    downloadJson(JSON.stringify(state.charms, null, 2), `mhxx-charms-${new Date().toISOString().slice(0, 10)}.json`);
  } catch (error) {
    showLibraryError(`JSONを書き出せませんでした。${errorMessage(error, "ダウンロードを開始できません")}`);
  }
}

function renderSkillSelection(kind) {
  const label=kind==='required'?'必須':'希望';
  const select=$(`${kind}-skills`), list=$(`selected-${kind}-skills`);
  const previous=select.value;
  select.replaceChildren(new Option('スキルを選択',''));
  for(const skill of state.canonical.hunterSkills) {
    if(skill.special||skill.unsupported||['秘術','護石強化'].includes(skill.tree)||state.selectedSkills[kind].includes(skill.name))continue;
    select.add(new Option(skill.name,skill.name));
  }
  select.value=[...select.options].some(o=>o.value===previous)?previous:'';
  list.replaceChildren();
  for(const name of state.selectedSkills[kind]) {
    const item=node('li','selected-skill');
    item.append(node('span','',name));
    const remove=node('button','remove-skill','×');
    remove.type='button';remove.setAttribute('aria-label',`${label}スキルの${name}を削除`);
    remove.disabled=!state.canonicalReady;
    remove.addEventListener('click',()=>{
      state.selectedSkills[kind]=state.selectedSkills[kind].filter(s=>s!==name);
      renderSkillSelection(kind);
      select.focus();
      $('skill-selection-status').textContent=`${label}スキルから${name}を削除しました。`;
    });
    item.append(remove);list.append(item);
  }
  if(!state.selectedSkills[kind].length)list.append(node('li','field-help','指定なし'));
}

function addSelectedSkill(kind) {
  const select=$(`${kind}-skills`), name=select.value;
  if(!name)return;
  if(!state.selectedSkills[kind].includes(name))state.selectedSkills[kind].push(name);
  select.value='';renderSkillSelection(kind);select.focus();
  $('skill-selection-status').textContent=`${kind==='required'?'必須':'希望'}スキルに${name}を追加しました。`;
}

function buildQuery() {
  const form = new FormData(els.searchForm);
  const minDefense = Number(form.get("minDefense"));
  const useCharmLibrary = form.get("useCharmLibrary") === "on";
  return {
    hunterType: text(form.get("hunterType"), "blademaster"),
    gender: text(form.get("gender"), "male"),
    rank: text(form.get("rank"), DEFAULT_RANK.rank),
    weaponSlots: Number(form.get("weaponSlots")) || 0,
    requiredSkills: [...state.selectedSkills.required],
    preferredSkills: [...state.selectedSkills.preferred],
    minDefense: Number.isFinite(minDefense) ? Math.trunc(Math.max(0, minDefense)) : 0,
    useCharmLibrary,
    charms: useCharmLibrary ? state.charms.map((charm) => ({ ...charm, skills: { ...charm.skills } })) : []
  };
}

function makeRequestId() {
  return newCharmId();
}

function setSearchBusy(busy) {
  els.searchButton.disabled = busy;
  els.cancelButton.hidden = !busy;
  els.cancelButton.disabled = !busy;
  if (!busy) els.searchStatus.textContent = "";
}

function stopWorker() {
  if (state.worker) {
    state.worker.terminate();
    state.worker = null;
  }
  state.activeRequestId = null;
}

function cancelSearch() {
  if (!state.worker) return;
  stopWorker();
  setSearchBusy(false);
  els.searchStatus.textContent = "検索をキャンセルしました。";
}

function startSearch(event) {
  event.preventDefault();
  addSelectedSkill('required');
  addSelectedSkill('preferred');
  clearSearchError();
  stopWorker();
  const requestId = makeRequestId();
  const query = buildQuery();
  let worker;
  try {
    worker = new Worker("./solver/worker.mjs", { type: "module" });
  } catch (error) {
    setSearchBusy(false);
    showSearchError(`検索ワーカーを開始できませんでした。${errorMessage(error, "worker.mjs を確認してください")}`);
    return;
  }

  state.worker = worker;
  state.activeRequestId = requestId;
  setSearchBusy(true);
  els.searchStatus.textContent = "条件を照合しています…";
  worker.addEventListener("message", (messageEvent) => {
    const message = messageEvent.data;
    if (!message || message.id !== state.activeRequestId) return;
    stopWorker();
    setSearchBusy(false);
    if (message.error) {
      showSearchError(text(message.error, "検索中にエラーが発生しました。"));
      els.searchStatus.textContent = "検索に失敗しました。";
      return;
    }
    if (!message.response || typeof message.response !== "object") {
      showSearchError("検索結果の形式を確認できませんでした。再度お試しください。");
      els.searchStatus.textContent = "検索に失敗しました。";
      return;
    }
    renderResults(message.response);
    els.searchStatus.textContent = message.response.complete===false ? "探索上限に達しました。検証済みの途中候補を表示します。" : "検索が完了しました。";
  });
  worker.addEventListener("error", (errorEvent) => {
    if (state.activeRequestId !== requestId) return;
    stopWorker();
    setSearchBusy(false);
    showSearchError(`検索ワーカーでエラーが発生しました。${errorMessage(errorEvent.error, errorEvent.message || "worker.mjs を確認してください")}`);
    els.searchStatus.textContent = "検索に失敗しました。";
  });
  try {
    worker.postMessage({ id: requestId, query });
  } catch (error) {
    stopWorker();
    setSearchBusy(false);
    showSearchError(`検索を開始できませんでした。${errorMessage(error, "入力内容を確認してください")}`);
  }
}

function appendDetailRow(parent, label, value) {
  const row = node("li", "detail-row");
  row.append(node("span", "detail-label", label), node("span", "detail-value", text(value)));
  parent.append(row);
}

function createResultBlock(title, content) {
  const block = node("div", "result-block");
  block.append(node("h4", "", title), content);
  return block;
}

function renderArmor(result) {
  const list = node("ul", "armor-list");
  const details = Array.isArray(result.armorDetails) ? result.armorDetails : [];
  const detailById = new Map(details.map((detail) => [String(detail?.id), detail]));
  const armorMap = result.armor && typeof result.armor === "object" ? result.armor : (result.armorMap || {});
  const entries = Object.entries(armorMap);
  if (!entries.length) {
    list.append(node("li", "armor-row", "防具情報なし"));
    return list;
  }
  entries.forEach(([slot, id]) => {
    const detail = detailById.get(String(id));
    const row = node("li", "armor-row");
    row.append(
      node("span", "armor-slot", partNames[detail?.slot || slot]??slot),
      node("span", "armor-name", text(detail?.name || id))
    );
    list.append(row);
  });
  return list;
}

function renderCharm(result) {
  const charmDetails = Array.isArray(result.charmDetails) ? result.charmDetails : [];
  const charmId = result.charm;
  const detail = charmDetails.find((item) => String(item?.id) === String(charmId)) || (result.charmDetails && !Array.isArray(result.charmDetails) ? result.charmDetails : null);
  const list = node("ul", "detail-list");
  if (charmId === null || charmId === undefined || charmId === "") {
    appendDetailRow(list, "お守り", "指定なし");
    return list;
  }
  appendDetailRow(list, "お守り", detail?.name || '登録済み護石');
  if (detail?.skills && typeof detail.skills === "object") appendDetailRow(list, "スキル", Object.entries(detail.skills).map(([name, points]) => `${name} ${points}`).join("、"));
  if (detail?.slots !== undefined) appendDetailRow(list, "スロット", detail.slots);
  return list;
}

function renderDecorations(result) {
  const list = node("ul", "detail-list");
  const decorations = Array.isArray(result.decorations) ? result.decorations : [];
  if (!decorations.length) {
    appendDetailRow(list, "装飾品", "なし");
    return list;
  }
  decorations.forEach((decoration) => {
    const placements = Array.isArray(decoration?.placements)
      ? decoration.placements.map((placement) => `${partNames[placement?.location]??text(placement?.location)} ×${formatNumber(placement?.count)}`).join("、")
      : "配置情報なし";
    appendDetailRow(list, `${text(decoration?.name)} ×${formatNumber(decoration?.count, "0")}`, placements);
  });
  return list;
}

function renderActivatedSkills(result) {
  const list = node("ul", "tag-list");
  const skills = Array.isArray(result.activatedSkills) ? result.activatedSkills : [];
  if (!skills.length) list.append(node("li", "tag", "発動スキルなし"));
  skills.forEach((skill) => list.append(node("li", "tag", skill)));
  return list;
}

function renderResultCard(result, index, complete) {
  const article = node("article", "result-card");
  const header = node("header", "result-card-header");
  header.append(node("h3", "", `候補 ${index + 1}`));
  if (!complete) header.append(node("span", "partial-badge", "不完全な途中結果"));
  article.append(header);

  const body = node("div", "result-card-body");
  const stats = node("dl", "result-stats");
  [["初期防御", result.totalDefense], ["残りスロット", result.remainingSlots], ["解禁目安", result.rankRequirement]].forEach(([label, value]) => {
    const stat = node("div", "stat");
    stat.append(node("dt", "", label), node("dd", "", formatNumber(value)));
    stats.append(stat);
  });
  body.append(stats);
  if(result.features?.length)body.append(node('p','field-help',result.features.join(' ・ ')));
  body.append(createResultBlock("防具", renderArmor(result)));
  body.append(createResultBlock("お守り", renderCharm(result)));
  body.append(createResultBlock("装飾品", renderDecorations(result)));
  body.append(createResultBlock("発動スキル", renderActivatedSkills(result)));

  if (Array.isArray(result.warnings) && result.warnings.length) {
    const warnings = node("ul", "warning-list");
    result.warnings.forEach((warning) => warnings.append(node("li", "", warning)));
    body.append(createResultBlock("注意", warnings));
  }
  article.append(body);
  return article;
}

function createResultsEmpty(complete = true) {
  const empty = node("div", "empty-state");
  empty.id = "results-empty";
  empty.append(node("span", "empty-mark", "◇"));
  if (complete) {
    empty.append(node("h3", "", "条件に合う装備が見つかりませんでした"));
    empty.append(node("p", "", "必須スキルや防御力の条件を少しゆるめて、もう一度お試しください。"));
  } else {
    empty.append(node("h3", "", "探索上限に達したため、結果は不完全です"));
    empty.append(node("p", "", "候補がないとは確定していません。条件を絞るか、もう一度検索してください。"));
  }
  return empty;
}

function renderResults(response) {
  clearSearchError();
  const results = Array.isArray(response.results) ? response.results : [];
  const complete = response.complete !== false;
  const meta = [`${results.length}件`];
  if (!complete) meta.push("不完全な途中結果");
  if (response.searchedCombinations !== undefined) meta.push(`${formatNumber(response.searchedCombinations)}通りを照合`);
  if (response.elapsedMs !== undefined) meta.push(`${formatNumber(response.elapsedMs)}ms`);
  els.resultMeta.textContent = meta.join("　・　");
  els.resultsList.replaceChildren();
  if (!results.length) {
    els.resultsList.append(createResultsEmpty(complete));
  } else {
    results.forEach((result, index) => els.resultsList.append(renderResultCard(result || {}, index, complete)));
  }
  if (Array.isArray(response.warnings) && response.warnings.length) {
    const warningBox = node("div", "inline-error");
    warningBox.setAttribute("role", "status");
    warningBox.append(node("strong", "", complete ? "検索メモ" : "検索は上限に達しました。"));
    const list = node("ul", "warning-list");
    response.warnings.forEach((warning) => list.append(node("li", "", warning)));
    warningBox.append(list);
    els.resultsList.prepend(warningBox);
  }
}

els.searchForm.addEventListener("submit", startSearch);
for(const kind of ['required','preferred'])$(`add-${kind}-skill`).addEventListener('click',()=>addSelectedSkill(kind));
els.cancelButton.addEventListener("click", cancelSearch);
els.charmForm.addEventListener("submit", addCharm);
els.importFile.addEventListener("change", () => {
  const [file] = els.importFile.files || [];
  if (file) importCharms(file);
});
els.exportButton.addEventListener("click", exportCharms);
els.rawExportButton.addEventListener("click", exportRawStorage);
els.charmCancelEdit.addEventListener("click", resetCharmEditor);

async function bootstrap() {
  setDataReady(false);
  try {
    await fetchCanonicalData();
  } catch (error) {
    setDataReady(false);
    state.canonicalErrors = Object.keys(CANONICAL_FILES);
    els.canonicalStatus.textContent = "データ未読込";
    els.canonicalStatus.title = errorMessage(error, "canonical data を読み込めませんでした");
    populateRankOptions([]);
    populateSkillOptions();
  }
  loadCharmLibrary();
}

bootstrap();
