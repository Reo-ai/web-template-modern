import type { Metadata } from "next";
import ProposalGenerator from "@/components/ProposalGenerator";

export const metadata: Metadata = {
  title: "提案資料ジェネレーター",
  description: "アポイントの内容をもとに、AIが提案資料を自動で作成します。",
};

/**
 * 提案資料自動生成ページ。
 * アポイント情報を入力すると Claude AI が構造化された提案書を生成する。
 */
export default function ProposalPage() {
  return (
    <div className="min-h-screen w-full px-5 pb-32 pt-40 md:px-10">
      {/* ページヘッダー */}
      <div className="mx-auto max-w-2xl mb-16">
        <span className="font-display text-xs tracking-[0.25em] text-muted">
          AI PROPOSAL GENERATOR
        </span>
        <h1 className="mt-4 font-serif-jp text-4xl font-bold leading-tight tracking-tight md:text-5xl">
          提案資料を、
          <br />
          <span className="text-pop">自動で生成する。</span>
        </h1>
        <p className="mt-6 text-base leading-relaxed text-ink/70">
          アポイントで得た情報を入力するだけで、AIが構造化された提案資料を自動生成します。
          <br />
          生成後はブラウザの印刷機能でPDF保存も可能です。
        </p>
      </div>

      {/* ジェネレーター本体 */}
      <ProposalGenerator />
    </div>
  );
}
