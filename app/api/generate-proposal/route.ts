import { NextRequest, NextResponse } from "next/server";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/config";
import { COURSES } from "@/lib/courses";
import type { AppointmentInfo } from "@/lib/proposal";

/** サービス情報を箇条書き文字列に変換 */
function buildServicesText(): string {
  return COURSES.map(
    (c) =>
      `  - ${c.name}（${c.price}）: ${c.tagline}`
  ).join("\n");
}

/** アポイント情報からプロンプトを構築 */
function buildPrompt(info: AppointmentInfo): string {
  const services = buildServicesText();
  return `あなたは優秀なビジネス提案書ライターです。
以下の情報をもとに、プロフェッショナルで説得力のある提案資料を日本語で作成してください。

【提案者情報】
サービス名: ${SITE_NAME}
概要: ${SITE_DESCRIPTION}
提供サービス:
${services}

【アポイント情報】
担当者名: ${info.clientName} 様
会社名: ${info.clientCompany}
業界: ${info.clientIndustry}
アポ日時: ${info.meetingDate}
課題・ニーズ: ${info.painPoints}
目標: ${info.goals}
予算感: ${info.budget || "未定"}
希望スケジュール: ${info.timeline || "未定"}
備考: ${info.notes || "なし"}

以下のJSON形式で提案資料を作成してください。JSONのみを返してください（コードブロックや前後の説明は不要）:

{
  "title": "提案書タイトル（会社名と課題を含む具体的なもの）",
  "greeting": "冒頭の挨拶文（担当者名と会社名を含む3〜4文。アポのお礼と提案への期待を込めて）",
  "sections": [
    {
      "heading": "01. 現状の課題認識",
      "body": "ヒアリング内容をもとに課題を整理した本文（3〜4文）",
      "bullets": ["課題のポイント1", "課題のポイント2", "課題のポイント3"]
    },
    {
      "heading": "02. 私たちについて",
      "body": "提案者の強みや実績を紹介する本文（3〜4文）"
    },
    {
      "heading": "03. 提案内容",
      "body": "具体的な解決策の概要（3〜4文）",
      "bullets": ["提案の要点1", "提案の要点2", "提案の要点3"]
    },
    {
      "heading": "04. 期待される効果",
      "body": "導入後にもたらされる変化・成果（3〜4文）",
      "bullets": ["効果1", "効果2", "効果3"]
    },
    {
      "heading": "05. 実施スケジュール",
      "body": "推奨する進め方のロードマップ（2〜3文）",
      "bullets": ["フェーズ1: ...", "フェーズ2: ...", "フェーズ3: ..."]
    }
  ],
  "pricing": {
    "items": [
      {
        "label": "推奨プラン名",
        "price": "価格（提供サービスから選択）",
        "detail": "このプランを勧める理由・含まれる内容（2文）"
      }
    ],
    "note": "料金に関する補足（相談余地や特典など）"
  },
  "nextSteps": [
    "次のアクション1（具体的で実行しやすいもの）",
    "次のアクション2",
    "次のアクション3"
  ],
  "closing": "締めの一文（前向きな関係構築への期待を込めて）"
}`;
}

export async function POST(req: NextRequest) {
  try {
    const info: AppointmentInfo = await req.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY が設定されていません" },
        { status: 500 }
      );
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "anthropic-version": "2023-06-01",
        "x-api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-opus-4-8",
        max_tokens: 4096,
        messages: [{ role: "user", content: buildPrompt(info) }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[generate-proposal] Claude API error:", errorText);
      return NextResponse.json(
        { error: "提案書の生成に失敗しました" },
        { status: response.status }
      );
    }

    const result = await response.json();
    const rawText: string = result.content[0].text;

    // JSONブロックを抽出（```json ... ``` 対応）
    const jsonMatch =
      rawText.match(/```json\s*([\s\S]+?)\s*```/) ||
      rawText.match(/```\s*([\s\S]+?)\s*```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : rawText.trim();

    const proposal = JSON.parse(jsonStr);
    return NextResponse.json({ proposal });
  } catch (err) {
    console.error("[generate-proposal] Error:", err);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
