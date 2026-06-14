"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SITE_NAME } from "@/lib/config";

/** アポイント入力フォームのデータ型 */
type AppointmentForm = {
  clientName: string;
  companyName: string;
  industry: string;
  appointmentDate: string;
  needs: string;
  budget: string;
  timeline: string;
  notes: string;
};

/** 生成された提案書の型 */
type Proposal = {
  title: string;
  subtitle: string;
  executiveSummary: string;
  clientBackground: {
    currentSituation: string;
    challenges: string[];
  };
  proposedSolution: {
    overview: string;
    recommendedServices: {
      name: string;
      reason: string;
      expectedOutcome: string;
    }[];
  };
  implementationPlan: {
    phase: string;
    title: string;
    duration: string;
    description: string;
  }[];
  investmentSummary: {
    totalEstimate: string;
    breakdown: { item: string; amount: string }[];
    note: string;
  };
  nextSteps: string[];
  closing: string;
};

const EASE = [0.22, 1, 0.36, 1] as const;

export default function ProposalPage() {
  const [form, setForm] = useState<AppointmentForm>({
    clientName: "",
    companyName: "",
    industry: "",
    appointmentDate: "",
    needs: "",
    budget: "",
    timeline: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [error, setError] = useState<string | null>(null);
  const proposalRef = useRef<HTMLDivElement>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.needs.trim()) {
      setError("ニーズ・課題を入力してください");
      return;
    }
    setLoading(true);
    setError(null);
    setProposal(null);

    try {
      const res = await fetch("/api/proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "エラーが発生しました");
      setProposal(data.proposal);
      // 生成後にプレビューまでスクロール
      setTimeout(() => {
        proposalRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => window.print();

  const handleReset = () => {
    setProposal(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-base">
      {/* ヘッダー */}
      <div className="border-b border-border bg-base/90 backdrop-blur-sm sticky top-0 z-10 print:hidden">
        <div className="mx-auto max-w-4xl px-5 py-4 flex items-center justify-between">
          <a
            href="/"
            className="font-serif-jp text-base font-bold tracking-tight hover:text-pop transition-colors"
          >
            {SITE_NAME}
          </a>
          <span className="font-display text-xs tracking-widest text-muted">
            PROPOSAL GENERATOR
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-5 py-12 md:py-20">
        {/* タイトル */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mb-12 print:hidden"
        >
          <p className="font-display text-xs tracking-widest text-pop mb-3">
            #PROPOSAL
          </p>
          <h1 className="font-serif-jp text-3xl md:text-4xl font-bold leading-tight mb-4">
            提案資料
            <br />
            自動生成システム
          </h1>
          <p className="text-muted text-sm leading-relaxed max-w-lg">
            アポイントの内容を入力するだけで、AIが顧客向けの提案書を自動で作成します。
            生成後は印刷・PDFエクスポートが可能です。
          </p>
        </motion.div>

        {/* 入力フォーム */}
        <AnimatePresence mode="wait">
          {!proposal && (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: EASE }}
              onSubmit={handleSubmit}
              className="space-y-6 print:hidden"
            >
              {/* 基本情報 */}
              <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
                <h2 className="font-display text-xs tracking-widest text-muted mb-6">
                  01 / 顧客情報
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="顧客名"
                    name="clientName"
                    placeholder="山田 太郎"
                    value={form.clientName}
                    onChange={handleChange}
                  />
                  <FormField
                    label="会社名"
                    name="companyName"
                    placeholder="株式会社サンプル"
                    value={form.companyName}
                    onChange={handleChange}
                  />
                  <FormField
                    label="業種"
                    name="industry"
                    placeholder="小売業・ECサイト運営"
                    value={form.industry}
                    onChange={handleChange}
                  />
                  <FormField
                    label="アポイント日時"
                    name="appointmentDate"
                    placeholder="2026年6月15日 14:00"
                    value={form.appointmentDate}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* ニーズ・課題 */}
              <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
                <h2 className="font-display text-xs tracking-widest text-muted mb-6">
                  02 / ニーズ・課題{" "}
                  <span className="text-pop">*必須</span>
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-ink mb-2">
                      顧客のニーズ・課題
                    </label>
                    <textarea
                      name="needs"
                      value={form.needs}
                      onChange={handleChange}
                      placeholder="例: ウェブサイトが古く更新が難しい。SNSからの集客を強化したい。問い合わせ数を増やしたい。"
                      required
                      rows={4}
                      className="w-full rounded-xl border border-border bg-base px-4 py-3 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-pop/30 transition resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      label="予算感"
                      name="budget"
                      placeholder="例: 〜50万円、要相談"
                      value={form.budget}
                      onChange={handleChange}
                    />
                    <FormField
                      label="希望スケジュール"
                      name="timeline"
                      placeholder="例: 3ヶ月以内、来月から"
                      value={form.timeline}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* その他 */}
              <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
                <h2 className="font-display text-xs tracking-widest text-muted mb-6">
                  03 / その他メモ
                </h2>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="例: 競合他社の名前、特に重視したい点、過去の経緯など"
                  rows={3}
                  className="w-full rounded-xl border border-border bg-base px-4 py-3 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-pop/30 transition resize-none"
                />
              </div>

              {/* エラー表示 */}
              {error && (
                <div className="rounded-xl border border-pop/30 bg-pop/5 px-4 py-3 text-sm text-pop">
                  {error}
                </div>
              )}

              {/* 送信ボタン */}
              <button
                type="submit"
                disabled={loading}
                className="btn-invert w-full py-4 text-sm tracking-widest font-display disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <LoadingSpinner />
                    提案書を生成中…
                  </span>
                ) : (
                  "提案書を自動生成する"
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* 生成結果 */}
        <AnimatePresence>
          {proposal && (
            <motion.div
              ref={proposalRef}
              key="proposal"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              {/* アクションバー */}
              <div className="mb-8 flex flex-wrap gap-3 print:hidden">
                <button onClick={handleReset} className="btn-outline text-sm px-5 py-2.5">
                  ← やり直す
                </button>
                <button onClick={handlePrint} className="btn-invert text-sm px-5 py-2.5">
                  印刷 / PDF保存
                </button>
              </div>

              {/* 提案書本体 */}
              <ProposalDocument proposal={proposal} siteName={SITE_NAME} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

/** フォームフィールド共通コンポーネント */
function FormField({
  label,
  name,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  name: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-ink mb-2">{label}</label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border bg-base px-4 py-3 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-pop/30 transition"
      />
    </div>
  );
}

/** ローディングスピナー */
function LoadingSpinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

/** 提案書ドキュメント表示 */
function ProposalDocument({
  proposal,
  siteName,
}: {
  proposal: Proposal;
  siteName: string;
}) {
  const today = new Date().toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="proposal-document bg-white border border-border rounded-2xl overflow-hidden print:rounded-none print:border-none print:shadow-none">
      {/* 表紙 */}
      <div className="bg-ink text-base px-8 py-12 md:px-16 md:py-16 print:px-12 print:py-12">
        <p className="font-display text-xs tracking-widest text-pop mb-6">
          PROPOSAL DOCUMENT
        </p>
        <h1 className="font-serif-jp text-2xl md:text-3xl font-bold leading-tight mb-3">
          {proposal.title}
        </h1>
        <p className="text-base/60 text-sm mb-8">{proposal.subtitle}</p>
        <div className="flex flex-wrap gap-6 text-xs text-base/40 font-display tracking-wide">
          <span>作成者: {siteName}</span>
          <span>作成日: {today}</span>
        </div>
      </div>

      {/* 本文 */}
      <div className="px-8 py-10 md:px-16 md:py-14 print:px-12 space-y-10">
        {/* エグゼクティブサマリー */}
        <Section number="01" title="エグゼクティブサマリー">
          <p className="text-sm leading-relaxed text-ink/80">
            {proposal.executiveSummary}
          </p>
        </Section>

        {/* 顧客背景 */}
        <Section number="02" title="現状と課題">
          <p className="text-sm leading-relaxed text-ink/80 mb-4">
            {proposal.clientBackground.currentSituation}
          </p>
          <ul className="space-y-2">
            {proposal.clientBackground.challenges.map((c, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-pop/10 text-pop flex items-center justify-center font-display text-[10px]">
                  {i + 1}
                </span>
                <span className="text-ink/80">{c}</span>
              </li>
            ))}
          </ul>
        </Section>

        {/* 提案内容 */}
        <Section number="03" title="ご提案内容">
          <p className="text-sm leading-relaxed text-ink/80 mb-6">
            {proposal.proposedSolution.overview}
          </p>
          <div className="space-y-4">
            {proposal.proposedSolution.recommendedServices.map((s, i) => (
              <div
                key={i}
                className="border border-border rounded-xl p-5"
              >
                <h4 className="font-serif-jp font-bold text-sm mb-2">
                  {s.name}
                </h4>
                <p className="text-xs text-muted mb-1">
                  <span className="font-medium text-ink">選定理由: </span>
                  {s.reason}
                </p>
                <p className="text-xs text-muted">
                  <span className="font-medium text-ink">期待効果: </span>
                  {s.expectedOutcome}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* 実施スケジュール */}
        <Section number="04" title="実施スケジュール">
          <div className="space-y-4">
            {proposal.implementationPlan.map((phase, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-px h-full bg-border relative">
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-pop" />
                  </div>
                </div>
                <div className="pb-6">
                  <div className="flex flex-wrap items-baseline gap-2 mb-1">
                    <span className="font-display text-[10px] tracking-widest text-pop">
                      {phase.phase}
                    </span>
                    <span className="font-serif-jp font-bold text-sm">
                      {phase.title}
                    </span>
                    <span className="text-xs text-muted">（{phase.duration}）</span>
                  </div>
                  <p className="text-xs text-ink/70 leading-relaxed">
                    {phase.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* お見積もり */}
        <Section number="05" title="投資サマリー">
          <div className="border border-border rounded-xl overflow-hidden mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-card">
                  <th className="px-5 py-3 text-left font-medium text-xs text-muted">
                    内容
                  </th>
                  <th className="px-5 py-3 text-right font-medium text-xs text-muted">
                    金額
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {proposal.investmentSummary.breakdown.map((row, i) => (
                  <tr key={i}>
                    <td className="px-5 py-3 text-xs text-ink/80">{row.item}</td>
                    <td className="px-5 py-3 text-xs text-right font-medium">
                      {row.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-ink text-base">
                  <td className="px-5 py-3 text-sm font-bold">合計</td>
                  <td className="px-5 py-3 text-sm font-bold text-right text-pop">
                    {proposal.investmentSummary.totalEstimate}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          {proposal.investmentSummary.note && (
            <p className="text-xs text-muted leading-relaxed">
              ※ {proposal.investmentSummary.note}
            </p>
          )}
        </Section>

        {/* 次のステップ */}
        <Section number="06" title="次のステップ">
          <ol className="space-y-3">
            {proposal.nextSteps.map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-ink flex items-center justify-center font-display text-[11px] font-bold">
                  {i + 1}
                </span>
                <span className="pt-0.5 text-ink/80">{step}</span>
              </li>
            ))}
          </ol>
        </Section>

        {/* クロージング */}
        <div className="border-t border-border pt-8">
          <p className="text-sm leading-relaxed text-ink/70 italic">
            {proposal.closing}
          </p>
          <div className="mt-6 flex items-center justify-between">
            <p className="font-serif-jp font-bold text-sm">{siteName}</p>
            <p className="font-display text-xs tracking-widest text-muted">
              {today}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/** セクション見出しラッパー */
function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-baseline gap-3 mb-5">
        <span className="font-display text-[10px] tracking-widest text-muted">
          #{number}
        </span>
        <h3 className="font-serif-jp font-bold text-base md:text-lg">{title}</h3>
      </div>
      {children}
    </section>
  );
}
