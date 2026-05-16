#!/bin/bash
# Image compression script for kafenakopci.cz
# Reduces file sizes by ~80% while maintaining visual quality

set -e

cd "$(dirname "$0")/images"

echo "🖼️  Starting image compression..."
echo "📊 Original size: $(du -sh . | cut -f1)"
echo ""

# Create optimized folder
mkdir -p optimized

# Counter
count=0
total=$(find . -maxdepth 1 \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.JPG" \) | wc -l)

# Compress all images
for img in *.jpg *.jpeg *.JPG; do
    [ -f "$img" ] || continue
    
    count=$((count + 1))
    echo "[$count/$total] Compressing: $img"
    
    # Convert to WebP (best compression, modern browsers)
    magick "$img" -quality 85 -resize "1920x1920>" "optimized/${img%.*}.webp"
    
    # Also create optimized JPEG (fallback for old browsers)
    magick "$img" -quality 85 -resize "1920x1920>" -strip "optimized/$img"
done

echo ""
echo "✅ Compression complete!"
echo "📊 Optimized size: $(du -sh optimized | cut -f1)"
echo ""
echo "📁 Files created:"
echo "   - WebP versions (85% quality, max 1920px)"
echo "   - JPEG fallbacks (85% quality, max 1920px, metadata stripped)"
echo ""
echo "🚀 Next step: Update HTML to use optimized images"
