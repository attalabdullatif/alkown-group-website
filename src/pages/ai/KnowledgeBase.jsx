// ═══════════════════════════════════════════════════════════════
// ALKOWN GLOBAL — Knowledge Base (Phase 1)
// Upload, manage, and browse knowledge collections
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useRef, useCallback } from "react";
import {
  getCollections, getDocuments, saveDocument, updateDocumentStatus,
  deleteDocument, extractAndChunkText, saveChunks,
  seedVisaCollections, getDocumentVersions, saveDocumentVersion,
  linkDocumentToRequest, getDocumentLinks, removeDocumentLink,
  buildCitation,
} from "../../services/ai/knowledgeService";
import { supabase } from "../../lib/supabase";

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
  const [uploadForm, setUploadForm] = useState({ title: "", collection_id: "", raw_text: "", file_type: "text", linked_country: "", visa_type: "", source_url: "" });
  const fileRef = useRef();
  const [selectedDoc,  setSelectedDoc]  = useState(null); // doc row for detail panel
  const [seeding,      setSeeding]      = useState(false);

  useEffect(() => { load(); }, [activeCol]); // eslint-disable-line react-hooks/exhaustive-deps

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
        title:          uploadForm.title.trim(),
        collection_id:  uploadForm.collection_id || null,
        raw_text:       uploadForm.raw_text,
        file_type:      uploadForm.file_type,
        status:         "processing",
        linked_country: uploadForm.linked_country || null,
        visa_type:      uploadForm.visa_type || null,
        source_url:     uploadForm.source_url || null,
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
      setUploadForm({ title: "", collection_id: "", raw_text: "", file_type: "text", linked_country: "", visa_type: "", source_url: "" });
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

  async function handleSeedCollections() {
    setSeeding(true);
    const { inserted, error: seedErr } = await seedVisaCollections();
    if (seedErr) { setError(seedErr.message); }
    else if (inserted > 0) { setSuccess(`تم إنشاء ${inserted} مجموعات افتراضية للتأشيرات`); await load(); }
    else { setSuccess("المجموعات الافتراضية موجودة بالفعل"); }
    setSeeding(false);
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
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
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
          <button onClick={handleSeedCollections} disabled={seeding} style={{
            background: "transparent", color: "#3d6f9f", border: "1px solid #3d6f9f",
            borderRadius: 10, padding: "8px 16px", cursor: "pointer",
            fontFamily: "inherit", fontWeight: 700, fontSize: ".82rem", opacity: seeding ? .6 : 1,
          }}>
            {seeding ? "جارٍ..." : "🌱 تهيئة مجموعات التأشيرة"}
          </button>
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
                    <DocumentCard key={doc.id} doc={doc} onDelete={handleDelete} onSelect={setSelectedDoc} selected={selectedDoc?.id === doc.id} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Document Detail Panel */}
      {selectedDoc && (
        <DocumentDetailPanel doc={selectedDoc} onClose={() => setSelectedDoc(null)} />
      )}
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

function DocumentCard({ doc, onDelete, onSelect, selected }) {
  const col   = doc.ai_knowledge_collections;
  const color = col?.color || G;
  return (
    <div onClick={() => onSelect?.(selected ? null : doc)} style={{ ...cardBase, display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", cursor: "pointer", border: selected ? `2px solid ${G}` : `1px solid ${BORDER}`, background: selected ? `${G}08` : "#fff" }}>
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

        {/* Visa Metadata */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16, marginTop: 8 }}>
          <label style={labelStyle}>
            دولة التأشيرة
            <input value={form.linked_country || ""} onChange={e => set("linked_country", e.target.value)} placeholder="مثال: AE, US" style={inputStyle} />
          </label>
          <label style={labelStyle}>
            نوع التأشيرة
            <select value={form.visa_type || ""} onChange={e => set("visa_type", e.target.value)} style={inputStyle}>
              <option value="">—</option>
              {["tourist", "business", "student", "work", "transit", "family"].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label style={labelStyle}>
            رابط المصدر
            <input value={form.source_url || ""} onChange={e => set("source_url", e.target.value)} placeholder="https://..." style={inputStyle} />
          </label>
        </div>

        <label style={{ ...labelStyle, marginTop: 8 }}>
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

// ── Document Detail Panel ──────────────────────────────────────
function DocumentDetailPanel({ doc, onClose }) {
  const [panelTab,  setPanelTab]  = useState("versions");  // versions | links | citation
  const [versions,  setVersions]  = useState([]);
  const [links,     setLinks]     = useState([]);
  const [requests,  setRequests]  = useState([]);
  const [linkReqId, setLinkReqId] = useState("");
  const [linkNote,  setLinkNote]  = useState("");
  const [vNote,     setVNote]     = useState("");
  const [loadingV,  setLoadingV]  = useState(true);
  const [loadingL,  setLoadingL]  = useState(true);
  const [saving,    setSaving]    = useState(false);

  const loadVersions = useCallback(async () => {
    setLoadingV(true);
    const { data } = await getDocumentVersions(doc.id);
    setVersions(data);
    setLoadingV(false);
  }, [doc.id]);

  const loadLinks = useCallback(async () => {
    setLoadingL(true);
    const { data } = await getDocumentLinks(doc.id);
    setLinks(data);
    setLoadingL(false);
  }, [doc.id]);

  useEffect(() => {
    loadVersions();
    loadLinks();
    supabase.from("requests").select("id, request_number, status, clients(full_name)").order("created_at", { ascending: false }).limit(100)
      .then(({ data }) => setRequests(data || []));
  }, [loadVersions, loadLinks]);

  async function saveVersion() {
    setSaving(true);
    await saveDocumentVersion(doc.id, doc.raw_text || "(snapshot)", vNote);
    setVNote("");
    await loadVersions();
    setSaving(false);
  }

  async function addLink() {
    if (!linkReqId) return;
    setSaving(true);
    await linkDocumentToRequest(doc.id, linkReqId, linkNote);
    setLinkReqId(""); setLinkNote("");
    await loadLinks();
    setSaving(false);
  }

  async function removeLink(reqId) {
    await removeDocumentLink(doc.id, reqId);
    loadLinks();
  }

  const citation = buildCitation(doc);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#0007", zIndex: 900, display: "flex", alignItems: "flex-end", justifyContent: "flex-start" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ width: 420, height: "100vh", background: "#fff", boxShadow: "-4px 0 30px #0002", display: "flex", flexDirection: "column", direction: "rtl", fontFamily: "'Cairo',sans-serif", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "18px 20px", borderBottom: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: ".95rem", color: "#1a1510", marginBottom: 4 }}>{doc.title}</div>
            <div style={{ fontSize: ".72rem", color: "#6f6a61" }}>
              {doc.file_type?.toUpperCase()} — {doc.chunk_count || 0} قطعة — v{doc.version || 1}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#aaa" }}>✕</button>
        </div>

        {/* Panel Tabs */}
        <div style={{ display: "flex", borderBottom: `1px solid ${BORDER}` }}>
          {[["versions", "📜 الإصدارات"], ["links", "🔗 الطلبات"], ["citation", "🗂️ الاستشهاد"]].map(([k, l]) => (
            <button key={k} onClick={() => setPanelTab(k)} style={{
              flex: 1, background: "none", border: "none", borderBottom: `2px solid ${panelTab === k ? G : "transparent"}`,
              color: panelTab === k ? G : "#6f6a61", padding: "10px 4px", cursor: "pointer",
              fontSize: ".78rem", fontWeight: panelTab === k ? 700 : 400, fontFamily: "inherit",
            }}>{l}</button>
          ))}
        </div>

        {/* Panel Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: 18 }}>

          {panelTab === "versions" && (
            <div>
              <div style={{ marginBottom: 14 }}>
                <input value={vNote} onChange={e => setVNote(e.target.value)} placeholder="ملاحظة الإصدار (اختياري)" style={{ ...inputStyle, width: "100%", marginBottom: 8, boxSizing: "border-box" }} />
                <button onClick={saveVersion} disabled={saving} style={{ background: G, color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontWeight: 700, cursor: "pointer", fontSize: ".82rem", opacity: saving ? .7 : 1 }}>
                  💾 حفظ إصدار الآن
                </button>
              </div>
              {loadingV ? <p style={{ color: "#aaa" }}>تحميل...</p> : versions.length === 0 ? (
                <p style={{ color: "#aaa", fontSize: ".83rem" }}>لم يُحفظ أي إصدار بعد</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {versions.map((v, i) => (
                    <div key={v.id} style={{ background: "#f9f7f1", borderRadius: 8, padding: "10px 14px", borderRight: `3px solid ${G}` }}>
                      <div style={{ fontWeight: 700, fontSize: ".82rem", color: "#1a1510" }}>الإصدار {versions.length - i}</div>
                      {v.version_note && <div style={{ fontSize: ".75rem", color: "#6f6a61", marginTop: 2 }}>{v.version_note}</div>}
                      <div style={{ fontSize: ".7rem", color: "#aaa", marginTop: 4 }}>{new Date(v.created_at).toLocaleString("ar-SA")}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {panelTab === "links" && (
            <div>
              <div style={{ marginBottom: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                <select value={linkReqId} onChange={e => setLinkReqId(e.target.value)} style={{ ...inputStyle, width: "100%" }}>
                  <option value="">اختر طلباً للربط...</option>
                  {requests.map(r => <option key={r.id} value={r.id}>{r.request_number} — {r.clients?.full_name || "—"}</option>)}
                </select>
                <input value={linkNote} onChange={e => setLinkNote(e.target.value)} placeholder="ملاحظة (اختياري)" style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }} />
                <button onClick={addLink} disabled={saving || !linkReqId} style={{ background: G, color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontWeight: 700, cursor: "pointer", fontSize: ".82rem", opacity: (!linkReqId || saving) ? .6 : 1 }}>
                  🔗 ربط بالطلب
                </button>
              </div>
              {loadingL ? <p style={{ color: "#aaa" }}>تحميل...</p> : links.length === 0 ? (
                <p style={{ color: "#aaa", fontSize: ".83rem" }}>لا طلبات مرتبطة</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {links.map(l => (
                    <div key={l.id} style={{ background: "#f9f7f1", borderRadius: 8, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: ".82rem", color: "#1a1510" }}>{l.requests?.request_number}</div>
                        <div style={{ fontSize: ".72rem", color: "#6f6a61" }}>{l.requests?.clients?.full_name || "—"}</div>
                        {l.note && <div style={{ fontSize: ".7rem", color: "#aaa", marginTop: 2 }}>{l.note}</div>}
                      </div>
                      <button onClick={() => removeLink(l.request_id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#b94a48", fontSize: 16 }}>🗑️</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {panelTab === "citation" && (
            <div>
              <p style={{ fontSize: ".83rem", color: "#6f6a61", marginBottom: 12 }}>انسخ هذا النص للاستشهاد بالوثيقة:</p>
              <div style={{ background: "#f0ece3", borderRadius: 10, padding: 14, fontSize: ".85rem", fontWeight: 600, color: "#1a1510", marginBottom: 16, border: `1px solid ${BORDER}`, wordBreak: "break-all" }}>
                {citation}
              </div>
              <button onClick={() => navigator.clipboard?.writeText(citation)} style={{ background: G, color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontWeight: 700, cursor: "pointer", fontSize: ".82rem" }}>
                📋 نسخ الاستشهاد
              </button>
              {doc.linked_country && (
                <div style={{ marginTop: 16, padding: 12, background: "#f9f7f1", borderRadius: 8 }}>
                  <div style={{ fontSize: ".78rem", fontWeight: 700, color: G, marginBottom: 4 }}>معلومات التأشيرة</div>
                  <div style={{ fontSize: ".8rem", color: "#3a3530" }}>الدولة: {doc.linked_country}</div>
                  {doc.visa_type && <div style={{ fontSize: ".8rem", color: "#3a3530" }}>النوع: {doc.visa_type}</div>}
                  {doc.valid_until && <div style={{ fontSize: ".8rem", color: "#3a3530" }}>صالحة حتى: {new Date(doc.valid_until).toLocaleDateString("ar-SA")}</div>}
                  {doc.source_url && <a href={doc.source_url} target="_blank" rel="noreferrer" style={{ fontSize: ".78rem", color: "#3d6f9f", display: "block", marginTop: 4 }}>🔗 المصدر</a>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
