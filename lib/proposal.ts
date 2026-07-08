import { COURSES, type Course } from "@/lib/courses";

/**
 * 「アポイントの内容 → 提案資料」自動生成ロジック。
 *
 * 商談・打ち合わせのヒアリング内容を入力すると、lib/courses.ts の
 * プランと突き合わせて最適な提案(推薦プラン・理由・お見積り・次のステップ)
 * を自動で組み立てる。外部 API には依存しないルールベースの生成。
 */

/** ヒアリングフォームの入力内容 */
export type AppointmentInput = {
  /** 先方のお名前 / 会社名 */
  clientName: string;
  /** 業種・ご職業(任意) */
  industry: string;
  /** アポイントを行った日(YYYY-MM-DD) */
  meetingDate: string;
  /** ご予算感(自由入力。例: "月5万円くらい" "10万〜15万") */
  budget: string;
  /** ヒアリングで聞いた課題・要望(複数行可) */
  needs: string;
  /** 商談中に話題に出たプラン番号(lib/courses.ts の number, 任意) */
  interestedCourseNumber?: string;
  /** その他メモ(任意) */
  notes?: string;
};

/** 生成された提案資料 */
export type ProposalDocument = {
  client: {
    name: string;
    industry: string;
    meetingDate: string;
  };
  /** ヒアリング内容を箇条書きに分解したもの */
  challenges: string[];
  /** メインで推薦するプラン */
  recommended: Course;
  /** 参考として併記する他プラン */
  alternatives: Course[];
  /** 推薦理由(箇条書き) */
  reasons: string[];
  /** 導入までの想定スケジュール */
  schedule: string[];
  /** 提案後の次のアクション */
  nextSteps: string[];
  notes?: string;
};

/**
 * 金額表現(例: "10万円", "¥98,000(税込)", "5万〜8万")から
 * 最初に出てくる金額を円単位の数値へ変換する。読み取れない場合は null。
 */
function parseYen(text: string): number | null {
  if (!text) return null;
  const cleaned = text.replace(/,/g, "");
  const manMatch = cleaned.match(/(\d+(?:\.\d+)?)\s*万/);
  if (manMatch) return Math.round(parseFloat(manMatch[1]) * 10000);
  const numMatch = cleaned.match(/(\d+)/);
  if (numMatch) return parseInt(numMatch[1], 10);
  return null;
}

/** ヒアリング内容(自由記述)を読みやすい箇条書きに分解する */
function splitIntoBullets(text: string, max = 5): string[] {
  return text
    .split(/[\n、。・]/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .slice(0, max);
}

/** 予算感と各プランの価格を突き合わせ、最も予算内に近いプランを選ぶ */
function pickByBudget(budgetYen: number): Course {
  const withPrice = COURSES.map((c) => ({ course: c, price: parseYen(c.price) }))
    .filter((c): c is { course: Course; price: number } => c.price !== null);

  if (withPrice.length === 0) return COURSES[0];

  const withinBudget = withPrice.filter((c) => c.price <= budgetYen);
  if (withinBudget.length > 0) {
    // 予算内で最も価格が高い(=内容が手厚い)プランを選ぶ
    return withinBudget.sort((a, b) => b.price - a.price)[0].course;
  }

  // 予算内に収まるプランがなければ、最も予算に近い(安い)プランを提示
  return withPrice.sort((a, b) => a.price - b.price)[0].course;
}

/** 入力されたヒアリング内容から、提案資料一式を生成する */
export function generateProposal(input: AppointmentInput): ProposalDocument {
  const challenges = splitIntoBullets(input.needs);

  let recommended: Course;
  const reasons: string[] = [];

  const interested = COURSES.find(
    (c) => c.number === input.interestedCourseNumber
  );

  if (interested) {
    recommended = interested;
    reasons.push(
      `商談中に${interested.name}についてお話しした流れを踏まえ、こちらをベースにご提案します。`
    );
  } else {
    const budgetYen = parseYen(input.budget);
    if (budgetYen !== null) {
      recommended = pickByBudget(budgetYen);
      reasons.push(
        `ご予算感(${input.budget})に対して、${recommended.name}(${recommended.price})が最もバランスの良い内容と判断しました。`
      );
    } else {
      recommended = COURSES[0];
      reasons.push(
        `詳細なご予算は当日のヒアリングを踏まえて別途すり合わせるものとし、まずは代表的な${recommended.name}をベースにご提案します。`
      );
    }
  }

  if (challenges.length > 0) {
    reasons.push(
      `「${challenges[0]}」というご要望に対して、${recommended.tagline}という特長がフィットすると考えています。`
    );
  }
  reasons.push(
    `提供形態は${recommended.format}、期間の目安は${recommended.duration}です。`
  );

  const alternatives = COURSES.filter(
    (c) => c.number !== recommended.number
  ).slice(0, 2);

  const schedule = [
    "本提案書のご確認・すり合わせ(〜1週間)",
    `${recommended.format}にて提供開始`,
    `${recommended.duration}を目安に実施`,
    "実施後、振り返り・次のご提案のすり合わせ",
  ];

  const nextSteps = [
    "本提案書の内容についてご質問があれば、お気軽にご連絡ください。",
    "内容にご納得いただけましたら、正式なお申込みのご案内をいたします。",
    "お申込み後、あらためて初回の打ち合わせ日程を調整いたします。",
  ];

  return {
    client: {
      name: input.clientName,
      industry: input.industry,
      meetingDate: input.meetingDate,
    },
    challenges,
    recommended,
    alternatives,
    reasons,
    schedule,
    nextSteps,
    notes: input.notes,
  };
}
