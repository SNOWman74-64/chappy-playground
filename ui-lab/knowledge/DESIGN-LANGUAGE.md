# AI-readable Design Language Model

UI Lab で得た知識を、将来 AI が再利用できる Design Language へ育てるためのメタ設計。

実際の恒常デザインルールは `../DESIGN.md` が正本。このファイルは **ルールをどう発見・昇格・選択するか** だけを扱う。

## Layers

```text
requirements / user intent
→ what to build

DESIGN.md
→ stable shared design decisions

knowledge/
→ references, preferences, site DNA, search indexes

study DESIGN.md
→ task-specific design decisions

tokens / CSS / components
→ concrete implementation values and reusable implementation units
```

Harness の作業権限・Evidence・Role は `../docs/AI-HARNESS.md` が所有する。

## Promotion lifecycle

Design Language は先に文章で固定せず、次の順で育てる。

```text
Reference
→ 好き / 気になる
→ Reproduction
→ 構造を理解
→ My Version
→ RETROSPECTIVE
→ 別 study でも同じ判断が再現
→ LEARNINGS
→ 安定した shared rule なら DESIGN.md
```

一度だけ使った表現、特定 Reference にしか合わない表現、ルール化すると自由度を下げるものは shared rule にしない。

## Pattern vocabulary

将来、再利用価値の高い layout / interaction に独自名を与えてよい。

Pattern 名は HTML template 名ではなく、**意図・構造・使いどころを表す語**にする。

Pattern file を作る場合は最低限以下を持つ。

```md
# PAT-... — Pattern name

Intent:
Use when:
Avoid when:
Structure:
Responsive:
Motion / Interaction:
Canonical evidence:
```

Pattern の検索入口は `PATTERN-INDEX.md`。詳細ルールを Index に複製しない。

## Project-specific selection

共通 Design Language をすべての project に強制しない。

```text
requirements
+ shared DESIGN
+ relevant patterns / site DNA / preferences
→ project or study DESIGN.md
```

Web app / marketing site / portfolio / experimental 3D では適用する pattern や motion density が異なるため、AI は要求に合うものだけ選ぶ。

## Future UI Architect role

UI Architect を作る場合、その役割は巨大な rule 集を内包することではなく、次の routing layer にする。

1. 要求を読む。
2. `knowledge/INDEX.md` から必要な知識だけ取得する。
3. shared `DESIGN.md` と矛盾しない pattern を選ぶ。
4. project / study 固有の `DESIGN.md` に判断を落とす。

知識本体は repo に残し、Agent は検索と選択を担当する。

## External references

- Vercel — https://vercel.com/blog/how-our-agents-build-on-brand-pages-with-design-md
- Google Labs Code `design.md` — https://github.com/google-labs-code/design.md
- Refero Styles — https://styles.refero.design/
