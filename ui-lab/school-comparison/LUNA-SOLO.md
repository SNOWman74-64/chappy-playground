# Luna xhigh 単騎：条件と実行ログ

同じ[共通設計書](DESIGN-PLAN.md)と5枚の写真を渡し、独立したCodex CLIセッションでLuna xhighを起動した。サブエージェント起動は禁止し、親担当からのレビュー・修正指示は行っていない。実装・ブラウザ検証・修正・自身の検証報告をLunaが担当し、親担当は起動、実行ログ回収、完成後の比較画面登録のみを担当する。比較用プレビューの撮影は完成後に行うが、実装には介入しない。

これは初期条件のない自由制作ではない。共通設計、共通写真、静的構成、書込み範囲という条件を渡した単独実行である。CLIはこの親会話を継承していないが、プロジェクトのAGENTS.mdや利用可能なツールなど環境の指示は適用される。書込み範囲はプロンプト上の制限でありOS隔離ではない。

## 入力と起動

- [実際のプロンプト全文](logs/school-luna-solo-prompt.txt)
- [実際の起動スクリプト](logs/run-luna-solo.ps1)
- 読むファイル：UI LabのDESIGN.md、school-comparison/DESIGN-PLAN.md、ASSETS.md、assets/assets.json
- 共有写真：campus.jpg、classroom.jpg、library.jpg、basketball.jpg、students.jpg
- 作業・書込み先：school-luna-solo/。他案の実装は参照禁止。
- 要求：gpt-5.6-luna / xhigh / service_tier=priority
- 観測モデル：gpt-5.6-luna、観測推論：xhigh
- 実配信tier：未取得。priority要求だけではFast配信を確認できない。
- セッションID：01a07c2a-e805-7aa0-8a37-b58d50ed5092
- プロンプトSHA256：cda95b22073c3e6e55cd281b36e484806f5a8729780f4285f02678278754b1e6

## 計測

| 項目 | 値 |
| --- | ---: |
| 実行時間（自身の検証・修正を含む） | 11分21秒 |
| 入力トークン | 1,878,692 |
| うちキャッシュ入力 | 1,797,120 |
| 出力トークン | 46,063 |
| うち推論出力 | 7,317 |
| 入力＋出力 | 1,924,755 |

キャッシュ入力・推論出力は内数。親担当の使用量・公開処理は含まない。単騎は自らの検証時間を含むため、親検証が別枠の委託版の初回時間と単純に比較できない。サーバー負荷、ツール環境、キャッシュ、実行時刻の違いも統制していない。

## 完成結果と検証の責任

- [サイト](../school-luna-solo/)
- [Luna自身の検証報告](../school-luna-solo/TEST-REPORT.md)
- [Luna自身の振り返り](../school-luna-solo/RETROSPECTIVE.md)
- [最終回答](logs/school-luna-solo-final.txt)
- [プロセス開始・終了](logs/school-luna-solo-process.json)
- [数値の集計](luna-experiment-metrics.json)

検証報告はLuna自身が作成したもので、親担当の独立検証済みという意味ではない。未検証箇所や既知の不具合は同報告の記載を参照。完成版は修正を加えず比較に登録する。生のイベントJSONL/stderrはローカル保管、プロンプト・時間・usage集計・報告をGitへ保存する。
