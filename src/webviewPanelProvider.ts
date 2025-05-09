import * as vscode from 'vscode';
import * as path from 'path';
import { findAssetFiles, getAssetsPath } from './fileSystemProvider';
import { AssetFile, WebviewMessage } from './types';

// Webviewパネルの参照を保持する変数
let currentPanel: vscode.WebviewPanel | undefined = undefined;

/**
 * アセットプレビューを表示する
 * @param context 拡張機能のコンテキスト
 */
export async function showAssetsPreview(context: vscode.ExtensionContext): Promise<void> {
  const columnToShowIn = vscode.window.activeTextEditor
    ? vscode.window.activeTextEditor.viewColumn
    : undefined;

  // すでにパネルが存在する場合は、そのパネルを表示する
  if (currentPanel) {
    currentPanel.reveal(columnToShowIn);
    return;
  }

  // 新しいパネルを作成
  currentPanel = vscode.window.createWebviewPanel(
    'assetsViewer',
    'Assets Viewer',
    columnToShowIn || vscode.ViewColumn.One,
    {
      // Webviewで許可するスクリプトとリソースを設定
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.file(path.join(context.extensionPath, 'webview-ui')),
        // アセットディレクトリも許可する
        vscode.Uri.file(getAssetsPath() || ''),
      ],
      retainContextWhenHidden: true,
    }
  );

  // Webviewのコンテンツを設定
  currentPanel.webview.html = getWebviewContent(currentPanel.webview);

  // パネルが破棄されたときのイベントハンドラ
  currentPanel.onDidDispose(
    () => {
      currentPanel = undefined;
    },
    null,
    context.subscriptions
  );

  // Webviewからのメッセージを処理
  currentPanel.webview.onDidReceiveMessage(
    async (message: WebviewMessage) => {
      switch (message.type) {
        case 'refresh':
          if (currentPanel) {
            await refreshAssets(currentPanel);
          }
          break;
        case 'openFile':
          // ファイルを開く
          if (message.data && typeof message.data === 'string') {
            try {
              // IDからアセットを検索
              const assetId = parseInt(message.data, 10);
              // 最後に送信したアセットリストから該当するアセットを検索
              const assets = await findAssetFiles();
              if (assetId >= 0 && assetId < assets.length) {
                const asset = assets[assetId];
                const uri = vscode.Uri.file(asset.path);

                // 画像ファイルやバイナリファイルの場合は vscode.open を使用
                const extension = path.extname(asset.path).toLowerCase();
                if (
                  ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'].includes(extension)
                ) {
                  await vscode.commands.executeCommand('vscode.open', uri);
                } else {
                  // テキストファイルの場合は openTextDocument と showTextDocument を使用
                  const document = await vscode.workspace.openTextDocument(uri);
                  await vscode.window.showTextDocument(document);
                }
              } else {
                vscode.window.showErrorMessage(
                  `指定されたアセットが見つかりませんでした (ID: ${assetId})`
                );
              }
            } catch (error) {
              vscode.window.showErrorMessage(`ファイルを開けませんでした: ${error}`);
            }
          }
          break;
      }
    },
    undefined,
    context.subscriptions
  );

  // 設定変更時のイベントハンドラ
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(async (e) => {
      if (e.affectsConfiguration('vs-assets-viewer.path') && currentPanel) {
        await refreshAssets(currentPanel);
      }
    })
  );

  // 初期アセットの読み込み
  if (currentPanel) {
    await refreshAssets(currentPanel);
  }
}

/**
 * アセットの一覧を更新する
 * @param panel Webviewパネル
 */
async function refreshAssets(panel: vscode.WebviewPanel): Promise<void> {
  try {
    // アセットファイルを検索
    const assets = await findAssetFiles();

    // ファイルパスをWebviewで安全に使用できるURIに変換
    const webviewAssets = assets.map((asset, index) => ({
      ...asset,
      id: index, // 一意のIDを追加
      webviewUri: panel.webview.asWebviewUri(vscode.Uri.file(asset.path)).toString(),
    }));

    // Webviewにアセットリストを送信
    panel.webview.postMessage({
      type: 'assets',
      data: webviewAssets,
    } as WebviewMessage);
  } catch (error) {
    // エラーメッセージを表示
    const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました';
    vscode.window.showErrorMessage(`アセットの読み込み中にエラーが発生しました: ${errorMessage}`);

    // Webviewにエラーメッセージを送信
    panel.webview.postMessage({
      type: 'error',
      data: errorMessage,
    } as WebviewMessage);
  }
}

/**
 * Webviewのコンテンツを生成する
 * @param context 拡張機能のコンテキスト
 * @param webview Webviewインスタンス
 * @returns HTML文字列
 */
/**
 * ランダムなnonceを生成する
 * @returns ランダムな文字列
 */
function getNonce(): string {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

function getWebviewContent(webview: vscode.Webview): string {
  // nonceを生成
  const nonce = getNonce();

  // Webview UIのHTMLを返す
  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} https:; script-src 'nonce-${nonce}'; style-src 'unsafe-inline';">
  <title>Assets Viewer</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      padding: 0;
      margin: 0;
      background-color: var(--vscode-editor-background);
      color: var(--vscode-editor-foreground);
    }

    .container {
      padding: 20px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    .filter-container {
      margin-bottom: 20px;
    }

    .filter-input {
      width: 100%;
      padding: 8px;
      border: 1px solid var(--vscode-input-border);
      background-color: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border-radius: 2px;
      font-size: 14px;
    }

    .filter-input:focus {
      outline: 1px solid var(--vscode-focusBorder);
      border-color: var(--vscode-focusBorder);
    }

    .title {
      font-size: 1.5em;
      font-weight: bold;
      margin: 0;
    }

    .refresh-button {
      background-color: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      padding: 6px 12px;
      cursor: pointer;
      border-radius: 2px;
    }

    .refresh-button:hover {
      background-color: var(--vscode-button-hoverBackground);
    }

    .directory-section {
      margin-bottom: 30px;
    }

    .directory-header {
      font-size: 1.2em;
      font-weight: bold;
      margin: 0 0 15px 0;
      padding-bottom: 5px;
      border-bottom: 1px solid var(--vscode-panel-border);
    }

    .assets-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 20px;
    }

    .asset-item {
      border: 1px solid var(--vscode-panel-border);
      border-radius: 4px;
      overflow: hidden;
      transition: transform 0.2s;
    }

    .asset-item:hover {
      transform: scale(1.02);
    }

    .asset-preview {
      width: 100%;
      height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--vscode-editor-inactiveSelectionBackground);
      overflow: hidden;
    }

    .asset-preview img {
      width: 100%;
      height: 100%;
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }

    .copy-feedback {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background-color: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      padding: 8px 16px;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      opacity: 0;
      transform: translateY(10px);
      transition: opacity 0.3s, transform 0.3s;
    }

    .copy-feedback.show {
      opacity: 1;
      transform: translateY(0);
    }

    .asset-info {
      padding: 10px;
      border-top: 1px solid var(--vscode-panel-border);
    }

    .asset-name {
      font-size: 0.9em;
      word-break: break-all;
      margin: 0;
    }

    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 200px;
      font-size: 1.2em;
    }

    .error {
      color: var(--vscode-errorForeground);
      padding: 20px;
      border: 1px solid var(--vscode-errorForeground);
      border-radius: 4px;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="title">Assets Viewer</h1>
      <button class="refresh-button" id="refresh-button">Refresh</button>
    </div>

    <div class="filter-container">
      <input type="text" id="filter-input" placeholder="search assets..." class="filter-input">
    </div>

    <div id="assets-container">
      <div class="loading">読み込み中...</div>
    </div>
  </div>

  <script nonce="${nonce}">
    (function() {
      // VSCode Webviewとの通信用
      const vscode = acquireVsCodeApi();

      // DOM要素
      const assetsContainer = document.getElementById('assets-container');
      const refreshButton = document.getElementById('refresh-button');
      const filterInput = document.getElementById('filter-input');

      // 現在のアセットデータを保持する変数
      let currentAssets = [];

      // 更新ボタンのクリックイベント
      refreshButton.addEventListener('click', () => {
        vscode.postMessage({ type: 'refresh', data: null });
        assetsContainer.innerHTML = '<div class="loading">読み込み中...</div>';
      });

      // フィルター入力イベント
      filterInput.addEventListener('input', () => {
        filterAssets(filterInput.value.toLowerCase());
      });

      // アセットをフィルタリングする関数
      function filterAssets(filterText) {
        if (!currentAssets || currentAssets.length === 0) {
          return;
        }

        // フィルターテキストが空の場合は全てのアセットを表示
        if (!filterText) {
          renderAssets(currentAssets);
          return;
        }

        // フィルターテキストを含むアセットのみをフィルタリング
        const filteredAssets = currentAssets.filter(asset =>
          asset.name.toLowerCase().includes(filterText)
        );

        renderAssets(filteredAssets);
      }

      // VSCodeからのメッセージを処理
      window.addEventListener('message', event => {
        const message = event.data;

        switch (message.type) {
          case 'assets':
            currentAssets = message.data; // 現在のアセットデータを保存
            const filterText = filterInput.value.toLowerCase();
            if (filterText) {
              filterAssets(filterText); // フィルターが入力されている場合はフィルタリング
            } else {
              renderAssets(message.data); // フィルターがない場合はそのまま表示
            }
            break;
          case 'error':
            renderError(message.data);
            break;
        }
      });

      // アセットを表示する関数
      function renderAssets(assets) {
        if (!assets || assets.length === 0) {
          assetsContainer.innerHTML = '<div class="loading">アセットが見つかりませんでした</div>';
          return;
        }

        // ファイルを開くための関数
        function openFile(filePath) {
          vscode.postMessage({
            type: 'openFile',
            data: filePath
          });
        }

        // アセットをディレクトリごとにグループ化
        const assetsByDirectory = {};

        assets.forEach(asset => {
          if (!assetsByDirectory[asset.directory]) {
            assetsByDirectory[asset.directory] = {
              directoryName: asset.directoryName,
              assets: []
            };
          }
          assetsByDirectory[asset.directory].assets.push(asset);
        });

        // メインコンテナをクリア
        assetsContainer.innerHTML = '';

        // ディレクトリごとにセクションを作成
        Object.keys(assetsByDirectory).forEach(directory => {
          const directoryData = assetsByDirectory[directory];
          const directoryAssets = directoryData.assets;

          // ディレクトリセクションを作成
          const sectionContainer = document.createElement('div');
          sectionContainer.className = 'directory-section';

          // ディレクトリヘッダーを作成
          const header = document.createElement('h2');
          header.className = 'directory-header';
          header.textContent = directoryData.directoryName || 'その他';
          sectionContainer.appendChild(header);

          // グリッドを作成
          const grid = document.createElement('div');
          grid.className = 'assets-grid';

          // アセットをグリッドに追加
          directoryAssets.forEach(asset => {
            const item = document.createElement('div');
            item.className = 'asset-item';

            // クリック時にファイルを開く
            item.addEventListener('click', () => {
              openFile(asset.id.toString()); // 一意のIDを使用
            });

            const preview = document.createElement('div');
            preview.className = 'asset-preview';

            const img = document.createElement('img');
            img.alt = asset.name;
            img.loading = 'lazy';
            // Webview URI を使用して画像を表示
            img.src = asset.webviewUri || '';

            preview.appendChild(img);

            const info = document.createElement('div');
            info.className = 'asset-info';

            const name = document.createElement('p');
            name.className = 'asset-name';
            name.textContent = asset.name;

            info.appendChild(name);

            item.appendChild(preview);
            item.appendChild(info);

            grid.appendChild(item);
          });

          sectionContainer.appendChild(grid);
          assetsContainer.appendChild(sectionContainer);
        });
      }

      // エラーを表示する関数
      function renderError(errorMessage) {
        assetsContainer.innerHTML = \`
          <div class="error">
            <p>\${errorMessage}</p>
          </div>
        \`;
      }
    })();
  </script>
</body>
</html>`;
}
