import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { AppointmentData, GeneratedProposal, buildProposalPrompt } from "@/lib/proposal";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const data: AppointmentData = await req.json();

    if (!data.clientName || !data.challenges || !data.goals) {
      return NextResponse.json(
        { success: false, error: "必須項目が不足しています" },
        { status: 400 }
      );
    }

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      messages: [{ role: "user", content: buildProposalPrompt(data) }],
    });

    const block = message.content[0];
    if (block.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }

    // マークダウンコードブロックやテキストに囲まれていても JSON を抽出
    const jsonMatch = block.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("レスポンスからJSONを抽出できませんでした");
    }

    const proposal: GeneratedProposal = JSON.parse(jsonMatch[0]);

    return NextResponse.json({ success: true, proposal });
  } catch (error) {
    console.error("[generate-proposal] エラー:", error);
    return NextResponse.json(
      { success: false, error: "提案書の生成に失敗しました。しばらく経ってから再試行してください。" },
      { status: 500 }
    );
  }
}
