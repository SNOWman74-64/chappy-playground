# Test Report

## Scope and environment

- 対象：`school-luna-solo/` のみ
- 実装：`index.html`、`styles.css`、`app.js`、`guide.html`
- 実行日：2026-09-07（Asia/Tokyo）
- ローカル配信：`python -m http.server 4174 --directory "C:\Users\user\Projects\新しいフォルダー\ui-lab"`
- 計画指定の4173番ポートは既存プロセスが別のUI Lab入口を配信していたため、検証用に4174番を使用した。4174番では対象ディレクトリを明示指定した。

## Evidence collected

| Check | Result | Evidence |
| --- | --- | --- |
| JavaScript syntax | PASS | `node --check app.js` exit code 0 |
| Study assets exist | PASS | 指定5ファイルをローカルで確認 |
| HTML / guide HTTP response | PASS | `/school-luna-solo/` と `/school-luna-solo/guide.html` が4174番でHTTP 200 |
| Shared photos HTTP response | PASS | `campus.jpg` 587740 bytes、`classroom.jpg` 275478 bytes、`library.jpg` 390901 bytes、`basketball.jpg` 500408 bytes、`students.jpg` 462494 bytesをHTTP 200で取得 |
| Local-only form implementation | PASS (static) | `app.js` に外部`fetch`・`action`・`localStorage`・`sessionStorage`なし。フォームは画面内の確認／完了状態のみ |
| Required content routes | PASS (static) | トップ、学校紹介、学び、学校生活・施設、部活動、入試・説明会、お知らせ、アクセス・FAQ、お問い合わせ、在校生、卒業生、プライバシー、サイトマップ、印刷用案内を実装 |
| Shared static check | BLOCKED OUTSIDE SCOPE | `scripts/check-ui-study.ps1` は exit code 1。`school-luna-high`、`school-luna-medium`、`school-luna-solo` が「exactly one catalog entry」を満たさないと報告した。カタログは共有ファイルであり、今回のWriter scope外のため変更していない。 |

## Browser verification

未実施。`mcp__cua_repl` の `cua.getState()` は `apps:[]`、`browsers:[]` を返し、ローカルURLを指定した `cua.getBrowser(...)` は正確に `No browser is available` で失敗した。ブラウザタブ、スクリーンショット、DOM accessibility treeを取得できなかったため、静的チェックを視覚的証拠の代用にはしていない。

したがって、以下は未検証である。

- 1440px desktop と390px mobileの実ブラウザ表示、横あふれ、画像の実表示、スクリーンショット
- 実行時エラー（ブラウザコンソール）
- 主なキーボードフォーカス、モバイルメニュー開閉とEscape
- 検索のヒット／0件、ニュース・部活動の両フィルター、詳細／戻る
- 予約・問い合わせフォームの未入力／形式エラー、確認、編集、完了
- 印刷ダイアログを含むguide.htmlの実機表示

## Unresolved issues

1. ブラウザ接続が利用できないため、視覚・操作受入れの証拠が不足している。
2. 共有カタログの重複／未登録状態により、共通静的チェックが完走していない。Writer scope外なので実装側では修正していない。

## Conclusion

対象ディレクトリ内の実装、写真の相対参照、ローカル配信、JavaScript構文は確認済み。ブラウザが利用可能になるまで、計画が要求する実ブラウザ検証を完了したとは扱わない。
