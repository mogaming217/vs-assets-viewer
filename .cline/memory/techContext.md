# 技術コンテキスト: VSCode Assets Viewer 拡張機能

## 1. 使用技術

- **プログラミング言語:**
  - **TypeScript:** 拡張機能本体の主要言語。VSCode API との連携、コアロジックの実装に使用。バージョンは最新の安定版を推奨。
  - **JavaScript (ES6+):** Webview UI のスクリプティングに使用。
  - **HTML5:** Webview UI の構造定義に使用。
  - **CSS3:** Webview UI のスタイリングに使用。
- **主要 API・ライブラリ:**
  - **VSCode Extension API:** 拡張機能の基本的な機能（コマンド、Webview、設定、ファイルシステムアクセスなど）を提供。
    - `vscode.commands`
    - `vscode.window` (特に `createWebviewPanel`, `showInformationMessage` など)
    - `vscode.workspace` (特に `getConfiguration`, `findFiles`, `fs` (via `vscode.workspace.fs` or Node.js `fs`))
    - `vscode.Uri`
  - **Node.js API (拡張機能ホスト側):**
    - `fs` モジュール: ファイルシステムの操作（ディレクトリの読み取り、ファイル情報の取得など）に `vscode.workspace.findFiles` と併用または代替として使用。
    - `path` モジュール: ファイルパスの操作に使用。
- **パッケージマネージャー:**
  - **pnpm:** プロジェクトの依存関係管理、スクリプト実行に使用。
- **開発ツール:**
  - **VSCode:** 開発環境。
  - **Node.js & npm/pnpm:** TypeScript のコンパイル、リンティング、テストなどのビルドプロセス実行環境。
  - **ESLint/Prettier (推奨):** コードの静的解析とフォーマット。
  - **TypeScript Compiler (tsc):** TypeScript から JavaScript へのコンパイル。

## 2. 開発環境セットアップ

1.  **Node.js と pnpm のインストール:**
    - システムに Node.js (LTS 版推奨) がインストールされていることを確認。
    - pnpm をグローバルにインストール (`npm install -g pnpm` または公式ドキュメント参照)。
2.  **プロジェクトの初期化:**
    - `pnpm init` で `package.json` を作成。
    - VSCode 拡張機能開発に必要な依存関係を `pnpm add -D` でインストール:
      - `typescript`
      - `@types/vscode` (VSCode API の型定義)
      - `@types/node` (Node.js API の型定義)
      - `vscode-test` (拡張機能のテスト用)
      - `esbuild` または `webpack` (バンドラーとして検討、esbuild を推奨)
      - `eslint`, `prettier` および関連プラグイン (推奨)
    - `yo code` (Yeoman ジェネレーター) を使用して VSCode 拡張機能の雛形を作成することも可能ですが、今回は pnpm ベースで手動セットアップする方針も検討します。ユーザーの指示に従い `pnpm` を使うため、`yo code` が生成する `npm` や `yarn` の設定を `pnpm` に合わせる必要があります。
3.  **TypeScript の設定:**
    - `tsconfig.json` を作成し、コンパイルオプションを設定 (例: `target: "ES2020"`, `module: "commonjs"`, `outDir`, `rootDir` など)。
4.  **`.vscodeignore` と `.gitignore` の設定:**
    - 拡張機能パッケージに含めるべきでないファイルや、バージョン管理すべきでないファイルを指定。
5.  **デバッグ設定:**
    - VSCode の `launch.json` を設定し、拡張機能のデバッグ実行を可能にする。`yo code` で生成される雛形を参考にできます。
6.  **ビルドスクリプト:**
    - `package.json` の `scripts` に、TypeScript のコンパイル、リンティング、テスト、パッケージングなどのコマンドを定義。

## 3. 技術的制約

- **Webview のセキュリティ:**
  - Webview 内で実行されるスクリプトはサンドボックス化されており、直接 Node.js API や VSCode API の全てにアクセスできるわけではありません。拡張機能本体とのメッセージングを通じて連携する必要があります。
  - `Content-Security-Policy` (CSP) を適切に設定し、クロスサイトスクリプティング (XSS) などの脆弱性を防ぎます。
  - ローカルリソースへのアクセスは `vscode.Uri.file(filePath).with({ scheme: 'vscode-resource' })` や `Webview.asWebviewUri(localUri)` を使用して VSCode が提供するセキュアな URI に変換する必要があります。
- **パフォーマンス:**
  - 大量の画像ファイルを扱う場合、ファイルシステムの検索や画像の読み込みがパフォーマンスボトルネックになる可能性があります。非同期処理、遅延読み込み、適切なキャッシュ戦略（必要に応じて）を検討します。
  - Webview のレンダリングパフォーマンスも考慮し、DOM 操作を最小限に抑えるなどの工夫が必要です。
- **VSCode API のバージョン互換性:**
  - `package.json` の `engines.vscode` フィールドでサポートする VSCode の最小バージョンを指定します。使用する API がそのバージョンで利用可能であることを確認する必要があります。
- **ファイルパスの扱い:**
  - 異なる OS（Windows, macOS, Linux）間でのファイルパスの互換性に注意が必要です (`path.join`, `path.sep` などを適切に使用)。
  - ユーザーが設定するパスが絶対パスか相対パスか、ワークスペースからの相対パスかなどを明確に定義し、適切に解決する必要があります。

## 4. 依存関係

- **開発時依存 (`devDependencies`):**
  - `typescript`: TypeScript コンパイラ。
  - `@types/vscode`: VSCode API の型定義。
  - `@types/node`: Node.js API の型定義。
  - `vscode-test`: 拡張機能の統合テスト実行用ユーティリティ。
  - `esbuild` (推奨) or `webpack`: JavaScript バンドラー。コードの最適化と単一ファイルへのバンドル。
  - `eslint`, `prettier`, `eslint-plugin-import`, `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser` など: リンティングとフォーマットツール。
  - `pnpm`: パッケージマネージャー。
- **実行時依存 (`dependencies`):**
  - 現時点では、拡張機能のコアロジックに必要な外部ライブラリは想定していません。必要に応じて追加します（例: 特定の画像処理ライブラリなど、ただし Webview 内で実行する場合は制約あり）。
