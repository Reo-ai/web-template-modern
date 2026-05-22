import About from "../components/About";
import BlogTeaser from "../components/BlogTeaser";
import ContactForm from "../components/ContactForm";
import Courses from "../components/Courses";
import Faq from "../components/Faq";
import Hero from "../components/Hero";
import Works from "../components/Works";
import { ENABLE_BLOG } from "../lib/config";

/**
 * トップページ:1ページに全セクションを縦並びで構成する。
 * 各セクションは個別コンポーネントに切り出してメンテナンスしやすくしている。
 *
 * ブログ機能は lib/config.ts の ENABLE_BLOG フラグで ON/OFF できる。
 */
export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Courses />
      <Works />
      <Faq />
      {ENABLE_BLOG && <BlogTeaser />}
      <ContactForm />
    </>
  );
}
