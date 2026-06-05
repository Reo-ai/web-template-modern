"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Sparkles, Printer, RotateCcw, ChevronRight } from "lucide-react";

/* =========================================================
   アポイント情報の型
   ========================================================= */
interface FormData {
  clientName: string;
  industry: string;
  appointmentDate: string;
  contactPerson: string;
  issues: string;
  proposedServices: string;
  budget: string;
  notes: string;
}

const INITIAL_FORM: FormData = {
  clientName: "",
  industry: "",
  appointmentDate: "",
  contactPerson: "",
  issues: "",
  proposedServices: "",
  budget: "",
  notes: "",
};

/* =========================================================
   簡易マークダウンレンダラー
   ========================================================= */
function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let listBuffer: string[] = [];
  let keyCounter = 0;

  const flushList = () => {
    if (listBuffer.length > 0) {
      elements.push(
        <ul key={`ul-${keyCounter++}`} className="mb-4 space-y-1 pl-4">
          {listBuffer.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-ink/80">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-pop" />
              <span dangerouslySetInnerHTML={{ __html: inlineFormat(item) }} />
            </li>
          ))}
        </ul>
      );
      listBuffer = [];
    }
  };

  for (const line of lines) {
    // 水平線
    if (line.trim() === "---") {
      flushList();
      elements.push(
        <hr key={`hr-${keyCounter++}`} className="my-6 border-border" />
      );
      continue;
    }

    // ## 大見出し
    if (line.startsWith("## ")) {
      flushList();
      const title = line.replace(/^## /, "");
      elements.push(
        <h2
          key={`h2-${keyCounter++}`}
          className="mt-8 mb-3 font-serif-jp text-lg font-bold text-ink first:mt-0"
        >
          {title}
        </h2>
      );
      continue;
    }

    // ### 小見出し
    if (line.startsWith("### ")) {
      flushList();
      const title = line.replace(/^### /, "");
      elements.push(
        <h3
          key={`h3-${keyCounter++}`}
          className="mt-5 mb-2 text-base font-bold text-deep"
        >
          {title}
        </h3>
      );
      continue;
    }

    // リスト行
    if (line.startsWith("- ") || line.startsWith("* ")) {
      listBuffer.push(line.replace(/^[-*] /, ""));
      continue;
    }

    // 通常の行
    flushList();

    if (line.trim() === "") {
      elements.push(<div key={`br-${keyCounter++}`} className="h-2" />);
      continue;
    }

    // **太字** を含む行
    elements.push(
      <p
        key={`p-${keyCounter++}`}
        className="text-sm leading-relaxed text-ink/80"
        dangerouslySetInnerHTML={{ __html: inlineFormat(line) }}
      />
    );
  }

  flushList();
  return elements;
}

// インライン書式変換: **bold**, `code`
function inlineFormat(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-ink">$1</strong>')
    .replace(/`(.+?)`/g, '<code class="rounded bg-border/40 px-1 font-mono text-xs text-deep">$1</code>');
}

/* =========================================================
   フォームフィールド共通コンポーネント
   ========================================================= */
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
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1 text-xs font-medium tracking-widest text-ink/60 uppercase">
        {label}
        {required && <span className="text-pop">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-ink placeholder-ink/30 " +
  "transition-all focus:border-deep focus:outline-none focus:ring-2 focus:ring-deep/10";

/* =========================================================
   メインページ
   ========================================================= */
export default function ProposalPage() {
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [proposal, setProposal] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [isDone, setIsDone] = useState(false);
  const proposalRef = useRef<HTMLDivElement>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setProposal("");
    setIsDone(false);
    setIsGenerating(true);

    try {
      const res = await fetch("/api/generate-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "生成に失敗しました");
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("レスポンスの読み取りに失敗しました");

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setProposal(accumulated);
      }

      setIsDone(true);
      // 少し待ってからスクロール
      setTimeout(() => {
        proposalRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    setProposal("");
    setIsDone(false);
    setError("");
    setForm(INITIAL_FORM);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-base">
      {/* ヘッダーエリア */}
      <section className="border-b border-border bg-white/50 pt-32 pb-12">
        <div className="mx-auto max-w-3xl px-5 md:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mb-4 flex items-center gap-2">
              <span className="font-display text-xs tracking-widest text-pop">#AI TOOL</span>
            </div>
            <h1 className="font-serif-jp mb-3 text-3xl font-bold md:text-4xl">
              提案資料 自動生成
            </h1>
            <p className="text-sm leading-relaxed text-ink/60">
              アポイントの内容を入力するだけで、AIが提案書を自動作成します。<br className="hidden md:block" />
              生成された資料は印刷してそのままご利用いただけます。
            </p>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-5 py-12 md:px-10">
        {/* 入力フォーム */}
        <AnimatePresence>
          {!isDone && (
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6"
            >
              {/* 基本情報 */}
              <div className="rounded-2xl border border-border bg-white p-6 md:p-8">
                <h2 className="mb-5 flex items-center gap-2 text-base font-bold">
                  <span className="font-display text-xs text-muted">#01</span>
                  基本情報
                </h2>
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="クライアント名" required>
                    <input
                      type="text"
                      name="clientName"
                      value={form.clientName}
                      onChange={handleChange}
                      required
                      placeholder="例: 株式会社サンプル"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="業種">
                    <input
                      type="text"
                      name="industry"
                      value={form.industry}
                      onChange={handleChange}
                      placeholder="例: 製造業、IT、小売業"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="アポイント日">
                    <input
                      type="date"
                      name="appointmentDate"
                      value={form.appointmentDate}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="担当者名">
                    <input
                      type="text"
                      name="contactPerson"
                      value={form.contactPerson}
                      onChange={handleChange}
                      placeholder="例: 山田 太郎 様"
                      className={inputClass}
                    />
                  </Field>
                </div>
              </div>

              {/* 課題・提案内容 */}
              <div className="rounded-2xl border border-border bg-white p-6 md:p-8">
                <h2 className="mb-5 flex items-center gap-2 text-base font-bold">
                  <span className="font-display text-xs text-muted">#02</span>
                  アポイント内容
                </h2>
                <div className="space-y-5">
                  <Field label="確認した課題・ニーズ" required>
                    <textarea
                      name="issues"
                      value={form.issues}
                      onChange={handleChange}
                      required
                      rows={4}
                      placeholder="例: 既存システムの老朽化により業務効率が低下している。データの一元管理ができておらず、属人化が課題。"
                      className={`${inputClass} resize-none`}
                    />
                  </Field>
                  <Field label="提案するサービス・ソリューション" required>
                    <textarea
                      name="proposedServices"
                      value={form.proposedServices}
                      onChange={handleChange}
                      required
                      rows={4}
                      placeholder="例: クラウドERPシステムの導入支援。データ統合基盤の構築と運用サポート。"
                      className={`${inputClass} resize-none`}
                    />
                  </Field>
                </div>
              </div>

              {/* 予算・備考 */}
              <div className="rounded-2xl border border-border bg-white p-6 md:p-8">
                <h2 className="mb-5 flex items-center gap-2 text-base font-bold">
                  <span className="font-display text-xs text-muted">#03</span>
                  補足情報
                </h2>
                <div className="space-y-5">
                  <Field label="予算感">
                    <input
                      type="text"
                      name="budget"
                      value={form.budget}
                      onChange={handleChange}
                      placeholder="例: 月額50万円程度、年間予算500万円以内"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="特記事項・備考">
                    <textarea
                      name="notes"
                      value={form.notes}
                      onChange={handleChange}
                      rows={3}
                      placeholder="例: 競合他社も検討中。意思決定は来月末までに行う予定。"
                      className={`${inputClass} resize-none`}
                    />
                  </Field>
                </div>
              </div>

              {/* エラー表示 */}
              {error && (
                <div className="rounded-xl border border-pop/20 bg-pop/5 p-4 text-sm text-pop">
                  {error}
                </div>
              )}

              {/* 送信ボタン */}
              <motion.button
                type="submit"
                disabled={isGenerating}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="btn-invert flex w-full items-center justify-center gap-2 rounded-2xl px-8 py-4 text-base disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isGenerating ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="inline-block"
                    >
                      <Sparkles size={18} />
                    </motion.span>
                    AI が提案書を生成中…
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    提案書を生成する
                    <ChevronRight size={16} />
                  </>
                )}
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* 生成中のプログレス表示 */}
        {isGenerating && proposal && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <div className="mb-4 flex items-center gap-2">
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="h-2 w-2 rounded-full bg-pop"
              />
              <span className="text-xs font-medium text-ink/50">生成中...</span>
            </div>
            <div className="rounded-2xl border border-border bg-white/80 p-6 md:p-8">
              <div className="space-y-1">{renderMarkdown(proposal)}</div>
            </div>
          </motion.div>
        )}

        {/* 完成した提案書 */}
        <AnimatePresence>
          {isDone && proposal && (
            <motion.div
              ref={proposalRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* 操作ボタン */}
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-medium text-emerald-600">生成完了</span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 rounded-xl border border-border bg-white px-4 py-2 text-xs font-medium text-ink/60 transition-colors hover:border-ink/30 hover:text-ink"
                  >
                    <RotateCcw size={13} />
                    再入力
                  </button>
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 rounded-xl bg-ink px-4 py-2 text-xs font-medium text-base transition-colors hover:bg-ink/80"
                  >
                    <Printer size={13} />
                    印刷する
                  </button>
                </div>
              </div>

              {/* 提案書本文 */}
              <div
                id="proposal-content"
                className="rounded-2xl border border-border bg-white p-8 shadow-sm md:p-12"
              >
                {/* ヘッダーロゴ風 */}
                <div className="mb-8 flex items-start justify-between border-b border-border pb-6">
                  <div>
                    <div className="mb-1 font-display text-xs tracking-widest text-pop">
                      PROPOSAL
                    </div>
                    <div className="font-serif-jp text-2xl font-bold">提案書</div>
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5">
                    <FileText size={13} className="text-muted" />
                    <span className="text-xs text-muted">AI生成資料</span>
                  </div>
                </div>

                {/* 本文 */}
                <div className="space-y-1">{renderMarkdown(proposal)}</div>

                {/* フッター */}
                <div className="mt-12 border-t border-border pt-6 text-center text-xs text-muted">
                  本資料はAIにより自動生成されました。内容はご確認の上ご活用ください。
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 印刷用スタイル */}
      <style jsx global>{`
        @media print {
          header,
          footer,
          .chatbot,
          button,
          [data-lenis-prevent] {
            display: none !important;
          }
          #proposal-content {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
          }
          body {
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
}
