"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";
import { Check, Copy, FileText, Loader2, RefreshCw } from "lucide-react";

/**
 * アポイント情報を入力して提案資料を自動生成するコンポーネント。
 * Claude API にストリーミングリクエストを送り、リアルタイムで結果を表示する。
 */

type FormData = {
  clientName: string;
  clientCompany: string;
  appointmentDate: string;
  purpose: string;
  needs: string;
  budget: string;
  schedule: string;
  notes: string;
};

const INITIAL_FORM: FormData = {
  clientName: "",
  clientCompany: "",
  appointmentDate: "",
  purpose: "",
  needs: "",
  budget: "",
  schedule: "",
  notes: "",
};

// マークダウン風テキストをReact要素にレンダリング
function ProposalContent({ text }: { text: string }) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("## ")) {
      elements.push(
        <h2
          key={key++}
          className="mt-8 mb-3 font-serif-jp text-lg font-bold text-ink first:mt-0 md:text-xl"
        >
          {line.replace(/^## /, "")}
        </h2>
      );
    } else if (line.startsWith("# ")) {
      elements.push(
        <h1
          key={key++}
          className="mt-6 mb-4 font-serif-jp text-xl font-bold text-ink first:mt-0 md:text-2xl"
        >
          {line.replace(/^# /, "")}
        </h1>
      );
    } else if (line.startsWith("---")) {
      elements.push(<hr key={key++} className="my-6 border-border" />);
    } else if (line.startsWith("・") || line.startsWith("- ")) {
      elements.push(
        <div key={key++} className="flex gap-2 py-0.5 text-sm text-ink/80">
          <span className="mt-0.5 shrink-0 text-pop">▸</span>
          <span>{line.replace(/^[・\-] ?/, "")}</span>
        </div>
      );
    } else if (line.trim() === "") {
      elements.push(<div key={key++} className="h-2" />);
    } else {
      elements.push(
        <p key={key++} className="text-sm leading-relaxed text-ink/80">
          {line}
        </p>
      );
    }
  }

  return <div className="space-y-0.5">{elements}</div>;
}

export default function ProposalGenerator() {
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [proposal, setProposal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const proposalRef = useRef<HTMLDivElement>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setProposal("");
    setError("");

    try {
      const res = await fetch("/api/generate-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("APIエラーが発生しました");
      if (!res.body) throw new Error("レスポンスボディがありません");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setProposal((prev) => prev + decoder.decode(value, { stream: true }));
        // 生成中は自動スクロール
        proposalRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(proposal);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setProposal("");
    setForm(INITIAL_FORM);
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* 左: 入力フォーム */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <FileText size={18} className="text-pop" />
              <h2 className="font-display text-xs tracking-widest text-muted">
                APPOINTMENT DETAILS
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="クライアント名"
                  name="clientName"
                  value={form.clientName}
                  onChange={handleChange}
                  required
                  placeholder="山田 太郎"
                />
                <Field
                  label="会社名・組織名"
                  name="clientCompany"
                  value={form.clientCompany}
                  onChange={handleChange}
                  placeholder="株式会社○○"
                />
              </div>

              <Field
                label="アポイント日時"
                name="appointmentDate"
                value={form.appointmentDate}
                onChange={handleChange}
                required
                type="datetime-local"
              />

              <TextareaField
                label="商談の目的・背景"
                name="purpose"
                value={form.purpose}
                onChange={handleChange}
                required
                placeholder="例: 新サービス導入の検討。現行システムの課題を解決したい。"
                rows={3}
              />

              <TextareaField
                label="ヒアリング内容・ニーズ"
                name="needs"
                value={form.needs}
                onChange={handleChange}
                required
                placeholder="例: 月30件の問い合わせ対応を効率化したい。予約管理を自動化したい。"
                rows={4}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="予算感（任意）"
                  name="budget"
                  value={form.budget}
                  onChange={handleChange}
                  placeholder="例: 月額10万円前後"
                />
                <Field
                  label="希望スケジュール（任意）"
                  name="schedule"
                  value={form.schedule}
                  onChange={handleChange}
                  placeholder="例: 3ヶ月以内に導入"
                />
              </div>

              <TextareaField
                label="その他メモ（任意）"
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="特記事項・次回アポの約束など"
                rows={2}
              />

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-invert flex w-full items-center justify-center gap-2 text-sm"
                >
                  {loading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      生成中…
                    </>
                  ) : (
                    "提案資料を生成する →"
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>

        {/* 右: 生成結果 */}
        <div>
          <AnimatePresence mode="wait">
            {!proposal && !loading && !error && (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex h-full min-h-[400px] items-center justify-center rounded-3xl border border-dashed border-border bg-base"
              >
                <div className="text-center">
                  <FileText size={40} className="mx-auto mb-3 text-border" />
                  <p className="font-display text-xs tracking-widest text-muted">
                    PROPOSAL WILL APPEAR HERE
                  </p>
                  <p className="mt-2 text-xs text-muted/70">
                    左のフォームを入力して生成してください
                  </p>
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center"
              >
                <p className="text-sm text-red-600">{error}</p>
                <button
                  onClick={handleReset}
                  className="mt-4 text-xs text-muted underline"
                >
                  やり直す
                </button>
              </motion.div>
            )}

            {(proposal || loading) && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-3xl border border-border bg-card"
              >
                {/* ツールバー */}
                <div className="flex items-center justify-between border-b border-border px-6 py-4">
                  <div className="flex items-center gap-2">
                    {loading && (
                      <Loader2 size={12} className="animate-spin text-pop" />
                    )}
                    <span className="font-display text-[10px] tracking-widest text-muted">
                      {loading ? "GENERATING…" : "PROPOSAL READY"}
                    </span>
                  </div>
                  {!loading && proposal && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleReset}
                        className="flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-[10px] font-display tracking-widest text-muted transition-colors hover:border-ink hover:text-ink"
                      >
                        <RefreshCw size={10} />
                        RESET
                      </button>
                      <button
                        onClick={handleCopy}
                        className="flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-[10px] font-display tracking-widest text-muted transition-colors hover:border-ink hover:text-ink"
                      >
                        {copied ? (
                          <>
                            <Check size={10} className="text-green-600" />
                            COPIED
                          </>
                        ) : (
                          <>
                            <Copy size={10} />
                            COPY
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* 提案内容 */}
                <div
                  ref={proposalRef}
                  className="max-h-[600px] overflow-y-auto p-6 md:p-8"
                >
                  <ProposalContent text={proposal} />
                  {loading && (
                    <span className="inline-block h-4 w-0.5 animate-pulse bg-pop" />
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/** テキスト入力フィールド */
function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block font-display text-[10px] tracking-widest text-muted"
      >
        {label} {required && <span className="text-pop">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-border bg-base px-4 py-2.5 text-sm transition-colors focus:border-ink focus:outline-none"
      />
    </div>
  );
}

/** テキストエリアフィールド */
function TextareaField({
  label,
  name,
  value,
  onChange,
  required,
  placeholder,
  rows = 3,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  required?: boolean;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block font-display text-[10px] tracking-widest text-muted"
      >
        {label} {required && <span className="text-pop">*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        rows={rows}
        className="w-full resize-none rounded-2xl border border-border bg-base px-4 py-2.5 text-sm transition-colors focus:border-ink focus:outline-none"
      />
    </div>
  );
}
