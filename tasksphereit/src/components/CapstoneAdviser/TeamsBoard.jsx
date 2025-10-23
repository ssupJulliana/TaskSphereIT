import React, { useMemo, useState } from "react";
import {
  LayoutList,
  StickyNote,
  ChevronRight,
  ChevronLeft,
  Paperclip,
  Trash2,
  Send,
} from "lucide-react";

const MAROON = "#6A0F14";

/* --------------------------- SAMPLE DATA --------------------------- */
const COLUMNS = [
  { id: "todo", title: "To Do", color: "#F5B700" },
  { id: "inprogress", title: "In Progress", color: "#7C9C3B" },
  { id: "review", title: "To Review", color: "#6FA8DC" },
  { id: "missed", title: "Missed Task", color: "#D11A2A" },
];

const CARDS = [
  // To Do
  {
    id: "c1",
    column: "todo",
    team: "Bernardo, Et Al",
    chapter: "Chapter 2",
    revision: "1st Revision",
    due: "Feb 2, 2025",
    status: "To Do",
    methodology: "Agile",
    phase: "Design",
    subtask: "Chapter 1",
    elements: "Introduction",
    created: "10/10/2025",
    time: "10:00 AM",
  },
  {
    id: "c2",
    column: "todo",
    team: "Aguas, Et Al",
    chapter: "Chapter 4",
    revision: "No Revision",
    due: "Feb 25, 2025",
    status: "To Do",
    methodology: "Agile",
    phase: "Design",
    subtask: "—",
    elements: "—",
    created: "10/10/2025",
    time: "10:00 AM",
  },
  {
    id: "c3",
    column: "todo",
    team: "Mendoza, Et Al",
    chapter: "Chapter 4",
    revision: "No Revision",
    due: "Feb 25, 2025",
    status: "To Do",
    methodology: "Agile",
    phase: "Design",
    subtask: "—",
    elements: "—",
    created: "10/10/2025",
    time: "10:00 AM",
  },
  // In Progress
  {
    id: "c4",
    column: "inprogress",
    team: "Mendoza, Et Al",
    chapter: "Chapter 3",
    revision: "No Revision",
    due: "Feb 20, 2025",
    status: "In Progress",
    methodology: "Agile",
    phase: "Design",
    subtask: "Scope",
    elements: "—",
    created: "10/10/2025",
    time: "10:00 AM",
  },
  // To Review
  {
    id: "c5",
    column: "review",
    team: "Aguas, Et Al",
    chapter: "Chapter 3",
    revision: "No Revision",
    due: "Feb 20, 2025",
    status: "To Review",
    methodology: "Agile",
    phase: "Design",
    subtask: "—",
    elements: "—",
    created: "10/10/2025",
    time: "10:00 AM",
  },
  // Missed
  {
    id: "c6",
    column: "missed",
    team: "Bernardo, Et Al",
    chapter: "Chapter 1",
    revision: "2nd Revision",
    due: "Feb 2, 2025",
    status: "Missed",
    methodology: "Agile",
    phase: "Design",
    subtask: "—",
    elements: "—",
    created: "10/10/2025",
    time: "10:00 AM",
  },
];

const COMMENTS = [
  {
    id: "m1",
    author: "Grayson B Tolentino",
    text: "Make sure to include the minimum and recommended requirements for your software.",
    ts: "February 10, 2025 at 3:00 PM",
  },
  {
    id: "m2",
    author: "Xavielle Ellie Y Aguas",
    text: "Good evening, sir. Yes, we'll take note of that.",
    ts: "February 10, 2025 at 6:00 PM",
  },
  {
    id: "m3",
    author: "Xavielle Ellie Y Aguas",
    text:
      "Good afternoon, sir. We have already completed Chapter 3. Attached is the file of our documentation. Thank you.",
    ts: "February 18, 2025 at 12:00 PM",
    attachment: "AguasEtAl_Chapter3.pdf",
  },
];

/* ---------------------------- UI PRIMS ---------------------------- */
const cardShell =
  "bg-white border border-neutral-200 rounded-lg shadow-sm hover:shadow transition-shadow";

function Column({ title, color, children }) {
  // fixed header + scrollable body
  return (
    <div className="flex flex-col w-[280px] bg-white border border-neutral-200 rounded-xl shadow">
      <div
        className="px-4 py-3 rounded-t-xl text-white text-sm font-semibold"
        style={{ backgroundColor: color }}
      >
        {title}
      </div>
      {/* min-h-0 ensures the body can shrink and become scrollable */}
      <div className="flex-1 min-h-0">
        <div className="h-full overflow-y-auto px-3 py-3 space-y-3">{children}</div>
      </div>
    </div>
  );
}

function KanbanCard({ data, onOpen }) {
  return (
    <div className={`${cardShell}`}>
      <div className="p-3">
        <div className="flex items-start justify-between">
          <div className="font-semibold text-sm">{data.team}</div>
          <button
            onClick={() => onOpen(data)}
            className="p-1 rounded hover:bg-neutral-100"
            aria-label="Open detail"
          >
            <StickyNote className="w-4 h-4 text-neutral-600" />
          </button>
        </div>

        <div className="mt-2 text-sm">
          <div className="text-neutral-800">{data.chapter}</div>
          <div className="text-neutral-500">{data.revision}</div>
        </div>

        <div className="mt-3 text-xs text-neutral-700 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
          <span className="px-2 py-1 rounded border border-neutral-200 bg-neutral-50">
            {data.due}
          </span>
        </div>
      </div>
    </div>
  );
}

/* --------------------------- DETAIL VIEW --------------------------- */
function DetailView({ card, onBack }) {
  const comments = useMemo(() => COMMENTS, []);
  const [tab, setTab] = useState("comments"); // comments | attachments
  const [draft, setDraft] = useState("");

  return (
    <div className="space-y-4">
      {/* breadcrumb */}
      <div className="flex items-center gap-2">
        <LayoutList className="w-5 h-5" />
        <span className="font-semibold">Teams Board</span>
        <ChevronRight className="w-4 h-4 text-neutral-500" />
        <span className="font-semibold">{card.team}</span>
      </div>
      <div className="h-[2px] w-full" style={{ backgroundColor: MAROON }} />

      <button
        onClick={onBack}
        className="inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-md border border-neutral-300 hover:bg-neutral-100"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Board
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* LEFT: meta */}
        <div className="bg-white border border-neutral-200 rounded-xl shadow p-4">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold">{card.chapter}</div>
            <span
              className="text-sm font-semibold px-3 py-1 rounded-full text-white"
              style={{
                backgroundColor:
                  card.status === "To Review"
                    ? "#6FA8DC"
                    : card.status === "In Progress"
                    ? "#7C9C3B"
                    : card.status === "Missed"
                    ? "#D11A2A"
                    : "#F5B700",
              }}
            >
              {card.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-y-2 gap-x-6 mt-4 text-sm">
            <Field label="Tasks" value="Refine" />
            <Field label="Subtasks" value={card.subtask} />
            <Field label="Elements" value={card.elements} />
            <Field label="Date Created" value={card.created} />
            <Field label="Due Date" value={card.due} />
            <Field label="Time" value={card.time} />
            <Field label="Revision NO" value={card.revision} />
            <Field label="Methodology" value={card.methodology} />
            <Field label="Project Phase" value={card.phase} />
          </div>
        </div>

        {/* RIGHT: comments + attachments */}
        <div className="bg-white border border-neutral-200 rounded-xl shadow p-0 overflow-hidden">
          <div className="px-4 pt-3">
            <div className="flex gap-6 text-sm">
              <button
                onClick={() => setTab("comments")}
                className={`pb-2 font-medium border-b-2 ${
                  tab === "comments" ? "border-neutral-800" : "border-transparent text-neutral-500"
                }`}
              >
                Comments
              </button>
              <button
                onClick={() => setTab("attachments")}
                className={`pb-2 font-medium border-b-2 ${
                  tab === "attachments" ? "border-neutral-800" : "border-transparent text-neutral-500"
                }`}
              >
                Attachment
              </button>
            </div>
          </div>

          <div className="h-[1px] bg-neutral-200" />

          {/* composer */}
          <div className="p-4">
            <div className="rounded-lg border border-neutral-300 overflow-hidden">
              <div className="px-3 py-2 border-b border-neutral-200 text-sm font-medium">
                Grayson B Tolentino
              </div>
              <div className="p-3 relative">
                <textarea
                  rows={3}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Leave a comment"
                  className="w-full resize-none outline-none text-sm"
                />
                <div className="flex items-center gap-2 absolute right-3 bottom-3">
                  <button className="p-1.5 rounded hover:bg-neutral-100" title="Attach">
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDraft("")}
                    className="p-1.5 rounded hover:bg-neutral-100"
                    title="Clear"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDraft("")}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-white"
                    style={{ backgroundColor: MAROON }}
                  >
                    <Send className="w-4 h-4" />
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* list area (scrolls if long) */}
          <div className="px-4 pb-4 max-h-[360px] overflow-y-auto space-y-4">
            {tab === "comments" ? (
              comments.map((c) => (
                <div key={c.id} className="text-sm">
                  <div className="font-semibold">{c.author}</div>
                  <div className="text-neutral-500">{c.ts}</div>
                  <div className="mt-1">{c.text}</div>
                  {c.attachment && (
                    <div className="mt-2 inline-flex items-center gap-2 text-xs px-2 py-1 border rounded bg-neutral-50">
                      <Paperclip className="w-3 h-3" />
                      {c.attachment}
                    </div>
                  )}
                  <div className="mt-1 text-xs text-neutral-500 flex gap-4">
                    <button className="hover:underline">Edit</button>
                    <button className="hover:underline">Delete</button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-neutral-600">
                No attachments yet. Upload one from the composer above.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="text-neutral-500">{label}</div>
      <div className="font-medium text-neutral-800">{value}</div>
    </div>
  );
}

/* ------------------------------ MAIN ------------------------------ */
const TeamsBoard = () => {
  const [selected, setSelected] = useState(null); // card object

  // group cards by column id
  const grouped = useMemo(() => {
    const map = Object.fromEntries(COLUMNS.map((c) => [c.id, []]));
    for (const card of CARDS) map[card.column].push(card);
    return map;
  }, []);

  if (selected) {
    return <DetailView card={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div className="space-y-4 min-h-0">
      <div className="flex items-center gap-2">
        <LayoutList className="w-5 h-5" />
        <h2 className="text-lg font-semibold">Teams Board</h2>
      </div>
      <div className="h-[2px] w-full" style={{ backgroundColor: MAROON }} />

      {/* columns container: makes columns stretch full height and let inner bodies scroll */}
      <div className="min-h-[520px] max-h-[70vh]">
        <div className="h-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {COLUMNS.map((col) => (
            <Column key={col.id} title={col.title} color={col.color}>
              {grouped[col.id].map((card) => (
                <KanbanCard key={card.id} data={card} onOpen={setSelected} />
              ))}
            </Column>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamsBoard;
