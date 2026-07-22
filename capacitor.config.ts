import type { CapacitorConfig } from "@capacitor/cli";

// Ápex es una app Next.js con SSR, rutas /api y auth por cookies (Supabase):
// no se puede exportar como sitio estatico. Capacitor arma un shell nativo
// que carga la app desplegada en vivo (misma URL que usan los navegadores),
// asi la app de las tiendas siempre muestra la ultima version sin necesidad
// de re-publicar en el store para cada cambio de codigo.
const config: CapacitorConfig = {
  appId: "com.apex.entrenamiento",
  appName: "Ápex",
  webDir: "public", // requerido por el tipo, no se usa (server.url manda)
  server: {
    url: "https://climbplan-app.vercel.app",
    androidScheme: "https",
    iosScheme: "https",
  },
  ios: {
    contentInset: "always",
  },
};

export default config;
