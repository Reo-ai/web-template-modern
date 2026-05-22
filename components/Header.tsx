"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ENABLE_BLOG, SITE_NAME } from "@/lib/config";

/**
 * 固定型のフローティングヘッダー。
 *
 * 【編集ポイント】
 * - SITE_NAME : lib/config.ts のサイト名を表示
 * - NAV_ITEMS : ナビゲーション一覧(セクションを増減した場合はここを編集)
 * - BLOG リンクは ENABLE_BLOG(lib/config.ts)で自動 ON/OFF
 */

const NAV_BASE = [
  { href: "#about", label: "ABOUT" },
  { href: "#courses", label: "SERVICES" },
  { href: "#works", label: "WORKS" },
  { href: "#faq", label: "FAQ" },
];

const NAV_BLOG = { href: "#blog", label: "BLOG" };
const NAV_CONTACT = { href: "#contact", label: "CONTACT" };

const NAV_ITEMS = ENABLE_BLOG
  ? [...NAV_BASE, NAV_BLOG, NAV_CONTACT]
  : [...NAV_BASE, NAV_CONTACT];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // スクロール量で背景の不透明度を切り替え
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-base/85 backdrop-blur-md border-b border-border"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-4 md:px-10">
          {/* ロゴ */}
          <Link
            href="/"
            className="font-serif-jp text-lg font-bold tracking-tight md:text-xl"
            aria-label={`${SITE_NAME} トップへ`}
          >
            {SITE_NAME}
          </Link>

          {/* PC ナビゲーション */}
          <nav className="hidden gap-7 md:flex">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="font-display text-xs tracking-widest text-ink/80 transition-colors hover:text-pop"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* モバイル: メニューボタン */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-ink md:hidden"
            aria-label="メニューを開く"
            aria-expanded={menuOpen}
          >
            <div className="flex flex-col gap-1.5">
              <span
                className={`block h-px w-5 bg-ink transition-transform ${
                  menuOpen ? "translate-y-[7px] rotate-45" : ""
                }`}
              />
              <span
                className={`block h-px w-5 bg-ink transition-opacity ${
                  menuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block h-px w-5 bg-ink transition-transform ${
                  menuOpen ? "-translate-y-[7px] -rotate-45" : ""
                }`}
              />
            </div>
          </button>
        </div>
      </header>

      {/* モバイルフルスクリーンメニュー */}
      <div
        className={`fixed inset-0 z-30 bg-base transition-opacity duration-500 md:hidden ${
          menuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <nav className="flex h-full flex-col items-start justify-center gap-8 px-10">
          {NAV_ITEMS.map((item, i) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="font-serif-jp text-3xl font-bold transition-transform hover:translate-x-2"
              style={{ transitionDelay: `${i * 40}ms` }}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </>
  );
}
