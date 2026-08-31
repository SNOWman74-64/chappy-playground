# Webデザイン観察メモ

WebサイトやWebアプリを見ながら、**自分が何を好きだと感じるのか、何を自分の制作へ取り入れたいのか**を整理するためのメモ。

ここでは「一般的に良いデザイン」を決めるのではなく、実例を見て、自分の好みと判断軸を育てることを目的にする。

外部のDesign Skillやギャラリーは参考資料として使うが、最終的な基準は実際に見て・触って・再現して得た感覚から作る。

---

## 今の目的

まずはBlender / Three.jsを使った特殊な3D表現とは分けて、通常のWeb技術だけでも成立する、

- 見た目が良い
- 情報が分かりやすい
- UXが十分に良い
- 自分らしいレイアウトがある
- WebサイトにもWebアプリにも応用できる

という**自分の標準的なWebデザイン思想**を探す。

3D・2.5D・Paper Diorama系は別レーンで研究し、後から特殊表現として重ねる。

---

# サイトを見るときに観察したいこと

全部を毎回分析する必要はない。
まずは「ここ好き」「なんか気になる」から入り、後から理由を探す。

## 1. 第一印象 / 全体の空気

最初の数秒で感じたことを残す。

例:

- 落ち着いている
- 情報量が多いのに見やすい
- 高級感がある
- 遊び心がある
- 使いやすそう
- 余白が気持ちいい
- 無機質だけど好き
- 理由は分からないが好き

この段階では専門用語に変換しなくてよい。

---

## 2. Layout / 構図

見るポイント:

- 中央揃え / 左揃え / 非対称
- 画面幅をどれくらい使っているか
- Contentの最大幅
- Heroの構図
- Gridの使い方
- セクションごとの構図が変化しているか
- 画面内の重心
- 写真と文字の比率
- 情報が縦に流れるか、横にも展開するか

考えたいこと:

> なぜここに目が行くのか？
> 同じ情報を自分ならどこへ置くか？

---

## 3. Information Hierarchy / 視線誘導

ページを開いたときに、

1. 最初に見るもの
2. 次に見るもの
3. 必要なら見るもの

が分かれているかを見る。

観察例:

- 一番強い見出し / 数字 / 画像は何か
- 補助情報はどう弱められているか
- 全部が同じ強さになっていないか
- 視線が自然に次の内容へ移動するか
- CTAが目立ちすぎていないか / 埋もれていないか

Webアプリでは特に、

- 今する操作
- 状態確認
- 補助操作

の優先順位を見る。

---

## 4. Typography

見るポイント:

- Font family
- 見出しと本文のサイズ差
- Weight
- Line height
- Letter spacing
- Serif / Sans / Monoの使い分け
- 数字の見せ方
- 英字と日本語のバランス
- 1行の長さ

特に、

> 文字サイズそのものより「差の付け方」が好きなのか？

を見る。

---

## 5. Spacing / 密度

見るポイント:

- Section間の余白
- Headingと本文の距離
- Component内部のpadding
- 情報密度
- 空白を装飾として使っているか
- 縦に長く感じるか
- 詰まっているのに読みやすいか

「余白が多い = 好き」と決めつけず、

> どの場所に余白があり、どこは詰めているのか

を見る。

---

## 6. Surface / Card / Border

見るポイント:

- Cardをどこで使っているか
- CardなしでどうGroupingしているか
- Border / Divider
- Shadow
- Background difference
- Corner radius
- 入れ子のSurface

考えたいこと:

> このCardは本当に境界として必要なのか？
> Cardを外しても成立するのか？

自分が模写後にCardを消すことが多いなら、それ自体が好みの可能性がある。

---

## 7. Color

見るポイント:

- Base color
- Accent color
- Neutral color
- 色数
- Semantic color
- Saturation
- Light / Dark
- 背景色の微妙な色味

「この緑が好き」だけでなく、

> 色をどれくらい使っているから気持ちいいのか

を見る。

---

## 8. Image / Illustration / Icon

見るポイント:

- 写真を主役にしているか
- 写真のCrop
- Illustrationのタッチ
- Iconの太さ
- Iconをどれくらい使うか
- DecorationとInformationの区別

アイコンがなくても成立する部分や、逆に文字よりIconの方が理解しやすい部分を見る。

---

## 9. Motion / Animation

「動いているから好き」で終わらせず、何を伝えている動きかを見る。

分類例:

- Feedback
- State transition
- Hierarchy
- Storytelling
- Navigation
- Decoration

見るポイント:

- Duration
- Easing
- Hover
- Press
- Scroll animation
- Page transition
- Disclosure
- Loading

考えたいこと:

> このAnimationを消すと体験は悪くなるか？

消しても何も変わらないなら、単なる装飾かもしれない。

---

## 10. Navigation / Flow

見るポイント:

- Header
- Sidebar
- Bottom navigation
- Hamburger
- Breadcrumb
- Tabs
- Scroll navigation
- Page transition

重要なのはNavの見た目より、

> 次にどこへ行けるか迷わないか

を見ること。

---

## 11. Interaction / UX

Webアプリでは特に重要。

見るポイント:

- Hover / Press feedback
- Focus
- Disabled
- Loading
- Empty
- Error
- Success
- Editing
- Selection
- Search
- Filter
- Modal / Sheet / Inline editing

完成画面だけでなく、**状態が変わった途中のUI**を見る。

---

## 12. Responsive / Mobile

Desktopだけ綺麗でも判断しない。

見るポイント:

- Mobileで構造が変わるか
- PC版をただ縦積みにしていないか
- Navigationの変化
- Typography scale
- Touch target
- Horizontal scroll
- Safe Area
- Fixed UI
- Keyboard表示時

「スマホでも表示できる」ではなく、

> スマホで使うために再設計されているか

を見る。

---

# 好きを拾うときの簡易メモ

最初はこれだけでよい。

```text
URL:

好きなところ:
- 
- 

特に気になった部分:
- Hero / Layout / Typography / Motion / UX / etc.

理由:
- 分からなくてもOK
```

---

# 深掘りする作品

特に好きなものだけ、次の順番で試す。

## Reference

元サイトのどこに惹かれたか。

## Reproduction

HTML / CSS / React等で可能な範囲を再現する。

ここではまず元の意図を理解する。

## My Version

自分なら変更したい部分を変える。

例:

- Cardを減らす
- 余白を狭くする / 広くする
- Fontを変える
- 左揃えへ変更
- Animationを弱める
- CTAを弱める
- Navigationを変える

この変更が複数作品で繰り返されるなら、**自分のDesign Principle候補**。

---

# 今の好みについての仮説

まだ固定しない。
実例を集めながら検証する。

現時点で気になっている方向:

- 全要素を均等なCardへ入れるより、文字・余白・Dividerで階層を作る表現
- 画面のPrimaryがはっきりしている構成
- 情報量があっても視線が迷わないUI
- 意味のあるMotion / Micro Interaction
- Webサイトではレイアウト・Typography・余白にある程度大胆さがあるもの
- Webアプリでは見た目だけでなく操作効率とState clarityを重視
- PC版の縮小ではなく、Mobileで自然に再構成されるResponsive Design
- AI生成サイトにありがちな、理由のないCard / Pill / Gradient / Decorationは避けたい

これらは結論ではなく、今後Referenceと模写を通して更新する。

---

# 特殊表現の別レーン

通常のWeb Layout研究とは別に、以下も並行して研究する。

- Blender
- Three.js / React Three Fiber
- 2.5D
- Paper Diorama
- 飛び出す絵本的UI
- 半探索型Webサイト

これらは将来的な強い個性になり得るが、まずは3Dなしでも成立するWeb Design / UXの基準を作る。

---

# 最終的に作りたいもの

ReferenceとStudyが十分に溜まったら、共通点を抽出して、

```text
MY DESIGN PRINCIPLES
```

を作る。

そこから、将来的に独自の `UI Architect` やProjectごとの `UI-DESIGN.md` の初期バイアスとして利用する。

目標は「Taste Skillのルールを覚えること」ではなく、

**自分がなぜそのUIを好きなのかを説明でき、必要なら自分で再構成できること。**
