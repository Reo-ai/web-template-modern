/**
 * 提案書自動生成 API ルート。
 * POST /api/proposals/generate
 *
 * Request body : AppointmentInput (JSON)
 * Response     : ProposalOutput (JSON) | エラー (JSON)
 *
 * 環境変数 ANTHROPIC_API_KEY が必要。
 */

import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import type { AppointmentInput, ProposalOutput } from "@/lib/proposals";
import { buildPrompt } from "@/lib/proposals";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const input: AppointmentInput = await req.json();

    if (!input.companyName || !input.challenges || !input.goals) {
      return NextResponse.json(
        { error: "必須項目が不足しています。" },
        { status: 400 }
      );
    }

    const today = new Date().toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const prompt = buildPrompt(input, today);

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const rawText =
      message.content[0].type === "text" ? message.content[0].text : "";

    // JSON のみ抽出(マークダウンコードブロックを除去)
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "提案書の生成に失敗しました。もう一度お試しください。" },
        { status: 500 }
      );
    }

    const proposal: ProposalOutput = JSON.parse(jsonMatch[0]);

    return NextResponse.json(proposal);
  } catch (err) {
    console.error("[proposals/generate] エラー:", err);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました。しばらくしてから再度お試しください。" },
      { status: 500 }
    );
  }
}
