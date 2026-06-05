import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({ error: "ANTHROPIC_API_KEY が設定されていません" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const body = await req.json();
  const {
    clientName,
    industry,
    appointmentDate,
    contactPerson,
    issues,
    proposedServices,
    budget,
    notes,
  } = body;

  if (!clientName || !issues || !proposedServices) {
    return new Response(
      JSON.stringify({ error: "必須項目が不足しています" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const today = new Date().toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const userPrompt = `
以下のアポイント情報を基に、プロフェッショナルな提案書を日本語で作成してください。

【アポイント情報】
- クライアント名: ${clientName}
- 業種: ${industry || "未記入"}
- アポイント日: ${appointmentDate || today}
- 担当者名: ${contactPerson || "未記入"}
- 課題・ニーズ: ${issues}
- 提案サービス: ${proposedServices}
- 予算感: ${budget || "未記入"}
- 特記事項: ${notes || "なし"}

【出力フォーマット】
以下の構成で提案書を作成してください。各セクションは ## で始め、小見出しは ### を使用してください。

## 提案書

**宛先**: ${clientName} ご担当者様
**提案日**: ${today}
**有効期限**: ${today}から30日間

---

## 1. 現状の課題認識

（アポイントで確認した課題をわかりやすく整理する。共感とともに課題の本質を言語化する。）

## 2. 提案概要

（提案サービスの概要と、なぜこの提案が課題解決に有効かを説明する。）

## 3. 提案内容の詳細

（具体的なサービス内容、特徴、他社との差別化ポイントを箇条書きで整理する。）

## 4. 期待される効果・メリット

（導入後に期待できる具体的な効果を示す。数値目標があれば含める。）

## 5. 導入スケジュール（目安）

（フェーズごとのスケジュール案を記載する。）

## 6. 費用概算

（予算感に合わせた費用の目安を記載する。詳細は別途お見積りとする旨を伝える。）

## 7. 次のステップ

（提案書送付後の流れ、次回打合せの提案、検討期間などを記載する。）

---

*本提案に関するご不明点がございましたら、お気軽にご連絡ください。*
`;

  const stream = await client.messages.stream({
    model: "claude-opus-4-8",
    max_tokens: 3000,
    thinking: { type: "adaptive" },
    system:
      "あなたは一流のビジネスコンサルタントです。クライアントのアポイント情報を基に、説得力があり具体的な提案書を作成してください。" +
      "提案書は日本のビジネス慣習に合わせた丁寧な文体で、クライアントの課題に寄り添った内容にしてください。" +
      "出力はマークダウン形式で、必ず指定されたフォーマットに従ってください。",
    messages: [{ role: "user", content: userPrompt }],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          controller.enqueue(encoder.encode(event.delta.text));
        }
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
