"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Lenis を使った滑らかなスクロール体験を全ページに適用するラッパー。
 * 参考サイト(bunkafp-2025)の慣性スクロール挙動を再現するために配置している。
 */
export default function SmoothScroll() {
  useEffect(() => {
    // Lenis インスタンスを生成 — オプションは控えめに(過度な慣性は読みにくいため)
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
    });

    // requestAnimationFrame で毎フレーム raf を回す
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // アンマウント時に破棄
    return () => {
      lenis.destroy();
    };
  }, []);

  return null;
}
