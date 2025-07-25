import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import * as ReactDOM from "react-dom";
//@ts-ignore
import pb from "@/lib/pb.js";
import { useTranslation } from "react-i18next";

export type InlineEditorProps = {
  recordKey: string;
  type: "string" | "array";
  children: (value: string | string[]) => React.ReactNode;
};

type BubbleToolbarProps = {
  editorRef: React.RefObject<HTMLDivElement>;
  onSave: () => Promise<void>;
  onCancel: () => void;
};

const BubbleToolbar: React.FC<BubbleToolbarProps> = ({
  editorRef,
  onSave,
  onCancel,
}) => {
  const [coords, setCoords] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  useLayoutEffect(() => {
    const update = () => {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const rect = sel.getRangeAt(0).getBoundingClientRect();
      setCoords({
        top: rect.top + window.scrollY - 40,
        left: rect.left + window.scrollX,
      });
    };
    document.addEventListener("selectionchange", update);
    update();
    return () => document.removeEventListener("selectionchange", update);
  }, []);

  return ReactDOM.createPortal(
    <div
      onMouseDown={(e: { stopPropagation: () => any }) => e.stopPropagation()}
      className="absolute bg-white shadow-lg rounded-lg px-2 py-1 flex gap-2 z-[9999]"
      style={{
        top: coords.top,
        left: coords.left,
      }}
    >
      <button
        onClick={onSave}
        className="px-2 py-1 font-medium hover:bg-blue-50 rounded"
      >
        💾 Save
      </button>
      <button
        onClick={onCancel}
        className="px-2 py-1 hover:bg-gray-100 rounded"
      >
        ❌ Cancel
      </button>
    </div>,
    document.body,
  );
};

let activeEditor: React.RefObject<HTMLDivElement> | null = null;
let setActiveEditing: ((editing: boolean) => void) | null = null;

const InlineEditor: React.FC<InlineEditorProps> = ({
  recordKey,
  type,
  children,
}) => {
  const { i18n } = useTranslation();
  const [hover, setHover] = useState(false);
  const [editing, setEditing] = useState(false);
  const [recordId, setRecordId] = useState<string | null>(null);
  const [value, setValue] = useState<string | string[]>(
    type === "array" ? [] : "",
  );
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        editing &&
        editorRef.current &&
        !editorRef.current.contains(e.target as Node)
      ) {
        setEditing(false);
      }
    };

    if (editing) {
      if (activeEditor && activeEditor !== editorRef && setActiveEditing) {
        setActiveEditing(false);
      }
      activeEditor = editorRef;
      setActiveEditing = setEditing;
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (activeEditor === editorRef) {
        activeEditor = null;
        setActiveEditing = null;
      }
    };
  }, [editing]);
  useEffect(() => {
    async function fetchRecord() {
      const recs = await pb.collection("texts").getFullList({
        filter: `key=\"${recordKey}\" && lang=\"${i18n.language}\"`,
      });
      if (recs.length > 0) {
        const rec = recs[0];
        setRecordId(rec.id);
        try {
          const parsed = JSON.parse(rec.content);
          setValue(Array.isArray(parsed) ? parsed : rec.content);
        } catch {
          setValue(rec.content);
        }
      } else {
        setRecordId(null);
        setValue(type === "array" ? [] : "");
      }
    }
    fetchRecord();
  }, [recordKey, i18n.language]);

  const saveCursorPosition = () => {
    const selection = window.getSelection();
    if (!selection || !editorRef.current) return null;

    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(editorRef.current);
    preCaretRange.setEnd(range.startContainer, range.startOffset);
    return preCaretRange.toString().length;
  };

  const restoreCursorPosition = (pos: number) => {
    if (!editorRef.current) return;

    const selection = window.getSelection();
    if (!selection) return;

    const walker = document.createTreeWalker(
      editorRef.current,
      NodeFilter.SHOW_TEXT,
      null,
    );

    let currentPos = 0;
    let node;

    while ((node = walker.nextNode())) {
      const textLength = node.textContent?.length || 0;
      if (currentPos + textLength >= pos) {
        const range = document.createRange();
        range.setStart(node, pos - currentPos);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        return;
      }
      currentPos += textLength;
    }
  };
  const save = async () => {
    if (!editorRef.current) return;

    let html = editorRef.current.innerHTML;

    // remove nested identical start tags, e.g. <h2><h2> → <h2>
    html = html.replace(/<(?<tag>h[1-6])>\s*<\k<tag>>/gi, "<$1>");

    // remove duplicated end tags, e.g. </h2></h2> → </h2>
    html = html.replace(/<\/(?<tag>h[1-6])>\s*<\/\k<tag>>/gi, "</$1>");

    // remove completely empty tags, e.g. <h2></h2> or <p>   </p>
    html = html.replace(/<([a-z][a-z0-9]*)>\s*<\/\1>/gi, "");

    // prepare payload without altering class attributes
    const payload = html;

    // update or create the record
    if (recordId) {
      await pb.collection("texts").update(recordId, { content: payload });
    } else {
      const newRec = await pb.collection("texts").create({
        key: recordKey,
        lang: i18n.language,
        content: payload,
      });
      setRecordId(newRec.id);
    }

    // update local state & reload translations
    setValue(html);
    await i18n.reloadResources(i18n.language, "translation");
    setEditing(false);
  };

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="relative group"
    >
      <div
        ref={editorRef}
        contentEditable={editing}
        suppressContentEditableWarning
        onClick={(e) => {
          e.stopPropagation();
          if (activeEditor && activeEditor !== editorRef && setActiveEditing) {
            setActiveEditing(false);
          }
          setEditing(true);
        }}
        onInput={() => {
          if (!editorRef.current) return;

          const cursorPos = saveCursorPosition();
          const html = editorRef.current.innerHTML;

          setValue(html);
          // restore the cursor after React updates
          setTimeout(() => {
            if (cursorPos !== null) restoreCursorPosition(cursorPos);
          }, 0);
        }}
        className={`p-1 rounded transition-all duration-150 ${
          editing
            ? "border-2 border-blue-500 bg-blue-50/30 whitespace-pre-wrap"
            : hover
              ? "border-2 border-blue-300 bg-blue-50/20"
              : ""
        }`}
        style={{ minWidth: "1ch" }}
      >
        {children(type === "array" ? value : value)}
      </div>

      {(hover || editing) && (
        <div
          className="absolute -top-1 -right-1 px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded-full shadow-lg transition-opacity duration-200 pointer-events-none"
          style={{ fontSize: "10px" }}
        >
          {editing ? "Editing" : "Text"}
        </div>
      )}

      {editing && (
        <BubbleToolbar
          editorRef={editorRef}
          onSave={save}
          onCancel={() => setEditing(false)}
        />
      )}
    </div>
  );
};

export default InlineEditor;
