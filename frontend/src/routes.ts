export const base = import.meta.env.VITE_BASE_ROUTE;
console.log(base);

export const userSettingsBase = base + "/auth";
export const fileBase = base + "/files";