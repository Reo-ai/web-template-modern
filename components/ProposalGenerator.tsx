"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";
import type { AppointmentInfo, GeneratedProposal } from "@/lib/proposal";
import { SITE_NAME } from "@/lib/config";

// ===== フォームフィールド定義 =====
const FIELDS_REQUIRED = [
  { name: "clientName",     label: "担当者名",     placeholder: "山田 太郎" },
  { name: "clientCompany",  label: "会社名",       placeholder: "株式会社〇〇" },
  { name: "clientIndustry", label: "業界",         placeholder: "例: IT・製造業・小売・医療" },
  { name: "meetingDate",    label: "アポ日時",     placeholder: "例: 2026年6月10日 14:00" },
] as const;

const FIELDS_OPTIONAL = [
  { name: "budget",   label: "予算感（任意）",         placeholder: "例: 月50万円以内 / 年間100万円程度" },
  { name: "timeline", label: "希望スケジュール（任意）", placeholder: "例: 3ヶ月以内に導入したい" },
  { name: "notes",    label: "備考（任意）",            placeholder: "その他、伝えておきたいことがあれば" },
] as const;

// ===== メインコンポーネント =====
export default function ProposalGenerator() {
  const [form, setForm] = useState<Partial<AppointmentInfo>>({});
  const [proposal, setProposal] = useState<GeneratedProposal | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const proposalRef = useRef<HTMLDivElement>(null);

  const set = (key: keyof AppointmentInfo, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setProposal(null);

    try {
      const res = await fetch("/api/generate-proposal", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "生成に失敗しました");
      setProposal(data.proposal);
      // 生成後にスクロール
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

  return (
    <div className="min-h-screen bg-base">
      {/* ページヘッダー */}
      <section className="border-b border-border px-5 pt-32 pb-12 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-5xl"
        >
          <div className="flex items-center gap-3 font-display text-xs tracking-[0.25em] text-muted">
            <span>#TOOL</span>
            <span className="h-px w-8 bg-muted" />
            <span>PROPOSAL GENERATOR</span>
          </div>
          <h1 className="mt-4 font-serif-jp text-3xl font-bold leading-tight md:text-5xl">
            提案資料を、<span className="text-pop">自動生成。</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink/75 md:text-base">
            アポイントの内容を入力するだけで、AIが貴社のサービスに合わせた
            プロフェッショナルな提案資料を瞬時に生成します。
          </p>
        </motion.div>
      </section>

      <div className="mx-auto max-w-5xl px-5 py-12 md:px-10 md:py-16">
        {/* 入力フォーム */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
              <p className="mb-6 font-display text-[10px] tracking-widest text-muted">
                STEP 01 — アポイント基本情報
              </p>
              <div className="grid gap-5 md:grid-cols-2">
                {FIELDS_REQUIRED.map(({ name, label, placeholder }) => (
                  <FormField
                    key={name}
                    label={label}
                    name={name}
                    placeholder={placeholder}
                    required
                    value={form[name] ?? ""}
                    onChange={(v) => set(name, v)}
                  />
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
              <p className="mb-6 font-display text-[10px] tracking-widest text-muted">
                STEP 02 — 課題・ゴール
              </p>
              <div className="space-y-5">
                <TextareaField
                  label="課題・ニーズ"
                  name="painPoints"
                  placeholder="例: 新規顧客の獲得に時間がかかっている。SNS運用を始めたいが人手が足りない。"
                  required
                  rows={4}
                  value={form.painPoints ?? ""}
                  onChange={(v) => set("painPoints", v)}
                />
                <TextareaField
                  label="達成したい目標"
                  name="goals"
                  placeholder="例: 3ヶ月以内に問い合わせ数を2倍にしたい。ブランド認知度を上げたい。"
                  required
                  rows={3}
                  value={form.goals ?? ""}
                  onChange={(v) => set("goals", v)}
                />
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
              <p className="mb-6 font-display text-[10px] tracking-widest text-muted">
                STEP 03 — 補足情報（任意）
              </p>
              <div className="grid gap-5 md:grid-cols-3">
                {FIELDS_OPTIONAL.map(({ name, label, placeholder }) => (
                  <FormField
                    key={name}
                    label={label}
                    name={name}
                    placeholder={placeholder}
                    value={form[name] ?? ""}
                    onChange={(v) => set(name, v)}
                  />
                ))}
              </div>
            </div>

            {error && (
              <p className="rounded-2xl bg-pop/10 px-5 py-4 text-sm text-pop">
                {error}
              </p>
            )}

            <div className="flex items-center justify-between">
              <p className="text-xs text-muted">
                生成にはANTHROPIC_API_KEYが必要です
              </p>
              <button
                type="submit"
                disabled={loading}
                className="btn-invert min-w-[180px] text-sm"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <LoadingDots />
                    生成中…
                  </span>
                ) : (
                  "提案資料を生成 →"
                )}
              </button>
            </div>
          </form>
        </motion.div>

        {/* 生成された提案書 */}
        <AnimatePresence>
          {proposal && (
            <motion.div
              ref={proposalRef}
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="mt-16"
            >
              {/* 印刷ボタン */}
              <div className="mb-6 flex items-center justify-between print:hidden">
                <h2 className="font-display text-xs tracking-widest text-muted">
                  GENERATED PROPOSAL
                </h2>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="btn-outline text-sm"
                >
                  印刷 / PDF保存 ↗
                </button>
              </div>

              {/* 提案書本体 */}
              <ProposalDocument proposal={proposal} clientInfo={form} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ===== 提案書ドキュメント =====
function ProposalDocument({
  proposal,
  clientInfo,
}: {
  proposal: GeneratedProposal;
  clientInfo: Partial<AppointmentInfo>;
}) {
  const today = new Date().toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="proposal-doc rounded-3xl border border-border bg-card overflow-hidden">
      {/* ドキュメントヘッダー */}
      <div className="border-b border-border bg-ink px-8 py-10 text-base md:px-12">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="font-display text-xs tracking-widest text-base/50">
              PROPOSAL DOCUMENT
            </p>
            <h2 className="mt-3 font-serif-jp text-2xl font-bold leading-snug text-base md:text-3xl">
              {proposal.title}
            </h2>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-display text-[10px] tracking-widest text-base/50">
              FROM
            </p>
            <p className="mt-1 font-bold text-base">{SITE_NAME}</p>
            <p className="mt-3 font-display text-[10px] tracking-widest text-base/50">
              DATE
            </p>
            <p className="mt-1 text-sm text-base">{today}</p>
          </div>
        </div>

        {clientInfo.clientCompany && (
          <div className="mt-8 border-t border-base/20 pt-6">
            <p className="font-display text-[10px] tracking-widest text-base/50">TO</p>
            <p className="mt-1 text-lg font-bold text-base">
              {clientInfo.clientCompany}
            </p>
            {clientInfo.clientName && (
              <p className="text-sm text-base/70">
                {clientInfo.clientName} 様
              </p>
            )}
          </div>
        )}
      </div>

      <div className="px-8 py-10 md:px-12">
        {/* 挨拶文 */}
        <p className="text-sm leading-relaxed text-ink/80 md:text-base">
          {proposal.greeting}
        </p>

        {/* 各セクション */}
        <div className="mt-10 space-y-10">
          {proposal.sections.map((section, i) => (
            <motion.div
              key={section.heading}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="border-t border-border pt-8"
            >
              <h3 className="font-serif-jp text-lg font-bold md:text-xl">
                {section.heading}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-ink/80 md:text-base">
                {section.body}
              </p>
              {section.bullets && section.bullets.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {section.bullets.map((bullet, bi) => (
                    <li
                      key={bi}
                      className="flex items-start gap-3 text-sm text-ink/75"
                    >
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-pop" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          ))}
        </div>

        {/* 料金提案 */}
        {proposal.pricing?.items?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 border-t border-border pt-8"
          >
            <h3 className="font-serif-jp text-lg font-bold md:text-xl">
              06. 料金プラン
            </h3>
            <div className="mt-6 overflow-hidden rounded-2xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-base">
                    <th className="px-5 py-3 text-left font-display text-[10px] tracking-widest text-muted">
                      プラン
                    </th>
                    <th className="px-5 py-3 text-left font-display text-[10px] tracking-widest text-muted">
                      金額
                    </th>
                    <th className="hidden px-5 py-3 text-left font-display text-[10px] tracking-widest text-muted md:table-cell">
                      内容
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {proposal.pricing.items.map((item, i) => (
                    <tr
                      key={i}
                      className="border-b border-border last:border-0"
                    >
                      <td className="px-5 py-4 font-medium">{item.label}</td>
                      <td className="px-5 py-4 font-bold text-pop">
                        {item.price}
                      </td>
                      <td className="hidden px-5 py-4 text-ink/70 md:table-cell">
                        {item.detail}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {proposal.pricing.note && (
              <p className="mt-3 text-xs text-muted">{proposal.pricing.note}</p>
            )}
          </motion.div>
        )}

        {/* 次のステップ */}
        {proposal.nextSteps?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 border-t border-border pt-8"
          >
            <h3 className="font-serif-jp text-lg font-bold md:text-xl">
              次のステップ
            </h3>
            <ol className="mt-6 space-y-3">
              {proposal.nextSteps.map((step, i) => (
                <li key={i} className="flex items-start gap-4">
                  <span className="font-display text-sm font-bold text-pop">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm leading-relaxed text-ink/80">
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </motion.div>
        )}

        {/* クロージング */}
        {proposal.closing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mt-10 rounded-2xl bg-base px-6 py-6 text-center"
          >
            <p className="font-serif-jp text-base leading-relaxed text-ink/80 md:text-lg">
              {proposal.closing}
            </p>
            <p className="mt-4 font-bold">{SITE_NAME}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ===== フォームフィールド共通コンポーネント =====
function FormField({
  label,
  name,
  placeholder,
  required,
  value,
  onChange,
}: {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
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
        type="text"
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-border bg-base px-4 py-3 text-sm transition-colors focus:border-ink focus:outline-none"
      />
    </div>
  );
}

function TextareaField({
  label,
  name,
  placeholder,
  required,
  rows,
  value,
  onChange,
}: {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  value: string;
  onChange: (v: string) => void;
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
        rows={rows ?? 4}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full resize-none rounded-2xl border border-border bg-base px-4 py-3 text-sm transition-colors focus:border-ink focus:outline-none"
      />
    </div>
  );
}

// ===== ローディングアニメーション =====
function LoadingDots() {
  return (
    <span className="flex gap-1" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-current animate-pulse"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </span>
  );
}
