"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useRef } from "react"
import { AppointmentInput, GeneratedProposal } from "@/lib/proposal"
import { SITE_NAME } from "@/lib/config"

const STEP_LABELS = ["アポイント入力", "提案書プレビュー", "送付・出力"]

const SERVICE_OPTIONS = [
  "Webサイト制作・リニューアル",
  "ECサイト構築",
  "LP(ランディングページ)制作",
  "Webアプリ開発",
  "ロゴ・ブランディングデザイン",
  "SNSマーケティング支援",
  "SEO・コンテンツマーケティング",
  "動画制作・編集",
  "その他",
]

const BUDGET_OPTIONS = [
  "〜30万円",
  "30〜50万円",
  "50〜100万円",
  "100〜300万円",
  "300万円以上",
  "要相談",
]

type Step = 1 | 2 | 3

const easing = [0.22, 1, 0.36, 1] as const

const slideVariants = {
  enter: { opacity: 0, y: 24 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
}

/** ステップインジケーター */
function StepIndicator({ current }: { current: Step }) {
  return (
    <div className="mb-10 flex items-center justify-center gap-0">
      {STEP_LABELS.map((label, i) => {
        const step = (i + 1) as Step
        const isActive = current === step
        const isDone = current > step
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold transition-all duration-300 ${
                  isActive
                    ? "border-ink bg-ink text-base"
                    : isDone
                      ? "border-pop bg-pop text-base"
                      : "border-border bg-card text-muted"
                }`}
              >
                {isDone ? "✓" : step}
              </div>
              <span
                className={`font-display text-[10px] tracking-wider ${
                  isActive ? "text-ink" : "text-muted"
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div
                className={`mb-5 mx-2 h-px w-16 md:w-24 transition-colors duration-300 ${
                  current > step ? "bg-pop" : "bg-border"
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

/** フォームフィールド共通 */
function FormField({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-display text-xs tracking-widest text-ink/70">
        {label}
        {required && <span className="ml-1 text-pop">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputClass =
  "w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-ink focus:outline-none transition-colors"

/** ステップ1: アポイント情報フォーム */
function AppointmentForm({
  data,
  onChange,
  onNext,
}: {
  data: AppointmentInput
  onChange: (d: Partial<AppointmentInput>) => void
  onNext: () => void
}) {
  const canSubmit = data.clientName && data.serviceType && data.requirements

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (canSubmit) onNext()
      }}
      className="flex flex-col gap-6"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <FormField label="クライアント名" required>
          <input
            type="text"
            className={inputClass}
            placeholder="山田 太郎"
            value={data.clientName}
            onChange={(e) => onChange({ clientName: e.target.value })}
            required
          />
        </FormField>
        <FormField label="会社名">
          <input
            type="text"
            className={inputClass}
            placeholder="株式会社〇〇"
            value={data.clientCompany}
            onChange={(e) => onChange({ clientCompany: e.target.value })}
          />
        </FormField>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <FormField label="メールアドレス">
          <input
            type="email"
            className={inputClass}
            placeholder="client@example.com"
            value={data.clientEmail}
            onChange={(e) => onChange({ clientEmail: e.target.value })}
          />
        </FormField>
        <FormField label="ミーティング日時">
          <input
            type="datetime-local"
            className={inputClass}
            value={data.meetingDate}
            onChange={(e) => onChange({ meetingDate: e.target.value })}
          />
        </FormField>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <FormField label="サービス種別" required>
          <select
            className={inputClass}
            value={data.serviceType}
            onChange={(e) => onChange({ serviceType: e.target.value })}
            required
          >
            <option value="">選択してください</option>
            {SERVICE_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="予算感">
          <select
            className={inputClass}
            value={data.budget}
            onChange={(e) => onChange({ budget: e.target.value })}
          >
            <option value="">選択してください</option>
            {BUDGET_OPTIONS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <FormField label="課題・ご要望" required>
        <textarea
          className={`${inputClass} min-h-[120px] resize-y`}
          placeholder="アポイントでお聞きした課題や要望を入力してください"
          value={data.requirements}
          onChange={(e) => onChange({ requirements: e.target.value })}
          required
        />
      </FormField>

      <FormField label="ペインポイント・背景">
        <textarea
          className={`${inputClass} min-h-[100px] resize-y`}
          placeholder="なぜこの課題が生まれているのか、背景を入力してください"
          value={data.painPoints}
          onChange={(e) => onChange({ painPoints: e.target.value })}
        />
      </FormField>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={!canSubmit}
          className="btn-invert disabled:cursor-not-allowed disabled:opacity-40"
        >
          AI で提案書を生成 →
        </button>
      </div>
    </form>
  )
}

/** ステップ2: 提案書プレビュー */
function ProposalPreview({
  proposal,
  onChange,
  onBack,
  onNext,
}: {
  proposal: GeneratedProposal
  onChange: (p: GeneratedProposal) => void
  onBack: () => void
  onNext: () => void
}) {
  const updateSection = (id: string, content: string) => {
    onChange({
      ...proposal,
      sections: proposal.sections.map((s) =>
        s.id === id ? { ...s, content } : s
      ),
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ヘッダー部分 */}
      <div className="rounded-2xl border border-border bg-ink p-6 text-base">
        <div className="font-display text-xs tracking-widest text-base/50 mb-1">
          PROPOSAL
        </div>
        <h2 className="font-serif-jp text-2xl font-bold leading-snug md:text-3xl">
          {proposal.title}
        </h2>
        <p className="mt-1 text-sm text-base/70">{proposal.subtitle}</p>
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-base/60">
          <span>有効期限: {proposal.validUntil}</span>
          {proposal.clientCompany && <span>宛先: {proposal.clientCompany}</span>}
        </div>
      </div>

      {/* セクション編集 */}
      {proposal.sections.map((section) => (
        <div
          key={section.id}
          className="rounded-2xl border border-border bg-card p-5"
        >
          <div className="mb-3 font-display text-xs tracking-widest text-muted">
            {section.heading.toUpperCase()}
          </div>
          <h3 className="font-serif-jp mb-3 text-lg font-bold">
            {section.heading}
          </h3>
          <textarea
            className="w-full resize-y rounded-xl border border-border bg-base px-4 py-3 text-sm leading-relaxed text-ink focus:border-ink focus:outline-none"
            value={section.content}
            rows={5}
            onChange={(e) => updateSection(section.id, e.target.value)}
          />
        </div>
      ))}

      {/* お見積もり */}
      <div className="rounded-2xl border border-pop/30 bg-pop/5 p-5">
        <div className="mb-1 font-display text-xs tracking-widest text-pop">
          INVESTMENT
        </div>
        <h3 className="font-serif-jp mb-3 text-lg font-bold">お見積もり</h3>
        <input
          type="text"
          className={`${inputClass} text-base font-bold`}
          value={proposal.investment}
          onChange={(e) => onChange({ ...proposal, investment: e.target.value })}
        />
      </div>

      {/* 次のステップ */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-1 font-display text-xs tracking-widest text-muted">
          NEXT STEPS
        </div>
        <h3 className="font-serif-jp mb-3 text-lg font-bold">次のステップ</h3>
        <ol className="flex flex-col gap-2">
          {proposal.nextSteps.map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-sm">
              <span className="font-display mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink text-[10px] text-base">
                {i + 1}
              </span>
              <input
                type="text"
                className="flex-1 border-b border-border bg-transparent pb-1 text-sm focus:border-ink focus:outline-none"
                value={step}
                onChange={(e) => {
                  const updated = [...proposal.nextSteps]
                  updated[i] = e.target.value
                  onChange({ ...proposal, nextSteps: updated })
                }}
              />
            </li>
          ))}
        </ol>
      </div>

      <div className="flex justify-between pt-2">
        <button onClick={onBack} className="btn-outline">
          ← 戻る
        </button>
        <button onClick={onNext} className="btn-invert">
          送付・出力へ →
        </button>
      </div>
    </div>
  )
}

/** ステップ3: 送付・出力パネル */
function ActionPanel({
  proposal,
  appointmentInput,
  onBack,
}: {
  proposal: GeneratedProposal
  appointmentInput: AppointmentInput
  onBack: () => void
}) {
  const printRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)

  const handlePrint = () => {
    window.print()
  }

  const handleCopyText = async () => {
    const text = [
      `# ${proposal.title}`,
      proposal.subtitle,
      "",
      ...proposal.sections.map(
        (s) => `## ${s.heading}\n\n${s.content}`
      ),
      "",
      `## お見積もり\n\n${proposal.investment}`,
      "",
      `## 次のステップ\n\n${proposal.nextSteps.map((s, i) => `${i + 1}. ${s}`).join("\n")}`,
    ].join("\n")

    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleMailto = () => {
    const subject = encodeURIComponent(proposal.title)
    const body = encodeURIComponent(
      `${proposal.clientName} 様\n\nいつもお世話になっております。\n\n先日のアポイントにてお伺いした内容をもとに、ご提案書をお送りいたします。\n\nご確認のほど、よろしくお願いいたします。\n\n${SITE_NAME}`
    )
    const mailto = `mailto:${appointmentInput.clientEmail}?subject=${subject}&body=${body}`
    window.open(mailto)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 提案書サマリー */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-4 font-display text-xs tracking-widest text-muted">
          PROPOSAL SUMMARY
        </div>
        <h2 className="font-serif-jp text-xl font-bold">{proposal.title}</h2>
        <p className="mt-1 text-sm text-muted">{proposal.subtitle}</p>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted">クライアント</span>
            <p className="font-bold">{proposal.clientName}</p>
          </div>
          <div>
            <span className="text-muted">有効期限</span>
            <p className="font-bold">{proposal.validUntil}</p>
          </div>
          <div>
            <span className="text-muted">お見積もり</span>
            <p className="font-bold text-pop">{proposal.investment}</p>
          </div>
          <div>
            <span className="text-muted">セクション数</span>
            <p className="font-bold">{proposal.sections.length}</p>
          </div>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="grid gap-4 md:grid-cols-2">
        <button
          onClick={handlePrint}
          className="flex flex-col items-start gap-2 rounded-2xl border border-border bg-card p-5 text-left transition-all hover:border-ink hover:shadow-md"
        >
          <span className="text-2xl">🖨️</span>
          <span className="font-serif-jp font-bold">PDF として保存</span>
          <span className="text-xs text-muted">
            ブラウザの印刷機能から PDF で出力できます
          </span>
        </button>

        <button
          onClick={handleCopyText}
          className="flex flex-col items-start gap-2 rounded-2xl border border-border bg-card p-5 text-left transition-all hover:border-ink hover:shadow-md"
        >
          <span className="text-2xl">{copied ? "✅" : "📋"}</span>
          <span className="font-serif-jp font-bold">
            {copied ? "コピーしました！" : "テキストをコピー"}
          </span>
          <span className="text-xs text-muted">
            Markdown 形式でクリップボードにコピーします
          </span>
        </button>

        <button
          onClick={handleMailto}
          disabled={!appointmentInput.clientEmail}
          className="flex flex-col items-start gap-2 rounded-2xl border border-border bg-card p-5 text-left transition-all hover:border-ink hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="text-2xl">✉️</span>
          <span className="font-serif-jp font-bold">メールで送付</span>
          <span className="text-xs text-muted">
            {appointmentInput.clientEmail
              ? `${appointmentInput.clientEmail} 宛にメールを開きます`
              : "メールアドレスを入力してください"}
          </span>
        </button>

        <div className="flex flex-col items-start gap-2 rounded-2xl border border-dashed border-border bg-base p-5">
          <span className="text-2xl">🎨</span>
          <span className="font-serif-jp font-bold text-muted">
            Canva でデザイン
          </span>
          <span className="text-xs text-muted">
            Canva MCP 連携により自動デザイン生成可能(Claude Code から実行)
          </span>
        </div>
      </div>

      {/* 印刷用プレビュー */}
      <div
        ref={printRef}
        className="hidden print:block"
        aria-hidden="true"
      />

      <div className="flex justify-between pt-2">
        <button onClick={onBack} className="btn-outline">
          ← 提案書を編集
        </button>
        <a href="/proposal" className="btn-invert">
          新しい提案書を作成
        </a>
      </div>
    </div>
  )
}

/** 提案書ジェネレーターのメインコンポーネント */
export default function ProposalGenerator() {
  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [appointmentInput, setAppointmentInput] = useState<AppointmentInput>({
    clientName: "",
    clientCompany: "",
    clientEmail: "",
    meetingDate: "",
    serviceType: "",
    budget: "",
    requirements: "",
    painPoints: "",
  })

  const [proposal, setProposal] = useState<GeneratedProposal | null>(null)

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/proposals/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appointmentInput),
      })
      if (!res.ok) throw new Error("生成に失敗しました")
      const data: GeneratedProposal = await res.json()
      setProposal(data)
      setStep(2)
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-16 md:px-10">
      {/* タイトル */}
      <div className="mb-10 text-center">
        <div className="font-display mb-3 text-xs tracking-widest text-muted">
          PROPOSAL GENERATOR
        </div>
        <h1 className="font-serif-jp text-3xl font-bold md:text-4xl">
          提案資料 自動生成
        </h1>
        <p className="mt-3 text-sm text-muted">
          アポイントの内容を入力するだけで、AI が提案書を自動生成します
        </p>
      </div>

      <StepIndicator current={step} />

      {/* エラー表示 */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-xl border border-pop/30 bg-pop/5 px-4 py-3 text-sm text-pop"
        >
          ⚠️ {error}
        </motion.div>
      )}

      {/* ローディング */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8 flex flex-col items-center gap-3 py-12"
        >
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-ink" />
          <p className="text-sm text-muted">AI が提案書を生成中...</p>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {!loading && (
          <motion.div
            key={step}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: easing }}
          >
            {step === 1 && (
              <AppointmentForm
                data={appointmentInput}
                onChange={(d) =>
                  setAppointmentInput((prev) => ({ ...prev, ...d }))
                }
                onNext={handleGenerate}
              />
            )}
            {step === 2 && proposal && (
              <ProposalPreview
                proposal={proposal}
                onChange={setProposal}
                onBack={() => setStep(1)}
                onNext={() => setStep(3)}
              />
            )}
            {step === 3 && proposal && (
              <ActionPanel
                proposal={proposal}
                appointmentInput={appointmentInput}
                onBack={() => setStep(2)}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 印刷時の提案書レイアウト */}
      {proposal && (
        <div className="hidden print:block">
          <div className="space-y-8 p-8">
            <div className="border-b border-gray-200 pb-6">
              <p className="text-xs text-gray-500">PROPOSAL</p>
              <h1 className="mt-1 text-3xl font-bold">{proposal.title}</h1>
              <p className="mt-1 text-gray-600">{proposal.subtitle}</p>
              <p className="mt-2 text-xs text-gray-400">
                有効期限: {proposal.validUntil}　|　作成者: {SITE_NAME}
              </p>
            </div>
            {proposal.sections.map((section) => (
              <div key={section.id} className="space-y-2">
                <h2 className="text-xl font-bold">{section.heading}</h2>
                <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">
                  {section.content}
                </p>
              </div>
            ))}
            <div className="rounded border border-gray-200 p-4">
              <h2 className="text-xl font-bold">お見積もり</h2>
              <p className="mt-2 text-lg font-bold text-gray-900">
                {proposal.investment}
              </p>
            </div>
            <div>
              <h2 className="text-xl font-bold">次のステップ</h2>
              <ol className="mt-2 list-decimal pl-5 text-sm">
                {proposal.nextSteps.map((s, i) => (
                  <li key={i} className="mt-1">
                    {s}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
