export const parseExpressionInterpretation = (
  value: string
): { expression: string; translation: string }[] => {
  if (!value) return [];
  try {
    const lines = value.split("\n").filter((line) => line.trim());
    return lines.map((line) => {
      const [expression, translation] = line
        .split(":")
        .map((part) => part.trim());
      return { expression: expression || "", translation: translation || "" };
    });
  } catch (e) {
    return [];
  }
};

export const parseSchedulingScript = (value: string): { step: string }[] => {
  if (!value) return [];
  try {
    const lines = value.split("\n").filter((line) => line.trim());
    return lines.map((line) => ({ step: line.trim() }));
  } catch (e) {
    return [];
  }
};

export const parseRules = (value: string): { rule: string }[] => {
  if (!value) return [];
  try {
    const lines = value.split("\n").filter((line) => line.trim());
    return lines.map((line) => ({ rule: line.trim() }));
  } catch (e) {
    return [];
  }
};