"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { ENABLE_PROPOSAL_GENERATOR } from "@/lib/config";
import type { AppointmentInput, GeneratedProposal } from "@/lib/proposal/types";

/**
 * 提案資料自動生成ページ。
 * アポイント(商談)のヒアリング内容を入力すると、AI が提案資料の構成を生成する。
 *
 * 【編集ポイント】
 * - PAGE_TITLE / PAGE_DESCRIPTION : 見出しコピー
 * - 生成ロジックは lib/proposal/generate.ts(サーバー専用)
 * - 利用には環境変数 ANTHROPIC_API_KEY が必要(.env.example 参照)
 */

const PAGE_TITLE = "商談内容から提案資料を自動作成";
const PAGE_DESCRIPTION =
  "アポイントのヒアリング内容を入力すると、AIが提案資料のたたき台を作成します。";

const initialForm: AppointmentInput = {
  clientName: "",
  contactPerson: "",
  industry: "",
  budget: "",
  timeline: "",
  tone: "formal",
  notes: "",
};

export default function ProposalPage() {
  const [form, setForm] = useState<AppointmentInput>(initialForm);
  const [proposal, setProposal] = useState<GeneratedProposal | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateField = <K extends keyof AppointmentInput>(
    key: K,
    value: AppointmentInput[K]
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "生成に失敗しました。");
      }
      setProposal(data.proposal as GeneratedProposal);
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  if (!ENABLE_PROPOSAL_GENERATOR) {
    return (
      <section className="px-5 py-32 text-center md:px-10">
        <p className="text-sm text-muted">この機能は現在無効になっています。</p>
      </section>
    );
  }

  return (
    <section className="relative w-full px-5 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center gap-3 font-display text-xs tracking-[0.25em] text-muted">
            <span>PROPOSAL GENERATOR</span>
          </div>
          <h1 className="mt-4 font-serif-jp text-3xl font-bold leading-tight tracking-tight md:text-5xl">
            {PAGE_TITLE}
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-ink/75 md:text-base">
            {PAGE_DESCRIPTION}
          </p>
        </motion.div>

        {!proposal ? (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            onSubmit={onSubmit}
            className="mt-12 space-y-6"
          >
            <div className="grid gap-6 md:grid-cols-2">
              <Field
                label="お客様名・会社名"
                required
                value={form.clientName}
                onChange={(v) => updateField("clientName", v)}
                placeholder="株式会社サンプル"
              />
              <Field
                label="先方ご担当者名(任意)"
                value={form.contactPerson ?? ""}
                onChange={(v) => updateField("contactPerson", v)}
                placeholder="山田 太郎 様"
              />
              <Field
                label="業種"
                required
                value={form.industry}
                onChange={(v) => updateField("industry", v)}
                placeholder="飲食店 / 美容室 / IT企業 など"
              />
              <Field
                label="予算感(任意)"
                value={form.budget ?? ""}
                onChange={(v) => updateField("budget", v)}
                placeholder="月額10万円程度 など"
              />
              <Field
                label="希望スケジュール(任意)"
                value={form.timeline ?? ""}
                onChange={(v) => updateField("timeline", v)}
                placeholder="来月中に導入したい など"
              />
              <div>
                <label className="mb-2 block font-display text-[10px] tracking-widest text-muted">
                  提案書の文体
                </label>
                <select
                  value={form.tone}
                  onChange={(e) =>
                    updateField(
                      "tone",
                      e.target.value as AppointmentInput["tone"]
                    )
                  }
                  className="w-full rounded-2xl border border-border bg-base px-4 py-3 text-sm transition-colors focus:border-ink focus:outline-none"
                >
                  <option value="formal">フォーマル</option>
                  <option value="friendly">親しみやすい</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block font-display text-[10px] tracking-widest text-muted">
                商談メモ・ヒアリング内容 <span className="text-pop">*</span>
              </label>
              <textarea
                required
                rows={8}
                value={form.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                placeholder="アポイントで伺った課題・要望・現状の悩みなどを自由に記入してください。"
                className="w-full resize-none rounded-2xl border border-border bg-base px-4 py-3 text-sm transition-colors focus:border-ink focus:outline-none"
              />
            </div>

            {error && <p className="text-sm text-pop">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="btn-invert w-full text-sm md:w-auto"
            >
              {loading ? "生成中…" : "提案資料を生成する →"}
            </button>
          </motion.form>
        ) : (
          <ProposalResult
            proposal={proposal}
            onReset={() => {
              setProposal(null);
              setForm(initialForm);
            }}
          />
        )}
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block font-display text-[10px] tracking-widest text-muted">
        {label} {required && <span className="text-pop">*</span>}
      </label>
      <input
        type="text"
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-border bg-base px-4 py-3 text-sm transition-colors focus:border-ink focus:outline-none"
      />
    </div>
  );
}

function ProposalResult({
  proposal,
  onReset,
}: {
  proposal: GeneratedProposal;
  onReset: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="mt-12"
    >
      <div className="no-print mb-8 flex flex-col gap-3 md:flex-row">
        <button onClick={() => window.print()} className="btn-invert text-sm">
          印刷 / PDF保存
        </button>
        <button onClick={onReset} className="btn-outline text-sm">
          もう一度作成する
        </button>
      </div>

      <article className="proposal-print rounded-3xl border border-border bg-card p-8 md:p-12">
        <p className="font-display text-xs tracking-widest text-muted">
          PROPOSAL FOR {proposal.clientName}
        </p>
        <h2 className="mt-3 font-serif-jp text-2xl font-bold leading-tight md:text-4xl">
          {proposal.title}
        </h2>

        <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-ink/85 md:text-base">
          {proposal.summary}
        </p>

        <ProposalBlock title="課題">
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed md:text-base">
            {proposal.challenges.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </ProposalBlock>

        <ProposalBlock title="ご提案内容">
          <div className="space-y-6">
            {proposal.solutionSections.map((s, i) => (
              <div key={i}>
                <h3 className="font-serif-jp text-lg font-bold">{s.heading}</h3>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink/80 md:text-base">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </ProposalBlock>

        <ProposalBlock title="お見積り">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-2 pr-4 font-display text-xs tracking-widest text-muted">
                    項目
                  </th>
                  <th className="py-2 pr-4 font-display text-xs tracking-widest text-muted">
                    内容
                  </th>
                  <th className="py-2 font-display text-xs tracking-widest text-muted">
                    価格
                  </th>
                </tr>
              </thead>
              <tbody>
                {proposal.plans.map((p, i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="py-3 pr-4 font-medium">{p.name}</td>
                    <td className="py-3 pr-4 text-ink/80">{p.description}</td>
                    <td className="py-3 whitespace-nowrap">{p.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ProposalBlock>

        <ProposalBlock title="導入スケジュール">
          <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed md:text-base">
            {proposal.schedule.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </ProposalBlock>

        <p className="mt-10 whitespace-pre-line text-sm leading-relaxed text-ink/85 md:text-base">
          {proposal.closingMessage}
        </p>
      </article>
    </motion.div>
  );
}

function ProposalBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-10 border-t border-border pt-8">
      <p className="mb-4 font-display text-xs tracking-widest text-muted">
        {title}
      </p>
      {children}
    </div>
  );
}
