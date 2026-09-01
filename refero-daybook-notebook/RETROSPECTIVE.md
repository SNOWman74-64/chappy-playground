# daybook — Cardless Notebook Retrospective

## What worked

- card を禁止したことで AI-generated UI に出やすい均質な container 感がかなり減った
- ruled line / margin / annotation だけでも情報階層を保てた
- desktop の見開きと mobile の縦長ノートを同じ visual grammar で表現できた
- scroll-writing は notebook motif と相性が良い

## What felt wrong

### Trigger timing was too late

初期実装では要素ごとに `0.9 / 0.7 / 0.5...` のように別々の viewport trigger を設定した。
その結果、画面に十分見えているのにまだ書かれない箇所ができた。

### Hero kept a special trigger

一度、本文だけ共通 trigger にして hero を例外扱いしたため、`keep the day.` が画面上部で半端に書かれる状態が残った。

### Glyph descenders were clipped

左→右 reveal の `clip-path` を文字要素そのものに適用した結果、`g / y / p / q / j` の descender が切れた。

## Fixes

### Shared writing line

全体を viewport 上端から約 62% の共通 writing line へ統一。
要素の縦位置だけで自然に順番が生まれるようにした。

### Faster drawing distance

writing line を越えたあと、短めの scroll distance で描き切るように変更。
「見えているのに待つ」感を減らした。

### Vertical clip bleed

横方向の reveal は維持しつつ、上下の clip bounds を font-relative に広げた。

```css
clip-path: inset(-.30em var(--clip) -.48em 0);
```

## Current motion rule

- scroll = pen progress
- writing starts around viewport 62%
- left-to-right reveal
- short draw distance
- arrows are stroke-drawn
- marker follows text
- reduced-motion disables the effect

## Open questions

- 62% が他のページ密度でも自然か
- 長文は left-to-right mask より line-by-line の方が読みやすいか
- live thumbnail 内では motion を止めるべきか
- real handwriting stroke simulation まで行く価値があるか

## Candidates for shared learnings

- shared sight line for scroll writing
- vertical glyph bleed for horizontal reveal
- cardless hierarchy through page grammar
