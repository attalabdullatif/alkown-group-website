// ═══════════════════════════════════════════════════════════════
// Country name → ISO-3166-1 alpha-2, for parsing Wikipedia visa tables.
// Wikipedia country cells link to an article whose title is the country
// name; this maps those titles (and common variants) to ISO codes.
// Normalization strips accents/punctuation/"the"/"republic of" so most
// spellings resolve without an explicit alias.
// ═══════════════════════════════════════════════════════════════

const norm = (s) =>
  (s || "")
    .normalize("NFD").replace(/[̀-ͯ]/g, "") // strip accents
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z ]/g, " ")
    .replace(/\b(the|republic of|state of|kingdom of|federation of|federated states of)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();

// canonical name → ISO (keys are normalized)
const MAP = {};
const add = (iso, ...names) => names.forEach((n) => { MAP[norm(n)] = iso; });

add("AF", "Afghanistan"); add("AL", "Albania"); add("DZ", "Algeria");
add("AD", "Andorra"); add("AO", "Angola"); add("AG", "Antigua and Barbuda");
add("AR", "Argentina"); add("AM", "Armenia"); add("AU", "Australia");
add("AT", "Austria"); add("AZ", "Azerbaijan"); add("BS", "Bahamas");
add("BH", "Bahrain"); add("BD", "Bangladesh"); add("BB", "Barbados");
add("BY", "Belarus"); add("BE", "Belgium"); add("BZ", "Belize");
add("BJ", "Benin"); add("BT", "Bhutan"); add("BO", "Bolivia");
add("BA", "Bosnia and Herzegovina", "Bosnia"); add("BW", "Botswana");
add("BR", "Brazil"); add("BN", "Brunei"); add("BG", "Bulgaria");
add("BF", "Burkina Faso"); add("BI", "Burundi"); add("CV", "Cape Verde", "Cabo Verde");
add("KH", "Cambodia"); add("CM", "Cameroon"); add("CA", "Canada");
add("CF", "Central African Republic"); add("TD", "Chad"); add("CL", "Chile");
add("CN", "China"); add("CO", "Colombia"); add("KM", "Comoros");
add("CG", "Congo", "Republic of the Congo"); add("CD", "Democratic Republic of the Congo", "DR Congo");
add("CR", "Costa Rica"); add("CI", "Ivory Coast", "Cote d'Ivoire");
add("HR", "Croatia"); add("CU", "Cuba"); add("CY", "Cyprus");
add("CZ", "Czech Republic", "Czechia"); add("DK", "Denmark"); add("DJ", "Djibouti");
add("DM", "Dominica"); add("DO", "Dominican Republic"); add("EC", "Ecuador");
add("EG", "Egypt"); add("SV", "El Salvador"); add("GQ", "Equatorial Guinea");
add("ER", "Eritrea"); add("EE", "Estonia"); add("SZ", "Eswatini", "Swaziland");
add("ET", "Ethiopia"); add("FJ", "Fiji"); add("FI", "Finland");
add("FR", "France"); add("GA", "Gabon"); add("GM", "Gambia");
add("GE", "Georgia", "Georgia (country)"); add("DE", "Germany"); add("GH", "Ghana");
add("GR", "Greece"); add("GD", "Grenada"); add("GT", "Guatemala");
add("GN", "Guinea"); add("GW", "Guinea-Bissau"); add("GY", "Guyana");
add("HT", "Haiti"); add("HN", "Honduras"); add("HU", "Hungary");
add("IS", "Iceland"); add("IN", "India"); add("ID", "Indonesia");
add("IR", "Iran"); add("IQ", "Iraq"); add("IE", "Ireland", "Republic of Ireland");
add("IL", "Israel"); add("IT", "Italy"); add("JM", "Jamaica");
add("JP", "Japan"); add("JO", "Jordan"); add("KZ", "Kazakhstan");
add("KE", "Kenya"); add("KI", "Kiribati"); add("KP", "North Korea");
add("KR", "South Korea"); add("KW", "Kuwait"); add("KG", "Kyrgyzstan");
add("LA", "Laos"); add("LV", "Latvia"); add("LB", "Lebanon");
add("LS", "Lesotho"); add("LR", "Liberia"); add("LY", "Libya");
add("LI", "Liechtenstein"); add("LT", "Lithuania"); add("LU", "Luxembourg");
add("MG", "Madagascar"); add("MW", "Malawi"); add("MY", "Malaysia");
add("MV", "Maldives"); add("ML", "Mali"); add("MT", "Malta");
add("MH", "Marshall Islands"); add("MR", "Mauritania"); add("MU", "Mauritius");
add("MX", "Mexico"); add("FM", "Micronesia", "Federated States of Micronesia");
add("MD", "Moldova"); add("MC", "Monaco"); add("MN", "Mongolia");
add("ME", "Montenegro"); add("MA", "Morocco"); add("MZ", "Mozambique");
add("MM", "Myanmar", "Burma"); add("NA", "Namibia"); add("NR", "Nauru");
add("NP", "Nepal"); add("NL", "Netherlands"); add("NZ", "New Zealand");
add("NI", "Nicaragua"); add("NE", "Niger"); add("NG", "Nigeria");
add("MK", "North Macedonia", "Macedonia"); add("NO", "Norway"); add("OM", "Oman");
add("PK", "Pakistan"); add("PW", "Palau"); add("PS", "Palestine", "State of Palestine");
add("PA", "Panama"); add("PG", "Papua New Guinea"); add("PY", "Paraguay");
add("PE", "Peru"); add("PH", "Philippines"); add("PL", "Poland");
add("PT", "Portugal"); add("QA", "Qatar"); add("RO", "Romania");
add("RU", "Russia"); add("RW", "Rwanda"); add("KN", "Saint Kitts and Nevis");
add("LC", "Saint Lucia"); add("VC", "Saint Vincent and the Grenadines");
add("WS", "Samoa"); add("SM", "San Marino"); add("ST", "Sao Tome and Principe");
add("SA", "Saudi Arabia"); add("SN", "Senegal"); add("RS", "Serbia");
add("SC", "Seychelles"); add("SL", "Sierra Leone"); add("SG", "Singapore");
add("SK", "Slovakia"); add("SI", "Slovenia"); add("SB", "Solomon Islands");
add("SO", "Somalia"); add("ZA", "South Africa"); add("SS", "South Sudan");
add("ES", "Spain"); add("LK", "Sri Lanka"); add("SD", "Sudan");
add("SR", "Suriname"); add("SE", "Sweden"); add("CH", "Switzerland");
add("SY", "Syria"); add("TW", "Taiwan"); add("TJ", "Tajikistan");
add("TZ", "Tanzania"); add("TH", "Thailand"); add("TL", "East Timor", "Timor-Leste");
add("TG", "Togo"); add("TO", "Tonga"); add("TT", "Trinidad and Tobago");
add("TN", "Tunisia"); add("TR", "Turkey", "Turkiye"); add("TM", "Turkmenistan");
add("TV", "Tuvalu"); add("UG", "Uganda"); add("UA", "Ukraine");
add("AE", "United Arab Emirates"); add("GB", "United Kingdom");
add("US", "United States"); add("UY", "Uruguay"); add("UZ", "Uzbekistan");
add("VU", "Vanuatu"); add("VA", "Vatican City", "Holy See"); add("VE", "Venezuela");
add("VN", "Vietnam"); add("YE", "Yemen"); add("ZM", "Zambia"); add("ZW", "Zimbabwe");

// Territories / special entities commonly listed in these tables
add("HK", "Hong Kong"); add("MO", "Macau", "Macao"); add("XK", "Kosovo");
add("AI", "Anguilla"); add("AW", "Aruba"); add("BM", "Bermuda");
add("VG", "British Virgin Islands"); add("KY", "Cayman Islands");
add("CK", "Cook Islands"); add("CW", "Curacao"); add("FO", "Faroe Islands");
add("PF", "French Polynesia"); add("GI", "Gibraltar"); add("GL", "Greenland");
add("GP", "Guadeloupe"); add("MS", "Montserrat"); add("NC", "New Caledonia");
add("NU", "Niue"); add("PR", "Puerto Rico"); add("RE", "Reunion");
add("BL", "Saint Barthelemy"); add("SH", "Saint Helena"); add("MF", "Saint Martin");
add("PM", "Saint Pierre and Miquelon"); add("SX", "Sint Maarten");
add("TC", "Turks and Caicos Islands"); add("WF", "Wallis and Futuna");
add("AS", "American Samoa"); add("GU", "Guam"); add("MP", "Northern Mariana Islands");
add("VI", "United States Virgin Islands", "US Virgin Islands");
add("GF", "French Guiana"); add("YT", "Mayotte"); add("FK", "Falkland Islands");
add("MQ", "Martinique"); add("TK", "Tokelau"); add("NF", "Norfolk Island");
add("CX", "Christmas Island"); add("CC", "Cocos Islands");

function nameToIso(name) {
  return MAP[norm(name)] || null;
}

module.exports = { nameToIso, norm };
