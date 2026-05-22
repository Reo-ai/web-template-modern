# Template Guide

このテンプレートの「設計図」です。Claude Code や人間が、構造を理解した上で各業種向けにカスタマイズできるようにまとめています。

---

## このテンプレートのコンセプト

- **ジャンル不問**で使える個人 / 小規模ビジネス向けランディングサイト
- 参考デザイン: ミニマル基調 + 一部ポップ + 滑らかなアニメーション
- ブログ機能 + チャットボット(任意)を内蔵
- すべて TypeScript + Next.js App Router で構成

---

## 全体構造

```
app/
├── layout.tsx           # フォント・全体レイアウト・チャットボット読み込み
├── page.tsx             # トップ(全セクションを縦並びで構成)
├── globals.css          # Tailwind + カスタムカラー定義
└── blog/
    ├── page.tsx         # 記事一覧
    └── [slug]/page.tsx  # 記事詳細

components/
├── Hero.tsx             # #001 ファーストビュー
├── About.tsx            # #002 経歴・思い
├── Courses.tsx          # #003 サービス・プラン一覧
├── Works.tsx            # #004 実績・作品
├── Faq.tsx              # #005 FAQ アコーディオン
├── BlogTeaser.tsx       # #006 ブログ最新3件
├── ContactForm.tsx      # #007 問い合わせフォーム
├── Header.tsx           # 共通ヘッダー
├── Footer.tsx           # 共通フッター
├── Chatbot.tsx          # 右下フローティングチャットボット
├── SectionHeading.tsx   # 各セクション見出し共通パーツ
└── SmoothScroll.tsx     # Lenis 慣性スクロール

lib/
├── config.ts            # サイト名・ON/OFF トグルなど全体設定
├── courses.ts           # サービス・プランデータ
├── works.ts             # 実績・作品データ
├── blog.ts              # ブログ記事データ
└── chatbot/
    ├── faq.ts           # FAQ データ(FAQ セクションとボット共通)
    └── flow.ts          # チャットボット会話フロー
```

---

## デザインシステム

### カラーパレット (globals.css に定義)

| 役割 | Tailwind 変数 | Hex | 用途 |
|---|---|---|---|
| ベース背景 | `--base` | `#FAF8F2` | ページ全体の背景 |
| インクテキスト | `--ink` | `#111111` | 本文・見出し |
| ポップアクセント | `--pop` | `#FF4B6E` | CTA・強調・ホバー |
| ディープアクセント | `--deep` | `#2B4DFF` | リンク・サブ強調 |
| ミュート | `--muted` | `#7A7A7A` | 補助テキスト |
| カード | `--card` | `#F2EFE6` | カード・セクション背景 |
| ボーダー | `--border` | `#E5E1D6` | 区切り線 |

### タイポグラフィ

- **見出し**: Shippori Mincho 700 — 和モダンな緊張感
- **本文**: Noto Sans JP 400/500 — 読みやすさ最優先
- **装飾**: Orbit 400 — セクション番号・ラベル(`font-display`)

### モーション原則

- イージング: `cubic-bezier(0.22, 1, 0.36, 1)` (滑らかな減速)
- セクション登場: `whileInView` で `opacity + y` のフェードイン
- ホバー: ボタンは色反転(ダークモードのような切替)

---

## 主要設定: `lib/config.ts`

```ts
export const SITE_NAME = "{Your Site Name}";
export const SITE_DESCRIPTION = "{一言紹介文}";
export const SITE_TAGLINE = "CRAFTED WITH CARE"; // フッター右下の小さい文言
export const ENABLE_CHATBOT = true;              // 右下チャットボット
export const ENABLE_BLOG = true;                 // /blog ルートと BlogTeaser
```

- `ENABLE_CHATBOT = false` にすると `<Chatbot />` がレンダリングされなくなります
- `ENABLE_BLOG = false` にすると Header の BLOG リンクと BlogTeaser が消えます(`/blog` ルートは残るので不要なら削除)

---

## カスタマイズの流れ

1. **`lib/config.ts`** でサイト名・トグルを設定
2. **`components/Hero.tsx`** のメインコピー・強調ワード差し替え
3. **`components/About.tsx`** で経歴・ビジョンの文章を更新
4. **`lib/courses.ts`** でサービス/プランを書く
5. **`lib/works.ts`** で実績を書く
6. **`lib/chatbot/faq.ts`** で FAQ を書く(チャットボットにも反映)
7. **`components/Footer.tsx`** で SNS リンクを更新
8. **`tailwind.config.ts` / `app/globals.css`** で必要ならカラーを調整

---

## セクション番号・ラベルの体系

| 番号 | ラベル | コンポーネント |
|---|---|---|
| #001 | INTRO | Hero |
| #002 | ABOUT | About |
| #003 | SERVICES / COURSES | Courses |
| #004 | WORKS | Works |
| #005 | FAQ | Faq |
| #006 | BLOG / NEWS | BlogTeaser |
| #007 | CONTACT | ContactForm |
| #008 | BLOG / NEWS | /blog ページ |

---

## ブログを追加する流れ

`lib/blog.ts` の `POSTS` 配列に1つオブジェクトを追加するだけ。

```ts
{
  slug: "url-safe-string",      // URL に使用
  title: "記事タイトル",
  date: "YYYY-MM-DD",
  category: "カテゴリ",
  excerpt: "抜粋(一覧表示用)",
  body: `本文 第1段落

第2段落(空行で段落区切り)`,
}
```

`generateStaticParams` が拾うので、配置するだけで `/blog/{slug}` のページが自動生成されます。

---

## チャットボットの会話フロー

`lib/chatbot/flow.ts` の `BOT_FLOW` がノードベースの決定木です。

- `start` ノードから分岐
- `next` でノード ID を遷移
- `scrollToContact: true` を入れるとコンタクトフォームへスクロール

FAQ・サービスデータは自動でノードに展開されるため、`lib/chatbot/faq.ts` と `lib/courses.ts` を編集すれば内容が自動反映されます。

---

## 推奨ワークフロー

1. **ヒアリング**: `HEARING_QUESTIONS.md` をユーザーに送って回答をもらう
2. **コピー作成**: 回答を Hero / About / Courses / FAQ に流し込む
3. **配色調整**: 業種に合わせて pop / deep カラーを変更
4. **画像差し替え**: `public/images/` に画像を置き各セクションで参照
5. **デプロイ**: GitHub → Vercel(import するだけ)
