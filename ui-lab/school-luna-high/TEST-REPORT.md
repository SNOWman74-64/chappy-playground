# Test Report

## Parent browser verification after repairs

2026-09-07、親担当が1440px/390pxで主要15ルートを実ブラウザ検証し、横あふれ・画像欠落なし、pageerrorなし。問い合わせと説明会予約の必須/メール形式エラー、確認の入力値表示、編集時の保持、デモ完了を確認。検索3件/0件と結果選択後の閉鎖、モバイルメニューの開閉/Escape、文化部4件/紹介詳細の開閉、FAQのキーボード開閉、記事詳細と戻るを確認。ニュースフィルターは追加修正後に入試情報1件表示・7件非表示を再確認した。初回8件表示の結果は修正前の証拠として保持。生結果は../school-comparison/logs/school-luna-high-browser.json、画面は同logsのdesktop/mobile.png。

共通静的チェックは比較登録後に全10study PASS。初期のカタログ未登録エラーは統合で解消。

## Scope

静的実装のファイル整合、ルート分岐、データ件数、フォーム検証のコードを確認した。ブラウザは親担当が所有するため、この担当では起動・目視QAを実施していない。

## Checks performed

- `index.html`、`styles.css`、`fixes.css`、`app.js`、`DESIGN.md`、`RETROSPECTIVE.md`、`TEST-REPORT.md`、`metrics.json` の存在を確認。
- `node --check app.js` は成功。
- 共有写真5点（campus / library / classroom / basketball / students）の存在を確認。
- データ件数を確認：お知らせ8件、部活動は運動部4件・文化部4件、FAQ7件。
- ルート実装：`#home`、`#about`、`#learning`、`#life`、`#clubs`、`#admissions`、`#admissions/reserve`、`#news`、`#news/:id`、`#access`、`#contact`、`#students`、`#alumni`、`#privacy`、`#sitemap`、`#brochure`。
- 検索：タイトル・本文の一致結果、0件状態、空入力メッセージを実装。
- 絞り込み：ニュース分類と部活動の運動部/文化部/すべてを実装。
- フォーム：必須項目、メール形式、同意チェック、入力→確認→戻る→完了を実装。
- 写真：共有アセット5種を相対参照。フッターから出典文書へリンク。

## Browser verification

初回ブラウザQAで判明した以下を修正済み。再確認は親担当に委譲している。

- about / learning / students：画像とグリッド子要素の幅制約を追加。内容を隠す `overflow:hidden` は追加していない。
- 検索：結果選択時のモーダル閉鎖、同一ルート選択、Escape/閉じる時のフォーカス復帰、Tab循環を追加。
- スキップリンク：ルーターを経由せず `main` にフォーカス。
- 部活動：8件すべてに紹介詳細の開閉と見学相談リンクを追加。
- 説明会：2026年10月18日を日曜表記に統一。
- お知らせ分類フィルター：`.news-row` の authored `display:grid` が `hidden` 属性を上書きしないよう、`.news-row[hidden]` を `display:none!important` に限定追加。

親担当の再QAでは、1440px / 390pxの横あふれ・画像欠落・実行時エラー、検索結果/0件、絞り込み、詳細、フォーム3段階、モバイルナビ、主要キーボードフォーカス、印刷用案内を確認する。

## Result

この狭い修正後、`node --check app.js` とCSS文字列の静的確認に成功。親担当は修正前に全15ルートを1440px / 390pxで確認済みで、今回の変更はニュース行の表示制御だけに限定した。共有 `check-ui-study.ps1` は、`school-luna-high`、`school-luna-medium`、`school-luna-solo` のカタログ件数が1件でない共有側状態で失敗した。今回の書込み範囲外のため修正していない。
