/** アポイント情報の入力型 */
export type AppointmentInput = {
  clientName: string
  clientCompany: string
  clientEmail: string
  meetingDate: string
  serviceType: string
  budget: string
  requirements: string
  painPoints: string
}

/** 提案書のセクション */
export type ProposalSection = {
  id: string
  heading: string
  content: string
}

/** 生成された提案書の型 */
export type GeneratedProposal = {
  title: string
  subtitle: string
  clientName: string
  clientCompany: string
  validUntil: string
  sections: ProposalSection[]
  investment: string
  nextSteps: string[]
}

/** テンプレートベースの提案書を生成(AI不使用のフォールバック) */
export function generateFallbackProposal(input: AppointmentInput): GeneratedProposal {
  const today = new Date()
  const validDate = new Date(today)
  validDate.setDate(validDate.getDate() + 30)

  return {
    title: `${input.serviceType} 導入提案書`,
    subtitle: `${input.clientCompany || input.clientName} 様へのご提案`,
    clientName: input.clientName,
    clientCompany: input.clientCompany,
    validUntil: validDate.toLocaleDateString("ja-JP"),
    investment: input.budget ? `${input.budget}(税別)` : "別途お見積もり",
    nextSteps: [
      "本提案内容のご確認",
      "ご不明点・ご要望のヒアリング",
      "最終スケジュールの確定",
      "契約締結・プロジェクト開始",
    ],
    sections: [
      {
        id: "summary",
        heading: "エグゼクティブサマリー",
        content: `この度は弊社へのご関心をいただき、誠にありがとうございます。\n\n${input.meetingDate}のミーティングにてお聞きした内容をもとに、${input.clientCompany || input.clientName}様の課題解決に向けた最適なソリューションをご提案いたします。\n\n${input.requirements}`,
      },
      {
        id: "problem",
        heading: "現状の課題整理",
        content: input.painPoints || `${input.clientCompany || input.clientName}様より伺った現状の課題を整理いたします。\n\n課題の詳細については、ミーティング時のヒアリング内容を参照してください。`,
      },
      {
        id: "solution",
        heading: "ご提案内容",
        content: `${input.serviceType}を通じて、以下のソリューションをご提供いたします。\n\n・ ${input.requirements}\n\n上記の要件を満たす最適なアプローチで、お客様のビジネス成長をサポートいたします。`,
      },
      {
        id: "deliverables",
        heading: "提供物・成果物",
        content: "・ プロジェクト計画書\n・ 成果物レポート\n・ 実装・納品物\n・ 運用マニュアル\n・ アフターサポート(期間: 3ヶ月)",
      },
      {
        id: "schedule",
        heading: "スケジュール",
        content: "フェーズ1(Week 1-2): 要件定義・詳細ヒアリング\nフェーズ2(Week 3-6): 設計・開発・制作\nフェーズ3(Week 7-8): テスト・品質確認\nフェーズ4(Week 9): 納品・引き渡し\n※スケジュールは確定後に改めてご共有いたします",
      },
    ],
  }
}
