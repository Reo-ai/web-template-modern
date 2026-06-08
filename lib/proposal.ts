export type ProposalFormData = {
  // 顧客情報
  clientCompany: string;
  clientName: string;
  clientIndustry: string;
  // アポイント情報
  meetingPurpose: string;
  clientChallenge: string;
  clientNeeds: string;
  // 提案側情報
  proposerCompany: string;
  proposerName: string;
  proposedService: string;
  // オプション
  budget: string;
  schedule: string;
  notes: string;
};
