# 🚀 Deployment Guide - Kafé na Kopci

## 📦 Co máš připraveno

Kompletní web je v adresáři:
```
/Users/botzdena/.openclaw/workspace/projects/kafe-na-kopci/
```

## 🎯 Možnosti hostingu

### 1️⃣ GitHub Pages (DOPORUČENO pro testování)

**Výhody:**
- ✅ Zdarma
- ✅ Automatické HTTPS
- ✅ Rychlé nasazení
- ✅ Snadná aktualizace

**Postup:**

1. **Vytvoř nový GitHub repo:**
   - Jdi na https://github.com/new
   - Název: `kafe-na-kopci`
   - Public/Private: Public (pro GitHub Pages)
   - Nevytvářej README (už máme)

2. **Nahraj soubory:**
   ```bash
   cd /Users/botzdena/.openclaw/workspace/projects/kafe-na-kopci
   
   git init
   git add .
   git commit -m "Initial commit - Kafé na Kopci website"
   git branch -M main
   git remote add origin https://github.com/TVOJE-USERNAME/kafe-na-kopci.git
   git push -u origin main
   ```

3. **Zapni GitHub Pages:**
   - Jdi do Settings → Pages
   - Source: Deploy from branch
   - Branch: main / (root)
   - Ulož

4. **Hotovo!**
   - Web bude na: `https://TVOJE-USERNAME.github.io/kafe-na-kopci/`
   - Čekání: ~2 minuty

**URL pro Davida:**
- Web: https://davidcaganek.github.io/kafe-na-kopci/
- Admin: https://davidcaganek.github.io/kafe-na-kopci/admin.html

---

### 2️⃣ Wedos (kafenakopci.cz)

**Výhody:**
- ✅ Vlastní doména
- ✅ Profesionální
- ✅ Česká podpora

**Postup:**

1. **FTP přístup k Wedosu:**
   - Host: `ftp.wedos.net` nebo `ftp.tvoje-domena.cz`
   - Username: [z wedos admin panelu]
   - Password: [z wedos admin panelu]
   - Port: 21

2. **Nahraj soubory:**
   - Všechny soubory z `kafe-na-kopci/` nahraj do složky `www/` na serveru
   - Struktura:
     ```
     www/
     ├── index.html
     ├── admin.html
     ├── gallery.js
     ├── admin.js
     ├── gallery-data.json
     ├── images/
     │   ├── Dkava-piti-1.jpg
     │   ├── Fslivovice-1.jpg
     │   └── ...
     └── README.md
     ```

3. **Ochrana admin panelu (DŮLEŽITÉ!):**
   
   Vytvoř soubor `.htaccess` ve složce `www/`:
   ```apache
   # Ochrana admin panelu
   <Files "admin.html">
       AuthType Basic
       AuthName "Admin Cafe"
       AuthUserFile /home/TVUJ-UZIVATEL/.htpasswd
       Require valid-user
   </Files>
   ```

4. **Vytvoř heslo:**
   - V Wedos admin panelu → Ochrana adresáře
   - Nebo online: https://www.htaccesstools.com/htpasswd-generator/
   - Username: `admin`
   - Password: [vyber silné heslo]
   - Vygenerovaný řádek ulož do `.htpasswd`

5. **Hotovo!**
   - Web: https://kafenakopci.cz/
   - Admin: https://kafenakopci.cz/admin.html

---

### 3️⃣ Netlify (alternativa k GitHub Pages)

**Výhody:**
- ✅ Zdarma
- ✅ Vlastní doména zdarma
- ✅ Automatické HTTPS
- ✅ Lepší než GitHub Pages

**Postup:**

1. **Registrace:**
   - https://netlify.com
   - Registruj se přes GitHub

2. **Vytvoř nový site:**
   - "Add new site" → "Import from Git"
   - Vyber GitHub repo `kafe-na-kopci`
   - Build settings: žádné (statický web)
   - Deploy!

3. **Vlastní doména:**
   - Domain settings → Add custom domain
   - `kafenakopci.cz`
   - DNS záznamy (na Wedosu):
     ```
     A @ 75.2.60.5
     CNAME www YOUR-SITE.netlify.app
     ```

4. **Hotovo!**
   - Web: https://tvuj-site.netlify.app/ nebo kafenakopci.cz
   - Admin: https://tvuj-site.netlify.app/admin.html

---

## 🔐 Zabezpečení admin panelu

### Varianta 1: .htaccess (Wedos)
```apache
<Files "admin.html">
    AuthType Basic
    AuthName "Admin"
    AuthUserFile /home/tvuj-user/.htpasswd
    Require valid-user
</Files>
```

### Varianta 2: Přejmenování
- Přejmenuj `admin.html` na `admin-SECRET123.html`
- Nikomu neříkej URL
- Není v menu, Google nenajde

### Varianta 3: Netlify Identity (pokročilé)
- Netlify Identity + Netlify Functions
- OAuth přihlášení
- Bezpečnější ale složitější

---

## 📸 Práce s galerií

### Na Davidově počítači

1. **Otevři admin panel:**
   - Lokálně: `file:///cesta/k/projektu/admin.html`
   - Nebo na serveru: `https://kafenakopci.cz/admin.html`

2. **Nahraj fotky:**
   - Drag & drop nebo vyber soubory
   - Přidej popisky
   - Ulož

3. **Stáhni JSON:**
   - Klikni "Export JSON"
   - Ulož jako `gallery-data.json`

4. **Nahraj na server:**
   - Přes FTP nahraj `gallery-data.json`
   - Nebo commit do Gitu:
     ```bash
     git add gallery-data.json
     git commit -m "Update gallery"
     git push
     ```

### Pro ostatní uživatele

- Stejný postup
- Každý má svůj `localStorage` v prohlížeči
- Pro sdílení musí exportovat/importovat JSON

---

## 🎨 Úpravy designu

### Barvy
V `index.html` najdi CSS proměnné:
```css
.hero-bg {
    background: linear-gradient(135deg, #6B4423 0%, #3E2723 100%);
}
```

### Texty
- Kontakt: řádky s `[Bude doplněno]`
- O nás: sekce `#o-nas`
- Loga ocenění: sekce "Award Badge"

### Přidat sekci
```html
<section id="nova-sekce" class="py-20 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Obsah -->
    </div>
</section>
```

---

## 📊 Monitoring

### Google Analytics (volitelné)

1. **Vytvoř GA4 property:**
   - https://analytics.google.com

2. **Přidej tracking code:**
   V `index.html` před `</head>`:
   ```html
   <!-- Google Analytics -->
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'G-XXXXXXXXXX');
   </script>
   ```

---

## 🐛 Troubleshooting

### Fotky se neloadují
- Zkontroluj cestu: `images/nazev.jpg`
- Case-sensitive: `Dkava-piti-1.jpg` ≠ `dkava-piti-1.jpg`
- Zkontroluj permissions (755 pro složky, 644 pro soubory)

### Admin panel nefunguje
- Zkontroluj konzoli (F12)
- Potřebuje server (ne `file://`) kvůli localStorage
- GitHub Pages/Netlify: funguje
- Lokální: spusť `python3 -m http.server 8000`

### GitHub Pages 404
- Počkej 2-5 minut po push
- Zkontroluj Settings → Pages → Branch = main

---

## ✅ Checklist před spuštěním

- [ ] Doplněny kontaktní údaje
- [ ] Nahrané všechny fotky
- [ ] Přidáno logo ocenění
- [ ] Otestováno na mobilu
- [ ] Admin panel chráněn heslem
- [ ] DNS nastaveno (pokud vlastní doména)
- [ ] Google Analytics (volitelné)
- [ ] SSL certifikát aktivní (HTTPS)

---

## 📞 Podpora

V případě problémů:
- GitHub Issues: https://github.com/tvuj-username/kafe-na-kopci/issues
- Email: [tvuj email]

**Created by:** Zdeňa (AI Assistant)
**Date:** 2026-05-15
**Version:** 1.0.0
