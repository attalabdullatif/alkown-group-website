// ═══════════════════════════════════════════════════════════════
// ALKOWN GLOBAL — Content Calendar (Phase 5)
// Monthly content planning and status tracking
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { getCalendarItems, updateContentItem } from "../../services/ai/contentService";

const G = "#c9a84c";
const BORDER = "rgba(201,168,76,.22)";

const STATUS_COLORS = { idea: "#aaa", draft: "#3d6f9f", review: "#c28a25", approved: "#059669", published: "#2f8f5b" };
const STATUS_AR     = { idea: "فكرة", draft: "مسودة", review: "مراجعة", approved: "موافق", published: "منشور" };

const DAYS_AR = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const MONTHS_AR = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];

export default function ContentCalendar() {
  const today = new Date();
  const [year,    setYear]    = useState(today.getFullYear());
  const [month,   setMonth]   = useState(today.getMonth());
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected,setSelected]= useState(null);

  useEffect(() => { load(); }, [year, month]);

  async function load() {
    setLoading(true);
    const { data } = await getCalendarItems(year, month + 1);
    setItems(data);
    setLoading(false);
  }

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function getItemsForDay(day) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return items.filter(i => i.calendar_date === dateStr);
  }

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }

  async function handleStatusChange(id, status) {
    await updateContentItem(id, { status });
    setItems(prev => prev.map(x => x.id === id ? { ...x, status } : x));
    if (selected?.id === id) setSelected(s => ({ ...s, status }));
  }

  // Summary counts
  const counts = { idea: 0, draft: 0, review: 0, approved: 0, published: 0 };
  items.forEach(i => { counts[i.status] = (counts[i.status] || 0) + 1; });

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", direction: "rtl", fontFamily: "'Cairo','Noto Naskh Arabic',sans-serif" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 32 }}>📅</span>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "#1a1510" }}>تقويم المحتوى</h1>
            <p style={{ margin: 0, fontSize: ".8rem", color: "#6f6a61" }}>{items.length} محتوى هذا الشهر</p>
          </div>
        </div>

        {/* Month nav */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={prevMonth} style={navBtn}>‹</button>
          <span style={{ fontWeight: 700, fontSize: "1rem", color: "#1a1510", minWidth: 130, textAlign: "center" }}>
            {MONTHS_AR[month]} {year}
          </span>
          <button onClick={nextMonth} style={navBtn}>›</button>
        </div>
      </div>

      {/* Status summary strip */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        {Object.entries(STATUS_AR).map(([k, v]) => (
          <div key={k} style={{
            background: `${STATUS_COLORS[k]}18`, border: `1px solid ${STATUS_COLORS[k]}44`,
            borderRadius: 20, padding: "4px 14px", fontSize: ".78rem",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: STATUS_COLORS[k], display: "inline-block" }} />
            <span style={{ color: STATUS_COLORS[k], fontWeight: 700 }}>{v}</span>
            <span style={{ color: "#aaa" }}>{counts[k] || 0}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 300px" : "1fr", gap: 20, alignItems: "start" }}>

        {/* Calendar Grid */}
        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,.05)" }}>
          {/* Day headers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", background: "#1a1510" }}>
            {DAYS_AR.map(d => (
              <div key={d} style={{ padding: "10px 4px", textAlign: "center", fontSize: ".72rem", fontWeight: 700, color: G }}>
                {d}
              </div>
            ))}
          </div>

          {/* Cells */}
          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "#aaa" }}>جاري التحميل…</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
              {cells.map((day, i) => {
                const dayItems = day ? getItemsForDay(day) : [];
                const isToday  = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                return (
                  <div key={i} style={{
                    minHeight: 90, borderLeft: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`,
                    padding: "6px", background: isToday ? "#fffdf8" : "#fff",
                  }}>
                    {day && (
                      <>
                        <div style={{
                          width: 26, height: 26, borderRadius: "50%",
                          background: isToday ? G : "transparent",
                          color: isToday ? "#fff" : "#3a3530",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: ".8rem", fontWeight: isToday ? 800 : 500, marginBottom: 4,
                        }}>
                          {day}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          {dayItems.slice(0, 3).map(item => (
                            <div
                              key={item.id}
                              onClick={() => setSelected(item)}
                              style={{
                                background: `${STATUS_COLORS[item.status] || G}22`,
                                borderRight: `3px solid ${STATUS_COLORS[item.status] || G}`,
                                borderRadius: 4, padding: "2px 6px",
                                fontSize: ".68rem", cursor: "pointer", overflow: "hidden",
                                textOverflow: "ellipsis", whiteSpace: "nowrap",
                                color: STATUS_COLORS[item.status] || G,
                                fontWeight: 600,
                              }}
                              title={item.title}
                            >
                              {item.title || item.type}
                            </div>
                          ))}
                          {dayItems.length > 3 && (
                            <div style={{ fontSize: ".65rem", color: "#aaa" }}>+{dayItems.length - 3} أخرى</div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selected && (
          <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, padding: "20px", boxShadow: "0 2px 10px rgba(0,0,0,.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <span style={{ fontWeight: 700, color: "#1a1510" }}>تفاصيل المحتوى</span>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: 18 }}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <div style={{ fontSize: ".72rem", color: "#aaa", marginBottom: 3 }}>العنوان</div>
                <div style={{ fontWeight: 700, color: "#1a1510" }}>{selected.title || selected.type}</div>
              </div>
              <div>
                <div style={{ fontSize: ".72rem", color: "#aaa", marginBottom: 3 }}>التاريخ</div>
                <div style={{ color: "#3a3530" }}>{selected.calendar_date}</div>
              </div>
              <div>
                <div style={{ fontSize: ".72rem", color: "#aaa", marginBottom: 3 }}>النوع</div>
                <div style={{ color: "#3a3530" }}>{selected.type}</div>
              </div>
              <div>
                <div style={{ fontSize: ".72rem", color: "#aaa", marginBottom: 6 }}>الحالة</div>
                <select
                  value={selected.status}
                  onChange={e => handleStatusChange(selected.id, e.target.value)}
                  style={{ padding: "8px 12px", border: `1px solid ${BORDER}`, borderRadius: 10, fontFamily: "inherit", fontSize: ".85rem", width: "100%" }}
                >
                  {Object.entries(STATUS_AR).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              {(selected.content_ar || selected.content_en) && (
                <div>
                  <div style={{ fontSize: ".72rem", color: "#aaa", marginBottom: 6 }}>المحتوى</div>
                  <div style={{ background: "#f7f1e6", borderRadius: 10, padding: "10px 12px", fontSize: ".8rem", lineHeight: 1.7, maxHeight: 200, overflowY: "auto", whiteSpace: "pre-wrap" }}>
                    {(selected.content_ar || selected.content_en || "").slice(0, 400)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const navBtn = {
  background: "#f7f1e6", border: `1px solid ${BORDER}`, borderRadius: 10,
  width: 36, height: 36, cursor: "pointer", fontSize: "1.1rem",
  display: "flex", alignItems: "center", justifyContent: "center",
};
