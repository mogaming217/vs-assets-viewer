# アクティブコンテキスト: VSCode Assets Viewer 拡張機能

## 1. 現在の作業の焦点

- **プロジェクト初期設定と計画:**
  - メモリバンクファイルの作成（`projectbrief.md`, `productContext.md`, `systemPatterns.md`, `techContext.md` は作成済み）。
  - 残りのコアメモリバンクファイル（`activeContext.md`, `progress.md`）の作成。
  - ユーザーの要求に基づいた詳細な開発計画の策定。
  - 開発タスクの洗い出しと優先順位付け。
  - 初期のプロジェクト構造（ディレクトリ、主要ファイル）の設計。

## 2. 最近の変更

- **プロジェクト開始:** ユーザーからの新規開発リクエスト。
- **メモリバンク初期化:**
  - [`projectbrief.md`](.cline/memory/projectbrief.md) 作成済み。
  - [`productContext.md`](.cline/memory/productContext.md) 作成済み。
  - [`systemPatterns.md`](.cline/memory/systemPatterns.md) 作成済み。
  - [`techContext.md`](.cline/memory/techContext.md) 作成済み。

## 3. 次のステップ

1.  **メモリバンクの完成:**
    - この [`activeContext.md`](.cline/memory/activeContext.md) を作成。
    - [`progress.md`](.cline/memory/progress.md) を作成。
2.  **開発計画の策定と提示:**
    - ここまでのメモリバンク情報を基に、具体的な開発ステップ、成果物、タイムライン（概算）を含む計画を作成する。
    - 計画には、プロジェクトのセットアップ、拡張機能の基本構造作成、ファイル検索ロジックの実装、Webview UI の作成、設定機能の実装などが含まれる。
    - Mermaid ダイアグラムなどを用いて、計画を視覚的に分かりやすく提示する。
3.  **ユーザーによる計画のレビューと承認:**
    - 策定した計画をユーザーに提示し、フィードバックを求める。
    - 必要に応じて計画を修正する。
4.  **計画のドキュメント化:**
    - 承認された計画を Markdown ファイルとして保存するかどうかをユーザーに確認する。
5.  **実装モードへの移行提案:**
    - 計画が確定したら、実装フェーズに進むために適切なモード（例: "Code" モード）への切り替えをユーザーに提案する。

## 4. アクティブな決定事項と考慮事項

- **プロジェクト初期化方法:**
  - `pnpm` を使用することが指定されている。
  - `yo code` を使うか、手動で `package.json` や `tsconfig.json` をセットアップするか。[`techContext.md`](.cline/memory/techContext.md) では手動セットアップも視野に入れているが、`yo code` で雛形を生成し `pnpm` に適合させる方が効率的かもしれない。これは計画策定時に具体的に検討する。
- **Webview UI の技術選定:**
  - プレーンな HTML/CSS/JavaScript で実装するか、軽量な UI ライブラリ（例: Preact, Svelte など、ただし依存関係が増える）を導入するか。初期段階ではプレーンな実装が適切か。
- **ファイル検索戦略:**
  - `vscode.workspace.findFiles` を主に使用するか、Node.js の `fs` モジュールをより積極的に活用するか。パフォーマンスと実装の容易さを考慮する。
  - 検索対象のファイル拡張子（例: `.png`, `.jpg`, `.jpeg`, `.gif`, `.svg`）を明確に定義する。
- **設定の粒度:**
  - 初期リリースでは表示パスのみを設定可能とするが、将来的には検索対象の拡張子、グリッドの列数なども設定可能にするか検討。
- **エラーハンドリングとロギング:**
  - ユーザーに分かりやすいエラーメッセージを表示する。
  - 開発者向けに、VSCode の Output Channel にデバッグログを出力する仕組みを設けるか検討。
