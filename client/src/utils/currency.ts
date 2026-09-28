/**
 * Utilitários para formatação e manipulação de Moeda Real Brasileira (BRL / R$)
 */

/**
 * Converte qualquer valor inserido pelo usuário (string ou número) para centavos inteiros.
 * Suporta formatos: "150", "150,00", "150.50", "1.500,50", "R$ 150,00", etc.
 * NUNCA retorna NaN.
 */
export function parseBrlToCents(val: string | number | undefined | null): number {
  if (val === undefined || val === null || val === "") return 0;
  if (typeof val === "number") {
    return isNaN(val) ? 0 : Math.round(val);
  }

  // Remove prefixos como "R$", espaços e caracteres inválidos
  let clean = String(val).replace(/R\$\s*/gi, "").trim();
  if (!clean) return 0;

  // Se o usuário digitou formato brasileiro com vírgula decimal (ex: "1.500,50" ou "150,00" ou "50,5")
  if (clean.includes(",")) {
    // Remove os pontos de milhar e troca vírgula decimal por ponto
    clean = clean.replace(/\./g, "").replace(",", ".");
  }

  const num = parseFloat(clean);
  if (isNaN(num)) return 0;
  return Math.round(num * 100);
}

/**
 * Formata um valor numérico em centavos para a representação textual oficial em Real.
 * Exemplo: 15000 -> "R$ 150,00" (com prefixo) ou "150,00" (sem prefixo).
 */
export function formatBrl(cents: number | string = 0, withPrefix = true): string {
  const numCents = typeof cents === "string" ? parseBrlToCents(cents) : (isNaN(cents) ? 0 : Math.round(cents));
  const formatted = (numCents / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return withPrefix ? `R$ ${formatted}` : formatted;
}

/**
 * Formata um valor digitado pelo usuário para exibição em campos de formulário.
 * Ex: "150" -> "150,00" | "150,5" -> "150,50" | "1500" -> "1.500,00"
 */
export function formatBrlInput(val: string | number | undefined | null): string {
  if (val === undefined || val === null) return "";
  const str = String(val).trim();
  if (str === "" || str === "0") return "";
  const cents = parseBrlToCents(str);
  if (cents === 0) return "";
  return (cents / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
