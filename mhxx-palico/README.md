# MHXX Palico Archive

MHXXのオトモアイルー厳選用の独立ページです。Playgroundトップには統合していません。

## URL

GitHub Pages: `https://snowman74-64.github.io/chappy-playground/mhxx-palico/`

## データ追加

`data/cats.json` の `cats` に猫データを追加し、必要なら `assets/` にスクリーンショットを追加します。

想定フィールド:

```json
{
  "id": "cat-001",
  "name": "ミケ",
  "level": 30,
  "supportType": "回復",
  "photo": "./assets/cat-001.jpg",
  "supportMoves": [{"name":"回復笛","group":"A"}],
  "skills": [{"name":"回避上手の術","group":"B"}],
  "supportPattern": "ABBC",
  "skillPattern": "BBCCCC",
  "verdict": "採用",
  "memo": "回復猫候補"
}
```

A/B/Cが未判定なら `group` を `?` にして後から埋められます。
