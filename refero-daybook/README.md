# daybook — Refero style study

Refero Styles の **Superr** デザインシステムを参考に、追加の UI Skill / MCP / デザイン Agent を使わず、ChatGPT が公開スタイル情報を読み取って再構成した静的ランディングページ。

Reference:
- https://styles.refero.design/style/cfd0fec1-f25a-4b9b-9bd0-d5b66960f2f2

## この実験で借りたもの

- cream paper をベースにした暖色ニュートラル
- 大きな lowercase display typography
- orange を機能色ではなく手書き注釈・強調に限定する考え方
- 塗りつぶさない細枠 pill CTA
- 12–20px 程度の角丸と弱い影
- 少し傾いた物体を主役にするレイアウト
- 紙・文具・ステッカーの tactile な方向性
- orange の大きな footer band

## コピーしなかったもの

- Superr のブランド名・ロゴ
- 既存の商品写真・イラスト素材
- 原サイトの文章
- 固有の UI アセット

デモ内の **daybook** ブランド、ノート、ラベル、鉛筆、ステッカー、矢印は HTML / CSS / inline SVG で独自作成。

## 実装

- 1 file static HTML + CSS
- Google Fonts: Fraunces / Inter / Caveat
- JavaScript なし
- responsive: desktop / tablet / mobile
- `prefers-reduced-motion` 対応

## 観察ポイント

このページは「完全コピー」ではなく、デザインシステムから **どのルールを抽出すれば同じ空気に近づくか**を見るための study。
特に `color role`, `type scale`, `object-first composition`, `border vs fill`, `intentional imperfection` の5点を強く反映している。
