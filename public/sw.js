// Service worker minimo: cachea el shell estatico para que la app abra
// offline (o con mala señal) y siempre pide la red primero para todo lo
// demas (HTML/API), asi los datos de Supabase nunca quedan desactualizados.
//
// La version del cache tiene que subir cada vez que cambie alguno de los
// SHELL_ASSETS: el navegador solo reinstala el worker si este archivo cambia
// de bytes, y `activate` borra los caches viejos por nombre.
const CACHE = "apex-shell-v2";
const SHELL_ASSETS = ["/apex-logo.svg", "/icon-192.png", "/icon-512.png", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  // `reload` evita que el propio cache HTTP del navegador devuelva la version
  // vieja del asset justo al poblar el cache nuevo.
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(SHELL_ASSETS.map((a) => new Request(a, { cache: "reload" })))),
  );
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

  // Stale-while-revalidate: responde ya con lo cacheado (rapido y offline),
  // pero refresca en segundo plano. Antes era cache-first a secas y un asset
  // cambiado -- el logo, por ejemplo -- quedaba congelado hasta que alguien
  // se acordara de subir la version del cache.
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(request);
      const fromNetwork = fetch(request)
        .then((response) => {
          if (response.ok) cache.put(request, response.clone());
          return response;
        })
        .catch(() => cached);
      return cached ?? fromNetwork;
    }),
  );
});
