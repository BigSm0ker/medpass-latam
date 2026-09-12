"use client";

import { useState } from "react";
import { BLOOD_TYPES, type BloodType, type Passport } from "@/schemas/passport";

/**
 * Lists are edited as one entry per line.
 *
 * A textarea is the honest control here: a patient listing three allergies
 * should not have to operate an add/remove widget, and Phase 3 needs the
 * entries separable for field-level consent, which a single blob would lose.
 */
function toLines(entries: string[]): string {
  return entries.join("\n");
}

function fromLines(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

const listFields = [
  {
    key: "allergies",
    label: "Critical allergies",
    hint: "One per line, e.g. Penicillin",
  },
  {
    key: "medications",
    label: "Current medications",
    hint: "One per line, with dose if known",
  },
  { key: "conditions", label: "Relevant conditions", hint: "One per line" },
] as const;

export function PassportForm({
  passport,
  saving,
  onSave,
}: {
  passport: Passport;
  saving: boolean;
  onSave: (passport: Passport) => Promise<{ ok: boolean; message?: string }>;
}) {
  // `passport` seeds the draft once. The caller re-mounts this component (via a
  // `key` tied to the saved record) when the stored passport changes, which
  // resets the draft without a synchronous setState inside an effect.
  const [draft, setDraft] = useState<Passport>(passport);
  const [feedback, setFeedback] = useState<{
    tone: "ok" | "error";
    message: string;
  } | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFeedback(null);
    const result = await onSave(draft);
    setFeedback(
      result.ok
        ? { tone: "ok", message: "Passport saved." }
        : { tone: "error", message: result.message ?? "Could not save." },
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <div className="grid gap-2 sm:max-w-xs">
        <label htmlFor="bloodType" className="text-sm font-semibold text-slate-700">
          Blood type
        </label>
        <select
          id="bloodType"
          value={draft.bloodType}
          onChange={(event) =>
            setDraft({ ...draft, bloodType: event.target.value as BloodType })
          }
          className="rounded-xl border border-slate-300 bg-white px-3 py-2"
        >
          {BLOOD_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {listFields.map((field) => (
        <div key={field.key} className="grid gap-2">
          <label htmlFor={field.key} className="text-sm font-semibold text-slate-700">
            {field.label}
          </label>
          <textarea
            id={field.key}
            rows={3}
            value={toLines(draft[field.key])}
            onChange={(event) =>
              setDraft({ ...draft, [field.key]: fromLines(event.target.value) })
            }
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono text-sm"
          />
          <p className="text-xs text-slate-500">{field.hint}</p>
        </div>
      ))}

      <fieldset className="grid gap-4 rounded-2xl border border-slate-200 p-4 sm:grid-cols-2">
        <legend className="px-1 text-sm font-semibold text-slate-700">
          Emergency contact
        </legend>
        <div className="grid gap-2">
          <label htmlFor="ecName" className="text-sm text-slate-600">
            Name
          </label>
          <input
            id="ecName"
            value={draft.emergencyContactName ?? ""}
            onChange={(event) =>
              setDraft({ ...draft, emergencyContactName: event.target.value || null })
            }
            className="rounded-xl border border-slate-300 bg-white px-3 py-2"
          />
        </div>
        <div className="grid gap-2">
          <label htmlFor="ecPhone" className="text-sm text-slate-600">
            Phone
          </label>
          <input
            id="ecPhone"
            inputMode="tel"
            value={draft.emergencyContactPhone ?? ""}
            onChange={(event) =>
              setDraft({ ...draft, emergencyContactPhone: event.target.value || null })
            }
            className="rounded-xl border border-slate-300 bg-white px-3 py-2"
          />
        </div>
      </fieldset>

      <div className="grid gap-2">
        <label htmlFor="notes" className="text-sm font-semibold text-slate-700">
          Notes
        </label>
        <textarea
          id="notes"
          rows={3}
          value={draft.notes ?? ""}
          onChange={(event) =>
            setDraft({ ...draft, notes: event.target.value || null })
          }
          className="rounded-xl border border-slate-300 bg-white px-3 py-2"
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-slate-950 px-5 py-2.5 font-semibold text-white disabled:opacity-40"
        >
          {saving ? "Saving…" : "Save passport"}
        </button>
        {feedback ? (
          <p
            role="status"
            className={
              feedback.tone === "ok"
                ? "text-sm font-medium text-emerald-700"
                : "text-sm font-medium text-red-700"
            }
          >
            {feedback.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
