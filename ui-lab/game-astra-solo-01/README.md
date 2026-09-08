# 星環クロニクル攻略室 — Astra単騎

起動：UI Labの親を配信する既存サーバーを利用する。

URL： http://localhost:4173/ui-lab/game-astra-solo-01/

共通入力は ../experiments/social-game/ 以下を読み取り専用で参照する。ビルド・依存追加は不要。

- DESIGN.md：共通設計への参照とこの実装の判断
- TEST-REPORT.md：自己検証と未検証の範囲
- RETROSPECTIVE.md：発見した問題と修正
- run.json：設定、時間境界、取得不能なusageの説明
- evidence/：実ブラウザの記録とスクリーンショット
- checks/：再現用のPlaywright関数（browser_run_code_unsafeのfilenameへ渡す）
- snapshots/：初回と最終を別名で保存する読み取り専用ZIPとSHA256

テストはこのデモのlocalStorageを操作するため、検証専用ブラウザで実行する。共通の固定入力には書き込まない。
