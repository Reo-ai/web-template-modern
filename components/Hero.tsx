"use client";

import { motion } from "framer-motion";

/**
 * Hero セクション(テンプレート版)。
 *
 * 【編集ポイント】
 * - HERO_LINES : メインコピー(2行構成。2行目の一部に pop カラーが効きます)
 * - HERO_ACCENT_WORD : pop カラーで強調したい単語(2行目に含まれている必要あり)
 * - HERO_LEAD : リード文
 * - HERO_CTA_PRIMARY / SECONDARY : CTA ボタン(href とラベル)
 *
 * 装飾モチーフ(FloatingShape)は SVG なので、業種に合わせて
 * 音符・カメラ・ペン・ハサミ など差し替えると個性が出ます。
 */

const HERO_LINES = ["{あなたの仕事を、}", "{ここから届ける。}"];
/** 2行目の中で pop カラーで強調する単語 */
const HERO_ACCENT_WORD = "届ける";
const HERO_LEAD =
  "{サイトの一言紹介をここに}。\nターゲットに「これは自分のための場所だ」と思わせる、短く力強い文章を入れてください。";
const HERO_CTA_PRIMARY = { href: "#courses", label: "サービスを見る" };
const HERO_CTA_SECONDARY = { href: "#contact", label: "お問い合わせ" };

export default function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-screen w-full items-end overflow-hidden px-5 pb-16 pt-32 md:px-10 md:pb-24 md:pt-40"
    >
      {/* 背景の浮遊する装飾モチーフ(SVG) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <FloatingShape
          className="absolute left-[10%] top-[22%] text-pop animate-float"
          style={{ animationDelay: "0s" }}
        />
        <FloatingShape
          className="absolute right-[12%] top-[18%] text-deep animate-float"
          style={{ animationDelay: "1.2s" }}
        />
        <FloatingShape
          className="absolute left-[28%] bottom-[20%] text-ink/15 animate-float"
          style={{ animationDelay: "2.1s" }}
        />
        <FloatingShape
          className="absolute right-[26%] bottom-[35%] text-pop/40 animate-float"
          style={{ animationDelay: "3.4s" }}
        />
      </div>

      {/* ラベル(セクション番号) */}
      <motion.span
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="absolute left-5 top-28 font-display text-xs tracking-[0.25em] text-muted md:left-10 md:top-36"
      >
        #001 — INTRO
      </motion.span>

      <div className="relative z-10 w-full">
        <motion.h1
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.12 } },
          }}
          className="font-serif-jp text-5xl font-bold leading-[1.05] tracking-[-0.02em] md:text-[112px] md:leading-[0.95]"
        >
          {HERO_LINES.map((line, i) => (
            <motion.span
              key={line}
              variants={{
                hidden: { opacity: 0, y: 40 },
                show: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="block"
            >
              {/* 2行目に強調ワードが含まれていれば pop カラーでハイライト */}
              {i === HERO_LINES.length - 1 && line.includes(HERO_ACCENT_WORD) ? (
                <>
                  {line.split(HERO_ACCENT_WORD)[0]}
                  <span className="text-pop">{HERO_ACCENT_WORD}</span>
                  {line.split(HERO_ACCENT_WORD)[1]}
                </>
              ) : (
                line
              )}
            </motion.span>
          ))}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-10 grid gap-8 md:grid-cols-2"
        >
          <p className="max-w-md whitespace-pre-line text-base leading-relaxed text-ink/80 md:text-lg">
            {HERO_LEAD}
          </p>

          <div className="flex flex-wrap items-end gap-4 md:justify-end">
            <a href={HERO_CTA_PRIMARY.href} className="btn-invert text-sm">
              {HERO_CTA_PRIMARY.label}
            </a>
            <a href={HERO_CTA_SECONDARY.href} className="btn-outline text-sm">
              {HERO_CTA_SECONDARY.label}
            </a>
          </div>
        </motion.div>
      </div>

      {/* 下部のスクロールヒント */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 font-display text-[10px] tracking-[0.3em] text-muted"
      >
        SCROLL ↓
      </motion.div>
    </section>
  );
}

/**
 * 装飾用の抽象モチーフ SVG。
 * 業種に応じて差し替えてください(例: 音符・カメラ・ペン・カップなど)。
 */
function FloatingShape({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      width="56"
      height="56"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      {/* 抽象的な「丸+線」のシンプルな図形 */}
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
