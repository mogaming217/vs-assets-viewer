# VS Assets Viewer

A VSCode extension that displays image and SVG files from a specified directory in a grid layout.

## Features

- Preview image files (PNG, JPG, JPEG, GIF, BMP, WEBP) and SVG files
- Display assets in a grid layout
- Group assets by directory with section headers
- Open files in a new tab by clicking on them
- Customize the directory path to display via settings
- Manually refresh the preview with the update button

## Usage

1. Open the command palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)
2. Run the `Assets Viewer: Show Preview` command
3. Assets will be displayed in a grid layout, grouped by directory

## Settings

This extension supports the following settings:

- `vs-assets-viewer.path`: The directory path to preview assets from. If empty, the workspace root directory will be used.
  - You can specify an absolute path or a path relative to the workspace.
  - Example: `assets/images` or `/path/to/your/assets`

## Requirements

- VSCode 1.96.0 or higher

## Installation

### Local Installation

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Build: `pnpm run build`
4. Package: `pnpm run package`
5. Install the generated `.vsix` file in VSCode:
   - Run `Extensions: Install from VSIX...` from the command palette
   - Select the generated `.vsix` file

## Development

### Prerequisites

- Node.js
- pnpm
- Visual Studio Code

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/vs-assets-viewer.git
cd vs-assets-viewer

# Install dependencies
pnpm install

# Run in development mode
# Press F5 or select "Run Extension" from the "Run and Debug" panel
```

### Build

```bash
# Compile TypeScript
pnpm run compile

# Or compile in watch mode
pnpm run watch

# Package
pnpm run package
```

## License

MIT

---

# Japanese / 日本語

# VS Assets Viewer

指定したディレクトリ配下の画像ファイルとSVGファイルをグリッド形式でプレビュー表示するVSCode拡張機能です。

## 機能

- 画像ファイル（PNG, JPG, JPEG, GIF, BMP, WEBP）とSVGファイルのプレビュー表示
- グリッドレイアウトでの一覧表示
- ディレクトリごとにセクション分けして表示
- アセットをクリックすると、そのファイルが新規タブで開く
- 表示するディレクトリパスのカスタマイズ（設定から変更可能）
- 更新ボタンによるプレビューの手動更新

## 使い方

1. コマンドパレットを開く（`Ctrl+Shift+P` または `Cmd+Shift+P`）
2. `Assets Viewer: Show Preview` コマンドを実行
3. ディレクトリごとにセクション分けされたグリッド形式でアセットが表示されます

## 設定

この拡張機能は以下の設定をサポートしています：

- `vs-assets-viewer.path`: プレビュー対象のディレクトリパス。空の場合はワークスペースのルートディレクトリが使用されます。
  - 絶対パスまたはワークスペースからの相対パスを指定できます。
  - 例: `assets/images` や `/path/to/your/assets`

## 要件

- VSCode 1.96.0 以上

## インストール

### ローカルインストール

1. リポジトリをクローン
2. 依存関係をインストール: `pnpm install`
3. ビルド: `pnpm run build`
4. パッケージ化: `pnpm run package`
5. 生成された `.vsix` ファイルを VSCode にインストール:
   - コマンドパレットから `Extensions: Install from VSIX...` を実行
   - 生成された `.vsix` ファイルを選択

## 開発

### 前提条件

- Node.js
- pnpm
- Visual Studio Code

### セットアップ

```bash
# リポジトリをクローン
git clone https://github.com/yourusername/vs-assets-viewer.git
cd vs-assets-viewer

# 依存関係をインストール
pnpm install

# 開発モードで実行
# F5 キーを押すか、「実行とデバッグ」パネルから「Run Extension」を選択
```

### ビルド

```bash
# TypeScript のコンパイル
pnpm run compile

# または監視モードでコンパイル
pnpm run watch

# パッケージ化
pnpm run package
```

## ライセンス

MIT
