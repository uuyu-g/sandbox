# sandbox

複数のプロジェクトを 1 つのリポジトリに同居させるための置き場。

「いわゆるモノレポ」のように workspace ツールでまとめることはしない。各プロジェクトは `projects/<name>/` の下に独立して住み、自前のビルド・テストコマンドで完結する。

## 想定言語

- TypeScript
- MoonBit
- Swift

これ以外の言語を置くことも可能だが、ルートの `.gitignore` / `.editorconfig` は当面この 3 つを意識した内容になっている。必要が出たら都度足す。

## ディレクトリ

```
.
├── projects/    # 各プロジェクトはここに置く
├── .editorconfig
├── .gitattributes
├── .gitignore
└── .prettierrc.json
```

ルートに `package.json` / `pnpm-workspace.yaml` / `Package.swift` などは置かない。

## 新規プロジェクトの追加

```sh
# TypeScript
mkdir -p projects/<name> && cd projects/<name> && npm init -y

# MoonBit
cd projects && moon new <name>

# Swift
mkdir -p projects/<name> && cd projects/<name> && swift package init
```

ルートの `.prettierrc.json` は JS/TS プロジェクトの初期値として効くだけで、他言語には影響しない。各プロジェクトが自分のディレクトリで設定を上書きしてもよい。
