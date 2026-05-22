/**
 * ブログ記事の仮データ。
 *
 * 編集ポイント:
 *   - 1記事 = 1オブジェクト
 *   - body は段落区切り(空行で段落)。
 *   - slug は URL に使用される文字列(半角英数・ハイフンのみ推奨)。
 *
 * 不要なら lib/config.ts の ENABLE_BLOG を false にすると、
 * Header / BlogTeaser / /blog ルートを非表示にできます。
 */

export type BlogPost = {
  slug: string;
  title: string;
  /** 公開日(YYYY-MM-DD) */
  date: string;
  /** カテゴリ */
  category: string;
  /** 抜粋 */
  excerpt: string;
  /** 本文(段落は空行で区切る) */
  body: string;
};

export const POSTS: BlogPost[] = [
  {
    slug: "sample-post-1",
    title: "{記事1のタイトル}",
    date: "2026-04-12",
    category: "{カテゴリ1}",
    excerpt: "{記事1の抜粋(2〜3行)。一覧に表示されます。}",
    body: `{記事1の本文 第1段落。}

{第2段落。空行を入れると段落が分かれます。}

{第3段落。}`,
  },
  {
    slug: "sample-post-2",
    title: "{記事2のタイトル}",
    date: "2026-03-28",
    category: "{カテゴリ2}",
    excerpt: "{記事2の抜粋。}",
    body: `{記事2の本文 第1段落。}

{第2段落。}`,
  },
  {
    slug: "sample-post-3",
    title: "{記事3のタイトル}",
    date: "2026-02-15",
    category: "{カテゴリ3}",
    excerpt: "{記事3の抜粋。}",
    body: `{記事3の本文 第1段落。}

{第2段落。}`,
  },
];

/** スラッグから記事を1件取得 */
export function getPostBySlug(slug: string): BlogPost | undefined {
  return POSTS.find((p) => p.slug === slug);
}
