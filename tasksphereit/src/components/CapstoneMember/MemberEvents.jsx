// src/components/CapstoneMember/MemberEvents.jsx
import React from "react";
import {
  CalendarCheck2,
  FileText,
  Mic2,
  GraduationCap,
  ClipboardList,
} from "lucide-react";

const MAROON = "#6A0F14";

/* ---------- tiny UI helpers ---------- */
const Card = ({ className = "", children }) => (
  <div
    className={
      "rounded-xl border border-neutral-200 bg-white shadow-[0_6px_18px_rgba(0,0,0,0.05)] " +
      className
    }
  >
    {children}
  </div>
);

const SectionTitle = ({ icon: Icon, children }) => (
  <div className="flex items-center gap-2 text-[16px] font-semibold text-neutral-800 mb-2">
    <Icon size={18} style={{ color: MAROON }} />
    <span>{children}</span>
  </div>
);

const Pill = ({ children, tone = "soft" }) => {
  const map = {
    soft: "border border-neutral-300 bg-white text-neutral-700",
    green: "bg-[#6B8E23] text-white",
    pending: "border border-neutral-300 bg-white text-neutral-700",
  };
  const cls = map[tone] || map.soft;
  return (
    <span className={`inline-flex items-center px-3 py-[6px] rounded-md text-xs font-semibold ${cls}`}>
      {children}
    </span>
  );
};

/* ---------- static demo data ---------- */
const titleDefense = [
  {
    id: 1,
    team: "Mendoza, Et Al",
    date: "Mar 25, 2025",
    time: "8:00 AM",
    panelist: "Grayson Tolentino",
    verdict: "Pending",
  },
];

const manuscriptResults = [
  {
    id: 1,
    team: "Mendoza, Et Al",
    title: "TaskSphere IT",
    dueDate: "Mar 25, 2025",
    time: "8:00 AM",
    plagiarism: "6%",
    ai: "6%",
    uploaded: "—",
    status: "Passed",
  },
];

const oralDefense = [
  {
    id: 1,
    team: "Aguas, Et Al",
    title: "FitTrack",
    date: "Mar 25, 2025",
    time: "8:00 AM",
    panelist: "Grayson Tolentino",
    verdict: "Pending",
  },
];

const finalDefense = [
  {
    id: 1,
    team: "Bernardo, Et Al",
    title: "QuikServe",
    date: "Mar 28, 2025",
    time: "9:30 AM",
    panelist: "—",
    verdict: "Pending",
  },
];

/* ---------- page ---------- */
function MemberEvents() {
  return (
    <div className="space-y-4">
      {/* ===== Header (match ProjectManagerTasks header) ===== */}
      <div className="space-y-2">
        <div
          className="flex items-center gap-2 text-[18px] font-semibold"
          style={{ color: MAROON }}
        >
          <ClipboardList className="w-5 h-5" />
          <span>Events</span>
        </div>
        <div className="h-[3px] w-full" style={{ backgroundColor: MAROON }} />
      </div>

      {/* Title Defense */}
      <div>
        <SectionTitle icon={CalendarCheck2}>Title Defense</SectionTitle>
        <Card className="mt-2">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-600">
              <tr>
                <th className="text-left px-4 py-3 w-16">NO</th>
                <th className="text-left px-4 py-3">Team</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Time</th>
                <th className="text-left px-4 py-3">Panelist</th>
                <th className="text-left px-4 py-3">Verdict</th>
              </tr>
            </thead>
            <tbody>
              {titleDefense.map((r, i) => (
                <tr key={r.id} className={i % 2 ? "bg-neutral-50/60" : "bg-white"}>
                  <td className="px-4 py-3 text-neutral-700">{i + 1}.</td>
                  <td className="px-4 py-3 text-neutral-800">{r.team}</td>
                  <td className="px-4 py-3 text-neutral-800">{r.date}</td>
                  <td className="px-4 py-3 text-neutral-800">{r.time}</td>
                  <td className="px-4 py-3 text-neutral-800">{r.panelist}</td>
                  <td className="px-4 py-3">
                    <Pill tone="pending">{r.verdict}</Pill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {/* Manuscript Results */}
      <div className="mt-2">
        <SectionTitle icon={FileText}>Manuscript Results</SectionTitle>
        <Card className="mt-2">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-600">
              <tr>
                <th className="text-left px-4 py-3 w-16">NO</th>
                <th className="text-left px-4 py-3">Team</th>
                <th className="text-left px-4 py-3">Title</th>
                <th className="text-left px-4 py-3">Due Date</th>
                <th className="text-left px-4 py-3">Time</th>
                <th className="text-left px-4 py-3">Plagiarism</th>
                <th className="text-left px-4 py-3">AI</th>
                <th className="text-left px-4 py-3">File Uploaded</th>
                <th className="text-left px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {manuscriptResults.map((r, i) => (
                <tr key={r.id} className={i % 2 ? "bg-neutral-50/60" : "bg-white"}>
                  <td className="px-4 py-3 text-neutral-700">{i + 1}.</td>
                  <td className="px-4 py-3 text-neutral-800">{r.team}</td>
                  <td className="px-4 py-3 text-neutral-800">{r.title}</td>
                  <td className="px-4 py-3 text-neutral-800">{r.dueDate}</td>
                  <td className="px-4 py-3 text-neutral-800">{r.time}</td>
                  <td className="px-4 py-3 text-neutral-800">{r.plagiarism}</td>
                  <td className="px-4 py-3 text-neutral-800">{r.ai}</td>
                  <td className="px-4 py-3 text-neutral-800">{r.uploaded}</td>
                  <td className="px-4 py-3">
                    <Pill tone="green">Passed</Pill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {/* Oral Defense */}
      <div className="mt-2">
        <SectionTitle icon={Mic2}>Oral Defense</SectionTitle>
        <Card className="mt-2">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-600">
              <tr>
                <th className="text-left px-4 py-3 w-16">NO</th>
                <th className="text-left px-4 py-3">Team</th>
                <th className="text-left px-4 py-3">Title</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Time</th>
                <th className="text-left px-4 py-3">Panelist</th>
                <th className="text-left px-4 py-3">Verdict</th>
              </tr>
            </thead>
            <tbody>
              {oralDefense.map((r, i) => (
                <tr key={r.id} className={i % 2 ? "bg-neutral-50/60" : "bg-white"}>
                  <td className="px-4 py-3 text-neutral-700">{i + 1}.</td>
                  <td className="px-4 py-3 text-neutral-800">{r.team}</td>
                  <td className="px-4 py-3 text-neutral-800">{r.title}</td>
                  <td className="px-4 py-3 text-neutral-800">{r.date}</td>
                  <td className="px-4 py-3 text-neutral-800">{r.time}</td>
                  <td className="px-4 py-3 text-neutral-800">{r.panelist}</td>
                  <td className="px-4 py-3">
                    <Pill tone="pending">{r.verdict}</Pill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {/* Final Defense */}
      <div className="mt-2">
        <SectionTitle icon={GraduationCap}>Final Defense</SectionTitle>
        <Card className="mt-2">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-600">
              <tr>
                <th className="text-left px-4 py-3 w-16">NO</th>
                <th className="text-left px-4 py-3">Team</th>
                <th className="text-left px-4 py-3">Title</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Time</th>
                <th className="text-left px-4 py-3">Panelist</th>
                <th className="text-left px-4 py-3">Verdict</th>
              </tr>
            </thead>
            <tbody>
              {finalDefense.map((r, i) => (
                <tr key={r.id} className={i % 2 ? "bg-neutral-50/60" : "bg-white"}>
                  <td className="px-4 py-3 text-neutral-700">{i + 1}.</td>
                  <td className="px-4 py-3 text-neutral-800">{r.team}</td>
                  <td className="px-4 py-3 text-neutral-800">{r.title}</td>
                  <td className="px-4 py-3 text-neutral-800">{r.date}</td>
                  <td className="px-4 py-3 text-neutral-800">{r.time}</td>
                  <td className="px-4 py-3 text-neutral-800">{r.panelist}</td>
                  <td className="px-4 py-3">
                    <Pill tone="pending">{r.verdict}</Pill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}

export default MemberEvents;
