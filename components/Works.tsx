"use client";

import { motion } from "framer-motion";
import { useRef, useState } from "react";
import SectionHeading from "./SectionHeading";
import { WORKS, type Work } from "@/lib/works";

/**
 * 作品 / 実績セクション。
 * 各カードに簡易プレーヤーを持たせる(audioSrc が無ければ非表示)。
 *
 * 【編集ポイント】
 * - SECTION_TITLE / SECTION_DESCRIPTION : セクション見出しコピー
 * - WORKS データは lib/works.ts を編集
 * - 音源を使わない業種(写真家・コンサルなど)は、audio 要素を削除しても OK
 */

const SECTION_TITLE = "{これまでの仕事、これからの仕事。}";
const SECTION_DESCRIPTION =
  "{実績・作品の紹介リード文。クライアント名や数字を入れると効果的。}";
const DISCLAIMER = "※ サンプルは仮データです。実物は順次差し替えます。";

export default function Works() {
  return (
    <section
      id="works"
      className="relative w-full px-5 py-24 md:px-10 md:py-32"
    >
      <SectionHeading
        number="004"
        label="WORKS"
        title={SECTION_TITLE}
        description={SECTION_DESCRIPTION}
      />

      <div className="grid gap-6 md:grid-cols-2">
        {WORKS.map((work, i) => (
          <WorkCard key={work.id} work={work} index={i} />
        ))}
      </div>

      <p className="mt-10 text-center text-xs text-muted">{DISCLAIMER}</p>
    </section>
  );
}

function WorkCard({ work, index }: { work: Work; index: number }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const hasAudio = Boolean(work.audioSrc);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play().catch(() => {
        /* 音源未配置時はサイレントフェイル */
      });
    }
    setPlaying((v) => !v);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.7,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group relative overflow-hidden rounded-3xl border border-border bg-card transition-all duration-300 hover:shadow-[0_24px_60px_-30px_rgba(0,0,0,0.25)]"
    >
      {/* ジャケット風カバー */}
      <div
        className="relative aspect-[16/10] w-full overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${work.accent}33 0%, ${work.accent}11 60%, transparent 100%), var(--card)`,
        }}
      >
        {/* 波形風モチーフ(汎用的な抽象パターン) */}
        <svg
          className="absolute inset-x-0 bottom-0 h-1/2 w-full text-ink/15"
          viewBox="0 0 400 80"
          preserveAspectRatio="none"
          aria-hidden
        >
          {Array.from({ length: 60 }).map((_, i) => {
            const h = 8 + Math.abs(Math.sin(i * 0.6)) * 50;
            return (
              <rect
                key={i}
                x={i * 7 + 4}
                y={(80 - h) / 2}
                width="3"
                height={h}
                rx="1.5"
                fill="currentColor"
              />
            );
          })}
        </svg>

        {/* 再生ボタン(音源がある場合のみ) */}
        {hasAudio && (
          <button
            type="button"
            onClick={togglePlay}
            className="absolute right-5 top-5 flex h-12 w-12 items-center justify-center rounded-full border border-ink bg-base transition-all hover:scale-110"
            aria-label={`${work.title} を再生`}
            style={playing ? { background: work.accent, color: "#fff" } : {}}
          >
            {playing ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="5" width="4" height="14" rx="1" />
                <rect x="14" y="5" width="4" height="14" rx="1" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        )}

        {/* メタ情報 */}
        <div className="absolute left-5 top-5 flex items-center gap-2 font-display text-[10px] tracking-widest text-ink/80">
          <span>{work.year}</span>
          <span className="h-px w-5 bg-ink/30" />
          <span>{work.category}</span>
        </div>
      </div>

      {/* タイトル + 説明 */}
      <div className="p-6 md:p-8">
        <h3 className="font-serif-jp text-2xl font-bold leading-tight">
          {work.title}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-ink/75">
          {work.description}
        </p>

        {hasAudio && (
          <audio
            ref={audioRef}
            src={work.audioSrc}
            onEnded={() => setPlaying(false)}
            preload="none"
          />
        )}
      </div>
    </motion.article>
  );
}
