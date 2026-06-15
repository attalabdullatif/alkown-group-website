import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { CRM_COLORS } from "../../components/crmUi";

const DOC_FOLDERS = [
  { key: "passport",      label: "جواز السفر",         icon: "🛂", required: true },
  { key: "photo",         label: "صور شخصية",          icon: "📷", required: true },
  { key: "bank",          label: "كشف حساب بنكي",      icon: "🏦", required: false },
  { key: "employment",    label: "عقد العمل",           icon: "💼", required: false },
  { key: "criminal",      label: "سجل جنائي",          icon: "📜", required: true },
  { key: "health",        label: "تأمين صحي",          icon: "🏥", required: false },
  { key: "visa_form",     label: "نموذج تأشيرة",       icon: "📋", required: true },
  { key: "sponsor",       label: "وثيقة كفيل",         icon: "🤝", required: false },
  { key: "property",      label: "ملكية عقارية",       icon: "🏠", required: false },
  { key: "education",     label: "شهادات دراسية",      icon: "🎓", required: false },
  { key: "other",         label: "وثائق أخرى",         icon: "📁", required: false },
];

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_SIZE_MB = 10;

function formatSize(bytes) {
  if (!bytes) return "—";
  if (bytes > 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" });
}

// ── Document Card ──────────────────────────────────────────────
function DocCard({ file, onDelete, onPreview }) {
  const isImage = file.file_name && /\.(jpg|jpeg|png|webp)$/i.test(file.file_name);
  const isPDF = file.file_name && /\.pdf$/i.test(file.file_name);
  const expired = file.expires_at && new Date(file.expires_at) < new Date();

  return (
    <div style={{
      background: "#fff", border: `1px solid ${expired ? "#fcc" : CRM_COLORS.border}`,
      borderRadius: 8, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 8, flexShrink: 0,
        background: isImage ? `${CRM_COLORS.gold}12` : `${CRM_COLORS.info || "#3d6f9f"}12`,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem"
      }}>
        {isImage ? "🖼️" : isPDF ? "📄" : "📎"}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, color: CRM_COLORS.text, fontSize: ".88rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.file_name}</div>
        <div style={{ fontSize: ".72rem", color: CRM_COLORS.muted, marginTop: 2 }}>
          {formatDate(file.created_at)}
          {file.file_size ? ` · ${formatSize(file.file_size)}` : ""}
          {expired && <span style={{ color: "#c0392b", fontWeight: 700, marginRight: 6 }}>· منتهي الصلاحية</span>}
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        <button onClick={() => onPreview(file)} style={{ padding: "5px 12px", borderRadius: 6, border: `1px solid ${CRM_COLORS.border}`, background: "transparent", color: CRM_COLORS.muted, cursor: "pointer", fontSize: ".75rem" }}>عرض</button>
        <button onClick={() => onDelete(file)} style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid #fcc", background: "transparent", color: "#c0392b", cursor: "pointer", fontSize: ".75rem" }}>حذف</button>
      </div>
    </div>
  );
}

// ── Upload Zone ────────────────────────────────────────────────
function UploadZone({ folder, requestId, onUploaded }) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  async function handleFiles(files) {
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) { alert(`نوع الملف غير مدعوم: ${file.name}`); continue; }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) { alert(`الملف كبير جداً (الحد ${MAX_SIZE_MB} MB): ${file.name}`); continue; }
      setUploading(true);
      const safeName = file.name.replace(/[^\w.-]+/g, "-");
      const path = `${requestId}/${folder.key}/${Date.now()}-${safeName}`;
      const { error: upErr } = await supabase.storage.from("request-documents").upload(path, file, { upsert: false });
      if (!upErr) {
        await supabase.from("request_files").insert([{
          request_id: requestId,
          file_type: folder.key,
          file_name: file.name,
          storage_path: path,
          file_size: file.size,
        }]);
      }
    }
    setUploading(false);
    onUploaded();
  }

  return (
    <label
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        border: `2px dashed ${dragOver ? CRM_COLORS.gold : CRM_COLORS.border}`,
        borderRadius: 8, padding: "20px 12px", cursor: "pointer", background: dragOver ? `${CRM_COLORS.gold}08` : CRM_COLORS.beige,
        transition: "all .2s", marginTop: 10
      }}
      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(Array.from(e.dataTransfer.files)); }}
    >
      <input type="file" multiple style={{ display: "none" }} accept=".jpg,.jpeg,.png,.webp,.pdf"
        onChange={e => handleFiles(Array.from(e.target.files))} disabled={uploading} />
      <span style={{ fontSize: "1.8rem", marginBottom: 6 }}>{uploading ? "⏳" : "⬆️"}</span>
      <span style={{ fontSize: ".78rem", color: CRM_COLORS.muted, textAlign: "center" }}>
        {uploading ? "جارٍ الرفع..." : "اسحب الملفات هنا أو انقر للاختيار"}
      </span>
      <span style={{ fontSize: ".65rem", color: CRM_COLORS.muted, marginTop: 4 }}>PDF, JPG, PNG · حد {MAX_SIZE_MB}MB</span>
    </label>
  );
}

// ══════════════════════════════════════════════════════════════
// DOCUMENT CENTER
// ══════════════════════════════════════════════════════════════
export default function DocumentCenter() {
  const { user } = useAuth(); // eslint-disable-line no-unused-vars
  const [requests, setRequests] = useState([]);
  const [selectedReq, setSelectedReq] = useState(null);
  const [files, setFiles] = useState([]);
  const [activeFolder, setActiveFolder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    supabase.from("requests").select("id, request_number, clients(full_name)").order("created_at", { ascending: false })
      .then(({ data }) => setRequests(data || []));
  }, []);

  const loadFiles = useCallback(async (reqId) => {
    setLoading(true);
    const { data } = await supabase.from("request_files").select("*").eq("request_id", reqId).order("created_at", { ascending: false });
    setFiles(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (selectedReq) loadFiles(selectedReq.id);
    else setFiles([]);
  }, [selectedReq, loadFiles]);

  async function deleteFile(file) {
    if (!window.confirm(`حذف الملف "${file.file_name}"؟`)) return;
    if (file.storage_path) await supabase.storage.from("request-documents").remove([file.storage_path]);
    await supabase.from("request_files").delete().eq("id", file.id);
    setFiles(prev => prev.filter(f => f.id !== file.id));
  }

  async function previewFile(file) {
    if (!file.storage_path) return;
    const { data } = await supabase.storage.from("request-documents").createSignedUrl(file.storage_path, 3600);
    if (data?.signedUrl) setPreviewUrl({ url: data.signedUrl, name: file.file_name });
  }

  const filteredRequests = requests.filter(r =>
    !search || (r.request_number || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.clients?.full_name || "").toLowerCase().includes(search.toLowerCase())
  );

  const folderFiles = folder => files.filter(f => f.file_type === folder.key);
  const missingRequired = DOC_FOLDERS.filter(f => f.required && folderFiles(f).length === 0);
  const allFolderFiles = activeFolder ? folderFiles(activeFolder) : files; // eslint-disable-line no-unused-vars

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Cairo','Segoe UI',sans-serif", background: "#f5f3ef" }}>
      {/* Left Panel: Request List */}
      <div style={{ width: 280, borderRight: `1px solid ${CRM_COLORS.border}`, background: "#fff", overflowY: "auto", flexShrink: 0 }}>
        <div style={{ padding: "20px 16px", borderBottom: `1px solid ${CRM_COLORS.border}` }}>
          <h2 style={{ margin: "0 0 12px", fontSize: "1rem", fontWeight: 800, color: CRM_COLORS.text }}>مركز الوثائق</h2>
          <input placeholder="بحث..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", padding: "8px 12px", border: `1px solid ${CRM_COLORS.border}`, borderRadius: 6, fontSize: ".82rem", background: "#fff" }} />
        </div>
        <div>
          {filteredRequests.map(req => (
            <div key={req.id} onClick={() => { setSelectedReq(req); setActiveFolder(null); }} style={{
              padding: "12px 16px", cursor: "pointer", borderBottom: `1px solid ${CRM_COLORS.border}`,
              background: selectedReq?.id === req.id ? `${CRM_COLORS.gold}12` : "transparent",
              borderRight: selectedReq?.id === req.id ? `3px solid ${CRM_COLORS.gold}` : "3px solid transparent",
              transition: "all .15s"
            }}>
              <div style={{ fontWeight: 600, color: CRM_COLORS.text, fontSize: ".85rem" }}>{req.clients?.full_name || "—"}</div>
              <div style={{ fontSize: ".72rem", color: CRM_COLORS.gold, marginTop: 2 }}>{req.request_number}</div>
            </div>
          ))}
          {filteredRequests.length === 0 && (
            <div style={{ padding: "40px 16px", textAlign: "center", color: CRM_COLORS.muted, fontSize: ".85rem" }}>لا توجد طلبات</div>
          )}
        </div>
      </div>

      {/* Main area */}
      <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
        {!selectedReq ? (
          <div style={{ textAlign: "center", paddingTop: 100 }}>
            <div style={{ fontSize: "3rem", marginBottom: 16 }}>📁</div>
            <p style={{ color: CRM_COLORS.muted }}>اختر طلباً من القائمة لعرض وثائقه</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: CRM_COLORS.text }}>{selectedReq.clients?.full_name}</h2>
                <div style={{ fontSize: ".8rem", color: CRM_COLORS.gold, marginTop: 4 }}>{selectedReq.request_number}</div>
              </div>
              {missingRequired.length > 0 && (
                <div style={{ background: "#fff3cd", border: "1px solid #ffc107", borderRadius: 8, padding: "8px 14px", fontSize: ".78rem", color: "#856404" }}>
                  ⚠️ {missingRequired.length} وثائق مطلوبة مفقودة: {missingRequired.map(f => f.label).join("، ")}
                </div>
              )}
            </div>

            {/* Folder Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 10, marginBottom: 24 }}>
              {DOC_FOLDERS.map(folder => {
                const count = folderFiles(folder).length;
                const missing = folder.required && count === 0;
                const isActive = activeFolder?.key === folder.key;
                return (
                  <div key={folder.key} onClick={() => setActiveFolder(isActive ? null : folder)} style={{
                    background: isActive ? `${CRM_COLORS.gold}14` : "#fff",
                    border: `1.5px solid ${isActive ? CRM_COLORS.gold : missing ? "#fcc" : CRM_COLORS.border}`,
                    borderRadius: 8, padding: "14px 12px", textAlign: "center", cursor: "pointer", transition: "all .2s"
                  }}>
                    <div style={{ fontSize: "1.6rem", marginBottom: 6 }}>{folder.icon}</div>
                    <div style={{ fontSize: ".75rem", fontWeight: 700, color: CRM_COLORS.text, marginBottom: 4 }}>{folder.label}</div>
                    <div style={{ fontSize: ".68rem", color: count > 0 ? CRM_COLORS.gold : missing ? "#c0392b" : CRM_COLORS.muted, fontWeight: 600 }}>
                      {count > 0 ? `${count} ملف` : missing ? "مطلوب !" : "فارغ"}
                    </div>
                    {folder.required && <div style={{ fontSize: ".6rem", color: CRM_COLORS.muted, marginTop: 2 }}>مطلوب</div>}
                  </div>
                );
              })}
            </div>

            {/* Active folder content */}
            {activeFolder && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: CRM_COLORS.text }}>
                    {activeFolder.icon} {activeFolder.label}
                  </h3>
                  <button onClick={() => setActiveFolder(null)} style={{ background: "none", border: "none", color: CRM_COLORS.muted, cursor: "pointer", fontSize: ".82rem" }}>✕ إغلاق</button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                  {folderFiles(activeFolder).length === 0 ? (
                    <div style={{ textAlign: "center", padding: "24px 0", color: CRM_COLORS.muted, fontSize: ".85rem" }}>
                      لا توجد ملفات في هذا المجلد
                    </div>
                  ) : (
                    folderFiles(activeFolder).map(file => (
                      <DocCard key={file.id} file={file} onDelete={deleteFile} onPreview={previewFile} />
                    ))
                  )}
                </div>
                <UploadZone folder={activeFolder} requestId={selectedReq.id} onUploaded={() => loadFiles(selectedReq.id)} />
              </div>
            )}

            {/* All files (when no folder selected) */}
            {!activeFolder && (
              <div>
                <div style={{ fontSize: ".72rem", color: CRM_COLORS.muted, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 12 }}>
                  جميع الوثائق ({files.length})
                </div>
                {loading ? (
                  <div style={{ textAlign: "center", padding: "40px 0", color: CRM_COLORS.muted }}>جارٍ التحميل...</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {files.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "40px 0", color: CRM_COLORS.muted }}>لا توجد وثائق مرفوعة</div>
                    ) : (
                      files.map(file => <DocCard key={file.id} file={file} onDelete={deleteFile} onPreview={previewFile} />)
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Preview Modal */}
      {previewUrl && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.8)", zIndex: 2000, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
          onClick={e => e.target === e.currentTarget && setPreviewUrl(null)}>
          <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", maxWidth: "90vw", maxHeight: "85vh", width: "auto" }}>
            <div style={{ padding: "12px 20px", borderBottom: `1px solid ${CRM_COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 600, fontSize: ".9rem" }}>{previewUrl.name}</span>
              <div style={{ display: "flex", gap: 8 }}>
                <a href={previewUrl.url} download={previewUrl.name} style={{ padding: "6px 14px", borderRadius: 6, border: `1px solid ${CRM_COLORS.border}`, textDecoration: "none", color: CRM_COLORS.text, fontSize: ".8rem" }}>⬇️ تحميل</a>
                <button onClick={() => setPreviewUrl(null)} style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: CRM_COLORS.muted }}>✕</button>
              </div>
            </div>
            {/\.(jpg|jpeg|png|webp)$/i.test(previewUrl.name) ? (
              <img src={previewUrl.url} alt={previewUrl.name} style={{ maxWidth: "85vw", maxHeight: "75vh", objectFit: "contain", display: "block" }} />
            ) : (
              <iframe src={previewUrl.url} title={previewUrl.name} style={{ width: "75vw", height: "70vh", border: "none" }} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
