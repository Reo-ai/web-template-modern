import type { Metadata } from "next";
import ProposalGenerator from "@/components/ProposalGenerator";
import { SITE_NAME } from "@/lib/config";

export const metadata: Metadata = {
  title: `提案資料自動生成 | ${SITE_NAME}`,
  description:
    "アポイントの内容を入力するだけで、Claude AI がクライアントに合わせた提案書を自動生成します。",
};

export default function ProposalPage() {
  return <ProposalGenerator />;
}
