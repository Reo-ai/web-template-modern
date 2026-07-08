"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { COURSES } from "@/lib/courses";
import { generateProposal, type AppointmentInput } from "@/lib/proposal";
import { SITE_NAME } from "@/lib/config";

/**
 * 提案資料オートメーション(内部ツール)。
 *
 * 商談・アポイントのヒアリング内容を入力すると、lib/courses.ts の
 * プランと突き合わせて提案資料を自動生成し、/proposal/result で表示する。
 * 生成結果は sessionStorage 経由で受け渡す(サーバー保存はしない)。
 *
 * このページはお客様向けではなく、事業者側が商談後に使う内部ツール想定のため
 * ヘッダーの公開ナビゲーションには載せていない(URL を直接開いて使う)。
 */

const STORAGE_KEY = "proposal:latest";

const EMPTY_INPUT: AppointmentInput = {
  clientName: "",
  industry: "",
  meetingDate: "",
  budget: "",
  needs: "",
  interestedCourseNumber: "",
  notes: "",
};

export default function ProposalFormPage() {
  const router = useRouter();
  const [input, setInput] = useState<AppointmentInput>(EMPTY_INPUT);
  const [generating, setGenerating] = useState(false);

  const update = <K extends keyof AppointmentInput>(
    key: K,
    value: AppointmentInput[K]
  ) => setInput((prev) => ({ ...prev, [key]: value }));

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGenerating(true);
    const proposal = generateProposal(input);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(proposal));
    router.push("/proposal/result");
  };

  return (
    <section className="mx-auto w-full max-w-3xl px-5 py-24 md:px-10 md:py-32">
      <div className="mb-12">
        <div className="flex items-center gap-3 font-display text-xs tracking-[0.25em] text-muted">
          <span>#TOOL</span>
          <span className="h-px w-8 bg-muted" />
          <span>PROPOSAL GENERATOR</span>
        </div>
        <h1 className="mt-4 font-serif-jp text-3xl font-bold leading-tight tracking-tight md:text-5xl">
          アポイント内容から提案資料を自動作成
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-relaxed text-ink/75 md:text-base">
          商談・アポイントで聞いた内容を入力すると、{SITE_NAME}
          のサービス内容と突き合わせて提案資料を自動生成します。
        </p>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        onSubmit={onSubmit}
        className="space-y-6"
      >
        <Field
          label="先方のお名前 / 会社名"
          value={input.clientName}
          onChange={(v) => update("clientName", v)}
          required
          placeholder="山田 太郎"
        />
        <Field
          label="業種・ご職業"
          value={input.industry}
          onChange={(v) => update("industry", v)}
          placeholder="例: 飲食店経営 / フリーランスデザイナー"
        />
        <Field
          label="アポイント実施日"
          type="date"
          value={input.meetingDate}
          onChange={(v) => update("meetingDate", v)}
          required
        />
        <Field
          label="ご予算感"
          value={input.budget}
          onChange={(v) => update("budget", v)}
          placeholder="例: 月5万円くらい / 10万〜15万"
        />

        <div>
          <label
            htmlFor="interestedCourse"
            className="mb-2 block font-display text-[10px] tracking-widest text-muted"
          >
            商談中に話題に出たプラン(任意)
          </label>
          <select
            id="interestedCourse"
            value={input.interestedCourseNumber}
            onChange={(e) => update("interestedCourseNumber", e.target.value)}
            className="w-full rounded-2xl border border-border bg-base px-4 py-3 text-sm transition-colors focus:border-ink focus:outline-none"
          >
            <option value="">特になし(予算・課題感から自動で選定)</option>
            {COURSES.map((c) => (
              <option key={c.number} value={c.number}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="needs"
            className="mb-2 block font-display text-[10px] tracking-widest text-muted"
          >
            ヒアリングで聞いた課題・要望 <span className="text-pop">*</span>
          </label>
          <textarea
            id="needs"
            value={input.needs}
            onChange={(e) => update("needs", e.target.value)}
            rows={5}
            required
            placeholder="例: 集客が安定しない。SNS運用の時間が取れない。まずは低コストで試したい。"
            className="w-full resize-none rounded-2xl border border-border bg-base px-4 py-3 text-sm transition-colors focus:border-ink focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="notes"
            className="mb-2 block font-display text-[10px] tracking-widest text-muted"
          >
            その他メモ(任意)
          </label>
          <textarea
            id="notes"
            value={input.notes}
            onChange={(e) => update("notes", e.target.value)}
            rows={3}
            placeholder="提案書の備考欄に載せたいことがあれば"
            className="w-full resize-none rounded-2xl border border-border bg-base px-4 py-3 text-sm transition-colors focus:border-ink focus:outline-none"
          />
        </div>

        <div className="flex flex-col items-start gap-4 pt-2 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-muted">
            入力内容は保存されず、この端末上でのみ提案書に変換されます。
          </p>
          <button
            type="submit"
            disabled={generating}
            className="btn-invert w-full text-sm md:w-auto"
          >
            {generating ? "生成中…" : "提案資料を生成する →"}
          </button>
        </div>
      </motion.form>
    </section>
  );
}

/** 共通入力フィールド */
function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block font-display text-[10px] tracking-widest text-muted">
        {label} {required && <span className="text-pop">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-border bg-base px-4 py-3 text-sm transition-colors focus:border-ink focus:outline-none"
      />
    </div>
  );
}
