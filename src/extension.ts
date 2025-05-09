import * as vscode from 'vscode';
import { showAssetsPreview } from './webviewPanelProvider';

/**
 * この関数は拡張機能がアクティブ化されたときに呼び出されます
 * @param context 拡張機能のコンテキスト
 */
export function activate(context: vscode.ExtensionContext) {
  console.log('VS Assets Viewer 拡張機能がアクティブ化されました');

  // コマンドの登録
  const disposable = vscode.commands.registerCommand('vs-assets-viewer.showPreview', () => {
    showAssetsPreview(context);
  });

  context.subscriptions.push(disposable);
}

/**
 * この関数は拡張機能が非アクティブ化されたときに呼び出されます
 */
export function deactivate() {
  console.log('VS Assets Viewer 拡張機能が非アクティブ化されました');
}
