/**
 * チャットボットの会話フロー(決定木)。
 * COURSES と FAQ_ITEMS を読み込み、ノードを動的に生成しています。
 *
 * カスタマイズの基本方針:
 *   - 表示テキスト(ノードの message)は業種に合わせて言い換え
 *   - 「申し込み」「相談」など最後のゴール(コンタクト誘導)は維持
 *   - 新しい分岐を増やしたい場合は BOT_FLOW にノードを追加するだけで OK
 */

import { FAQ_ITEMS } from "./faq";
import { COURSES } from "../courses";

export type BotMessage = {
  role: "bot" | "user";
  content: string;
};

export type BotChoice = {
  /** ユーザーがクリックする選択肢の表示テキスト */
  label: string;
  /** 遷移先ノードID */
  next: string;
  /** 申込フォームへスクロールするフラグ */
  scrollToContact?: boolean;
};

export type BotNode = {
  /** ボットの発話(改行可) */
  message: string;
  /** ユーザーへの選択肢 */
  choices: BotChoice[];
};

/** カテゴリの選択肢を動的に生成 */
const FAQ_CATEGORIES = Array.from(new Set(FAQ_ITEMS.map((f) => f.category)));

/** プラン一覧テキストを動的生成 */
const COURSE_LIST_TEXT = COURSES.map(
  (c) => `・${c.name}(${c.price})`
).join("\n");

/** ボットの自己紹介文(業種に合わせて差し替え) */
const BOT_GREETING =
  "こんにちは!案内ボットです。\nどんなことを知りたいですか?";

export const BOT_FLOW: Record<string, BotNode> = {
  start: {
    message: BOT_GREETING,
    choices: [
      { label: "サービスについて知りたい", next: "about_courses" },
      { label: "料金を知りたい", next: "pricing" },
      { label: "申し込みたい / 相談したい", next: "apply", scrollToContact: true },
      { label: "その他の質問", next: "faq_top" },
    ],
  },

  about_courses: {
    message: `現在ご案内している主なプランはこちらです:\n\n${COURSE_LIST_TEXT}\n\n気になるものはどれですか?`,
    choices: [
      ...COURSES.map((c, i) => ({
        label: c.name,
        next: `course_${i}`,
      })),
      { label: "最初に戻る", next: "start" },
    ],
  },

  ...Object.fromEntries(
    COURSES.map((c, i) => [
      `course_${i}`,
      {
        message: `「${c.name}」について\n\n${c.description}\n\n[形態] ${c.format}\n[期間] ${c.duration}\n[価格] ${c.price}`,
        choices: [
          {
            label: "これを申し込む / 相談する",
            next: "apply",
            scrollToContact: true,
          },
          { label: "他のプランを見る", next: "about_courses" },
          { label: "最初に戻る", next: "start" },
        ],
      } as BotNode,
    ])
  ),

  pricing: {
    message: `各プランの価格はこちらです:\n\n${priceLines()}\n\nお得な組み合わせ・割引もご相談ください。`,
    choices: [
      { label: "詳しい内容を見る", next: "about_courses" },
      { label: "申し込み / お問い合わせへ", next: "apply", scrollToContact: true },
      { label: "最初に戻る", next: "start" },
    ],
  },

  apply: {
    message:
      "ありがとうございます!下の「お問い合わせ」フォームへスクロールしました。\nお気軽にどうぞ。",
    choices: [{ label: "最初に戻る", next: "start" }],
  },

  faq_top: {
    message: "カテゴリを選んでください。",
    choices: [
      ...FAQ_CATEGORIES.map((cat) => ({
        label: cat,
        next: `faq_cat_${encodeURIComponent(cat)}`,
      })),
      { label: "最初に戻る", next: "start" },
    ],
  },

  ...Object.fromEntries(
    FAQ_CATEGORIES.map((cat) => [
      `faq_cat_${encodeURIComponent(cat)}`,
      {
        message: `「${cat}」のよくある質問です。気になるものを選んでください。`,
        choices: [
          ...FAQ_ITEMS.filter((f) => f.category === cat).map((f, i) => ({
            label: f.question,
            next: `faq_ans_${encodeURIComponent(cat)}_${i}`,
          })),
          { label: "カテゴリ選択に戻る", next: "faq_top" },
        ],
      } as BotNode,
    ])
  ),

  ...Object.fromEntries(
    FAQ_CATEGORIES.flatMap((cat) =>
      FAQ_ITEMS.filter((f) => f.category === cat).map((f, i) => [
        `faq_ans_${encodeURIComponent(cat)}_${i}`,
        {
          message: `Q. ${f.question}\n\nA. ${f.answer}`,
          choices: [
            { label: "他の質問を見る", next: `faq_cat_${encodeURIComponent(cat)}` },
            { label: "申し込みフォームへ", next: "apply", scrollToContact: true },
            { label: "最初に戻る", next: "start" },
          ],
        } as BotNode,
      ])
    )
  ),
};

/** ヘルパー: 価格一覧テキストを返す */
function priceLines() {
  return COURSES.map(
    (c) => `・${c.name}: ${c.price}(${c.duration})`
  ).join("\n");
}
