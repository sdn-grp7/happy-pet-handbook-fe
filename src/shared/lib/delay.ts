/** Shared mock/network delay helper. Replace when wiring real HTTP. */
export const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));
