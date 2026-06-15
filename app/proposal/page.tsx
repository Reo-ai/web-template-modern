import ProposalGenerator from "@/components/ProposalGenerator";

/**
 * アポイント情報から提案資料を自動生成するページ。
 * Claude API を使ってリアルタイムで提案書を作成する。
 */
export const metadata = {
  title: "提案資料ジェネレーター",
  description: "アポイントの内容を入力するだけで、AIが提案資料を自動で作成します。",
};

export default function ProposalPage() {
  return (
    <main className="min-h-screen bg-base px-5 pb-24 pt-32 md:px-10 md:pt-40">
      {/* ページヘッダー */}
      <div className="mx-auto mb-12 max-w-5xl">
        <p className="font-display text-xs tracking-widest text-pop">
          #008 / PROPOSAL GENERATOR
        </p>
        <h1 className="mt-3 font-serif-jp text-3xl font-bold leading-tight text-ink md:text-5xl">
          提案資料を、
          <br />
          自動で。
        </h1>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted">
          アポイントのヒアリング内容を入力するだけで、AIがクライアントに合わせた
          提案書を即座に生成します。そのままコピーして活用できます。
        </p>
      </div>

      {/* ジェネレーター本体 */}
      <ProposalGenerator />
    </main>
  );
}
