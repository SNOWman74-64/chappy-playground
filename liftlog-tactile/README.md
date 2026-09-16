# LIFTLOG Tactile Interaction Lab

FeralUI `Stamp` の「操作そのものを気持ちよくする」思想を、LIFTLOG向けに翻訳した実験メモです。

Reference: https://feralui.dev/stamp

## Core idea

LIFTLOGの画面全体は静かに保ち、**意味のある確定操作だけに物理フィードバックを与える**。

- 通常時: Apple系の整理された、落ち着いたUI
- 操作時: 押す・沈む・固定される・戻る、という短い因果関係
- 節目: 種目完了 / ワークアウト完了 / PRだけ少し豪華にする
- 常用操作: 200ms前後で終わり、トレーニング中のテンポを邪魔しない
- `prefers-reduced-motion` を尊重する

## Interaction hierarchy

### 1. Set complete — micro tactile

目的: 毎セット押しても邪魔にならない「カチッ」。

- ボタン/カードが少し沈む
- プレートが固定されたような短いスナップ
- 完了後は✓を残す
- 目安: 120–220ms

### 2. Exercise complete — lock in

目的: 1種目やり切った感覚を作る。

- 種目カード全体をわずかに圧縮
- 進捗が1段進む
- `LOCKED IN` / `COMPLETE` の小さな確定表示
- 目安: 250–450ms

### 3. Workout complete — ritual

目的: その日の終了だけは小さな儀式にする。

- 通常操作より大きいモーション
- ラックに戻す / スタンプを押す / DONEを刻む、などの物理メタファー
- PRがあれば二次演出を追加
- 目安: 600–1000ms

## Rules

1. **Motion is feedback, not decoration.**
2. **Frequency determines intensity.** 頻繁に使うほど短く弱くする。
3. **State must survive without motion.** アニメーションを切っても完了状態が分かる。
4. **One action, one physical metaphor.** 1操作に複数の比喩を混ぜない。
5. **First / milestone can be richer.** 初回や節目だけ演出を強める。
6. **Mobile first.** 親指で押しやすく、片手操作を阻害しない。

## This playground demo

`index.html` では以下を触って比較できます。

- SET COMPLETE: もっとも軽い押し込み
- EXERCISE COMPLETE: カード全体のロックイン
- FINISH WORKOUT: その日の終了儀式
- RESET: 状態を初期化

これはFeralUIのコードや外観を複製するものではなく、**tactile / physics-driven interaction の設計思想だけをLIFTLOG文脈に再構成したもの**です。
