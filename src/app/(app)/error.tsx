"use client";

import { useEffect } from "react";
import { ErrorScreen } from "@/components/ErrorScreen";

/** Error boundary de las pantallas autenticadas: mantiene sidebar y navegación. */
export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Error en la app:", error);
  }, [error]);

  return (
    <ErrorScreen
      detail={error.digest ? `${error.message}\n\ndigest: ${error.digest}` : error.message}
      onRetry={reset}
    />
  );
}
