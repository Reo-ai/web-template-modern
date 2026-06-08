import Anthropic from "@anthropic-ai/sdk";
import type { ProposalFormData } from "@/lib/proposal";

const client = new Anthropic();

const SYSTEM_PROMPT = `あなたは10年以上の経験を持つ優秀な営業コンサルタントです。提供された情報を基に、説得力があり実践的な日本語の提案書を作成してください。

## 提案書の構成（必ずこの順序・見出しで作成すること）

## 提案書タイトル
顧客名と提案内容を含む、具体的で魅力的なタイトルを1行で記載。

## エグゼクティブサマリー
提案の要点を3〜4文で簡潔にまとめる。意思決定者が読むことを意識した内容。

## 現状分析と課題の整理
顧客の現状を整理し、課題を箇条書きで明確にする。

## ご提案内容
具体的な解決策を詳細に説明する。機能・特徴・差別化ポイントを明確に。

## 期待される効果
導入・採用後に期待できる具体的な効果をROI視点で説明する。

## 費用・スケジュール（概算）
おおよその費用感と導入スケジュールの概算を提示する。
情報が少ない場合は「別途ご相談」とした上で一般的な目安を示す。

## まとめと次のステップ
提案の要点を再確認し、具体的なアクションアイテムを提示する。

## 重要事項
- ビジネス文書として適切な敬語・丁寧語を使用すること
- 各セクションは「##」で始めること
- 箇条書きには「・」を使用すること
- 具体的な数字や根拠を可能な限り含めること
- 押しつけがましくなく、課題解決に焦点を当てた論調にすること`;

function buildUserMessage(data: ProposalFormData): string {
  const today = new Date().toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `以下の情報を基に提案書を作成してください。

【作成日】${today}

【顧客情報】
・会社名：${data.clientCompany}
・担当者名：${data.clientName || "未記入"}
・業種：${data.clientIndustry || "未記入"}

【アポイント情報】
・面談の目的・背景：${data.meetingPurpose}
・顧客の課題・悩み：${data.clientChallenge}
・顧客のニーズ・要望：${data.clientNeeds || "未記入"}

【提案側情報】
・提案会社名：${data.proposerCompany}
・担当者名：${data.proposerName || "未記入"}
・提案する商品・サービス：${data.proposedService}

【オプション情報】
・予算感：${data.budget || "未定・要相談"}
・希望スケジュール：${data.schedule || "未定・要相談"}
・備考：${data.notes || "なし"}`;
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "ANTHROPIC_API_KEY が設定されていません。" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const body: ProposalFormData = await request.json();

    if (!body.clientCompany || !body.meetingPurpose || !body.clientChallenge || !body.proposerCompany || !body.proposedService) {
      return new Response(
        JSON.stringify({ error: "必須項目が入力されていません。" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const userMessage = buildUserMessage(body);
    const encoder = new TextEncoder();

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          const stream = client.messages.stream({
            model: "claude-opus-4-8",
            max_tokens: 4000,
            system: SYSTEM_PROMPT,
            messages: [{ role: "user", content: userMessage }],
          });

          for await (const chunk of stream) {
            if (
              chunk.type === "content_block_delta" &&
              chunk.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(chunk.delta.text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
      },
    });
  } catch {
    return new Response(
      JSON.stringify({ error: "提案書の生成中にエラーが発生しました。" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
