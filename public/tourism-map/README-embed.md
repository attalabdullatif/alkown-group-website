# الخريطة السياحية التفاعلية — دليل التضمين

تطبيق ويب مستقل (Leaflet + OpenStreetMap) قابل للتضمين في أي موقع.
الملفات: `index.html` · `styles.css` · `app.js` · `data.json`.

---

## 1. كيف يعمل (نظرة سريعة)
- `app.js` يقرأ `data.json` ويبني **التبويبات والعلامات تلقائيًا**.
- اختيار دولة → تتحرك الخريطة (center + zoom) وتظهر علاماتها.
- الضغط على علامة → لوحة تفاصيل (اسم AR/EN، صورة، فئة، وصف، زرّ اتجاهات Google Maps).

---

## 2. إضافة دولة جديدة (بدون لمس الكود!)
افتح `data.json` وأضف كتلة جديدة داخل `"countries"` فقط:

```json
"egypt": {
  "nameAr": "مصر", "nameEn": "Egypt", "flag": "🇪🇬",
  "center": [26.8, 30.8], "zoom": 6,
  "locations": [
    {
      "id": "giza-pyramids",
      "nameAr": "أهرامات الجيزة", "nameEn": "Giza Pyramids",
      "coords": [29.9792, 31.1342],
      "categoryAr": "موقع أثري", "categoryEn": "Archaeological Site",
      "image": "https://your-image-url.jpg",
      "descAr": "وصف بالعربية…", "descEn": "Description in English…"
    }
  ]
}
```
احفظ الملف — يظهر التبويب والعلامات فورًا. **صفر تعديل في JavaScript.**

> 💡 الصور الحالية روابط تجريبية (picsum.photos). استبدل قيمة `"image"` برابط صورك الحقيقية، أو ضع صورك في مجلد `images/` واكتب `"image": "images/giza.jpg"`.

---

## 3. التضمين في موقعك (طريقة iframe — الأبسط)
بما أن الملفات داخل `public/tourism-map/`، فهي تُنشر مع موقعك على:
`https://alkownglobal.com/tourism-map/`

لعرض الخريطة في أي صفحة (HTML، أو داخل مكوّن React)، ألصق:

```html
<iframe
  src="/tourism-map/index.html"
  title="الخريطة السياحية"
  style="width:100%; height:600px; border:0; border-radius:16px;"
  loading="lazy">
</iframe>
```

### داخل React (مثلًا صفحة Travel)
```jsx
<iframe
  src="/tourism-map/index.html"
  title="الخريطة السياحية"
  style={{ width: "100%", height: 600, border: 0, borderRadius: 16 }}
  loading="lazy"
/>
```

### في موقع خارجي (نطاق مختلف)
استخدم الرابط الكامل:
```html
<iframe src="https://alkownglobal.com/tourism-map/index.html" ...></iframe>
```

---

## 4. تجربته محليًا
لأن `app.js` يجلب `data.json` عبر `fetch`، يجب فتحه عبر **خادم** لا بالنقر المزدوج
(المتصفح يمنع fetch من `file://`). أبسط طريقة:

```bash
# داخل مجلد tourism-map
npx serve .
# أو
python -m http.server 8000
```
ثم افتح `http://localhost:8000`.

عند نشر الموقع على Vercel، يعمل تلقائيًا دون أي إعداد.

---

## 5. ملاحظات
- لا يعتمد على أي مكتبة سوى Leaflet (عبر CDN) — لا خطوة بناء.
- مستقل تمامًا: لا يؤثر على تطبيق React أو قاعدة البيانات أو الـ CI.
- لتغيير الألوان، عدّل متغيّرات `:root` أعلى `styles.css`.
- ارتفاع الـ iframe ثابت (600px)؛ عدّله حسب حاجتك.
