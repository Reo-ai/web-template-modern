"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";
import type { AppointmentData } from "@/app/api/proposal/route";

/* ======================================================================
   フォームフィールドの定義
   ====================================================================== */
const FIELDS: {
  key: keyof AppointmentData;
  label: string;
  placeholder: string;
  required?: boolean;
  multiline?: boolean;
}[] = [
  {
    key: "clientName",
    label: "クライアント名・会社名",
    placeholder: "例: 株式会社〇〇 / 田中 様",
    required: true,
  },
  {
    key: "industry",
    label: "業種・事業内容",
    placeholder: "例: 飲食店（カフェ）/ Webマーケティング会社",
    required: true,
  },
  {
    key: "challenge",
    label: "抱えている課題・ニーズ",
    placeholder: "例: 集客が伸び悩んでいる。SNS運用をどう改善すればよいかわからない。",
    required: true,
    multiline: true,
  },
  {
    key: "goal",
    label: "達成したいゴール",
    placeholder: "例: 3ヶ月以内に来店数を1.5倍にしたい",
    required: true,
    multiline: true,
  },
  {
    key: "budget",
    label: "予算感（目安）",
    placeholder: "例: 月額10〜20万円 / 初期費用50万円以内",
  },
  {
    key: "timeline",
    label: "希望期間・納期",
    placeholder: "例: 3ヶ月 / できれば年内",
  },
  {
    key: "notes",
    label: "補足・特記事項",
    placeholder: "例: 前回の施策がうまくいかなかった背景、競合情報など",
    multiline: true,
  },
];

/* ======================================================================
   Markdown → 簡易 HTML レンダラ(依存ゼロ)
   ====================================================================== */
function renderMarkdown(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/^## (.+)$/gm, '<h2 class="proposal-h2">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 class="proposal-h3">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>[\s\S]*?<\/li>\n?)+/g, (match) => `<ul class="proposal-ul">${match}</ul>`)
    .replace(/^(?!<[hul]).+$/gm, (line) =>
      line.trim() === "" ? "" : `<p class="proposal-p">${line}</p>`
    )
    .replace(/---/g, '<hr class="proposal-hr" />')
    .replace(/\n{3,}/g, "\n\n");
}

/* ======================================================================
   メインコンポーネント
   ====================================================================== */
export default function ProposalGenerator() {
  const [form, setForm] = useState<AppointmentData>({
    clientName: "",
    industry: "",
    challenge: "",
    goal: "",
    budget: "",
    timeline: "",
    notes: "",
  });
  const [proposal, setProposal] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const proposalRef = useRef<HTMLDivElement>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProposal("");
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok || !res.body) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? "生成に失敗しました");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setProposal(accumulated);

        if (proposalRef.current) {
          proposalRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => window.print();

  const handleReset = () => {
    setProposal("");
    setError(null);
  };

  return (
    <div className="w-full">
      {/* 入力フォーム */}
      <AnimatePresence>
        {!proposal && (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            onSubmit={handleSubmit}
            className="mx-auto max-w-2xl space-y-6"
          >
            {FIELDS.map(({ key, label, placeholder, required, multiline }) =>
              multiline ? (
                <div key={key}>
                  <label
                    htmlFor={key}
                    className="mb-2 block font-display text-[10px] tracking-widest text-muted"
                  >
                    {label} {required && <span className="text-pop">*</span>}
                  </label>
                  <textarea
                    id={key}
                    name={key}
                    rows={3}
                    required={required}
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={handleChange}
                    className="w-full resize-none rounded-2xl border border-border bg-card px-4 py-3 text-sm transition-colors focus:border-ink focus:outline-none"
                  />
                </div>
              ) : (
                <div key={key}>
                  <label
                    htmlFor={key}
                    className="mb-2 block font-display text-[10px] tracking-widest text-muted"
                  >
                    {label} {required && <span className="text-pop">*</span>}
                  </label>
                  <input
                    id={key}
                    name={key}
                    type="text"
                    required={required}
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm transition-colors focus:border-ink focus:outline-none"
                  />
                </div>
              )
            )}

            {error && (
              <p className="rounded-2xl border border-pop/30 bg-pop/5 px-4 py-3 text-sm text-pop">
                {error}
              </p>
            )}

            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-muted">
                必須項目（<span className="text-pop">*</span>）を入力後、生成ボタンを押してください。
              </p>
              <button
                type="submit"
                disabled={loading}
                className="btn-invert shrink-0 text-sm disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <SpinnerIcon />
                    生成中…
                  </span>
                ) : (
                  "提案資料を生成 →"
                )}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* 生成中プログレス */}
      {loading && proposal === "" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-16 flex flex-col items-center gap-4 text-center"
        >
          <SpinnerIcon className="h-8 w-8 text-pop" />
          <p className="text-sm text-muted">AIが提案資料を生成しています…</p>
        </motion.div>
      )}

      {/* 提案書出力エリア */}
      <AnimatePresence>
        {proposal && (
          <motion.div
            key="proposal"
            ref={proposalRef}
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* 操作バー */}
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4 print:hidden">
              <div>
                <p className="font-display text-[10px] tracking-widest text-pop">
                  PROPOSAL READY
                </p>
                <p className="mt-1 text-sm text-muted">
                  提案資料が生成されました。印刷またはPDF保存が可能です。
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={handleReset} className="btn-outline text-sm">
                  ← 入力に戻る
                </button>
                <button onClick={handlePrint} className="btn-invert text-sm">
                  印刷 / PDF保存
                </button>
              </div>
            </div>

            {/* 提案書本体 */}
            <div className="proposal-doc rounded-3xl border border-border bg-card p-8 md:p-12 print:border-0 print:p-0 print:shadow-none">
              {/* ヘッダー(印刷用) */}
              <div className="mb-8 hidden border-b border-border pb-6 print:block">
                <p className="font-display text-xs tracking-widest text-muted">
                  PROPOSAL DOCUMENT
                </p>
                <p className="mt-1 text-xs text-muted">
                  作成日: {new Date().toLocaleDateString("ja-JP")}
                </p>
              </div>

              <div
                className="proposal-body"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(proposal) }}
              />

              {loading && (
                <span className="mt-2 inline-block h-4 w-0.5 animate-pulse bg-ink" />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 印刷用グローバルスタイル */}
      <style jsx global>{`
        @media print {
          header, footer, .chatbot-widget { display: none !important; }
          body { background: white; }
        }
        .proposal-h2 {
          font-family: var(--font-shippori-mincho), serif;
          font-size: 1.25rem;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 0.75rem;
          padding-bottom: 0.4rem;
          border-bottom: 1px solid var(--border);
          color: var(--foreground);
        }
        .proposal-h3 {
          font-size: 1rem;
          font-weight: 600;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
          color: var(--foreground);
        }
        .proposal-p {
          font-size: 0.9rem;
          line-height: 1.8;
          color: color-mix(in srgb, var(--foreground) 85%, transparent);
          margin-bottom: 0.75rem;
        }
        .proposal-ul {
          list-style: disc;
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }
        .proposal-ul li {
          font-size: 0.9rem;
          line-height: 1.7;
          margin-bottom: 0.3rem;
          color: color-mix(in srgb, var(--foreground) 85%, transparent);
        }
        .proposal-hr {
          border: none;
          border-top: 1px solid var(--border);
          margin: 2rem 0;
        }
      `}</style>
    </div>
  );
}

function SpinnerIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
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
