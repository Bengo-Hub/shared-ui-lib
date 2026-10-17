'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { NoticeCard, type NoticeTone } from './notice-card';

/** One notice for NoticeCarousel. The id must stay the same for the same notice: dismissals key on it. */
export interface NoticeItem {
  id: string;
  title: string;
  summary?: string;
  tone?: NoticeTone;
  badge?: string;
  cta?: { label: string; href: string; external?: boolean };
  /** Small text under the summary, for example the date a notice was posted. */
  meta?: string;
}

export interface NoticeCarouselProps {
  notices: NoticeItem[];
  /**
   * Where dismissals are remembered on this device, for example `kra-notices:<tenant>:<viewer>`.
   * Include the viewer so two people on one browser do not hide each other's notices.
   */
  storageKey: string;
  /** How long each notice stays up before the next one slides in. Default 15 seconds. */
  rotateMs?: number;
  /** Notices can be dismissed unless this is false. */
  dismissible?: boolean;
  className?: string;
}

const DEFAULT_ROTATE_MS = 15_000;

function readDismissed(key: string): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

function writeDismissed(key: string, ids: string[]) {
  try {
    localStorage.setItem(key, JSON.stringify(ids));
  } catch {
    // storage unavailable: the dismissal lasts for this page view only
  }
}

/**
 * A list of notices shown one at a time in the shared NoticeCard, advancing by itself (paused while
 * the pointer is over it) with previous, next and dots when there is more than one. Each notice can
 * be dismissed; the dismissal is remembered on this device, per storageKey, and forgotten once the
 * notice is no longer in the list so the stored list never outgrows the live set. Renders nothing
 * when no notice is left. The caller owns ordering and expiry.
 */
export function NoticeCarousel({ notices, storageKey, rotateMs = DEFAULT_ROTATE_MS, dismissible = true, className = '' }: NoticeCarouselProps) {
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // Read after mount so the server render and the first client render agree.
  useEffect(() => {
    setDismissed(readDismissed(storageKey));
  }, [storageKey]);

  const visible = useMemo(() => notices.filter((n) => !dismissed.includes(n.id)), [notices, dismissed]);
  const count = visible.length;

  useEffect(() => {
    if (count < 2 || paused) return;
    const t = window.setInterval(() => setIndex((i) => (i + 1) % count), rotateMs);
    return () => window.clearInterval(t);
  }, [count, paused, rotateMs]);

  const current = count > 0 ? visible[index % count] : undefined;

  const dismiss = useCallback(() => {
    if (!current) return;
    const live = new Set(notices.map((n) => n.id));
    const next = [...dismissed.filter((id) => live.has(id)), current.id];
    setDismissed(next);
    writeDismissed(storageKey, next);
    setIndex(0);
  }, [current, dismissed, notices, storageKey]);

  if (!current) return null;
  const position = index % count;

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} aria-live="polite">
      <NoticeCard
        key={current.id}
        tone={current.tone ?? 'info'}
        badge={current.badge}
        title={current.title}
        summary={current.summary}
        meta={current.meta}
        cta={current.cta}
        clampSummary
        counter={count > 1 ? `${position + 1} of ${count}` : undefined}
        dismissible={dismissible}
        onDismiss={dismiss}
        className={className}
        footer={
          count > 1 ? (
            <>
              <button
                type="button"
                aria-label="Previous notice"
                onClick={() => setIndex((i) => (i - 1 + count) % count)}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <ChevronLeft className="size-4" />
              </button>
              {visible.map((n, i) => (
                <button
                  key={n.id}
                  type="button"
                  aria-label={`Show notice ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={`size-1.5 rounded-full ${i === position ? 'bg-primary' : 'bg-primary/30'}`}
                />
              ))}
              <button
                type="button"
                aria-label="Next notice"
                onClick={() => setIndex((i) => (i + 1) % count)}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <ChevronRight className="size-4" />
              </button>
            </>
          ) : undefined
        }
      />
    </div>
  );
}
