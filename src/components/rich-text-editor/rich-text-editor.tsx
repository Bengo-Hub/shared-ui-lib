'use client';

import Link from '@tiptap/extension-link';
import { EditorContent, useEditor, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link2,
  Link2Off,
  List,
  ListOrdered,
  Redo2,
  Strikethrough,
  Undo2,
  type LucideIcon,
} from 'lucide-react';
import { useCallback, useEffect } from 'react';

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
export interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

function ToolbarButton({
  icon: Icon,
  label,
  active,
  disabled,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      title={label}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cx(
        'inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-40',
        active && 'bg-primary/10 text-primary',
      )}
    >
      <Icon className="size-4" aria-hidden />
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const setLink = useCallback(() => {
    const prev = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Link URL', prev ?? 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/30 p-1.5">
      <ToolbarButton icon={Bold} label="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} />
      <ToolbarButton icon={Italic} label="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} />
      <ToolbarButton icon={Strikethrough} label="Strikethrough" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} />
      <span className="mx-1 h-5 w-px bg-border" aria-hidden />
      <ToolbarButton icon={Heading2} label="Heading" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
      <ToolbarButton icon={Heading3} label="Subheading" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} />
      <span className="mx-1 h-5 w-px bg-border" aria-hidden />
      <ToolbarButton icon={List} label="Bullet list" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} />
      <ToolbarButton icon={ListOrdered} label="Numbered list" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
      <span className="mx-1 h-5 w-px bg-border" aria-hidden />
      <ToolbarButton icon={Link2} label="Add link" active={editor.isActive('link')} onClick={setLink} />
      <ToolbarButton icon={Link2Off} label="Remove link" disabled={!editor.isActive('link')} onClick={() => editor.chain().focus().unsetLink().run()} />
      <span className="mx-1 h-5 w-px bg-border" aria-hidden />
      <ToolbarButton icon={Undo2} label="Undo" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()} />
      <ToolbarButton icon={Redo2} label="Redo" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()} />
    </div>
  );
}

/**
 * TinyMCE-equivalent rich text editor built on Tiptap. Controlled by `value` (HTML).
 * Emits sanitized HTML via `onChange`. Light-theme, tenant-branding-aware (semantic tokens).
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder,
  disabled,
  className,
  id,
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    editable: !disabled,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        // Use our own Link config below (safe protocols + branded styling).
        link: false,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        // Only allow safe schemes — strips javascript:/data: etc.
        protocols: ['http', 'https', 'mailto'],
        HTMLAttributes: { rel: 'noopener noreferrer nofollow', class: 'text-primary underline' },
      }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: cx(
          'prose-editor min-h-[140px] w-full px-3 py-2 text-sm text-foreground focus:outline-none',
          disabled && 'cursor-not-allowed opacity-60',
        ),
        ...(placeholder ? { 'data-placeholder': placeholder } : {}),
      },
    },
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      // tiptap emits "<p></p>" for an empty doc — normalize to "".
      onChange(html === '<p></p>' ? '' : html);
    },
  });

  // Keep external value changes in sync (e.g. opening an edit dialog).
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const next = value || '';
    if (next !== current && !(next === '' && current === '<p></p>')) {
      editor.commands.setContent(next, { emitUpdate: false });
    }
  }, [value, editor]);

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [disabled, editor]);

  if (!editor) {
    return (
      <div className={cx('rounded-lg border border-input bg-background', className)}>
        <div className="h-[180px] animate-pulse rounded-lg bg-muted/40" />
      </div>
    );
  }

  return (
    <div
      id={id}
      className={cx(
        'overflow-hidden rounded-lg border border-input bg-background shadow-sm focus-within:ring-1 focus-within:ring-ring',
        className,
      )}
    >
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

/** Field-friendly alias mirroring the Input/Textarea naming used elsewhere. */
export const RichText = RichTextEditor;
