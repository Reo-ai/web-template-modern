/**
 * 「アポイント内容 → 提案資料」自動生成のロジック。
 *
 * 商談・ヒアリングで聞いた内容(課題・予算・希望時期など)を入力すると、
 * lib/courses.ts のプランと突き合わせて、そのままお客様に見せられる
 * 提案書ドキュメント(見出し・課題整理・提案内容・お見積り・次のステップ)を組み立てる。
 *
 * 外部 AI API には依存せず、キーワード一致によるルールベースで生成する
 * (このテンプレートには API キー等の外部連携設定がないため)。
 * 生成された文面は必ず人がレビュー・微修正してから提出する前提。
 */

import { COURSES, type Course } from "./courses";

/** ヒアリングフォームの入力内容 */
export type ProposalInput = {
  /** 顧客名・会社名 */
  clientName: string;
  /** 先方のご担当者名(任意) */
  contactPerson: string;
  /** 業種(任意) */
  industry: string;
  /** 商談・アポイントの実施日(YYYY-MM-DD) */
  meetingDate: string;
  /** 課題・ご要望(自由記述、ヒアリングメモの中心) */
  needs: string;
  /** ご予算感(任意、自由記述) */
  budget: string;
  /** 導入・開始の希望時期(任意) */
  timeline: string;
  /** その他ヒアリングメモ(任意) */
  notes: string;
};

export const EMPTY_PROPOSAL_INPUT: ProposalInput = {
  clientName: "",
  contactPerson: "",
  industry: "",
  meetingDate: "",
  needs: "",
  budget: "",
  timeline: "",
  notes: "",
};

/** キーワード一致でスコアリングされたプラン候補 */
export type PlanMatch = {
  course: Course;
  score: number;
  matchedKeywords: string[];
};

/** 生成された提案資料 */
export type ProposalDocument = {
  title: string;
  clientName: string;
  contactPerson: string;
  industry: string;
  meetingDate: string;
  createdAt: string;
  summary: string;
  issues: string[];
  recommendedPlans: PlanMatch[];
  benefits: string[];
  estimate: string;
  nextSteps: string[];
};

/** ヒアリングメモから比較用キーワードを抽出する(簡易トークナイズ) */
function extractKeywords(text: string): string[] {
  return Array.from(
    new Set(
      text
        .split(/[、。,.\s・\/\n]+/)
        .map((w) => w.trim())
        .filter((w) => w.length >= 2)
    )
  );
}

/** ヒアリング内容とプランのキーワード一致度をスコアリングする */
export function matchCourses(input: ProposalInput): PlanMatch[] {
  const keywords = extractKeywords(`${input.needs} ${input.notes}`);

  const matches = COURSES.map((course) => {
    const haystack = `${course.name} ${course.tagline} ${course.description}`;
    const matchedKeywords = keywords.filter((kw) => haystack.includes(kw));
    return { course, score: matchedKeywords.length, matchedKeywords };
  });

  const withScore = matches.filter((m) => m.score > 0);
  if (withScore.length > 0) {
    return withScore.sort((a, b) => b.score - a.score);
  }

  // ヒットなしの場合は先頭2プランを「ご案内候補」として返す
  return matches.slice(0, 2);
}

/** 課題整理: ヒアリングメモを箇条書きに分解する */
function splitIssues(input: ProposalInput): string[] {
  const raw = `${input.needs}\n${input.notes}`;
  const lines = raw
    .split(/[。\n]+/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  return lines.length > 0 ? lines : ["(ヒアリング内容が未入力です)"];
}

/** ベネフィット(想定される効果)を組み立てる */
function buildBenefits(topMatch: PlanMatch | undefined): string[] {
  const benefits: string[] = [];

  if (topMatch) {
    benefits.push(
      `「${topMatch.course.name}」により、${topMatch.course.tagline}を実現`
    );
    if (topMatch.course.description) {
      benefits.push(topMatch.course.description);
    }
  }

  benefits.push(
    "ヒアリング内容に沿った個別カスタマイズで、無駄のない進行が可能",
    "導入後も状況に応じて継続的にフォローアップ"
  );

  return benefits;
}

/** 入力内容から提案資料一式を生成する */
export function generateProposal(
  input: ProposalInput,
  createdAt: string
): ProposalDocument {
  const recommendedPlans = matchCourses(input);
  const topMatch = recommendedPlans[0];

  return {
    title: `${input.clientName || "お客様"}様 向けご提案書`,
    clientName: input.clientName || "お客様",
    contactPerson: input.contactPerson,
    industry: input.industry,
    meetingDate: input.meetingDate,
    createdAt,
    summary:
      input.needs.trim().length > 0
        ? input.needs.trim()
        : "(商談時のご要望・課題感をヒアリング内容欄に入力してください)",
    issues: splitIssues(input),
    recommendedPlans,
    benefits: buildBenefits(topMatch),
    estimate: topMatch
      ? `${topMatch.course.name}: ${topMatch.course.price}${
          input.budget ? `(ご予算感: ${input.budget})` : ""
        }`
      : `要お見積り${input.budget ? `(ご予算感: ${input.budget})` : ""}`,
    nextSteps: [
      "本提案書の内容について、認識のすり合わせ",
      "ご契約内容・スケジュールの確定",
      input.timeline
        ? `キックオフ(希望時期: ${input.timeline})`
        : "キックオフミーティングの実施",
      "サービス開始・運用開始",
    ],
  };
}

/** 提案資料をダウンロード用のプレーンテキストに変換する */
export function proposalToText(doc: ProposalDocument): string {
  const lines: string[] = [];

  lines.push(doc.title);
  lines.push(`作成日: ${doc.createdAt}`);
  if (doc.meetingDate) lines.push(`商談日: ${doc.meetingDate}`);
  if (doc.contactPerson) lines.push(`ご担当者: ${doc.contactPerson} 様`);
  if (doc.industry) lines.push(`業種: ${doc.industry}`);
  lines.push("");

  lines.push("■ ヒアリング内容サマリー");
  lines.push(doc.summary);
  lines.push("");

  lines.push("■ 課題の整理");
  doc.issues.forEach((issue) => lines.push(`・${issue}`));
  lines.push("");

  lines.push("■ ご提案内容");
  doc.recommendedPlans.forEach((m) => {
    lines.push(
      `・${m.course.name}(${m.course.price} / ${m.course.duration})`
    );
    lines.push(`  ${m.course.description}`);
  });
  lines.push("");

  lines.push("■ 想定されるメリット");
  doc.benefits.forEach((b) => lines.push(`・${b}`));
  lines.push("");

  lines.push("■ お見積り目安");
  lines.push(doc.estimate);
  lines.push("");

  lines.push("■ 次のステップ");
  doc.nextSteps.forEach((s, i) => lines.push(`${i + 1}. ${s}`));

  return lines.join("\n");
}
