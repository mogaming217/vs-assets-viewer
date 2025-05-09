import * as vscode from 'vscode';
import * as path from 'path';
import { AssetFile } from './types';

// サポートする画像ファイルの拡張子
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'];
// サポートするSVGファイルの拡張子
const SVG_EXTENSIONS = ['.svg'];
// サポートするすべてのファイル拡張子
const SUPPORTED_EXTENSIONS = [...IMAGE_EXTENSIONS, ...SVG_EXTENSIONS];

/**
 * 設定から表示パスを取得する
 * 設定が空の場合はワークスペースのルートパスを返す
 */
export function getAssetsPath(): string | undefined {
  const config = vscode.workspace.getConfiguration('vs-assets-viewer');
  const configPath = config.get<string>('path');

  if (configPath && configPath.trim() !== '') {
    // 設定パスが絶対パスの場合はそのまま返す
    if (path.isAbsolute(configPath)) {
      return configPath;
    }

    // 相対パスの場合はワークスペースからの相対パスとして解決
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders && workspaceFolders.length > 0) {
      return path.join(workspaceFolders[0].uri.fsPath, configPath);
    }
  }

  // 設定が空の場合はワークスペースのルートパスを返す
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (workspaceFolders && workspaceFolders.length > 0) {
    return workspaceFolders[0].uri.fsPath;
  }

  return undefined;
}

/**
 * 指定されたディレクトリから画像ファイルとSVGファイルを検索する
 * @param basePath 検索するディレクトリのパス
 * @returns 見つかったアセットファイルの配列
 */
export async function findAssetFiles(basePath?: string): Promise<AssetFile[]> {
  if (!basePath) {
    basePath = getAssetsPath();
    if (!basePath) {
      throw new Error('アセットパスが設定されていません。ワークスペースを開いてください。');
    }
  }

  try {
    // ファイルの検索パターンを作成
    const pattern = `${basePath}/**/*.{${SUPPORTED_EXTENSIONS.map((ext) => ext.substring(1)).join(',')}}`;

    // ファイルを検索
    const files = await vscode.workspace.findFiles(
      new vscode.RelativePattern(
        basePath,
        `**/*.{${SUPPORTED_EXTENSIONS.map((ext) => ext.substring(1)).join(',')}}`
      ),
      '**/node_modules/**'
    );

    // 検索結果をAssetFile配列に変換
    return files.map((file) => {
      const filePath = file.fsPath;
      const fileName = path.basename(filePath);
      const fileExtension = path.extname(filePath).toLowerCase();
      const directory = path.dirname(filePath);

      // ベースパスからの相対パスを計算
      let relativePath = path.relative(basePath, directory);
      // Windowsの場合、パスの区切り文字をスラッシュに統一
      relativePath = relativePath.replace(/\\/g, '/');

      // 相対パスが空の場合（ベースパス直下のファイル）は、ベースパスの最後の部分を使用
      const directoryName = relativePath || path.basename(basePath);

      return {
        path: filePath,
        name: fileName,
        type: SVG_EXTENSIONS.includes(fileExtension) ? 'svg' : 'image',
        extension: fileExtension,
        directory,
        directoryName,
      };
    });
  } catch (error) {
    console.error('アセットファイルの検索中にエラーが発生しました:', error);
    throw error;
  }
}
