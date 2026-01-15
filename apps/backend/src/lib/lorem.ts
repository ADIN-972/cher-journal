/**
 * Lorem ipsum generator utility
 */

const LOREM_PARAGRAPHS = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.",
  "Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
  "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores.",
  "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.",
  "Sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.",
  "Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam.",
];

/**
 * Get a random paragraph from the Lorem ipsum collection
 */
function getRandomParagraph(): string {
  const randomIndex = Math.floor(Math.random() * LOREM_PARAGRAPHS.length);
  return LOREM_PARAGRAPHS[randomIndex];
}

/**
 * Generate Lorem ipsum text with specified number of paragraphs
 * @param paragraphCount Number of paragraphs to generate
 * @returns Lorem ipsum text with paragraphs separated by 2 line breaks
 */
export function generateLoremIpsum(paragraphCount: number = 5): string {
  const paragraphs: string[] = [];
  
  for (let i = 0; i < paragraphCount; i++) {
    paragraphs.push(getRandomParagraph());
  }
  
  return paragraphs.join('\n\n');
}

/**
 * Generate volume text with "Cher journal" header
 * @param paragraphCount Number of Lorem ipsum paragraphs to generate
 * @returns Complete volume text
 */
export function generateVolumeText(paragraphCount: number = 5): string {
  const loremText = generateLoremIpsum(paragraphCount);
  return `Cher journal\n\n${loremText}`;
}
