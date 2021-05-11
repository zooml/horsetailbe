export const trimOrUndef = (s: string | undefined): string | undefined => {
  const t = s?.trim();
  return t ? t : undefined;
};
