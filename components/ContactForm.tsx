"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import SectionHeading from "./SectionHeading";
import { COURSES } from "@/lib/courses";

/**
 * お問い合わせ・申込フォーム。
 * 現状は送信モック(コンソール出力 + 完了表示)。
 * Resend / Formspree などのメール送信サービスへ後日接続する想定。
 *
 * 【編集ポイント】
 * - SECTION_TITLE / SECTION_DESCRIPTION : 見出しコピー
 * - LABEL_*  : 各フィールドのラベル(業種に合わせて変更)
 * - コース選択肢は lib/courses.ts から自動生成
 */

const SECTION_TITLE = "{まずは話してみる。}";
const SECTION_DESCRIPTION =
  "{ご相談・体験のご希望・取材依頼など、お気軽にどうぞ。}";

const LABEL_NAME = "お名前";
const LABEL_EMAIL = "メールアドレス";
const LABEL_PROFILE = "ご職業・年代(任意)";
const LABEL_COURSE = "ご興味のあるプラン";
const LABEL_MESSAGE = "メッセージ";

const MESSAGE_PLACEHOLDER =
  "{ヒアリングしたい内容のヒントをここに(例: 経験・希望・気になる点)。}";

const SUBMIT_NOTE = "送信前に内容をご確認ください。返信は2〜3営業日以内。";

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    // TODO: 後日メール送信サービス(Resend / Formspree など)へ接続
    console.log("[contact] 送信内容:", data);
    await new Promise((r) => setTimeout(r, 700));
    setSubmitted(true);
    setSubmitting(false);
  };

  return (
    <section
      id="contact"
      className="relative w-full border-t border-border bg-card px-5 py-24 md:px-10 md:py-32"
    >
      <SectionHeading
        number="007"
        label="CONTACT"
        title={SECTION_TITLE}
        description={SECTION_DESCRIPTION}
      />

      <div className="mx-auto max-w-3xl">
        {submitted ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-border bg-base p-10 text-center"
          >
            <p className="font-display text-xs tracking-widest text-pop">
              THANK YOU
            </p>
            <h3 className="mt-3 font-serif-jp text-2xl font-bold md:text-3xl">
              送信を受け付けました(仮)
            </h3>
            <p className="mt-3 text-sm text-ink/70">
              内容を確認のうえ、追ってメールにてご連絡いたします。
            </p>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            onSubmit={onSubmit}
            className="space-y-6"
          >
            <Field
              label={LABEL_NAME}
              name="name"
              required
              placeholder="山田 太郎"
            />
            <Field
              label={LABEL_EMAIL}
              name="email"
              type="email"
              required
              placeholder="example@mail.com"
            />
            <Field label={LABEL_PROFILE} name="profile" />

            {/* 希望コース */}
            <div>
              <label
                htmlFor="course"
                className="mb-2 block font-display text-[10px] tracking-widest text-muted"
              >
                {LABEL_COURSE}
              </label>
              <select
                id="course"
                name="course"
                defaultValue=""
                className="w-full rounded-2xl border border-border bg-base px-4 py-3 text-sm transition-colors focus:border-ink focus:outline-none"
              >
                <option value="" disabled>
                  選択してください
                </option>
                {COURSES.map((c) => (
                  <option key={c.number} value={c.number}>
                    {c.name}
                  </option>
                ))}
                <option value="undecided">まだ決めていない / 相談したい</option>
              </select>
            </div>

            {/* メッセージ */}
            <div>
              <label
                htmlFor="message"
                className="mb-2 block font-display text-[10px] tracking-widest text-muted"
              >
                {LABEL_MESSAGE} <span className="text-pop">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                placeholder={MESSAGE_PLACEHOLDER}
                className="w-full resize-none rounded-2xl border border-border bg-base px-4 py-3 text-sm transition-colors focus:border-ink focus:outline-none"
              />
            </div>

            <div className="flex flex-col items-start gap-4 pt-2 md:flex-row md:items-center md:justify-between">
              <p className="text-xs text-muted">{SUBMIT_NOTE}</p>
              <button
                type="submit"
                disabled={submitting}
                className="btn-invert w-full text-sm md:w-auto"
              >
                {submitting ? "送信中…" : "送信する →"}
              </button>
            </div>
          </motion.form>
        )}
      </div>
    </section>
  );
}

/** 共通入力フィールド */
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
