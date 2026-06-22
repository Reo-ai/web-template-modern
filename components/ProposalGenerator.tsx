"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";
import type { ProposalData } from "@/app/api/generate-proposal/route";

type FormData = {
  clientName: string;
  industry: string;
  purpose: string;
  challenges: string;
  budget: string;
  timeline: string;
  notes: string;
};

const INDUSTRIES = [
  "IT・ソフトウェア",
  "製造業",
  "小売・EC",
  "飲食・フード",
  "医療・ヘルスケア",
  "教育・研修",
  "不動産",
  "金融・保険",
  "建設・土木",
  "物流・運輸",
  "広告・マーケティング",
  "コンサルティング",
  "人材・HR",
  "メディア・エンターテインメント",
  "その他",
];

const BUDGETS = [
  "〜50万円",
  "50〜100万円",
  "100〜300万円",
  "300〜500万円",
  "500万円〜",
  "未定 / 要相談",
];

const TIMELINES = [
  "1ヶ月以内",
  "3ヶ月以内",
  "半年以内",
  "1年以内",
  "未定",
];

export default function ProposalGenerator() {
  const [form, setForm] = useState<FormData>({
    clientName: "",
    industry: "",
    purpose: "",
    challenges: "",
    budget: "",
    timeline: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [proposal, setProposal] = useState<ProposalData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setProposal(null);

    try {
      const res = await fetch("/api/generate-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "エラーが発生しました");
      setProposal(data.proposal);
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
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
    <div className="min-h-screen bg-base">
      {/* ヘッダーエリア */}
      <div className="border-b border-border bg-card px-5 py-16 md:px-10 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-4xl"
        >
          <div className="flex items-center gap-3 font-display text-xs tracking-[0.25em] text-muted">
            <span>#001</span>
            <span className="h-px w-8 bg-muted" />
            <span>PROPOSAL GENERATOR</span>
          </div>
          <h1 className="mt-4 font-serif-jp text-3xl font-bold leading-tight tracking-tight md:text-5xl">
            提案資料ジェネレーター
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-ink/70 md:text-base">
            アポイントの内容を入力するだけで、AIが営業提案書を自動で作成します。
            作成した資料はそのまま印刷・PDF出力してご活用ください。
          </p>
        </motion.div>
      </div>

      <div className="mx-auto max-w-4xl px-5 py-16 md:px-10 md:py-24">
        {/* 入力フォーム */}
        <AnimatePresence>
          {!proposal && (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              onSubmit={handleSubmit}
              className="space-y-8"
            >
              {/* 基本情報 */}
              <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
                <h2 className="mb-6 font-display text-xs tracking-[0.2em] text-muted">
                  BASIC INFO — 基本情報
                </h2>
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    label="クライアント名 / 会社名"
                    name="clientName"
                    required
                    placeholder="株式会社〇〇 / 山田 太郎 様"
                    value={form.clientName}
                    onChange={handleChange}
                  />
                  <div>
                    <label className="mb-2 block font-display text-[10px] tracking-widest text-muted">
                      業種 <span className="text-pop">*</span>
                    </label>
                    <select
                      name="industry"
                      required
                      value={form.industry}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-border bg-base px-4 py-3 text-sm transition-colors focus:border-ink focus:outline-none"
                    >
                      <option value="" disabled>選択してください</option>
                      {INDUSTRIES.map((i) => (
                        <option key={i} value={i}>{i}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* アポイント詳細 */}
              <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
                <h2 className="mb-6 font-display text-xs tracking-[0.2em] text-muted">
                  APPOINTMENT DETAILS — アポイント詳細
                </h2>
                <div className="space-y-6">
                  <FormField
                    label="アポイントの目的・背景"
                    name="purpose"
                    required
                    placeholder="例: 新しいCRMシステムの導入について相談したい"
                    value={form.purpose}
                    onChange={handleChange}
                  />
                  <div>
                    <label className="mb-2 block font-display text-[10px] tracking-widest text-muted">
                      抱えている課題・ニーズ <span className="text-pop">*</span>
                    </label>
                    <textarea
                      name="challenges"
                      required
                      rows={4}
                      placeholder="例: 顧客情報がExcelで管理されており、チーム間での共有や営業の進捗管理が属人化している。売上の見える化もできていない。"
                      value={form.challenges}
                      onChange={handleChange}
                      className="w-full resize-none rounded-2xl border border-border bg-base px-4 py-3 text-sm transition-colors focus:border-ink focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* オプション情報 */}
              <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
                <h2 className="mb-6 font-display text-xs tracking-[0.2em] text-muted">
                  OPTIONS — 補足情報（任意）
                </h2>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block font-display text-[10px] tracking-widest text-muted">
                      予算感
                    </label>
                    <select
                      name="budget"
                      value={form.budget}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-border bg-base px-4 py-3 text-sm transition-colors focus:border-ink focus:outline-none"
                    >
                      <option value="">未入力</option>
                      {BUDGETS.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block font-display text-[10px] tracking-widest text-muted">
                      導入・実施希望時期
                    </label>
                    <select
                      name="timeline"
                      value={form.timeline}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-border bg-base px-4 py-3 text-sm transition-colors focus:border-ink focus:outline-none"
                    >
                      <option value="">未入力</option>
                      {TIMELINES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-6">
                  <label className="mb-2 block font-display text-[10px] tracking-widest text-muted">
                    その他の補足・メモ
                  </label>
                  <textarea
                    name="notes"
                    rows={3}
                    placeholder="例: 競合他社も同じサービスを検討中とのこと。意思決定者は代表と部長の2名。"
                    value={form.notes}
                    onChange={handleChange}
                    className="w-full resize-none rounded-2xl border border-border bg-base px-4 py-3 text-sm transition-colors focus:border-ink focus:outline-none"
                  />
                </div>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600"
                >
                  {error}
                </motion.p>
              )}

              <div className="flex items-center justify-between">
                <p className="text-xs text-muted">
                  ※ 生成には10〜20秒ほどかかります
                </p>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-invert min-w-[160px] text-sm"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <LoadingSpinner />
                      生成中…
                    </span>
                  ) : (
                    "提案資料を生成する →"
                  )}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* 生成結果 */}
        <AnimatePresence>
          {proposal && (
            <motion.div
              key="result"
              ref={resultRef}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* 操作ボタン */}
              <div className="mb-8 flex items-center justify-between print:hidden">
                <button
                  onClick={handleReset}
                  className="btn-outline text-sm"
                >
                  ← 入力に戻る
                </button>
                <button
                  onClick={handlePrint}
                  className="btn-invert text-sm"
                >
                  印刷 / PDF保存
                </button>
              </div>

              {/* 提案書本体 */}
              <ProposalDocument proposal={proposal} clientName={form.clientName} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── 提案書ドキュメント ── */
function ProposalDocument({
  proposal,
  clientName,
}: {
  proposal: ProposalData;
  clientName: string;
}) {
  const today = new Date().toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6 print:space-y-4">
      {/* 表紙 */}
      <div className="rounded-3xl border border-border bg-card p-8 md:p-12 print:rounded-none print:border-none">
        <div className="border-b border-border pb-8">
          <p className="font-display text-[10px] tracking-[0.3em] text-muted">
            BUSINESS PROPOSAL
          </p>
          <h1 className="mt-4 font-serif-jp text-2xl font-bold leading-snug md:text-4xl">
            {proposal.title}
          </h1>
          <div className="mt-8 flex flex-wrap gap-6 text-sm text-ink/60">
            <span>提出先：{clientName} 様</span>
            <span>作成日：{today}</span>
          </div>
        </div>

        {/* エグゼクティブサマリー */}
        <div className="mt-8">
          <SectionLabel>EXECUTIVE SUMMARY</SectionLabel>
          <p className="mt-4 leading-relaxed text-ink/80">{proposal.summary}</p>
        </div>
      </div>

      {/* 課題分析 */}
      <ProposalSection label="CHALLENGE ANALYSIS" title="課題分析">
        <p className="leading-relaxed text-ink/80 whitespace-pre-line">
          {proposal.challengeAnalysis}
        </p>
      </ProposalSection>

      {/* 提案内容 */}
      <ProposalSection label="OUR PROPOSAL" title="提案内容">
        <p className="mb-6 leading-relaxed text-ink/80">{proposal.proposal.overview}</p>
        <ul className="mb-6 space-y-3">
          {proposal.proposal.details.map((detail, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-[10px] font-bold text-card font-display">
                {i + 1}
              </span>
              <span className="leading-relaxed text-ink/80">{detail}</span>
            </li>
          ))}
        </ul>
        <div className="rounded-2xl bg-base p-5">
          <p className="text-xs font-display tracking-widest text-muted mb-2">APPROACH</p>
          <p className="text-sm leading-relaxed text-ink/80">{proposal.proposal.approach}</p>
        </div>
      </ProposalSection>

      {/* 期待効果 */}
      <ProposalSection label="EXPECTED OUTCOMES" title="期待される効果">
        <div className="grid gap-4 md:grid-cols-2">
          {proposal.expectedOutcomes.map((outcome, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-2xl border border-border p-4"
            >
              <span className="font-display text-lg font-bold text-pop leading-none mt-0.5">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-sm leading-relaxed text-ink/80">{outcome}</span>
            </div>
          ))}
        </div>
      </ProposalSection>

      {/* スケジュール */}
      <ProposalSection label="SCHEDULE" title="実施スケジュール">
        <div className="space-y-0">
          {proposal.schedule.map((s, i) => (
            <div
              key={i}
              className="flex gap-0 border-b border-border last:border-none"
            >
              <div className="flex w-8 shrink-0 flex-col items-center py-6">
                <div className="h-full w-px bg-border relative">
                  <div className="absolute -top-1 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-ink" />
                </div>
              </div>
              <div className="flex-1 py-6 pl-4">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <span className="font-display text-xs tracking-widest text-muted">
                    {s.period}
                  </span>
                  <span className="font-bold">{s.phase}</span>
                </div>
                <p className="text-sm text-ink/70">{s.content}</p>
              </div>
            </div>
          ))}
        </div>
      </ProposalSection>

      {/* 投資 */}
      <ProposalSection label="INVESTMENT" title="費用について">
        <p className="leading-relaxed text-ink/80">{proposal.investment}</p>
      </ProposalSection>

      {/* 次のステップ */}
      <ProposalSection label="NEXT STEPS" title="次のステップ">
        <ol className="space-y-3">
          {proposal.nextSteps.map((step, i) => (
            <li key={i} className="flex items-center gap-4">
              <span className="font-display text-2xl font-bold text-border leading-none shrink-0">
                {i + 1}
              </span>
              <span className="leading-relaxed text-ink/80">{step}</span>
            </li>
          ))}
        </ol>
      </ProposalSection>

      {/* クロージング */}
      <div className="rounded-3xl border border-border bg-ink p-8 text-center print:rounded-none">
        <p className="font-serif-jp text-lg font-bold text-card md:text-xl">
          {proposal.closing}
        </p>
        <p className="mt-4 font-display text-[10px] tracking-[0.3em] text-card/40">
          THANK YOU FOR YOUR TIME
        </p>
      </div>
    </div>
  );
}

/* ── UI パーツ ── */

function ProposalSection({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-8 md:p-10 print:rounded-none print:border-t print:border-x-0 print:border-b-0">
      <SectionLabel>{label}</SectionLabel>
      <h2 className="mt-2 mb-6 font-serif-jp text-xl font-bold md:text-2xl">{title}</h2>
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-display text-[10px] tracking-[0.25em] text-muted">{children}</p>
  );
}

function FormField({
  label,
  name,
  required,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <label className="mb-2 block font-display text-[10px] tracking-widest text-muted">
        {label} {required && <span className="text-pop">*</span>}
      </label>
      <input
        type="text"
        name={name}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full rounded-2xl border border-border bg-base px-4 py-3 text-sm transition-colors focus:border-ink focus:outline-none"
      />
    </div>
  );
}

function LoadingSpinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
