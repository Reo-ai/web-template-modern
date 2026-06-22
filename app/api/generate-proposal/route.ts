import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export interface ProposalData {
  title: string;
  summary: string;
  challengeAnalysis: string;
  proposal: {
    overview: string;
    details: string[];
    approach: string;
  };
  expectedOutcomes: string[];
  schedule: { phase: string; period: string; content: string }[];
  investment: string;
  nextSteps: string[];
  closing: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clientName, industry, purpose, challenges, budget, timeline, notes } = body;

    if (!clientName || !industry || !purpose || !challenges) {
      return NextResponse.json(
        { error: "必須項目が入力されていません" },
        { status: 400 }
      );
    }

    const prompt = `あなたは優秀なビジネスコンサルタントです。以下のアポイント情報をもとに、クライアントに提出するプロフェッショナルな提案資料をJSONで出力してください。

## アポイント情報
- クライアント名/会社名: ${clientName}
- 業種: ${industry}
- アポイントの目的: ${purpose}
- 抱えている課題・ニーズ: ${challenges}
${budget ? `- 予算感: ${budget}` : ""}
${timeline ? `- 導入・実施時期: ${timeline}` : ""}
${notes ? `- その他の補足: ${notes}` : ""}

## 出力フォーマット (必ずこのJSONのみを返すこと)

{
  "title": "提案書タイトル(例: 「○○様 ご提案書 — [課題解決のキーワード]」)",
  "summary": "エグゼクティブサマリー。課題→提案→期待効果を3〜4文で簡潔にまとめる",
  "challengeAnalysis": "現状と課題の分析。クライアントの状況を深く理解し、課題の本質を2〜3段落で記述",
  "proposal": {
    "overview": "提案の全体像を2〜3文で説明",
    "details": ["具体的な提案内容1", "具体的な提案内容2", "具体的な提案内容3", "具体的な提案内容4"],
    "approach": "提案のアプローチ方法・実施方法を詳しく説明"
  },
  "expectedOutcomes": ["定量的・定性的な期待効果1", "期待効果2", "期待効果3", "期待効果4"],
  "schedule": [
    {"phase": "フェーズ1", "period": "1〜2ヶ月目", "content": "このフェーズでやること"},
    {"phase": "フェーズ2", "period": "3〜4ヶ月目", "content": "このフェーズでやること"},
    {"phase": "フェーズ3", "period": "5〜6ヶ月目", "content": "このフェーズでやること"}
  ],
  "investment": "${budget ? `予算感(${budget})をもとにした費用概算と内訳` : "別途ご相談のうえ、最適なプランをご提案します"}",
  "nextSteps": ["次のアクション1", "次のアクション2", "次のアクション3"],
  "closing": "クロージングの一言メッセージ(50字程度、前向きで誠実なトーン)"
}

重要: JSON以外のテキストは一切出力しないこと。日本語でプロフェッショナルかつ丁寧に、クライアントの課題に寄り添った内容にすること。`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 3000,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("JSON not found in response");
    }

    const proposalData: ProposalData = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ proposal: proposalData });
  } catch (error) {
    console.error("[generate-proposal] エラー:", error);
    return NextResponse.json(
      { error: "提案資料の生成中にエラーが発生しました。しばらくして再度お試しください。" },
      { status: 500 }
    );
  }
}
