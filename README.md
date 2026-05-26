# web-template-modern

ミニマル + ポップなトーンの個人 / 小規模ビジネス向けランディングサイトテンプレート。
ブログ機能とチャットボットを内蔵し、業種を問わずカスタマイズできます。

[![Use this template](https://img.shields.io/badge/Use%20this%20template-2ea44f?style=for-the-badge&logo=github)](https://github.com/Reo-ai/web-template-modern/generate)

---

## 🚀 Claude Code で 5 分で立ち上げる

このテンプレートは **Claude Code(Anthropic 公式 CLI)** と組み合わせて使うことを前提に作られています。

### ステップ 1. テンプレートを取り込む

GitHub の **"Use this template"** ボタン、または `gh` CLI で:

```bash
gh repo create my-new-site --template Reo-ai/web-template-modern --public --clone
cd my-new-site
npm install
```

### ステップ 2. Claude Code を起動

```bash
claude
```

### ステップ 3. 一言依頼するだけ

```
このテンプレで {あなたの業種} のサイトを作って
```

→ Claude Code が自動で `HEARING_QUESTIONS.md`(業種不問のヒアリングシート)を提示します。
→ 回答すると、Hero / About / Services / Works / FAQ / Blog のコピーとデータが自動で埋まります。

> **🎯 Tips**: `claude-plugins` をインストールしていれば、`/new-modern-site` 一発で同じ流れが起動します。
> インストール方法は [Reo-ai/claude-plugins](https://github.com/Reo-ai/claude-plugins) を参照。

---

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
- **`CLAUDE.md`** … Claude Code 向けの作業ルール(クローン先で自動読み込み)

## デプロイ

GitHub → Vercel に import するだけで公開できます。
独自ドメインを使う場合は Vercel の Domains 設定で接続してください。

---

## Claude Code を使わない場合

通常の Next.js プロジェクトとしても使えます。`lib/config.ts` から順に手動で編集してください。
詳しい構造は `TEMPLATE_GUIDE.md` を参照。

## ライセンス

MIT
