'use strict';

var Link = require('@tiptap/extension-link');
var Mention = require('@tiptap/extension-mention');
var react$1 = require('@tiptap/react');
var StarterKit = require('@tiptap/starter-kit');
var lucideReact = require('lucide-react');
var react = require('react');
var jsxRuntime = require('react/jsx-runtime');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var Link__default = /*#__PURE__*/_interopDefault(Link);
var Mention__default = /*#__PURE__*/_interopDefault(Mention);
var StarterKit__default = /*#__PURE__*/_interopDefault(StarterKit);

// src/components/rich-text-editor/rich-text-editor.tsx

// src/components/rich-text-editor/mentions.ts
var MENTION_LIMIT = 8;
function filterMentions(options, query, limit = MENTION_LIMIT) {
  const q = query.trim().toLowerCase();
  if (!q) return options.slice(0, limit);
  const starts = [];
  const contains = [];
  for (const o of options) {
    const label = o.label.toLowerCase();
    if (label.split(/\s+/).some((w) => w.startsWith(q))) {
      starts.push(o);
      if (starts.length >= limit) break;
    } else if (label.includes(q) || (o.description ?? "").toLowerCase().includes(q)) {
      contains.push(o);
    }
  }
  return [...starts, ...contains].slice(0, limit);
}
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
  return /* @__PURE__ */ jsxRuntime.jsx(
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
      children: /* @__PURE__ */ jsxRuntime.jsx(Icon, { className: "size-4", "aria-hidden": true })
    }
  );
}
function Toolbar({ editor }) {
  const setLink = react.useCallback(() => {
    const prev = editor.getAttributes("link").href;
    const url = window.prompt("Link URL", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/30 p-1.5", children: [
    /* @__PURE__ */ jsxRuntime.jsx(ToolbarButton, { icon: lucideReact.Bold, label: "Bold", active: editor.isActive("bold"), onClick: () => editor.chain().focus().toggleBold().run() }),
    /* @__PURE__ */ jsxRuntime.jsx(ToolbarButton, { icon: lucideReact.Italic, label: "Italic", active: editor.isActive("italic"), onClick: () => editor.chain().focus().toggleItalic().run() }),
    /* @__PURE__ */ jsxRuntime.jsx(ToolbarButton, { icon: lucideReact.Strikethrough, label: "Strikethrough", active: editor.isActive("strike"), onClick: () => editor.chain().focus().toggleStrike().run() }),
    /* @__PURE__ */ jsxRuntime.jsx("span", { className: "mx-1 h-5 w-px bg-border", "aria-hidden": true }),
    /* @__PURE__ */ jsxRuntime.jsx(ToolbarButton, { icon: lucideReact.Heading2, label: "Heading", active: editor.isActive("heading", { level: 2 }), onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run() }),
    /* @__PURE__ */ jsxRuntime.jsx(ToolbarButton, { icon: lucideReact.Heading3, label: "Subheading", active: editor.isActive("heading", { level: 3 }), onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run() }),
    /* @__PURE__ */ jsxRuntime.jsx("span", { className: "mx-1 h-5 w-px bg-border", "aria-hidden": true }),
    /* @__PURE__ */ jsxRuntime.jsx(ToolbarButton, { icon: lucideReact.List, label: "Bullet list", active: editor.isActive("bulletList"), onClick: () => editor.chain().focus().toggleBulletList().run() }),
    /* @__PURE__ */ jsxRuntime.jsx(ToolbarButton, { icon: lucideReact.ListOrdered, label: "Numbered list", active: editor.isActive("orderedList"), onClick: () => editor.chain().focus().toggleOrderedList().run() }),
    /* @__PURE__ */ jsxRuntime.jsx("span", { className: "mx-1 h-5 w-px bg-border", "aria-hidden": true }),
    /* @__PURE__ */ jsxRuntime.jsx(ToolbarButton, { icon: lucideReact.Link2, label: "Add link", active: editor.isActive("link"), onClick: setLink }),
    /* @__PURE__ */ jsxRuntime.jsx(ToolbarButton, { icon: lucideReact.Link2Off, label: "Remove link", disabled: !editor.isActive("link"), onClick: () => editor.chain().focus().unsetLink().run() }),
    /* @__PURE__ */ jsxRuntime.jsx("span", { className: "mx-1 h-5 w-px bg-border", "aria-hidden": true }),
    /* @__PURE__ */ jsxRuntime.jsx(ToolbarButton, { icon: lucideReact.Undo2, label: "Undo", disabled: !editor.can().undo(), onClick: () => editor.chain().focus().undo().run() }),
    /* @__PURE__ */ jsxRuntime.jsx(ToolbarButton, { icon: lucideReact.Redo2, label: "Redo", disabled: !editor.can().redo(), onClick: () => editor.chain().focus().redo().run() })
  ] });
}
function RichTextEditor({
  value,
  onChange,
  placeholder,
  disabled,
  className,
  id,
  ariaLabel,
  ariaLabelledBy,
  ariaDescribedBy,
  mentions
}) {
  const boxRef = react.useRef(null);
  const mentionsRef = react.useRef(mentions ?? []);
  mentionsRef.current = mentions ?? [];
  const [suggest, setSuggest] = react.useState(null);
  const suggestRef = react.useRef(null);
  suggestRef.current = suggest;
  const [mentionsOn] = react.useState(() => mentions !== void 0);
  const editor = react$1.useEditor({
    immediatelyRender: false,
    editable: !disabled,
    extensions: [
      StarterKit__default.default.configure({
        heading: { levels: [2, 3] },
        // Use our own Link config below (safe protocols + branded styling).
        link: false
      }),
      Link__default.default.configure({
        openOnClick: false,
        autolink: true,
        // Only allow safe schemes — strips javascript:/data: etc.
        protocols: ["http", "https", "mailto"],
        HTMLAttributes: { rel: "noopener noreferrer nofollow", class: "text-primary underline" }
      }),
      ...mentionsOn ? [
        Mention__default.default.configure({
          HTMLAttributes: { class: "rounded bg-primary/10 px-1 font-medium text-primary" },
          renderText: ({ node }) => `@${node.attrs.label ?? node.attrs.id}`,
          suggestion: {
            char: "@",
            items: ({ query }) => filterMentions(mentionsRef.current, query),
            render: () => {
              const show = (p) => {
                const caret = p.clientRect?.();
                const box = boxRef.current?.getBoundingClientRect();
                if (!caret || !box || p.items.length === 0) {
                  setSuggest(null);
                  return;
                }
                setSuggest((prev) => ({
                  items: p.items,
                  index: prev ? Math.min(prev.index, p.items.length - 1) : 0,
                  top: caret.bottom - box.top + 4,
                  left: Math.max(0, Math.min(caret.left - box.left, box.width - 240)),
                  command: p.command
                }));
              };
              return {
                onStart: show,
                onUpdate: show,
                onKeyDown: ({ event }) => {
                  const s = suggestRef.current;
                  if (!s) return false;
                  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                    const step = event.key === "ArrowDown" ? 1 : -1;
                    setSuggest({ ...s, index: (s.index + step + s.items.length) % s.items.length });
                    return true;
                  }
                  if (event.key === "Enter" || event.key === "Tab") {
                    const item = s.items[s.index];
                    if (item) s.command({ id: item.id, label: item.label });
                    return true;
                  }
                  if (event.key === "Escape") {
                    setSuggest(null);
                    return true;
                  }
                  return false;
                },
                onExit: () => setSuggest(null)
              };
            }
          }
        })
      ] : []
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: cx(
          "prose-editor min-h-[140px] w-full px-3 py-2 text-sm text-foreground focus:outline-none",
          disabled && "cursor-not-allowed opacity-60"
        ),
        ...placeholder ? { "data-placeholder": placeholder } : {},
        // The editable area is a textbox for assistive technology; name it from the props.
        role: "textbox",
        "aria-multiline": "true",
        ...ariaLabel ? { "aria-label": ariaLabel } : {},
        ...ariaLabelledBy ? { "aria-labelledby": ariaLabelledBy } : {},
        ...ariaDescribedBy ? { "aria-describedby": ariaDescribedBy } : {},
        ...disabled ? { "aria-disabled": "true" } : {}
      }
    },
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      onChange(html === "<p></p>" ? "" : html);
    }
  });
  react.useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const next = value || "";
    if (next !== current && !(next === "" && current === "<p></p>")) {
      editor.commands.setContent(next, { emitUpdate: false });
    }
  }, [value, editor]);
  react.useEffect(() => {
    editor?.setEditable(!disabled);
  }, [disabled, editor]);
  if (!editor) {
    return /* @__PURE__ */ jsxRuntime.jsx("div", { className: cx("rounded-lg border border-input bg-background", className), children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-[180px] animate-pulse rounded-lg bg-muted/40" }) });
  }
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "div",
    {
      id,
      ref: boxRef,
      className: cx(
        // overflow stays visible while the mention list is open so the list is not clipped.
        "relative rounded-lg border border-input bg-background shadow-sm focus-within:ring-1 focus-within:ring-ring",
        suggest ? "overflow-visible" : "overflow-hidden",
        className
      ),
      children: [
        /* @__PURE__ */ jsxRuntime.jsx(Toolbar, { editor }),
        /* @__PURE__ */ jsxRuntime.jsx(react$1.EditorContent, { editor }),
        suggest && /* @__PURE__ */ jsxRuntime.jsx(
          "ul",
          {
            role: "listbox",
            "aria-label": "People to mention",
            className: "absolute z-50 max-h-64 w-60 overflow-y-auto rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md",
            style: { top: suggest.top, left: suggest.left },
            children: suggest.items.map((item, i) => /* @__PURE__ */ jsxRuntime.jsx("li", { role: "option", "aria-selected": i === suggest.index, children: /* @__PURE__ */ jsxRuntime.jsxs(
              "button",
              {
                type: "button",
                onMouseDown: (e) => e.preventDefault(),
                onClick: () => suggest.command({ id: item.id, label: item.label }),
                className: cx(
                  "flex w-full flex-col items-start rounded px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground",
                  i === suggest.index && "bg-accent text-accent-foreground"
                ),
                children: [
                  /* @__PURE__ */ jsxRuntime.jsx("span", { className: "truncate font-medium", children: item.label }),
                  item.description && /* @__PURE__ */ jsxRuntime.jsx("span", { className: "truncate text-xs text-muted-foreground", children: item.description })
                ]
              }
            ) }, item.id))
          }
        )
      ]
    }
  );
}
var RichText = RichTextEditor;

exports.MENTION_LIMIT = MENTION_LIMIT;
exports.RichText = RichText;
exports.RichTextEditor = RichTextEditor;
exports.filterMentions = filterMentions;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map