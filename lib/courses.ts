/**
 * 「サービス・プラン・コース」の仮データ。
 *
 * 業種に合わせて読み替えてください:
 *   - 教室・スクール  → コース / レッスン
 *   - フリーランス    → 提供メニュー / 料金プラン
 *   - 飲食店          → コース料理 / セットメニュー
 *   - SaaS / 物販     → 料金プラン / 商品プラン
 *
 * components/Courses.tsx の「ラベル名・コピー」もあわせて変更すると、
 * セクションを別物として再利用しやすくなります。
 */

export type Course = {
  /** 表示用番号(参考サイト風の連番) */
  number: string;
  /** プラン・サービス名 */
  name: string;
  /** 短い特徴(1行) */
  tagline: string;
  /** 詳細説明(2〜3行) */
  description: string;
  /** 提供形態 */
  format: string;
  /** 期間・回数 */
  duration: string;
  /** 価格(税込み or 税別) */
  price: string;
  /** カラーアクセント(Hex) */
  accent: string;
};

export const COURSES: Course[] = [
  {
    number: "01",
    name: "{プラン1の名前}",
    tagline: "{1行キャッチコピー}",
    description:
      "{プラン1の詳細説明。ターゲット・含まれる内容・成果のイメージを2〜3行で。}",
    format: "{提供形態(例: オンライン / 対面 / マンツーマン)}",
    duration: "{期間・回数(例: 全8回 / 約2ヶ月)}",
    price: "¥00,000(税込)",
    accent: "#ff4b6e",
  },
  {
    number: "02",
    name: "{プラン2の名前}",
    tagline: "{1行キャッチコピー}",
    description: "{プラン2の詳細説明。}",
    format: "{提供形態}",
    duration: "{期間・回数}",
    price: "¥00,000(税込)",
    accent: "#2b4dff",
  },
  {
    number: "03",
    name: "{プラン3の名前}",
    tagline: "{1行キャッチコピー}",
    description: "{プラン3の詳細説明。}",
    format: "{提供形態}",
    duration: "{期間・回数}",
    price: "¥00,000(税込)",
    accent: "#111111",
  },
  {
    number: "04",
    name: "{プラン4の名前}",
    tagline: "{1行キャッチコピー}",
    description: "{プラン4の詳細説明。}",
    format: "{提供形態}",
    duration: "{期間・回数}",
    price: "¥0,000 / 単発〜",
    accent: "#7a7a7a",
  },
];
