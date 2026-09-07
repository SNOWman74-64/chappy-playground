# UI Lab Knowledge Router

UI Lab のデザイン知識を AI が必要な分だけ引くための入口。

このディレクトリは **設計ルールの正本そのものではなく、参照・好み・サイト固有知識・横断インデックスを分離して保持する層** として使う。

## Canonical ownership

| Need | Canonical source |
| --- | --- |
| UI Lab 全体の恒常デザインルール | `../DESIGN.md` |
| 複数 study で再利用可能と確認された知見 | `../LEARNINGS.md` |
| study 固有の判断 | `../<study>/DESIGN.md` |
| study 固有の失敗・検証 | `../<study>/RETROSPECTIVE.md`, `TEST-REPORT.md` |
| Harness / engineering の再利用判断 | `../handoff/DECISION-LOG.md` |
| 現在の好み仮説 | `PREFERENCES.md` |
| Reference の見方 | `OBSERVATION-GUIDE.md` |
| 外部 Reference の発見先 | `REFERENCE-INDEX.md` |
| 横断 Pattern の検索 | `PATTERN-INDEX.md` |
| 避けたい Pattern の検索 | `ANTI-PATTERN-INDEX.md` |
| サイト固有の design DNA | `sites/INDEX.md` |
| Design Language の育て方 | `DESIGN-LANGUAGE.md` |

## Retrieval route

AI は原則として以下の順で必要なファイルだけ読む。

1. 現在の要求と対象 viewport / surface を確認する。
2. 恒常ルールが必要なら `../DESIGN.md` を読む。
3. Pattern や失敗知見を探す場合は `PATTERN-INDEX.md` / `ANTI-PATTERN-INDEX.md` から ID を選び、リンク先の正本だけ読む。
4. 特定サイトを再現・応用する場合は `sites/INDEX.md` からそのサイトの profile へ進む。
5. 新しい Reference を探す場合だけ `REFERENCE-INDEX.md` を使う。
6. 観察方法が必要な場合だけ `OBSERVATION-GUIDE.md` を使う。

`INDEX.md` や Pattern Index の記述だけを根拠に実装判断を確定しない。最終判断はリンク先の正本、実ファイル、ブラウザ確認、または study evidence で確認する。

## Promotion rule

```text
external reference
→ site-specific observation
→ study DESIGN / RETROSPECTIVE
→ repeated and supported
→ LEARNINGS
→ when it becomes a stable shared design rule
→ DESIGN.md
```

一度見ただけの好みやサイト固有の癖を `DESIGN.md` へ直接昇格させない。
