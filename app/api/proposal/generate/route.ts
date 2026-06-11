import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface AppointmentInput {
  clientName: string;
  companyName: string;
  industry: string;
  appointmentDate: string;
  meetingNotes: string;
  challenges: string;
  budget: string;
  timeline: string;
  serviceType: string;
  additionalNotes: string;
}

export async function POST(req: NextRequest) {
  const body: AppointmentInput = await req.json();

  const systemPrompt = `あなたはプロのビジネスコンサルタントです。
アポイントの内容を分析し、クライアントの課題を深く理解した上で、
説得力のある提案資料を日本語で作成してください。

提案資料は以下の構成で、Markdown 形式で出力してください：

# [提案タイトル]

## エグゼクティブサマリー
（2〜3段落で本提案の要点を簡潔に）

## 課題の整理
（クライアントが直面している課題を構造化して整理）

## 提案ソリューション
（具体的な解決策と、なぜこのアプローチが有効かの説明）

## 期待される効果・成果
（定量的・定性的な効果を箇条書きで）

## 実施スケジュール
（フェーズ別のマイルストーン）

## 料金プラン
（予算に合わせた複数のプランを提案）

## 次のステップ
（契約/合意に向けた具体的なアクション）

---
*本提案書は ${new Date().toLocaleDateString("ja-JP")} 時点の情報をもとに作成されています。*

各セクションは具体的かつ説得力のある内容にしてください。
クライアントの業界特性と課題に合わせたカスタマイズされた提案にすることが重要です。`;

  const userMessage = `以下のアポイント情報をもとに提案資料を作成してください：

【クライアント情報】
- 担当者名: ${body.clientName}
- 会社名: ${body.companyName}
- 業種: ${body.industry}
- アポイント日: ${body.appointmentDate}

【商談メモ・ヒアリング内容】
${body.meetingNotes}

【課題・ニーズ】
${body.challenges}

【予算感】
${body.budget || "未確認"}

【希望スケジュール】
${body.timeline || "未確認"}

【提案サービス種別】
${body.serviceType || "総合提案"}

【補足情報】
${body.additionalNotes || "なし"}`;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await client.messages.create({
          model: "claude-sonnet-4-6",
          max_tokens: 4096,
          stream: true,
          system: systemPrompt,
          messages: [{ role: "user", content: userMessage }],
        });

        for await (const event of response) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
