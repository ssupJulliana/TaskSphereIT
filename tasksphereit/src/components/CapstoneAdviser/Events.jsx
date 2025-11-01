// src/components/CapstoneAdviser/AdviserEvents.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  ClipboardList,
  BookOpenCheck,
  Presentation,
  GraduationCap,
} from "lucide-react";

const MAROON = "#6A0F14";

import { getAdviserEvents } from "../../services/events";

function to12h(t) {
  if (!t) return "";
  const [H, M] = String(t).split(":").map(Number);
  const ampm = H >= 12 ? "PM" : "AM";
  const hh = ((H + 11) % 12) + 1;
  return `${hh}:${String(M || 0).padStart(2, "0")} ${ampm}`;
}

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

function AdviserEvents() {
  const [rows, setRows] = useState({ titleDefense: [], manuscript: [], oralDefense: [], finalDefense: [], finalRedefense: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const res = await getAdviserEvents();
        if (alive) setRows(res);
      } catch (e) {
        console.error("Failed to load events:", e);
        if (alive) setRows({ titleDefense: [], manuscript: [], oralDefense: [], finalDefense: [], finalRedefense: [] });
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const hasFinal = useMemo(() => rows.finalDefense.length > 0, [rows.finalDefense.length]);
  const hasReFinal = useMemo(() => rows.finalRedefense.length > 0, [rows.finalRedefense.length]);

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
              {(loading ? [] : rows.titleDefense).map((r, idx) => (
                <tr key={`td-${r.id}`} className="border-t border-neutral-200">
                  <td className="py-2 pl-6 pr-3">{idx + 1}.</td>
                  <td className="py-2 pr-3">{r.teamName}</td>
                  <td className="py-2 pr-3">{r.date}</td>
                  <td className="py-2 pr-3">{r.timeStart ? to12h(r.timeStart) : ""}</td>
                  <td className="py-2 pr-3">{Array.isArray(r.panelists) ? r.panelists.join(", ") : ""}</td>
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
              {(loading ? [] : rows.manuscript).map((r, idx) => (
                <tr key={`ms-${r.id}`} className="border-t border-neutral-200">
                  <td className="py-2 pl-6 pr-3">{idx + 1}.</td>
                  <td className="py-2 pr-3">{r.teamName}</td>
                  <td className="py-2 pr-3">{r.title}</td>
                  <td className="py-2 pr-3">{r.date}</td>
                  <td className="py-2 pr-3">{to12h(r.timeStart)}</td>
                  <td className="py-2 pr-3">{`${r.plag ?? 0}%`}</td>
                  <td className="py-2 pr-3">{`${r.ai ?? 0}%`}</td>
                  <td className="py-2 pr-3">{r.file ? "Yes" : "No"}</td>
                  <td className="py-2 pr-6">
                    <Pill tone="success">{r.verdict}</Pill>
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
              {(loading ? [] : rows.oralDefense).map((r, idx) => (
                <tr key={`od-${r.id}`} className="border-t border-neutral-200">
                  <td className="py-2 pl-6 pr-3">{idx + 1}.</td>
                  <td className="py-2 pr-3">{r.teamName}</td>
                  <td className="py-2 pr-3">{r.title}</td>
                  <td className="py-2 pr-3">{r.date}</td>
                  <td className="py-2 pr-3">{r.timeStart ? to12h(r.timeStart) : ""}</td>
                  <td className="py-2 pr-3">{Array.isArray(r.panelists) ? r.panelists.join(", ") : ""}</td>
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
                rows.finalDefense.map((r, idx) => (
                  <tr key={`fd-${r.id}`} className="border-t border-neutral-200">
                    <td className="py-2 pl-6 pr-3">{idx + 1}.</td>
                    <td className="py-2 pr-3">{r.teamName}</td>
                    <td className="py-2 pr-3">{r.title}</td>
                    <td className="py-2 pr-3">{r.date}</td>
                    <td className="py-2 pr-3">{r.timeStart ? to12h(r.timeStart) : ""}</td>
                    <td className="py-2 pr-3">{Array.isArray(r.panelists) ? r.panelists.join(", ") : ""}</td>
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

        {/* Final Re-Defense */}
        <section>
          <SectionTitle icon={GraduationCap}>Final Re-Defense</SectionTitle>
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
              {hasReFinal ? (
                rows.finalRedefense.map((r, idx) => (
                  <tr key={`frd-${r.id}`} className="border-t border-neutral-200">
                    <td className="py-2 pl-6 pr-3">{idx + 1}.</td>
                    <td className="py-2 pr-3">{r.teamName}</td>
                    <td className="py-2 pr-3">{r.title}</td>
                    <td className="py-2 pr-3">{r.date}</td>
                    <td className="py-2 pr-3">{r.timeStart ? to12h(r.timeStart) : ""}</td>
                    <td className="py-2 pr-3">{Array.isArray(r.panelists) ? r.panelists.join(", ") : ""}</td>
                    <td className="py-2 pr-6">
                      <Pill>{r.verdict || "Pending"}</Pill>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="border-t border-neutral-200">
                  <td className="py-6 text-center text-neutral-500" colSpan={7}>
                    No final re-defense items yet.
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

export default AdviserEvents;
