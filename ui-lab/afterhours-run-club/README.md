# AFTERHOURS RUN CLUB

黒とライムグリーンの、スマートフォン向けランニングクラブ・コンセプトサイト。

UI Lab のルートで `python -m http.server 4173` を実行し、`http://localhost:4173/afterhours-run-club/` を開く。ビルドや追加パッケージは不要。

## Features

- 3 コースの切替とコース概念図・距離・集合情報の同期。
- コース・ペース・任意の名前から、その場でデモランパスを作成。
- モバイルメニュー、ネイティブ dialog の参加シート、FAQ、条件付き下部 CTA。
- reduced-motion、キーボード操作、明示的なフォームラベル、必須項目検証。

実在するクラブ・イベントではない。申込み、予約、課金、個人情報の送信・保存は行わない。地図は架空の概念図であり、ナビゲーションには使えない。

## Assets and references

- Hero: Fitsum Admasu / Unsplash, https://unsplash.com/photos/oGv9xIl7DkY . Image CDN: https://images.unsplash.com/photo-1552674605-db6ffd4facb5 . Local resized JPEG, displayed in grayscale with a contrast overlay.
- Community: Mārtiņš Zemlickis / Unsplash, https://unsplash.com/photos/NPFu4GfFZ7E . Image CDN: https://images.unsplash.com/photo-1452626038306-9aae5e071dd3 . Local resized JPEG, displayed in grayscale.
- Unsplash license: https://unsplash.com/license (checked 2026-09-07).
- Display font: Anton, https://fonts.google.com/specimen/Anton . Loaded through Google Fonts; Impact and system sans-serif are fallbacks. No font files bundled.
- Original SVG brand mark and route illustration. Photography is mood imagery and does not document a real AFTERHOURS club or location.
- Running-culture content reference: https://satisfyrunning.com/ . No logos, commercial copy, or site code reused.

Photographs are local; the optional font stylesheet/font are the only external runtime requests. With no network, the fallback font and all local interactions remain available.

## Checks

`powershell -NoProfile -ExecutionPolicy Bypass -File scripts/check-ui-study.ps1 -Study afterhours-run-club`

`node --check afterhours-run-club/app.js`

スマホ幅 320 / 390 px と PC 幅 1440 px のブラウザー表示、コース切替、参加デモ、メニュー、FAQ、ダイアログのキーボード操作を確認済み。表示・操作の検証結果と未確認項目は `RETROSPECTIVE.md` に記録している。コンソールログ取得はツールの安全性チェックで拒否されたため未確認。reduced-motion は CSS の確認のみで、実行時エミュレーションは未実施。
