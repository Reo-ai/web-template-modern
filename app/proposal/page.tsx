import { Metadata } from "next";
import ProposalGenerator from "@/components/ProposalGenerator";
import { SITE_NAME } from "@/lib/config";

export const metadata: Metadata = {
  title: `提案資料自動生成 | ${SITE_NAME}`,
  description:
    "アポイントの内容を入力するだけで、AIが提案資料を自動生成します。",
};

/**
 * 提案資料自動生成ページ。
 * ProposalGenerator クライアントコンポーネントが入力〜生成〜表示を一気通貫で担う。
 */
export default function ProposalPage() {
  return (
    <div className="min-h-screen pt-20">
      {/* ページヒーロー */}
      <div className="border-b border-border bg-base px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-4xl">
          <p className="font-display text-xs tracking-[0.25em] text-muted">
            AI-POWERED
          </p>
          <h1 className="mt-4 font-serif-jp text-4xl font-bold tracking-tight md:text-6xl">
            提案資料
            <br />
            自動生成システム
          </h1>
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-ink/70 md:text-base">
            アポイントで聞いた内容を入力するだけ。
            <br />
            AIが課題を分析し、カスタマイズされた提案書を自動で作成します。
          </p>
        </div>
      </div>

      {/* 入力フォーム + 生成結果 */}
      <ProposalGenerator />
    </div>
  );
}
