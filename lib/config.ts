/**
 * サイト全体の設定を一元管理するファイル。
 * 新規プロジェクトを立ち上げたら、まずここを編集する。
 *
 * すべての値は文字列リテラル/真偽値のみ。
 * 環境変数に切り出したくなった場合は、process.env を経由する形に置き換え可能。
 */

/** サイト名(metadata, Footer, Header で使用) */
export const SITE_NAME = "{Your Site Name}";

/** サイトの一行説明(SEO description, OGP description で使用) */
export const SITE_DESCRIPTION =
  "{あなたのサイトを一言で表す文章をここに}";

/** Footer 右下に出る一言タグライン(英大文字で短めに) */
export const SITE_TAGLINE = "CRAFTED WITH CARE";

/** ブラウザタブに表示されるタイトル(SITE_NAME + サブタイトル) */
export const SITE_TITLE = `${SITE_NAME} — {サブタイトル}`;

/**
 * チャットボットを表示するかどうか。
 * false にすると Chatbot コンポーネントが描画されません。
 * チャットボット不要のサイトに転用する時は false にしてください。
 */
export const ENABLE_CHATBOT = true;

/**
 * ブログ機能を表示するかどうか。
 * false にすると Header の BLOG リンク・トップの BlogTeaser・/blog ページ全体が消えます。
 * (false でもファイル自体は残るので、後で true に戻せばすぐ復活)
 */
export const ENABLE_BLOG = true;
