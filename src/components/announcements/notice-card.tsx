'use client';

import { AlertTriangle, ArrowRight, ChevronDown, ChevronUp, Info, Megaphone, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';

export type NoticeTone = 'feature' | 'info' | 'warning';

export const NOTICE_TONES = {
  // A megaphone, not sparkles: sparkle icons read as "AI generated" to users.
  feature: { icon: Megaphone, badge: 'New', ring: 'border-primary/30', iconBox: 'bg-primary/10 text-primary', badgeCls: 'bg-primary text-primary-foreground' },
  info: { icon: Info, badge: 'Update', ring: 'border-sky-500/30', iconBox: 'bg-sky-500/10 text-sky-600 dark:text-sky-400', badgeCls: 'bg-sky-600 text-white' },
  warning: { icon: AlertTriangle, badge: 'Notice', ring: 'border-amber-500/40', iconBox: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', badgeCls: 'bg-amber-500 text-white' },
} as const;

export interface NoticeCardProps {
  tone?: NoticeTone;
  /** Overrides the tone's default badge text (New, Update, Notice). */
  badge?: string;
  title: string;
  summary?: string;
  /** Extra points shown under a "What's included" toggle. */
  highlights?: string[];
  cta?: { label: string; href: string; external?: boolean };
  /** Cut a long summary to three lines (the full text stays in the link target). */
  clampSummary?: boolean;
  /** Small text next to the title, for example "2 of 5". */
  counter?: string;
  /** Small muted text under the summary, for example the date and author of a notice. */
  meta?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  /** Controls such as previous and next, shown on the right below the dismiss button. */
  footer?: ReactNode;
  className?: string;
}

/**
 * The shared notice card: tone icon, badge, title, summary, optional highlights and link, and a
 * dismiss button. AnnouncementBanner (platform announcements) and NoticeCarousel (any list of
 * notices, such as KRA notices) both render it, so every notice in the apps looks the same.
 */
export function NoticeCard({
  tone = 'feature', badge, title, summary, highlights = [], cta, clampSummary, counter, meta, dismissible, onDismiss, footer, className = '',
}: NoticeCardProps) {
  const [expanded, setExpanded] = useState(false);
  const t = NOTICE_TONES[tone] ?? NOTICE_TONES.feature;
  const Icon = t.icon;
  const hasMore = highlights.length > 0;

  return (
    <section
      role="status"
      aria-label={title}
      className={`relative overflow-hidden rounded-2xl border ${t.ring} bg-card text-card-foreground shadow-sm ${className}`}
    >
      <div className="flex items-start gap-3 p-4 sm:gap-4 sm:p-5">
        <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${t.iconBox}`}>
          <Icon className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 pr-8">
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${t.badgeCls}`}>{badge ?? t.badge}</span>
            <h3 className="text-sm font-semibold sm:text-base">{title}</h3>
            {counter && <span className="text-xs text-muted-foreground">{counter}</span>}
          </div>
          {summary && <p className={`mt-1 text-sm text-muted-foreground ${clampSummary ? 'line-clamp-3' : ''}`}>{summary}</p>}
          {meta && <p className="mt-1 text-xs text-muted-foreground">{meta}</p>}

          {expanded && hasMore && (
            <ul className="mt-3 grid gap-1.5 text-sm sm:grid-cols-2">
              {highlights.map((h) => (
                <li key={h} className="flex items-start gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {cta && (
              <a
                href={cta.href}
                target={cta.external ? '_blank' : undefined}
                rel={cta.external ? 'noopener noreferrer' : undefined}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                {cta.label}
                <ArrowRight className="size-4" />
              </a>
            )}
            {hasMore && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                aria-expanded={expanded}
              >
                {expanded ? 'Show less' : "What's included"}
                {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
              </button>
            )}
            {footer && <div className="ml-auto flex items-center gap-1">{footer}</div>}
          </div>
        </div>
        {dismissible && onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss notice"
            className="absolute right-3 top-3 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
    </section>
  );
}
