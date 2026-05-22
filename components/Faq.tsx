"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import SectionHeading from "./SectionHeading";
import { FAQ_ITEMS, type FaqItem } from "@/lib/chatbot/faq";

/**
 * FAQ セクション。アコーディオン + カテゴリ別グルーピング。
 * データは lib/chatbot/faq.ts と共有 — チャットボットと内容を一致させます。
 *
 * 【編集ポイント】
 * - SECTION_TITLE / SECTION_DESCRIPTION : 見出しコピー
 * - FAQ_ITEMS は lib/chatbot/faq.ts で編集
 */

const SECTION_TITLE = "{よくあるご質問。}";
const SECTION_DESCRIPTION =
  "{お問い合わせ前に確認されやすい内容をまとめました。}";

export default function Faq() {
  // カテゴリ別にまとめる
  const grouped = FAQ_ITEMS.reduce<Record<string, FaqItem[]>>((acc, item) => {
    (acc[item.category] ||= []).push(item);
    return acc;
  }, {});

  return (
    <section
      id="faq"
      className="relative w-full border-t border-border bg-card px-5 py-24 md:px-10 md:py-32"
    >
      <SectionHeading
        number="005"
        label="FAQ"
        title={SECTION_TITLE}
        description={SECTION_DESCRIPTION}
      />

      <div className="grid gap-10 md:grid-cols-[1fr_2fr]">
        {/* 左: カテゴリインデックス(PCのみ) */}
        <div className="hidden md:block">
          <ul className="sticky top-28 space-y-3">
            {Object.keys(grouped).map((cat) => (
              <li
                key={cat}
                className="font-display text-xs tracking-widest text-muted"
              >
                — {cat}
              </li>
            ))}
          </ul>
        </div>

        {/* 右: アコーディオン */}
        <div className="space-y-10">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <h3 className="mb-4 font-display text-xs tracking-widest text-pop md:hidden">
                — {category}
              </h3>
              <h3 className="mb-4 hidden font-serif-jp text-xl font-bold md:block">
                {category}
              </h3>
              <ul className="divide-y divide-border border-t border-border">
                {items.map((item) => (
                  <FaqRow key={item.question} item={item} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqRow({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);

  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start justify-between gap-6 py-5 text-left transition-colors hover:text-pop"
        aria-expanded={open}
      >
        <span className="flex-1 text-sm font-medium md:text-base">
          <span className="mr-3 font-display text-xs text-muted">Q.</span>
          {item.question}
        </span>
        <span
          className={`mt-1 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full border border-ink transition-transform ${
            open ? "rotate-45" : ""
          }`}
          aria-hidden
        >
          <svg width="10" height="10" viewBox="0 0 10 10">
            <path
              d="M5 0v10M0 5h10"
              stroke="currentColor"
              strokeWidth="1.2"
            />
          </svg>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-5 pr-10 text-sm leading-relaxed text-ink/75 md:text-base">
              <span className="mr-3 font-display text-xs text-deep">A.</span>
              {item.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}
