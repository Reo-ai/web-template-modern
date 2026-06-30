import { NextRequest, NextResponse } from "next/server"
import { AppointmentInput, generateFallbackProposal } from "@/lib/proposal"

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

/** アポイント情報からClaude AIで提案書を生成するAPIルート */
export async function POST(req: NextRequest) {
  const input: AppointmentInput = await req.json()

  if (!ANTHROPIC_API_KEY) {
    // APIキー未設定時はテンプレートベースで生成
    return NextResponse.json(generateFallbackProposal(input))
  }

  const today = new Date()
  const validDate = new Date(today)
  validDate.setDate(validDate.getDate() + 30)

  const prompt = `あなたはプロのビジネスコンサルタントです。以下のアポイント情報をもとに、クライアントへの提案書を日本語で作成してください。

## アポイント情報
- クライアント名: ${input.clientName}
- 会社名: ${input.clientCompany || "未記入"}
- メールアドレス: ${input.clientEmail || "未記入"}
- ミーティング日時: ${input.meetingDate}
- サービス種別: ${input.serviceType}
- 予算感: ${input.budget || "未記入"}
- 課題・ご要望: ${input.requirements}
- ペインポイント: ${input.painPoints || "未記入"}

## 指示
以下のJSON形式で提案書を出力してください。マークダウンは使わず、純粋なJSONのみ出力してください。

{
  "title": "提案書のタイトル(例: Webサイトリニューアル 導入提案書)",
  "subtitle": "サブタイトル(例: 株式会社〇〇 様へのご提案)",
  "clientName": "${input.clientName}",
  "clientCompany": "${input.clientCompany || ""}",
  "validUntil": "${validDate.toLocaleDateString("ja-JP")}",
  "investment": "お見積もり金額または予算範囲",
  "nextSteps": ["次のステップ1", "次のステップ2", "次のステップ3", "次のステップ4"],
  "sections": [
    {
      "id": "summary",
      "heading": "エグゼクティブサマリー",
      "content": "提案の概要(3-4文)"
    },
    {
      "id": "problem",
      "heading": "現状の課題整理",
      "content": "クライアントの課題を具体的に整理した文章"
    },
    {
      "id": "solution",
      "heading": "ご提案内容",
      "content": "具体的なソリューションの説明"
    },
    {
      "id": "deliverables",
      "heading": "提供物・成果物",
      "content": "箇条書きで提供物を列挙"
    },
    {
      "id": "schedule",
      "heading": "スケジュール",
      "content": "フェーズ別のスケジュール案"
    },
    {
      "id": "whyus",
      "heading": "弊社をお選びいただく理由",
      "content": "強みや実績のアピールポイント"
    }
  ]
}`

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 4096,
        messages: [{ role: "user", content: prompt }],
      }),
    })

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`)
    }

    const data = await response.json()
    const text = data.content[0].text

    // JSONブロックを抽出
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error("JSON not found in response")

    const proposal = JSON.parse(jsonMatch[0])
    return NextResponse.json(proposal)
  } catch (err) {
    console.error("AI生成エラー、テンプレートにフォールバック:", err)
    return NextResponse.json(generateFallbackProposal(input))
  }
}
