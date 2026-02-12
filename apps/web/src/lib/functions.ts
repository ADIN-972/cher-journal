export const getReadingTime = (characterCount: number) => {
  const wordsPerMinute = 200;
  const averageWordLength = 5;
  const words = characterCount / averageWordLength;
  return Math.round(words / wordsPerMinute);
};
