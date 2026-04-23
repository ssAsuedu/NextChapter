import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import DOMPurify from "dompurify";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
  getJournalEntries,
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
} from "../../api";
import "../../styles/BookInfoPage/BookJournal.css";

const MAX_CHARS = 5000;

const stripHtml = (html = "") =>
  html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const BookJournal = ({ volumeId }) => {
  const email = localStorage.getItem("userEmail");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saveStatus, setSaveStatus] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editorSeed, setEditorSeed] = useState("");
  const hasUnsavedChanges = useRef(false);

  const fetchEntries = useCallback(async () => {
    if (!email || !volumeId) return;
    try {
      const res = await getJournalEntries(email, volumeId);
      setEntries(res.data.entries || []);
    } catch (err) {
      console.error("Failed to fetch journal:", err);
    } finally {
      setLoading(false);
    }
  }, [email, volumeId]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Write your thoughts, favorite quotes, reflections...",
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "journal-editor-content tiptap-editor",
        "aria-label": "Journal entry content",
      },
    },
    onUpdate: ({ editor }) => {
      const plain = editor.getText();
      if (plain.length > MAX_CHARS) {
        editor.commands.undo();
        return;
      }

      setContent(editor.getHTML());
      hasUnsavedChanges.current = true;
      setSaveStatus(null);
    },
  });
  const { isBoldActive, isItalicActive } = useEditorState({
      editor,
      selector: ({ editor }) => ({
        isBoldActive: editor?.isActive("bold") || false,
        isItalicActive: editor?.isActive("italic") || false,
      }),
  });
  useEffect(() => {
    if (!showEditor || !editor) return;
    editor.commands.setContent(editorSeed || "", false);
    editor.commands.focus("end");
  }, [showEditor, editor, editorSeed]);

  const handleTitleChange = (value) => {
    setTitle(value);
    hasUnsavedChanges.current = true;
    setSaveStatus(null);
  };

  const handleSave = async () => {
    const htmlContent = editor?.getHTML() || content;
    const plainText = stripHtml(htmlContent);

    if (!plainText) return;
    setSaveStatus("saving");

    try {
      if (editingId) {
        await updateJournalEntry({
          email,
          entryId: editingId,
          title,
          content: htmlContent,
        });
      } else {
        const res = await createJournalEntry({
          email,
          volumeId,
          title,
          content: htmlContent,
        });
        setEditingId(res.data.entry._id);
      }

      setSaveStatus("saved");
      hasUnsavedChanges.current = false;
      await fetchEntries();
      closeEditor();
    } catch {
      setSaveStatus("error");
    }
  };

  const startNewEntry = () => {
    setEditingId(null);
    setTitle("");
    setContent("");
    setEditorSeed("");
    setSaveStatus(null);
    setShowEditor(true);
    hasUnsavedChanges.current = false;
  };

  const startEditEntry = (entry) => {
    setEditingId(entry._id);
    setTitle(entry.title || "");
    setContent(entry.content || "");
    setEditorSeed(entry.content || "");
    setSaveStatus(null);
    setShowEditor(true);
    hasUnsavedChanges.current = false;
  };

  const closeEditor = () => {
    if (hasUnsavedChanges.current) {
      if (!window.confirm("You have unsaved changes. Discard them?")) return;
    }

    setShowEditor(false);
    setEditingId(null);
    setTitle("");
    setContent("");
    setEditorSeed("");
    setSaveStatus(null);
    hasUnsavedChanges.current = false;
  };

  const handleDelete = async (entryId) => {
    try {
      await deleteJournalEntry({ email, entryId });
      setDeleteConfirm(null);
      if (editingId === entryId) closeEditor();
      fetchEntries();
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  const plainCharCount = useMemo(
    () => stripHtml(editor?.getHTML() || content).length,
    [editor, content]
  );

  const filteredEntries = useMemo(() => {
    if (!searchQuery) return entries;
    const q = searchQuery.toLowerCase();

    return entries.filter((e) => {
      const plainContent = stripHtml(e.content || "").toLowerCase();
      const plainTitle = (e.title || "").toLowerCase();
      return plainContent.includes(q) || plainTitle.includes(q);
    });
  }, [entries, searchQuery]);

  if (!email) return null;

  return (
    <section className="journal-section" aria-label="Book journal - private notes">
      <div className="journal-header">
        <div className="journal-header-left">
          <h3 className="journal-title">My Notes</h3>
          <span className="journal-private-badge" aria-label="Only you can see this">
            Private -- only you can see this
          </span>
        </div>
        <button className="journal-new-btn" onClick={startNewEntry}>
          + New Entry
        </button>
      </div>

      {entries.length > 2 && (
        <div className="journal-search">
          <input
            type="text"
            placeholder="Search your notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="journal-search-input"
            aria-label="Search journal entries"
          />
        </div>
      )}

      {showEditor && (
        <div className="journal-editor" role="form" aria-label="Journal entry editor">
          <input
            type="text"
            placeholder="Entry title (optional)"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="journal-editor-title"
            maxLength={50}
          />

          <div className="journal-toolbar" role="toolbar" aria-label="Text formatting">
            <button
              type="button"
              className={`journal-fmt-btn ${isBoldActive ? "active" : ""}`}
              onClick={() => editor?.chain().focus().toggleBold().run()}
              title="Bold"
              aria-label="Bold"
              aria-pressed={isBoldActive}
            >
              <strong>B</strong>
            </button>
            <button
              type="button"
               className={`journal-fmt-btn ${isItalicActive ? "active" : ""}`}
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              title="Italic"
              aria-label="Italic"
              aria-pressed={isItalicActive}
            >
              <em>I</em>
            </button>
            <button
              type="button"
              className="journal-fmt-btn"
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              title="Bullet point"
              aria-label="Bullet point"
            >
              -
            </button>
          </div>

          <EditorContent editor={editor} />

          <div className="journal-editor-footer">
            <span className="journal-char-count">
              {plainCharCount}/{MAX_CHARS}
            </span>
            <div className="journal-editor-actions">
              <span className={`journal-save-status ${saveStatus || ""}`} role="status" aria-live="polite">
                {saveStatus === "saving" && "Saving..."}
                {saveStatus === "saved" && "Saved"}
                {saveStatus === "error" && "Save failed"}
              </span>
              <button className="journal-cancel-btn" onClick={closeEditor}>
                Close
              </button>
              <button
                className="journal-save-btn"
                onClick={handleSave}
                disabled={!stripHtml(editor?.getHTML() || content) || saveStatus === "saving"}
              >
                Save Now
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="journal-entries">
        {loading ? (
          <p className="journal-empty">Loading notes...</p>
        ) : filteredEntries.length === 0 ? (
          <p className="journal-empty">
            {searchQuery
              ? "No notes match your search."
              : "No notes yet. Start journaling your thoughts!"}
          </p>
        ) : (
          filteredEntries.map((entry) => (
            <div key={entry._id} className="journal-entry-card">
              <div className="journal-entry-header">
                <div>
                  {entry.title && <h4 className="journal-entry-title">{entry.title}</h4>}
                  <time className="journal-entry-date">
                    {new Date(entry.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                    {entry.updatedAt &&
                      new Date(entry.updatedAt).getTime() !==
                        new Date(entry.createdAt).getTime() && (
                        <span className="journal-edited-tag"> (edited)</span>
                      )}
                  </time>
                </div>
                <div className="journal-entry-actions">
                  <button
                    className="journal-action-btn"
                    onClick={() => startEditEntry(entry)}
                    aria-label="Edit entry"
                  >
                    Edit
                  </button>
                  {deleteConfirm === entry._id ? (
                    <>
                      <button
                        className="journal-action-btn journal-delete-confirm"
                        onClick={() => handleDelete(entry._id)}
                      >
                        Confirm
                      </button>
                      <button
                        className="journal-action-btn"
                        onClick={() => setDeleteConfirm(null)}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      className="journal-action-btn"
                      onClick={() => setDeleteConfirm(entry._id)}
                      aria-label="Delete entry"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>

              <div
                className="journal-entry-content"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(entry.content || ""),
                }}
              />
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default BookJournal;
