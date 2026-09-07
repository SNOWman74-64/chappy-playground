# Test Report

## Scope

variant B `school-luna` の静的契約、ルート描画、検索・絞り込み・フォームのコードパスを確認した。共有写真・ブラウザ表示は実装時点の環境に依存する。

## Checks

- 静的チェック: 実行済み。`school-luna` を共有 `catalog.json` に登録することを要求する1件のみ失敗（`Study 'school-luna' must have exactly one catalog entry`）。ユーザー指定により catalog は変更していないため、これは意図した未統合状態である。
- インライン JavaScript 構文解析: `node` の `vm.Script` で `INLINE_JS_PARSE_PASS`。
- metrics JSON: `METRICS_JSON_PASS`。
- HTML/CSS/JS: 外部依存なし、viewport meta・title・必要な文書見出しを配置
- ルート: `#home`, `#about`, `#learning`, `#life`, `#clubs`, `#admissions`, `#news`, `#access`, `#contact`, `#search`, `#guide`, `#students`, `#alumni`, `#privacy`, `#sitemap` と、`#news/{id}`, `#club/{id}` を実装
- データ量: お知らせ8件、部活動10件（運動部4／文化部6）、施設6件、FAQ7件
- フォーム: 必須項目、メール形式、同意、確認、修正、完了のローカルフローを実装
- フォールバック: 写真未配置時に色面へ退避する処理を実装

## Browser verification

初回実装後の親担当ブラウザQAで、フッターのコントラスト、日付曜日、モバイル検索、favicon、CTA写真のフィット、部活動写真、フォームフォーカス、空白入力について指摘を受領し、本修正で対応した。本修正パスではブラウザを再起動・再確認していないため、親担当が修正後の1440px / 390pxを確認する。モバイルヒーローは未確認として扱う。

1. ヒーロー・施設画像の表示と欠落時のフォールバック
2. モバイルメニューの開閉、遷移後の閉鎖、Escape、focus-visible
3. `#search?q=探究` の結果と存在しない語の0件表示
4. お知らせ・部活動フィルターと詳細への遷移
5. 説明会予約の未入力、メール不正、確認、修正、完了
6. 問い合わせの未入力、メール不正、確認、修正、完了
7. 1440px / 390pxで横あふれ、画像欠落、実行時エラーがないこと

## Known environment state

実装時点では `../school-comparison/assets/` と `../school-comparison/ASSETS.md` が未配置だった。コードは計画された相対パスとクレジットリンクを使用しているため、親側の素材配置後に再確認が必要である。

## Parent browser verification — completed 2026-09-07

親担当が素材配置・修正後の実ブラウザを検証した。初回実装時点の未検証記録は上記に残し、現在の確認状況をここで更新する。

- 1440×1000 / 390×844 のトップを目視確認。360pxでも横あふれなし。
- モバイル主要9ルートとデスクトップ13ルートで横あふれ・画像欠落なし。
- 文化部6件への絞り込み、吹奏楽部詳細、ニュース分類、図書館検索3件、0件状態を確認。
- 予約と問い合わせの入力→確認→修正→完了を操作し、値の保持を確認。
- 修正後は名前の空白・メール形式の検証、正しい曜日SUN、確認/完了見出しへのフォーカスを確認。
- モバイル検索、メニュー開閉・Escape・遷移後閉鎖、Tabのfocus outline、FAQ開閉を確認。
- フッター校名は白になり、CTA画像の空き帯は解消。部活ページ・詳細へイメージ写真を追加。
- 最終巡回のpageerror 0件、HTTP 4xx/5xx 0件。faviconの初回404は修正済み。
- Playwrightのクリック待機がフォームの移動中にタイムアウトしたケースは、実際のキーボード操作（focus + Enter）で確認・修正・完了を再検証した。
- カタログ統合後の共通静的チェックはPASS。

証拠: ../school-comparison/logs/luna-browser-flows.json、luna-browser-final.json、luna-keyboard-final.json、mobile-browser-checks.json、luna-desktop.png、luna-mobile.png。
