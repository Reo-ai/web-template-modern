/**
 * アポイント→提案書自動生成の型定義とプロンプトビルダー。
 */

import { COURSES } from "./courses";
import { WORKS } from "./works";
import { SITE_NAME, SITE_DESCRIPTION } from "./config";

/** アポイント時に収集する情報 */
export type AppointmentData = {
  /** 顧客名・会社名 */
  clientName: string;
  /** 担当者名 */
  contactPerson: string;
  /** 業種 */
  industry: string;
  /** 現在の課題・痛み */
  challenges: string;
  /** 目標・要望 */
  goals: string;
  /** 予算感 */
  budget: string;
  /** 決裁権者 */
  decisionMaker: string;
  /** アポイント日時 */
  appointmentDate: string;
  /** 担当営業メモ */
  notes: string;
};

/** Claude が返す構造化提案書 */
export type GeneratedProposal = {
  /** エグゼクティブサマリー(2〜3文) */
  executiveSummary: string;
  /** 課題分析(3〜4文) */
  challengeAnalysis: string;
  /** 提案内容(3〜5文) */
  proposedSolution: string;
  /** おすすめプランのインデックス(COURSES配列) */
  recommendedPlanIndex: number;
  /** 次のステップ(配列) */
  nextSteps: string[];
  /** クロージングメッセージ(1〜2文) */
  closingMessage: string;
};

/** Claude へのプロンプトを組み立てる */
export function buildProposalPrompt(data: AppointmentData): string {
  const courseSummary = COURSES.map(
    (c) => `- ${c.number}. ${c.name}(${c.price}): ${c.description}`
  ).join("\n");

  const worksSummary = WORKS.slice(0, 3)
    .map((w) => `- 「${w.title}」(${w.year}): ${w.description}`)
    .join("\n");

  return `あなたは${SITE_NAME}の営業担当者として、以下のアポイント情報をもとに、
顧客向けの日本語提案書コンテンツを作成してください。

## 弊社情報
- 社名: ${SITE_NAME}
- サービス概要: ${SITE_DESCRIPTION}

## 提供プラン(0始まりのインデックス)
${courseSummary}

## 実績例
${worksSummary}

## アポイント情報
- 顧客名・会社名: ${data.clientName}
- 担当者名: ${data.contactPerson}
- 業種: ${data.industry}
- 現在の課題: ${data.challenges}
- 目標・要望: ${data.goals}
- 予算感: ${data.budget || "未確認"}
- 決裁権者: ${data.decisionMaker || "未確認"}
- アポイント日時: ${data.appointmentDate}
- 担当者メモ: ${data.notes || "なし"}

## 指示
1. 顧客の業種・課題・目標を踏まえて、弊社サービスの価値を具体的に訴求してください
2. 提案内容は顧客の言葉を引用しつつ、共感から入ってください
3. 次のステップは具体的な行動(日時・手段)を含めてください

## 出力形式(このJSONのみ出力してください)
{
  "executiveSummary": "エグゼクティブサマリー(2〜3文)",
  "challengeAnalysis": "課題分析(3〜4文)",
  "proposedSolution": "提案内容(3〜5文)",
  "recommendedPlanIndex": 0,
  "nextSteps": ["次のステップ1", "次のステップ2", "次のステップ3"],
  "closingMessage": "クロージングメッセージ(1〜2文)"
}

recommendedPlanIndex は 0〜${COURSES.length - 1} の整数で、顧客に最も合うプランを指定してください。`;
}
