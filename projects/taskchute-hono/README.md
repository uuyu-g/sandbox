# TaskChute (Hono / Cloudflare Workers 版)

`projects/taskchute/`（Rails 8 + React + Inertia.js）を、Hono + Cloudflare Workers + D1 + React + Inertia.js で書き直したクローン。
ローカル単一ユーザー前提、認証なし。

## 機能

Rails 版と同一。

- 1日分のタスク一覧（朝 / 昼 / 夜のセクション分け）
- 見積時間と実績時間の記録（開始 / 終了の打刻、差分表示）
- タスクの完了 / 未完了切り替え、編集、削除
- ルーチン（曜日指定の繰り返しタスク）の登録と「今日へ展開」
- 日付ナビゲーション（前日 / 翌日 / 任意の日付）
- 1日のサマリ（タスク件数、見積合計、実績合計、差分）

## 技術スタック

- Hono 4 on Cloudflare Workers
- Cloudflare D1 (SQLite) + Drizzle ORM
- Inertia.js 公式 Hono アダプタ `@hono/inertia`
- Vite 8 (`@cloudflare/vite-plugin` + `@hono/inertia/vite` + `vite-ssr-components`)
- React 19
- Zod / `@hono/zod-validator`
- Node 22 / pnpm 11

## セットアップ

Node.js 22 と pnpm 11 を前提。

```bash
cd projects/taskchute-hono
pnpm install
wrangler d1 create taskchute             # 出力された database_id を wrangler.jsonc に貼る
pnpm db:apply                            # ローカル D1 にマイグレーション
pnpm db:seed                             # 任意: サンプルルーチン投入
pnpm cf-typegen                          # 任意: CloudflareBindings 型生成
```

## 起動

```bash
pnpm dev
```

ブラウザで `http://localhost:5173` を開く。`@cloudflare/vite-plugin` が Vite の dev server 内で Worker をエミュレートするので、追加のプロセスは不要。

## デプロイ

```bash
pnpm db:apply:remote
pnpm deploy
```

## 開発タスク

```bash
pnpm typecheck   # tsc --noEmit
pnpm test        # vitest run（services の単体テスト）
pnpm build       # vite build（dist/ 出力）
```

## ディレクトリ

- `app/server.ts` … Hono エントリ（Worker `default export`）
- `app/root-view.tsx` … HTML シェル（`vite-ssr-components` の primitives）
- `app/ssr.tsx` … Inertia ページ SSR（`createInertiaApp` + `renderToString`）
- `app/client.tsx` … ブラウザ側 Inertia エントリ（`hydrateRoot`）
- `app/routes/web.ts` … Inertia 用ルート（Rails 版とパス互換）
- `app/routes/api.ts` … `/api/v1/*` の JSON API スケルトン（現状 501、iOS 等で後期実装）
- `app/services/` … タスク / ルーチンのビジネスロジック共通層
- `app/db/schema.ts` … Drizzle スキーマ
- `app/lib/payloads.ts` … snake_case の JSON ペイロード組み立て
- `app/pages/` … Inertia ページ（`Today`, `Routines`）
- `app/components/` … React 共通コンポーネント
- `migrations/` … wrangler d1 マイグレーション

## ルート

Rails 版と同じ。すべて Inertia 経由。

| Method | Path | 説明 |
|---|---|---|
| GET | `/` | 今日（または `?date=...`）のタスク一覧 |
| POST | `/tasks` | タスク作成 |
| PATCH | `/tasks/:id` | タスク更新 |
| DELETE | `/tasks/:id` | 削除 |
| POST | `/tasks/:id/start` | 開始 |
| POST | `/tasks/:id/finish` | 終了 |
| POST | `/tasks/:id/reset` | リセット |
| PATCH | `/tasks/reorder` | 並び順 / セクション一括更新 |
| GET | `/routines` | ルーチン一覧 |
| POST | `/routines` | 作成 |
| PATCH | `/routines/:id` | 更新 |
| DELETE | `/routines/:id` | 削除 |
| POST | `/routines/expand` | 対象日へ展開 |

ミューテーション後は `303 See Other` で対象ページへリダイレクト（Inertia が透過的に追従）。

## 操作のヒント

- ヘッダーの「ルーチンを展開」を押すと、対象曜日のアクティブなルーチンを Task として複製します（同じ日に同じルーチンを二重展開しない）
- タスクのタイトルをクリックするとインライン編集できます
- 「開始 → 終了」で実績時間が計測され、見積との差分が表示されます
- 日付は `?date=YYYY-MM-DD` で切替（デフォルトは `DEFAULT_TZ = "Asia/Tokyo"` の今日）

## 後期タスク

- `app/routes/api.ts` の `/api/v1/*` JSON API 実装（services 層を呼ぶだけ）。iOS クライアント / 外部連携用
- iOS ネイティブクライアントの実装（API は snake_case + ISO 8601 UTC 想定）
- 認証 / 複数ユーザー対応（必要になったら）
