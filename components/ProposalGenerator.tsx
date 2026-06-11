"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";
import {
  FileText,
  Loader2,
  Download,
  RefreshCw,
  ChevronRight,
  Sparkles,
  Building2,
  Calendar,
  Lightbulb,
  BadgeJapaneseYen,
  Clock,
  StickyNote,
} from "lucide-react";
import type { AppointmentInput } from "@/app/api/proposal/generate/route";

const INDUSTRIES = [
  "IT・ソフトウェア",
  "製造業",
  "小売・EC",
  "金融・保険",
  "医療・ヘルスケア",
  "教育",
  "不動産",
  "飲食・ホスピタリティ",
  "物流・運輸",
  "コンサルティング",
  "メディア・広告",
  "建設・設備",
  "その他",
];

const SERVICE_TYPES = [
  "DX推進・デジタル化支援",
  "業務効率化・自動化",
  "マーケティング支援",
  "システム開発・導入",
  "人材育成・研修",
  "経営戦略コンサルティング",
  "EC・オンライン販売支援",
  "ブランディング・PR",
  "その他",
];

const BUDGET_OPTIONS = [
  "〜50万円",
  "50〜100万円",
  "100〜300万円",
  "300〜500万円",
  "500万円以上",
  "未定・要相談",
];

const TIMELINE_OPTIONS = [
  "1ヶ月以内",
  "3ヶ月以内",
  "6ヶ月以内",
  "1年以内",
  "長期継続",
  "未定",
];

const easing = [0.22, 1, 0.36, 1] as const;

function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("# ")) {
      elements.push(
        <h1
          key={i}
          className="font-serif-jp text-3xl font-bold text-ink mb-6 mt-2"
        >
          {line.slice(2)}
        </h1>
      );
    } else if (line.startsWith("## ")) {
      elements.push(
        <h2
          key={i}
          className="font-serif-jp text-xl font-bold text-ink mt-10 mb-4 pb-2 border-b border-border"
        >
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} className="font-bold text-ink mt-6 mb-3">
          {line.slice(4)}
        </h3>
      );
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      const items: string[] = [];
      while (
        i < lines.length &&
        (lines[i].startsWith("- ") || lines[i].startsWith("* "))
      ) {
        items.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="space-y-2 my-4 pl-4">
          {items.map((item, j) => (
            <li key={j} className="flex gap-2 text-ink/80">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-pop" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    } else if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ""));
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="space-y-2 my-4 pl-4">
          {items.map((item, j) => (
            <li key={j} className="flex gap-3 text-ink/80">
              <span className="shrink-0 font-display text-xs text-pop mt-0.5">
                {String(j + 1).padStart(2, "0")}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    } else if (line.startsWith("---")) {
      elements.push(<hr key={i} className="border-border my-8" />);
    } else if (line.startsWith("*") && line.endsWith("*") && line.length > 2) {
      elements.push(
        <p key={i} className="text-sm text-muted italic mt-4">
          {line.slice(1, -1)}
        </p>
      );
    } else if (line.trim() === "") {
      elements.push(<div key={i} className="h-2" />);
    } else {
      const bold = line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      elements.push(
        <p
          key={i}
          className="text-ink/80 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: bold }}
        />
      );
    }
    i++;
  }

  return <div className="space-y-1">{elements}</div>;
}

export default function ProposalGenerator() {
  const [step, setStep] = useState<"form" | "generating" | "result">("form");
  const [proposal, setProposal] = useState("");
  const [streamText, setStreamText] = useState("");
  const [error, setError] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState<AppointmentInput>({
    clientName: "",
    companyName: "",
    industry: "",
    appointmentDate: new Date().toISOString().split("T")[0],
    meetingNotes: "",
    challenges: "",
    budget: "",
    timeline: "",
    serviceType: "",
    additionalNotes: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setStreamText("");
    setProposal("");
    setStep("generating");

    try {
      const res = await fetch("/api/proposal/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error(`API エラー: ${res.status}`);
      }

      if (!res.body) throw new Error("ストリームが取得できません");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";

      setStep("result");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        full += chunk;
        setStreamText(full);
      }

      setProposal(full);
      setStreamText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成に失敗しました");
      setStep("form");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    setStep("form");
    setProposal("");
    setStreamText("");
  };

  const displayText = proposal || streamText;

  return (
    <div className="min-h-screen bg-base">
      {/* ヘッダーエリア */}
      <section className="pt-32 pb-16 px-5 md:px-10 max-w-[1200px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: easing }}
        >
          <p className="font-display text-xs tracking-widest text-muted mb-4">
            #009 PROPOSAL AI
          </p>
          <h1 className="font-serif-jp text-4xl md:text-5xl font-bold text-ink mb-4">
            提案資料
            <span className="text-pop">自動生成</span>
          </h1>
          <p className="text-muted max-w-xl leading-relaxed">
            アポイントの内容を入力するだけで、Claude AI が
            クライアントに合わせた提案書を自動で作成します。
          </p>
        </motion.div>
      </section>

      <div className="px-5 md:px-10 max-w-[1200px] mx-auto pb-24">
        <AnimatePresence mode="wait">
          {/* ── フォーム ── */}
          {step === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.5, ease: easing }}
            >
              <form onSubmit={handleGenerate} className="space-y-8">
                {/* クライアント情報 */}
                <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Building2 className="w-5 h-5 text-pop" />
                    <h2 className="font-serif-jp font-bold text-lg">
                      クライアント情報
                    </h2>
                  </div>
                  <div className="grid md:grid-cols-2 gap-5">
                    <Field label="担当者名" required>
                      <input
                        name="clientName"
                        value={formData.clientName}
                        onChange={handleChange}
                        placeholder="例: 山田 太郎"
                        required
                        className={inputCls}
                      />
                    </Field>
                    <Field label="会社名" required>
                      <input
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        placeholder="例: 株式会社〇〇"
                        required
                        className={inputCls}
                      />
                    </Field>
                    <Field label="業種">
                      <select
                        name="industry"
                        value={formData.industry}
                        onChange={handleChange}
                        className={inputCls}
                      >
                        <option value="">選択してください</option>
                        {INDUSTRIES.map((ind) => (
                          <option key={ind} value={ind}>
                            {ind}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="アポイント日">
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                        <input
                          type="date"
                          name="appointmentDate"
                          value={formData.appointmentDate}
                          onChange={handleChange}
                          className={`${inputCls} pl-9`}
                        />
                      </div>
                    </Field>
                  </div>
                </div>

                {/* 商談内容 */}
                <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <StickyNote className="w-5 h-5 text-pop" />
                    <h2 className="font-serif-jp font-bold text-lg">
                      商談・ヒアリング内容
                    </h2>
                  </div>
                  <div className="space-y-5">
                    <Field
                      label="商談メモ・ヒアリング内容"
                      required
                      hint="アポイントで聞いた内容や話した内容を自由に記入"
                    >
                      <textarea
                        name="meetingNotes"
                        value={formData.meetingNotes}
                        onChange={handleChange}
                        rows={5}
                        required
                        placeholder={`例: \n・現在の業務フローについて詳しく聞いた\n・月次レポート作成に毎回20時間かかっている\n・エクセル管理に限界を感じている\n・競合他社もDXに取り組んでいると感じている`}
                        className={`${inputCls} resize-none`}
                      />
                    </Field>
                    <Field
                      label="主な課題・ニーズ"
                      required
                      hint="クライアントが解決したい課題を具体的に"
                    >
                      <textarea
                        name="challenges"
                        value={formData.challenges}
                        onChange={handleChange}
                        rows={4}
                        required
                        placeholder={`例: \n・業務の属人化を解消したい\n・データの一元管理がしたい\n・人件費を削減しながら生産性を上げたい`}
                        className={`${inputCls} resize-none`}
                      />
                    </Field>
                  </div>
                </div>

                {/* 提案条件 */}
                <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Lightbulb className="w-5 h-5 text-pop" />
                    <h2 className="font-serif-jp font-bold text-lg">
                      提案条件
                    </h2>
                  </div>
                  <div className="grid md:grid-cols-2 gap-5">
                    <Field label="提案サービス種別">
                      <select
                        name="serviceType"
                        value={formData.serviceType}
                        onChange={handleChange}
                        className={inputCls}
                      >
                        <option value="">選択してください</option>
                        {SERVICE_TYPES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="希望スケジュール">
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                        <select
                          name="timeline"
                          value={formData.timeline}
                          onChange={handleChange}
                          className={`${inputCls} pl-9`}
                        >
                          <option value="">選択してください</option>
                          {TIMELINE_OPTIONS.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>
                    </Field>
                    <Field label="予算感">
                      <div className="relative">
                        <BadgeJapaneseYen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                        <select
                          name="budget"
                          value={formData.budget}
                          onChange={handleChange}
                          className={`${inputCls} pl-9`}
                        >
                          <option value="">選択してください</option>
                          {BUDGET_OPTIONS.map((b) => (
                            <option key={b} value={b}>
                              {b}
                            </option>
                          ))}
                        </select>
                      </div>
                    </Field>
                    <Field label="補足事項">
                      <input
                        name="additionalNotes"
                        value={formData.additionalNotes}
                        onChange={handleChange}
                        placeholder="その他、提案に活かしたい情報"
                        className={inputCls}
                      />
                    </Field>
                  </div>
                </div>

                {error && (
                  <p className="text-pop text-sm bg-pop/10 rounded-xl px-4 py-3">
                    {error}
                  </p>
                )}

                <div className="flex justify-end">
                  <button type="submit" className="btn-invert gap-2 text-sm">
                    <Sparkles className="w-4 h-4" />
                    AI で提案書を生成する
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* ── 生成中 ── */}
          {step === "generating" && (
            <motion.div
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32 gap-6"
            >
              <Loader2 className="w-12 h-12 text-pop animate-spin" />
              <p className="font-serif-jp text-xl font-bold">
                提案書を生成しています...
              </p>
              <p className="text-muted text-sm">
                Claude AI がアポイント内容を分析中です
              </p>
            </motion.div>
          )}

          {/* ── 結果 ── */}
          {step === "result" && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: easing }}
              className="space-y-6"
            >
              {/* アクションバー */}
              <div className="flex flex-wrap gap-3 justify-between items-center print:hidden">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-pop" />
                  <span className="font-serif-jp font-bold">生成された提案書</span>
                  {!proposal && streamText && (
                    <span className="flex items-center gap-1 text-xs text-muted">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      生成中...
                    </span>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleReset}
                    className="btn-outline gap-2 text-sm py-2 px-4"
                  >
                    <RefreshCw className="w-4 h-4" />
                    再入力
                  </button>
                  <button
                    onClick={handlePrint}
                    disabled={!proposal}
                    className="btn-invert gap-2 text-sm py-2 px-4 disabled:opacity-40"
                  >
                    <Download className="w-4 h-4" />
                    PDF 出力
                  </button>
                </div>
              </div>

              {/* 提案書本体 */}
              <div
                ref={resultRef}
                className="bg-card border border-border rounded-2xl p-8 md:p-12 min-h-[60vh] print:border-0 print:p-0 print:rounded-none"
              >
                {displayText ? (
                  <MarkdownRenderer content={displayText} />
                ) : (
                  <div className="flex items-center gap-3 text-muted">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>生成を開始しています...</span>
                  </div>
                )}
              </div>

              {/* 生成完了後の追加アクション */}
              {proposal && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5, ease: easing }}
                  className="bg-deep/5 border border-deep/20 rounded-2xl p-6 print:hidden"
                >
                  <p className="font-display text-xs tracking-widest text-deep mb-3">
                    NEXT STEP
                  </p>
                  <p className="font-serif-jp font-bold mb-1">
                    提案書が完成しました
                  </p>
                  <p className="text-sm text-muted mb-4">
                    「PDF 出力」ボタンで印刷・PDF 保存できます。
                    Canva でスライド化する場合は、内容をコピーしてご利用ください。
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handlePrint}
                      className="btn-invert gap-2 text-sm py-2 px-5"
                    >
                      <Download className="w-4 h-4" />
                      PDF として保存
                    </button>
                    <button
                      onClick={handleReset}
                      className="btn-outline gap-2 text-sm py-2 px-5"
                    >
                      <RefreshCw className="w-4 h-4" />
                      別の提案書を作る
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── ヘルパーコンポーネント ──

const inputCls =
  "w-full rounded-xl border border-border bg-base px-4 py-3 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-pop/30 focus:border-pop transition-colors";

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-ink/80 flex items-center gap-1">
        {label}
        {required && <span className="text-pop text-xs">*</span>}
      </label>
      {hint && <p className="text-xs text-muted">{hint}</p>}
      {children}
    </div>
  );
}
