import { Metadata } from "next";
import ProposalGenerator from "@/components/ProposalGenerator";

export const metadata: Metadata = {
  title: "提案資料ジェネレーター",
  description: "アポイントの内容に応じて、AI が提案書を自動生成します。",
};

export default function ProposalPage() {
  return <ProposalGenerator />;
}
