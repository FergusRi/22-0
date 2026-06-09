export function getRandomNation(nations: string[]): string {
  if (nations.length === 0) {
    throw new Error("Cannot pick a random nation from an empty list");
  }
  return nations[Math.floor(Math.random() * nations.length)];
}
