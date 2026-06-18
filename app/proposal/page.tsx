import ProposalGenerator from "@/components/ProposalGenerator";
import type { CalendarAppointment } from "@/components/ProposalGenerator";

/**
 * /proposal — アポイント提案資料自動生成ページ。
 *
 * GOOGLE_CALENDAR_API_KEY と GOOGLE_CALENDAR_ID が
 * 環境変数に設定されている場合、カレンダーから直近のアポイントを
 * 自動取得してフォームに表示します。
 */

async function fetchUpcomingAppointments(): Promise<CalendarAppointment[]> {
  const apiKey = process.env.GOOGLE_CALENDAR_API_KEY;
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  if (!apiKey || !calendarId) return [];

  try {
    const now = new Date().toISOString();
    const weekLater = new Date(Date.now() + 7 * 86400_000).toISOString();
    const url =
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events` +
      `?key=${apiKey}&timeMin=${now}&timeMax=${weekLater}&singleEvents=true&orderBy=startTime&maxResults=10`;

    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const json = await res.json();

    return (json.items ?? [])
      .filter(
        (item: { summary?: string; start?: { dateTime?: string; date?: string } }) =>
          item.summary && (item.start?.dateTime || item.start?.date)
      )
      .map(
        (item: {
          id: string;
          summary: string;
          start: { dateTime?: string; date?: string };
          description?: string;
        }) => ({
          id: item.id,
          summary: item.summary,
          start: item.start.dateTime ?? item.start.date ?? "",
          description: item.description,
        })
      );
  } catch {
    return [];
  }
}

export const metadata = {
  title: "提案資料ジェネレーター",
  description: "アポイントの内容をもとに提案スライドを自動生成します。",
};

export default async function ProposalPage() {
  const appointments = await fetchUpcomingAppointments();

  return <ProposalGenerator appointments={appointments} />;
}
