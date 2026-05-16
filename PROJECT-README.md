# Kafé na Kopci - Website Project

**Client:** Adriana Štosová  
**Contact:** +420 774 729 688, adstosova@gmail.com  
**Location:** Káva a Víno na Kopci (Modrá 192, Skalica)  
**Live URL:** https://www.kafenakopci.cz/  
**Repository:** https://github.com/caganekdavid-ux/kafe-na-kopci  

---

## Project Overview

Moderní jednostránkový web pro kavárnu "Kafé na Kopci" v Modré u Skalice. Web obsahuje:

- **Úvodní slider** s fotografiemi (5 slides)
- **Info sekce** s popisem kavárny
- **Galerie** s 70 fotografiemi (káva + slivovice)
- **Award sekce** - Regionální potravina 2023
- **Kontakty** - otevírací doba, mapa, telefon, email

---

## Tech Stack

- **Hosting:** GitHub Pages (zdarma)
- **Domain:** kafenakopci.cz (registrováno přes Wedos)
- **DNS:** Wedos
- **Framework:** Žádný - čistý HTML, CSS (Tailwind CDN), vanilla JavaScript
- **Galerie:** Custom implementace s pagination (12 fotek/stránka)
- **Obrázky:** Optimalizované JPEG (max 1200px, kvalita 85%)

---

## File Structure

```
kafe-na-kopci/
├── index.html              # Hlavní stránka
├── galerie.html            # Galerie (standalone page)
├── admin.html              # Admin tools (internal)
├── gallery.js              # Gallery logic (data loading)
├── gallery-data.json       # Image metadata (70 images)
├── CNAME                   # GitHub Pages custom domain
├── images/                 # Original images (70 files)
│   ├── Dkava-piti-*.jpg   # Káva fotky (64)
│   └── Fslivovice-*.jpg   # Slivovice fotky (6)
└── images/optimized/       # Optimized versions (70 files)
    ├── Dkava-piti-*.jpg
    └── Fslivovice-*.jpg
```

---

## DNS Configuration

**Active DNS records (Wedos):**

| Type  | Name                        | Value                  | TTL |
|-------|-----------------------------|------------------------|-----|
| CNAME | www                         | caganekdavid-ux.github.io | 300 |
| MX    | @                           | wes1-mx1.wedos.net (priority 1) | 300 |
| MX    | @                           | wes1-mx2.wedos.net (priority 1) | 300 |
| MX    | @                           | wes1-mx-backup.wedos.net (priority 10) | 300 |
| CNAME | ftp                         | 328801.w1.wedos.net    | 300 |
| CNAME | key1.wedos-dkim._domainkey  | key1.dkim-we.wedos.net | 300 |
| CNAME | key2.wedos-dkim._domainkey  | key2.dkim-we.wedos.net | 300 |

**Critical:** CNAME záznam pro `www` NESMÍ být smazán (potřebný pro GitHub Pages)

---

## GitHub Pages Setup

- **Repository:** caganekdavid-ux/kafe-na-kopci
- **Branch:** main
- **Custom domain:** www.kafenakopci.cz (configured via CNAME file)
- **HTTPS:** Enabled (Let's Encrypt)
- **Build:** Automatic on push to main

---

## Gallery System

### Data Structure (gallery-data.json)

```json
[
  {
    "src": "images/optimized/Dkava-piti-1.jpg",
    "alt": "Káva a pití v Kafé na Kopci",
    "category": "coffee"
  }
]
```

### Implementation

**Files involved:**
- `galerie.html` - UI, pagination controls (inline script)
- `gallery.js` - Data loading, lightbox
- `gallery-data.json` - Image metadata

**Key features:**
- **Pagination:** 12 images per page
- **Lightbox:** Click image → fullscreen view
- **Navigation:** Prev/Next page buttons + page numbers
- **Lazy loading:** DISABLED (eager loading due to pagination issues)

**Pagination logic (galerie.html inline script):**
```javascript
const ITEMS_PER_PAGE = 12;
let currentPage = 1;
let totalPages = Math.ceil(galleryData.length / ITEMS_PER_PAGE);

function renderGallery() {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, galleryData.length);
    // Render items [startIndex:endIndex]
}
```

**Script load order (CRITICAL):**
```html
<!-- 1. Define pagination functions FIRST -->
<script>
    function renderGallery() { ... }
    function renderPagination() { ... }
</script>

<!-- 2. Load gallery.js AFTER (calls renderGallery) -->
<script src="gallery.js"></script>
```

If order reversed → `renderGallery is not defined` error!

---

## Image Optimization

### Original Images
- **Location:** `images/` folder
- **Count:** 70 images (as of 2026-05-16)
- **Káva:** 64 images (Dkava-piti-*.jpg)
- **Slivovice:** 6 images (Fslivovice-*.jpg)

### Optimized Images
- **Location:** `images/optimized/` folder
- **Process:** `sips -Z 1200 --setProperty formatOptions 85`
- **Max size:** 1200px (longest edge)
- **Quality:** 85% JPEG
- **Fallback:** If sips fails → copy original

### Optimization Command
```bash
for img in images/*.jpg; do
    filename=$(basename "$img")
    if [ -s "$img" ]; then  # Check file has content (size > 0)
        sips -Z 1200 --setProperty formatOptions 85 \
             "$img" --out "images/optimized/$filename"
    fi
done
```

**⚠️ IMPORTANT:** Always check file size before processing!
- Use `[ -s file ]` not `[ -f file ]`
- 0-byte files will break gallery

---

## Known Issues & Solutions

### Issue: Images Not Loading

**Symptoms:** Alt text visible, image not rendering

**Possible causes:**
1. **File doesn't exist** → 404 error in console
2. **File is 0 bytes** → Browser can't decode
3. **Wrong path** → Check gallery-data.json paths match filesystem
4. **Not deployed yet** → GitHub Pages takes ~30-60s to deploy

**Debug checklist:**
```bash
# 1. Check file exists
ls images/optimized/filename.jpg

# 2. Check file size
ls -lh images/optimized/filename.jpg  # Should NOT be 0B

# 3. Check JSON reference
cat gallery-data.json | jq '.[] | select(.src | contains("filename"))'

# 4. Test accessibility
curl -I https://www.kafenakopci.cz/images/optimized/filename.jpg
```

### Issue: Pagination Not Working

**Symptoms:** All images shown at once, no page navigation

**Cause:** renderGallery() not defined when gallery.js calls it

**Fix:** Move inline script BEFORE `<script src="gallery.js">`

### Issue: Gallery Empty on Page Load

**Symptoms:** Grid empty, no images, console errors

**Possible causes:**
1. `gallery-data.json` fetch failed → check network tab
2. `renderGallery()` not defined → check script order
3. `galleryData` is empty → check console logs

**Debug:**
```javascript
// Add to galerie.html inline script
console.log('galleryData loaded:', galleryData);
console.log('galleryData length:', galleryData ? galleryData.length : 'undefined');
```

---

## Admin Interface

**Location:** `admin.html`  
**Password:** kafenadedka2025  

**Features:**
- Upload images
- Edit gallery-data.json
- Delete images
- Reorder images

**⚠️ Security:** Password-protected but client-side only (not production-grade)

---

## Opening Hours

| Day       | Hours       |
|-----------|-------------|
| Sobota    | 10:00–20:00 |
| Neděle    | 10:00–19:00 |
| Pondělí   | **Zavřeno** |
| Úterý     | **Zavřeno** |
| Středa    | **Zavřeno** |
| Čtvrtek   | 14:00–19:00 |
| Pátek     | 10:00–20:00 |

Displayed in contact section (index.html, grid layout)

---

## Awards & Certifications

**Regionální potravina Slovensko 2023**
- Owner's own brand of plum brandy
- Vlastní sad (own orchard)
- Badge displayed in "Vlastní sad" section (index.html)
- Image: `images/regionalni-potravina-badge.png`

---

## Deployment Workflow

1. **Edit files locally:**
   ```bash
   cd /Users/botzdena/.openclaw/workspace/projects/kafe-na-kopci
   # Edit index.html, galerie.html, etc.
   ```

2. **Test locally:**
   ```bash
   open index.html  # macOS
   # Or: python3 -m http.server 8000
   ```

3. **Commit changes:**
   ```bash
   git add .
   git commit -m "Description of changes"
   ```

4. **Push to GitHub:**
   ```bash
   git push origin main
   ```

5. **Wait for deployment:**
   - GitHub Pages builds automatically (~30-60 seconds)
   - Check: https://github.com/caganekdavid-ux/kafe-na-kopci/deployments

6. **Verify live:**
   - Open https://www.kafenakopci.cz/
   - Hard refresh: Cmd+Shift+R (macOS) or Ctrl+Shift+R (Windows)

---

## Emergency Rollback

If deployment breaks site:

```bash
# 1. Find last working commit
git log --oneline

# 2. Revert to that commit
git reset --hard <commit-hash>

# 3. Force push (overwrites broken commit)
git push origin main --force
```

**⚠️ Use force push only when solo on project!**

---

## Contact Information

**Client:**
- Name: Adriana Štosová
- Phone: +420 774 729 688
- Email: adstosova@gmail.com

**Location:**
- Káva a Víno na Kopci
- Modrá 192, Skalica, Slovakia
- Google Maps: https://maps.app.goo.gl/tBvz11XUngv4ugbY6?g_st=ic

---

## Future Improvements

**Potential enhancements:**
- [ ] Add Google Analytics tracking
- [ ] Contact form (currently just email link)
- [ ] WebP images (browser auto-detection)
- [ ] Image lazy loading (if pagination removed)
- [ ] Admin panel with proper backend
- [ ] Multi-language support (SK/EN)
- [ ] Events calendar
- [ ] Online menu

---

## Maintenance Notes

**Regular tasks:**
- Update opening hours if changed (index.html)
- Add new photos to gallery (admin.html or manual)
- Check DNS records annually (domain renewal)
- Monitor GitHub Pages deployment status

**Backup:**
- Repository is the backup (full history on GitHub)
- Local copy: `/Users/botzdena/.openclaw/workspace/projects/kafe-na-kopci`
- iCloud: `~/Library/Mobile Documents/com~apple~CloudDocs/David&Boti/Zdeněk/Web- Kafe na Kopci/`

---

*Last updated: 2026-05-16*
