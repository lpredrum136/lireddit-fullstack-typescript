// Fake slow loading
export const sleep = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms))
