/**
 * FAQ データ。
 * - components/Faq.tsx(FAQ セクション)
 * - lib/chatbot/flow.ts(チャットボット)
 * の両方から参照されます。1箇所だけ編集すれば全画面に反映。
 *
 * カテゴリ名は自由に変更可能。flow.ts は動的にカテゴリを拾います。
 */

export type FaqItem = {
  question: string;
  answer: string;
  /** 並び順カテゴリ(任意の文字列に変更可) */
  category: string;
};

export const FAQ_ITEMS: FaqItem[] = [
  {
    category: "サービスについて",
    question: "{よくある質問1 — 例: 初心者でも利用できますか?}",
    answer: "{回答1 — 3〜4行程度で、相手の不安を解消するように。}",
  },
  {
    category: "サービスについて",
    question: "{よくある質問2}",
    answer: "{回答2}",
  },
  {
    category: "ご利用方法",
    question: "{よくある質問3 — 例: オンラインで利用できますか?}",
    answer: "{回答3}",
  },
  {
    category: "ご利用方法",
    question: "{よくある質問4 — 例: 必要なものはありますか?}",
    answer: "{回答4}",
  },
  {
    category: "料金・申込",
    question: "{よくある質問5 — 例: 料金はいくらですか?}",
    answer: "{回答5}",
  },
  {
    category: "料金・申込",
    question: "{よくある質問6 — 例: 申込から開始までの流れは?}",
    answer: "{回答6}",
  },
  {
    category: "その他",
    question: "{よくある質問7 — 例: 体験はありますか?}",
    answer: "{回答7}",
  },
];
