const MIN_DELAY_MS = 300;
const MAX_DELAY_MS = 800;

export function simulateNetworkDelay(): Promise<void> {
  const delay = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
  return new Promise((resolve) => setTimeout(resolve, delay));
}
