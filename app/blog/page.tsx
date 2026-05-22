import Link from "next/link";
import { POSTS } from "../../lib/blog";
import { SITE_NAME } from "../../lib/config";

export const metadata = {
  title: `BLOG / NEWS — ${SITE_NAME}`,
  description: "活動の裏側・知見・お知らせをまとめた読みものです。",
};

/**
 * ブログ記事一覧ページ。
 * トップページの BlogTeaser と同じデータソース(lib/blog.ts)を使用。
 *
 * 【編集ポイント】
 * - PAGE_HEADING / PAGE_LEAD : 見出しコピー
 * - 記事データは lib/blog.ts を編集
 */

const PAGE_HEADING = "{思考と仕事の、\n読みもの。}";
const PAGE_LEAD =
  "{ブログのページ説明。普段の発信スタンスや更新頻度などを書くと信頼感が増します。}";

export default function BlogIndex() {
  return (
    <section className="relative w-full px-5 py-32 md:px-10 md:py-40">
      <div className="mx-auto max-w-5xl">
        {/* ページヘッダー */}
        <div className="mb-16">
          <p className="font-display text-xs tracking-widest text-pop">
            #008 — BLOG / NEWS
          </p>
          <h1 className="mt-3 whitespace-pre-line font-serif-jp text-4xl font-bold tracking-tight md:text-6xl">
            {PAGE_HEADING}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink/70 md:text-lg">
            {PAGE_LEAD}
          </p>
        </div>

        {/* 記事一覧 */}
        <ul className="divide-y divide-border border-y border-border">
          {POSTS.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/blog/${p.slug}`}
                className="group flex flex-col gap-3 py-8 transition-colors hover:bg-card md:flex-row md:items-center md:gap-8"
              >
                <div className="flex shrink-0 items-center gap-4 md:w-56">
                  <span className="font-display text-[11px] tracking-widest text-muted">
                    {p.date}
                  </span>
                  <span className="rounded-full border border-border bg-base px-2.5 py-0.5 text-[10px] text-ink/70">
                    {p.category}
                  </span>
                </div>
                <div className="flex-1">
                  <h2 className="font-serif-jp text-lg font-bold transition-colors group-hover:text-pop md:text-xl">
                    {p.title}
                  </h2>
                  <p className="mt-2 text-sm text-ink/65">{p.excerpt}</p>
                </div>
                <span
                  aria-hidden
                  className="hidden font-display text-xs tracking-widest text-muted transition-transform group-hover:translate-x-1 md:inline-block"
                >
                  READ →
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-16 text-center">
          <Link href="/" className="btn-outline text-sm">
            ← TOP に戻る
          </Link>
        </div>
      </div>
    </section>
  );
}
