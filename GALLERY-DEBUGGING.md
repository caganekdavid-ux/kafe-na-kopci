# Gallery Debugging Guide - Kafé na Kopci

This document details all gallery-related bugs encountered and how to diagnose/fix them.

---

## Quick Diagnosis Flowchart

```
Gallery not working?
    ↓
Check browser console (F12)
    ↓
┌─────────────────────────────────────────┐
│ What do you see?                        │
├─────────────────────────────────────────┤
│ "renderGallery is not defined"          │ → Script order issue (see #1)
│ Images showing "undefined" text         │ → Duplicate function (see #2)
│ 404 errors in Network tab               │ → Missing files OR wrong paths (see #3, #4, #5)
│ No errors, but gallery empty            │ → Data not loading (check gallery-data.json)
│ Page 1 works, page 2+ broken            │ → Missing files (see #4)
└─────────────────────────────────────────┘
```

---

## Bug #1: Script Execution Order

### Symptoms
- Gallery doesn't load at all
- Console error: `Uncaught ReferenceError: renderGallery is not defined`
- Blank grid on page load

### Root Cause
```html
<!-- WRONG ORDER -->
<script src="gallery.js"></script>  <!-- Loads first, calls renderGallery() -->
<script>
    function renderGallery() { ... }  <!-- Defined second, but too late! -->
</script>
```

When `gallery.js` loads, it immediately calls `renderGallery()`, but that function doesn't exist yet because the inline script hasn't run.

### How JavaScript Loads
1. Browser reads HTML top to bottom
2. When it hits `<script src="...">`, it stops, loads file, executes it
3. Then continues to next script tag
4. External scripts execute immediately, inline scripts wait for their turn

### The Fix
```html
<!-- CORRECT ORDER -->
<script>
    function renderGallery() { ... }  <!-- Define FIRST -->
    function renderPagination() { ... }
</script>
<script src="gallery.js"></script>  <!-- Load SECOND, can now call functions -->
```

### How to Prevent
- Always define functions before they're called
- If using external script that calls functions, define functions first
- Or use DOMContentLoaded to wait for everything to load

**Debugging command:**
```bash
# Check script tag order in HTML
grep -n "<script" galerie.html
```

---

## Bug #2: Duplicate Function Definition

### Symptoms
- Images render but show "undefined" instead of alt text
- Console logs show data loaded correctly
- Some functionality works, some doesn't

### Root Cause
```javascript
// In galerie.html inline script:
function renderGallery() {
    // NEW VERSION with pagination
    // Uses item.alt for caption
}

// In gallery.js:
function renderGallery() {
    // OLD VERSION without pagination
    // Expects different data structure
}
```

JavaScript allows redefining functions. Last definition wins!

**What happens:**
1. Inline script defines `renderGallery` (pagination version)
2. gallery.js loads and redefines `renderGallery` (old version)
3. gallery.js version is now active
4. Old version doesn't match new data structure → undefined

### The Fix
Remove duplicate definition:
```javascript
// gallery.js - REMOVE this:
function renderGallery() { ... }

// Keep only the CALL:
renderGallery();  // Calls version from inline script
```

### How to Prevent
- **Single source of truth** - one place defines each function
- Use unique names if multiple versions needed
- Or use modules/namespaces to avoid global scope pollution

**Debugging command:**
```bash
# Find all renderGallery definitions
grep -r "function renderGallery" .
```

---

## Bug #3: Path Duplication (images/optimized/optimized/)

### Symptoms
- 404 errors in console
- Images fail to load
- Network tab shows paths like: `images/optimized/optimized/file.jpg`

### Root Cause
```javascript
// gallery-data.json:
{ "src": "images/optimized/Dkava-piti-1.jpg" }  // Already has optimized/

// gallery.js:
item.src.replace('images/', 'images/optimized/')
// Finds 'images/' → replaces with 'images/optimized/'
// Result: "images/optimized/optimized/Dkava-piti-1.jpg"
```

Both the JSON and the JS code try to add `optimized/` to the path!

### The Fix
**Option A:** Remove transformation from JS (we chose this)
```javascript
// gallery.js - REMOVE this:
galleryData = galleryData.map(item => ({
    ...item,
    src: item.src.replace('images/', 'images/optimized/')
}));

// Just use paths as-is from JSON
```

**Option B:** Remove optimized/ from JSON, keep JS transformation
```json
{ "src": "images/Dkava-piti-1.jpg" }
```
```javascript
// JS adds optimized/ dynamically
```

Pick ONE approach, not both!

### How to Prevent
- **Single transformation point** - modify paths in one place only
- Document where paths come from and how they're used
- Use path.join() instead of string replacement

**Debugging command:**
```bash
# Check actual paths in JSON
cat gallery-data.json | jq '.[0].src'

# Check what browser requested (from console Network tab)
# Or test specific file:
curl -I https://www.kafenakopci.cz/images/optimized/optimized/file.jpg
```

---

## Bug #4: Missing Optimized Images

### Symptoms
- First 1-3 pages work
- Later pages show blank images or alt text
- Inconsistent number of images per page

### Root Cause
```bash
# gallery-data.json references 98 images
cat gallery-data.json | jq '. | length'
# Output: 98

# But only 41 images exist on disk
ls images/optimized/*.jpg | wc -l
# Output: 41
```

Incomplete image optimization! Gallery expects 98 but only 41 were processed.

### Why It Happened
- Batch optimization script ran
- Failed partway through (error, interrupted, or not monitored)
- Assumed all files processed
- Created gallery-data.json with all 98 references
- But only 41 files actually optimized

### The Fix
```bash
# Complete the optimization
for img in images/*.jpg; do
    filename=$(basename "$img")
    if [ ! -f "images/optimized/$filename" ]; then
        sips -Z 1200 --setProperty formatOptions 85 \
             "$img" --out "images/optimized/$filename"
    fi
done
```

### How to Prevent
**Verify completion:**
```bash
ORIGINAL=$(ls images/*.jpg | wc -l)
OPTIMIZED=$(ls images/optimized/*.jpg | wc -l)

if [ "$ORIGINAL" -ne "$OPTIMIZED" ]; then
    echo "❌ Optimization incomplete!"
    echo "   Original: $ORIGINAL"
    echo "   Optimized: $OPTIMIZED"
    exit 1
fi
```

**Better batch script pattern:**
```bash
SUCCESS=0
FAILED=0

for img in images/*.jpg; do
    if optimize "$img"; then
        ((SUCCESS++))
    else
        ((FAILED++))
        echo "Failed: $img"
    fi
done

echo "Success: $SUCCESS, Failed: $FAILED"
```

**Debugging commands:**
```bash
# Count files
ls images/*.jpg | wc -l
ls images/optimized/*.jpg | wc -l

# Find missing files
comm -23 <(ls images/*.jpg | xargs -n1 basename | sort) \
         <(ls images/optimized/*.jpg | xargs -n1 basename | sort)

# Test specific image
ls -lh images/optimized/Dkava-piti-57.jpg
```

---

## Bug #5: 0-Byte Corrupted Files

### Symptoms
- Files exist (no 404 errors)
- But images don't render
- Alt text visible instead
- Inconsistent - some work, some don't

### Root Cause
```bash
# File exists:
ls images/optimized/Fslivovice-17.jpg
# Output: images/optimized/Fslivovice-17.jpg

# But size is 0 bytes:
ls -lh images/optimized/Fslivovice-17.jpg
# Output: -rw------- 1 user staff 0B May 16 16:31 Fslivovice-17.jpg
```

**How it happened:**
1. Original files uploaded to repo as 0-byte placeholders
2. Upload failed or interrupted midway
3. Git committed empty files
4. Optimization copied empty files → still 0 bytes
5. Browser can't decode 0-byte JPEG → shows alt text

### The Fix
**Remove corrupted entries:**
```bash
# Find 0-byte files
find images/ -name "*.jpg" -size 0

# Delete them
find images/ -name "*.jpg" -size 0 -delete
find images/optimized/ -name "*.jpg" -size 0 -delete

# Update gallery-data.json to remove references
python3 << 'EOF'
import json
data = json.load(open('gallery-data.json'))
empty_files = set(['Fslivovice-17.jpg', ...])  # List from find command
filtered = [item for item in data 
            if item['src'].split('/')[-1] not in empty_files]
json.dump(filtered, open('gallery-data.json', 'w'), indent=2)
EOF
```

### How to Prevent
**Validate files before processing:**
```bash
for img in images/*.jpg; do
    if [ ! -s "$img" ]; then  # -s checks size > 0
        echo "⚠️  Skipping 0-byte file: $img"
        continue
    fi
    # Process file...
done
```

**Validate after upload:**
```bash
# After git push, check all files have content
for img in images/*.jpg; do
    size=$(stat -f%z "$img" 2>/dev/null || stat -c%s "$img" 2>/dev/null)
    if [ "$size" -eq 0 ]; then
        echo "❌ Corrupted: $img"
    fi
done
```

**Shell test operators:**
- `[ -f file ]` - file exists (regular file)
- `[ -s file ]` - file exists AND size > 0 ← **USE THIS!**
- `[ -r file ]` - file is readable
- `[ -e file ]` - file exists (any type)

**Debugging commands:**
```bash
# Find ALL 0-byte files
find . -name "*.jpg" -size 0

# Check specific file size
ls -lh images/file.jpg

# Detailed file info
stat images/file.jpg

# Verify it's actually a JPEG
file images/file.jpg
# Should output: "JPEG image data"
# 0-byte file outputs: "empty"
```

---

## General Debugging Workflow

### 1. Reproduce the Issue
- Load the page
- Navigate to problem area (specific page number, image)
- Note exact symptoms

### 2. Check Browser Console
```
F12 → Console tab
```
Look for:
- Red errors (JavaScript exceptions)
- Yellow warnings
- Network failures (404, 500)

### 3. Check Network Tab
```
F12 → Network tab → Reload page
```
Look for:
- Red/failed requests (404, 500 errors)
- Large files taking too long
- Blocked requests (CORS, CSP)

### 4. Check Filesystem
```bash
# Does file exist?
ls images/optimized/file.jpg

# Does it have content?
ls -lh images/optimized/file.jpg

# Is it a valid JPEG?
file images/optimized/file.jpg

# Can we read it?
head -c 100 images/optimized/file.jpg | od -x
# JPEG starts with: ff d8 ff
```

### 5. Check Data
```bash
# Is image in gallery-data.json?
cat gallery-data.json | jq '.[] | select(.src | contains("file.jpg"))'

# How many items in JSON?
cat gallery-data.json | jq '. | length'

# Compare to filesystem count
ls images/optimized/*.jpg | wc -l
```

### 6. Check Code
```bash
# Is function defined?
grep "function renderGallery" galerie.html gallery.js

# Script load order
grep -n "<script" galerie.html

# Are paths correct?
grep "images/" galerie.html gallery.js
```

---

## Testing After Changes

### Manual Testing Checklist

After any gallery changes:

- [ ] **Page 1 loads** - first 12 images visible
- [ ] **Pagination works** - can click Next/Prev
- [ ] **Page numbers work** - can jump to specific page
- [ ] **Last page works** - handles partial page (not full 12)
- [ ] **Lightbox opens** - click image → fullscreen
- [ ] **Lightbox navigation** - can prev/next through all images
- [ ] **Lightbox closes** - ESC key or X button works
- [ ] **Mobile responsive** - test on small screen
- [ ] **No console errors** - F12 console is clean

### Automated Checks

```bash
# Verify file counts match
IMAGES=$(ls images/optimized/*.jpg | wc -l)
JSON=$(cat gallery-data.json | jq '. | length')
echo "Images on disk: $IMAGES"
echo "Images in JSON: $JSON"
[ "$IMAGES" -eq "$JSON" ] && echo "✅ Match" || echo "❌ Mismatch"

# Verify all JSON paths exist
cat gallery-data.json | jq -r '.[].src' | while read path; do
    if [ ! -f "$path" ]; then
        echo "❌ Missing: $path"
    fi
done

# Verify no 0-byte files
find images/optimized/ -name "*.jpg" -size 0
# Should output nothing

# Verify all JPEGs are valid
for img in images/optimized/*.jpg; do
    if ! file "$img" | grep -q "JPEG"; then
        echo "❌ Invalid JPEG: $img"
    fi
done
```

---

## Performance Optimization

### Image Loading Performance

**Current setup:**
- 12 images per page
- Eager loading (loading="eager")
- Max 1200px, 85% quality
- Average file size: ~150-250 KB

**Why eager loading:**
- Lazy loading doesn't work well with dynamically rendered pagination
- Only 12 images at a time, so load time acceptable
- Better UX (images appear immediately)

**If needed to optimize further:**
1. WebP format (smaller files, same quality)
2. Reduce to 10 images/page
3. Implement true lazy loading (requires pagination refactor)
4. Add loading skeleton (visual feedback while loading)

### Script Performance

**Current bottlenecks:**
- fetch('gallery-data.json') on page load
- JSON parsing (70 items)
- DOM manipulation (creating 12 image elements)

**None are significant (< 100ms total).**

If gallery grows to 500+ images:
- Paginate JSON (load only current page's data)
- Virtual scrolling (render only visible items)
- Web Worker for JSON parsing

---

## Maintenance Tasks

### Adding New Images

**Manual process:**

1. **Add to images/ folder**
   ```bash
   cp ~/Downloads/new-image.jpg images/Dkava-piti-70.jpg
   ```

2. **Optimize**
   ```bash
   sips -Z 1200 --setProperty formatOptions 85 \
        images/Dkava-piti-70.jpg \
        --out images/optimized/Dkava-piti-70.jpg
   ```

3. **Update gallery-data.json**
   ```json
   {
     "src": "images/optimized/Dkava-piti-70.jpg",
     "alt": "Káva a pití v Kafé na Kopci",
     "category": "coffee"
   }
   ```

4. **Commit and push**
   ```bash
   git add images/ gallery-data.json
   git commit -m "Add new image: Dkava-piti-70"
   git push origin main
   ```

**Via admin.html:**
- Upload through web interface
- Auto-optimizes and updates JSON
- Requires password (kafenadedka2025)

### Removing Images

1. **Delete files**
   ```bash
   rm images/Dkava-piti-48.jpg
   rm images/optimized/Dkava-piti-48.jpg
   ```

2. **Remove from gallery-data.json**
   ```bash
   # Manual edit or:
   cat gallery-data.json | jq 'del(.[48])' > tmp.json
   mv tmp.json gallery-data.json
   ```

3. **Commit**
   ```bash
   git add -A
   git commit -m "Remove image: Dkava-piti-48"
   git push origin main
   ```

### Checking Gallery Health

**Monthly check:**
```bash
cd /path/to/project

# 1. Verify counts match
echo "Files: $(ls images/optimized/*.jpg | wc -l)"
echo "JSON: $(cat gallery-data.json | jq '. | length')"

# 2. Find orphaned files (in folder but not JSON)
comm -23 <(ls images/optimized/*.jpg | xargs -n1 basename | sort) \
         <(cat gallery-data.json | jq -r '.[].src' | xargs -n1 basename | sort)

# 3. Find missing files (in JSON but not folder)
comm -13 <(ls images/optimized/*.jpg | xargs -n1 basename | sort) \
         <(cat gallery-data.json | jq -r '.[].src' | xargs -n1 basename | sort)

# 4. Check for 0-byte files
find images/optimized/ -name "*.jpg" -size 0

# 5. Test live site
curl -I https://www.kafenakopci.cz/galerie.html
# Should return HTTP 200
```

---

## Common Questions

### Q: Why not use a gallery library (Lightbox.js, PhotoSwipe, etc.)?

**A:** Custom implementation gives us:
- Full control over styling
- No external dependencies
- Easier debugging
- Lighter weight (~100 lines vs 10KB library)

### Q: Why 12 images per page?

**A:** Balance of:
- Not too few (reduces pagination clicks)
- Not too many (keeps page load fast)
- Divisible by 3 and 4 (grid layouts)

### Q: Why not lazy load images?

**A:** Lazy loading conflicts with pagination:
- Images added dynamically via JavaScript
- Browser doesn't trigger lazy load for JS-inserted elements
- Would need IntersectionObserver API (more complexity)
- Only 12 images/page, eager loading is fine

### Q: Can we use WebP instead of JPEG?

**A:** Yes! Modern browsers support it:
```javascript
// Check support
const supportsWebP = document.createElement('canvas')
    .toDataURL('image/webp')
    .indexOf('data:image/webp') === 0;

// Use WebP if supported, JPEG as fallback
const src = supportsWebP ? item.webp : item.src;
```

Already implemented in lightbox, could extend to gallery grid.

---

*Last updated: 2026-05-16 16:40*  
*Maintainer: Zdeňa (AI COO)*
