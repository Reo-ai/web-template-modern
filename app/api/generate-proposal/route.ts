import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  const body = await req.json();

  const {
    companyName,
    industry,
    contactName,
    contactRole,
    challenges,
    currentSituation,
    budget,
    schedule,
    notes,
  } = body;

  const prompt = `あなたはプロのビジネスコンサルタントです。以下のアポイント情報を元に、クライアント向けの提案資料を作成してください。

【アポイント情報】
- 会社名: ${companyName}
- 業種: ${industry}
- 担当者名: ${contactName}（${contactRole}）
- 課題・ニーズ: ${challenges}
- 現状: ${currentSituation}
- 予算感: ${budget || "未定"}
- 希望スケジュール: ${schedule || "応相談"}
${notes ? `- 備考: ${notes}` : ""}

以下の構成で、専門的かつ読みやすい提案資料を作成してください。

# 提案書

## エグゼクティブサマリー
（3〜4文で要点をまとめる）

## 現状分析と課題認識
（クライアントの現状と課題を整理する）

## ご提案のポイント
（具体的な解決策を3〜5点、箇条書きで記載）

## 期待される効果・ROI
（導入後の具体的なベネフィットを記載）

## 実施ロードマップ
（フェーズ分けしたスケジュール案）

## お見積もり概算
（予算感に合わせた費用感・料金体系の考え方）

## 次のステップ
（具体的なアクションアイテムを2〜3点）

日本語で記述し、${companyName}の${contactName}様に直接語りかけるような丁寧かつ的確な文章で書いてください。`;

  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      try {
        const stream = await client.messages.stream({
          model: "claude-opus-4-8",
          max_tokens: 4096,
          thinking: { type: "adaptive" },
          messages: [{ role: "user", content: prompt }],
        });

        for await (const chunk of stream) {
          // テキストデルタのみクライアントへ送信(思考ブロックはスキップ)
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            const data = JSON.stringify({ text: chunk.delta.text });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "生成エラー";
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`)
        );
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
