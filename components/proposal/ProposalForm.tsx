"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ProposalInput } from "@/app/api/generate-proposal/route";

const STEPS = [
  { id: 1, label: "顧客情報", desc: "CLIENT INFO" },
  { id: 2, label: "ヒアリング内容", desc: "HEARING" },
  { id: 3, label: "提案条件", desc: "CONDITIONS" },
];

const INDUSTRIES = [
  "IT・ソフトウェア",
  "製造業",
  "小売・EC",
  "飲食・フード",
  "医療・ヘルスケア",
  "教育・研修",
  "不動産",
  "金融・保険",
  "広告・マーケティング",
  "コンサルティング",
  "建設・土木",
  "物流・運送",
  "美容・ウェルネス",
  "観光・ホテル",
  "その他",
];

const BUDGET_OPTIONS = [
  "〜50万円",
  "50〜100万円",
  "100〜300万円",
  "300〜500万円",
  "500万円〜",
  "未定・要相談",
];

const TIMELINE_OPTIONS = [
  "1ヶ月以内",
  "3ヶ月以内",
  "6ヶ月以内",
  "1年以内",
  "長期的に",
  "未定",
];

const DEFAULT_INPUT: ProposalInput = {
  clientCompany: "",
  clientIndustry: "",
  contactName: "",
  contactEmail: "",
  appointmentDate: "",
  appointmentSummary: "",
  currentChallenges: "",
  goals: "",
  currentApproach: "",
  budget: "",
  timeline: "",
  ourStrengths: "",
  additionalNotes: "",
};

export default function ProposalForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [input, setInput] = useState<ProposalInput>(DEFAULT_INPUT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (key: keyof ProposalInput, value: string) =>
    setInput((prev) => ({ ...prev, [key]: value }));

  const handleNext = () => setStep((s) => Math.min(s + 1, 3));
  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error(`APIエラー: ${res.status}`);
      const data = await res.json();
      sessionStorage.setItem("proposalResult", JSON.stringify(data));
      router.push("/proposal/result");
    } catch (e) {
      setError(e instanceof Error ? e.message : "生成に失敗しました。再度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  const canProceedStep1 =
    input.clientCompany.trim() && input.clientIndustry && input.contactName.trim();
  const canProceedStep2 = input.currentChallenges.trim() && input.goals.trim();
  const canGenerate = input.ourStrengths.trim();

  return (
    <div className="mx-auto max-w-2xl">
      {/* ステップインジケーター */}
      <div className="mb-12 flex items-center gap-0">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex flex-1 items-center">
            <button
              type="button"
              onClick={() => step > s.id && setStep(s.id)}
              className={`flex flex-col items-center gap-1.5 transition-opacity ${
                step >= s.id ? "opacity-100" : "opacity-30"
              } ${step > s.id ? "cursor-pointer" : "cursor-default"}`}
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold transition-all ${
                  step === s.id
                    ? "border-ink bg-ink text-base"
                    : step > s.id
                    ? "border-pop bg-pop text-white"
                    : "border-border bg-transparent text-muted"
                }`}
              >
                {step > s.id ? "✓" : s.id}
              </span>
              <span className="font-display text-[9px] tracking-widest text-muted hidden sm:block">
                {s.desc}
              </span>
            </button>
            {i < STEPS.length - 1 && (
              <div
                className={`flex-1 h-px mx-3 transition-colors ${
                  step > s.id ? "bg-pop" : "bg-border"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* ステップコンテンツ */}
      <AnimatePresence mode="wait">
        {step === 1 && (
          <StepCard key="step1" title="顧客情報" subtitle="アポイント相手の基本情報を入力してください">
            <Field label="顧客企業名" required>
              <input
                type="text"
                value={input.clientCompany}
                onChange={(e) => update("clientCompany", e.target.value)}
                placeholder="株式会社サンプル"
                className="field-input"
              />
            </Field>
            <Field label="業種" required>
              <select
                value={input.clientIndustry}
                onChange={(e) => update("clientIndustry", e.target.value)}
                className="field-input"
              >
                <option value="">選択してください</option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="担当者名" required>
                <input
                  type="text"
                  value={input.contactName}
                  onChange={(e) => update("contactName", e.target.value)}
                  placeholder="山田 太郎"
                  className="field-input"
                />
              </Field>
              <Field label="メールアドレス">
                <input
                  type="email"
                  value={input.contactEmail}
                  onChange={(e) => update("contactEmail", e.target.value)}
                  placeholder="yamada@example.com"
                  className="field-input"
                />
              </Field>
            </div>
            <Field label="アポイント日時">
              <input
                type="datetime-local"
                value={input.appointmentDate}
                onChange={(e) => update("appointmentDate", e.target.value)}
                className="field-input"
              />
            </Field>
            <Field label="アポイントの概要メモ">
              <textarea
                rows={3}
                value={input.appointmentSummary}
                onChange={(e) => update("appointmentSummary", e.target.value)}
                placeholder="例：新規サービス導入の相談。現状のシステムに不満があり代替を探している。意思決定者も同席予定。"
                className="field-input resize-none"
              />
            </Field>
            <NavButtons
              onNext={handleNext}
              canProceed={!!canProceedStep1}
              showBack={false}
            />
          </StepCard>
        )}

        {step === 2 && (
          <StepCard key="step2" title="ヒアリング内容" subtitle="アポイントで確認した課題・ニーズを入力してください">
            <Field label="現状の課題" required hint="顧客が抱えている問題・痛みを具体的に">
              <textarea
                rows={4}
                value={input.currentChallenges}
                onChange={(e) => update("currentChallenges", e.target.value)}
                placeholder="例：手作業での在庫管理に時間がかかりすぎている。データの一元管理ができておらず、ミスが頻発している。"
                className="field-input resize-none"
              />
            </Field>
            <Field label="達成したい目標" required hint="解決後にどうなりたいか">
              <textarea
                rows={4}
                value={input.goals}
                onChange={(e) => update("goals", e.target.value)}
                placeholder="例：在庫管理業務を自動化し、担当者の工数を月40時間削減したい。リアルタイムでデータを確認できる体制を作りたい。"
                className="field-input resize-none"
              />
            </Field>
            <Field label="現在の取り組み" hint="今どんな対策をしているか（任意）">
              <textarea
                rows={3}
                value={input.currentApproach}
                onChange={(e) => update("currentApproach", e.target.value)}
                placeholder="例：Excelで管理しているが、複数人が同時編集できない問題がある。"
                className="field-input resize-none"
              />
            </Field>
            <NavButtons
              onNext={handleNext}
              onBack={handleBack}
              canProceed={!!canProceedStep2}
            />
          </StepCard>
        )}

        {step === 3 && (
          <StepCard key="step3" title="提案条件" subtitle="提案内容を最適化するための情報を入力してください">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="予算感">
                <select
                  value={input.budget}
                  onChange={(e) => update("budget", e.target.value)}
                  className="field-input"
                >
                  <option value="">選択してください</option>
                  {BUDGET_OPTIONS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </Field>
              <Field label="希望スケジュール">
                <select
                  value={input.timeline}
                  onChange={(e) => update("timeline", e.target.value)}
                  className="field-input"
                >
                  <option value="">選択してください</option>
                  {TIMELINE_OPTIONS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="自社の強み・提案ポイント" required hint="提案で打ち出したい価値・差別化ポイント">
              <textarea
                rows={4}
                value={input.ourStrengths}
                onChange={(e) => update("ourStrengths", e.target.value)}
                placeholder="例：導入実績300社以上の在庫管理システム。業界特化のテンプレートで最短2週間で稼働。専任サポートチームが導入後も継続支援。"
                className="field-input resize-none"
              />
            </Field>
            <Field label="その他特記事項" hint="競合状況・意思決定者・懸念点など（任意）">
              <textarea
                rows={3}
                value={input.additionalNotes}
                onChange={(e) => update("additionalNotes", e.target.value)}
                placeholder="例：他社も2社検討中。コストより品質・サポートを重視している様子。来月の役員会議に間に合わせたい。"
                className="field-input resize-none"
              />
            </Field>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </motion.div>
            )}

            <NavButtons
              onBack={handleBack}
              onGenerate={handleGenerate}
              canGenerate={!!canGenerate && !loading}
              loading={loading}
            />
          </StepCard>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ========== 子コンポーネント ========== */

function StepCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-3xl border border-border bg-card p-8 md:p-10 space-y-6"
    >
      <div>
        <h2 className="font-serif-jp text-2xl font-bold md:text-3xl">{title}</h2>
        <p className="mt-1.5 text-sm text-muted">{subtitle}</p>
      </div>
      {children}
    </motion.div>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <label className="font-display text-[10px] tracking-widest text-muted">
          {label}
        </label>
        {required && <span className="font-display text-[10px] text-pop">REQUIRED</span>}
      </div>
      {hint && <p className="text-xs text-muted/70">{hint}</p>}
      {children}
    </div>
  );
}

function NavButtons({
  onNext,
  onBack,
  onGenerate,
  canProceed = true,
  canGenerate = true,
  loading = false,
  showBack = true,
}: {
  onNext?: () => void;
  onBack?: () => void;
  onGenerate?: () => void;
  canProceed?: boolean;
  canGenerate?: boolean;
  loading?: boolean;
  showBack?: boolean;
}) {
  return (
    <div className="flex items-center justify-between pt-2">
      {showBack && onBack ? (
        <button type="button" onClick={onBack} className="btn-outline text-sm">
          ← 戻る
        </button>
      ) : (
        <div />
      )}
      {onGenerate ? (
        <button
          type="button"
          onClick={onGenerate}
          disabled={!canGenerate}
          className="btn-invert text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <LoadingSpinner />
              生成中…
            </span>
          ) : (
            "提案書を生成する →"
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className="btn-invert text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          次へ →
        </button>
      )}
    </div>
  );
}

function LoadingSpinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
