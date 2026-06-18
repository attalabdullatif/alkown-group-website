/* ══════════════════════════════════════════════════════════════
   Alkown Global — Interactive Tourism Map (Leaflet + OSM)

   Design goal: adding a new country requires editing data.json ONLY.
   This file never hard-codes country names — tabs and markers are
   built dynamically from whatever data.json contains.
   ══════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  // ── DOM refs ───────────────────────────────────────────────
  var tabsEl    = document.getElementById("tm-tabs");
  var panelEl   = document.getElementById("tm-panel");
  var panelBody = document.getElementById("tm-panel-body");
  var closeBtn  = document.getElementById("tm-panel-close");
  var overlay   = document.getElementById("tm-overlay");

  // ── State ──────────────────────────────────────────────────
  var map;
  var markerLayer;            // a LayerGroup holding the current country's markers
  var countriesData = {};     // populated from data.json
  var activeKey = null;

  // ── 1. Initialise the Leaflet map ──────────────────────────
  function initMap() {
    map = L.map("map", { zoomControl: true, attributionControl: true });

    // Establish an initial regional view so the first flyTo() has a
    // valid center/zoom to animate from (Leaflet requires a view to exist).
    map.setView([29, 42], 4);

    // OpenStreetMap tiles — accurate, free, good coverage of remote areas.
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    markerLayer = L.layerGroup().addTo(map);
  }

  // ── 2. Custom gold marker icon (styled in CSS) ─────────────
  function makeIcon() {
    return L.divIcon({
      className: "tm-marker",
      html: '<div class="tm-pin"></div>',
      iconSize: [26, 26],
      iconAnchor: [13, 26],   // tip of the pin
      popupAnchor: [0, -24]
    });
  }

  // ── 3. Build country tabs from the data keys ───────────────
  function buildTabs() {
    tabsEl.innerHTML = "";
    Object.keys(countriesData).forEach(function (key) {
      var c = countriesData[key];
      var btn = document.createElement("button");
      btn.className = "tm-tab";
      btn.type = "button";
      btn.dataset.key = key;
      btn.innerHTML = (c.flag ? c.flag + " " : "") + (c.nameAr || key);
      btn.addEventListener("click", function () { selectCountry(key); });
      tabsEl.appendChild(btn);
    });
  }

  // ── 4. Select a country: pan/zoom + render its markers ─────
  function selectCountry(key) {
    var country = countriesData[key];
    if (!country) return;
    activeKey = key;

    // Highlight the active tab.
    Array.prototype.forEach.call(tabsEl.children, function (btn) {
      btn.classList.toggle("active", btn.dataset.key === key);
    });

    // Pan & zoom to the country (center + zoom come from data.json).
    map.flyTo(country.center, country.zoom, { duration: 0.8 });

    // Render markers.
    markerLayer.clearLayers();
    (country.locations || []).forEach(function (loc) {
      var marker = L.marker(loc.coords, { icon: makeIcon(), title: loc.nameAr });
      marker.bindPopup("<b>" + escapeHtml(loc.nameAr) + "</b>");
      marker.on("click", function () { showDetails(loc); });
      marker.on("mouseover", function () { marker.openPopup(); });
      markerLayer.addLayer(marker);
    });

    // Close any open details panel when switching country.
    closePanel();
  }

  // ── 5. Details panel ───────────────────────────────────────
  function showDetails(loc) {
    var directions =
      "https://www.google.com/maps/dir/?api=1&destination=" +
      loc.coords[0] + "," + loc.coords[1];

    panelBody.innerHTML =
      '<img class="tm-loc-img" src="' + escapeAttr(loc.image) + '" alt="' + escapeAttr(loc.nameAr) + '" ' +
        'onerror="this.style.display=\'none\'" />' +
      '<div class="tm-loc-content">' +
        '<span class="tm-loc-cat">' + escapeHtml(loc.categoryAr || "") + "</span>" +
        '<div class="tm-loc-name">' + escapeHtml(loc.nameAr) + "</div>" +
        '<div class="tm-loc-name-en">' + escapeHtml(loc.nameEn || "") + "</div>" +
        '<p class="tm-loc-desc">' + escapeHtml(loc.descAr || "") +
          (loc.descEn ? '<span class="tm-loc-desc-en">' + escapeHtml(loc.descEn) + "</span>" : "") +
        "</p>" +
        '<a class="tm-directions" href="' + directions + '" target="_blank" rel="noopener">' +
          "🧭 احصل على الاتجاهات</a>" +
      "</div>";

    openPanel();

    // Center the map on the selected location.
    map.panTo(loc.coords);
  }

  function openPanel()  { panelEl.classList.add("open"); }
  function closePanel() {
    panelEl.classList.remove("open");
    // Reset to the empty state after the slide-out animation.
    setTimeout(function () {
      if (!panelEl.classList.contains("open")) {
        panelBody.innerHTML =
          '<div class="tm-empty"><div class="tm-empty-icon">🗺️</div>' +
          "<p>اختر دولة ثم اضغط على أي علامة على الخريطة لعرض تفاصيل الموقع.</p></div>";
      }
    }, 360);
  }
  closeBtn.addEventListener("click", closePanel);

  // ── 6. Tiny HTML-escaping helpers (defense against bad data) ─
  function escapeHtml(v) {
    return String(v == null ? "" : v)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function escapeAttr(v) { return escapeHtml(v).replace(/'/g, "&#39;"); }

  // ── 7. Boot: load data, then wire everything up ────────────
  function boot() {
    initMap();
    fetch("data.json")
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (json) {
        countriesData = (json && json.countries) || {};
        var keys = Object.keys(countriesData);
        if (keys.length === 0) throw new Error("No countries in data.json");

        buildTabs();
        selectCountry(keys[0]);           // open the first country by default
        overlay.classList.add("hidden");  // hide the loader
      })
      .catch(function (err) {
        overlay.textContent = "تعذّر تحميل بيانات الخريطة. حدّث الصفحة وحاول مجددًا.";
        overlay.classList.add("error");
        // eslint-disable-next-line no-console
        console.error("[TourismMap]", err);
      });
  }

  // Start once the DOM is ready.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
