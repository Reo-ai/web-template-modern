"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { ProposalContent } from "@/app/api/generate-proposal/route";

export default function ProposalResultPage() {
  const router = useRouter();
  const [proposal, setProposal] = useState<ProposalContent | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("proposalResult");
    if (!raw) {
      router.replace("/proposal");
      return;
    }
    setProposal(JSON.parse(raw));
  }, [router]);

  if (!proposal) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-3 text-muted">
          <Spinner />
          <span className="font-display text-xs tracking-widest">LOADING...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 操作バー（印刷時は非表示） */}
      <div className="print:hidden sticky top-16 z-30 border-b border-border bg-base/90 backdrop-blur-md px-5 py-3 md:px-10">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => router.push("/proposal")}
            className="btn-outline text-xs py-2 px-4"
          >
            ← 新しく生成
          </button>
          <div className="flex items-center gap-3">
            <span className="font-display text-[10px] tracking-widest text-muted hidden sm:inline">
              PROPOSAL READY
            </span>
            <button
              type="button"
              onClick={() => window.print()}
              className="btn-invert text-xs py-2 px-5"
            >
              印刷 / PDF保存
            </button>
          </div>
        </div>
      </div>

      {/* 提案書本体 */}
      <div className="px-5 py-12 md:px-10 print:px-0 print:py-0">
        <motion.article
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-4xl"
        >
          {/* 表紙 */}
          <CoverPage proposal={proposal} />

          {/* 本文セクション */}
          <div className="mt-12 space-y-10 print:mt-8 print:space-y-8">
            <Section num="01" label="EXECUTIVE SUMMARY" title="エグゼクティブサマリー">
              <p className="leading-[1.9] text-ink/80">{proposal.executiveSummary}</p>
            </Section>

            <Section num="02" label="CHALLENGE ANALYSIS" title="課題分析">
              <div className="space-y-4">
                {proposal.challengeAnalysis.map((item, i) => (
                  <ChallengeCard key={i} index={i + 1} title={item.title} content={item.content} />
                ))}
              </div>
            </Section>

            <Section num="03" label="PROPOSED SOLUTION" title="提案ソリューション">
              <p className="leading-[1.9] text-ink/80">{proposal.proposedSolution.overview}</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {proposal.proposedSolution.features.map((f, i) => (
                  <FeatureCard key={i} name={f.name} description={f.description} />
                ))}
              </div>
            </Section>

            <Section num="04" label="IMPLEMENTATION SCHEDULE" title="実施スケジュール">
              <div className="space-y-4">
                {proposal.implementationSchedule.map((phase, i) => (
                  <PhaseCard key={i} index={i + 1} phase={phase} total={proposal.implementationSchedule.length} />
                ))}
              </div>
            </Section>

            <Section num="05" label="INVESTMENT PLAN" title="投資計画">
              <div className="overflow-hidden rounded-2xl border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-base">
                      <th className="px-5 py-3 text-left font-display text-[10px] tracking-widest text-muted">
                        ITEM
                      </th>
                      <th className="px-5 py-3 text-left font-display text-[10px] tracking-widest text-muted">
                        DESCRIPTION
                      </th>
                      <th className="px-5 py-3 text-right font-display text-[10px] tracking-widest text-muted">
                        PRICE
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {proposal.investmentPlan.map((row, i) => (
                      <tr
                        key={i}
                        className="border-b border-border last:border-0 transition-colors hover:bg-base/50"
                      >
                        <td className="px-5 py-4 font-medium">{row.item}</td>
                        <td className="px-5 py-4 text-ink/70">{row.description}</td>
                        <td className="px-5 py-4 text-right font-display text-xs tracking-wide">
                          {row.price}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            <Section num="06" label="EXPECTED OUTCOMES" title="期待される成果">
              <ul className="space-y-3">
                {proposal.expectedOutcomes.map((outcome, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pop/10 text-pop">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span className="text-sm leading-relaxed text-ink/80">{outcome}</span>
                  </li>
                ))}
              </ul>
            </Section>

            <Section num="07" label="NEXT STEPS" title="次のステップ">
              <div className="space-y-3">
                {proposal.nextSteps.map((step, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="font-display text-xs tracking-widest text-pop shrink-0">
                      STEP {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-sm text-ink/80">{step}</span>
                  </div>
                ))}
              </div>
            </Section>

            {/* クロージング */}
            <div className="rounded-3xl border border-border bg-ink px-8 py-10 text-center print:break-inside-avoid">
              <p className="font-display text-xs tracking-widest text-base/60">CLOSING</p>
              <p className="mt-4 font-serif-jp text-base leading-[1.9] text-base/90 md:text-lg">
                {proposal.closing}
              </p>
            </div>

            {/* フッター情報 */}
            <div className="flex flex-col items-center gap-2 pb-12 text-center print:pb-4">
              <p className="font-display text-[10px] tracking-widest text-muted">
                GENERATED BY AI PROPOSAL SYSTEM
              </p>
              <p className="text-xs text-muted">作成日: {proposal.generatedAt}</p>
            </div>
          </div>
        </motion.article>
      </div>

      {/* 印刷スタイル */}
      <style jsx global>{`
        @media print {
          @page {
            margin: 16mm 20mm;
            size: A4;
          }
          body {
            font-size: 11pt;
          }
        }
      `}</style>
    </>
  );
}

/* ========== 子コンポーネント ========== */

function CoverPage({ proposal }: { proposal: ProposalContent }) {
  return (
    <div className="rounded-3xl border border-border bg-card px-8 py-12 md:px-14 md:py-16 print:rounded-none print:border-none print:px-0">
      <div className="flex items-start justify-between gap-8 flex-wrap">
        <div>
          <p className="font-display text-[10px] tracking-[0.3em] text-pop">
            PROPOSAL DOCUMENT
          </p>
          <h1 className="mt-4 font-serif-jp text-3xl font-bold leading-tight md:text-4xl max-w-xl">
            {proposal.proposalTitle}
          </h1>
        </div>
        <div className="text-right text-sm text-muted space-y-1">
          <p className="font-display text-[10px] tracking-widest">DATE</p>
          <p>{proposal.generatedAt}</p>
        </div>
      </div>

      <div className="mt-10 h-px bg-border" />

      <div className="mt-8 grid gap-8 sm:grid-cols-2">
        <div>
          <p className="font-display text-[10px] tracking-widest text-muted">TO</p>
          <p className="mt-2 font-serif-jp text-xl font-bold">{proposal.clientCompany}</p>
          <p className="mt-1 text-sm text-ink/70">{proposal.contactName} 様</p>
          {proposal.contactEmail && (
            <p className="mt-0.5 text-xs text-muted">{proposal.contactEmail}</p>
          )}
        </div>
        <div className="sm:text-right">
          <p className="font-display text-[10px] tracking-widest text-muted">
            CONFIDENTIAL
          </p>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            本資料は機密情報を含みます。<br />
            許可なく第三者への開示・転用を禁じます。
          </p>
        </div>
      </div>
    </div>
  );
}

function Section({
  num,
  label,
  title,
  children,
}: {
  num: string;
  label: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="print:break-inside-avoid">
      <div className="mb-6 flex items-baseline gap-4">
        <span className="font-display text-xs tracking-[0.25em] text-pop">{num}</span>
        <div className="flex-1 h-px bg-border" />
        <span className="font-display text-[9px] tracking-widest text-muted">{label}</span>
      </div>
      <h2 className="mb-5 font-serif-jp text-xl font-bold md:text-2xl">{title}</h2>
      {children}
    </div>
  );
}

function ChallengeCard({
  index,
  title,
  content,
}: {
  index: number;
  title: string;
  content: string;
}) {
  return (
    <div className="flex gap-5 rounded-2xl border border-border bg-base p-5">
      <span className="font-display text-2xl font-bold text-pop/30 shrink-0 leading-none mt-0.5">
        {String(index).padStart(2, "0")}
      </span>
      <div>
        <h3 className="font-bold">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-ink/70">{content}</p>
      </div>
    </div>
  );
}

function FeatureCard({
  name,
  description,
}: {
  name: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-base p-5 hover:border-ink/30 transition-colors">
      <div className="mb-2 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-pop shrink-0" />
        <h3 className="text-sm font-bold">{name}</h3>
      </div>
      <p className="text-xs leading-relaxed text-ink/70">{description}</p>
    </div>
  );
}

function PhaseCard({
  index,
  phase,
  total,
}: {
  index: number;
  phase: { phase: string; duration: string; tasks: string[] };
  total: number;
}) {
  return (
    <div className="relative flex gap-5">
      {/* タイムライン縦線 */}
      {index < total && (
        <div className="absolute left-4 top-9 h-full w-px bg-border" />
      )}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-pop bg-base z-10">
        <span className="font-display text-[10px] font-bold text-pop">{index}</span>
      </div>
      <div className="flex-1 rounded-2xl border border-border bg-base p-4 mb-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h3 className="font-bold">{phase.phase}</h3>
          <span className="font-display text-[10px] tracking-widest text-muted border border-border rounded-full px-3 py-1">
            {phase.duration}
          </span>
        </div>
        <ul className="mt-3 space-y-1.5">
          {phase.tasks.map((task, i) => (
            <li key={i} className="flex items-center gap-2 text-xs text-ink/70">
              <span className="h-1 w-1 rounded-full bg-muted shrink-0" />
              {task}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
