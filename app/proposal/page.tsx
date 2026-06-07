import type { Metadata } from "next";
import ProposalGenerator from "@/components/ProposalGenerator";

export const metadata: Metadata = {
  title: "提案資料ジェネレーター",
  description: "アポイントの内容をもとに、AIが提案資料を自動生成します。",
};

export default function ProposalPage() {
  return <ProposalGenerator />;
}
