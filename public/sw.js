// Service worker minimo: cachea el shell estatico para que la app abra
// offline (o con mala señal) y siempre pide la red primero para todo lo
// demas (HTML/API), asi los datos de Supabase nunca quedan desactualizados.
const CACHE = "apex-shell-v1";
const SHELL_ASSETS = ["/apex-logo.svg", "/icon-192.png", "/icon-512.png", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  const isShellAsset = SHELL_ASSETS.some((a) => url.pathname === a);
  if (!isShellAsset) return; // red primero para todo lo dinamico (paginas, /api, Supabase)

  event.respondWith(
    caches.match(request).then((cached) => cached ?? fetch(request)),
  );
});
