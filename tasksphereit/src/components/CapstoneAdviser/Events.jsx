// src/components/CapstoneAdviser/Events.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ClipboardList,
  BookOpenCheck,
  Presentation,
  GraduationCap,
  Paperclip,
  X,
  Download,
  ExternalLink,
} from "lucide-react";
import { getAdviserEvents } from "../../services/events";

/* ===== Firebase ===== */
import { db } from "../../config/firebase";
import { doc, setDoc, updateDoc } from "firebase/firestore";

/* ===== Supabase ===== */
import { supabase } from "../../config/supabase";

const MAROON = "#6A0F14";

/** Must match your Firestore collection name */
const MANUSCRIPT_COLLECTION = "manuscriptSubmissions";

const to12h = (t) => {
  if (!t) return "";
  const [Hraw, Mraw] = String(t).split(":");
  const H = Number(Hraw ?? 0);
  const M = Number(Mraw ?? 0);
  const ampm = H >= 12 ? "PM" : "AM";
  const hh = ((H + 11) % 12) + 1;
  return `${hh}:${String(M || 0).padStart(2, "0")} ${ampm}`;
};

const CardTable = ({ children }) => (
  <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-[13px]">{children}</table>
    </div>
  </div>
);

const Pill = ({ children }) => (
  <span className="px-3 py-1 rounded-full text-xs inline-flex border border-neutral-300 text-neutral-700">
    {children}
  </span>
);

/* ============ Upload helpers ============ */
const safeName = (name = "") =>
  name
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 120);

async function uploadToSupabase(file, row) {
  const fileKey = `${row.teamId || "no-team"}/${row.id}/${
    Date.now() + "-" + Math.random().toString(36).slice(2)
  }-${safeName(file.name)}`;

  const { error } = await supabase.storage
    .from("user-manuscripts")
    .upload(fileKey, file, { upsert: false });
  if (error) throw new Error(error.message);

  const {
    data: { publicUrl },
  } = supabase.storage.from("user-manuscripts").getPublicUrl(fileKey);

  return {
    name: file.name,
    fileName: fileKey,
    url: publicUrl,
    uploadedAt: new Date().toISOString(),
  };
}

async function upsertFileUrl(docId, nextList) {
  const ref = doc(db, MANUSCRIPT_COLLECTION, docId);
  try {
    await updateDoc(ref, { fileUrl: nextList });
  } catch {
    await setDoc(ref, { fileUrl: nextList }, { merge: true });
  }
}

/* ============ Modal ============ */
function UploadModal({ open, row, onClose, onSaved }) {
  const [pendingFiles, setPendingFiles] = useState([]);
  const [existing, setExisting] = useState([]);
  const [toDelete, setToDelete] = useState(new Set());
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  // Initialize when opened
  useEffect(() => {
    if (!open || !row?.id) return;

    // snapshot existing files locally for editing
    setExisting(Array.isArray(row.fileUrl) ? [...row.fileUrl] : []);
    setPendingFiles([]);
    setToDelete(new Set());

    // ensure fileUrl exists remotely too
    (async () => {
      if (!Array.isArray(row.fileUrl)) {
        try {
          await setDoc(
            doc(db, MANUSCRIPT_COLLECTION, row.id),
            { fileUrl: [] },
            { merge: true }
          );
          onSaved?.([]);
        } catch (e) {
          console.error("Init fileUrl failed:", e);
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, row?.id]);

  if (!open || !row) return null;

  const pickFiles = () => inputRef.current?.click();

  const onFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setPendingFiles((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  const removePending = (idx) =>
    setPendingFiles((prev) => prev.filter((_, i) => i !== idx));

  const removeExisting = (fileName) => {
    setExisting((prev) => prev.filter((f) => f.fileName !== fileName));
    setToDelete((prev) => {
      const next = new Set(prev);
      next.add(fileName);
      return next;
    });
  };

  const save = async () => {
    if (uploading || !row?.id) return;
    setUploading(true);
    try {
      // 1) delete removed existing files from storage
      if (toDelete.size > 0) {
        const names = Array.from(toDelete);
        const { error } = await supabase.storage
          .from("user-manuscripts")
          .remove(names);
        if (error) console.warn("Supabase remove error:", error.message);
      }

      // 2) upload new files
      const uploaded =
        pendingFiles.length > 0
          ? await Promise.all(pendingFiles.map((f) => uploadToSupabase(f, row)))
          : [];

      // 3) compose final list & write to Firestore
      const nextList = [...existing, ...uploaded];
      await upsertFileUrl(row.id, nextList);

      onSaved?.(nextList);
      onClose();
    } catch (e) {
      console.error(e);
      alert(e.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const hasChanges = pendingFiles.length > 0 || toDelete.size > 0;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative z-10 mx-auto mt-10 w-[880px] max-w-[95vw]">
        <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="h-[2px] w-full" style={{ backgroundColor: MAROON }} />
          <div className="flex items-center justify-between px-5 pt-3 pb-2">
            <div
              className="flex items-center gap-2 text-[16px] font-semibold"
              style={{ color: MAROON }}
            >
              <span>●</span>
              <span>Upload Files — {row.teamName}</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-neutral-100 text-neutral-500"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body (scrollable) */}
          <div className="flex-1 px-5 pb-5 overflow-y-auto space-y-5">
            {/* Existing files */}
            <div className="rounded-xl border border-neutral-200">
              <div className="px-4 py-2 border-b border-neutral-200 text-sm font-semibold">
                Uploaded Files
              </div>
              <div className="p-4">
                {existing.length > 0 ? (
                  <ul className="space-y-2">
                    {existing.map((f, i) => (
                      <li
                        key={f.fileName || `${f.url}-${i}`}
                        className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 px-3 py-2"
                      >
                        <div className="truncate">
                          <div className="text-sm font-medium truncate">
                            {f.name || "file"}
                          </div>
                          <div className="text-xs text-neutral-500 truncate">
                            {f.fileName}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <a
                            href={f.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md border border-neutral-300 hover:bg-neutral-50"
                            title="Open"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Open
                          </a>
                          <a
                            href={f.url}
                            download={f.name || "file"}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md border border-neutral-300 hover:bg-neutral-50"
                            title="Download"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Download
                          </a>
                          <button
                            type="button"
                            onClick={() => removeExisting(f.fileName)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md border border-neutral-300 hover:bg-neutral-50"
                            title="Remove"
                          >
                            <X className="w-3.5 h-3.5" />
                            Remove
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm text-neutral-600">
                    There’s no uploaded file yet.
                  </div>
                )}
              </div>
            </div>

            {/* Pending attachments */}
            <div className="rounded-xl border border-neutral-200">
              <div className="px-4 py-2 border-b border-neutral-200 text-sm font-semibold flex items-center justify-between">
                <span>Attach Files</span>
                <button
                  type="button"
                  onClick={pickFiles}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-sm border border-neutral-300 hover:bg-neutral-50"
                >
                  <Paperclip className="w-4 h-4" />
                  Attach file
                </button>
                <input
                  type="file"
                  className="hidden"
                  ref={inputRef}
                  multiple
                  onChange={onFileChange}
                />
              </div>

              <div className="p-4">
                {pendingFiles.length === 0 ? (
                  <div className="text-sm text-neutral-600">
                    No files selected.
                  </div>
                ) : (
                  <ul className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {pendingFiles.map((f, i) => (
                      <li
                        key={`${f.name}-${i}`}
                        className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 px-3 py-2"
                      >
                        <div className="truncate">
                          <div className="text-sm font-medium truncate">
                            {f.name}
                          </div>
                          <div className="text-xs text-neutral-500">
                            {(f.size / 1024).toFixed(1)} KB
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removePending(i)}
                          className="p-1 rounded-md hover:bg-neutral-100"
                          title="Remove"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 px-5 pb-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md border border-neutral-300 text-sm hover:bg-neutral-100"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={save}
              disabled={uploading || !hasChanges}
              className="px-4 py-2 rounded-md text-sm text-white shadow disabled:opacity-50"
              style={{ backgroundColor: MAROON }}
            >
              {uploading ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================ Main ============================ */
export default function AdviserEvents() {
  const [rows, setRows] = useState({
    titleDefense: [],
    manuscript: [],
    oralDefense: [],
    finalDefense: [],
    finalRedefense: [],
  });
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState(
    (searchParams.get("view") || "menu").toLowerCase()
  );
  const [defTab, setDefTab] = useState(
    (searchParams.get("tab") || "title").toLowerCase()
  );

  // Upload modal state
  const [uploadRow, setUploadRow] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await getAdviserEvents();
        const manus = (res.manuscript || []).map((m) => ({
          ...m,
          fileUrl: Array.isArray(m.fileUrl) ? m.fileUrl : [],
        }));
        if (alive) setRows({ ...res, manuscript: manus });
      } catch (e) {
        console.error("Failed to load events:", e);
        if (alive)
          setRows({
            titleDefense: [],
            manuscript: [],
            oralDefense: [],
            finalDefense: [],
            finalRedefense: [],
          });
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (view === "menu") next.delete("view");
    else next.set("view", view);
    if (view === "defenses") next.set("tab", defTab);
    else next.delete("tab");
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, defTab]);

  const Header = (
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
  );

  const CategoryCard = ({ title, icon: Icon, onClick }) => (
    <button
      onClick={onClick}
      className="w-[220px] h-[120px] rounded-xl border border-neutral-200 bg-white shadow hover:shadow-md text-left overflow-hidden"
    >
      <div className="h-full flex">
        <div className="w-2" style={{ backgroundColor: MAROON }} />
        <div className="flex-1 p-4 flex items-center gap-3">
          <Icon className="w-8 h-8 text-neutral-800" />
          <div className="text-[14px] font-semibold text-neutral-800">
            {title}
          </div>
        </div>
      </div>
    </button>
  );

  if (view === "menu") {
    return (
      <div className="space-y-4">
        {Header}
        <div className="flex gap-4">
          <CategoryCard
            title="Manuscript Results"
            icon={BookOpenCheck}
            onClick={() => setView("manuscript")}
          />
          <CategoryCard
            title="Capstone Defenses"
            icon={Presentation}
            onClick={() => setView("defenses")}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Header}

      {view === "manuscript" && (
        <section>
          <div className="flex items-center gap-2 mb-2">
            <BookOpenCheck className="w-5 h-5" color={MAROON} />
            <h2 className="text-[17px] font-semibold" style={{ color: MAROON }}>
              Manuscript Results
            </h2>
          </div>
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
                  <td className="py-2 pr-3">{to12h(r.time)}</td>
                  <td className="py-2 pr-3">{`${r.plag ?? 0}%`}</td>
                  <td className="py-2 pr-3">{`${r.ai ?? 0}%`}</td>

                  {/* Upload button + modal */}
                  <td className="py-2 pr-3">
                    <button
                      type="button"
                      onClick={() => setUploadRow(r)}
                      className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50"
                    >
                      <Paperclip className="w-4 h-4" />
                      Upload File
                    </button>
                  </td>

                  <td className="py-2 pr-6">
                    <Pill>{r.verdict}</Pill>
                  </td>
                </tr>
              ))}
            </tbody>
          </CardTable>

          {/* Upload Modal */}
          <UploadModal
            open={!!uploadRow}
            row={uploadRow}
            onClose={() => setUploadRow(null)}
            onSaved={(newList) => {
              setRows((prev) => ({
                ...prev,
                manuscript: (prev.manuscript || []).map((m) =>
                  m.id === uploadRow?.id ? { ...m, fileUrl: newList } : m
                ),
              }));
              setUploadRow((old) => (old ? { ...old, fileUrl: newList } : old));
            }}
          />
        </section>
      )}

      {view === "defenses" && (
        <>
          <div className="flex gap-2 mb-3">
            {[
              { key: "title", label: "Title Defense" },
              { key: "oral", label: "Oral Defense" },
              { key: "final", label: "Final Defense" },
              { key: "redef", label: "Final Re-Defense" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setDefTab(t.key)}
                className={`px-3 py-1.5 rounded-md text-sm border ${
                  defTab === t.key ? "text-white" : "text-neutral-700"
                }`}
                style={defTab === t.key ? { backgroundColor: MAROON } : {}}
              >
                {t.label}
              </button>
            ))}
          </div>

          {defTab === "title" && (
            <section>
              <div className="flex items-center gap-2 mb-2">
                <ClipboardList className="w-5 h-5" color={MAROON} />
                <h2
                  className="text-[17px] font-semibold"
                  style={{ color: MAROON }}
                >
                  Title Defense
                </h2>
              </div>
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
                    <tr
                      key={`td-${r.id}`}
                      className="border-t border-neutral-200"
                    >
                      <td className="py-2 pl-6 pr-3">{idx + 1}.</td>
                      <td className="py-2 pr-3">{r.teamName}</td>
                      <td className="py-2 pr-3">{r.date}</td>
                      <td className="py-2 pr-3">
                        {r.timeStart ? to12h(r.timeStart) : ""}
                      </td>
                      <td className="py-2 pr-3">
                        {Array.isArray(r.panelists)
                          ? r.panelists.join(", ")
                          : ""}
                      </td>
                      <td className="py-2 pr-6">
                        <Pill>{r.verdict}</Pill>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </CardTable>
            </section>
          )}

          {defTab === "oral" && (
            <section>
              <div className="flex items-center gap-2 mb-2">
                <Presentation className="w-5 h-5" color={MAROON} />
                <h2
                  className="text-[17px] font-semibold"
                  style={{ color: MAROON }}
                >
                  Oral Defense
                </h2>
              </div>
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
                    <tr
                      key={`od-${r.id}`}
                      className="border-t border-neutral-200"
                    >
                      <td className="py-2 pl-6 pr-3">{idx + 1}.</td>
                      <td className="py-2 pr-3">{r.teamName}</td>
                      <td className="py-2 pr-3">{r.title}</td>
                      <td className="py-2 pr-3">{r.date}</td>
                      <td className="py-2 pr-3">
                        {r.timeStart ? to12h(r.timeStart) : ""}
                      </td>
                      <td className="py-2 pr-3">
                        {Array.isArray(r.panelists)
                          ? r.panelists.join(", ")
                          : ""}
                      </td>
                      <td className="py-2 pr-6">
                        <Pill>{r.verdict}</Pill>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </CardTable>
            </section>
          )}

          {defTab === "final" && (
            <section>
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="w-5 h-5" color={MAROON} />
                <h2
                  className="text-[17px] font-semibold"
                  style={{ color: MAROON }}
                >
                  Final Defense
                </h2>
              </div>
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
                  {(rows.finalDefense || []).length ? (
                    rows.finalDefense.map((r, idx) => (
                      <tr
                        key={`fd-${r.id}`}
                        className="border-t border-neutral-200"
                      >
                        <td className="py-2 pl-6 pr-3">{idx + 1}.</td>
                        <td className="py-2 pr-3">{r.teamName}</td>
                        <td className="py-2 pr-3">{r.title}</td>
                        <td className="py-2 pr-3">{r.date}</td>
                        <td className="py-2 pr-3">
                          {r.timeStart ? to12h(r.timeStart) : ""}
                        </td>
                        <td className="py-2 pr-3">
                          {Array.isArray(r.panelists)
                            ? r.panelists.join(", ")
                            : ""}
                        </td>
                        <td className="py-2 pr-6">
                          <Pill>{r.verdict || "Pending"}</Pill>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="border-t border-neutral-200">
                      <td
                        className="py-6 text-center text-neutral-500"
                        colSpan={7}
                      >
                        No final defense items yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </CardTable>
            </section>
          )}

          {defTab === "redef" && (
            <section>
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="w-5 h-5" color={MAROON} />
                <h2
                  className="text-[17px] font-semibold"
                  style={{ color: MAROON }}
                >
                  Final Re-Defense
                </h2>
              </div>
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
                  {(rows.finalRedefense || []).length ? (
                    rows.finalRedefense.map((r, idx) => (
                      <tr
                        key={`frd-${r.id}`}
                        className="border-t border-neutral-200"
                      >
                        <td className="py-2 pl-6 pr-3">{idx + 1}.</td>
                        <td className="py-2 pr-3">{r.teamName}</td>
                        <td className="py-2 pr-3">{r.title}</td>
                        <td className="py-2 pr-3">{r.date}</td>
                        <td className="py-2 pr-3">
                          {r.timeStart ? to12h(r.timeStart) : ""}
                        </td>
                        <td className="py-2 pr-3">
                          {Array.isArray(r.panelists)
                            ? r.panelists.join(", ")
                            : ""}
                        </td>
                        <td className="py-2 pr-6">
                          <Pill>{r.verdict || "Pending"}</Pill>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="border-t border-neutral-200">
                      <td
                        className="py-6 text-center text-neutral-500"
                        colSpan={7}
                      >
                        No final re-defense items yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </CardTable>
            </section>
          )}
        </>
      )}
    </div>
  );
}
