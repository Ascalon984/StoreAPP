const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, '../src/app/product/[slug]/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// 1. Imports
content = content.replace(
  /import ProductImage from "@\/components\/ProductImage";\nimport LoadingScreen from "@\/components\/LoadingScreen";\nimport TimeAgo from "@\/components\/TimeAgo";/,
  `import ProductImage from "@/components/ProductImage";
import LoadingScreen from "@/components/LoadingScreen";
import TimeAgo from "@/components/TimeAgo";
import ProductGallery from "./components/ProductGallery";
import ProductReviews from "./components/ProductReviews";`
);

// 2. Remove Helpers (lines 36 to 97 approx)
const helpersRegex = /\/\/ Helper: hitung distribusi rating dari data ulasan[\s\S]*?(?=export default function ProductDetailPage)/;
content = content.replace(helpersRegex, '');

// 3. Remove States
content = content.replace(/  const \[votedIds, setVotedIds\] = useState<string\[\]>\(\[\]\);\n  const \[votedType, setVotedType\] = useState<\n    Record<string, "like" \| "dislike" \| null>\n  >\({}\);\n  const \[thankYouIds, setThankYouIds\] = useState<string\[\]>\(\[\]\);\n\n/, '');

content = content.replace(/  const \[currentIndex, setCurrentIndex\] = useState\(0\);\n  const \[displayCount, setDisplayCount\] = useState\(5\);\n/, '');

content = content.replace(/  const scrollContainerRef = useRef<HTMLDivElement>\(null\);\n/, '');

// 4. Remove getRatingLabel and getRatingColor
content = content.replace(/  const getRatingLabel = \([\s\S]*?  };\n/, '');
content = content.replace(/  const getRatingColor = \([\s\S]*?  };\n/, '');

// 5. Remove handleVote
content = content.replace(/  const handleVote = async \([\s\S]*?  };\n/, '');

// 6. Remove handleScroll
content = content.replace(/  const handleScroll = \(\) => {[\s\S]*?  };\n/, '');

// 7. Remove distribution and displayedReviews
content = content.replace(/  const distribution = getRatingDistribution\(allReviews\);\n  const displayedReviews = allReviews\.slice\(0, displayCount\);\n/, '');

// 8. Replace Gallery
const galleryRegex = /\{\/\* Gallery \*\/\}.*?(?=\{\/\* Info Section)/s;
content = content.replace(galleryRegex, `{/* Gallery */}
            <ProductGallery
              product={product}
              productImages={productImages}
              isFavorite={isFavorite(product.id)}
              toggleFavorite={toggleFavorite}
              handleBack={handleBack}
              handleShare={handleShare}
              ref={imageContainerRef}
            />

            `);

// 9. Replace Lightbox
const lightboxRegex = /\{\/\* Lightbox — selalu render, transisi via opacity\/scale \*\/\}.*?(?=<style jsx>)/s;
content = content.replace(lightboxRegex, '');

// 10. Replace Reviews
const reviewsRegex = /\{\/\* Review Section \*\/\}.*?(?=\{\/\* Sticky Bottom CTA \*\/\})/s;
content = content.replace(reviewsRegex, `{/* Review Section */}
          <ProductReviews
            allReviews={allReviews}
            liveRating={liveRating}
          />

          `);

// 11. Remove setLightboxOpen and lightboxOpen
content = content.replace(/  const \[lightboxOpen, setLightboxOpen\] = useState\(false\);\n/, '');

fs.writeFileSync(pagePath, content);
console.log('Done replacing');
