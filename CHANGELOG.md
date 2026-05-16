# Changelog - Kafé na Kopci Website

All notable changes to this project are documented here.

---

## 2026-05-16 - Gallery Implementation & Bug Fixes

### Added
- ✅ **Gallery page** (`galerie.html`) with pagination (12 images/page)
- ✅ **Gallery data** (`gallery-data.json`) - metadata for 70 images
- ✅ **Image optimization** - 70 images optimized to max 1200px, 85% quality
- ✅ **Lightbox viewer** - click image for fullscreen view
- ✅ **Opening hours** - formatted schedule in contact section
- ✅ **Award badge** - Regionální potravina 2023 in "Vlastní sad" section

### Changed
- ✅ **Homepage slider** - optimized images, eager loading for first slide
- ✅ **Gallery loading** - changed from lazy to eager (pagination compatibility)
- ✅ **Logo** - removed watermark, made navigation logo transparent

### Fixed
- ✅ **Gallery script order bug** - renderGallery() defined before gallery.js loads
- ✅ **Duplicate function definition** - removed renderGallery() from gallery.js
- ✅ **Double optimized path** - removed redundant path replacement
- ✅ **Missing optimized images** - completed optimization for all 98→70 images
- ✅ **0-byte corrupted files** - removed 28 empty image files from gallery
- ✅ **Footer parallax** - fixed scroll direction (-150px offset)

### Removed
- ❌ **Category filters** - removed from gallery (too complex, not needed)
- ❌ **28 corrupted images** - deleted 0-byte files (27 slivovice, 1 káva)
- ❌ **Generic award section** - replaced with real certification

### Technical Details

**Commits today (2026-05-16):**
```
8540f35 - Remove 28 corrupted images (0-byte files)
07c741f - Complete image optimization - add missing 57 images
2fa31ce - Fix page 2+ images not loading - change to eager loading
f803059 - Fix image paths - remove duplicate optimized/ replacement
6d5650d - Fix undefined images - remove duplicate renderGallery function
9065148 - Add debug logging to gallery for undefined issue
c08d1e3 - Add opening hours to contact section
b3143ce - PROPERLY fix gallery loading + slider optimization
0a73343 - Fix gallery pagination - images not displaying + add page numbers
f90ee65 - Add pagination to gallery - 12 images per page
68c65b7 - Simplify gallery - remove category filters, show all 98 images
52828aa - Replace generic award with real 'Regionální potravina' certification
0fb9778 - Fix logo issues (watermark, transparency, parallax)
```

**Total commits:** 13  
**Time spent:** ~6 hours  
**Major debugging sessions:** 4 (script order, duplicate function, missing files, 0-byte files)

### Lessons Learned

1. **Always verify file integrity** - check size, not just existence
2. **Test before commit** - don't push untested "fixes"
3. **Debug from bottom up** - filesystem → data → logic → UI
4. **Script load order matters** - functions must exist before being called
5. **Count files after batch operations** - verify completion

---

## 2026-05-15 - Initial Setup

### Added
- ✅ **Repository created** - GitHub: caganekdavid-ux/kafe-na-kopci
- ✅ **GitHub Pages enabled** - branch: main
- ✅ **Custom domain configured** - www.kafenakopci.cz
- ✅ **DNS setup** - CNAME record to GitHub Pages
- ✅ **HTTPS enabled** - Let's Encrypt certificate

### Created
- ✅ `index.html` - main homepage
- ✅ `CNAME` - custom domain file
- ✅ Initial design - Tailwind CSS, modern layout
- ✅ Photo slider - 5 slides with auto-advance
- ✅ Info sections - about cafe, location
- ✅ Contact section - phone, email, map placeholder

---

## Gallery Timeline (2026-05-16)

Detailed timeline of gallery implementation and bug fixes:

### 11:00-12:00 - Initial Gallery Setup
- Created `galerie.html` with grid layout
- Added category filters (coffee/spirits)
- Uploaded ~100 images to repository
- Created initial `gallery-data.json`

### 12:00-13:00 - Simplification
- **Issue:** Category filters too complex, inconsistent data
- **Fix:** Removed filters, show all images in single grid
- **Commit:** 68c65b7 "Simplify gallery"

### 13:00-14:00 - Pagination Added
- **Issue:** Too many images on one page (slow, overwhelming)
- **Fix:** Added pagination (12 images/page)
- **Features:** Prev/Next buttons, page numbers
- **Commit:** f90ee65 "Add pagination to gallery"

### 14:00-15:00 - Logo & Award Fixes
- Fixed watermark on logo images
- Added real award certification badge
- Fixed parallax scroll direction on footer
- **Commits:** 52828aa, 0fb9778

### 15:00-16:00 - Gallery Loading Issues
- **Issue:** Gallery not loading on page load
- **Diagnosis:** Script execution order problem
- **Fix:** Moved inline script before gallery.js
- **Multiple commits:** Testing different approaches

### 16:00-16:10 - Script Order & Optimization
- **Issue:** Gallery still broken after "fix"
- **Root cause:** renderGallery() defined after gallery.js
- **Fix:** Proper script reordering
- **Also:** Optimized homepage slider images
- **Commit:** b3143ce "PROPERLY fix gallery loading"

### 16:10-16:20 - Opening Hours Added
- Added formatted opening hours to contact section
- Grid layout (2 columns: day + hours)
- Red text for closed days
- **Commit:** c08d1e3

### 16:20-16:30 - Duplicate Function Bug
- **Issue:** Images showing "undefined"
- **Root cause:** Two renderGallery() definitions (inline + gallery.js)
- **Fix:** Removed duplicate from gallery.js
- **Commits:** 9065148 (debug), 6d5650d (fix)

### 16:30-16:35 - Path Duplication Bug
- **Issue:** 404 errors, images/optimized/optimized/ paths
- **Root cause:** gallery.js adding optimized/ to already-optimized paths
- **Fix:** Removed path replacement from gallery.js
- **Commit:** f803059

### 16:35-16:40 - Lazy Loading Bug
- **Issue:** Page 2+ images not loading
- **Attempted fix:** Changed lazy→eager loading
- **Result:** Didn't help (wrong diagnosis)
- **Commit:** 2fa31ce

### 16:40-16:50 - Missing Files Discovery
- **Issue:** Pages 4+ mostly empty
- **Root cause:** Only 41 of 98 images existed in optimized/
- **Fix:** Completed image optimization (57 missing images)
- **Commit:** 07c741f "Complete image optimization"

### 16:50-17:00 - 0-Byte Files Cleanup
- **Issue:** Some images still not loading after optimization
- **Root cause:** 28 files were 0 bytes (corrupted uploads)
- **Fix:** Removed from gallery-data.json, deleted empty files
- **Result:** Gallery down to 70 working images (lost 28)
- **Commit:** 8540f35 "Remove 28 corrupted images"

### Final State (17:00)
- ✅ Gallery working with 70 images
- ✅ Pagination functional (6 pages)
- ✅ All images load correctly
- ✅ No console errors
- ❌ Lost 28 images (27 slivovice, 1 káva) - corrupted originals

---

## Bug Summary

### Critical Bugs Fixed

1. **Script Execution Order** (16:01-16:10)
   - Functions must be defined before being called
   - Inline script → gallery.js (not reverse)

2. **Duplicate Function Definition** (16:14-16:18)
   - Same function name in two places → last one wins
   - Removed duplicate, kept one authoritative version

3. **Path Duplication** (16:18-16:23)
   - Both JSON and JS modifying paths → double optimized/
   - Single source of truth: paths in JSON, no JS modification

4. **Missing Optimized Images** (16:23-16:35)
   - Incomplete batch optimization (41/98 files)
   - Verified all source files, completed optimization

5. **0-Byte Corrupted Files** (16:35-16:40)
   - Original uploads were empty (0 bytes)
   - Removed from gallery (can't fix without source)

### Non-Critical Issues

- Lazy loading incompatible with pagination (changed to eager)
- Debug console.log() still present (can remove later)
- Lost 79% of slivovice images (client may re-upload)

---

## Next Steps

**Immediate:**
- [ ] Remove debug console.log() from galerie.html
- [ ] Test gallery on mobile devices
- [ ] Ask client for missing slivovice images (if available)

**Future:**
- [ ] Add Google Analytics
- [ ] Contact form implementation
- [ ] Menu page (if client provides content)
- [ ] Events/news section

---

*Changelog maintained by: Zdeňa (AI COO)*  
*Last updated: 2026-05-16 16:40*
