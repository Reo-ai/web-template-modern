import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface AppointmentData {
  clientName: string;
  industry: string;
  challenge: string;
  goal: string;
  budget: string;
  timeline: string;
  notes: string;
}

function buildPrompt(data: AppointmentData): string {
  return `あなたはプロのビジネスコンサルタントです。以下のアポイント情報をもとに、クライアントへの提案資料を日本語で作成してください。

【アポイント情報】
- クライアント名・会社名: ${data.clientName}
- 業種・事業内容: ${data.industry}
- 抱えている課題: ${data.challenge}
- 達成したいゴール: ${data.goal}
- 予算感: ${data.budget || "未定"}
- 希望期間・納期: ${data.timeline || "応相談"}
- 補足・特記事項: ${data.notes || "なし"}

以下の構成で提案資料を作成してください。各セクションは Markdown の見出し(## )を使用し、具体的かつ説得力のある内容にしてください。

## 提案書タイトル
（クライアント名と課題を踏まえた魅力的なタイトル）

## エグゼクティブサマリー
（この提案の核心を3〜4文で端的にまとめる）

## 課題の整理
（クライアントが抱える課題を構造化して分析する）

## 提案内容
（具体的な施策・アプローチを箇条書きで3〜5項目）

## 期待される効果
（提案実施後に見込める定量・定性的な効果）

## 実施スケジュール
（フェーズごとのタイムライン、期間の目安を含む）

## お見積もり概算
（予算感に合わせた費用の目安と内訳。予算未定の場合は標準的な価格帯を提示）

## 次のステップ
（クライアントへの具体的なアクションの提案、最初の一手）

---
文体はプロフェッショナルかつ親しみやすいビジネス日本語で。箇条書きと文章を適切に混ぜて読みやすくしてください。`;
}

export async function POST(req: Request) {
  const data: AppointmentData = await req.json();

  if (!data.clientName || !data.challenge || !data.goal) {
    return new Response(
      JSON.stringify({ error: "必須フィールドが不足しています" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const anthropicStream = await client.messages.stream({
          model: "claude-sonnet-4-6",
          max_tokens: 2000,
          messages: [{ role: "user", content: buildPrompt(data) }],
        });

        for await (const chunk of anthropicStream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }
        controller.close();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "生成に失敗しました";
        controller.enqueue(encoder.encode(`\n\n[エラー: ${msg}]`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
