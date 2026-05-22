import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, POSTS } from "../../../lib/blog";
import { SITE_NAME } from "../../../lib/config";

/** 静的生成: 全記事を事前ビルド */
export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "記事が見つかりません" };
  return {
    title: `${post.title} — ${SITE_NAME}`,
    description: post.excerpt,
  };
}

/**
 * ブログ記事詳細ページ。
 * body は段落区切り(空行)で paragraph に分割表示する。
 *
 * 【編集ポイント】
 * - フッターの CTA 文言(POST_FOOTER_*) を業種に合わせて差し替え
 */

const POST_FOOTER_TEXT =
  "最後まで読んでいただきありがとうございました。\nご相談はお気軽にどうぞ。";
const POST_FOOTER_PRIMARY = { href: "/#contact", label: "お問い合わせへ →" };
const POST_FOOTER_SECONDARY = { href: "/blog", label: "他の記事を見る" };

export default async function BlogDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  // 空行で段落分割
  const paragraphs = post.body.split(/\n\s*\n/).map((p) => p.trim());

  return (
    <article className="relative w-full px-5 py-32 md:px-10 md:py-40">
      <div className="mx-auto max-w-2xl">
        {/* パンくず */}
        <div className="mb-10">
          <Link
            href="/blog"
            className="font-display text-[10px] tracking-widest text-muted transition-colors hover:text-ink"
          >
            ← BACK TO BLOG
          </Link>
        </div>

        {/* タイトル領域 */}
        <header className="mb-12">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-display text-[11px] tracking-widest text-muted">
              {post.date}
            </span>
            <span className="rounded-full border border-border bg-card px-2.5 py-0.5 text-[10px] text-ink/70">
              {post.category}
            </span>
          </div>
          <h1 className="mt-4 font-serif-jp text-3xl font-bold leading-snug tracking-tight md:text-5xl">
            {post.title}
          </h1>
          <p className="mt-6 text-base leading-relaxed text-ink/70 md:text-lg">
            {post.excerpt}
          </p>
        </header>

        {/* 本文 */}
        <div className="space-y-6 text-base leading-relaxed text-ink/85 md:text-lg">
          {paragraphs.map((p, i) => (
            <p key={i} className="whitespace-pre-wrap">
              {p}
            </p>
          ))}
        </div>

        {/* フッター */}
        <footer className="mt-16 border-t border-border pt-10">
          <p className="whitespace-pre-line font-serif-jp text-sm text-ink/70">
            {POST_FOOTER_TEXT}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={POST_FOOTER_PRIMARY.href} className="btn-invert text-sm">
              {POST_FOOTER_PRIMARY.label}
            </Link>
            <Link href={POST_FOOTER_SECONDARY.href} className="btn-outline text-sm">
              {POST_FOOTER_SECONDARY.label}
            </Link>
          </div>
        </footer>
      </div>
    </article>
  );
}
