"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { Printer, RotateCcw, CheckCircle, ArrowRight } from "lucide-react";
import { AppointmentData, GeneratedProposal } from "@/lib/proposal";
import { COURSES } from "@/lib/courses";
import { WORKS } from "@/lib/works";
import { SITE_NAME } from "@/lib/config";

type Props = {
  appointmentData: AppointmentData;
  proposal: GeneratedProposal;
  onReset: () => void;
};

export default function ProposalDisplay({ appointmentData, proposal, onReset }: Props) {
  const printRef = useRef<HTMLDivElement>(null);
  const recommendedCourse = COURSES[proposal.recommendedPlanIndex] ?? COURSES[0];
  const displayWorks = WORKS.slice(0, 3);
  const today = new Date().toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      {/* 印刷スタイル: 印刷時にボタン類を隠す */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
          .print-page { padding: 0; }
        }
      `}</style>

      {/* 操作ボタン */}
      <div className="no-print mb-8 flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={onReset}
          className="btn-outline flex items-center gap-2 text-sm"
        >
          <RotateCcw className="h-4 w-4" />
          入力に戻る
        </button>
        <button
          onClick={() => window.print()}
          className="btn-invert flex items-center gap-2 text-sm"
        >
          <Printer className="h-4 w-4" />
          印刷 / PDF保存
        </button>
      </div>

      {/* 提案書本体 */}
      <div ref={printRef} className="print-page space-y-6">

        {/* タイトルページ */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl border border-border bg-card p-8 md:p-12"
        >
          <p className="font-display text-xs tracking-widest text-muted mb-6">
            PROPOSAL DOCUMENT
          </p>
          <h1 className="font-serif-jp text-2xl md:text-4xl font-bold leading-tight mb-4">
            {appointmentData.clientName} 様<br />
            <span className="text-pop">ご提案書</span>
          </h1>
          <div className="mt-6 grid gap-1 text-sm text-muted">
            <p>作成日: {today}</p>
            {appointmentData.contactPerson && (
              <p>ご担当者: {appointmentData.contactPerson} 様</p>
            )}
            <p>作成: {SITE_NAME}</p>
          </div>
        </motion.div>

        {/* エグゼクティブサマリー */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl border border-border bg-card p-8"
        >
          <SectionLabel number="01" title="エグゼクティブサマリー" />
          <p className="text-ink/80 leading-relaxed whitespace-pre-line">
            {proposal.executiveSummary}
          </p>
        </motion.section>

        {/* 課題分析 */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl border border-border bg-card p-8"
        >
          <SectionLabel number="02" title="現状・課題の整理" />
          <p className="text-ink/80 leading-relaxed whitespace-pre-line">
            {proposal.challengeAnalysis}
          </p>
        </motion.section>

        {/* 提案内容 */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl border border-border bg-card p-8"
        >
          <SectionLabel number="03" title="ご提案内容" />
          <p className="text-ink/80 leading-relaxed whitespace-pre-line mb-8">
            {proposal.proposedSolution}
          </p>

          {/* おすすめプランカード */}
          <div className="rounded-xl border-2 p-6" style={{ borderColor: recommendedCourse.accent }}>
            <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
              <div>
                <span
                  className="font-display text-xs tracking-widest"
                  style={{ color: recommendedCourse.accent }}
                >
                  RECOMMENDED PLAN
                </span>
                <h3 className="font-serif-jp text-xl font-bold mt-1">
                  {recommendedCourse.name}
                </h3>
                <p className="text-sm text-muted mt-0.5">{recommendedCourse.tagline}</p>
              </div>
              <span
                className="rounded-full px-4 py-1.5 text-sm font-bold text-white"
                style={{ background: recommendedCourse.accent }}
              >
                {recommendedCourse.price}
              </span>
            </div>
            <p className="text-sm text-ink/70 leading-relaxed">
              {recommendedCourse.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted">
              <span className="rounded-full border border-border px-3 py-1">
                {recommendedCourse.format}
              </span>
              <span className="rounded-full border border-border px-3 py-1">
                {recommendedCourse.duration}
              </span>
            </div>
          </div>
        </motion.section>

        {/* 実績 */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl border border-border bg-card p-8"
        >
          <SectionLabel number="04" title="弊社の実績" />
          <div className="grid gap-4 md:grid-cols-3">
            {displayWorks.map((work) => (
              <div
                key={work.id}
                className="rounded-xl border border-border p-5"
              >
                <span
                  className="font-display text-xs tracking-widest"
                  style={{ color: work.accent }}
                >
                  {work.category}
                </span>
                <h4 className="font-serif-jp font-bold mt-2 mb-1">{work.title}</h4>
                <p className="text-xs text-muted leading-relaxed">{work.description}</p>
                <p className="text-xs text-muted mt-2">{work.year}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* 次のステップ */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl border border-border bg-card p-8"
        >
          <SectionLabel number="05" title="次のステップ" />
          <ol className="space-y-3">
            {proposal.nextSteps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-bold text-white">
                  {i + 1}
                </span>
                <span className="text-ink/80 leading-relaxed pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </motion.section>

        {/* クロージング */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl border-2 border-ink bg-ink p-8 text-white"
        >
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="h-5 w-5 text-pop" />
            <span className="font-display text-xs tracking-widest text-white/60">
              CLOSING MESSAGE
            </span>
          </div>
          <p className="text-lg leading-relaxed font-serif-jp">
            {proposal.closingMessage}
          </p>
          <div className="mt-6 flex items-center gap-2 text-sm text-white/60">
            <ArrowRight className="h-4 w-4" />
            <span>{SITE_NAME}</span>
          </div>
        </motion.section>
      </div>
    </>
  );
}

function SectionLabel({ number, title }: { number: string; title: string }) {
  return (
    <div className="mb-5">
      <span className="font-display text-xs tracking-widest text-muted">{number}</span>
      <h2 className="font-serif-jp text-xl font-bold mt-1">{title}</h2>
      <div className="mt-3 h-px w-12 bg-ink" />
    </div>
  );
}
