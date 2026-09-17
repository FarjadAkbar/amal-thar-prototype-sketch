"use client";

import { useState } from "react";
import { GOTH_SATTAR, pct, rs } from "@/lib/sim";
import type { SimResult } from "@/lib/sim/types";

export type UserNote = {
  id: string;
  week: number;
  text: string;
};

type Props = {
  result: SimResult;
  notes: UserNote[];
  onAddNote: (text: string) => void;
  onRemoveNote: (id: string) => void;
};

function Meter({
  label,
  from,
  to,
  good = "up",
  money = false,
}: {
  label: string;
  from: number;
  to: number;
  good?: "up" | "down";
  money?: boolean;
}) {
  const improved = good === "up" ? to > from + 0.15 : to < from - 0.15;
  const worsened = good === "up" ? to < from - 0.15 : to > from + 0.15;
  const width = money ? Math.min(100, (to / 50_000) * 100) : Math.min(100, to);
  const format = (n: number) => (money ? rs(n) : pct(n));

  return (
    <div className="meter">
      <div className="meter-top">
        <span>{label}</span>
        <strong className={improved ? "is-good" : worsened ? "is-bad" : ""}>
          {format(from)} → {format(to)}
        </strong>
      </div>
      <div className="meter-track">
        <span
          className="meter-base"
          style={{ width: `${money ? Math.min(100, (from / 50_000) * 100) : from}%` }}
        />
        <span
          className={`meter-now ${improved ? "is-good" : worsened ? "is-bad" : ""}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

export function ImpactDashboard({ result, notes, onAddNote, onRemoveNote }: Props) {
  const { derived } = result;
  const village = GOTH_SATTAR;
  const [draft, setDraft] = useState("");

  function addNote() {
    const text = draft.trim();
    if (!text) return;
    onAddNote(text);
    setDraft("");
  }

  return (
    <aside className="dashboard">
      <section className="panel">
        <h2>This week</h2>
        <p className="panel-lede">Numbers move slowly. A building is not a result.</p>
        <Meter label="Water" from={village.waterAccess} to={derived.waterAccess} />
        <Meter label="Jobs" from={village.employmentRate} to={derived.employmentRate} />
        <Meter label="Education" from={village.schoolAttendance} to={derived.weeklySchoolAttendance} />
        <Meter label="Health" from={village.healthAccess} to={derived.healthAccess} />
        <Meter label="Electricity" from={village.electricityAccess} to={derived.electricityAccess} />
        <Meter
          label="Household income"
          from={village.averageIncome}
          to={derived.averageIncome}
          money
        />
      </section>

      <section className="panel">
        <h2>Notes</h2>
        <p className="panel-lede">Write what you notice. Add as many as you need.</p>
        {notes.length > 0 && (
          <ul className="note-list">
            {notes.map((note) => (
              <li key={note.id}>
                <div className="note-head">
                  <span>Week {note.week}</span>
                  <button type="button" onClick={() => onRemoveNote(note.id)}>
                    Remove
                  </button>
                </div>
                <p>{note.text}</p>
              </li>
            ))}
          </ul>
        )}
        <label className="comment-field">
          New note
          <textarea
            rows={3}
            value={draft}
            placeholder="e.g. Girls miss school because of the 3-hour water walk."
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                addNote();
              }
            }}
          />
        </label>
        <button type="button" className="add-note" onClick={addNote} disabled={!draft.trim()}>
          Add note
        </button>
      </section>
    </aside>
  );
}
