/** アポイント情報(フォーム入力値) */
export type AppointmentInfo = {
  clientName: string;       // 担当者名
  clientCompany: string;    // 会社名
  clientIndustry: string;   // 業界
  meetingDate: string;      // アポ日時
  painPoints: string;       // 課題・ニーズ
  goals: string;            // 達成したい目標
  budget?: string;          // 予算感
  timeline?: string;        // 希望スケジュール
  notes?: string;           // 備考
};

/** 提案書の各セクション */
export type ProposalSection = {
  heading: string;
  body: string;
  bullets?: string[];
};

/** 料金明細の1行 */
export type PricingItem = {
  label: string;
  price: string;
  detail: string;
};

/** Claude が生成する提案書の構造 */
export type GeneratedProposal = {
  title: string;
  greeting: string;
  sections: ProposalSection[];
  pricing: {
    items: PricingItem[];
    note: string;
  };
  nextSteps: string[];
  closing: string;
};
