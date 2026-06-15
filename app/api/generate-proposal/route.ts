import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { COURSES } from "@/lib/courses";
import { SITE_NAME } from "@/lib/config";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { clientName, clientCompany, appointmentDate, purpose, needs, budget, schedule, notes } = body;

  // サービス一覧を文字列化
  const servicesText = COURSES.map(
    (c) => `・${c.name}: ${c.description} (${c.price}、${c.format}、${c.duration})`
  ).join("\n");

  const systemPrompt = `あなたは${SITE_NAME}の優秀な営業担当者です。
アポイントのヒアリング情報をもとに、クライアント向けの説得力ある提案書を作成してください。
提案書は簡潔・具体的に書き、クライアントが次のアクションに進みやすい内容にしてください。`;

  const userPrompt = `以下のアポイント情報をもとに、提案書を作成してください。

【アポイント情報】
クライアント名: ${clientName}
会社名・組織名: ${clientCompany || "未記入"}
アポイント日時: ${appointmentDate}
商談の目的・背景: ${purpose}
ヒアリング内容・ニーズ: ${needs}
予算感: ${budget || "未記入"}
希望スケジュール: ${schedule || "未記入"}
その他メモ: ${notes || "なし"}

【弊社の提供サービス】
${servicesText}

以下の構成で、日本語の提案書を作成してください。見出しには「##」を使用し、箇条書きには「・」を使用してください。

## ${clientName}様 / ${clientCompany || "貴社"} への提案書

## 1. 現状の課題・背景
（ヒアリング内容をもとに課題を整理）

## 2. 提案内容
（ニーズに合わせた具体的な提案）

## 3. 推奨プラン・お見積もり
（最適なサービスプランと費用感）

## 4. 期待される効果
（導入後のメリット）

## 5. 実施スケジュール（目安）
（希望スケジュールをもとに）

## 6. 次のステップ
（クライアントに取ってほしいアクション）

---
提案書の末尾に「ご不明な点はお気軽にお問い合わせください。」という一文を加えてください。`;

  // ストリーミングレスポンスで返す
  const stream = client.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            controller.enqueue(new TextEncoder().encode(chunk.delta.text));
          }
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
