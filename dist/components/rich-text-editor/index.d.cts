import * as react_jsx_runtime from 'react/jsx-runtime';

/** A person (or anything) the editor can mention with @. */
interface MentionOption {
    /** Stored in the mention node as data-id (for people: the auth user id). */
    id: string;
    /** Shown in the list and in the text as @label (stored as data-label). */
    label: string;
    /** Second line in the list, e.g. an email or a role. Also searched. */
    description?: string;
}
/** Most options the suggestion list shows at once. */
declare const MENTION_LIMIT = 8;
/**
 * Options matching what was typed after @: labels where a word starts with the query come first,
 * then labels or descriptions that contain it. Case does not matter; an empty query lists the
 * first options. At most `limit` are returned.
 */
declare function filterMentions(options: readonly MentionOption[], query: string, limit?: number): MentionOption[];

/**
 * RichTextEditor — the platform's canonical Tiptap-based rich text editor.
 * Ported from erp-ui's local `rich-text-editor.tsx` so erp-ui, treasury-ui
 * (equity document templates), and future consumers share one implementation.
 *
 * Like the rest of shared-ui-lib, this ships raw Tailwind classNames using the
 * platform's semantic tokens (border-input, bg-background, text-foreground,
 * text-muted-foreground, bg-accent, text-primary, border-border, bg-muted…)
 * that the HOST app's Tailwind build resolves — the lib has no CSS pipeline of
 * its own, so consumers must include the lib's dist in their content globs.
 */
interface RichTextEditorProps {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    id?: string;
    /** Accessible name of the editable area (set it when no visible label points at it). */
    ariaLabel?: string;
    /** id of a visible label element that names the editable area. */
    ariaLabelledBy?: string;
    /** id of help or error text for the editable area. */
    ariaDescribedBy?: string;
    /**
     * People (or anything) the user can mention by typing @. Passing the prop at first render turns
     * mentions on; the list itself may change later (e.g. after it loads). A mention is stored as
     * `<span data-type="mention" data-id="{id}" data-label="{label}">@{label}</span>`, the one
     * mention format the services parse, so a host's sanitiser and read-only view must keep the
     * data-type, data-id and data-label attributes on span.
     */
    mentions?: MentionOption[];
}
/**
 * TinyMCE-equivalent rich text editor built on Tiptap. Controlled by `value` (HTML).
 * Emits sanitized HTML via `onChange`. Light-theme, tenant-branding-aware (semantic tokens).
 */
declare function RichTextEditor({ value, onChange, placeholder, disabled, className, id, ariaLabel, ariaLabelledBy, ariaDescribedBy, mentions, }: RichTextEditorProps): react_jsx_runtime.JSX.Element;
/** Field-friendly alias mirroring the Input/Textarea naming used elsewhere. */
declare const RichText: typeof RichTextEditor;

export { MENTION_LIMIT, type MentionOption, RichText, RichTextEditor, type RichTextEditorProps, filterMentions };
