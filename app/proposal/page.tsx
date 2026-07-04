"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  EMPTY_PROPOSAL_INPUT,
  generateProposal,
  proposalToText,
  type ProposalDocument,
  type ProposalInput,
} from "@/lib/proposal";

/**
 * 「アポイントの内容に応じて提案資料を自動で作る」内部ツールページ。
 *
 * 商談・アポイントで聞いた内容(課題・予算・希望時期など)をフォームに入力すると、
 * lib/courses.ts のプランと突き合わせて提案書ドキュメントを生成する。
 * サイト訪問者向けのページではなく、営業担当が使う社内ツールという位置づけのため、
 * Header のナビゲーションには載せず /proposal に直接アクセスして使う想定。
 *
 * 生成はキーワード一致によるルールベース(外部 AI API 不使用)。
 * 出力はそのまま印刷(ブラウザの印刷 → PDF保存)、またはテキストファイルとしてダウンロードできる。
 *
 * 【編集ポイント】
 * - プランの中身は lib/courses.ts を編集すれば自動で反映される
 * - 文面のトーンを変えたい場合は lib/proposal.ts の generateProposal / buildBenefits を編集
 */

const FIELDS: {
  name: keyof ProposalInput;
  label: string;
  type?: "text" | "date" | "textarea";
  required?: boolean;
  placeholder?: string;
}[] = [
  { name: "clientName", label: "顧客名・会社名", required: true, placeholder: "株式会社サンプル" },
  { name: "contactPerson", label: "ご担当者名", placeholder: "山田 太郎 様" },
  { name: "industry", label: "業種", placeholder: "飲食 / IT / 教育 など" },
  { name: "meetingDate", label: "商談・アポイント実施日", type: "date" },
  {
    name: "needs",
    label: "課題・ご要望(ヒアリングメモ)",
    type: "textarea",
    required: true,
    placeholder: "商談で伺った課題・ご要望を自由に記入してください",
  },
  { name: "budget", label: "ご予算感", placeholder: "月10万円〜 など" },
  { name: "timeline", label: "導入・開始の希望時期", placeholder: "来月中 / 未定 など" },
  { name: "notes", label: "その他メモ", type: "textarea", placeholder: "その他ヒアリング内容" },
];

export default function ProposalGeneratorPage() {
  const [input, setInput] = useState<ProposalInput>(EMPTY_PROPOSAL_INPUT);
  const [doc, setDoc] = useState<ProposalDocument | null>(null);

  const handleChange = (name: keyof ProposalInput, value: string) => {
    setInput((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const createdAt = new Date().toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    setDoc(generateProposal(input, createdAt));
  };

  const handleDownload = () => {
    if (!doc) return;
    const blob = new Blob([proposalToText(doc)], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${doc.clientName}様_ご提案書.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="print-page mx-auto max-w-5xl px-5 pb-32 pt-32 md:px-10 md:pt-40">
      <div className="print:hidden">
        <div className="flex items-center gap-3 font-display text-xs tracking-[0.25em] text-muted">
          <span>TOOL</span>
          <span className="h-px w-8 bg-muted" />
          <span>PROPOSAL GENERATOR</span>
        </div>
        <h1 className="mt-4 whitespace-pre-line font-serif-jp text-3xl font-bold leading-tight tracking-tight md:text-5xl">
          {"アポイント内容から\n提案資料を自動生成"}
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-relaxed text-ink/75 md:text-base">
          商談・アポイントでヒアリングした内容を入力すると、サービスプランと突き合わせて
          提案書のたたき台を自動生成します。生成後は内容を必ず確認・調整してからご利用ください。
        </p>
      </div>

      <div className="mt-14 grid gap-10 print:mt-0 print:block lg:grid-cols-2">
        {/* 入力フォーム */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          onSubmit={handleGenerate}
          className="space-y-6 print:hidden"
        >
          {FIELDS.map((field) => (
            <div key={field.name}>
              <label
                htmlFor={field.name}
                className="mb-2 block font-display text-[10px] tracking-widest text-muted"
              >
                {field.label} {field.required && <span className="text-pop">*</span>}
              </label>
              {field.type === "textarea" ? (
                <textarea
                  id={field.name}
                  name={field.name}
                  rows={4}
                  required={field.required}
                  placeholder={field.placeholder}
                  value={input[field.name]}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  className="w-full resize-none rounded-2xl border border-border bg-base px-4 py-3 text-sm transition-colors focus:border-ink focus:outline-none"
                />
              ) : (
                <input
                  id={field.name}
                  name={field.name}
                  type={field.type ?? "text"}
                  required={field.required}
                  placeholder={field.placeholder}
                  value={input[field.name]}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  className="w-full rounded-2xl border border-border bg-base px-4 py-3 text-sm transition-colors focus:border-ink focus:outline-none"
                />
              )}
            </div>
          ))}

          <button type="submit" className="btn-invert w-full text-sm md:w-auto">
            提案書を生成する →
          </button>
        </motion.form>

        {/* プレビュー / 出力 */}
        <div>
          {doc ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-3xl border border-border bg-card p-8 print:rounded-none print:border-none print:bg-white print:p-0 md:p-10"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
                <p className="font-display text-xs tracking-widest text-pop">PREVIEW</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="btn-outline text-xs"
                  >
                    印刷 / PDF保存
                  </button>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="btn-outline text-xs"
                  >
                    テキストで保存
                  </button>
                </div>
              </div>

              <h2 className="mt-6 font-serif-jp text-2xl font-bold md:text-3xl print:mt-0">
                {doc.title}
              </h2>
              <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-muted md:text-sm">
                <div>
                  <dt className="inline font-display tracking-widest">作成日: </dt>
                  <dd className="inline">{doc.createdAt}</dd>
                </div>
                {doc.meetingDate && (
                  <div>
                    <dt className="inline font-display tracking-widest">商談日: </dt>
                    <dd className="inline">{doc.meetingDate}</dd>
                  </div>
                )}
                {doc.contactPerson && (
                  <div>
                    <dt className="inline font-display tracking-widest">ご担当者: </dt>
                    <dd className="inline">{doc.contactPerson} 様</dd>
                  </div>
                )}
                {doc.industry && (
                  <div>
                    <dt className="inline font-display tracking-widest">業種: </dt>
                    <dd className="inline">{doc.industry}</dd>
                  </div>
                )}
              </dl>

              <Section title="ヒアリング内容サマリー">
                <p className="whitespace-pre-line text-sm leading-relaxed text-ink/85">
                  {doc.summary}
                </p>
              </Section>

              <Section title="課題の整理">
                <ul className="space-y-1 text-sm leading-relaxed text-ink/85">
                  {doc.issues.map((issue, i) => (
                    <li key={i}>・{issue}</li>
                  ))}
                </ul>
              </Section>

              <Section title="ご提案内容">
                <div className="space-y-4">
                  {doc.recommendedPlans.map((m) => (
                    <div key={m.course.number} className="rounded-2xl border border-border p-4">
                      <p className="font-serif-jp text-lg font-bold">{m.course.name}</p>
                      <p className="mt-1 text-xs text-muted">
                        {m.course.format} / {m.course.duration} / {m.course.price}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-ink/85">
                        {m.course.description}
                      </p>
                    </div>
                  ))}
                </div>
              </Section>

              <Section title="想定されるメリット">
                <ul className="space-y-1 text-sm leading-relaxed text-ink/85">
                  {doc.benefits.map((b, i) => (
                    <li key={i}>・{b}</li>
                  ))}
                </ul>
              </Section>

              <Section title="お見積り目安">
                <p className="text-sm leading-relaxed text-ink/85">{doc.estimate}</p>
              </Section>

              <Section title="次のステップ">
                <ol className="space-y-1 text-sm leading-relaxed text-ink/85">
                  {doc.nextSteps.map((s, i) => (
                    <li key={i}>
                      {i + 1}. {s}
                    </li>
                  ))}
                </ol>
              </Section>
            </motion.div>
          ) : (
            <div className="flex h-full min-h-[240px] items-center justify-center rounded-3xl border border-dashed border-border p-10 text-center text-sm text-muted print:hidden">
              左のフォームに入力して「提案書を生成する」を押すと、
              <br />
              ここにプレビューが表示されます。
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** 提案書内の見出し付きセクション */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-8 border-t border-border pt-6 print:mt-6 print:pt-4">
      <p className="font-display text-[10px] tracking-widest text-muted">{title}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}
