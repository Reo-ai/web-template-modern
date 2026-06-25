"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Copy, Printer, RotateCcw } from "lucide-react";
import { useState } from "react";

// フェーズ管理
type Phase = "form" | "generating" | "result";

// フォーム入力データ
type FormData = {
  clientName: string;
  company: string;
  industry: string;
  appointmentDate: string;
  needs: string;
  budget: string;
  deadline: string;
  notes: string;
};

// 提案書のセクション
type Section = {
  title: string;
  content: string;
};

const INDUSTRIES = [
  "小売・EC",
  "飲食・フード",
  "美容・ウェルネス",
  "医療・ヘルスケア",
  "教育・スクール",
  "不動産",
  "建設・工務店",
  "士業（税理士・弁護士など）",
  "IT・テクノロジー",
  "クリエイター・フリーランス",
  "製造業",
  "サービス業",
  "その他",
];

const BUDGETS = [
  "〜30万円",
  "30〜50万円",
  "50〜100万円",
  "100〜200万円",
  "200万円以上",
  "要相談",
];

// マークダウンテキストをセクション配列に分割
function parseMarkdown(text: string): Section[] {
  const parts = text.split(/^## /m);
  return parts
    .slice(1)
    .map((part) => {
      const newlineIdx = part.indexOf("\n");
      return {
        title: part.slice(0, newlineIdx).trim(),
        content: part.slice(newlineIdx + 1).trim(),
      };
    })
    .filter((s) => s.title && s.content);
}

// インライン装飾（**太字**）を処理
function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/);
  if (parts.length === 1) return text;
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} className="font-bold text-ink">
            {part.slice(2, -2)}
          </strong>
        ) : (
          part
        )
      )}
    </>
  );
}

// セクション内容（### 見出し・リスト・段落）を JSX に変換
function renderContent(content: string): React.ReactNode {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];
  let key = 0;

  const flushList = () => {
    if (listItems.length === 0) return;
    elements.push(
      <ul key={key++} className="my-3 space-y-2">
        {listItems.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-pop" />
            <span className="leading-relaxed">{renderInline(item)}</span>
          </li>
        ))}
      </ul>
    );
    listItems = [];
  };

  for (const line of lines) {
    if (line.startsWith("### ")) {
      flushList();
      elements.push(
        <h3
          key={key++}
          className="mt-6 mb-3 font-serif-jp text-lg font-bold text-ink"
        >
          {line.slice(4)}
        </h3>
      );
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      listItems.push(line.slice(2));
    } else if (line.trim() === "") {
      flushList();
    } else if (line.trim()) {
      flushList();
      elements.push(
        <p key={key++} className="my-2 leading-relaxed">
          {renderInline(line)}
        </p>
      );
    }
  }
  flushList();

  return <>{elements}</>;
}

export default function ProposalGenerator() {
  const [phase, setPhase] = useState<Phase>("form");
  const [streamingText, setStreamingText] = useState("");
  const [sections, setSections] = useState<Section[]>([]);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const data = Object.fromEntries(
      new FormData(e.currentTarget).entries()
    ) as unknown as FormData;
    setFormData(data);
    setPhase("generating");
    setStreamingText("");

    try {
      const response = await fetch("/api/generate-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("提案書の生成に失敗しました。API キーを確認してください。");
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
        setStreamingText(fullText);
      }

      setSections(parseMarkdown(fullText));
      setPhase("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
      setPhase("form");
    }
  };

  const handleReset = () => {
    setPhase("form");
    setStreamingText("");
    setSections([]);
    setFormData(null);
    setError(null);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(streamingText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-base pt-24 pb-24">
      <div className="mx-auto max-w-4xl px-5 md:px-10">
        <AnimatePresence mode="wait">
          {/* ─── フォーム画面 ─── */}
          {phase === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mb-12">
                <div className="flex items-center gap-3 font-display text-xs tracking-[0.25em] text-muted">
                  <span>#TOOL</span>
                  <span className="h-px w-8 bg-muted" />
                  <span>PROPOSAL GENERATOR</span>
                </div>
                <h1 className="mt-4 font-serif-jp text-3xl font-bold md:text-5xl">
                  提案資料ジェネレーター
                </h1>
                <p className="mt-5 max-w-2xl text-sm leading-relaxed text-ink/75 md:text-base">
                  アポイントでヒアリングした内容を入力すると、AI が自動で提案書を生成します。
                </p>
              </div>

              {error && (
                <div className="mb-6 rounded-2xl border border-pop/30 bg-pop/5 p-4 text-sm text-pop">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <Field
                    label="顧客名"
                    name="clientName"
                    placeholder="山田 太郎"
                    required
                  />
                  <Field
                    label="会社名・屋号"
                    name="company"
                    placeholder="株式会社〇〇"
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <SelectField
                    label="業種"
                    name="industry"
                    options={INDUSTRIES}
                  />
                  <Field
                    label="アポイント日"
                    name="appointmentDate"
                    type="date"
                  />
                </div>

                <TextareaField
                  label="課題・ニーズ（ヒアリング内容）"
                  name="needs"
                  placeholder="アポイントでヒアリングした課題や要望を具体的に記入してください。例：「現状、集客のほぼすべてが紹介経由で、オンラインからの問い合わせがゼロ。ウェブからのリード獲得を始めたい」「競合他社がリニューアルしており、見た目の古さを気にしている」など"
                  required
                  rows={6}
                />

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <SelectField
                    label="予算感"
                    name="budget"
                    options={BUDGETS}
                  />
                  <Field
                    label="希望納期"
                    name="deadline"
                    placeholder="例: 3ヶ月以内、来年3月まで"
                  />
                </div>

                <TextareaField
                  label="特記事項（任意）"
                  name="notes"
                  placeholder="競合他社情報、特別な要件、注意点など"
                  rows={3}
                />

                <div className="pt-2">
                  <button
                    type="submit"
                    className="btn-invert w-full text-sm md:w-auto md:min-w-64"
                  >
                    提案書を生成する →
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* ─── 生成中画面 ─── */}
          {phase === "generating" && (
            <motion.div
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="mb-8">
                <div className="flex items-center gap-3 font-display text-xs tracking-[0.25em] text-muted">
                  <span className="animate-pulse text-pop">●</span>
                  <span>GENERATING</span>
                </div>
                <h2 className="mt-4 font-serif-jp text-2xl font-bold md:text-3xl">
                  提案書を生成しています…
                </h2>
                <p className="mt-2 text-sm text-muted">
                  そのままお待ちください。30秒ほどかかる場合があります。
                </p>
              </div>

              {/* ストリーミングテキスト表示 */}
              <div className="min-h-64 rounded-3xl border border-border bg-card p-6 md:p-8">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-ink/80">
                  {streamingText}
                  <span className="animate-pulse text-pop">▌</span>
                </pre>
              </div>
            </motion.div>
          )}

          {/* ─── 結果画面 ─── */}
          {phase === "result" && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* ツールバー（印刷時は非表示） */}
              <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
                <button
                  onClick={handleReset}
                  className="btn-outline flex items-center justify-center gap-2 text-sm"
                >
                  <RotateCcw size={14} />
                  再入力する
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={handleCopy}
                    className="btn-outline flex flex-1 items-center justify-center gap-2 text-sm sm:flex-none"
                  >
                    <Copy size={14} />
                    {copied ? "コピー完了!" : "テキストをコピー"}
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="btn-invert flex flex-1 items-center justify-center gap-2 text-sm sm:flex-none"
                  >
                    <Printer size={14} />
                    印刷
                  </button>
                </div>
              </div>

              {/* 提案書本体 */}
              <div
                id="proposal-document"
                className="rounded-3xl border border-border bg-card p-8 md:p-12 print:rounded-none print:border-none print:p-0"
              >
                {/* ドキュメントヘッダー */}
                <div className="mb-10 border-b border-border pb-8">
                  <p className="font-display text-xs tracking-widest text-muted">
                    PROPOSAL DOCUMENT
                  </p>
                  <h1 className="mt-4 font-serif-jp text-2xl font-bold leading-tight md:text-4xl">
                    {formData?.clientName
                      ? `${formData.clientName} 様 ご提案書`
                      : "ご提案書"}
                  </h1>
                  <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted">
                    <span>
                      作成日: {new Date().toLocaleDateString("ja-JP")}
                    </span>
                    {formData?.company && <span>{formData.company}</span>}
                    {formData?.industry && <span>{formData.industry}</span>}
                  </div>
                </div>

                {/* 各セクション */}
                {sections.map((section, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: i * 0.08,
                      duration: 0.5,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="mb-10 last:mb-0"
                  >
                    <h2 className="mb-4 font-serif-jp text-xl font-bold text-ink md:text-2xl">
                      {section.title}
                    </h2>
                    <div className="text-sm leading-relaxed text-ink/85 md:text-base">
                      {renderContent(section.content)}
                    </div>
                  </motion.div>
                ))}

                {/* ドキュメントフッター */}
                <div className="mt-12 border-t border-border pt-8">
                  <p className="text-center text-xs text-muted">
                    本提案書に関するご質問は、担当者までお気軽にお問い合わせください。
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── 共通フィールドコンポーネント ───

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
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
        className="w-full rounded-2xl border border-border bg-base px-4 py-3 text-sm transition-colors focus:border-ink focus:outline-none"
      />
    </div>
  );
}

function SelectField({
  label,
  name,
  options,
  required,
}: {
  label: string;
  name: string;
  options: string[];
  required?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block font-display text-[10px] tracking-widest text-muted"
      >
        {label} {required && <span className="text-pop">*</span>}
      </label>
      <select
        id={name}
        name={name}
        defaultValue=""
        className="w-full rounded-2xl border border-border bg-base px-4 py-3 text-sm transition-colors focus:border-ink focus:outline-none"
      >
        <option value="">選択してください</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function TextareaField({
  label,
  name,
  required,
  placeholder,
  rows = 4,
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  rows?: number;
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
        className="w-full resize-none rounded-2xl border border-border bg-base px-4 py-3 text-sm transition-colors focus:border-ink focus:outline-none"
      />
    </div>
  );
}
