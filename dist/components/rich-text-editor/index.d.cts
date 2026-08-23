import * as react_jsx_runtime from 'react/jsx-runtime';

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
}
/**
 * TinyMCE-equivalent rich text editor built on Tiptap. Controlled by `value` (HTML).
 * Emits sanitized HTML via `onChange`. Light-theme, tenant-branding-aware (semantic tokens).
 */
declare function RichTextEditor({ value, onChange, placeholder, disabled, className, id, }: RichTextEditorProps): react_jsx_runtime.JSX.Element;
/** Field-friendly alias mirroring the Input/Textarea naming used elsewhere. */
declare const RichText: typeof RichTextEditor;

export { RichText, RichTextEditor, type RichTextEditorProps };
