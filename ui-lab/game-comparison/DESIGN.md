# Design

## Reference
共通設計：../experiments/social-game/DESIGN.md。2案のrun.json、検証報告、保存画面、元セッションusageを集約する。
## Intent
Astra単騎とAstra＋Luna highを、画面と計測条件を同時に見ながら比較できる入口にする。
## Visual DNA
明るい紙面と濃紺の文字。2列の同寸法プレビュー、数値表、検証範囲の注記。優劣のバッジは付けない。
## Tokens
背景#f4f6f8、本文#172638、操作#087e8b、最大幅1200px、本文16px、操作44px以上。
## Layout Anatomy
比較条件、2案のプレビューとリンク、初回/最終とPC/スマホの切替、計測表、検証と総評へのリンク。
## Interaction / Motion
表示段階と画面幅の切替は同じ両案へ適用し、選択状態をaria-pressedで示す。狭い画面では1列、表は局所スクロール。
## Constraints
今回の集約で2案の実装や元ログを変更しない。元の自己採点を独立評価として扱わない。追加の比較作業の使用量を試行の使用量に含めない。
## Adaptation from reference
元の途中打切り数値と今回補完した終了時数値を区別する。条件変更と検証不足を画面に明記。
