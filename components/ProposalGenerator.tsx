"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Copy, Check, RotateCcw, ChevronDown } from "lucide-react";
import type { AppointmentData } from "@/app/api/generate-proposal/route";

const EASE = [0.22, 1, 0.36, 1] as const;

const INDUSTRIES = [
  "IT・テクノロジー",
  "製造業",
  "小売・EC",
  "医療・ヘルスケア",
  "金融・保険",
  "不動産",
  "教育・研修",
  "飲食・食品",
  "建設・土木",
  "物流・運輸",
  "広告・マーケティング",
  "コンサルティング",
  "その他",
];

const BUDGET_OPTIONS = [
  "〜30万円",
  "30〜100万円",
  "100〜300万円",
  "300万円〜",
  "未確認",
];

const DECISION_MAKER_OPTIONS = [
  "同席あり（決裁者と話した）",
  "担当者のみ（決裁者は別）",
  "担当者 = 決裁者",
  "未確認",
];

const INITIAL_FORM: AppointmentData = {
  clientName: "",
  companyName: "",
  industry: "",
  appointmentDate: "",
  purpose: "",
  painPoints: "",
  budget: "",
  decisionMaker: "",
  nextAction: "",
  notes: "",
};

function ProposalDisplay({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* Markdown の ## 見出しをパース */
  const sections = text.split(/^## /m).filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="mt-10"
    >
      {/* ヘッダー */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-serif-jp text-xl font-bold">生成された提案資料</h2>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 rounded-full border border-ink px-4 py-2 text-sm transition-all duration-300 hover:bg-ink hover:text-base"
        >
          {copied ? (
            <>
              <Check size={14} />
              コピー済み
            </>
          ) : (
            <>
              <Copy size={14} />
              テキストをコピー
            </>
          )}
        </button>
      </div>

      {/* セクションカード */}
      <div className="space-y-4">
        {sections.map((section, i) => {
          const lineBreak = section.indexOf("\n");
          const title = lineBreak > -1 ? section.slice(0, lineBreak).trim() : section.trim();
          const body = lineBreak > -1 ? section.slice(lineBreak + 1).trim() : "";

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.07, ease: EASE }}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <h3 className="font-serif-jp mb-3 text-base font-bold text-pop">
                {title}
              </h3>
              <div className="text-sm leading-relaxed text-ink/80 whitespace-pre-wrap">
                {body}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

function SelectField({
  label,
  name,
  value,
  options,
  onChange,
  placeholder,
}: {
  label: string;
  name: keyof AppointmentData;
  value: string;
  options: string[];
  onChange: (name: keyof AppointmentData, value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-display text-xs tracking-widest text-muted">
        {label}
      </label>
      <div className="relative">
        <select
          name={name}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          className="w-full appearance-none rounded-xl border border-border bg-card px-4 py-3 pr-10 text-sm text-ink focus:border-ink focus:outline-none"
        >
          <option value="">{placeholder || "選択してください"}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
        />
      </div>
    </div>
  );
}

function TextField({
  label,
  name,
  value,
  onChange,
  placeholder,
  multiline = false,
  required = false,
}: {
  label: string;
  name: keyof AppointmentData;
  value: string;
  onChange: (name: keyof AppointmentData, value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  required?: boolean;
}) {
  const base =
    "w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-ink focus:outline-none";

  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-display text-xs tracking-widest text-muted">
        {label}
        {required && <span className="ml-1 text-pop">*</span>}
      </label>
      {multiline ? (
        <textarea
          name={name}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          placeholder={placeholder}
          rows={4}
          className={`${base} resize-none`}
        />
      ) : (
        <input
          type="text"
          name={name}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          placeholder={placeholder}
          className={base}
        />
      )}
    </div>
  );
}

export default function ProposalGenerator() {
  const [form, setForm] = useState<AppointmentData>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [proposal, setProposal] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (name: keyof AppointmentData, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setForm(INITIAL_FORM);
    setProposal(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clientName || !form.companyName || !form.purpose || !form.painPoints) {
      setError("必須項目（担当者名・会社名・目的・課題）を入力してください。");
      return;
    }

    setLoading(true);
    setError(null);
    setProposal(null);

    try {
      const res = await fetch("/api/generate-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "生成に失敗しました");
      setProposal(json.proposal);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-5 py-16 md:px-10">
      {/* ページヘッダー */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="mb-10"
      >
        <p className="font-display mb-3 text-xs tracking-widest text-pop">
          AI PROPOSAL GENERATOR
        </p>
        <h1 className="font-serif-jp mb-4 text-3xl font-bold leading-snug md:text-4xl">
          アポイント情報から
          <br />
          提案資料を自動生成
        </h1>
        <p className="text-sm leading-relaxed text-muted">
          ヒアリングした内容を入力するだけで、Claude AI がプロフェッショナルな提案書を自動で作成します。
        </p>
      </motion.div>

      {/* 入力フォーム */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
        className="rounded-2xl border border-border bg-card p-6 md:p-8"
      >
        <h2 className="font-serif-jp mb-6 text-lg font-bold">
          アポイント情報の入力
        </h2>

        <div className="grid gap-5 md:grid-cols-2">
          <TextField
            label="担当者名"
            name="clientName"
            value={form.clientName}
            onChange={handleChange}
            placeholder="山田 太郎"
            required
          />
          <TextField
            label="会社名"
            name="companyName"
            value={form.companyName}
            onChange={handleChange}
            placeholder="株式会社〇〇"
            required
          />
          <SelectField
            label="業種"
            name="industry"
            value={form.industry}
            options={INDUSTRIES}
            onChange={handleChange}
            placeholder="業種を選択"
          />
          <TextField
            label="アポイント日"
            name="appointmentDate"
            value={form.appointmentDate}
            onChange={handleChange}
            placeholder="2026年6月16日"
          />
        </div>

        <div className="mt-5 grid gap-5">
          <TextField
            label="アポイントの目的・背景"
            name="purpose"
            value={form.purpose}
            onChange={handleChange}
            placeholder="例: 新規CRM導入の相談。現在のシステムが老朽化しており、営業管理の効率化を検討している。"
            multiline
            required
          />
          <TextField
            label="課題・ペインポイント"
            name="painPoints"
            value={form.painPoints}
            onChange={handleChange}
            placeholder="例: ・顧客データがExcelで管理されておりバラバラ&#10;・商談履歴が属人化している&#10;・月次レポートに毎回2〜3日かかっている"
            multiline
            required
          />
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <SelectField
            label="予算感"
            name="budget"
            value={form.budget}
            options={BUDGET_OPTIONS}
            onChange={handleChange}
          />
          <SelectField
            label="決裁者の有無"
            name="decisionMaker"
            value={form.decisionMaker}
            options={DECISION_MAKER_OPTIONS}
            onChange={handleChange}
          />
        </div>

        <div className="mt-5 grid gap-5">
          <TextField
            label="次のアクション"
            name="nextAction"
            value={form.nextAction}
            onChange={handleChange}
            placeholder="例: 来週中に提案書を送付。2週間後に再アポ。"
          />
          <TextField
            label="その他メモ・補足"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="例: 競合他社と比較検討中。キーパーソンは営業部長の鈴木様。"
            multiline
          />
        </div>

        {/* エラー表示 */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 rounded-xl bg-pop/10 px-4 py-3 text-sm text-pop"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* ボタン */}
        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="btn-invert flex-1 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-base/40 border-t-base" />
                生成中...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                提案資料を生成する
              </>
            )}
          </button>
          {(proposal || Object.values(form).some(Boolean)) && (
            <button
              type="button"
              onClick={handleReset}
              className="btn-outline flex items-center gap-2 px-5"
            >
              <RotateCcw size={14} />
              リセット
            </button>
          )}
        </div>
      </motion.form>

      {/* 生成結果 */}
      {proposal && <ProposalDisplay text={proposal} />}
    </div>
  );
}
