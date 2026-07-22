"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Instalacion como PWA no es critica -- si falla el registro, la app
        // sigue funcionando normal como web.
      });
    }
  }, []);

  return null;
}
