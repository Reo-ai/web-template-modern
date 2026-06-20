"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";
import SectionHeading from "./SectionHeading";

/** フォームのフィールド定義 */
type FormData = {
  companyName: string;
  industry: string;
  contactName: string;
  contactRole: string;
  challenges: string;
  currentSituation: string;
  budget: string;
  schedule: string;
  notes: string;
};

const INITIAL_FORM: FormData = {
  companyName: "",
  industry: "",
  contactName: "",
  contactRole: "",
  challenges: "",
  currentSituation: "",
  budget: "",
  schedule: "",
  notes: "",
};

/** マークダウン風テキストをシンプルにレンダリングする */
function renderProposalLine(line: string, index: number) {
  if (line.startsWith("# ")) {
    return (
      <h1
        key={index}
        className="font-serif-jp mt-8 mb-4 text-2xl font-bold tracking-tight md:text-3xl"
      >
        {line.slice(2)}
      </h1>
    );
  }
  if (line.startsWith("## ")) {
    return (
      <h2
        key={index}
        className="font-serif-jp mt-8 mb-3 border-b border-border pb-2 text-xl font-bold tracking-tight text-ink md:text-2xl"
      >
        {line.slice(3)}
      </h2>
    );
  }
  if (line.startsWith("### ")) {
    return (
      <h3
        key={index}
        className="font-serif-jp mt-5 mb-2 text-base font-bold text-ink md:text-lg"
      >
        {line.slice(4)}
      </h3>
    );
  }
  if (line.startsWith("- ") || line.startsWith("・")) {
    return (
      <li key={index} className="ml-4 list-none text-sm leading-relaxed text-ink/80 md:text-base">
        <span className="mr-2 text-pop">▸</span>
        {line.startsWith("- ") ? line.slice(2) : line.slice(1)}
      </li>
    );
  }
  if (line.trim() === "") {
    return <div key={index} className="h-2" />;
  }
  // 太字(**text**)を処理
  const boldPattern = /\*\*(.+?)\*\*/g;
  if (boldPattern.test(line)) {
    const parts = line.split(/\*\*(.+?)\*\*/g);
    return (
      <p key={index} className="text-sm leading-relaxed text-ink/80 md:text-base">
        {parts.map((part, i) =>
          i % 2 === 1 ? (
            <strong key={i} className="font-bold text-ink">
              {part}
            </strong>
          ) : (
            part
          )
        )}
      </p>
    );
  }
  return (
    <p key={index} className="text-sm leading-relaxed text-ink/80 md:text-base">
      {line}
    </p>
  );
}

export default function ProposalGenerator() {
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [status, setStatus] = useState<"idle" | "generating" | "done" | "error">("idle");
  const [proposal, setProposal] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const proposalRef = useRef<HTMLDivElement>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("generating");
    setProposal("");
    setErrorMsg("");

    // 少し遅延してからスクロール(生成開始後に結果エリアへ)
    setTimeout(() => {
      proposalRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 300);

    try {
      const res = await fetch("/api/generate-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok || !res.body) {
        throw new Error(`HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6);
          if (payload === "[DONE]") {
            setStatus("done");
            return;
          }
          try {
            const parsed = JSON.parse(payload);
            if (parsed.error) {
              setErrorMsg(parsed.error);
              setStatus("error");
              return;
            }
            if (parsed.text) {
              setProposal((prev) => prev + parsed.text);
            }
          } catch {
            // JSON パースエラーは無視
          }
        }
      }
      setStatus("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "予期しないエラーが発生しました");
      setStatus("error");
    }
  };

  const handleReset = () => {
    setStatus("idle");
    setProposal("");
    setForm(INITIAL_FORM);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="w-full">
      {/* フォームセクション */}
      <section className="relative w-full px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-4xl">
          <SectionHeading
            number="001"
            label="APPOINTMENT INFO"
            title="アポイント情報を入力"
            description="商談・ヒアリング内容を入力すると、AIが自動で提案資料を作成します。"
          />

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            onSubmit={handleSubmit}
            className="space-y-8"
          >
            {/* 会社・担当者情報 */}
            <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
              <p className="mb-6 font-display text-[10px] tracking-widest text-muted">
                クライアント情報
              </p>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Field
                  label="会社名"
                  name="companyName"
                  value={form.companyName}
                  onChange={handleChange}
                  placeholder="株式会社〇〇"
                  required
                />
                <Field
                  label="業種"
                  name="industry"
                  value={form.industry}
                  onChange={handleChange}
                  placeholder="例: IT・SaaS / 製造業 / 小売業"
                  required
                />
                <Field
                  label="担当者名"
                  name="contactName"
                  value={form.contactName}
                  onChange={handleChange}
                  placeholder="山田 太郎"
                  required
                />
                <Field
                  label="担当者役職"
                  name="contactRole"
                  value={form.contactRole}
                  onChange={handleChange}
                  placeholder="例: 営業部長 / CTO / 代表取締役"
                />
              </div>
            </div>

            {/* 課題・現状 */}
            <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
              <p className="mb-6 font-display text-[10px] tracking-widest text-muted">
                課題・ニーズ
              </p>
              <div className="space-y-5">
                <TextareaField
                  label="課題・ニーズ"
                  name="challenges"
                  value={form.challenges}
                  onChange={handleChange}
                  placeholder="例: 既存顧客の離脱が増えており、CX改善が急務。営業のリード獲得コストも上昇している。"
                  required
                  rows={4}
                />
                <TextareaField
                  label="現状・背景"
                  name="currentSituation"
                  value={form.currentSituation}
                  onChange={handleChange}
                  placeholder="例: 現在はExcelで顧客管理しており、MA/CRMツールは未導入。社員20名、営業3名体制。"
                  required
                  rows={4}
                />
              </div>
            </div>

            {/* 予算・スケジュール */}
            <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
              <p className="mb-6 font-display text-[10px] tracking-widest text-muted">
                条件・備考
              </p>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block font-display text-[10px] tracking-widest text-muted">
                    予算感
                  </label>
                  <select
                    name="budget"
                    value={form.budget}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-border bg-base px-4 py-3 text-sm transition-colors focus:border-ink focus:outline-none"
                  >
                    <option value="">未定 / 要相談</option>
                    <option value="〜50万円">〜50万円</option>
                    <option value="50〜100万円">50〜100万円</option>
                    <option value="100〜300万円">100〜300万円</option>
                    <option value="300〜500万円">300〜500万円</option>
                    <option value="500万円〜">500万円〜</option>
                  </select>
                </div>
                <Field
                  label="希望開始時期"
                  name="schedule"
                  value={form.schedule}
                  onChange={handleChange}
                  placeholder="例: 来月中 / Q3開始 / 年内"
                />
              </div>
              <div className="mt-5">
                <TextareaField
                  label="その他備考（任意）"
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="例: 競合他社との比較検討中。決裁者は別途いる。"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 pt-2">
              <p className="text-xs text-muted">
                入力内容はブラウザのメモリにのみ保持されます。
              </p>
              <button
                type="submit"
                disabled={status === "generating"}
                className="btn-invert min-w-[180px] text-sm disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "generating" ? (
                  <span className="flex items-center gap-2">
                    <Spinner />
                    生成中…
                  </span>
                ) : (
                  "提案資料を生成する →"
                )}
              </button>
            </div>
          </motion.form>
        </div>
      </section>

      {/* 提案資料出力セクション */}
      <AnimatePresence>
        {(status === "generating" || status === "done" || status === "error") && (
          <motion.section
            ref={proposalRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full border-t border-border bg-card px-5 py-20 md:px-10 md:py-28"
          >
            <div className="mx-auto max-w-4xl">
              <SectionHeading
                number="002"
                label="PROPOSAL"
                title="生成された提案資料"
                description={
                  status === "generating"
                    ? "AIが資料を作成しています。しばらくお待ちください…"
                    : status === "done"
                    ? `${form.companyName} 向けの提案資料が完成しました。`
                    : "エラーが発生しました。"
                }
              />

              {status === "error" ? (
                <div className="rounded-3xl border border-pop/30 bg-pop/5 p-6">
                  <p className="text-sm text-pop">{errorMsg}</p>
                </div>
              ) : (
                <div className="rounded-3xl border border-border bg-base p-6 md:p-10">
                  {/* ストリーミング中のカーソル表示 */}
                  <div className="prose-custom">
                    {proposal
                      .split("\n")
                      .map((line, i) => renderProposalLine(line, i))}
                    {status === "generating" && (
                      <span className="inline-block h-4 w-0.5 animate-pulse bg-ink/60 align-middle" />
                    )}
                  </div>

                  {/* 完了後のアクションボタン */}
                  {status === "done" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                      className="mt-10 flex flex-wrap gap-3 border-t border-border pt-8"
                    >
                      <button
                        onClick={() => window.print()}
                        className="btn-outline text-sm"
                      >
                        印刷 / PDF保存
                      </button>
                      <button
                        onClick={handleReset}
                        className="btn-invert text-sm"
                      >
                        別の提案資料を作成する →
                      </button>
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}

/** テキスト入力フィールド */
function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
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
      <input
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-2xl border border-border bg-base px-4 py-3 text-sm transition-colors focus:border-ink focus:outline-none"
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
  placeholder,
  required,
  rows = 4,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
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
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        rows={rows}
        className="w-full resize-none rounded-2xl border border-border bg-base px-4 py-3 text-sm transition-colors focus:border-ink focus:outline-none"
      />
    </div>
  );
}

/** ローディングスピナー */
function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
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
