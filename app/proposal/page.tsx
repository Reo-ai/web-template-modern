import type { Metadata } from "next";
import ProposalGenerator from "@/components/ProposalGenerator";
import { SITE_NAME } from "@/lib/config";

export const metadata: Metadata = {
  title: `提案資料ジェネレーター | ${SITE_NAME}`,
  description: "アポイントの内容を入力するだけで、AI が提案資料を自動生成します。",
};

export default function ProposalPage() {
  return <ProposalGenerator />;
}
