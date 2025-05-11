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

export const parseRules = (rulesText: string) => {
  // Verificar se existe o delimitador de regras padrão
  const parts = rulesText.split("### REGRAS PADRÃO ###");
  
  // Usar apenas a primeira parte (regras personalizadas)
  const userRulesText = parts[0].trim();
  
  // Converter para o formato de array de objetos
  return userRulesText
    .split("\n")
    .filter((rule) => rule.trim() !== "")
    .map((rule) => ({ rule }));
};