"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import SectionHeading from "./SectionHeading";
import type {
  AppointmentInput,
  ProposalOutput,
} from "@/app/api/proposal/generate/route";

/** カレンダーから取得したアポイントの型 */
export interface CalendarAppointment {
  id: string;
  summary: string;
  start: string;
  description?: string;
}

interface Props {
  /** Google カレンダーから取得した直近のアポイント一覧 */
  appointments?: CalendarAppointment[];
}

const INDUSTRIES = [
  "IT・ソフトウェア",
  "製造業",
  "小売・EC",
  "飲食・フード",
  "医療・ヘルスケア",
  "教育",
  "不動産",
  "金融・保険",
  "広告・マーケティング",
  "コンサルティング",
  "その他",
];

const PURPOSES = [
  "新規サービスの提案",
  "既存契約の更新・拡大",
  "課題解決の提案",
  "業務改善の提案",
  "パートナーシップ提案",
  "デモ・導入説明",
  "初回ヒアリング後の提案",
];

export default function ProposalGenerator({ appointments = [] }: Props) {
  const [step, setStep] = useState<"form" | "loading" | "result">("form");
  const [form, setForm] = useState<AppointmentInput>({
    clientName: "",
    industry: "",
    purpose: "",
    date: "",
    notes: "",
  });
  const [proposal, setProposal] = useState<ProposalOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  /** カレンダーのアポイントを選択してフォームに自動入力 */
  const applyAppointment = (appt: CalendarAppointment) => {
    setForm((prev) => ({
      ...prev,
      clientName: appt.summary,
      date: appt.start,
      notes: appt.description ?? "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep("loading");
    setError(null);
    try {
      const res = await fetch("/api/proposal/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "生成に失敗しました");
      }
      const data: ProposalOutput = await res.json();
      setProposal(data);
      setStep("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
      setStep("form");
    }
  };

  const reset = () => {
    setStep("form");
    setProposal(null);
    setError(null);
  };

  return (
    <section className="relative w-full px-5 py-24 md:px-10 md:py-32">
      <SectionHeading
        number="001"
        label="PROPOSAL GENERATOR"
        title="アポイントから提案資料を自動作成。"
        description="アポイントの内容を入力するだけで、AI が提案スライドの構成を生成します。Canva でそのまま資料を仕上げましょう。"
      />

      {/* カレンダー連携：直近のアポイントがあれば表示 */}
      {appointments.length > 0 && step === "form" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 max-w-3xl"
        >
          <p className="mb-3 font-display text-[10px] tracking-widest text-muted">
            CALENDAR — 直近のアポイント
          </p>
          <div className="flex flex-col gap-2">
            {appointments.map((appt) => (
              <button
                key={appt.id}
                type="button"
                onClick={() => applyAppointment(appt)}
                className="flex items-center justify-between rounded-2xl border border-border bg-card px-5 py-4 text-left text-sm transition-colors hover:border-ink"
              >
                <span className="font-medium">{appt.summary}</span>
                <span className="ml-4 shrink-0 text-xs text-muted">
                  {new Date(appt.start).toLocaleDateString("ja-JP")} →
                  フォームに入力
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {/* フォーム */}
        {step === "form" && (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            onSubmit={handleSubmit}
            className="max-w-3xl space-y-6"
          >
            {error && (
              <div className="rounded-2xl border border-pop/30 bg-pop/5 px-5 py-4 text-sm text-pop">
                {error}
              </div>
            )}

            <Field label="顧客名・企業名" required>
              <input
                type="text"
                required
                value={form.clientName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, clientName: e.target.value }))
                }
                placeholder="株式会社〇〇 / 山田様"
                className="w-full rounded-2xl border border-border bg-base px-4 py-3 text-sm transition-colors focus:border-ink focus:outline-none"
              />
            </Field>

            <Field label="業種" required>
              <select
                required
                value={form.industry}
                onChange={(e) =>
                  setForm((p) => ({ ...p, industry: e.target.value }))
                }
                className="w-full rounded-2xl border border-border bg-base px-4 py-3 text-sm transition-colors focus:border-ink focus:outline-none"
              >
                <option value="" disabled>
                  選択してください
                </option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="提案の目的" required>
              <select
                required
                value={form.purpose}
                onChange={(e) =>
                  setForm((p) => ({ ...p, purpose: e.target.value }))
                }
                className="w-full rounded-2xl border border-border bg-base px-4 py-3 text-sm transition-colors focus:border-ink focus:outline-none"
              >
                <option value="" disabled>
                  選択してください
                </option>
                {PURPOSES.map((pur) => (
                  <option key={pur} value={pur}>
                    {pur}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="アポイント日時" required>
              <input
                type="datetime-local"
                required
                value={form.date}
                onChange={(e) =>
                  setForm((p) => ({ ...p, date: e.target.value }))
                }
                className="w-full rounded-2xl border border-border bg-base px-4 py-3 text-sm transition-colors focus:border-ink focus:outline-none"
              />
            </Field>

            <Field label="備考・特記事項">
              <textarea
                rows={4}
                value={form.notes}
                onChange={(e) =>
                  setForm((p) => ({ ...p, notes: e.target.value }))
                }
                placeholder="先方の課題・ヒアリング内容・要望など自由に記入"
                className="w-full resize-none rounded-2xl border border-border bg-base px-4 py-3 text-sm transition-colors focus:border-ink focus:outline-none"
              />
            </Field>

            <button type="submit" className="btn-invert text-sm">
              提案資料を生成する →
            </button>
          </motion.form>
        )}

        {/* 生成中 */}
        {step === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex max-w-3xl flex-col items-center gap-6 py-20 text-center"
          >
            <Spinner />
            <p className="font-display text-xs tracking-widest text-muted">
              AI が提案構成を考えています…
            </p>
          </motion.div>
        )}

        {/* 結果 */}
        {step === "result" && proposal && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl"
          >
            {/* 提案タイトル・サマリー */}
            <div className="mb-8 rounded-3xl border border-border bg-card p-8">
              <p className="font-display text-[10px] tracking-widest text-pop">
                PROPOSAL READY
              </p>
              <h2 className="mt-3 font-serif-jp text-2xl font-bold leading-snug md:text-3xl">
                {proposal.title}
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-ink/75">
                {proposal.summary}
              </p>
            </div>

            {/* スライド一覧 */}
            <div className="mb-8 space-y-3">
              <p className="font-display text-[10px] tracking-widest text-muted">
                SLIDE OUTLINE — {proposal.slides.length} SLIDES
              </p>
              {proposal.slides.map((slide, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: i * 0.07,
                    duration: 0.5,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="flex gap-5 rounded-2xl border border-border bg-card px-6 py-5"
                >
                  <span className="font-display text-xs text-muted shrink-0 mt-0.5">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="font-medium">{slide.title}</p>
                    <p className="mt-1 text-sm text-ink/65">
                      {slide.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Canva で開くボタン */}
            <div className="flex flex-wrap gap-4">
              <a
                href="https://www.canva.com/presentations/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-invert text-sm"
              >
                Canva で資料を作成 →
              </a>
              <button type="button" onClick={reset} className="btn-outline text-sm">
                別のアポイントを生成
              </button>
            </div>

            <p className="mt-6 text-xs text-muted">
              ※ Canva を開いたら、上記のスライド構成をもとに資料を作成してください。
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block font-display text-[10px] tracking-widest text-muted">
        {label} {required && <span className="text-pop">*</span>}
      </label>
      {children}
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="h-10 w-10 animate-spin text-pop"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-20"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-80"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"
      />
    </svg>
  );
}
