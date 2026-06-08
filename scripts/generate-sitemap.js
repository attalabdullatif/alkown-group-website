// ═══════════════════════════════════════════════════════════════
// ALKOWN GLOBAL — Auto Sitemap Generator
// يولّد sitemap.xml تلقائياً قبل كل بناء
// ═══════════════════════════════════════════════════════════════

const fs   = require("fs");
const path = require("path");

const BASE_URL  = "https://www.alkownglobal.com";
const TODAY     = new Date().toISOString().split("T")[0];
const OUT_PATH  = path.join(__dirname, "..", "public", "sitemap.xml");

// ── Static pages ─────────────────────────────────────────────
const STATIC_PAGES = [
  { url: "/",                  priority: "1.0",  changefreq: "daily" },
  { url: "/visa-center",       priority: "0.9",  changefreq: "weekly" },
  { url: "/company-formation", priority: "0.85", changefreq: "weekly" },
  { url: "/knowledge-center",  priority: "0.85", changefreq: "weekly" },
  { url: "/track-application", priority: "0.7",  changefreq: "monthly" },
  { url: "/track-request",     priority: "0.6",  changefreq: "monthly" },
  { url: "/portal",            priority: "0.6",  changefreq: "monthly" },
  { url: "/verify-invoice",    priority: "0.5",  changefreq: "monthly" },
  { url: "/login",             priority: "0.4",  changefreq: "yearly" },
];

// ── Country codes (top 50 countries) ─────────────────────────
const COUNTRIES = [
  { code: "SY", slug: "syria"          },
  { code: "AE", slug: "uae"            },
  { code: "TR", slug: "turkey"         },
  { code: "SA", slug: "saudi-arabia"   },
  { code: "JO", slug: "jordan"         },
  { code: "LB", slug: "lebanon"        },
  { code: "IQ", slug: "iraq"           },
  { code: "EG", slug: "egypt"          },
  { code: "DE", slug: "germany"        },
  { code: "FR", slug: "france"         },
  { code: "GB", slug: "uk"             },
  { code: "IT", slug: "italy"          },
  { code: "ES", slug: "spain"          },
  { code: "PT", slug: "portugal"       },
  { code: "NL", slug: "netherlands"    },
  { code: "US", slug: "usa"            },
  { code: "CA", slug: "canada"         },
  { code: "AU", slug: "australia"      },
  { code: "JP", slug: "japan"          },
  { code: "KR", slug: "south-korea"    },
  { code: "CN", slug: "china"          },
  { code: "IN", slug: "india"          },
  { code: "PK", slug: "pakistan"       },
  { code: "BD", slug: "bangladesh"     },
  { code: "PH", slug: "philippines"    },
  { code: "ID", slug: "indonesia"      },
  { code: "MY", slug: "malaysia"       },
  { code: "TH", slug: "thailand"       },
  { code: "GR", slug: "greece"         },
  { code: "MT", slug: "malta"          },
  { code: "CY", slug: "cyprus"         },
  { code: "AT", slug: "austria"        },
  { code: "CH", slug: "switzerland"    },
  { code: "SE", slug: "sweden"         },
  { code: "NO", slug: "norway"         },
  { code: "DK", slug: "denmark"        },
  { code: "FI", slug: "finland"        },
  { code: "PL", slug: "poland"         },
  { code: "RO", slug: "romania"        },
  { code: "HU", slug: "hungary"        },
  { code: "CZ", slug: "czechia"        },
  { code: "RU", slug: "russia"         },
  { code: "UA", slug: "ukraine"        },
  { code: "KW", slug: "kuwait"         },
  { code: "QA", slug: "qatar"          },
  { code: "BH", slug: "bahrain"        },
  { code: "OM", slug: "oman"           },
  { code: "MA", slug: "morocco"        },
  { code: "TN", slug: "tunisia"        },
  { code: "DZ", slug: "algeria"        },
];

// ── High-priority visa routes (origin → destination) ─────────
const HIGH_PRIORITY_ROUTES = [
  ["syria",       "uae"        ],
  ["syria",       "turkey"     ],
  ["syria",       "germany"    ],
  ["syria",       "uk"         ],
  ["syria",       "canada"     ],
  ["syria",       "usa"        ],
  ["syria",       "france"     ],
  ["syria",       "italy"      ],
  ["syria",       "spain"      ],
  ["syria",       "portugal"   ],
  ["syria",       "greece"     ],
  ["syria",       "australia"  ],
  ["syria",       "japan"      ],
  ["uae",         "germany"    ],
  ["uae",         "france"     ],
  ["uae",         "uk"         ],
  ["uae",         "usa"        ],
  ["uae",         "canada"     ],
  ["uae",         "italy"      ],
  ["uae",         "spain"      ],
  ["uae",         "japan"      ],
  ["uae",         "australia"  ],
  ["turkey",      "germany"    ],
  ["turkey",      "france"     ],
  ["turkey",      "uk"         ],
  ["turkey",      "usa"        ],
  ["saudi-arabia","germany"    ],
  ["saudi-arabia","uk"         ],
  ["saudi-arabia","usa"        ],
  ["saudi-arabia","canada"     ],
  ["egypt",       "uae"        ],
  ["egypt",       "germany"    ],
  ["egypt",       "uk"         ],
  ["jordan",      "uae"        ],
  ["jordan",      "germany"    ],
  ["india",       "uae"        ],
  ["india",       "usa"        ],
  ["india",       "canada"     ],
  ["pakistan",    "uae"        ],
  ["pakistan",    "uk"         ],
  ["philippines", "uae"        ],
  ["indonesia",   "uae"        ],
  ["malaysia",    "uae"        ],
];

// ── Generate all visa route pages ─────────────────────────────
function buildVisaRoutes() {
  const routes = [];
  const seen   = new Set();

  // High-priority routes first
  for (const [origin, dest] of HIGH_PRIORITY_ROUTES) {
    const slug = `${origin}-to-${dest}`;
    if (seen.has(slug)) continue;
    seen.add(slug);
    routes.push({ url: `/visa/${slug}`, priority: "0.8", changefreq: "weekly" });
  }

  // All country-pair combinations (lower priority)
  for (const origin of COUNTRIES) {
    for (const dest of COUNTRIES) {
      if (origin.code === dest.code) continue;
      const slug = `${origin.slug}-to-${dest.slug}`;
      if (seen.has(slug)) continue;
      seen.add(slug);
      routes.push({ url: `/visa/${slug}`, priority: "0.6", changefreq: "monthly" });
    }
  }

  return routes;
}

// ── Build XML ────────────────────────────────────────────────
function buildXML(entries) {
  const urls = entries.map(({ url, priority, changefreq }) => `
  <url>
    <loc>${BASE_URL}${url}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
    http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urls}
</urlset>`;
}

// ── Run ──────────────────────────────────────────────────────
const visaRoutes  = buildVisaRoutes();
const allEntries  = [...STATIC_PAGES, ...visaRoutes];
const xml         = buildXML(allEntries);

fs.writeFileSync(OUT_PATH, xml, "utf8");

console.log(`✅ Sitemap generated: ${allEntries.length} URLs`);
console.log(`   📄 Static pages  : ${STATIC_PAGES.length}`);
console.log(`   🛂 Visa routes   : ${visaRoutes.length}`);
console.log(`   📍 Output        : ${OUT_PATH}`);
