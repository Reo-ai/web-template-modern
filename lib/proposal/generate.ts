import Anthropic from "@anthropic-ai/sdk";
import type { AppointmentInput, GeneratedProposal } from "./types";

/**
 * 提案資料の構成(GeneratedProposal)に対応する JSON Schema。
 * output_config.format に渡し、Claude の応答をこの形に強制する。
 */
const PROPOSAL_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string", description: "提案書のタイトル" },
    clientName: { type: "string", description: "宛先のお客様名・企業名" },
    summary: { type: "string", description: "エグゼクティブサマリー(3〜5文程度)" },
    challenges: {
      type: "array",
      items: { type: "string" },
      description: "ヒアリング内容から整理した課題一覧",
    },
    solutionSections: {
      type: "array",
      items: {
        type: "object",
        properties: {
          heading: { type: "string" },
          body: { type: "string" },
        },
        required: ["heading", "body"],
        additionalProperties: false,
      },
      description: "提案内容(課題解決の切り口ごとのセクション)",
    },
    plans: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          price: { type: "string" },
        },
        required: ["name", "description", "price"],
        additionalProperties: false,
      },
      description: "料金・プラン案",
    },
    schedule: {
      type: "array",
      items: { type: "string" },
      description: "導入スケジュールの項目(例: '1週目: 要件定義')",
    },
    closingMessage: { type: "string", description: "締めの一言メッセージ" },
  },
  required: [
    "title",
    "clientName",
    "summary",
    "challenges",
    "solutionSections",
    "plans",
    "schedule",
    "closingMessage",
  ],
  additionalProperties: false,
} as const;

const TONE_LABEL: Record<AppointmentInput["tone"], string> = {
  formal: "フォーマルで丁寧な文体",
  friendly: "親しみやすくフランクな文体",
};

function buildUserPrompt(input: AppointmentInput): string {
  const lines = [
    `お客様名: ${input.clientName}`,
    input.contactPerson ? `ご担当者名: ${input.contactPerson}` : null,
    `業種: ${input.industry}`,
    input.budget ? `予算感: ${input.budget}` : null,
    input.timeline ? `希望スケジュール: ${input.timeline}` : null,
    `文体: ${TONE_LABEL[input.tone]}`,
    "",
    "【商談メモ・ヒアリング内容】",
    input.notes,
  ].filter((line): line is string => line !== null);

  return lines.join("\n");
}

/**
 * 商談内容(AppointmentInput)から提案資料の構成データを生成する。
 * サーバーサイド専用(ANTHROPIC_API_KEY を使用するため、クライアントから直接呼ばない)。
 */
export async function generateProposal(
  input: AppointmentInput
): Promise<GeneratedProposal> {
  const client = new Anthropic();

  const response = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 8192,
    system:
      "あなたは日本のフリーランス・小規模事業者向けに営業提案資料を作成するプロのコンサルタントです。" +
      "商談メモの内容をもとに、お客様の課題を整理し、具体的で説得力のある提案資料を日本語で作成してください。" +
      "料金は商談メモに具体的な記載がない場合は、内容から妥当と考えられる金額の目安を提示してください。",
    messages: [{ role: "user", content: buildUserPrompt(input) }],
    output_config: {
      format: {
        type: "json_schema",
        schema: PROPOSAL_SCHEMA,
      },
    },
  });

  const textBlock = response.content.find(
    (block): block is Anthropic.TextBlock => block.type === "text"
  );
  if (!textBlock) {
    throw new Error("AIの応答からテキストを取得できませんでした。");
  }

  return JSON.parse(textBlock.text) as GeneratedProposal;
}
