"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { SITE_NAME } from "@/lib/config";
import type { ProposalDocument } from "@/lib/proposal";

/**
 * 自動生成された提案資料の表示ページ。
 *
 * /proposal で入力→生成された内容を sessionStorage から読み込んで表示する。
 * 「印刷 / PDFとして保存」ボタンはブラウザの印刷機能(window.print)を使う
 * シンプルな実装。ヘッダー・フッター・チャットボットは印刷時に非表示になる
 * (各コンポーネントに print:hidden を付与済み)。
 *
 * sessionStorage(外部ストア)の読み取りは useSyncExternalStore で行い、
 * サーバー側では常に null を返すことで SSR とのズレを防ぐ。
 */

const STORAGE_KEY = "proposal:latest";

function subscribe() {
  // sessionStorage は他タブから変化しないため購読は不要
  return () => {};
}

function getSnapshot() {
  return sessionStorage.getItem(STORAGE_KEY);
}

function getServerSnapshot() {
  return null;
}

export default function ProposalResultPage() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  let proposal: ProposalDocument | null = null;
  if (raw) {
    try {
      proposal = JSON.parse(raw) as ProposalDocument;
    } catch {
      proposal = null;
    }
  }

  if (!proposal) {
    return (
      <section className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center px-5 py-24 text-center">
        <p className="font-serif-jp text-xl font-bold">
          表示できる提案資料がありません
        </p>
        <p className="mt-3 text-sm text-ink/70">
          先にヒアリング内容を入力して、提案資料を生成してください。
        </p>
        <Link href="/proposal" className="btn-invert mt-8 text-sm">
          入力画面へ戻る →
        </Link>
      </section>
    );
  }

  if (!proposal) return null;

  return (
    <section className="mx-auto w-full max-w-3xl px-5 py-16 md:px-10 md:py-24">
      {/* 操作バー(印刷時は非表示) */}
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <Link
          href="/proposal"
          className="text-xs text-muted transition-colors hover:text-pop"
        >
          ← 入力画面へ戻る
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="btn-invert text-sm"
        >
          印刷 / PDFとして保存
        </button>
      </div>

      {/* 提案資料本体 */}
      <div className="rounded-3xl border border-border bg-card p-8 print:rounded-none print:border-0 print:bg-white print:p-0 md:p-14">
        <header className="border-b border-border pb-8">
          <p className="font-display text-xs tracking-[0.25em] text-muted">
            PROPOSAL
          </p>
          <h1 className="mt-3 font-serif-jp text-2xl font-bold leading-snug md:text-3xl">
            {proposal.client.name} 様 ご提案書
          </h1>
          <dl className="mt-6 grid gap-2 text-sm text-ink/75 md:grid-cols-3">
            <div>
              <dt className="font-display text-[10px] tracking-widest text-muted">
                業種
              </dt>
              <dd>{proposal.client.industry || "—"}</dd>
            </div>
            <div>
              <dt className="font-display text-[10px] tracking-widest text-muted">
                アポイント日
              </dt>
              <dd>{proposal.client.meetingDate || "—"}</dd>
            </div>
            <div>
              <dt className="font-display text-[10px] tracking-widest text-muted">
                発行元
              </dt>
              <dd>{SITE_NAME}</dd>
            </div>
          </dl>
        </header>

        <DocSection number="01" title="ヒアリングで伺った課題">
          {proposal.challenges.length > 0 ? (
            <ul className="list-disc space-y-1 pl-5">
              {proposal.challenges.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          ) : (
            <p className="text-ink/60">—</p>
          )}
        </DocSection>

        <DocSection number="02" title="ご提案プラン">
          <div className="rounded-2xl border border-border bg-base p-6">
            <p className="font-serif-jp text-xl font-bold">
              {proposal.recommended.name}
            </p>
            <p className="mt-1 text-sm text-ink/70">
              {proposal.recommended.tagline}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink/75">
              {proposal.recommended.description}
            </p>
            <dl className="mt-4 grid gap-2 text-sm text-ink/75 md:grid-cols-3">
              <div>
                <dt className="font-display text-[10px] tracking-widest text-muted">
                  提供形態
                </dt>
                <dd>{proposal.recommended.format}</dd>
              </div>
              <div>
                <dt className="font-display text-[10px] tracking-widest text-muted">
                  期間・回数
                </dt>
                <dd>{proposal.recommended.duration}</dd>
              </div>
              <div>
                <dt className="font-display text-[10px] tracking-widest text-muted">
                  お見積り
                </dt>
                <dd className="font-bold text-pop">
                  {proposal.recommended.price}
                </dd>
              </div>
            </dl>
          </div>

          {proposal.alternatives.length > 0 && (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {proposal.alternatives.map((c) => (
                <div
                  key={c.number}
                  className="rounded-2xl border border-border px-5 py-4 text-sm"
                >
                  <p className="font-bold">{c.name}</p>
                  <p className="mt-1 text-ink/60">{c.tagline}</p>
                  <p className="mt-2 text-xs text-muted">{c.price}</p>
                </div>
              ))}
            </div>
          )}
        </DocSection>

        <DocSection number="03" title="ご提案理由">
          <ul className="list-disc space-y-1 pl-5">
            {proposal.reasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </DocSection>

        <DocSection number="04" title="想定スケジュール">
          <ol className="space-y-2">
            {proposal.schedule.map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className="font-display text-xs text-muted">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </DocSection>

        <DocSection number="05" title="次のステップ">
          <ul className="list-disc space-y-1 pl-5">
            {proposal.nextSteps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </DocSection>

        {proposal.notes && (
          <DocSection number="06" title="備考">
            <p className="whitespace-pre-line">{proposal.notes}</p>
          </DocSection>
        )}
      </div>
    </section>
  );
}

function DocSection({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-border py-8 last:border-b-0 print:break-inside-avoid">
      <div className="mb-3 flex items-center gap-3 font-display text-xs tracking-widest text-muted">
        <span>#{number}</span>
        <span className="h-px w-8 bg-muted" />
        <span>{title}</span>
      </div>
      <div className="text-sm leading-relaxed text-ink/85">{children}</div>
    </section>
  );
}
