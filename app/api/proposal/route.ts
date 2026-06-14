import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { COURSES } from "@/lib/courses";
import { SITE_NAME } from "@/lib/config";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    clientName,
    companyName,
    industry,
    appointmentDate,
    needs,
    budget,
    timeline,
    notes,
  } = body;

  if (!needs) {
    return NextResponse.json(
      { error: "ニーズ・課題は必須です" },
      { status: 400 }
    );
  }

  // サービス情報をテキスト化
  const servicesText = COURSES.map(
    (c) =>
      `- ${c.name}（${c.tagline}）: ${c.description} / ${c.format} / ${c.duration} / ${c.price}`
  ).join("\n");

  const prompt = `あなたは「${SITE_NAME}」の営業担当者です。
以下のアポイント情報をもとに、顧客向けの提案書をJSON形式で作成してください。

【アポイント情報】
- 顧客名: ${clientName || "未記入"}
- 会社名: ${companyName || "未記入"}
- 業種: ${industry || "未記入"}
- アポイント日時: ${appointmentDate || "未記入"}
- ニーズ・課題: ${needs}
- 予算感: ${budget || "未記入"}
- 希望スケジュール: ${timeline || "未記入"}
- その他メモ: ${notes || "なし"}

【自社サービス一覧】
${servicesText}

提案書をJSON形式で以下の構造で出力してください。マークダウンや余分なテキストは不要で、純粋なJSONのみ返してください。

{
  "title": "提案書タイトル（例: ○○様向け ウェブサイト制作のご提案）",
  "subtitle": "サブタイトル（1行）",
  "executiveSummary": "エグゼクティブサマリー（3〜4文）",
  "clientBackground": {
    "currentSituation": "顧客の現状（2〜3文）",
    "challenges": ["課題1", "課題2", "課題3"]
  },
  "proposedSolution": {
    "overview": "提案概要（2〜3文）",
    "recommendedServices": [
      {
        "name": "推奨サービス名（COURSES から選択）",
        "reason": "選定理由（1〜2文）",
        "expectedOutcome": "期待効果（1〜2文）"
      }
    ]
  },
  "implementationPlan": [
    { "phase": "Phase 1", "title": "フェーズ名", "duration": "期間", "description": "内容" },
    { "phase": "Phase 2", "title": "フェーズ名", "duration": "期間", "description": "内容" },
    { "phase": "Phase 3", "title": "フェーズ名", "duration": "期間", "description": "内容" }
  ],
  "investmentSummary": {
    "totalEstimate": "合計見積もり金額（例: ¥300,000〜 税込）",
    "breakdown": [
      { "item": "内容", "amount": "金額" }
    ],
    "note": "補足（例: 別途費用が発生する場合の説明）"
  },
  "nextSteps": ["次のアクション1", "次のアクション2", "次のアクション3"],
  "closing": "クロージングメッセージ（2〜3文）"
}`;

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("予期しないレスポンス形式");
    }

    // JSONを抽出（コードブロックに囲まれている場合も対応）
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("JSONの抽出に失敗しました");
    }

    const proposal = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ proposal });
  } catch (err) {
    console.error("提案書生成エラー:", err);
    return NextResponse.json(
      { error: "提案書の生成に失敗しました。しばらく後でお試しください。" },
      { status: 500 }
    );
  }
}
