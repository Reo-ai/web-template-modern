"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import type { ProposalInput } from "@/app/api/generate-proposal/route";

// 提案書の各セクションをパースして表示用データに変換する
function parseProposal(text: string): { title: string; content: string }[] {
  const sections = text.split(/^## /m).filter(Boolean);
  return sections.map((s) => {
    const newlineIdx = s.indexOf("\n");
    const title = newlineIdx === -1 ? s.trim() : s.slice(0, newlineIdx).trim();
    const content = newlineIdx === -1 ? "" : s.slice(newlineIdx + 1).trim();
    return { title, content };
  });
}

// マークダウンの箇条書きと改行を簡易的にHTMLへ変換する
function renderContent(text: string): string {
  return text
    .split("\n")
    .map((line) => {
      if (/^[-•]\s/.test(line)) return `<li>${line.replace(/^[-•]\s/, "")}</li>`;
      if (/^\d+\.\s/.test(line)) return `<li>${line.replace(/^\d+\.\s/, "")}</li>`;
      if (line.trim() === "") return "<br/>";
      return `<p>${line}</p>`;
    })
    .join("")
    .replace(/(<li>.*<\/li>)+/g, (m) => `<ul class="list-disc pl-5 space-y-1">${m}</ul>`);
}

const EASE = [0.22, 1, 0.36, 1] as const;

const FADE_UP = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

const SECTION_ICONS: Record<string, string> = {
  "提案書概要": "01",
  "課題の整理": "02",
  "提案内容": "03",
  "期待される効果・メリット": "04",
  "実施スケジュール案": "05",
  "お見積り概算": "06",
  "次のステップ": "07",
};

export default function ProposalGenerator() {
  const [form, setForm] = useState<ProposalInput>({
    clientName: "",
    meetingDate: "",
    industry: "",
    challenges: "",
    budget: "",
    services: "",
    notes: "",
    companyName: "",
  });
  const [proposal, setProposal] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setProposal("");

    try {
      const res = await fetch("/api/generate-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "エラーが発生しました");
      setProposal(data.proposal);
    } catch (err) {
      setError(err instanceof Error ? err.message : "予期しないエラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(proposal);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const sections = proposal ? parseProposal(proposal) : [];

  return (
    <div className="min-h-screen bg-base py-24 px-5 md:px-10">
      <div className="mx-auto max-w-[900px]">
        {/* ページ見出し */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={FADE_UP}
          className="mb-14 text-center"
        >
          <p className="font-display text-xs tracking-[0.25em] text-muted mb-3">
            AI PROPOSAL GENERATOR
          </p>
          <h1 className="font-serif-jp text-4xl md:text-5xl font-bold leading-tight">
            提案資料<span className="text-pop">自動生成</span>
          </h1>
          <p className="mt-4 text-muted text-sm md:text-base leading-relaxed">
            アポイントの内容を入力するだけで、AIが提案書を自動で作成します。
          </p>
        </motion.div>

        {/* 入力フォーム */}
        <motion.form
          initial="hidden"
          animate="show"
          variants={FADE_UP}
          onSubmit={handleSubmit}
          className="rounded-2xl border border-border bg-card p-8 md:p-10 space-y-6 mb-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* クライアント名 */}
            <div className="space-y-2">
              <label className="font-display text-xs tracking-widest text-ink/70">
                クライアント名 <span className="text-pop">*</span>
              </label>
              <input
                type="text"
                name="clientName"
                value={form.clientName}
                onChange={handleChange}
                required
                placeholder="例: 株式会社〇〇 山田様"
                className="w-full rounded-lg border border-border bg-base px-4 py-3 text-sm text-ink placeholder:text-muted/50 outline-none focus:border-ink/40 transition-colors"
              />
            </div>

            {/* 商談日 */}
            <div className="space-y-2">
              <label className="font-display text-xs tracking-widest text-ink/70">
                商談日
              </label>
              <input
                type="date"
                name="meetingDate"
                value={form.meetingDate}
                onChange={handleChange}
                className="w-full rounded-lg border border-border bg-base px-4 py-3 text-sm text-ink outline-none focus:border-ink/40 transition-colors"
              />
            </div>

            {/* 業種 */}
            <div className="space-y-2">
              <label className="font-display text-xs tracking-widest text-ink/70">
                業種
              </label>
              <select
                name="industry"
                value={form.industry}
                onChange={handleChange}
                className="w-full rounded-lg border border-border bg-base px-4 py-3 text-sm text-ink outline-none focus:border-ink/40 transition-colors"
              >
                <option value="">選択してください</option>
                <option>IT・システム</option>
                <option>製造業</option>
                <option>小売・EC</option>
                <option>飲食・サービス</option>
                <option>不動産</option>
                <option>医療・介護</option>
                <option>教育</option>
                <option>金融・保険</option>
                <option>建設・設備</option>
                <option>その他</option>
              </select>
            </div>

            {/* 提案元会社名 */}
            <div className="space-y-2">
              <label className="font-display text-xs tracking-widest text-ink/70">
                提案元会社名
              </label>
              <input
                type="text"
                name="companyName"
                value={form.companyName}
                onChange={handleChange}
                placeholder="例: 株式会社△△"
                className="w-full rounded-lg border border-border bg-base px-4 py-3 text-sm text-ink placeholder:text-muted/50 outline-none focus:border-ink/40 transition-colors"
              />
            </div>
          </div>

          {/* 課題・ニーズ */}
          <div className="space-y-2">
            <label className="font-display text-xs tracking-widest text-ink/70">
              課題・ニーズ <span className="text-pop">*</span>
            </label>
            <textarea
              name="challenges"
              value={form.challenges}
              onChange={handleChange}
              required
              rows={4}
              placeholder="例: 売上が伸び悩んでいる。既存顧客のリテンション率が低い。DX化を進めたいが何から手をつけていいかわからない。"
              className="w-full rounded-lg border border-border bg-base px-4 py-3 text-sm text-ink placeholder:text-muted/50 outline-none focus:border-ink/40 transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ご予算感 */}
            <div className="space-y-2">
              <label className="font-display text-xs tracking-widest text-ink/70">
                ご予算感
              </label>
              <select
                name="budget"
                value={form.budget}
                onChange={handleChange}
                className="w-full rounded-lg border border-border bg-base px-4 py-3 text-sm text-ink outline-none focus:border-ink/40 transition-colors"
              >
                <option value="">選択してください</option>
                <option>〜50万円</option>
                <option>50〜100万円</option>
                <option>100〜300万円</option>
                <option>300〜500万円</option>
                <option>500万円〜</option>
                <option>未定</option>
              </select>
            </div>

            {/* ご希望のサービス */}
            <div className="space-y-2">
              <label className="font-display text-xs tracking-widest text-ink/70">
                ご希望のサービス
              </label>
              <input
                type="text"
                name="services"
                value={form.services}
                onChange={handleChange}
                placeholder="例: Webサイト制作、SNS運用代行"
                className="w-full rounded-lg border border-border bg-base px-4 py-3 text-sm text-ink placeholder:text-muted/50 outline-none focus:border-ink/40 transition-colors"
              />
            </div>
          </div>

          {/* 備考 */}
          <div className="space-y-2">
            <label className="font-display text-xs tracking-widest text-ink/70">
              備考・その他メモ
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              placeholder="例: 競合他社との違いを強調してほしい。急ぎ感あり。"
              className="w-full rounded-lg border border-border bg-base px-4 py-3 text-sm text-ink placeholder:text-muted/50 outline-none focus:border-ink/40 transition-colors resize-none"
            />
          </div>

          {/* エラー表示 */}
          {error && (
            <p className="text-sm text-red-500 rounded-lg bg-red-50 px-4 py-3">{error}</p>
          )}

          {/* 送信ボタン */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-ink text-base py-4 font-display text-xs tracking-[0.2em] text-white transition-all duration-300 hover:bg-pop disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "提案書を生成中..." : "提案書を自動生成する →"}
          </button>
        </motion.form>

        {/* ローディングアニメーション */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <div className="inline-flex gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="block w-2.5 h-2.5 rounded-full bg-pop"
                    animate={{ y: [0, -10, 0] }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.8,
                      delay: i * 0.2,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  />
                ))}
              </div>
              <p className="mt-4 text-muted text-sm">AIが提案書を作成しています…</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 生成結果 */}
        <AnimatePresence>
          {proposal && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* ヘッダーバー */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="font-display text-xs tracking-[0.25em] text-muted">
                    GENERATED PROPOSAL
                  </p>
                  <h2 className="font-serif-jp text-2xl font-bold mt-1">
                    {form.clientName} 様 ご提案書
                  </h2>
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 rounded-full border border-border px-5 py-2.5 font-display text-xs tracking-widest transition-all hover:border-ink hover:bg-ink hover:text-base"
                >
                  {copied ? "コピー完了 ✓" : "テキストをコピー"}
                </button>
              </div>

              {/* セクションカード群 */}
              <div className="space-y-5">
                {sections.map((section, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: i * 0.07,
                      duration: 0.5,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="rounded-2xl border border-border bg-card p-7 md:p-8"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <span className="font-display text-xs text-pop shrink-0 mt-0.5">
                        {SECTION_ICONS[section.title] ?? String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="font-serif-jp text-xl font-bold">{section.title}</h3>
                    </div>
                    <div
                      className="text-sm text-ink/80 leading-[1.9] space-y-2 [&_ul]:mt-2 [&_li]:marker:text-pop"
                      dangerouslySetInnerHTML={{ __html: renderContent(section.content) }}
                    />
                  </motion.div>
                ))}
              </div>

              {/* 再生成ボタン */}
              <div className="mt-8 text-center">
                <button
                  onClick={() => setProposal("")}
                  className="text-sm text-muted underline underline-offset-4 hover:text-ink transition-colors"
                >
                  入力内容を修正して再生成する
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
