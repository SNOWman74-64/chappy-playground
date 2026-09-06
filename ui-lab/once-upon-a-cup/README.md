# Once Upon a Cup

ユーザー提供のBlenderモデルを使った、絵本の中の喫茶店のWebサイトです。全景・テラス席・焼き菓子のワゴンの視点と、昼下がり・夕暮れの照明を切り替えられます。

## 公開先

[Once Upon a Cup](https://snowman74-64.github.io/chappy-playground/ui-lab/once-upon-a-cup/)

このリポジトリのGitHub Pagesは `main` ブランチのルートを配信元にしています。上記はサイトへの直接リンクです。Mock Galleryのカタログ登録は今回の公開対象に含めていません。

## 起動

UI Labのルートで実行します。既に4173番ポートのサーバーが動いている場合は、そのまま利用してください。

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

ブラウザで `http://127.0.0.1:4173/once-upon-a-cup/` を開きます。`file://` ではなくHTTP経由で利用してください。ビルドやパッケージのインストールは不要です。

最初にWebP画像を表示し、3Dを開く操作をしたときだけモデルと描画ライブラリを読み込みます。ドラッグで回転、ピンチまたは＋／−で拡大縮小できます。キーボードは矢印・＋／−・Home・Escapeに対応しています。「操作を終える」で通常のページスクロールに戻れます。

## モデルの最適化

| 項目 | 同条件の未圧縮GLB | Web用GLB |
| --- | ---: | ---: |
| ファイルサイズ | 5,858,336 bytes | 383,840 bytes |
| 三角形 | 223,880 | 90,305 |
| メッシュ／プリミティブ | 972 | 14 |
| マテリアル | 14 | 14 |

容量93.45%、三角形59.66%削減。比較対象は同じカフェをエクスポートしたGLBです。圧縮された元の `.blend` の容量との比較ではありません。

文字の輪郭を残して厚みを省き、曲線とベベルを簡素化し、静止形状をマテリアル単位で統合してDraco圧縮しています。元モデルは保存せず、処理前後のSHA-256一致を確認しています。詳しい数値は [optimization-report.json](evidence/optimization-report.json) にあります。

初期画像は96,822 bytesです。モデル383,840 bytesとは別に、3D開始時にローカル同梱のエンジンとデコーダーも読み込みます。モデル容量をサイト全体の転送量として扱わないでください。

## 再生成

UI Labのルートから実行します。検証に使用したBlenderは5.2.1 LTSです。

元の `.blend` はローカルに保持しており、このサイトのコミットには含めません。再生成には `ui-lab/docs/model/once-upon-a-cup-computer-use.blend` に元ファイルが必要です。

```powershell
& 'C:\Program Files\Blender Foundation\Blender 5.2\blender.exe' --background --factory-startup --disable-autoexec --python once-upon-a-cup/tools/export_web_model.py
```

出力はこのstudyの `assets/` と `evidence/` に限定されます。比較用GLBは一時ディレクトリで計測後に削除されます。`-- --skip-poster` で画像レンダリングを省略できます。

## 検証と構成

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/check-ui-study.ps1 -Study once-upon-a-cup
node --check once-upon-a-cup/app.js
node --check once-upon-a-cup/viewer.js
```

`?debug` を付けると描画統計とエラーを表示します。診断パネルは画面に重なるため、通常閲覧と見た目の確認では外してください。描画時間の値はCPU側の呼び出し時間で、GPU性能や実機スマホの速度を示しません。

`python once-upon-a-cup/tools/serve_qa.py` は4174番ポートでローカル専用の検証ページを起動します。`/fail-once/`、`/no-webgl/`、`/reduced-motion/`、`/context-loss/` を利用できます。最初のGLB要求を失敗させるテストをやり直す場合は、この検証サーバーを再起動します。これらの注入は検証用レスポンスだけに適用され、本体のファイルやOS設定を変更しません。

設計は [DESIGN.md](DESIGN.md)、実施済み検証と限界は [TEST-REPORT.md](TEST-REPORT.md)、振り返りは [RETROSPECTIVE.md](RETROSPECTIVE.md) を参照してください。

## ライセンスと配布

Three.js 0.180.0（MIT）とDracoデコーダー（Apache-2.0）のライセンスを `vendor/` に同梱しています。公式配布元・サイズ・SHA-256は [vendor/manifest.json](vendor/manifest.json) に記録しています。取得を再実行する場合のみ `python once-upon-a-cup/tools/vendor_runtime.py` を使用します。

サイト実行に必要なのは `index.html`、`styles.css`、`app.js`、`viewer.js`、`assets/`、`vendor/` です。元の `.blend`、開発用 `tools/`、検証記録 `evidence/` はサイトの実行には不要です。元モデルの利用条件は別途引き継がれます。ローカルの書き出しログはGitの対象外とし、容量やハッシュなどの構造化された検証記録を同梱しています。
