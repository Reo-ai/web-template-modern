import { NextResponse } from "next/server";
import { generateProposal } from "@/lib/proposal/generate";
import type { AppointmentInput } from "@/lib/proposal/types";

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      {
        error:
          "ANTHROPIC_API_KEY が設定されていません。.env.local に設定してください。",
      },
      { status: 500 }
    );
  }

  const body = (await request.json()) as Partial<AppointmentInput>;

  if (!body.clientName?.trim() || !body.industry?.trim() || !body.notes?.trim()) {
    return NextResponse.json(
      { error: "お客様名・業種・商談メモは必須です。" },
      { status: 400 }
    );
  }

  const input: AppointmentInput = {
    clientName: body.clientName.trim(),
    contactPerson: body.contactPerson?.trim() || undefined,
    industry: body.industry.trim(),
    budget: body.budget?.trim() || undefined,
    timeline: body.timeline?.trim() || undefined,
    tone: body.tone === "friendly" ? "friendly" : "formal",
    notes: body.notes.trim(),
  };

  try {
    const proposal = await generateProposal(input);
    return NextResponse.json({ proposal });
  } catch (error) {
    console.error("[proposal] 生成に失敗しました:", error);
    return NextResponse.json(
      { error: "提案資料の生成に失敗しました。時間をおいて再度お試しください。" },
      { status: 502 }
    );
  }
}
