/**
 * 提案資料自動生成機能の型定義。
 * アポイント(商談)のヒアリング内容を入力すると、
 * 提案資料の構成データ(GeneratedProposal)を AI が生成する。
 */

/** 提案書の文体トーン */
export type ProposalTone = "formal" | "friendly";

/** フォームから送信される商談内容 */
export type AppointmentInput = {
  /** 相手企業名・お客様名 */
  clientName: string;
  /** 先方のご担当者名(任意) */
  contactPerson?: string;
  /** 業種 */
  industry: string;
  /** 予算感(任意) */
  budget?: string;
  /** 希望スケジュール(任意) */
  timeline?: string;
  /** 提案書の文体 */
  tone: ProposalTone;
  /** 商談メモ・ヒアリング内容(課題・要望など自由記述) */
  notes: string;
};

/** 提案内容の各セクション(課題解決の切り口ごと) */
export type ProposalSection = {
  heading: string;
  body: string;
};

/** 料金・プラン案の1行 */
export type ProposalPlanItem = {
  name: string;
  description: string;
  price: string;
};

/** AI が生成する提案資料の構成データ */
export type GeneratedProposal = {
  /** 提案書タイトル */
  title: string;
  /** 宛先(お客様名) */
  clientName: string;
  /** エグゼクティブサマリー(要約) */
  summary: string;
  /** ヒアリングから整理した課題一覧 */
  challenges: string[];
  /** 提案内容(セクションごとの見出し + 本文) */
  solutionSections: ProposalSection[];
  /** 料金・プラン案 */
  plans: ProposalPlanItem[];
  /** 導入スケジュール(項目の配列) */
  schedule: string[];
  /** 締めの一言 */
  closingMessage: string;
};
