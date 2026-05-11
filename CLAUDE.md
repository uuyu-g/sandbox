# Repository conventions

このリポジトリは、Claude で作る複数の独立アプリを集約するための置き場。
アプリ間のビルド連携は持たず、各アプリは完全に独立して動作する前提。

## ディレクトリ規約

- 新しいアプリは必ず `projects/<アプリ名>/` 配下に作る
- ルート直下に新規ファイルやディレクトリを増やさない（言語横断の設定ファイルを除く）
- 各アプリのソース・設定・ロックファイル・README はそのアプリのディレクトリ内で完結させる
- アプリ間で相対パス import / 参照を行わない

## アプリの独立性

- 各アプリは単独でビルド・実行できる状態を保つ
- 依存はアプリのディレクトリ内で完結させる（ルートに package.json / Cargo.toml 等を置かない）
- アプリ固有の設定（`.tool-versions`, `Gemfile`, `package.json` など）はアプリ配下に置く

## 想定言語

TypeScript / Rust / MoonBit / Ruby / Swift を中心に想定しているが、他言語も可。
共通の生成物・秘匿物はルートの `.gitignore` でカバー済み。
言語固有で追加の無視パターンが必要な場合はアプリ配下にローカル `.gitignore` を置く。

## コードスタイル

- インデント・改行は `.editorconfig` に従う（既定 2 スペース、Rust/Swift は 4 スペース）
- 各言語の公式フォーマッタ（`prettier`, `rustfmt`, `rubocop`, `swift-format`, `moon fmt` など）の既定に従う
