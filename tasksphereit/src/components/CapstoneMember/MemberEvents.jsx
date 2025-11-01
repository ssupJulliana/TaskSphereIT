// src/components/CapstoneMember/MemberEvents.jsx
import React, { useMemo } from "react";
import {
  ClipboardList,
  BookOpenCheck,
  Presentation,
  GraduationCap,
} from "lucide-react";

const MAROON = "#6A0F14";

const data = {
  titleDefense: [
    {
      no: 1,
      team: "Mendoza, Et Al",
      date: "Mar 25, 2025",
      time: "8:00 AM",
      panelist: "Grayson Tolentino",
      verdict: "Pending",
    },
  ],
  manuscript: [
    {
      no: 1,
      team: "Mendoza, Et Al",
      title: "TaskSphere IT",
      dueDate: "Mar 25, 2025",
      time: "8:00 AM",
      plagiarism: "6%",
      ai: "6%",
      uploaded: true,
      status: "Passed",
    },
  ],
  oralDefense: [
    {
      no: 1,
      team: "Aguas, Et Al",
      title: "FitTrack",
      date: "Mar 25, 2025",
      time: "8:00 AM",
      panelist: "Grayson Tolentino",
      verdict: "Pending",
    },
  ],
  finalDefense: [
    // Add items as needed
  ],
};

/* ---------- tiny ui helpers ---------- */
const SectionTitle = ({ icon: Icon, children }) => (
  <div className="flex items-center gap-2 mb-2">
    <Icon className="w-5 h-5" color={MAROON} />
    <h2 className="text-[17px] font-semibold" style={{ color: MAROON }}>
      {children}
    </h2>
  </div>
);

const Pill = ({ tone = "neutral", children }) => {
  const styles =
    tone === "success"
      ? "bg-[#88A94B] text-white"
      : "border border-neutral-300 text-neutral-700";
  return (
    <span className={`px-3 py-1 rounded-full text-xs inline-flex ${styles}`}>
      {children}
    </span>
  );
};

const CardTable = ({ children }) => (
  <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-[13px]">{children}</table>
    </div>
  </div>
);

function MemberEvents() {
  const hasFinal = useMemo(() => data.finalDefense.length > 0, []);

  return (
    <div className="space-y-4">
      {/* ===== Header ===== */}
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

      {/* ===== Content ===== */}
      <div className="flex-1 min-w-0 max-w-full overflow-hidden space-y-8">
        {/* Title Defense */}
        <section>
          <SectionTitle icon={ClipboardList}>Title Defense</SectionTitle>
          <CardTable>
            <thead>
              <tr className="bg-neutral-50/80 text-neutral-600">
                <th className="text-left py-2 pl-6 pr-3">NO</th>
                <th className="text-left py-2 pr-3">Team</th>
                <th className="text-left py-2 pr-3">Date</th>
                <th className="text-left py-2 pr-3">Time</th>
                <th className="text-left py-2 pr-3">Panelist</th>
                <th className="text-left py-2 pr-6">Verdict</th>
              </tr>
            </thead>
            <tbody>
              {data.titleDefense.map((r) => (
                <tr key={`td-${r.no}`} className="border-t border-neutral-200">
                  <td className="py-2 pl-6 pr-3">{r.no}.</td>
                  <td className="py-2 pr-3">{r.team}</td>
                  <td className="py-2 pr-3">{r.date}</td>
                  <td className="py-2 pr-3">{r.time}</td>
                  <td className="py-2 pr-3">{r.panelist}</td>
                  <td className="py-2 pr-6">
                    <Pill>{r.verdict}</Pill>
                  </td>
                </tr>
              ))}
            </tbody>
          </CardTable>
        </section>

        {/* Manuscript Results */}
        <section>
          <SectionTitle icon={BookOpenCheck}>Manuscript Results</SectionTitle>
          <CardTable>
            <thead>
              <tr className="bg-neutral-50/80 text-neutral-600">
                <th className="text-left py-2 pl-6 pr-3">NO</th>
                <th className="text-left py-2 pr-3">Team</th>
                <th className="text-left py-2 pr-3">Title</th>
                <th className="text-left py-2 pr-3">Due Date</th>
                <th className="text-left py-2 pr-3">Time</th>
                <th className="text-left py-2 pr-3">Plagiarism</th>
                <th className="text-left py-2 pr-3">AI</th>
                <th className="text-left py-2 pr-3">File Uploaded</th>
                <th className="text-left py-2 pr-6">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.manuscript.map((r) => (
                <tr key={`ms-${r.no}`} className="border-t border-neutral-200">
                  <td className="py-2 pl-6 pr-3">{r.no}.</td>
                  <td className="py-2 pr-3">{r.team}</td>
                  <td className="py-2 pr-3">{r.title}</td>
                  <td className="py-2 pr-3">{r.dueDate}</td>
                  <td className="py-2 pr-3">{r.time}</td>
                  <td className="py-2 pr-3">{r.plagiarism}</td>
                  <td className="py-2 pr-3">{r.ai}</td>
                  <td className="py-2 pr-3">{r.uploaded ? "Yes" : "No"}</td>
                  <td className="py-2 pr-6">
                    <Pill tone="success">{r.status}</Pill>
                  </td>
                </tr>
              ))}
            </tbody>
          </CardTable>
        </section>

        {/* Oral Defense */}
        <section>
          <SectionTitle icon={Presentation}>Oral Defense</SectionTitle>
          <CardTable>
            <thead>
              <tr className="bg-neutral-50/80 text-neutral-600">
                <th className="text-left py-2 pl-6 pr-3">NO</th>
                <th className="text-left py-2 pr-3">Team</th>
                <th className="text-left py-2 pr-3">Title</th>
                <th className="text-left py-2 pr-3">Date</th>
                <th className="text-left py-2 pr-3">Time</th>
                <th className="text-left py-2 pr-3">Panelist</th>
                <th className="text-left py-2 pr-6">Verdict</th>
              </tr>
            </thead>
            <tbody>
              {data.oralDefense.map((r) => (
                <tr key={`od-${r.no}`} className="border-t border-neutral-200">
                  <td className="py-2 pl-6 pr-3">{r.no}.</td>
                  <td className="py-2 pr-3">{r.team}</td>
                  <td className="py-2 pr-3">{r.title}</td>
                  <td className="py-2 pr-3">{r.date}</td>
                  <td className="py-2 pr-3">{r.time}</td>
                  <td className="py-2 pr-3">{r.panelist}</td>
                  <td className="py-2 pr-6">
                    <Pill>{r.verdict}</Pill>
                  </td>
                </tr>
              ))}
            </tbody>
          </CardTable>
        </section>

        {/* Final Defense */}
        <section>
          <SectionTitle icon={GraduationCap}>Final Defense</SectionTitle>
          <CardTable>
            <thead>
              <tr className="bg-neutral-50/80 text-neutral-600">
                <th className="text-left py-2 pl-6 pr-3">NO</th>
                <th className="text-left py-2 pr-3">Team</th>
                <th className="text-left py-2 pr-3">Title</th>
                <th className="text-left py-2 pr-3">Date</th>
                <th className="text-left py-2 pr-3">Time</th>
                <th className="text-left py-2 pr-3">Panelist</th>
                <th className="text-left py-2 pr-6">Verdict</th>
              </tr>
            </thead>
            <tbody>
              {hasFinal ? (
                data.finalDefense.map((r) => (
                  <tr key={`fd-${r.no}`} className="border-t border-neutral-200">
                    <td className="py-2 pl-6 pr-3">{r.no}.</td>
                    <td className="py-2 pr-3">{r.team}</td>
                    <td className="py-2 pr-3">{r.title}</td>
                    <td className="py-2 pr-3">{r.date}</td>
                    <td className="py-2 pr-3">{r.time}</td>
                    <td className="py-2 pr-3">{r.panelist}</td>
                    <td className="py-2 pr-6">
                      <Pill>{r.verdict || "Pending"}</Pill>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="border-t border-neutral-200">
                  <td className="py-6 text-center text-neutral-500" colSpan={7}>
                    No final defense items yet.
                  </td>
                </tr>
              )}
            </tbody>
          </CardTable>
        </section>
      </div>
    </div>
  );
}

export default MemberEvents;
