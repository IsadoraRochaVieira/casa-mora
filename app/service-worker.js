const CACHE = "casa-mora-mvp-v16";
const ASSETS = ["./", "index.html", "styles.css", "app.js", "db.js", "live.js", "lib/safety.js", "manifest.webmanifest", "assets/casa-mora-logo-completa.png", "assets/casa-mora-simbolo.png", "assets/casa-mora-nome.png"];
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
});
self.addEventListener("activate", (event) => event.waitUntil(Promise.all([
  caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))),
  self.clients.claim()
])));
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(fetch(event.request).then((response) => {
    const copy = response.clone();
    caches.open(CACHE).then((cache) => cache.put(event.request.mode === "navigate" ? "./" : event.request, copy));
    return response;
  }).catch(() => caches.match(event.request.mode === "navigate" ? "./" : event.request)));
});
