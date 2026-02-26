import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  getJournalEntries,
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
} from "../../api";
import "../../styles/BookInfoPage/BookJournal.css";

const MAX_CHARS = 5000;

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
  const autoSaveTimer = useRef(null);
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

  const triggerAutoSave = useCallback(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    hasUnsavedChanges.current = true;
    setSaveStatus(null);

    autoSaveTimer.current = setTimeout(async () => {
      if (!content.trim()) return;
      setSaveStatus("saving");
      try {
        if (editingId) {
          await updateJournalEntry({ email, entryId: editingId, title, content });
        } else {
          const res = await createJournalEntry({ email, volumeId, title, content });
          setEditingId(res.data.entry._id);
        }
        setSaveStatus("saved");
        hasUnsavedChanges.current = false;
        fetchEntries();
      } catch {
        setSaveStatus("error");
      }
    }, 5000);
  }, [content, title, editingId, email, volumeId, fetchEntries]);

  const handleContentChange = (value) => {
    if (value.length > MAX_CHARS) return;
    setContent(value);
    triggerAutoSave();
  };

  const handleTitleChange = (value) => {
    setTitle(value);
    triggerAutoSave();
  };

  const handleSave = async () => {
    if (!content.trim()) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    setSaveStatus("saving");
    try {
      if (editingId) {
        await updateJournalEntry({ email, entryId: editingId, title, content });
      } else {
        const res = await createJournalEntry({ email, volumeId, title, content });
        setEditingId(res.data.entry._id);
      }
      setSaveStatus("saved");
      hasUnsavedChanges.current = false;
      fetchEntries();
    } catch {
      setSaveStatus("error");
    }
  };

  const insertFormatting = (type) => {
    const textarea = document.getElementById("journal-content");
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    let newText = content;

    switch (type) {
      case "bold":
        newText = content.substring(0, start) + `**${selected}**` + content.substring(end);
        break;
      case "italic":
        newText = content.substring(0, start) + `*${selected}*` + content.substring(end);
        break;
      case "bullet":
        newText = content.substring(0, start) + `\n- ${selected}` + content.substring(end);
        break;
    }

    if (newText.length <= MAX_CHARS) {
      setContent(newText);
      triggerAutoSave();
    }
  };

  const startNewEntry = () => {
    setEditingId(null);
    setTitle("");
    setContent("");
    setSaveStatus(null);
    setShowEditor(true);
    hasUnsavedChanges.current = false;
  };

  const startEditEntry = (entry) => {
    setEditingId(entry._id);
    setTitle(entry.title || "");
    setContent(entry.content);
    setSaveStatus(null);
    setShowEditor(true);
    hasUnsavedChanges.current = false;
  };

  const closeEditor = () => {
    if (hasUnsavedChanges.current) {
      if (!window.confirm("You have unsaved changes. Discard them?")) return;
    }
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    setShowEditor(false);
    setEditingId(null);
    setTitle("");
    setContent("");
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

  const filteredEntries = searchQuery
    ? entries.filter(
        (e) =>
          (e.content || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (e.title || "").toLowerCase().includes(searchQuery.toLowerCase())
      )
    : entries;

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
            maxLength={100}
          />

          <div className="journal-toolbar" role="toolbar" aria-label="Text formatting">
            <button
              type="button"
              className="journal-fmt-btn"
              onClick={() => insertFormatting("bold")}
              title="Bold"
              aria-label="Bold"
            >
              <strong>B</strong>
            </button>
            <button
              type="button"
              className="journal-fmt-btn"
              onClick={() => insertFormatting("italic")}
              title="Italic"
              aria-label="Italic"
            >
              <em>I</em>
            </button>
            <button
              type="button"
              className="journal-fmt-btn"
              onClick={() => insertFormatting("bullet")}
              title="Bullet point"
              aria-label="Bullet point"
            >
              -
            </button>
          </div>

          <textarea
            id="journal-content"
            className="journal-editor-content"
            placeholder="Write your thoughts, favorite quotes, reflections..."
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            rows={8}
            maxLength={MAX_CHARS}
            aria-label="Journal entry content"
          />

          <div className="journal-editor-footer">
            <span className="journal-char-count">
              {content.length}/{MAX_CHARS}
            </span>
            <div className="journal-editor-actions">
              <span
                className={`journal-save-status ${saveStatus || ""}`}
                role="status"
                aria-live="polite"
              >
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
                disabled={!content.trim() || saveStatus === "saving"}
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
                  {entry.title && (
                    <h4 className="journal-entry-title">{entry.title}</h4>
                  )}
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
              <p className="journal-entry-content">{entry.content}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default BookJournal;