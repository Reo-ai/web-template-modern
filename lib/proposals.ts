/**
 * 提案書自動生成システムの型定義とプロンプトビルダー。
 *
 * AppointmentInput  : アポイントフォームで収集するデータ
 * ProposalOutput    : Claude が生成する提案書の構造
 * buildPrompt()     : Claude に渡すシステム/ユーザープロンプトを構築
 */

import { COURSES } from "./courses";
import { SITE_NAME } from "./config";

/** アポイントフォームの入力値 */
export type AppointmentInput = {
  /** 相手の会社名・屋号 */
  companyName: string;
  /** 担当者名 */
  contactName: string;
  /** 担当者の役職(任意) */
  contactTitle: string;
  /** 業種・業態 */
  industry: string;
  /** 現状の課題・悩み(自由記述) */
  challenges: string;
  /** 目標・理想の状態(自由記述) */
  goals: string;
  /** 予算感(選択式) */
  budget: string;
  /** 希望する導入時期(選択式) */
  timeline: string;
  /** アポイントで話した内容のメモ(自由記述) */
  appointmentNotes: string;
  /** 興味を持ったサービス番号(courses.ts の number) */
  interestedCourse: string;
};

/** 提案書の各セクション */
export type ProposalSection = {
  id: string;
  title: string;
  /** メインコンテンツ(段落テキスト) */
  body: string;
  /** 箇条書きリスト(省略可) */
  bullets?: string[];
};

/** Claude が生成する提案書全体 */
export type ProposalOutput = {
  /** 提案書タイトル */
  title: string;
  /** 提出先(例: 株式会社○○ 御中) */
  recipient: string;
  /** 発行日 */
  date: string;
  /** エグゼクティブサマリー(1〜2段落) */
  summary: string;
  /** 本文セクション(3〜5セクション) */
  sections: ProposalSection[];
  /** 推奨プランの提案 */
  recommendedPlan: {
    name: string;
    reason: string;
    price: string;
    duration: string;
    format: string;
  };
  /** 次のステップ(箇条書き) */
  nextSteps: string[];
};

/** 予算選択肢 */
export const BUDGET_OPTIONS = [
  { value: "under_100k", label: "10万円未満" },
  { value: "100k_300k", label: "10〜30万円" },
  { value: "300k_500k", label: "30〜50万円" },
  { value: "500k_1m", label: "50〜100万円" },
  { value: "over_1m", label: "100万円以上" },
  { value: "undecided", label: "未定 / 要相談" },
];

/** 導入時期選択肢 */
export const TIMELINE_OPTIONS = [
  { value: "asap", label: "できるだけ早く" },
  { value: "1month", label: "1ヶ月以内" },
  { value: "3months", label: "3ヶ月以内" },
  { value: "6months", label: "半年以内" },
  { value: "1year", label: "1年以内" },
  { value: "undecided", label: "未定" },
];

/** Claude に渡すプロンプトを組み立てる */
export function buildPrompt(input: AppointmentInput, today: string): string {
  const courseList = COURSES.map(
    (c) =>
      `・${c.name}(${c.price} / ${c.duration} / ${c.format}): ${c.description}`
  ).join("\n");

  const selectedCourse =
    COURSES.find((c) => c.number === input.interestedCourse) ?? null;

  const budgetLabel =
    BUDGET_OPTIONS.find((b) => b.value === input.budget)?.label ?? input.budget;
  const timelineLabel =
    TIMELINE_OPTIONS.find((t) => t.value === input.timeline)?.label ??
    input.timeline;

  return `あなたはプロフェッショナルな営業提案書を作成するアシスタントです。
以下のアポイント情報と提供サービス一覧をもとに、顧客向けの提案書を JSON 形式で作成してください。

【提案者情報】
サービス提供者: ${SITE_NAME}

【アポイント情報】
- 相手企業: ${input.companyName}
- 担当者: ${input.contactName}${input.contactTitle ? ` (${input.contactTitle})` : ""}
- 業種: ${input.industry}
- 現状の課題: ${input.challenges}
- 目標・理想の状態: ${input.goals}
- 予算感: ${budgetLabel}
- 希望導入時期: ${timelineLabel}
- アポイントメモ: ${input.appointmentNotes || "なし"}
- 興味を示したサービス: ${selectedCourse ? `${selectedCourse.name}(${selectedCourse.tagline})` : "未定"}

【提供サービス一覧】
${courseList}

【生成ルール】
1. 提案書は日本語のビジネス文書として、丁寧かつ具体的に記述する
2. 顧客の課題・目標を正確に把握・整理し、解決策を論理的に展開する
3. 推奨プランは提供サービス一覧から1つ選び、選択理由を具体的に述べる
4. 次のステップは顧客がすぐ行動できる具体的なアクションを3〜5個挙げる
5. 全体のトーンは「プロフェッショナルかつ親しみやすい」に統一する

以下の JSON スキーマで厳密に返答してください。それ以外のテキストは一切含めないこと:

{
  "title": "提案書タイトル(例: Webサイト制作・集客支援 ご提案書)",
  "recipient": "${input.companyName} ${input.contactName}様",
  "date": "${today}",
  "summary": "エグゼクティブサマリー(2〜3段落)",
  "sections": [
    {
      "id": "challenges",
      "title": "現状課題の整理",
      "body": "課題分析の段落テキスト",
      "bullets": ["課題1", "課題2", "課題3"]
    },
    {
      "id": "solution",
      "title": "ご提案内容",
      "body": "ソリューションの段落テキスト",
      "bullets": ["提案ポイント1", "提案ポイント2", "提案ポイント3"]
    },
    {
      "id": "roadmap",
      "title": "導入ロードマップ",
      "body": "フェーズ別導入計画の段落テキスト",
      "bullets": ["フェーズ1: ...", "フェーズ2: ...", "フェーズ3: ..."]
    },
    {
      "id": "roi",
      "title": "期待される効果・投資対効果",
      "body": "ROIと期待成果の段落テキスト",
      "bullets": ["効果1", "効果2", "効果3"]
    }
  ],
  "recommendedPlan": {
    "name": "プラン名",
    "reason": "このプランをお勧めする理由(2〜3文)",
    "price": "価格",
    "duration": "期間・回数",
    "format": "提供形態"
  },
  "nextSteps": [
    "次のステップ1",
    "次のステップ2",
    "次のステップ3"
  ]
}`;
}
