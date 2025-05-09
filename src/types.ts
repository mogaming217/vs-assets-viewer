/**
 * アセットファイルの情報を表す型
 */
export interface AssetFile {
  /**
   * アセットの一意のID
   */
  id?: number;

  /**
   * ファイルの絶対パス
   */
  path: string;

  /**
   * ファイル名（拡張子を含む）
   */
  name: string;

  /**
   * ファイルの種類（'image' または 'svg'）
   */
  type: 'image' | 'svg';

  /**
   * ファイルの拡張子（ドットを含む、例: '.png'）
   */
  extension: string;

  /**
   * ファイルが存在するディレクトリのパス
   */
  directory: string;

  /**
   * ディレクトリ名（表示用）
   */
  directoryName: string;

  /**
   * Webview用のURI（画像表示用）
   */
  webviewUri?: string;
}

/**
 * Webviewとの通信に使用するメッセージの型
 */
export interface WebviewMessage {
  /**
   * メッセージの種類
   */
  type: 'assets' | 'error' | 'refresh' | 'openFile';

  /**
   * メッセージのデータ
   */
  data: AssetFile[] | string | null;
}
