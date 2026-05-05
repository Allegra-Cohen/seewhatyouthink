"use client";

import {
  Children,
  isValidElement,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

// =====================================================================
// Public marker components
// =====================================================================

type OptionProps = {
  row: number;
  id: string;
  /** Comma-separated ids that become available when this Option is picked. */
  opens?: string;
  children?: ReactNode;
};
type OutcomeProps = { id: string; children?: ReactNode };
type QuestionProps = { row: number; children?: ReactNode };
type OutcomeTextProps = { id: string; children?: ReactNode };
type TailProps = { children?: ReactNode };

// Option/Outcome/Question are zero-output markers. The parent identifies
// them by props shape (NOT reference) so they survive the RSC boundary.
//   Option:   row + id (+ optional open)  → a card in row N
//   Outcome:  id only                     → a terminal card
//   Question: row only                    → a prompt above row N
export function Option(props: OptionProps): null {
  void props;
  return null;
}
export function Outcome(props: OutcomeProps): null {
  void props;
  return null;
}
export function Question(props: QuestionProps): null {
  void props;
  return null;
}

// =====================================================================
// Cross-component store
//   DecisionTree is a child of the post; OutcomeText / Tail are siblings.
//   They can't share React context, so they coordinate through a small
//   module-level store. This means one tree per page works cleanly; if
//   you ever need multiple trees on a page, ids will collide and we'll
//   need to scope by tree.
// =====================================================================

type StoreState = {
  matchedOutcomeId: string | null;
  registeredOutcomeTextIds: Set<string>;
};

let state: StoreState = {
  matchedOutcomeId: null,
  registeredOutcomeTextIds: new Set(),
};
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

const store = {
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
  getState: () => state,
  setMatchedOutcomeId: (id: string | null) => {
    if (state.matchedOutcomeId === id) return;
    state = { ...state, matchedOutcomeId: id };
    notify();
  },
  registerOutcomeText: (id: string) => {
    if (state.registeredOutcomeTextIds.has(id)) return;
    const next = new Set(state.registeredOutcomeTextIds);
    next.add(id);
    state = { ...state, registeredOutcomeTextIds: next };
    notify();
  },
  unregisterOutcomeText: (id: string) => {
    if (!state.registeredOutcomeTextIds.has(id)) return;
    const next = new Set(state.registeredOutcomeTextIds);
    next.delete(id);
    state = { ...state, registeredOutcomeTextIds: next };
    notify();
  },
};

function useMatchedId(): string | null {
  return useSyncExternalStore(
    store.subscribe,
    () => store.getState().matchedOutcomeId,
    () => null
  );
}

function useTailVisible(): boolean {
  return useSyncExternalStore(
    store.subscribe,
    () => {
      const s = store.getState();
      return Boolean(
        s.matchedOutcomeId && s.registeredOutcomeTextIds.has(s.matchedOutcomeId)
      );
    },
    () => false
  );
}

// =====================================================================
// OutcomeText and Tail (live as MDX siblings of DecisionTree)
// =====================================================================

const PROSE_STYLE: React.CSSProperties = {
  marginTop: "2rem",
  fontFamily: "var(--font-garamond), Garamond, serif",
  fontSize: "clamp(14pt, 1.2vw, 20pt)",
  lineHeight: 1.5,
};

export function OutcomeText({ id, children }: OutcomeTextProps) {
  const matched = useMatchedId();
  useEffect(() => {
    store.registerOutcomeText(id);
    return () => store.unregisterOutcomeText(id);
  }, [id]);
  if (matched !== id) return null;
  return (
    <div className="decision-row-in" style={PROSE_STYLE}>
      {children}
    </div>
  );
}

export function Tail({ children }: TailProps) {
  const visible = useTailVisible();
  if (!visible) return null;
  return (
    <div className="decision-row-in" style={PROSE_STYLE}>
      {children}
    </div>
  );
}

// =====================================================================
// DecisionTree: parsing, state, layout, paths
// =====================================================================

type ParsedOption = {
  row: number;
  id: string;
  opens: string[];
  content: ReactNode;
};
type ParsedOutcome = { id: string; content: ReactNode };
type ParsedRow = {
  rowNumber: number;
  options: ParsedOption[];
  question: ReactNode | null;
};

const COLOR_SELECTED = "#7346cf"; // purple
const COLOR_OUTCOME = "#4b830d"; // green
const COLOR_PATH = "#b0b0b0"; // light gray — drawn only after the user
                              // reaches an outcome
const COLOR_IDLE = "rgba(0,0,0,0.18)";

type Segment = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

function segmentsEqual(a: Segment[], b: Segment[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const x = a[i];
    const y = b[i];
    if (x.x1 !== y.x1 || x.y1 !== y.y1 || x.x2 !== y.x2 || x.y2 !== y.y2)
      return false;
  }
  return true;
}

function renderQuestion(question: ReactNode) {
  return (
    <div
      className="mb-4"
      style={{
        fontFamily: "var(--font-garamond), Garamond, serif",
        fontSize: "clamp(14pt, 1.2vw, 20pt)",
        lineHeight: 1.4,
        fontWeight: 700,
        opacity: 0.85,
        textAlign: "left",
      }}
    >
      {question}
    </div>
  );
}

function parseOpens(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseChildren(children: ReactNode): {
  rows: ParsedRow[];
  outcomesById: Map<string, ParsedOutcome>;
  optionsById: Map<string, ParsedOption>;
} {
  const options: ParsedOption[] = [];
  const outcomes: ParsedOutcome[] = [];
  const questionsByRow = new Map<number, ReactNode>();

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    const props = child.props as Partial<
      OptionProps & OutcomeProps & QuestionProps
    >;
    // Option: has both row and id (opens is optional)
    if (props.row != null && props.id != null) {
      options.push({
        row: Number(props.row),
        id: String(props.id),
        opens: parseOpens(props.opens),
        content: props.children,
      });
    }
    // Outcome: id only, no row
    else if (props.id != null && props.row == null) {
      outcomes.push({ id: String(props.id), content: props.children });
    }
    // Question: row only, no id
    else if (props.row != null && props.id == null) {
      questionsByRow.set(Number(props.row), props.children);
    }
  });

  const optionsByRow = new Map<number, ParsedOption[]>();
  options.forEach((opt) => {
    if (!optionsByRow.has(opt.row)) optionsByRow.set(opt.row, []);
    optionsByRow.get(opt.row)!.push(opt);
  });

  // A row exists if it has either Options or a Question. This lets a writer
  // declare a question above a row even when there are no Option cards in
  // that row (e.g., a final-row question that sits above the outcome card).
  const allRowNumbers = new Set<number>([
    ...optionsByRow.keys(),
    ...questionsByRow.keys(),
  ]);
  const rows: ParsedRow[] = Array.from(allRowNumbers)
    .sort((a, b) => a - b)
    .map((rowNumber) => ({
      rowNumber,
      options: optionsByRow.get(rowNumber) ?? [],
      question: questionsByRow.get(rowNumber) ?? null,
    }));

  const outcomesById = new Map(outcomes.map((o) => [o.id, o]));
  const optionsById = new Map(options.map((o) => [o.id, o]));

  return { rows, outcomesById, optionsById };
}

export function DecisionTree({ children }: { children: ReactNode }) {
  const { rows, outcomesById, optionsById } = useMemo(
    () => parseChildren(children),
    [children]
  );

  // selections: map row → picked option id
  // We use an array keyed by sortedRowKeys index (the rows array) so the
  // ordering matches `rows` exactly.
  const [selections, setSelections] = useState<(string | null)[]>(() =>
    new Array(rows.length).fill(null)
  );

  // If the tree shape changes between renders, pad/truncate selections.
  const safeSelections =
    selections.length === rows.length
      ? selections
      : Array.from({ length: rows.length }, (_, i) => selections[i] ?? null);

  // The "opened" set: union of `opens` arrays for every currently-picked
  // Option. Drives both row-K visibility (an option in row K is shown when
  // its id is opened, with row 1 always shown) and outcome visibility.
  const openedIds = useMemo(() => {
    const set = new Set<string>();
    for (let i = 0; i < safeSelections.length; i++) {
      const pickedId = safeSelections[i];
      if (!pickedId) continue;
      const opt = optionsById.get(pickedId);
      if (!opt) continue;
      opt.opens.forEach((id) => set.add(id));
    }
    return set;
  }, [safeSelections, optionsById]);

  // Matched outcome: walk picks in row order, the deepest pick whose
  // `opens` contains an Outcome id wins. If no pick opens an outcome, no
  // match.
  const matchedOutcomeId = useMemo(() => {
    let id: string | null = null;
    for (let i = 0; i < safeSelections.length; i++) {
      const pickedId = safeSelections[i];
      if (!pickedId) continue;
      const opt = optionsById.get(pickedId);
      if (!opt) continue;
      for (const target of opt.opens) {
        if (outcomesById.has(target)) {
          id = target;
          break;
        }
      }
    }
    return id;
  }, [safeSelections, optionsById, outcomesById]);

  const matchedOutcome = matchedOutcomeId
    ? outcomesById.get(matchedOutcomeId) ?? null
    : null;

  // Push matched id to the cross-component store so OutcomeText / Tail
  // (which are MDX siblings, not children) can react.
  useEffect(() => {
    store.setMatchedOutcomeId(matchedOutcomeId);
  }, [matchedOutcomeId]);

  // ---- path drawing (only active once an outcome has been reached) ----
  const cardRefs = useRef<Map<string, HTMLElement | null>>(new Map());
  const setCardRef = (key: string) => (el: HTMLElement | null) => {
    if (el) cardRefs.current.set(key, el);
    else cardRefs.current.delete(key);
  };
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });

  const latest = useRef({ selections: safeSelections, matchedOutcomeId });
  useLayoutEffect(() => {
    latest.current = { selections: safeSelections, matchedOutcomeId };
  });

  function recompute() {
    const container = containerRef.current;
    if (!container) return;
    const cRect = container.getBoundingClientRect();
    setContainerSize((prev) =>
      prev.w === cRect.width && prev.h === cRect.height
        ? prev
        : { w: cRect.width, h: cRect.height }
    );

    const { selections: sel, matchedOutcomeId: outId } = latest.current;
    // Only draw paths once the user has reached an outcome.
    if (!outId) {
      setSegments((prev) => (prev.length === 0 ? prev : []));
      return;
    }

    const segs: Segment[] = [];
    // Inter-row paths between consecutive picks.
    for (let i = 0; i < sel.length - 1; i++) {
      const a = sel[i];
      const b = sel[i + 1];
      if (!a || !b) continue;
      const elA = cardRefs.current.get(`r${i}-${a}`);
      const elB = cardRefs.current.get(`r${i + 1}-${b}`);
      if (!elA || !elB) continue;
      const rA = elA.getBoundingClientRect();
      const rB = elB.getBoundingClientRect();
      segs.push({
        x1: rA.left + rA.width / 2 - cRect.left,
        y1: rA.bottom - cRect.top,
        x2: rB.left + rB.width / 2 - cRect.left,
        y2: rB.top - cRect.top,
      });
    }
    // Final connector to the outcome card.
    let deepestRow = -1;
    for (let i = 0; i < sel.length; i++) {
      const pickedId = sel[i];
      if (!pickedId) continue;
      const opt = optionsById.get(pickedId);
      if (opt?.opens.includes(outId)) deepestRow = i;
    }
    if (deepestRow >= 0) {
      const elLast = cardRefs.current.get(
        `r${deepestRow}-${sel[deepestRow]!}`
      );
      const elOut = cardRefs.current.get(`o-${outId}`);
      if (elLast && elOut) {
        const rL = elLast.getBoundingClientRect();
        const rO = elOut.getBoundingClientRect();
        segs.push({
          x1: rL.left + rL.width / 2 - cRect.left,
          y1: rL.bottom - cRect.top,
          x2: rO.left + rO.width / 2 - cRect.left,
          y2: rO.top - cRect.top,
        });
      }
    }
    setSegments((prev) => (segmentsEqual(prev, segs) ? prev : segs));
  }

  useLayoutEffect(() => {
    recompute();
    // recompute reads from refs — intentionally not in deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeSelections, matchedOutcomeId]);

  useEffect(() => {
    const handler = () => recompute();
    window.addEventListener("resize", handler);
    const ro = new ResizeObserver(handler);
    const node = containerRef.current;
    if (node) ro.observe(node);
    return () => {
      window.removeEventListener("resize", handler);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function selectCard(rowIdx: number, id: string) {
    setSelections((prev) => {
      const padded =
        prev.length === rows.length
          ? [...prev]
          : Array.from(
              { length: rows.length },
              (_, i) => prev[i] ?? null
            );
      padded[rowIdx] = padded[rowIdx] === id ? null : id;
      // Clear later rows on backtrack so a previously-picked deep option
      // doesn't leak into a newly-chosen short branch.
      for (let i = rowIdx + 1; i < padded.length; i++) padded[i] = null;
      return padded;
    });
  }

  if (rows.length === 0) {
    return (
      <div style={{ opacity: 0.6, fontStyle: "italic" }}>
        DecisionTree: add &lt;Option&gt; and &lt;Outcome&gt; children.
      </div>
    );
  }

  return (
    <div className="my-8" style={{ fontFamily: "var(--font-lato)" }}>
      {/* SVG sits in its own 0-height positioned wrapper so the cards
          container stays unpositioned (Footnotes inside cards anchor
          properly to the post layout grid). */}
      <div style={{ position: "relative", height: 0 }}>
        <svg
          aria-hidden
          width={containerSize.w}
          height={containerSize.h}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            pointerEvents: "none",
            overflow: "visible",
          }}
        >
          {segments.map((p, i) => {
            const midY = (p.y1 + p.y2) / 2;
            return (
              <path
                key={i}
                d={`M ${p.x1} ${p.y1} C ${p.x1} ${midY}, ${p.x2} ${midY}, ${p.x2} ${p.y2}`}
                stroke={COLOR_PATH}
                strokeWidth={2}
                fill="none"
                strokeLinecap="round"
                style={{
                  opacity: 0,
                  animation: "decision-path-in 0.5s ease forwards",
                }}
              />
            );
          })}
        </svg>
      </div>

      <div ref={containerRef}>
        {rows.map((row, rowIdx) => {
          const hasOptions = row.options.length > 0;

          // Question-only rows (no Options at all in the source) are the
          // "outcome row's caption": they render only when an outcome card
          // has been reached AND the previous row was actually traversed.
          // The previous-row check keeps the question from showing when a
          // shorter terminal branch (e.g., row 1 → outcome) skips past
          // this row's context — the row's question would dangle without
          // its prerequisite below it.
          if (!hasOptions) {
            if (!matchedOutcome || !row.question) return null;
            if (rowIdx > 0 && safeSelections[rowIdx - 1] == null) return null;
            return (
              <div key={row.rowNumber} className="mb-4 decision-row-in">
                {renderQuestion(row.question)}
              </div>
            );
          }

          // Option rows: reachable when row 0 OR previous row has a pick.
          const reachable =
            rowIdx === 0 || safeSelections[rowIdx - 1] != null;
          if (!reachable) return null;

          // Visible options: row 0 shows all; deeper rows show only options
          // whose id has been opened by an earlier pick.
          const visibleOptions =
            rowIdx === 0
              ? row.options
              : row.options.filter((opt) => openedIds.has(opt.id));
          if (visibleOptions.length === 0) return null;

          return (
            <div key={row.rowNumber} className="mb-12 decision-row-in">
              {row.question && renderQuestion(row.question)}
              <div className="flex flex-wrap justify-center gap-4">
                  {visibleOptions.map((opt) => {
                    const selected = safeSelections[rowIdx] === opt.id;
                    return (
                      <button
                        key={opt.id}
                        ref={setCardRef(`r${rowIdx}-${opt.id}`)}
                        onClick={() => selectCard(rowIdx, opt.id)}
                        aria-pressed={selected}
                        className="
                          cursor-pointer text-left
                          rounded-lg px-5 py-4
                          transition-all
                        "
                        style={{
                          flex: "1 1 0",
                          minWidth: "16rem",
                          maxWidth: "26rem",
                          minHeight: "6rem",
                          border: `2px solid ${
                            selected ? COLOR_SELECTED : COLOR_IDLE
                          }`,
                          background: selected
                            ? "rgba(115, 70, 207, 0.08)"
                            : "rgba(255, 255, 255, 0.4)",
                          color: selected
                            ? COLOR_SELECTED
                            : "var(--foreground)",
                          fontFamily:
                            "var(--font-garamond), Garamond, serif",
                          fontSize: "clamp(14pt, 1.2vw, 20pt)",
                          lineHeight: 1.4,
                          boxShadow: selected
                            ? "0 2px 12px rgba(115, 70, 207, 0.18)"
                            : "0 1px 3px rgba(0,0,0,0.04)",
                        }}
                      >
                        {opt.content}
                      </button>
                    );
                  })}
              </div>
            </div>
          );
        })}

        {matchedOutcome && (
          <div
            key={matchedOutcome.id}
            className="flex justify-center pt-2 decision-row-in"
          >
            <div
              ref={setCardRef(`o-${matchedOutcome.id}`)}
              className="rounded-lg px-5 py-4 transition-all"
              style={{
                minWidth: "14rem",
                maxWidth: "22rem",
                minHeight: "4.5rem",
                border: `2px solid ${COLOR_OUTCOME}`,
                background: "rgba(75, 131, 13, 0.08)",
                color: COLOR_OUTCOME,
                textAlign: "center",
                fontFamily: "var(--font-garamond), Garamond, serif",
                fontSize: "clamp(14pt, 1.2vw, 20pt)",
                lineHeight: 1.4,
                boxShadow: "0 2px 12px rgba(75, 131, 13, 0.18)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {matchedOutcome.content}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes decision-path-in {
          from { opacity: 0; stroke-dashoffset: 200; }
          to   { opacity: 0.9; stroke-dashoffset: 0; }
        }
        @keyframes decision-row-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .decision-row-in {
          animation: decision-row-in 0.35s ease forwards;
        }
      `}</style>
    </div>
  );
}
