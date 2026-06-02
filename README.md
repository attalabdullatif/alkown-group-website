# Alkown Group Website
## مجموعة الكون — الموقع الرسمي

Premium bilingual (Arabic/English) corporate website.

---

## 🚀 Quick Start

### Install & Run Locally
```bash
npm install
npm start
```
Opens at: http://localhost:3000

### Build for Production
```bash
npm run build
```
Output: `/build` folder — ready to upload.

---

## ☁️ Deploy on Netlify (Recommended — FREE)

### Option A: Drag & Drop (Easiest)
1. Run `npm run build`
2. Go to https://netlify.com/drop
3. Drag the `build` folder → Live instantly!

### Option B: Connect GitHub (Auto-deploy)
1. Push this folder to GitHub
2. Go to https://app.netlify.com → "New site from Git"
3. Build command: `npm run build`
4. Publish directory: `build`
5. Click Deploy → Done!

### Custom Domain on Netlify
1. Go to Site Settings → Domain Management
2. Add custom domain: `alkown.global`
3. Update your DNS nameservers to Netlify's

---

## 🟠 Deploy on Hostinger

1. Run `npm run build`
2. Open Hostinger hPanel → File Manager
3. Navigate to `public_html`
4. Upload ALL contents of the `build` folder
5. The `.htaccess` file handles routing automatically

### Hostinger with Node.js Hosting
1. Upload the entire project folder
2. Set Node.js version to 18+
3. Entry point: `npm run build && npx serve -s build`

---

## 📁 Project Structure

```
alkown-group/
├── public/
│   ├── index.html          # Main HTML with loading screen
│   ├── _redirects          # Netlify SPA routing
│   └── .htaccess           # Apache/Hostinger routing
├── src/
│   ├── index.js            # React entry point
│   └── App.jsx             # Full website (all pages)
├── netlify.toml            # Netlify build config
└── package.json
```

---

## 🌐 Pages Included

| Page | EN | AR |
|------|----|----|
| Home | ✅ | ✅ |
| Travel & Visas | ✅ | ✅ |
| Citizenship Programs | ✅ | ✅ |
| Advertising Agency | ✅ | ✅ |
| Skills Academy | ✅ | ✅ |
| About Us | ✅ | ✅ |
| Contact | ✅ | ✅ |
| Consultation Booking | ✅ | ✅ |
| Client Dashboard | ✅ | ✅ |
| Student Portal | ✅ | ✅ |

---

## ✏️ Customization

### Update Contact Info
In `src/App.jsx`, search for:
- `+971 54 490 9522` → replace with real phone
- `info@alkown.global` → replace with real email
- `@alkown.global` → replace with Instagram handle

### Update WhatsApp Button
Search for `wa.me/971544909522` and update the number.

### Add Real Logo Image
Replace the text logo in the `Logo` component with:
```jsx
<img src="/logo.png" alt="Alkown Group" style={{ height: 48 }} />
```
Then place your `logo.png` in the `public/` folder.

---

## 📞 Support
Website: alkown.global
Instagram: @alkown.global
WhatsApp: +971 54 490 9522
