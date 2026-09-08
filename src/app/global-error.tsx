"use client";

import { useEffect } from "react";
import { ErrorScreen } from "@/components/ErrorScreen";
import "./globals.css";

/**
 * Último recurso: solo se usa si revienta el propio layout raíz, así que
 * reemplaza el documento entero y tiene que traer su <html> y su <body>.
 * Sin las variables de fuente de layout.tsx, cae a la pila del sistema — es
 * lo esperable acá, la prioridad es que la pantalla se muestre.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Error global:", error);
  }, [error]);

  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[var(--color-bg)] text-[var(--color-text)]">
        <ErrorScreen
          title="La aplicación no pudo cargar"
          description="Ocurrió un error antes de que la app terminara de iniciar. Reintenta; si sigue pasando, cierra y vuelve a abrir."
          detail={error.digest ? `${error.message}\n\ndigest: ${error.digest}` : error.message}
          onRetry={reset}
        />
      </body>
    </html>
  );
}
