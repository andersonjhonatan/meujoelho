/**
 * Validação de entrada das Server Actions.
 *
 * Server Action é endpoint público: qualquer um pode chamar com qualquer
 * payload. Sem isso, um `painLevel: 9999` ou um `loadKg: "abc"` chegava ao
 * banco (ou derrubava a rota com 500), como acontecia nas rotas de API antigas.
 * É um validador pequeno e explícito, para não trazer dependência nova.
 */

export class ValidationError extends Error {}

export function intInRange(value: unknown, min: number, max: number, field: string): number {
  const n = typeof value === "string" ? Number(value) : value;
  if (typeof n !== "number" || !Number.isFinite(n) || !Number.isInteger(n) || n < min || n > max) {
    throw new ValidationError(`${field} deve ser um número inteiro entre ${min} e ${max}.`);
  }
  return n;
}

export function optionalIntInRange(value: unknown, min: number, max: number, field: string): number | null {
  if (value === undefined || value === null || value === "") return null;
  return intInRange(value, min, max, field);
}

export function optionalFloatInRange(value: unknown, min: number, max: number, field: string): number | null {
  if (value === undefined || value === null || value === "") return null;
  const n = typeof value === "string" ? Number(value.replace(",", ".")) : value;
  if (typeof n !== "number" || !Number.isFinite(n) || n < min || n > max) {
    throw new ValidationError(`${field} deve ser um número entre ${min} e ${max}.`);
  }
  return n;
}

export function optionalText(value: unknown, maxLength: number, field: string): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string") throw new ValidationError(`${field} deve ser texto.`);
  const trimmed = value.trim();
  if (trimmed === "") return null;
  if (trimmed.length > maxLength) {
    throw new ValidationError(`${field} deve ter no máximo ${maxLength} caracteres.`);
  }
  return trimmed;
}

export function boolean(value: unknown): boolean {
  return value === true || value === "true" || value === "on" || value === 1;
}

export function cuid(value: unknown, field: string): string {
  if (typeof value !== "string" || !/^[a-z0-9]{20,40}$/i.test(value)) {
    throw new ValidationError(`${field} inválido.`);
  }
  return value;
}
