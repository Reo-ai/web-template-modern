"use client";

import { motion } from "framer-motion";
import SectionHeading from "./SectionHeading";
import { COURSES } from "@/lib/courses";

/**
 * サービス / プラン紹介セクション。
 * カード型レイアウト + ホバーで色反転。
 *
 * 【編集ポイント】
 * - SECTION_TITLE / SECTION_DESCRIPTION : セクション見出しコピー
 * - LABEL_SELF / LABEL_GROUP : 右上の小ラベル分岐(任意で変更)
 * - COURSES データそのものは lib/courses.ts を編集
 */

const SECTION_TITLE = "{あなたに合った、ぴったり一つを。}";
const SECTION_DESCRIPTION =
  "{セクションのリード文。提供スタイルや選び方の指針を1〜2行で。}";

const CTA_LABEL = "このプランの相談へ →";
const PRICE_DISCLAIMER = "※ 表示価格は仮のサンプルです。確定後に更新します。";

/** カード右上の小ラベルを duration の文言で振り分け */
const LABEL_SELF = "SELF";
const LABEL_DEFAULT = "1on1";
const SELF_HINT_WORD = "教材"; // duration に含まれていれば SELF と表示

export default function Courses() {
  return (
    <section
      id="courses"
      className="relative w-full border-t border-border bg-card px-5 py-24 md:px-10 md:py-32"
    >
      <SectionHeading
        number="003"
        label="SERVICES"
        title={SECTION_TITLE}
        description={SECTION_DESCRIPTION}
      />

      <div className="grid gap-6 md:grid-cols-2">
        {COURSES.map((course, i) => (
          <motion.article
            key={course.number}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{
              duration: 0.7,
              delay: i * 0.08,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-base p-7 transition-all duration-300 hover:shadow-[0_24px_60px_-30px_rgba(0,0,0,0.25)] md:p-9"
          >
            {/* 番号 */}
            <div className="flex items-start justify-between">
              <span
                className="font-display text-xs tracking-[0.25em]"
                style={{ color: course.accent }}
              >
                #{course.number}
              </span>
              <span className="rounded-full border border-border px-3 py-1 text-[10px] tracking-widest text-muted">
                {course.duration.includes(SELF_HINT_WORD)
                  ? LABEL_SELF
                  : LABEL_DEFAULT}
              </span>
            </div>

            {/* タイトル + キャッチ */}
            <h3 className="mt-6 font-serif-jp text-2xl font-bold leading-tight md:text-3xl">
              {course.name}
            </h3>
            <p
              className="mt-3 font-serif-jp text-sm"
              style={{ color: course.accent }}
            >
              {course.tagline}
            </p>

            {/* 説明 */}
            <p className="mt-5 text-sm leading-relaxed text-ink/75">
              {course.description}
            </p>

            {/* メタ情報 */}
            <dl className="mt-7 space-y-2 border-t border-border pt-5 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="font-display text-[10px] tracking-widest text-muted">
                  FORMAT
                </dt>
                <dd className="text-right text-ink/85">{course.format}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="font-display text-[10px] tracking-widest text-muted">
                  DURATION
                </dt>
                <dd className="text-right text-ink/85">{course.duration}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="font-display text-[10px] tracking-widest text-muted">
                  PRICE
                </dt>
                <dd className="text-right font-bold text-ink">
                  {course.price}
                </dd>
              </div>
            </dl>

            {/* CTA */}
            <a
              href="#contact"
              className="mt-7 inline-flex items-center justify-center gap-2 rounded-full border border-ink px-5 py-3 text-sm transition-all group-hover:bg-ink group-hover:text-base"
            >
              {CTA_LABEL}
            </a>
          </motion.article>
        ))}
      </div>

      <p className="mt-10 text-center text-xs text-muted">{PRICE_DISCLAIMER}</p>
    </section>
  );
}
