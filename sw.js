// Service worker: guarda os arquivos do app para abrir mais rápido e funcionar offline.
// Ao mudar algum arquivo, aumente a versão abaixo para os celulares baixarem a nova versão.
const VERSAO = "andradas-v2";
const ARQUIVOS = ["./", "index.html", "css/style.css", "js/data.js", "js/eventos.js", "js/store.js", "js/app.js", "img/icon.svg", "manifest.json"];

self.addEventListener("install", e => e.waitUntil(caches.open(VERSAO).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting())));
self.addEventListener("activate", e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSAO).map(k => caches.delete(k)))).then(() => self.clients.claim())
));
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
