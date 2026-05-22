"use client";

import { motion } from "framer-motion";
import SectionHeading from "./SectionHeading";

/**
 * About セクション(テンプレート版)。
 *
 * 【編集ポイント】
 * - ABOUT_TITLE : セクション大見出し
 * - ABOUT_ROLE_LABEL : プロフィール下のロール表記(例: DESIGNER · DIRECTOR)
 * - BACKGROUND_PARAGRAPHS : 経歴・背景の段落配列
 * - VISION_PARAGRAPHS : 思い・ビジョンの段落配列
 * - TAGS : スキル・ジャンルのタグ
 * - 中央モチーフ(♪ の文字)はジャンルに合わせて変更可
 */

const ABOUT_TITLE = "{あなたの想いを、ここに。}";
const ABOUT_ROLE_LABEL = "ROLE · POSITION";
const ABOUT_PROFILE_GLYPH = "✺"; // ジャンルに合わせて差し替え(例: ♪ / ✎ / ✦ / ◐)

const BACKGROUND_PARAGRAPHS = [
  "{経歴の1段落目。これまでの活動の概要を300〜400字程度で。}",
  "{経歴の2段落目。実績の数字を {太字で} 入れると説得力が出ます。}",
];

const VISION_PARAGRAPHS = [
  "{ビジョンの1段落目。「何を大切にしているか」「どんな姿勢で向き合うか」を語る。}",
  "{ビジョンの2段落目。お客さん・受講生に提供したい価値を、自分の言葉で。}",
];

const TAGS = ["#タグ1", "#タグ2", "#タグ3", "#タグ4", "#タグ5"];

export default function About() {
  return (
    <section
      id="about"
      className="relative w-full px-5 py-24 md:px-10 md:py-32"
    >
      <SectionHeading number="002" label="ABOUT" title={ABOUT_TITLE} />

      <div className="grid gap-12 md:grid-cols-[1fr_1.4fr] md:gap-20">
        {/* 左: プロフィール画像エリア(仮プレースホルダー) */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div className="aspect-[4/5] w-full overflow-hidden rounded-3xl bg-gradient-to-br from-pop/30 via-base to-deep/20 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.15)]">
            <div className="flex h-full items-center justify-center">
              <span className="font-serif-jp text-7xl text-ink/20">
                {ABOUT_PROFILE_GLYPH}
              </span>
            </div>
          </div>
          <div className="absolute -bottom-3 -right-3 rounded-full border border-ink bg-base px-4 py-2 font-display text-[10px] tracking-widest">
            {ABOUT_ROLE_LABEL}
          </div>
        </motion.div>

        {/* 右: 経歴・思い */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-10"
        >
          {/* 経歴・背景 */}
          <div>
            <p className="font-display text-xs tracking-widest text-pop">
              BACKGROUND — 経歴・背景
            </p>
            <div className="mt-4 space-y-5 text-base leading-relaxed text-ink/85 md:text-lg">
              {BACKGROUND_PARAGRAPHS.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>

          {/* 思い・ビジョン */}
          <div>
            <p className="font-display text-xs tracking-widest text-deep">
              VISION — 思い・ビジョン
            </p>
            <div className="mt-4 space-y-5 text-base leading-relaxed text-ink/85 md:text-lg">
              {VISION_PARAGRAPHS.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>

          {/* 簡易タグ */}
          <div className="flex flex-wrap gap-2 pt-2">
            {TAGS.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border bg-card px-3 py-1 text-xs text-ink/70"
              >
                {tag}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
