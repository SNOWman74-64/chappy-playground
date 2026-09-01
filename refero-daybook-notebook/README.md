# daybook — cardless notebook study

`refero-daybook/` の次の実験。

同じ Refero / Superr 系の空気感を保ちながら、**UIカードを禁止したらどこまで「本当にノートへ書いている」感へ寄せられるか**を試した。

## Constraint

- UI Skill / デザイン Agent なし
- カードコンポーネント禁止
- 情報グループを rounded rectangle で囲わない
- パネル / dashboard / tile 的な整理をしない
- 外部画像素材なし

## 代わりに使ったもの

- 青い横罫線
- 赤い縦罫線
- 見開きの中央綴じ影
- page number
- 欄外の handwritten annotation
- underline / strike-through / marker
- 紙テープ
- page edge tab
- index の罫線
- 紙面上に直接置く notebook / pencil / sticker
- coffee ring のような accidental detail

## #12 との違い

`refero-daybook/` は Refero の design system を素直に Web UI へ翻訳したため、部分的に「整ったカード」の文法が残っている。

この版では **「Webの情報をカードへ入れる」のをやめて、「ノートのページ上に情報が書かれている」状態そのものをレイアウトとして使う**。

特に以下を比較するための study:

1. container を減らしても情報階層は保てるか
2. intentional imperfection が AI UI 特有の均質さをどこまで消せるか
3. mobile で skeuomorphic な紙面が邪魔にならないか
4. tactile な世界観と操作可能性を両立できるか

## Interaction

チェックリストだけ小さな JavaScript を使用。チェックすると orange の手書き tick と strike-through が入る。

それ以外は HTML / CSS。