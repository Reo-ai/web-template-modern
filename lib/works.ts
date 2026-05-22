/**
 * 「作品 / 実績 / ポートフォリオ」の仮データ。
 *
 * 業種別の読み替え例:
 *   - クリエイター     → 制作物 / 受賞歴
 *   - 写真家・映像     → 撮影実績
 *   - 飲食             → シグネチャーメニュー
 *   - コンサル         → 支援事例
 *
 * audioSrc は音源プレーヤー用です。
 * 不要なら components/Works.tsx の audio 要素ごと削除して問題ありません。
 */

export type Work = {
  id: string;
  /** タイトル */
  title: string;
  /** ジャンル・カテゴリ */
  category: string;
  /** 制作・実施年 */
  year: string;
  /** 概要 */
  description: string;
  /** 音源パス(任意)。/public/audio に配置 */
  audioSrc?: string;
  /** カラーアクセント */
  accent: string;
};

export const WORKS: Work[] = [
  {
    id: "w01",
    title: "{作品・実績タイトル 1}",
    category: "{カテゴリ}",
    year: "2025",
    description: "{この実績の概要を1〜2行で。クライアント名や成果数値を入れると説得力◎}",
    audioSrc: undefined,
    accent: "#ff4b6e",
  },
  {
    id: "w02",
    title: "{作品・実績タイトル 2}",
    category: "{カテゴリ}",
    year: "2024",
    description: "{概要}",
    audioSrc: undefined,
    accent: "#2b4dff",
  },
  {
    id: "w03",
    title: "{作品・実績タイトル 3}",
    category: "{カテゴリ}",
    year: "2024",
    description: "{概要}",
    audioSrc: undefined,
    accent: "#111111",
  },
  {
    id: "w04",
    title: "{作品・実績タイトル 4}",
    category: "{カテゴリ}",
    year: "2023",
    description: "{概要}",
    audioSrc: undefined,
    accent: "#7a7a7a",
  },
];
