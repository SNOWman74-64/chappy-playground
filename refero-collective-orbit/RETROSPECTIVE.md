# Orbit — Retrospective

## Summary

Refero の dark constellation design を出発点に、**「粒子の集合体そのものをブランドの主役として動かせるか」**をかなり深く試した study。

静的なデザイン再構成そのものは高い精度で成立した一方、粒子集合体を具体的な生物として認識させ、さらにモバイル上で骨格運動まで成立させるところから難易度が急激に上がった。

最終的には、複雑な Canvas physics / rig を主役にするのではなく、**SVG + CSS の deterministic な Memory Vortex**へ戻すことで、Refero 由来の constellation language と安定した motion を両立する方針に落ち着いた。

---

## Reference reconstruction — what worked

- Reference の `DESIGN.md` が非常に整理されており、専用 UI Agent を使わなくても design grammar をかなり正確に抽出できた。
- 再現に特に効いたもの：
  - pure black canvas
  - huge regular-weight typography
  - very thin secondary text
  - violet CTA
  - sparse composition
  - colorful triangular particles
  - cards / panels をほぼ使わない
- ブランドやコピーを Orbit という別テーマへ変更しても、色の役割・タイポ比率・particle motif を維持すると同系列の空気が残った。

### Main lesson

**Reference の layout をコピーするより、type / space / color role / visual signature を抽出して別コンテンツへ再構成する方が再利用性が高い。**

---

## Motion experiment timeline

### 1. Static DOM constellation

最初は数百個の triangle を procedural placement し、抽象的な constellation として配置。

#### Good
- 外部画像なしでも reference の visual signature を再現できた。
- 静止状態では PC / mobile とも比較的安定。

#### Limitation
- 「集合体」ではあるが、生きた存在には見えない。

---

### 2. Canvas particle collective

triangle を Canvas particle に変更し、各 particle に速度・home position・微小回転を与えた。

追加したもの：
- 自律 drift
- spring-back
- pointer / touch repulsion
- whole-field swirl

#### Good
- 抽象集合体としての生命感はかなり上がった。
- Orbit の「knowledge fragments が緩く集まっている」というテーマと噛み合った。

#### Problem
- iOS 内ブラウザでは animation loop の開始状態や再描画タイミングが PC より不安定。
- 実機確認なしでは「コード上は正しいのに静止している」状態を見逃しやすい。

---

### 3. Eagle silhouette

粒子集合体を大きな鷹の形へ変換し、HGSS title screen のような静かな飛行モーションを目標にした。

#### First approach — single implicit silhouette

1枚の数式領域へ particles を配置し、翼に相当する上側 particles だけ変形。

**Result:**
- Desktop では「鳥っぽい集合体」まで近づく。
- Mobile では silhouette が潰れ、ほぼ抽象的な楕円 particle cloud に戻った。

### Lesson

**具体物の認識は粒子数より silhouette topology の方が重要。**

---

### 4. Eagle articulated rig

次に body / head / beak / inner wing / outer wing / tail を分離し、肩 → 肘 → 翼端という簡易 2D rig を作成。

狙い：

```text
body (root)
├ neck → head → beak
├ left shoulder → elbow → wing tip
├ right shoulder → elbow → wing tip
└ hip → tail
```

各 particle は body 全体ではなく、所属 part の local coordinate を持ち、その bone transform を通して目標座標へ spring-follow する方式。

#### What improved
- 「どの部分がどこへ繋がるか」という構造は明確になった。
- wing root と body を独立して制御可能になった。

#### What still failed
- 小さい mobile viewport では、少しの joint / scale mismatch が非常に大きく見える。
- particle art では joint の継ぎ目が普通の solid mesh より見えやすい。
- 「鷹として認識できる造形」と「自然な羽ばたき」を同時に作るには、単純な prompt-driven HTML prototype の範囲を越え始めた。

### Important boundary discovered

**デザインモックとして particle motif を動かすことと、粒子で articulated creature animation を作ることは別の難易度帯。**

後者は実質的に簡易 motion graphics / character rigging の問題になる。

---

### 5. Memory Organism / Jellyfish experiment

認識要求を下げるため、bell + tentacles のクラゲ型へ変更。

理論上は鷹より単純：
- 1つの large bell
- breathing scale
- 5 tentacles
- wave propagation

しかし Canvas 実装では実機で visual layer が完全に消えるケースが発生。

### Lesson

形状を簡単にしても、**critical visual が JS / Canvas initialization に全面依存している限り、mobile prototype の安定性リスクは残る。**

---

## Final direction — Memory Vortex

最終版では Canvas を visual-critical path から外し、**SVG + CSS only** の constellation vortex へ変更。

構成：
- outer particle ring
- middle particle ring
- inner particle ring
- central particle cluster
- soft halo
- opposite-direction rotation
- central breathing
- whole-object vertical drift

### Why this is the better prototype

- JavaScript が失敗しても visual が消えない。
- mobile / desktop で topology が変わらない。
- Refero の triangle constellation identity を保てる。
- 「knowledge fragments が互いを回り、中心に意味が生まれる」という Orbit の concept と一致する。
- animation complexity が design mock の目的を超えない。

---

## What we would do differently next time

### 1. Mobile first-frame test first

Motion を追加したら PC より先に target mobile viewport で以下を確認する：

1. static first frame が見える
2. shape が1秒以内に認識できる
3. animation が止まっても design として成立する
4. animation が動いた時だけ追加価値が生まれる

### 2. Critical visuals should have a no-JS baseline

Hero の主役を Canvas-only にしない。

Preferred order for design prototypes:

```text
SVG / CSS
→ CSS + tiny JS
→ Canvas deterministic animation
→ Canvas physics
→ articulated particle rig
```

右へ行くほど prototype ではなく graphics engineering に近づく。

### 3. Recognizable creatures need geometry, not just particles

動物など具体物を作る場合は、先に silhouette / vector skeleton を solid geometry で成立させ、その上へ particles を overlay する方がよい。

Particles だけで anatomy と motion の両方を説明しようとすると難易度が急増する。

### 4. Do not let the experiment overpower the design system

今回の reference の強みは、そもそも：
- black void
- enormous typography
- restrained violet
- sparse layout
- triangle constellation

であり、鷹そのものではない。

Motion のために reference の静かな editorial quality を失わないこと。

---

## Reusable conclusions

- **Strong DESIGN.md reduces the need for specialized UI agents.** 雑めな指示でも visual grammar が明確なら高精度の variation を作れる。
- **Static design reproduction and advanced motion generation have very different difficulty curves.**
- **Particle count does not solve shape recognition.** Silhouette / topology / articulation matter more.
- **For mobile prototypes, deterministic animation is often more valuable than impressive physics.**
- **The visual should survive animation failure.** Motion is enhancement, not existence.
- **Prototype ambition should match the question being tested.** 今回確認したかったのは「この design language を Web へ落とせるか」であり、本格的な particle creature engine の実装ではない。

---

## Final state

Current visual: **Memory Vortex — deterministic SVG/CSS particle constellation**.

This version is intentionally less technically ambitious than the eagle rig, but more faithful to the original design language, more stable on mobile, and more reusable as a UI / brand-motion pattern.
