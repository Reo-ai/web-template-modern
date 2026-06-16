import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export type AppointmentData = {
  clientName: string;
  companyName: string;
  industry: string;
  appointmentDate: string;
  purpose: string;
  painPoints: string;
  budget: string;
  decisionMaker: string;
  nextAction: string;
  notes: string;
};

export async function POST(req: NextRequest) {
  const data: AppointmentData = await req.json();

  const prompt = `あなたは優秀な営業コンサルタントです。以下のアポイント情報をもとに、プロフェッショナルな提案資料を日本語で作成してください。

【アポイント情報】
- 担当者名: ${data.clientName}
- 会社名: ${data.companyName}
- 業種: ${data.industry}
- アポイント日: ${data.appointmentDate}
- アポイントの目的: ${data.purpose}
- 課題・ペインポイント: ${data.painPoints}
- 予算感: ${data.budget || "未確認"}
- 決裁者の有無: ${data.decisionMaker || "未確認"}
- 次のアクション: ${data.nextAction}
- その他メモ: ${data.notes || "なし"}

以下の構成で提案資料を作成してください。各セクションは「## セクション名」の形式で始めてください。

## エグゼクティブサマリー
（全体の要約を3〜4文で）

## 課題の整理
（ヒアリングで把握した課題を箇条書きで整理）

## 提案内容
（課題に対する具体的な解決策と提供価値を説明）

## 期待される効果
（提案を実行した場合の具体的なメリット・KPIを箇条書きで）

## 実施スケジュール（目安）
（フェーズ分けした概算スケジュール）

## 料金・費用感
（予算に応じたプラン提案、または確認が必要な場合はその旨を記載）

## 次のステップ
（合意事項と具体的なネクストアクション）

## 補足・懸念点
（リスクや確認事項があれば記載、なければ「特になし」）

資料全体のトーンは「丁寧・誠実・具体的」を心がけ、クライアントの課題に寄り添った内容にしてください。`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    return NextResponse.json({ error: "生成に失敗しました" }, { status: 500 });
  }

  return NextResponse.json({ proposal: content.text });
}
