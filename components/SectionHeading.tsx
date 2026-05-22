"use client";

import { motion } from "framer-motion";

/**
 * セクション見出しの共通ビルディングブロック。
 * 番号 + 英ラベル + 日本語サブタイトルの3点セットで統一感を出す。
 */
type Props = {
  /** "01" のようなセクション番号 */
  number: string;
  /** 英語のセクション名(短く) */
  label: string;
  /** 日本語の見出し(大きく表示) */
  title: string;
  /** 補足説明 */
  description?: string;
};

export default function SectionHeading({
  number,
  label,
  title,
  description,
}: Props) {
  return (
    <div className="mb-12 md:mb-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center gap-3 font-display text-xs tracking-[0.25em] text-muted">
          <span>#{number}</span>
          <span className="h-px w-8 bg-muted" />
          <span>{label}</span>
        </div>
        <h2 className="mt-4 font-serif-jp text-3xl font-bold leading-tight tracking-tight md:text-5xl">
          {title}
        </h2>
        {description && (
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-ink/75 md:text-base">
            {description}
          </p>
        )}
      </motion.div>
    </div>
  );
}
