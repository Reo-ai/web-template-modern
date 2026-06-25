import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const client = new Anthropic();

// Claude への指示: プロフェッショナルな提案書をマークダウンで生成する
const SYSTEM_PROMPT = `あなたはプロフェッショナルなビジネスコンサルタントで、ウェブサイト制作・デジタルマーケティングの提案書作成の専門家です。
クライアントとのアポイント情報をもとに、説得力のある提案書を日本語で作成してください。

提案書は必ず以下の構成で、マークダウン形式で書いてください：

## 提案概要

提案の全体像を2〜3文で簡潔に説明してください。

## 課題の整理

ヒアリングで浮かび上がった課題を箇条書きで整理してください。
- 課題1
- 課題2
（3〜5項目）

## ご提案内容

具体的なソリューションを2〜4つのサブセクションで詳細に説明してください。

### 施策1: [具体的なタイトル]
内容の説明

### 施策2: [具体的なタイトル]
内容の説明

## 実施スケジュール

フェーズごとに分けて説明してください。
- **Phase 1（〇週間）**: 内容
- **Phase 2（〇週間）**: 内容
- **Phase 3（〇週間）**: 内容

## 費用概算

項目ごとの費用を箇条書きで記載し、最後に合計を記載してください。
- 項目名: ¥〇〇〇,〇〇〇
- 合計（税抜）: ¥〇〇〇,〇〇〇

## 次のステップ

クロージングに向けた具体的なアクション2〜3つを箇条書きで記載してください。
- アクション1
- アクション2

以下の点に注意してください：
- トーンは丁寧かつプロフェッショナルを保つ
- クライアントの業種・状況に合わせた具体的な提案をする
- 数字や期間は現実的な範囲で設定する
- 予算感が記載されている場合はそれに合わせた費用感で提案する
- 各セクションは必ず "## " で始める（半角スペースを含む）`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      clientName,
      company,
      industry,
      appointmentDate,
      needs,
      budget,
      deadline,
      notes,
    } = body;

    if (!needs?.trim()) {
      return new Response(
        JSON.stringify({ error: "課題・ニーズの入力は必須です" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const userMessage = `以下のアポイント情報をもとに提案書を作成してください。

【顧客情報】
- 顧客名: ${clientName || "（未記入）"}
- 会社名・屋号: ${company || "（未記入）"}
- 業種: ${industry || "（未記入）"}
- アポイント日: ${appointmentDate || "（未記入）"}

【ヒアリング内容】
課題・ニーズ:
${needs}

【条件】
- 予算感: ${budget || "（未記入）"}
- 希望納期: ${deadline || "（未記入）"}
- 特記事項: ${notes || "（なし）"}`;

    const stream = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      stream: true,
      messages: [{ role: "user", content: userMessage }],
    });

    // Anthropic のストリームをブラウザへそのまま転送
    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        for await (const chunk of stream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }
        controller.close();
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("[generate-proposal] エラー:", error);
    return new Response(
      JSON.stringify({ error: "提案書の生成に失敗しました" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
