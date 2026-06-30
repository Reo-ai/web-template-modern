import type { Metadata } from "next"
import ProposalGenerator from "@/components/ProposalGenerator"
import { SITE_NAME } from "@/lib/config"

export const metadata: Metadata = {
  title: `提案資料生成 | ${SITE_NAME}`,
  description: "アポイントの内容をもとにAIが提案書を自動生成します",
  robots: { index: false, follow: false },
}

/** 提案資料自動生成ページ */
export default function ProposalPage() {
  return (
    <main className="min-h-screen bg-base pt-20">
      <ProposalGenerator />
    </main>
  )
}
