import Link from '@tiptap/extension-link';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, Strikethrough, Heading2, Heading3, List, ListOrdered, Link2, Link2Off, Undo2, Redo2 } from 'lucide-react';
import { useEffect, useCallback } from 'react';
import { jsx, jsxs } from 'react/jsx-runtime';

// src/components/rich-text-editor/rich-text-editor.tsx
function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}
function ToolbarButton({
  icon: Icon,
  label,
  active,
  disabled,
  onClick
}) {
  return /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      "aria-label": label,
      "aria-pressed": active,
      title: label,
      disabled,
      onMouseDown: (e) => e.preventDefault(),
      onClick,
      className: cx(
        "inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-40",
        active && "bg-primary/10 text-primary"
      ),
      children: /* @__PURE__ */ jsx(Icon, { className: "size-4", "aria-hidden": true })
    }
  );
}
function Toolbar({ editor }) {
  const setLink = useCallback(() => {
    const prev = editor.getAttributes("link").href;
    const url = window.prompt("Link URL", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/30 p-1.5", children: [
    /* @__PURE__ */ jsx(ToolbarButton, { icon: Bold, label: "Bold", active: editor.isActive("bold"), onClick: () => editor.chain().focus().toggleBold().run() }),
    /* @__PURE__ */ jsx(ToolbarButton, { icon: Italic, label: "Italic", active: editor.isActive("italic"), onClick: () => editor.chain().focus().toggleItalic().run() }),
    /* @__PURE__ */ jsx(ToolbarButton, { icon: Strikethrough, label: "Strikethrough", active: editor.isActive("strike"), onClick: () => editor.chain().focus().toggleStrike().run() }),
    /* @__PURE__ */ jsx("span", { className: "mx-1 h-5 w-px bg-border", "aria-hidden": true }),
    /* @__PURE__ */ jsx(ToolbarButton, { icon: Heading2, label: "Heading", active: editor.isActive("heading", { level: 2 }), onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run() }),
    /* @__PURE__ */ jsx(ToolbarButton, { icon: Heading3, label: "Subheading", active: editor.isActive("heading", { level: 3 }), onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run() }),
    /* @__PURE__ */ jsx("span", { className: "mx-1 h-5 w-px bg-border", "aria-hidden": true }),
    /* @__PURE__ */ jsx(ToolbarButton, { icon: List, label: "Bullet list", active: editor.isActive("bulletList"), onClick: () => editor.chain().focus().toggleBulletList().run() }),
    /* @__PURE__ */ jsx(ToolbarButton, { icon: ListOrdered, label: "Numbered list", active: editor.isActive("orderedList"), onClick: () => editor.chain().focus().toggleOrderedList().run() }),
    /* @__PURE__ */ jsx("span", { className: "mx-1 h-5 w-px bg-border", "aria-hidden": true }),
    /* @__PURE__ */ jsx(ToolbarButton, { icon: Link2, label: "Add link", active: editor.isActive("link"), onClick: setLink }),
    /* @__PURE__ */ jsx(ToolbarButton, { icon: Link2Off, label: "Remove link", disabled: !editor.isActive("link"), onClick: () => editor.chain().focus().unsetLink().run() }),
    /* @__PURE__ */ jsx("span", { className: "mx-1 h-5 w-px bg-border", "aria-hidden": true }),
    /* @__PURE__ */ jsx(ToolbarButton, { icon: Undo2, label: "Undo", disabled: !editor.can().undo(), onClick: () => editor.chain().focus().undo().run() }),
    /* @__PURE__ */ jsx(ToolbarButton, { icon: Redo2, label: "Redo", disabled: !editor.can().redo(), onClick: () => editor.chain().focus().redo().run() })
  ] });
}
function RichTextEditor({
  value,
  onChange,
  placeholder,
  disabled,
  className,
  id
}) {
  const editor = useEditor({
    immediatelyRender: false,
    editable: !disabled,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        // Use our own Link config below (safe protocols + branded styling).
        link: false
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        // Only allow safe schemes — strips javascript:/data: etc.
        protocols: ["http", "https", "mailto"],
        HTMLAttributes: { rel: "noopener noreferrer nofollow", class: "text-primary underline" }
      })
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: cx(
          "prose-editor min-h-[140px] w-full px-3 py-2 text-sm text-foreground focus:outline-none",
          disabled && "cursor-not-allowed opacity-60"
        ),
        ...placeholder ? { "data-placeholder": placeholder } : {}
      }
    },
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      onChange(html === "<p></p>" ? "" : html);
    }
  });
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const next = value || "";
    if (next !== current && !(next === "" && current === "<p></p>")) {
      editor.commands.setContent(next, { emitUpdate: false });
    }
  }, [value, editor]);
  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [disabled, editor]);
  if (!editor) {
    return /* @__PURE__ */ jsx("div", { className: cx("rounded-lg border border-input bg-background", className), children: /* @__PURE__ */ jsx("div", { className: "h-[180px] animate-pulse rounded-lg bg-muted/40" }) });
  }
  return /* @__PURE__ */ jsxs(
    "div",
    {
      id,
      className: cx(
        "overflow-hidden rounded-lg border border-input bg-background shadow-sm focus-within:ring-1 focus-within:ring-ring",
        className
      ),
      children: [
        /* @__PURE__ */ jsx(Toolbar, { editor }),
        /* @__PURE__ */ jsx(EditorContent, { editor })
      ]
    }
  );
}
var RichText = RichTextEditor;

export { RichText, RichTextEditor };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map