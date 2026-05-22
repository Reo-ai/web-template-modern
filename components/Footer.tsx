import { SITE_NAME, SITE_TAGLINE } from "@/lib/config";

/**
 * フッター(テンプレート版)。
 *
 * 【編集ポイント】
 * - FOOTER_HEADING : 大見出しコピー(改行は \n で)
 * - SNS_LINKS : ソーシャル一覧(不要なものは削除、必要なら追加)
 * - SITE_LINKS : サイト内アンカー
 * - サイト名・コピーライト末尾は lib/config.ts から自動取得
 */

const FOOTER_HEADING = "{あなたとの仕事を、\nここから始めましょう。}";

const SNS_LINKS = [
  { href: "https://x.com/", label: "X" },
  { href: "https://www.youtube.com/", label: "YOUTUBE" },
  { href: "https://www.instagram.com/", label: "INSTAGRAM" },
];

const SITE_LINKS = [
  { href: "#about", label: "About" },
  { href: "#courses", label: "Services" },
  { href: "#blog", label: "Blog" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-base">
      <div className="mx-auto max-w-[1400px] px-5 py-16 md:px-10 md:py-24">
        {/* 大きな見出し */}
        <h2 className="whitespace-pre-line font-serif-jp text-4xl font-bold leading-tight tracking-tight md:text-6xl">
          {FOOTER_HEADING}
        </h2>

        <div className="mt-12 grid gap-10 border-t border-border pt-10 md:grid-cols-3">
          <div>
            <p className="font-display text-xs tracking-widest text-muted">
              CONTACT
            </p>
            <a
              href="#contact"
              className="mt-3 inline-block font-serif-jp text-2xl font-bold transition-colors hover:text-pop"
            >
              お問い合わせ →
            </a>
          </div>

          <div>
            <p className="font-display text-xs tracking-widest text-muted">
              FOLLOW
            </p>
            <ul className="mt-3 space-y-2">
              {SNS_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-display text-sm tracking-wider transition-colors hover:text-pop"
                  >
                    {link.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-display text-xs tracking-widest text-muted">
              SITE
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {SITE_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="transition-colors hover:text-pop"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 text-xs text-muted md:flex-row md:items-center">
          <p className="font-display tracking-widest">
            © {new Date().getFullYear()} {SITE_NAME} — ALL RIGHTS RESERVED
          </p>
          <p className="font-display tracking-widest">{SITE_TAGLINE}</p>
        </div>
      </div>
    </footer>
  );
}
