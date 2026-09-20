export function meets(points, skill) {
  if (!Number.isInteger(skill.threshold) || skill.threshold===0 || skill.special) return false;
  const n = points[skill.tree] ?? 0;
  return skill.threshold > 0 ? n >= skill.threshold : n <= skill.threshold;
}
export function activatedSkills(points, skills) {
  const active = new Map();
  for (const s of skills) if (meets(points,s)) {
    const old = active.get(s.tree);
    if (!old || Math.abs(s.threshold) > Math.abs(old.threshold)) active.set(s.tree,s);
  }
  return [...active.values()].sort((a,b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0).map(s => s.name);
}
export function scoreResult(result, query, rankOrder) {
  const preferredCount = query.preferred.filter(s => meets(result.skillPoints,s)).length;
  const decorationCount = result.decorations.reduce((n,d) => n+d.count,0);
  result.scoreBreakdown = {preferredCount, defense: result.totalDefense, remainingSlots: result.remainingSlots, decorationCount, rankOrder};
  result.score = preferredCount * 1000000 + result.totalDefense * 100 + result.remainingSlots * 10 - decorationCount - rankOrder;
  result.features = [preferredCount ? `希望スキル ${preferredCount}/${query.preferred.length}` : null, `初期防御 ${result.totalDefense}`, `空きスロット ${result.remainingSlots}`].filter(Boolean);
  return result;
}
export function compareResults(a,b) {
  const x=a.scoreBreakdown,y=b.scoreBreakdown;
  return y.preferredCount-x.preferredCount || y.defense-x.defense || y.remainingSlots-x.remainingSlots || x.decorationCount-y.decorationCount || x.rankOrder-y.rankOrder || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0);
}
