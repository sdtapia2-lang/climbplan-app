import Anthropic from "@anthropic-ai/sdk";

/**
 * SOLO se debe importar desde código server-side (Route Handlers) -- la API
 * key vive en ANTHROPIC_API_KEY (sin prefijo NEXT_PUBLIC_) para que Next.js
 * nunca la incluya en el bundle del navegador.
 */
export function createAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("Falta ANTHROPIC_API_KEY en las variables de entorno del servidor.");
  }
  return new Anthropic({ apiKey });
}

export const INITIAL_GENERATION_MODEL = "claude-opus-4-8";
export const ADJUSTMENT_MODEL = "claude-sonnet-5";
