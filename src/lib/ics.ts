import type { Interview } from "./types";

const fmt = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    "Z"
  );
};

const escape = (s: string) =>
  (s || "").replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");

export const buildInterviewICS = (iv: Interview): string => {
  const start = new Date(iv.scheduledAt);
  const end = new Date(start.getTime() + (iv.durationMins || 30) * 60_000);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Lovable//Interview//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${iv.id}@lovable-interviews`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${escape(`Interview: ${iv.jobTitle} — ${iv.companyName}`)}`,
    `DESCRIPTION:${escape(
      `Interview between ${iv.companyName} and ${iv.candidateName} for ${iv.jobTitle}.${
        iv.notes ? "\n\nNotes: " + iv.notes : ""
      }`
    )}`,
    `LOCATION:${escape(iv.location || iv.mode)}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
};

export const downloadInterviewICS = (iv: Interview) => {
  const ics = buildInterviewICS(iv);
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `interview-${iv.jobTitle.replace(/\s+/g, "-").toLowerCase()}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
