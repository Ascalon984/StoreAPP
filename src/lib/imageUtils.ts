/**
 * Helper function to parse product images from various formats.
 * This function is extracted to reduce code duplication and improve readability.
 * It handles cases where images might be a single string, an array of strings,
 * or pipe-separated strings within an array/string.
 *
 * @param rawImages The raw image data, which can be a string, an array of strings, or undefined.
 * @returns The first valid image URL/data URL found, or undefined if none are found.
 */
export function parseProductImages(rawImages: any): string | undefined {
    let productImages: string[] = [];

    if (Array.isArray(rawImages)) {
        // If array, check if each element is pipe-separated or an individual image
        productImages = rawImages.flatMap(img => {
            if (!img || typeof img !== 'string') return [];
            // If string starts with data:image or http, it's an individual image
            if (img.startsWith('data:image') || img.startsWith('http')) {
                return [img];
            }
            // Otherwise, try to split by pipe (fallback for admin API bug)
            return img.split('|').filter(i => i?.trim()?.startsWith('data:image') || i?.trim()?.startsWith('http'));
        });
    } else if (typeof rawImages === 'string') {
        // If string, split by pipe and filter valid images
        productImages = rawImages.split('|').map(img => img?.trim()).filter(img => img && (img.startsWith('data:image') || img.startsWith('http')));
    }

    return productImages[0];
}