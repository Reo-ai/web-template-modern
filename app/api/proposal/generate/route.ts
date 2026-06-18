import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

/** アポイント情報から提案資料スライドを自動生成するAPIルート */

export interface AppointmentInput {
  clientName: string;
  industry: string;
  purpose: string;
  date: string;
  notes?: string;
}

export interface ProposalSlide {
  title: string;
  description: string;
}

export interface ProposalOutput {
  title: string;
  slides: ProposalSlide[];
  summary: string;
}

export async function POST(req: NextRequest) {
  const appointment: AppointmentInput = await req.json();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY が設定されていません" },
      { status: 500 }
    );
  }

  const client = new Anthropic({ apiKey });

  const prompt = `
あなたは優秀なビジネスコンサルタントです。
以下のアポイント情報をもとに、提案資料（プレゼンテーション）のスライド構成を生成してください。

【アポイント情報】
- 顧客名: ${appointment.clientName}
- 業種: ${appointment.industry}
- 目的: ${appointment.purpose}
- 日時: ${appointment.date}
${appointment.notes ? `- 備考: ${appointment.notes}` : ""}

【出力形式】
以下のJSON形式で、スライドタイトルと各スライドの説明を返してください。
スライドは6〜8枚で構成し、ビジネス提案として説得力のある流れにしてください。

{
  "title": "提案資料のタイトル",
  "summary": "この提案の要点を2〜3文で",
  "slides": [
    {
      "title": "スライドタイトル",
      "description": "このスライドで伝える内容の説明（2〜3文）"
    }
  ]
}

JSONのみ返し、余計なコメントは不要です。
  `.trim();

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return NextResponse.json(
      { error: "提案内容の生成に失敗しました" },
      { status: 500 }
    );
  }

  const proposal: ProposalOutput = JSON.parse(jsonMatch[0]);
  return NextResponse.json(proposal);
}
