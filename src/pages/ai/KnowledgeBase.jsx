// ═══════════════════════════════════════════════════════════════
// ALKOWN GLOBAL — Knowledge Base (Phase 1)
// Upload, manage, and browse knowledge collections
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useRef } from "react";
import {
  getCollections, getDocuments, saveDocument, updateDocumentStatus,
  deleteDocument, extractAndChunkText, saveChunks,
} from "../../services/ai/knowledgeService";

const G = "#c9a84c";
const BORDER = "rgba(201,168,76,.22)";
const cardBase = { background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, padding: "20px 24px", boxShadow: "0 2px 10px rgba(0,0,0,.05)" };

const STATUS_COLORS = { pending: "#c28a25", processing: "#3d6f9f", ready: "#2f8f5b", error: "#b94a48" };
const STATUS_AR     = { pending: "في الانتظار", processing: "قيد المعالجة", ready: "جاهز", error: "خطأ" };

export default function KnowledgeBase() {
  const [collections, setCollections] = useState([]);
  const [documents,   setDocuments]   = useState([]);
  const [activeCol,   setActiveCol]   = useState(null);
  const [tab,         setTab]         = useState("docs");   // docs | upload
  const [loading,     setLoading]     = useState(true);
  const [uploading,   setUploading]   = useState(false);
  const [error,       setError]       = useState("");
  const [success,     setSuccess]     = useState("");
  const [search,      setSearch]      = useState("");

  // Upload form
  const [uploadForm, setUploadForm] = useState({ title: "", collection_id: "", raw_text: "", file_type: "text" });
  const fileRef = useRef();

  useEffect(() => { load(); }, [activeCol]);

  async function load() {
    setLoading(true);
    const [colRes, docRes] = await Promise.all([
      getCollections(),
      getDocuments(activeCol),
    ]);
    if (colRes.error) setError(colRes.error.message);
    setCollections(colRes.data);
    setDocuments(docRes.data);
    setLoading(false);
  }

  // ── File reader ─────────────────────────────────────────────
  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    setUploadForm(f => ({ ...f, title: file.name.replace(/\.[^.]+$/, ""), file_type: ext }));

    const reader = new FileReader();
    reader.onload = ev => {
      setUploadForm(f => ({ ...f, raw_text: ev.target.result }));
    };
    if (ext === "pdf") {
      // PDF: read as text (plain text extraction — basic)
      reader.readAsText(file);
    } else {
      reader.readAsText(file);
    }
  }

  // ── Upload & chunk ───────────────────────────────────────────
  async function handleUpload(e) {
    e.preventDefault();
    if (!uploadForm.title.trim() || !uploadForm.raw_text.trim()) {
      setError("العنوان والمحتوى مطلوبان");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      // 1. Save document
      const { data: doc, error: docErr } = await saveDocument({
        title:         uploadForm.title.trim(),
        collection_id: uploadForm.collection_id || null,
        raw_text:      uploadForm.raw_text,
        file_type:     uploadForm.file_type,
        status:        "processing",
      });
      if (docErr) throw new Error(docErr.message);

      // 2. Chunk text
      const chunks = extractAndChunkText(uploadForm.raw_text, doc.id, 500);

      // 3. Save chunks
      if (chunks.length) {
        const { error: chunkErr } = await saveChunks(chunks);
        if (chunkErr) throw new Error(chunkErr.message);
      }

      // 4. Mark ready
      await updateDocumentStatus(doc.id, "ready", chunks.length);

      setSuccess(`تم رفع "${uploadForm.title}" بنجاح — ${chunks.length} قطعة`);
      setUploadForm({ title: "", collection_id: "", raw_text: "", file_type: "text" });
      if (fileRef.current) fileRef.current.value = "";
      await load();
      setTab("docs");
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id, title) {
    if (!window.confirm(`حذف "${title}"؟`)) return;
    await deleteDocument(id);
    setDocuments(d => d.filter(x => x.id !== id));
  }

  const filtered = documents.filter(d =>
    !search || d.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", direction: "rtl", fontFamily: "'Cairo','Noto Naskh Arabic',sans-serif" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 32 }}>📚</span>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "#1a1510" }}>قاعدة المعرفة</h1>
            <p style={{ margin: 0, fontSize: ".8rem", color: "#6f6a61" }}>{documents.length} وثيقة</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {["docs", "upload"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              background: tab === t ? G : "transparent",
              color:      tab === t ? "#fff" : G,
              border:     `1px solid ${G}`,
              borderRadius: 10, padding: "8px 18px", cursor: "pointer",
              fontFamily: "inherit", fontWeight: 700, fontSize: ".85rem",
            }}>
              {t === "docs" ? "📄 الوثائق" : "⬆️ رفع وثيقة"}
            </button>
          ))}
        </div>
      </div>

      {error   && <Alert type="error"   msg={error}   onClose={() => setError("")}   />}
      {success && <Alert type="success" msg={success} onClose={() => setSuccess("")} />}

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 20, alignItems: "start" }}>

        {/* Sidebar: Collections */}
        <div style={cardBase}>
          <div style={{ fontWeight: 700, fontSize: ".85rem", color: G, marginBottom: 12 }}>المجموعات</div>
          <CollectionItem
            label="جميع الوثائق" icon="📋"
            count={documents.length}
            active={!activeCol}
            onClick={() => setActiveCol(null)}
          />
          {collections.map(col => (
            <CollectionItem
              key={col.id}
              label={col.name_ar}
              icon={col.icon}
              count={documents.filter(d => d.collection_id === col.id).length}
              active={activeCol === col.id}
              onClick={() => setActiveCol(col.id)}
              color={col.color}
            />
          ))}
        </div>

        {/* Main Content */}
        <div>
          {tab === "upload" ? (
            <UploadForm
              form={uploadForm}
              onChange={setUploadForm}
              collections={collections}
              onFile={handleFile}
              onSubmit={handleUpload}
              uploading={uploading}
              fileRef={fileRef}
            />
          ) : (
            <>
              {/* Search */}
              <div style={{ marginBottom: 16 }}>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="ابحث في الوثائق..."
                  style={{
                    width: "100%", padding: "10px 14px", border: `1px solid ${BORDER}`,
                    borderRadius: 10, fontFamily: "inherit", fontSize: ".9rem",
                    background: "#fff", boxSizing: "border-box",
                  }}
                />
              </div>

              {loading ? (
                <div style={{ textAlign: "center", padding: 40, color: "#aaa" }}>جاري التحميل…</div>
              ) : filtered.length === 0 ? (
                <EmptyState onUpload={() => setTab("upload")} />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {filtered.map(doc => (
                    <DocumentCard key={doc.id} doc={doc} onDelete={handleDelete} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────

function CollectionItem({ label, icon, count, active, onClick, color = G }) {
  return (
    <div onClick={onClick} style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "9px 10px", borderRadius: 10, cursor: "pointer",
      background: active ? `${color}18` : "transparent",
      color: active ? color : "#3a3530",
      fontWeight: active ? 700 : 500,
      fontSize: ".83rem", marginBottom: 4,
      transition: "all .15s",
    }}>
      <span>{icon} {label}</span>
      <span style={{ background: "#f0ece3", padding: "1px 8px", borderRadius: 20, fontSize: ".7rem", color: "#6f6a61" }}>{count}</span>
    </div>
  );
}

function DocumentCard({ doc, onDelete }) {
  const col   = doc.ai_knowledge_collections;
  const color = col?.color || G;
  return (
    <div style={{ ...cardBase, display: "flex", alignItems: "center", gap: 16, padding: "16px 20px" }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, background: `${color}18`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 22, flexShrink: 0,
      }}>
        {fileTypeIcon(doc.file_type)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: ".92rem", color: "#1a1510", marginBottom: 4 }}>{doc.title}</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {col && (
            <Tag text={`${col.icon || ""} ${col.name_ar || col.name}`} color={color} />
          )}
          <Tag text={doc.file_type?.toUpperCase() || "TXT"} color="#6f6a61" />
          <Tag text={`${doc.chunk_count || 0} قطعة`} color="#3d6f9f" />
          <Tag
            text={STATUS_AR[doc.status] || doc.status}
            color={STATUS_COLORS[doc.status] || G}
          />
        </div>
      </div>
      <div style={{ fontSize: ".75rem", color: "#aaa", flexShrink: 0, marginLeft: 8 }}>
        {new Date(doc.created_at).toLocaleDateString("ar-SA")}
      </div>
      <button
        onClick={() => onDelete(doc.id, doc.title)}
        style={{ background: "none", border: "none", cursor: "pointer", color: "#b94a48", fontSize: 16, padding: 4 }}
        title="حذف"
      >
        🗑️
      </button>
    </div>
  );
}

function UploadForm({ form, onChange, collections, onFile, onSubmit, uploading, fileRef }) {
  const set = (k, v) => onChange(f => ({ ...f, [k]: v }));

  return (
    <div style={cardBase}>
      <h3 style={{ margin: "0 0 20px", color: G, fontSize: "1rem", fontWeight: 700 }}>⬆️ رفع وثيقة جديدة</h3>
      <form onSubmit={onSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <label style={labelStyle}>
            عنوان الوثيقة *
            <input
              value={form.title}
              onChange={e => set("title", e.target.value)}
              placeholder="مثال: متطلبات تأشيرة شنغن"
              required
              style={inputStyle}
            />
          </label>
          <label style={labelStyle}>
            المجموعة
            <select value={form.collection_id} onChange={e => set("collection_id", e.target.value)} style={inputStyle}>
              <option value="">— بدون مجموعة —</option>
              {collections.map(c => (
                <option key={c.id} value={c.id}>{c.icon} {c.name_ar}</option>
              ))}
            </select>
          </label>
        </div>

        <label style={labelStyle}>
          رفع ملف (PDF, DOCX, TXT, CSV, MD)
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.docx,.txt,.csv,.md,.text"
            onChange={onFile}
            style={{ ...inputStyle, padding: "8px 12px" }}
          />
        </label>

        <label style={{ ...labelStyle, marginTop: 16 }}>
          أو ألصق النص مباشرة
          <textarea
            value={form.raw_text}
            onChange={e => set("raw_text", e.target.value)}
            placeholder="الصق محتوى الوثيقة هنا…"
            rows={10}
            style={{ ...inputStyle, resize: "vertical", lineHeight: 1.7 }}
          />
        </label>

        <button
          type="submit"
          disabled={uploading}
          style={{
            marginTop: 20, background: uploading ? "#ccc" : G, color: "#fff",
            border: "none", borderRadius: 12, padding: "12px 28px",
            fontFamily: "inherit", fontWeight: 700, fontSize: ".9rem",
            cursor: uploading ? "not-allowed" : "pointer",
          }}
        >
          {uploading ? "جاري الرفع والمعالجة…" : "⬆️ رفع ومعالجة"}
        </button>
      </form>
    </div>
  );
}

function EmptyState({ onUpload }) {
  return (
    <div style={{ ...cardBase, textAlign: "center", padding: "48px 24px" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
      <h3 style={{ margin: "0 0 8px", color: "#1a1510" }}>لا توجد وثائق بعد</h3>
      <p style={{ margin: "0 0 20px", color: "#6f6a61" }}>ارفع أول وثيقة لبناء قاعدة المعرفة</p>
      <button onClick={onUpload} style={{
        background: G, color: "#fff", border: "none", borderRadius: 12,
        padding: "10px 24px", fontFamily: "inherit", fontWeight: 700, cursor: "pointer",
      }}>
        ⬆️ رفع وثيقة
      </button>
    </div>
  );
}

function Alert({ type, msg, onClose }) {
  const colors = { error: "#b94a48", success: "#2f8f5b" };
  const bgs    = { error: "#fff5f5", success: "#f0faf4" };
  return (
    <div style={{ background: bgs[type], border: `1px solid ${colors[type]}44`, borderRadius: 10, padding: "12px 16px", marginBottom: 16, display: "flex", justifyContent: "space-between", color: colors[type], fontSize: ".9rem" }}>
      <span>{msg}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: colors[type], fontSize: 16 }}>✕</button>
    </div>
  );
}

function Tag({ text, color }) {
  return (
    <span style={{ background: `${color}18`, color, padding: "2px 10px", borderRadius: 20, fontSize: ".72rem", fontWeight: 600 }}>
      {text}
    </span>
  );
}

function fileTypeIcon(t) {
  const map = { pdf: "📕", docx: "📘", txt: "📄", csv: "📊", md: "📝" };
  return map[t] || "📄";
}

const labelStyle = { display: "flex", flexDirection: "column", gap: 6, fontSize: ".85rem", color: "#3a3530", fontWeight: 600 };
const inputStyle = { padding: "10px 14px", border: `1px solid ${BORDER}`, borderRadius: 10, fontFamily: "inherit", fontSize: ".88rem", background: "#fffdf8", outline: "none" };
