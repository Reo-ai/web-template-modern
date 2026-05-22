"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import SectionHeading from "./SectionHeading";
import { POSTS } from "@/lib/blog";

/**
 * ブログ・お知らせの最新3件をトップに表示するティーザー。
 *
 * 【編集ポイント】
 * - SECTION_TITLE / SECTION_DESCRIPTION : 見出しコピー
 * - 記事データは lib/blog.ts を編集
 * - 不要な場合は lib/config.ts の ENABLE_BLOG を false に
 *   (ただしこのコンポーネント自体の表示制御は app/page.tsx 側で行う)
 */

const SECTION_TITLE = "{思考のノート、お知らせ。}";
const SECTION_DESCRIPTION = "{ブログのリード文。}";

export default function BlogTeaser() {
  return (
    <section
      id="blog"
      className="relative w-full px-5 py-24 md:px-10 md:py-32"
    >
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeading
          number="006"
          label="BLOG / NEWS"
          title={SECTION_TITLE}
          description={SECTION_DESCRIPTION}
        />
        <Link
          href="/blog"
          className="font-display text-xs tracking-widest text-ink transition-colors hover:text-pop"
        >
          すべての記事 →
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {POSTS.slice(0, 3).map((post, i) => (
          <motion.article
            key={post.slug}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{
              duration: 0.6,
              delay: i * 0.08,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="group flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-[0_20px_60px_-30px_rgba(0,0,0,0.2)] md:p-7"
          >
            <div className="flex items-center gap-3 font-display text-[10px] tracking-widest text-muted">
              <time dateTime={post.date}>{post.date.replace(/-/g, ".")}</time>
              <span className="h-px w-6 bg-muted" />
              <span>{post.category}</span>
            </div>

            <h3 className="font-serif-jp text-lg font-bold leading-snug transition-colors group-hover:text-pop md:text-xl">
              {post.title}
            </h3>

            <p className="text-sm leading-relaxed text-ink/70">
              {post.excerpt}
            </p>

            <Link
              href={`/blog/${post.slug}`}
              className="mt-auto inline-flex items-center gap-1 font-display text-xs tracking-widest transition-colors group-hover:text-pop"
            >
              READ MORE →
            </Link>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
