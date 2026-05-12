# TaskChute

1日のタスクを「シュート」していくためのローカル専用タスクシュートアプリ。

## 機能

- 1日分のタスク一覧（朝 / 昼 / 夜のセクション分け）
- 見積時間と実績時間の記録（開始 / 終了の打刻、差分表示）
- タスクの完了 / 未完了切り替え、編集、削除
- ルーチン（曜日指定の繰り返しタスク）の登録と「今日へ展開」
- 日付ナビゲーション（前日 / 翌日 / 任意の日付）
- 1日のサマリ（タスク件数、見積合計、実績合計、差分）

## 技術スタック

- Rails 8 (SQLite3)
- Inertia.js (Rails アダプタ `inertia_rails`)
- Vite (`vite_rails` + `@vitejs/plugin-react`)
- React 19
- Base Web (BaseUI) + Styletron

## セットアップ

Ruby 3.3 と Node.js 22 を前提。

```bash
bundle install
pnpm install
bin/rails db:migrate
```

## 起動

開発時は Rails と Vite の dev server を同時に起動する。

```bash
bin/dev
```

初回起動時に `foreman` gem を自動でインストールします。`bin/dev` は `Procfile.dev`
を参照して `bin/rails s`（:3000）と `bin/vite dev`（:3036）を起動します。

ブラウザで http://localhost:3000 を開く。

別々に起動したい場合:

```bash
bin/vite dev   # ターミナル 1
bin/rails s    # ターミナル 2
```

## 本番ビルド（任意）

```bash
bin/vite build
RAILS_ENV=production bin/rails s
```

## ディレクトリ

- `app/controllers/tasks_controller.rb` … 1日分のタスク CRUD と開始 / 終了 / リセット
- `app/controllers/routines_controller.rb` … ルーチンの CRUD と「今日へ展開」
- `app/javascript/pages/Today.jsx` … 今日のタスク画面
- `app/javascript/pages/Routines.jsx` … ルーチン管理画面
- `app/javascript/components/` … BaseUI ベースの共通コンポーネント

## 操作のヒント

- ヘッダーの「ルーチンを展開」を押すと、対象曜日に登録されているルーチンを
  その日付の Task として複製します（同じ日に同じルーチンを二重展開しない）
- タスクのタイトルをクリックするとインライン編集できます
- 「開始 → 終了」で実績時間が計測され、見積との差分が表示されます
