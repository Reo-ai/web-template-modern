"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useCallback } from "react";
import type { ProposalFormData } from "@/lib/proposal";

// ─── 定数 ────────────────────────────────────────────────────────────────────

const STEPS = ["顧客情報", "アポイント情報", "提案内容"] as const;

const INITIAL_FORM: ProposalFormData = {
  clientCompany: "",
  clientName: "",
  clientIndustry: "",
  meetingPurpose: "",
  clientChallenge: "",
  clientNeeds: "",
  proposerCompany: "",
  proposerName: "",
  proposedService: "",
  budget: "",
  schedule: "",
  notes: "",
};

// ─── マークダウン → JSX 変換 ─────────────────────────────────────────────────

function parseProposal(text: string): React.ReactNode[] {
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("## ")) {
      const title = line.replace(/^## /, "");
      nodes.push(
        <h2
          key={key++}
          className="mt-8 mb-3 font-serif-jp text-xl font-bold text-ink first:mt-0 print:mt-6"
        >
          {title}
        </h2>
      );
    } else if (line.startsWith("# ")) {
      const title = line.replace(/^# /, "");
      nodes.push(
        <h1
          key={key++}
          className="mb-6 font-serif-jp text-2xl font-bold text-ink md:text-3xl print:text-2xl"
        >
          {title}
        </h1>
      );
    } else if (line.startsWith("・") || line.startsWith("- ")) {
      const content = line.replace(/^[・\- ]/, "").replace(/^-\s/, "");
      nodes.push(
        <div key={key++} className="flex gap-2 py-0.5 text-sm leading-relaxed">
          <span className="mt-0.5 shrink-0 text-pop">▸</span>
          <span className="text-ink/80">{renderInline(content)}</span>
        </div>
      );
    } else if (line.trim() === "") {
      nodes.push(<div key={key++} className="h-2" />);
    } else {
      nodes.push(
        <p key={key++} className="text-sm leading-relaxed text-ink/80">
          {renderInline(line)}
        </p>
      );
    }
  }
  return nodes;
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-ink">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

// ─── フォームフィールド共通 ──────────────────────────────────────────────────

function Field({
  label,
  name,
  value,
  onChange,
  required,
  placeholder,
  type = "text",
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block font-display text-[10px] tracking-widest text-muted">
        {label} {required && <span className="text-pop">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-border bg-base px-4 py-3 text-sm transition-colors focus:border-ink focus:outline-none"
      />
    </div>
  );
}

function TextArea({
  label,
  name,
  value,
  onChange,
  required,
  placeholder,
  rows = 4,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div>
      <label className="mb-1.5 block font-display text-[10px] tracking-widest text-muted">
        {label} {required && <span className="text-pop">*</span>}
      </label>
      <textarea
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        rows={rows}
        className="w-full resize-none rounded-2xl border border-border bg-base px-4 py-3 text-sm transition-colors focus:border-ink focus:outline-none"
      />
    </div>
  );
}

// ─── ステップインジケーター ──────────────────────────────────────────────────

function StepIndicator({
  current,
  steps,
}: {
  current: number;
  steps: readonly string[];
}) {
  return (
    <div className="mb-8 flex items-center justify-center gap-0">
      {steps.map((label, i) => (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center gap-1">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full border text-[10px] font-display transition-colors ${
                i < current
                  ? "border-ink bg-ink text-base"
                  : i === current
                  ? "border-pop bg-pop text-base"
                  : "border-border bg-base text-muted"
              }`}
            >
              {i < current ? "✓" : i + 1}
            </div>
            <span
              className={`hidden text-[9px] font-display tracking-widest md:block ${
                i === current ? "text-pop" : "text-muted"
              }`}
            >
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`mx-3 h-px w-12 transition-colors md:w-16 ${
                i < current ? "bg-ink" : "bg-border"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── メインコンポーネント ────────────────────────────────────────────────────

export default function ProposalPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<ProposalFormData>(INITIAL_FORM);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );
  const [proposal, setProposal] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);

  const update = useCallback(
    (field: keyof ProposalFormData) => (value: string) =>
      setForm((prev) => ({ ...prev, [field]: value })),
    []
  );

  // ─── バリデーション ─────────────────────────────────────────────────────────

  function canAdvance(): boolean {
    if (step === 0)
      return !!form.clientCompany;
    if (step === 1)
      return !!form.meetingPurpose && !!form.clientChallenge;
    if (step === 2)
      return !!form.proposerCompany && !!form.proposedService;
    return false;
  }

  // ─── 生成 ───────────────────────────────────────────────────────────────────

  async function generate() {
    setStatus("loading");
    setProposal("");
    setErrorMsg("");

    // 少し待ってから結果エリアへスクロール
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 200);

    try {
      const res = await fetch("/api/generate-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? "生成に失敗しました。");
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("ストリームを取得できませんでした。");

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setProposal(accumulated);
      }

      setStatus("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "予期せぬエラーが発生しました。");
      setStatus("error");
    }
  }

  // ─── 印刷 ───────────────────────────────────────────────────────────────────

  function handlePrint() {
    window.print();
  }

  // ─── リセット ───────────────────────────────────────────────────────────────

  function handleReset() {
    setStep(0);
    setForm(INITIAL_FORM);
    setStatus("idle");
    setProposal("");
    setErrorMsg("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ─── レンダリング ────────────────────────────────────────────────────────────

  return (
    <>
      {/* 印刷スタイル */}
      <style>{`
        @media print {
          header, footer, .no-print { display: none !important; }
          .print-area { padding: 0 !important; }
          body { background: white !important; }
        }
      `}</style>

      <div className="min-h-screen bg-base pt-24 pb-24">
        {/* ─── ヘッダー ─────────────────────────────────────────────────────── */}
        <div className="mx-auto max-w-3xl px-5 md:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mb-12 text-center"
          >
            <p className="mb-3 font-display text-xs tracking-widest text-pop">
              AI PROPOSAL GENERATOR
            </p>
            <h1 className="font-serif-jp text-3xl font-bold md:text-4xl">
              提案資料 自動生成
            </h1>
            <p className="mt-4 text-sm text-muted">
              アポイントの情報を入力するだけで、プロフェッショナルな提案書を自動で作成します。
            </p>
          </motion.div>

          {/* ─── フォームエリア ─────────────────────────────────────────────── */}
          {status === "idle" && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-10"
            >
              <StepIndicator current={step} steps={STEPS} />

              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div
                    key="step0"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="space-y-5"
                  >
                    <h2 className="font-serif-jp text-lg font-bold">
                      顧客情報
                    </h2>
                    <Field
                      label="顧客 会社名"
                      name="clientCompany"
                      value={form.clientCompany}
                      onChange={update("clientCompany")}
                      required
                      placeholder="株式会社〇〇"
                    />
                    <Field
                      label="顧客 担当者名"
                      name="clientName"
                      value={form.clientName}
                      onChange={update("clientName")}
                      placeholder="山田 太郎（任意）"
                    />
                    <Field
                      label="顧客 業種・業態"
                      name="clientIndustry"
                      value={form.clientIndustry}
                      onChange={update("clientIndustry")}
                      placeholder="例: 製造業、ITサービス、小売業（任意）"
                    />
                  </motion.div>
                )}

                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="space-y-5"
                  >
                    <h2 className="font-serif-jp text-lg font-bold">
                      アポイント情報
                    </h2>
                    <TextArea
                      label="面談の目的・背景"
                      name="meetingPurpose"
                      value={form.meetingPurpose}
                      onChange={update("meetingPurpose")}
                      required
                      placeholder="例: 業務効率化のためのシステム導入を検討している。既存の手作業によるデータ管理を自動化したい。"
                      rows={3}
                    />
                    <TextArea
                      label="顧客の課題・悩み"
                      name="clientChallenge"
                      value={form.clientChallenge}
                      onChange={update("clientChallenge")}
                      required
                      placeholder="例: データ入力に月間50時間以上を費やしており、ミスも多発。人件費コストの削減と精度向上が急務。"
                      rows={3}
                    />
                    <TextArea
                      label="顧客のニーズ・要望"
                      name="clientNeeds"
                      value={form.clientNeeds}
                      onChange={update("clientNeeds")}
                      placeholder="例: 使いやすいUI、既存システムとの連携、3ヶ月以内の導入（任意）"
                      rows={3}
                    />
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="space-y-5"
                  >
                    <h2 className="font-serif-jp text-lg font-bold">
                      提案内容
                    </h2>
                    <Field
                      label="提案する側の会社名"
                      name="proposerCompany"
                      value={form.proposerCompany}
                      onChange={update("proposerCompany")}
                      required
                      placeholder="株式会社〇〇（自社名）"
                    />
                    <Field
                      label="担当者名（自社）"
                      name="proposerName"
                      value={form.proposerName}
                      onChange={update("proposerName")}
                      placeholder="例: 佐藤 花子（任意）"
                    />
                    <TextArea
                      label="提案する商品・サービス"
                      name="proposedService"
                      value={form.proposedService}
                      onChange={update("proposedService")}
                      required
                      placeholder="例: クラウド型データ管理システム「DataFlow」。OCR・AI入力自動化、既存ERPとのAPI連携対応。"
                      rows={3}
                    />
                    <Field
                      label="予算感（任意）"
                      name="budget"
                      value={form.budget}
                      onChange={update("budget")}
                      placeholder="例: 月額30〜50万円、初期費用100万円程度"
                    />
                    <Field
                      label="希望スケジュール（任意）"
                      name="schedule"
                      value={form.schedule}
                      onChange={update("schedule")}
                      placeholder="例: 3ヶ月以内に導入、2025年4月リリース希望"
                    />
                    <TextArea
                      label="備考・その他（任意）"
                      name="notes"
                      value={form.notes}
                      onChange={update("notes")}
                      placeholder="特記事項があれば記入"
                      rows={2}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ─── ナビゲーション ─────────────────────────────────────────── */}
              <div className="mt-8 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  className={`btn-outline text-sm ${step === 0 ? "invisible" : ""}`}
                >
                  ← 戻る
                </button>

                {step < 2 ? (
                  <button
                    type="button"
                    onClick={() => setStep((s) => s + 1)}
                    disabled={!canAdvance()}
                    className="btn-invert text-sm disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    次へ →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={generate}
                    disabled={!canAdvance()}
                    className="btn-invert text-sm disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    提案書を生成する ✨
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* ─── 生成中 / エラー ──────────────────────────────────────────────── */}
          {status === "loading" && proposal === "" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-border bg-card p-10 text-center"
            >
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-border border-t-ink" />
              <p className="font-serif-jp text-lg font-bold">提案書を生成中…</p>
              <p className="mt-2 text-sm text-muted">
                Claude AI が最適な提案書を作成しています。しばらくお待ちください。
              </p>
            </motion.div>
          )}

          {status === "error" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-border bg-card p-8 text-center"
            >
              <p className="font-display text-xs tracking-widest text-pop">
                ERROR
              </p>
              <p className="mt-3 font-serif-jp text-lg font-bold">
                生成に失敗しました
              </p>
              <p className="mt-2 text-sm text-muted">{errorMsg}</p>
              <button
                type="button"
                onClick={() => setStatus("idle")}
                className="btn-invert mt-6 text-sm"
              >
                再入力する
              </button>
            </motion.div>
          )}
        </div>

        {/* ─── 提案書結果エリア ─────────────────────────────────────────────── */}
        <AnimatePresence>
          {(status === "loading" || status === "done") && proposal && (
            <motion.div
              ref={resultRef}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto mt-10 max-w-3xl px-5 md:px-10"
            >
              {/* ツールバー */}
              <div className="no-print mb-4 flex items-center justify-between">
                <p className="font-display text-xs tracking-widest text-muted">
                  {status === "loading" ? "GENERATING…" : "PROPOSAL READY"}
                </p>
                {status === "done" && (
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handlePrint}
                      className="btn-outline text-xs"
                    >
                      印刷 / PDF保存
                    </button>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="btn-invert text-xs"
                    >
                      新規作成
                    </button>
                  </div>
                )}
              </div>

              {/* ドキュメント */}
              <div className="print-area rounded-3xl border border-border bg-card p-8 shadow-sm md:p-12">
                {/* メタ情報 */}
                <div className="mb-8 border-b border-border pb-6 print:mb-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="font-display text-[9px] tracking-widest text-muted">
                        TO
                      </p>
                      <p className="mt-1 font-serif-jp text-base font-bold">
                        {form.clientCompany}
                        {form.clientName && (
                          <span className="ml-2 text-sm font-normal text-muted">
                            {form.clientName} 様
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-[9px] tracking-widest text-muted">
                        FROM
                      </p>
                      <p className="mt-1 font-serif-jp text-base font-bold">
                        {form.proposerCompany}
                        {form.proposerName && (
                          <span className="ml-2 text-sm font-normal text-muted">
                            {form.proposerName}
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">
                        {new Date().toLocaleDateString("ja-JP", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 提案書本文 */}
                <div className="proposal-content space-y-1">
                  {parseProposal(proposal)}

                  {/* カーソル点滅（生成中） */}
                  {status === "loading" && (
                    <span className="inline-block h-4 w-0.5 animate-pulse bg-pop" />
                  )}
                </div>
              </div>

              {/* 完了後のアクション */}
              {status === "done" && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="no-print mt-6 flex flex-col gap-3 rounded-2xl border border-border bg-base p-5 sm:flex-row"
                >
                  <div className="flex-1">
                    <p className="text-sm font-semibold">提案書が完成しました</p>
                    <p className="mt-1 text-xs text-muted">
                      「印刷 / PDF保存」ボタンからブラウザの印刷ダイアログでPDFとして保存できます。
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="btn-invert shrink-0 self-start text-xs sm:self-center"
                  >
                    印刷 / PDF保存 →
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
