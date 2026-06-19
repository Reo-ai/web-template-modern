import type { Metadata } from "next";
import ProposalGenerator from "@/components/ProposalGenerator";
import { SITE_NAME } from "@/lib/config";

export const metadata: Metadata = {
  title: `提案書自動生成 | ${SITE_NAME}`,
  description: "アポイント内容を入力するだけで、AIが提案書を自動生成します。",
};

export default function ProposalPage() {
  return <ProposalGenerator />;
}
