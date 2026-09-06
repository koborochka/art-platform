export const isValidPrice = (value?: number) => value !== undefined && Number.isFinite(value) && value > 0;
