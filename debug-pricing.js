// Debug script to analyze pricing calculation for a specific chapter
const fetch = require('node-fetch');

const CHAPTER_ID = '4ab2e94f-5fc2-44b9-8ce1-bc0623970c45';
const API_URL = 'http://localhost:3000';

async function debugPricing() {
  try {
    console.log('=== DEBUGGING PRICING FOR CHAPTER ===');
    console.log('Chapter ID:', CHAPTER_ID);
    console.log('');

    // Fetch chapter data
    const response = await fetch(`${API_URL}/reader/catalog/chapters/${CHAPTER_ID}`);
    const chapter = await response.json();

    console.log('Chapter:', chapter.title);
    console.log('Total Volumes:', chapter.volumes?.length || 0);
    console.log('');

    // Price configuration
    const priceFreeToRead = chapter.pricing.priceFreeToRead;
    const pricePaywall = chapter.pricing.pricePaywall;
    const priceEpilogue = chapter.pricing.priceEpilogue;

    console.log('=== PRICE CONFIGURATION ===');
    console.log('priceFreeToRead (volumes 1-8):', priceFreeToRead);
    console.log('pricePaywall (volumes 9-10):', pricePaywall);
    console.log('priceEpilogue (volumes 11+):', priceEpilogue);
    console.log('');

    // Analyze each volume
    console.log('=== VOLUME ANALYSIS ===');
    let bundleOriginalPrice = 0;
    let alreadyAccessiblePrice = 0;

    if (chapter.volumes) {
      chapter.volumes.forEach((vol, index) => {
        console.log(`\n--- Volume ${vol.volumeNumber}: ${vol.title} ---`);
        console.log('  isFree:', vol.isFree || false);
        console.log('  isAccessible:', vol.isAccessible || false);
        console.log('  blockageType:', vol.blockageType || 'null');

        // Determine volume price
        let volumePrice = 0;

        if (vol.isFree) {
          volumePrice = 0;
          console.log('  → Price: 0 (FREE)');
        } else if (vol.volumeNumber <= 8) {
          volumePrice = priceFreeToRead;
          console.log(`  → Price: ${volumePrice} (freeToRead tier)`);
        } else if (vol.volumeNumber <= 10) {
          volumePrice = pricePaywall;
          console.log(`  → Price: ${volumePrice} (paywall tier)`);
        } else {
          volumePrice = priceEpilogue;
          console.log(`  → Price: ${volumePrice} (epilogue tier)`);
        }

        bundleOriginalPrice += volumePrice;
        console.log(`  → Cumulative bundleOriginalPrice: ${bundleOriginalPrice}`);

        // Check if already accessible
        if (vol.isAccessible && !vol.isFree) {
          alreadyAccessiblePrice += volumePrice;
          console.log(`  → Already accessible! Cumulative alreadyAccessiblePrice: ${alreadyAccessiblePrice}`);
        }
      });
    }

    console.log('\n=== FINAL CALCULATION ===');
    console.log('bundleOriginalPrice:', bundleOriginalPrice);
    console.log('alreadyAccessiblePrice:', alreadyAccessiblePrice);
    console.log('Remaining to pay:', bundleOriginalPrice - alreadyAccessiblePrice);
    const bundleDiscountedPrice = Math.round((bundleOriginalPrice - alreadyAccessiblePrice) * 0.75);
    console.log('bundleDiscountedPrice (75% of remaining):', bundleDiscountedPrice);

    console.log('\n=== COMPARISON WITH API ===');
    console.log('Expected (from API):');
    console.log('  bundleOriginalPrice:', chapter.pricing.bundleOriginalPrice);
    console.log('  bundleDiscountedPrice:', chapter.pricing.bundleDiscountedPrice);
    console.log('\nCalculated (from script):');
    console.log('  bundleOriginalPrice:', bundleOriginalPrice);
    console.log('  bundleDiscountedPrice:', bundleDiscountedPrice);

    if (bundleOriginalPrice === chapter.pricing.bundleOriginalPrice &&
        bundleDiscountedPrice === chapter.pricing.bundleDiscountedPrice) {
      console.log('\n✓ MATCH: Calculation is correct!');
    } else {
      console.log('\n✗ MISMATCH: There is a discrepancy!');
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugPricing();
