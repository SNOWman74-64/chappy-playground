# MHXX Hub / オトモ猫 Inbox

スマホから画像だけでも登録できる個人用Inbox。名前・レベル・解析結果は不要です。

- 公開ページ: https://snowman74-64.github.io/chappy-playground/mhxx-palico/
- フロント: GitHub Pages。ビルド不要のHTML/CSS/JavaScript
- API: Cloudflare Worker `mhxx-palico-api`
- 画像: R2 `mhxx-palico-images`、`IMAGES` binding
- メタデータ: D1 `mhxx-palico`、`DB` binding
- 書き込み認証: Wrangler Secret `UPLOAD_SECRET`
- 旧アーカイブ: `legacy.html`。既存の `data/`・`assets/` は保持

## 利用

「猫を追加」→スクリーンショットを1枚以上選択→必要なら傾向とメモ→送信。最大20枚まで選べ、1枚の画像が1匹の猫として個別に登録されます。サポート傾向とメモは選択した全画像に共通して適用されます。初回は共有シークレットを入力します。値はそのタブのsessionStorageに保持し、タブを閉じた場合などは再入力が必要です。CloudflareやGitHubのAPI Tokenを入力する画面ではありません。

送信は画像ごとに順番に行うため、スマートフォンで複数画像を同時に展開しません。各画像には個別のIdempotency-Keyが付き、通信が確定しない画像は同じキーと準備済み画像で再試行できます。成功済みの画像は再送されません。認証エラー（401/403）または利用上限（429）が返ると残りを止めます。通常の失敗は他の画像を続けて処理し、未完了分だけ再試行します。送信開始後は、再試行時の内容が変わらないよう傾向とメモを固定します。

保存した猫はInboxに即時表示されます。カードから保存画像を開けます。再読み込み・別端末でも同じ一覧を取得します。採用・保留・全猫に切り替えでき、見送りは全猫に含まれます。自動OCRは実行しません。

標準のiPhoneスクリーンショット（PNG/JPEG/WebP、元画像100 MiB以下）を受け付けます。15 MiBを超える元画像も選択でき、ブラウザ内で送信前に調整します。最長辺4096px以内へ縮小し、まず非可逆圧縮のないPNGで再描画します。それでも15 MiBを超える場合だけ、文字の解像度を保つため同じサイズの高品質JPEG（品質0.95）を試し、まだ大きい場合は段階的に縮小します。不要な画像メタデータは除去し、保存画像は必ず15 MiB以下に制限します。HEICは対象外です。元ファイルそのものではなく処理後の画像がR2に保存されます。元画像の読み込み可否は端末の空きメモリにも依存します。

## セキュリティ境界

R2の公開URLは有効化しません。画像はWorkerから配信します。**MVPのGET APIは認証なしです。API URLを知る人は一覧・メモ・画像を閲覧できます。非公開保管庫ではありません。** CORSはGitHub Pagesとlocalhostを許可しますが、CORS自体は認証ではありません。機密画像を扱う場合はGETにも認証を追加してください。

POST/PATCHは長いランダムな共有シークレットのBearer認証を要求します。短いPIN向けの総当たり対策・ユーザー管理はありません。実際の秘密値はGit・ソース・config.js・URLへ記載しません。`.dev.vars`、`.env*`、`.wrangler/`はgitignore対象です。R2/D1にはBindingsでアクセスし、ブラウザへCloudflare/GitHub Tokenを渡しません。

## 構成

- `index.html` / `styles.css` / `app.js`: モバイル画面
- `config.js`: APIの公開ベースURLのみ
- `legacy.html` / `data/` / `assets/`: 旧アーカイブ
- `worker/src/index.ts`: API・検証・認証
- `worker/migrations/0001_palicos.sql`: D1スキーマ
- `worker/wrangler.jsonc`: R2/D1 bindings・CORS
- `worker/test/integration.mjs`: workerd/D1/R2結合テスト

## API

APIベースURLは `config.js` の `API_BASE` を参照してください。

| Method | Path | 内容 |
|---|---|---|
| POST | `/api/palicos` | multipart: image必須、supportType・memo任意。Bearer必須 |
| GET | `/api/palicos` | `{palicos: Palico[], nextCursor: string|null}` |
| GET | `/api/palicos/:id` | Palico JSON |
| GET | `/api/palicos/:id/image` | 保存画像 |
| PATCH | `/api/palicos/:id` | JSONによる部分更新。Bearer必須 |

一覧: `limit=1..100`（既定50）、`cursor`、`verdict=unreviewed|keep|hold|reject`。外部ツールはnextCursorがnullになるまで取得してください。

POST: 成功201、再送200でPalicoを返します。`Idempotency-Key`（16〜128文字の英数字・ハイフン・アンダースコア）を付けると通信失敗後の再送で二重登録を防ぎます。同じキーで異なるデータは409。画面は再送に同じキーを使います。省略時はリクエストごとに生成します。

IDは日本時間の日付とD1で原子的に採番する日別連番: `MHXX-20260920-001`。失敗した送信などで欠番になる場合があります。999以降も増加します。

```typescript
type Entry = { name: string; group?: 'A'|'B'|'C'|'fixed'|'unknown' };
type Palico = {
  id: string; createdAt: string; updatedAt: string; imageKey: string;
  name?: string; level?: number; supportType?: string;
  supportMoves?: Entry[]; skills?: Entry[];
  supportPattern?: string; skillPattern?: string;
  verdict: 'unreviewed'|'keep'|'hold'|'reject'; memo?: string;
};
```

日時はUTC ISO 8601。画像のみの登録はunreviewed。不明な任意フィールドはJSONから省略し、未解析と空配列を区別します。unknownはA/B/C等の分類未確定です。

PATCH対象はname、level、supportType、supportMoves、skills、supportPattern、skillPattern、verdict、memo。任意フィールドはnullで解除できます。levelは1〜99、memoは2000文字まで。id、createdAt、imageKeyは変更不可。解析結果の更新例:

```json
{"verdict":"hold","supportMoves":[{"name":"解析した行動名","group":"unknown"}],"supportPattern":"ABBC"}
```

HTTPエラーは `{ "error": "説明" }`。400入力不正、401認証失敗、403Origin不許可、404未発見、409キー競合、413サイズ超過、415非対応形式、500保存先エラー、503シークレット未設定。全レスポンスはno-storeです。

## ローカル開発・検証

```sh
cd mhxx-palico/worker
npm ci
npm run check
npm test
npm run migrate:local
```

`.dev.vars.example`を`.dev.vars`へコピーし、ローカル用UPLOAD_SECRETを設定。`npm run dev`でAPIを起動します。フロントのconfig.jsを一時的に `http://127.0.0.1:8787` にし、リポジトリをlocalhost:8080で配信してください。公開前に本番URLへ戻します。

結合テストは一時的なローカルD1/R2で実行し、本番を変更しません。画像のみの保存・詳細・画像取得、同時再送、認証、CORS、不正画像・サイズ、解析結果更新、一覧ページングを確認します。

## Cloudflare初期設定・公開

未利用アカウントはDashboardでR2を初回有効化。その後はCLIで管理します。

```sh
cd mhxx-palico/worker
npx wrangler login
npx wrangler r2 bucket create mhxx-palico-images
npx wrangler d1 create mhxx-palico
```

別アカウントへ展開する場合は、返されたD1 database_idをwrangler.jsoncへ設定。既存リソースは再作成せず利用してください。

```sh
npm run migrate:remote
npx wrangler secret put UPLOAD_SECRET
npm run deploy
```

secret putの入力プロンプトへ長いランダム文字列を入力。出力されたWorker URLをconfig.jsのAPI_BASEへ設定します。フロントはmainブランチのルートを公開元とするGitHub Pagesで配信。Playgroundトップの変更は不要です。

更新時: npm ci → npm run check → npm test → 必要なmigration適用 → npm run deploy。秘密値を変更するときは再度 `wrangler secret put UPLOAD_SECRET` を実行し、端末にも新しい値を入力します。

## 運用範囲

### 無料枠を守るアプリ側上限

このアプリは、累計アップロード予約量512 MiB、月500回の画像書き込み、月20,000回の画像取得でR2操作を停止し、HTTP 429を返します。月はUTCで区切ります。再送成功は追加消費しませんが、同時再送・失敗分の予約は安全側に残すため、実データ量より早く停止する場合があります。R2公開URLを有効にするとこの制限を迂回するため、有効化しないでください。

StandardクラスのR2無料枠（10 GB-month、月100万Class A・1,000万Class B操作）より十分低い上限です。Workers/D1の有料プランへ変更は行いません。**無料枠はアカウント全体で共有され、他アプリ・手動操作・既存契約による請求まではこの上限で防げません。** 料金・利用状況はCloudflare Dashboardで確認してください。上限を安易に引き上げたり、usage_guardsをリセットしたりしないでください。

参照: [R2料金](https://developers.cloudflare.com/r2/pricing/)、[D1料金](https://developers.cloudflare.com/d1/platform/pricing/)、[Workers料金](https://developers.cloudflare.com/workers/platform/pricing/)。

R2保存後にD1書き込みが失敗すると当該画像を削除します。ただし分散トランザクションはないため、実行強制終了や削除失敗では孤立画像が残る可能性があります。R2キーとD1のimage_keyを照合して保守できます。

画像削除UI・自動OCR・採否編集UI・複数人権限・ChatGPTへの自動接続は対象外です。JSONと画像URLをChatGPT等へ渡して確認し、認証付きPATCHで結果を反映できます。その他のMHXXツールは予告スペースのみです。

## 公式資料

- [Bindings](https://developers.cloudflare.com/workers/runtime-apis/bindings/)
- [R2とWorkers](https://developers.cloudflare.com/r2/api/workers/workers-api-usage/)
- [Wrangler設定](https://developers.cloudflare.com/workers/wrangler/configuration/)
- [R2開始手順](https://developers.cloudflare.com/r2/get-started/)
- [Cloudflareローカル開発](https://developers.cloudflare.com/workers/local-development/)
