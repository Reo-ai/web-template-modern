import ProposalForm from "@/components/proposal/ProposalForm";

export const metadata = {
  title: "提案書ジェネレーター | AI提案資料自動生成",
  description: "アポイントの内容を入力するだけで、AIが提案書を自動生成します。",
};

export default function ProposalPage() {
  return (
    <section className="relative w-full min-h-screen px-5 py-32 md:px-10">
      {/* 背景グラデーション */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full bg-pop/5 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full bg-deep/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-3xl">
        {/* ヘッダー */}
        <div className="mb-16 text-center">
          <p className="font-display text-xs tracking-[0.25em] text-pop">
            AI PROPOSAL GENERATOR
          </p>
          <h1 className="mt-4 font-serif-jp text-4xl font-bold leading-tight md:text-5xl">
            提案書を、
            <span className="text-pop">自動生成</span>
            する。
          </h1>
          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-ink/70">
            アポイントで聞いた内容を入力するだけ。AIが顧客の課題を分析し、
            説得力ある提案書を数秒で作成します。
          </p>

          {/* ステップ説明 */}
          <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
            {[
              { n: "01", t: "情報を入力" },
              { n: "→", t: "" },
              { n: "02", t: "AIが分析" },
              { n: "→", t: "" },
              { n: "03", t: "提案書完成" },
            ].map((item, i) =>
              item.t ? (
                <div key={i} className="flex items-center gap-2">
                  <span className="font-display text-xs tracking-widest text-pop">
                    {item.n}
                  </span>
                  <span className="text-xs text-ink/60">{item.t}</span>
                </div>
              ) : (
                <span key={i} className="text-muted text-sm">
                  {item.n}
                </span>
              )
            )}
          </div>
        </div>

        {/* フォーム */}
        <ProposalForm />
      </div>
    </section>
  );
}
