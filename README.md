# web-template-modern

ミニマル + ポップなトーンの個人 / 小規模ビジネス向けランディングサイトテンプレート。
ブログ機能とチャットボットを内蔵し、業種を問わずカスタマイズできます。

## 使い方

このリポジトリは **GitHub Template** として設定されています。
"Use this template" から新しいリポジトリを作ってクローンし、Claude Code に以下のように依頼してください。

```
このテンプレで {業種} のサイトを作って
```

Claude Code が `HEARING_QUESTIONS.md` を提示するので、回答するだけでサイトの中身が埋まります。

## スタック

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- Framer Motion(アニメーション)
- Lenis(滑らかなスクロール)
- Google Fonts: Shippori Mincho / Noto Sans JP / Orbit

## ローカル起動

```bash
npm install
npm run dev
```

http://localhost:3000 を開きます。

## 主要な設定ファイル

| ファイル | 役割 |
|---|---|
| `lib/config.ts` | サイト名 / チャットボット ON-OFF / ブログ ON-OFF |
| `lib/courses.ts` | サービス・プラン一覧 |
| `lib/works.ts` | 実績・作品 |
| `lib/blog.ts` | ブログ記事 |
| `lib/chatbot/faq.ts` | FAQ(チャットボットと共通) |
| `app/globals.css` | カラーパレット(CSS 変数) |

## ドキュメント

- **`HEARING_QUESTIONS.md`** … ユーザーから集める情報(業種不問)
- **`TEMPLATE_GUIDE.md`** … テンプレートの設計図(構造・配色・動きの原則)
- **`CLAUDE.md`** … Claude Code 向けの作業ルール

## デプロイ

GitHub → Vercel に import するだけで公開できます。
独自ドメインを使う場合は Vercel の Domains 設定で接続してください。
