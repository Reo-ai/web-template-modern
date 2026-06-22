import ProposalGenerator from "@/components/ProposalGenerator";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "提案資料ジェネレーター",
  description:
    "アポイントの内容を入力するだけで、AIが自動で提案書を作成します。",
};

export default function ProposalPage() {
  return <ProposalGenerator />;
}
