import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export interface ProposalInput {
  clientName: string;
  meetingDate: string;
  industry: string;
  challenges: string;
  budget: string;
  services: string;
  notes: string;
  companyName?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: ProposalInput = await req.json();

    const {
      clientName,
      meetingDate,
      industry,
      challenges,
      budget,
      services,
      notes,
      companyName,
    } = body;

    if (!clientName || !challenges) {
      return NextResponse.json(
        { error: "クライアント名と課題・ニーズは必須です" },
        { status: 400 }
      );
    }

    const prompt = `あなたはプロフェッショナルなビジネスコンサルタントです。
以下のアポイント情報をもとに、丁寧で説得力のある提案資料（日本語）を作成してください。

【アポイント情報】
- クライアント名: ${clientName}
- 商談日: ${meetingDate || "未記入"}
- 業種: ${industry || "未記入"}
- 課題・ニーズ: ${challenges}
- ご予算感: ${budget || "未記入"}
- ご希望のサービス: ${services || "未記入"}
- 備考: ${notes || "なし"}
${companyName ? `- 提案元会社名: ${companyName}` : ""}

【出力フォーマット】
以下の構成で提案資料を作成してください。各セクションは「## セクション名」で始めてください。

## 提案書概要
（この提案の目的と全体サマリーを2〜3文で）

## 課題の整理
（ヒアリング内容から読み取った課題を箇条書きで整理する）

## 提案内容
（具体的なソリューション・サービス内容を詳しく説明する）

## 期待される効果・メリット
（導入後に期待できる効果を定量・定性の両面から説明する）

## 実施スケジュール案
（フェーズ分けした大まかなスケジュールを表やリストで示す）

## お見積り概算
（予算感に合わせた価格帯・プラン案を提示する）

## 次のステップ
（クロージングに向けた具体的なアクション提案）

各セクションはプロフェッショナルかつ具体的に記述し、クライアントが「これなら任せられる」と感じられる内容にしてください。
マークダウン形式で出力してください。`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude API");
    }

    return NextResponse.json({ proposal: content.text });
  } catch (error) {
    console.error("提案書生成エラー:", error);
    return NextResponse.json(
      { error: "提案書の生成中にエラーが発生しました。もう一度お試しください。" },
      { status: 500 }
    );
  }
}
