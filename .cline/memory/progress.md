# プログレス: VSCode Assets Viewer 拡張機能

## 1. 機能している部分

- 現時点では、プロジェクトは計画段階であり、実装された機能はありません。

## 2. 構築すべき残りの部分 (主要タスクリスト)

### フェーズ 1: プロジェクトセットアップと基本構造

1.  **プロジェクト初期化:**
    - `pnpm` を使用してプロジェクトディレクトリを初期化。
    - `package.json` の設定 (名前、バージョン、説明、作者、ライセンス、`engines.vscode` など)。
    - 必要な開発依存関係のインストール (`typescript`, `@types/vscode`, `@types/node`, `esbuild`, `vscode-test`, `eslint`, `prettier` など)。
    - `tsconfig.json` の設定。
    - `.vscodeignore`, `.gitignore` の作成と設定。
    - VSCode デバッグ設定 (`launch.json`) の作成。
2.  **拡張機能エントリーポイント作成:**
    - `src/extension.ts` を作成。
    - `activate` 関数と `deactivate` 関数の基本的な実装。
    - `package.json` の `main` と `activationEvents` の設定。
3.  **コマンド登録:**
    - プレビュー表示を開始するためのコマンドを登録 (例: `vscode-assets-viewer.showPreview`)。
    - コマンドパレットから実行できることを確認。

### フェーズ 2: ファイル検索と Webview の基本実装

4.  **ファイル検索ロジック:**
    - 指定されたディレクトリ (初期はワークスペースルート) から画像ファイル (`.png`, `.jpg`, `.jpeg`, `.gif`) と SVG ファイル (`.svg`) を検索するロジックを実装。
    - `vscode.workspace.findFiles` または Node.js `fs` モジュールを使用。
    - 検索結果 (ファイルパスのリスト) を取得できるようにする。
5.  **Webview パネル作成:**
    - コマンド実行時に Webview パネルを作成し表示するロジックを実装。
    - 基本的な HTML 構造を持つ Webview コンテンツ (`getHtmlForWebview` 関数など) を作成。
    - Webview にタイトルを設定。
6.  **拡張機能から Webview へのデータ送信:**
    - 検索したファイルパスのリストを拡張機能本体から Webview へ送信する仕組みを実装 (`webview.postMessage()`)。

### フェーズ 3: Webview UI でのグリッド表示

7.  **Webview 側でのメッセージ受信と処理:**
    - Webview の JavaScript で、拡張機能本体から送信されたファイルリストを受信 (`window.addEventListener('message', ...)` )。
8.  **グリッドレイアウト:**
    - 受信したファイルリストを元に、CSS Grid や Flexbox を使用して画像とファイル名をグリッド形式で表示する HTML と CSS を実装。
    - 各アイテムにはファイル名と、画像の場合は `<img>` タグ (初期は空の `src` またはプレースホルダー) を表示。
9.  **画像/SVG の表示:**
    - `<img>` タグの `src` に、`webview.asWebviewUri()` を使用して変換したローカルファイルの URI を設定し、画像と SVG をプレビュー表示する。
    - SVG は `<img>` タグで直接表示可能。

### フェーズ 4: 設定機能の実装

10. **設定値の読み込み:**
    - `settings.json` からプレビュー対象のディレクトリパス (`vscodeAssetsViewer.path` など) を読み込むロジックを実装 (`vscode.workspace.getConfiguration()`)。
    - 設定値が存在しない場合はデフォルト値 (ワークスペースルート) を使用。
11. **設定変更の監視と反映:**
    - 設定変更を監視し (`vscode.workspace.onDidChangeConfiguration`)、変更があった場合はプレビュー内容を更新するロジックを実装。

### フェーズ 5: 改善と仕上げ

12. **パフォーマンス改善:**
    - 画像の遅延読み込み (Intersection Observer API など) を実装。
    - 大量ファイル時の UI 応答性を確認し、必要に応じて最適化。
13. **エラーハンドリング:**
    - ディレクトリが存在しない場合、アクセス権がない場合などのエラー処理を実装。
    - ユーザーに適切なフィードバックを表示。
14. **UI/UX 改善:**
    - 基本的なスタイリングの調整。
    - ローディング表示など。
15. **README 作成:**
    - 拡張機能のインストール方法、使用方法、設定方法などを記載した `README.md` を作成。
16. **テスト (可能な範囲で):**
    - 基本的なユニットテストや手動テストを実施。

## 3. 現在のステータス

- **2025/05/09:** プロジェクト計画フェーズ。メモリバンクファイル作成中。
  - [`projectbrief.md`](.cline/memory/projectbrief.md) 作成完了。
  - [`productContext.md`](.cline/memory/productContext.md) 作成完了。
  - [`systemPatterns.md`](.cline/memory/systemPatterns.md) 作成完了。
  - [`techContext.md`](.cline/memory/techContext.md) 作成完了。
  - [`activeContext.md`](.cline/memory/activeContext.md) 作成完了。
  - この [`progress.md`](.cline/memory/progress.md) を作成中。

## 4. 既知の問題点・課題

- 現時点では特になし (計画段階のため)。
- **今後の課題として想定されるもの:**
  - 多数の画像ファイルがある場合のパフォーマンス。
  - Webview のセキュリティ設定の複雑さ。
  - 異なる OS 環境でのファイルパスの扱いの差異。
  - ユーザー設定のバリデーション。
