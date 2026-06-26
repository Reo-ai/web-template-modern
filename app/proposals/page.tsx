"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { COURSES } from "@/lib/courses";
import {
  BUDGET_OPTIONS,
  TIMELINE_OPTIONS,
  type AppointmentInput,
  type ProposalOutput,
} from "@/lib/proposals";
import { SITE_NAME } from "@/lib/config";

/** ステップ管理 */
type Step = "form" | "generating" | "proposal";

export default function ProposalsPage() {
  const [step, setStep] = useState<Step>("form");
  const [proposal, setProposal] = useState<ProposalOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<AppointmentInput>({
    companyName: "",
    contactName: "",
    contactTitle: "",
    industry: "",
    challenges: "",
    goals: "",
    budget: "",
    timeline: "",
    appointmentNotes: "",
    interestedCourse: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStep("generating");

    try {
      const res = await fetch("/api/proposals/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "生成に失敗しました");
      }

      setProposal(data);
      setStep("proposal");
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
      setStep("form");
    }
  };

  return (
    <div className="min-h-screen bg-base pt-24 pb-32">
      <div className="mx-auto max-w-4xl px-5 md:px-10">
        {/* ページヘッダー */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 text-center"
        >
          <p className="font-display text-[10px] tracking-widest text-pop">
            {SITE_NAME} — PROPOSAL GENERATOR
          </p>
          <h1 className="mt-3 font-serif-jp text-3xl font-bold md:text-4xl">
            提案書 自動生成システム
          </h1>
          <p className="mt-4 text-sm text-muted">
            アポイントの内容を入力すると、AI がプロフェッショナルな提案書を自動作成します。
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* ===== STEP: FORM ===== */}
          {step === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              {error && (
                <div className="mb-6 rounded-2xl border border-pop/30 bg-pop/5 px-5 py-4 text-sm text-pop">
                  ⚠ {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* セクション: クライアント情報 */}
                <FormSection label="CLIENT INFO" title="クライアント情報">
                  <div className="grid gap-5 md:grid-cols-2">
                    <Field
                      label="会社名・屋号"
                      name="companyName"
                      required
                      placeholder="株式会社○○"
                      value={formData.companyName}
                      onChange={handleChange}
                    />
                    <Field
                      label="業種・業態"
                      name="industry"
                      required
                      placeholder="飲食業 / IT / 小売業 など"
                      value={formData.industry}
                      onChange={handleChange}
                    />
                    <Field
                      label="担当者名"
                      name="contactName"
                      required
                      placeholder="山田 太郎"
                      value={formData.contactName}
                      onChange={handleChange}
                    />
                    <Field
                      label="役職(任意)"
                      name="contactTitle"
                      placeholder="代表取締役 / マーケティング部長 など"
                      value={formData.contactTitle}
                      onChange={handleChange}
                    />
                  </div>
                </FormSection>

                {/* セクション: 課題・目標 */}
                <FormSection label="CHALLENGES & GOALS" title="課題と目標">
                  <TextAreaField
                    label="現状の課題・悩み"
                    name="challenges"
                    required
                    placeholder="例: SNS 運用が続かない、新規客が増えない、ウェブサイトが古くて更新できていない…"
                    rows={4}
                    value={formData.challenges}
                    onChange={handleChange}
                  />
                  <TextAreaField
                    label="目標・理想の状態"
                    name="goals"
                    required
                    placeholder="例: 月間問い合わせ数を現状の3倍にしたい、半年以内に新規顧客を20名獲得したい…"
                    rows={4}
                    value={formData.goals}
                    onChange={handleChange}
                  />
                </FormSection>

                {/* セクション: 条件 */}
                <FormSection label="CONDITIONS" title="条件・希望">
                  <div className="grid gap-5 md:grid-cols-2">
                    <SelectField
                      label="予算感"
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      options={BUDGET_OPTIONS}
                    />
                    <SelectField
                      label="希望する導入時期"
                      name="timeline"
                      value={formData.timeline}
                      onChange={handleChange}
                      options={TIMELINE_OPTIONS}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block font-display text-[10px] tracking-widest text-muted">
                      興味を持ったサービス
                    </label>
                    <select
                      name="interestedCourse"
                      value={formData.interestedCourse}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-border bg-base px-4 py-3 text-sm transition-colors focus:border-ink focus:outline-none"
                    >
                      <option value="">選択してください(任意)</option>
                      {COURSES.map((c) => (
                        <option key={c.number} value={c.number}>
                          {c.name} — {c.tagline}
                        </option>
                      ))}
                      <option value="undecided">未定 / 相談したい</option>
                    </select>
                  </div>
                </FormSection>

                {/* セクション: アポイントメモ */}
                <FormSection label="APPOINTMENT NOTES" title="アポイントのメモ">
                  <TextAreaField
                    label="商談・面談で話した内容(任意)"
                    name="appointmentNotes"
                    placeholder="例: 先月リブランディングしたばかり。担当者はSNS経験ゼロ。予算は来期から確保予定。社内承認が必要とのこと。"
                    rows={5}
                    value={formData.appointmentNotes}
                    onChange={handleChange}
                  />
                </FormSection>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="btn-invert w-full text-sm md:w-auto"
                  >
                    提案書を生成する →
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* ===== STEP: GENERATING ===== */}
          {step === "generating" && (
            <motion.div
              key="generating"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center justify-center py-32 text-center"
            >
              <div className="mb-8 flex gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="block h-3 w-3 rounded-full bg-pop"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
              <h2 className="font-serif-jp text-2xl font-bold">
                提案書を生成中…
              </h2>
              <p className="mt-3 text-sm text-muted">
                AI がアポイントの内容を分析し、最適な提案書を作成しています。
                <br />
                通常 10〜30 秒ほどかかります。
              </p>
            </motion.div>
          )}

          {/* ===== STEP: PROPOSAL ===== */}
          {step === "proposal" && proposal && (
            <motion.div
              key="proposal"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* 操作ボタン(印刷非表示) */}
              <div className="mb-8 flex items-center justify-between print:hidden">
                <button
                  onClick={() => {
                    setStep("form");
                    setProposal(null);
                  }}
                  className="text-sm text-muted transition-colors hover:text-ink"
                >
                  ← フォームに戻る
                </button>
                <button
                  onClick={() => window.print()}
                  className="btn-invert text-sm"
                >
                  PDF として印刷 / 保存
                </button>
              </div>

              {/* 提案書本体 */}
              <ProposalDocument proposal={proposal} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 提案書ドキュメント                                                    */
/* ------------------------------------------------------------------ */

function ProposalDocument({ proposal }: { proposal: ProposalOutput }) {
  return (
    <div className="proposal-document rounded-3xl border border-border bg-card p-8 md:p-12 print:rounded-none print:border-none print:p-0">
      {/* ヘッダー */}
      <div className="mb-10 border-b border-border pb-8">
        <p className="font-display text-[10px] tracking-widest text-pop">
          PROPOSAL DOCUMENT
        </p>
        <h2 className="mt-3 font-serif-jp text-2xl font-bold md:text-3xl">
          {proposal.title}
        </h2>
        <div className="mt-4 flex flex-col gap-1 text-sm text-muted md:flex-row md:gap-6">
          <span>提出先: {proposal.recipient}</span>
          <span>発行日: {proposal.date}</span>
          <span>提案者: {SITE_NAME}</span>
        </div>
      </div>

      {/* エグゼクティブサマリー */}
      <div className="mb-10 rounded-2xl bg-base px-6 py-6">
        <p className="mb-3 font-display text-[10px] tracking-widest text-pop">
          EXECUTIVE SUMMARY
        </p>
        <p className="whitespace-pre-line text-sm leading-relaxed text-ink">
          {proposal.summary}
        </p>
      </div>

      {/* 本文セクション */}
      <div className="mb-10 space-y-10">
        {proposal.sections.map((section, i) => (
          <div key={section.id}>
            <div className="mb-4 flex items-center gap-3">
              <span className="font-display text-xs text-pop">
                0{i + 1}
              </span>
              <h3 className="font-serif-jp text-lg font-bold md:text-xl">
                {section.title}
              </h3>
            </div>
            <p className="mb-4 whitespace-pre-line text-sm leading-relaxed text-ink/80">
              {section.body}
            </p>
            {section.bullets && section.bullets.length > 0 && (
              <ul className="space-y-2">
                {section.bullets.map((bullet, j) => (
                  <li key={j} className="flex items-start gap-3 text-sm">
                    <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-pop" />
                    <span className="text-ink/80">{bullet}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {/* 推奨プラン */}
      <div className="mb-10 rounded-2xl border border-pop/20 bg-pop/5 p-6 md:p-8">
        <p className="mb-3 font-display text-[10px] tracking-widest text-pop">
          RECOMMENDED PLAN
        </p>
        <h3 className="font-serif-jp text-xl font-bold">
          {proposal.recommendedPlan.name}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-ink/80">
          {proposal.recommendedPlan.reason}
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <PlanDetail label="価格" value={proposal.recommendedPlan.price} />
          <PlanDetail label="期間・回数" value={proposal.recommendedPlan.duration} />
          <PlanDetail label="提供形態" value={proposal.recommendedPlan.format} />
        </div>
      </div>

      {/* 次のステップ */}
      <div>
        <p className="mb-4 font-display text-[10px] tracking-widest text-muted">
          NEXT STEPS
        </p>
        <ol className="space-y-3">
          {proposal.nextSteps.map((step, i) => (
            <li key={i} className="flex items-start gap-4">
              <span className="font-display text-sm font-bold text-pop">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-sm text-ink/80">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* フッター */}
      <div className="mt-12 border-t border-border pt-6 text-center">
        <p className="text-xs text-muted">
          本提案書は {SITE_NAME} が AI を活用して作成した参考資料です。
          詳細はお気軽にご相談ください。
        </p>
      </div>
    </div>
  );
}

function PlanDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-base px-4 py-3">
      <p className="font-display text-[9px] tracking-widest text-muted">{label}</p>
      <p className="mt-1 text-sm font-bold">{value}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* フォームコンポーネント                                                */
/* ------------------------------------------------------------------ */

function FormSection({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
      <p className="mb-1 font-display text-[10px] tracking-widest text-pop">
        {label}
      </p>
      <h2 className="mb-5 font-serif-jp text-lg font-bold">{title}</h2>
      <div className="space-y-5">{children}</div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block font-display text-[10px] tracking-widest text-muted"
      >
        {label} {required && <span className="text-pop">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full rounded-2xl border border-border bg-base px-4 py-3 text-sm transition-colors focus:border-ink focus:outline-none"
      />
    </div>
  );
}

function TextAreaField({
  label,
  name,
  required,
  placeholder,
  rows = 4,
  value,
  onChange,
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  rows?: number;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block font-display text-[10px] tracking-widest text-muted"
      >
        {label} {required && <span className="text-pop">*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        required={required}
        placeholder={placeholder}
        rows={rows}
        value={value}
        onChange={onChange}
        className="w-full resize-none rounded-2xl border border-border bg-base px-4 py-3 text-sm transition-colors focus:border-ink focus:outline-none"
      />
    </div>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block font-display text-[10px] tracking-widest text-muted"
      >
        {label}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-2xl border border-border bg-base px-4 py-3 text-sm transition-colors focus:border-ink focus:outline-none"
      >
        <option value="">選択してください</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
