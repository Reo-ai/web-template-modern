import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export type ProposalInput = {
  clientCompany: string;
  clientIndustry: string;
  contactName: string;
  contactEmail: string;
  appointmentDate: string;
  appointmentSummary: string;
  currentChallenges: string;
  goals: string;
  currentApproach: string;
  budget: string;
  timeline: string;
  ourStrengths: string;
  additionalNotes: string;
};

export type ProposalSection = {
  title: string;
  content: string;
};

export type ProposalContent = {
  proposalTitle: string;
  generatedAt: string;
  clientCompany: string;
  contactName: string;
  contactEmail: string;
  executiveSummary: string;
  challengeAnalysis: ProposalSection[];
  proposedSolution: {
    overview: string;
    features: { name: string; description: string }[];
  };
  implementationSchedule: {
    phase: string;
    duration: string;
    tasks: string[];
  }[];
  investmentPlan: {
    item: string;
    description: string;
    price: string;
  }[];
  expectedOutcomes: string[];
  nextSteps: string[];
  closing: string;
};

export async function POST(req: NextRequest) {
  const input: ProposalInput = await req.json();

  const prompt = `あなたはプロのビジネスコンサルタントです。以下のアポイント情報をもとに、日本語で説得力のある提案資料を作成してください。

## アポイント情報

- **顧客企業名:** ${input.clientCompany}
- **業種:** ${input.clientIndustry}
- **担当者名:** ${input.contactName}
- **メール:** ${input.contactEmail}
- **アポイント日時:** ${input.appointmentDate}
- **アポイントサマリー:** ${input.appointmentSummary}

## ヒアリング内容

- **現状の課題:** ${input.currentChallenges}
- **達成したい目標:** ${input.goals}
- **現在の取り組み:** ${input.currentApproach}

## 提案条件

- **予算感:** ${input.budget}
- **希望スケジュール:** ${input.timeline}
- **自社の強み・提案ポイント:** ${input.ourStrengths}
- **その他特記事項:** ${input.additionalNotes}

---

以下のJSON形式で提案書コンテンツを出力してください。JSONのみ出力し、前後の説明文は不要です。

\`\`\`json
{
  "proposalTitle": "提案書タイトル（魅力的に）",
  "executiveSummary": "エグゼクティブサマリー（3〜4文で課題・解決策・期待効果を簡潔に）",
  "challengeAnalysis": [
    { "title": "課題タイトル", "content": "課題の詳細説明（2〜3文）" }
  ],
  "proposedSolution": {
    "overview": "ソリューション全体の概要説明（3〜4文）",
    "features": [
      { "name": "機能・施策名", "description": "詳細説明（1〜2文）" }
    ]
  },
  "implementationSchedule": [
    { "phase": "フェーズ名", "duration": "期間", "tasks": ["タスク1", "タスク2"] }
  ],
  "investmentPlan": [
    { "item": "項目名", "description": "内容説明", "price": "金額（概算）" }
  ],
  "expectedOutcomes": ["期待される成果1", "期待される成果2"],
  "nextSteps": ["次のアクション1", "次のアクション2"],
  "closing": "クロージングメッセージ（感謝と意欲を伝える1〜2文）"
}
\`\`\`

課題分析は2〜3項目、提案機能は3〜5項目、フェーズは3〜4段階、投資計画は2〜4項目、期待成果は3〜5項目、次のステップは3〜4項目を目安にしてください。業種・課題・予算に合わせて具体的で説得力のある内容にしてください。`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  const rawText =
    message.content[0].type === "text" ? message.content[0].text : "";

  // JSON部分だけ抽出
  const jsonMatch = rawText.match(/```json\s*([\s\S]*?)```/) ||
    rawText.match(/({[\s\S]*})/);
  const jsonStr = jsonMatch ? jsonMatch[1] : rawText;

  const generated: Omit<
    ProposalContent,
    "generatedAt" | "clientCompany" | "contactName" | "contactEmail"
  > = JSON.parse(jsonStr);

  const result: ProposalContent = {
    ...generated,
    generatedAt: new Date().toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    clientCompany: input.clientCompany,
    contactName: input.contactName,
    contactEmail: input.contactEmail,
  };

  return NextResponse.json(result);
}
