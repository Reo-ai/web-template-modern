"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";
import { AppointmentData, GeneratedProposal } from "@/lib/proposal";

type Props = {
  onGenerated: (data: AppointmentData, proposal: GeneratedProposal) => void;
};

const LABEL_CLASS = "block text-xs font-display tracking-widest text-muted mb-1.5";
const INPUT_CLASS =
  "w-full rounded-lg border border-border bg-card px-4 py-3 text-sm text-ink placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-ink/20 transition";
const TEXTAREA_CLASS = `${INPUT_CLASS} resize-none`;

const BUDGET_OPTIONS = [
  "〜10万円",
  "10〜30万円",
  "30〜50万円",
  "50〜100万円",
  "100万円以上",
  "未確認",
];

const DECISION_OPTIONS = [
  "本人が決裁者",
  "上長に確認が必要",
  "経営層の承認が必要",
  "未確認",
];

export default function ProposalForm({ onGenerated }: Props) {
  const [form, setForm] = useState<AppointmentData>({
    clientName: "",
    contactPerson: "",
    industry: "",
    challenges: "",
    goals: "",
    budget: "未確認",
    decisionMaker: "未確認",
    appointmentDate: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof AppointmentData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/generate-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await res.json();

      if (!json.success) {
        throw new Error(json.error ?? "エラーが発生しました");
      }

      onGenerated(form, json.proposal);
    } catch (err) {
      setError(err instanceof Error ? err.message : "不明なエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-8"
    >
      {/* 基本情報 */}
      <section className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-5">
        <h2 className="font-display text-xs tracking-widest text-muted">01 / 顧客情報</h2>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className={LABEL_CLASS}>顧客名・会社名 <span className="text-pop">*</span></label>
            <input
              required
              type="text"
              placeholder="例: 株式会社サンプル"
              value={form.clientName}
              onChange={set("clientName")}
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>担当者名</label>
            <input
              type="text"
              placeholder="例: 田中 花子 様"
              value={form.contactPerson}
              onChange={set("contactPerson")}
              className={INPUT_CLASS}
            />
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className={LABEL_CLASS}>業種 <span className="text-pop">*</span></label>
            <input
              required
              type="text"
              placeholder="例: IT・SaaS / 小売 / 製造"
              value={form.industry}
              onChange={set("industry")}
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>アポイント日時</label>
            <input
              type="text"
              placeholder="例: 2026年6月25日 14:00〜"
              value={form.appointmentDate}
              onChange={set("appointmentDate")}
              className={INPUT_CLASS}
            />
          </div>
        </div>
      </section>

      {/* 課題・要望 */}
      <section className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-5">
        <h2 className="font-display text-xs tracking-widest text-muted">02 / 課題・目標</h2>

        <div>
          <label className={LABEL_CLASS}>現在の課題・痛み <span className="text-pop">*</span></label>
          <textarea
            required
            rows={4}
            placeholder="例: 新規顧客の獲得コストが高く、紹介に依存している。Webからの問い合わせがほぼゼロの状態。"
            value={form.challenges}
            onChange={set("challenges")}
            className={TEXTAREA_CLASS}
          />
        </div>

        <div>
          <label className={LABEL_CLASS}>目標・要望 <span className="text-pop">*</span></label>
          <textarea
            required
            rows={4}
            placeholder="例: 3ヶ月以内にオンラインからの問い合わせを月10件以上にしたい。ブランディングも同時に強化したい。"
            value={form.goals}
            onChange={set("goals")}
            className={TEXTAREA_CLASS}
          />
        </div>
      </section>

      {/* 商談情報 */}
      <section className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-5">
        <h2 className="font-display text-xs tracking-widest text-muted">03 / 商談情報</h2>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className={LABEL_CLASS}>予算感</label>
            <select value={form.budget} onChange={set("budget")} className={INPUT_CLASS}>
              {BUDGET_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS}>決裁権者</label>
            <select value={form.decisionMaker} onChange={set("decisionMaker")} className={INPUT_CLASS}>
              {DECISION_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={LABEL_CLASS}>担当者メモ(社内向け)</label>
          <textarea
            rows={3}
            placeholder="例: 競合は A社・B社を比較中。意思決定は来月末予定。社長への最終プレゼンがある模様。"
            value={form.notes}
            onChange={set("notes")}
            className={TEXTAREA_CLASS}
          />
        </div>
      </section>

      {/* エラー表示 */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-lg border border-pop/30 bg-pop/5 px-4 py-3 text-sm text-pop"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* 送信ボタン */}
      <div className="flex justify-center">
        <button
          type="submit"
          disabled={loading}
          className="btn-invert flex items-center gap-3 px-8 py-4 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>提案書を生成中...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>提案書を自動生成する</span>
            </>
          )}
        </button>
      </div>
    </motion.form>
  );
}
