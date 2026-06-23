"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, FileText } from "lucide-react";
import ProposalForm from "@/components/ProposalForm";
import ProposalDisplay from "@/components/ProposalDisplay";
import { AppointmentData, GeneratedProposal } from "@/lib/proposal";
import { SITE_NAME } from "@/lib/config";

export default function ProposalPage() {
  const [result, setResult] = useState<{
    appointmentData: AppointmentData;
    proposal: GeneratedProposal;
  } | null>(null);

  const handleGenerated = (data: AppointmentData, proposal: GeneratedProposal) => {
    setResult({ appointmentData: data, proposal });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReset = () => {
    setResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-base">
      {/* ヘッダー(印刷時に隠れる) */}
      <header className="no-print sticky top-0 z-40 border-b border-border bg-base/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 md:px-10">
          <Link
            href="/"
            className="flex items-center gap-2 font-display text-xs tracking-widest text-muted transition-colors hover:text-ink"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {SITE_NAME}
          </Link>
          <div className="flex items-center gap-2 text-ink">
            <FileText className="h-4 w-4" />
            <span className="font-display text-xs tracking-widest">提案書自動生成</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-12 md:px-10 md:py-16">

        {/* ページタイトル */}
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="heading"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="mb-10"
            >
              <p className="font-display text-xs tracking-widest text-muted mb-3">
                PROPOSAL GENERATOR
              </p>
              <h1 className="font-serif-jp text-2xl md:text-4xl font-bold">
                アポイント情報から<br className="md:hidden" />
                <span className="text-pop">提案書を自動生成</span>
              </h1>
              <p className="mt-4 text-sm text-muted leading-relaxed max-w-xl">
                アポイントで聞き取った情報を入力すると、Claude AI が
                顧客の課題・目標に合わせた提案書を自動で作成します。
                生成後はそのまま印刷・PDF保存が可能です。
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="result-heading"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="mb-10"
            >
              <p className="font-display text-xs tracking-widest text-muted mb-2">
                PROPOSAL GENERATED
              </p>
              <h1 className="font-serif-jp text-2xl md:text-3xl font-bold">
                提案書が完成しました
              </h1>
            </motion.div>
          )}
        </AnimatePresence>

        {/* フォーム / 提案書表示 */}
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ProposalForm onGenerated={handleGenerated} />
            </motion.div>
          ) : (
            <motion.div
              key="proposal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <ProposalDisplay
                appointmentData={result.appointmentData}
                proposal={result.proposal}
                onReset={handleReset}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
