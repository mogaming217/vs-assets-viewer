## VSCode Assets Viewer 拡張機能 開発計画

### 1. プロジェクトの目的と範囲（再確認）

- **目的:** 指定ディレクトリ配下の画像・SVG ファイルをグリッド形式で一覧プレビューする VSCode 拡張機能の開発。
- **主要機能:**
  1.  画像・SVG ファイルのプレビュー表示。
  2.  表示パスのカスタマイズ (`settings.json`)。
- **技術スタック:** TypeScript, VSCode Extension API, Webview API, pnpm。

詳細は各メモリバンクファイルをご参照ください。

### 2. 開発フェーズと主要タスク

```mermaid
gantt
    dateFormat  YYYY-MM-DD
    title VSCode Assets Viewer 開発計画

    section フェーズ1: プロジェクト基盤構築
    プロジェクト初期化と設定      :done, task_p1_1, 2025-05-10, 1d
    基本ディレクトリ構造作成     :task_p1_2, after task_p1_1, 1d
    拡張機能エントリーポイント作成 :task_p1_3, after task_p1_2, 1d
    コマンド登録と動作確認       :task_p1_4, after task_p1_3, 1d

    section フェーズ2: コア機能実装 (ファイル検索とWebview)
    ファイル検索ロジック実装     :task_p2_1, after task_p1_4, 2d
    Webviewパネル表示ロジック実装 :task_p2_2, after task_p2_1, 2d
    拡張機能-Webview間通信(基本) :task_p2_3, after task_p2_2, 1d

    section フェーズ3: Webview UI 実装 (グリッド表示)
    Webview UI基本ファイル作成   :task_p3_1, after task_p2_3, 1d
    ファイルリストのグリッド表示  :task_p3_2, after task_p3_1, 2d
    画像・SVGプレビュー表示      :task_p3_3, after task_p3_2, 2d

    section フェーズ4: 設定機能の実装
    設定値読み込み機能実装       :task_p4_1, after task_p3_3, 1d
    設定変更時のプレビュー更新    :task_p4_2, after task_p4_1, 2d

    section フェーズ5: 仕上げとテスト
    パフォーマンス改善(遅延読込等):task_p5_1, after task_p4_2, 2d
    エラーハンドリング強化       :task_p5_2, after task_p5_1, 1d
    UI/UX微調整                :task_p5_3, after task_p5_2, 1d
    README作成                 :task_p5_4, after task_p5_3, 1d
    総合テストとリファクタリング  :task_p5_5, after task_p5_4, 2d
```

### 3. 推奨ディレクトリ構造

```
.
├── .cline/memory/              # メモリバンクファイル
├── .git/                       # Gitリポジトリ (初期化後)
├── .vscode/
│   ├── launch.json             # デバッグ設定
│   └── settings.json           # ワークスペース設定 (推奨)
├── node_modules/               # pnpmが管理 (実際は .pnpmストアへのリンク)
├── out/                        # コンパイル後のJSファイル出力先
├── src/                        # 拡張機能本体のTypeScriptソースコード
│   ├── extension.ts            # 拡張機能のエントリーポイント (activate, deactivate)
│   ├── fileSystemProvider.ts   # ファイル検索ロジック
│   ├── webviewPanelProvider.ts # Webviewパネルの作成・管理
│   └── types.ts                # プロジェクト固有の型定義 (任意)
├── webview-ui/                 # Webview UI関連ファイル
│   ├── index.html              # WebviewのHTML構造
│   ├── main.js                 # WebviewのクライアントサイドJavaScript
│   ├── styles.css              # WebviewのCSS
│   └── assets/                 # Webview UIで使用するローカルアセット (あれば)
├── .eslintignore
├── .eslintrc.json
├── .gitignore
├── .prettierignore
├── .prettierrc.json
├── CHANGELOG.md                # 変更履歴 (推奨)
├── package.json                # プロジェクト定義、依存関係、スクリプト
├── pnpm-lock.yaml              # pnpmロックファイル
├── README.md                   # プロジェクトの説明、使用方法
└── tsconfig.json               # TypeScriptコンパイラ設定
```

### 4. 主要コンポーネントと連携

```mermaid
sequenceDiagram
    participant User
    participant VSCodeUI as VSCode UI (コマンドパレット等)
    participant ExtensionHost as 拡張機能ホスト (extension.ts)
    participant FileSystemProvider as fileSystemProvider.ts
    participant WebviewPanelProvider as webviewPanelProvider.ts
    participant WebviewUI as Webview UI (HTML/JS/CSS)

    User->>VSCodeUI: コマンド実行 ("Assets Viewer: Show Preview")
    VSCodeUI->>ExtensionHost: activate() / コマンドトリガー
    ExtensionHost->>WebviewPanelProvider: Webviewパネル作成/表示要求
    WebviewPanelProvider->>FileSystemProvider: ファイルリスト取得要求 (設定パス)
    FileSystemProvider->>ExtensionHost: (VSCode API経由) ファイル検索
    ExtensionHost-->>FileSystemProvider: ファイルリスト
    FileSystemProvider-->>WebviewPanelProvider: ファイルリスト
    WebviewPanelProvider->>WebviewUI: (postMessage) ファイルリスト送信
    WebviewPanelProvider-->>ExtensionHost: Webviewパネル表示
    activate WebviewUI
        WebviewUI->>WebviewUI: グリッド表示レンダリング
        loop 各ファイル
            WebviewUI->>ExtensionHost: (asWebviewUri) 画像URI変換要求
            ExtensionHost-->>WebviewUI: 変換後URI
            WebviewUI->>WebviewUI: 画像表示
        end
    deactivate WebviewUI

    Note over User, WebviewUI: 設定変更時
    User->>VSCodeUI: settings.json変更
    VSCodeUI->>ExtensionHost: onDidChangeConfigurationイベント
    ExtensionHost->>WebviewPanelProvider: 設定変更通知
    WebviewPanelProvider->>FileSystemProvider: 新しいパスでファイルリスト再取得要求
    FileSystemProvider->>ExtensionHost: (VSCode API経由) ファイル検索
    ExtensionHost-->>FileSystemProvider: 新しいファイルリスト
    FileSystemProvider-->>WebviewPanelProvider: 新しいファイルリスト
    WebviewPanelProvider->>WebviewUI: (postMessage) 新しいファイルリスト送信
    activate WebviewUI
        WebviewUI->>WebviewUI: グリッド表示更新
    deactivate WebviewUI
```

### 5. 開発ステップ詳細 (フェーズ 1 の例)

**フェーズ 1: プロジェクト基盤構築**

1.  **プロジェクト初期化と設定:**
    - コマンド:
      ```bash
      mkdir vscode-assets-viewer
      cd vscode-assets-viewer
      pnpm init
      pnpm add -D typescript @types/vscode @types/node esbuild vscode-test eslint prettier @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-config-prettier eslint-plugin-prettier
      # (必要に応じてyo codeで雛形生成し、pnpm用に調整)
      ```
    - `package.json` の主要フィールド設定 (`name`, `displayName`, `description`, `version`, `publisher`, `engines.vscode`, `activationEvents`, `main`, `contributes.commands`, `contributes.configuration` など)。
    - `pnpm` スクリプト設定 (`compile`, `watch`, `lint`, `format`, `test` など)。
2.  **基本ディレクトリ構造作成:** 上記「3. 推奨ディレクトリ構造」に従い、`src`, `webview-ui` などのディレクトリを作成。
3.  **拡張機能エントリーポイント作成:**
    - `src/extension.ts` に `activate` と `deactivate` 関数を作成。
    - `activate` 内でコマンド登録の準備。
4.  **コマンド登録と動作確認:**
    - `package.json` の `contributes.commands` にコマンドを定義。
    - `extension.ts` の `activate` で `vscode.commands.registerCommand` を使用してコマンドを登録。
    - 登録したコマンドを実行すると、コンソールにログが出力されることを確認 (F5 デバッグ)。
    - `tsconfig.json` (module: commonjs, target: es2020, outDir: out, rootDir: src, strict: true など) と `launch.json` (デバッグ実行用) を設定。
    - ESLint ([`.eslintrc.json`](eslintrc.json)) と Prettier ([`.prettierrc.json`](.prettierrc.json)) の設定ファイルを作成し、基本的なルールを定義。
