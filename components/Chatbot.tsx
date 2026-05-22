"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { BOT_FLOW, type BotMessage } from "../lib/chatbot/flow";
import { SITE_NAME } from "@/lib/config";

/**
 * 画面右下に常駐するフローティング・チャットボット。
 * 決定木方式の選択肢ベース UI で、サービス FAQ と申込誘導を担当。
 *
 * 表示自体の ON/OFF は lib/config.ts の ENABLE_CHATBOT で制御します
 * (app/layout.tsx 側で条件レンダリングされる)。
 *
 * 【編集ポイント】
 * - ボットの台詞・選択肢は lib/chatbot/flow.ts を編集
 * - パネルヘッダーのタイトルは BOT_TITLE
 */

const BOT_TITLE = "案内ボット";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [nodeId, setNodeId] = useState<string>("start");
  const [history, setHistory] = useState<BotMessage[]>([
    { role: "bot", content: BOT_FLOW.start.message },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 新しいメッセージが追加された時に最下部までスクロール
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, open]);

  const handleChoice = (label: string, next: string, scrollToContact?: boolean) => {
    const nextNode = BOT_FLOW[next];
    if (!nextNode) return;

    setHistory((prev) => [
      ...prev,
      { role: "user", content: label },
      { role: "bot", content: nextNode.message },
    ]);
    setNodeId(next);

    // 申込フォームへスクロール
    if (scrollToContact && typeof window !== "undefined") {
      const el = document.getElementById("contact");
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          setOpen(false);
        }, 400);
      }
    }
  };

  const resetConversation = () => {
    setNodeId("start");
    setHistory([{ role: "bot", content: BOT_FLOW.start.message }]);
  };

  const currentNode = BOT_FLOW[nodeId] ?? BOT_FLOW.start;

  return (
    <>
      {/* フローティングボタン */}
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={open ? "チャットを閉じる" : "チャットを開く"}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-ink text-base shadow-[0_8px_30px_-8px_rgba(0,0,0,0.4)] md:bottom-8 md:right-8 md:h-16 md:w-16"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.svg
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </motion.svg>
          ) : (
            <motion.svg
              key="chat"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.button>

      {/* チャットパネル */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-24 right-4 z-50 flex h-[min(560px,calc(100vh-7rem))] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-border bg-base shadow-[0_24px_60px_-12px_rgba(0,0,0,0.25)] md:bottom-28 md:right-8"
          >
            {/* ヘッダー */}
            <div className="flex items-center justify-between border-b border-border bg-card px-5 py-4">
              <div>
                <p className="font-display text-[10px] tracking-widest text-pop">
                  CHATBOT
                </p>
                <h3 className="mt-0.5 font-serif-jp text-base font-bold">
                  {BOT_TITLE}
                </h3>
              </div>
              <button
                type="button"
                onClick={resetConversation}
                className="rounded-full border border-border bg-base px-3 py-1 font-display text-[10px] tracking-widest text-muted transition-colors hover:bg-ink hover:text-base"
              >
                RESET
              </button>
            </div>

            {/* 会話履歴 */}
            <div
              ref={scrollRef}
              className="flex-1 space-y-3 overflow-y-auto px-5 py-5"
            >
              {history.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className={
                    m.role === "bot"
                      ? "flex justify-start"
                      : "flex justify-end"
                  }
                >
                  <div
                    className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      m.role === "bot"
                        ? "rounded-tl-sm bg-card text-ink"
                        : "rounded-tr-sm bg-ink text-base"
                    }`}
                  >
                    {m.content}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* 選択肢ボタン */}
            <div className="border-t border-border bg-card px-4 py-3">
              <div className="flex flex-wrap gap-2">
                {currentNode.choices.map((c) => (
                  <button
                    key={c.label + c.next}
                    type="button"
                    onClick={() => handleChoice(c.label, c.next, c.scrollToContact)}
                    className="rounded-full border border-border bg-base px-3 py-1.5 text-xs transition-colors hover:border-ink hover:bg-ink hover:text-base"
                  >
                    {c.label}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-center font-display text-[9px] tracking-widest text-muted">
                POWERED BY — {SITE_NAME}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
