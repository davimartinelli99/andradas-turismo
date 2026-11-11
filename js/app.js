/*
 * APP (roteamento + telas)
 * ------------------------------------------------------------------
 * O app é uma "single page application": existe um único index.html e
 * cada tela é desenhada por uma função abaixo, escolhida pelo trecho
 * da URL depois do # (ex: #/lugar/pico-do-gaviao).
 */

const $view = document.getElementById("view");
const $title = document.getElementById("topbar-title");
const $sub = document.getElementById("topbar-sub");
const $voltar = document.getElementById("btn-voltar");
let mapa = null;

/* ---------- utilidades ---------- */
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const lugarPorId = id => LUGARES.find(l => l.id === id);
const fundo = cat => { const c = CATEGORIAS[cat]?.cor || ["#555", "#999"]; return `linear-gradient(135deg, ${c[0]}, ${c[1]})`; };

function tempoAtras(ts) {
  const min = Math.round((Date.now() - ts) / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} h`;
  const d = Math.round(h / 24);
  return `${d} d`;
}

function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove("show"), 2200);
}

function cabecalho(titulo, sub = "", voltar = false) {
  $title.textContent = titulo;
  $sub.textContent = sub;
  $voltar.hidden = !voltar;
}

function capa(lugar, classe = "") {
  const cat = CATEGORIAS[lugar.categoria];
  if (lugar.foto) return `<div class="capa ${classe}" style="background-image:url('${esc(lugar.foto)}')"></div>`;
  return `<div class="capa ${classe}" style="background:${fundo(lugar.categoria)}"><span>${cat.emoji}</span></div>`;
}

/* ---------- eventos: datas e filtros ---------- */
const eventoPorId = id => EVENTOS.find(e => e.id === id);
const fundoEv = tipo => { const c = TIPOS_EVENTO[tipo]?.cor || ["#555", "#999"]; return `linear-gradient(135deg, ${c[0]}, ${c[1]})`; };
const DIAS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const DIAS_LONGOS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

const inicioDoDia = (d = new Date()) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const somarDias = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const mesmoDia = (a, b) => inicioDoDia(a).getTime() === inicioDoDia(b).getTime();
const fmtHora = d => d.getMinutes() ? `${d.getHours()}h${String(d.getMinutes()).padStart(2, "0")}` : `${d.getHours()}h`;
const fmtData = d => `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;

const acontecendoAgora = ev => { const n = Date.now(); return new Date(ev.inicio) <= n && n <= new Date(ev.fim); };

// Eventos que ainda não terminaram, do mais próximo para o mais distante
function eventosFuturos() {
  const agora = new Date();
  return EVENTOS.filter(e => new Date(e.fim) > agora).sort((a, b) => new Date(a.inicio) - new Date(b.inicio));
}

// Um evento "é de um dia" se está acontecendo em algum momento daquele dia
function eventoNoDia(ev, dia) {
  const ini = inicioDoDia(dia), fim = somarDias(ini, 1);
  return new Date(ev.inicio) < fim && new Date(ev.fim) > ini;
}

// Período do filtro "quando" -> [início, fim)
function periodo(quando) {
  const hoje = inicioDoDia();
  if (quando === "hoje") return [hoje, somarDias(hoje, 1)];
  if (quando === "amanha") return [somarDias(hoje, 1), somarDias(hoje, 2)];
  if (quando === "semana") return [hoje, somarDias(hoje, 7)];
  if (quando === "fds") {
    // de sexta 00h até segunda 00h; se hoje já é fim de semana, pega o atual
    const dow = hoje.getDay();
    const ateSexta = dow === 0 ? -2 : dow === 6 ? -1 : 5 - dow;
    const sexta = somarDias(hoje, ateSexta);
    return [sexta, somarDias(sexta, 3)];
  }
  return [hoje, somarDias(hoje, 3650)];
}

function filtrarEventos({ quando = "todos", publico = [], tipo = "" } = {}) {
  const [ini, fim] = periodo(quando);
  return eventosFuturos().filter(e =>
    new Date(e.inicio) < fim && new Date(e.fim) > ini &&
    (!tipo || e.tipo === tipo) &&
    publico.every(p => e.publico.includes(p)));
}

function rotuloQuando(ev) {
  const ini = new Date(ev.inicio);
  if (acontecendoAgora(ev)) return `Acontecendo agora · até ${fmtHora(new Date(ev.fim))}`;
  if (mesmoDia(ini, new Date())) return `Hoje · ${fmtHora(ini)}`;
  if (mesmoDia(ini, somarDias(new Date(), 1))) return `Amanhã · ${fmtHora(ini)}`;
  return `${DIAS[ini.getDay()]}, ${fmtData(ini)} · ${fmtHora(ini)}`;
}

function linkCalendario(ev) {
  const f = d => new Date(d).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const p = new URLSearchParams({ action: "TEMPLATE", text: ev.titulo, dates: `${f(ev.inicio)}/${f(ev.fim)}`,
    location: `${ev.local}, ${ev.endereco}`, details: ev.descricao });
  return `https://calendar.google.com/calendar/render?${p}`;
}

function tagsPublico(ev) {
  return ev.publico.map(p => `<span class="tag">${PUBLICOS[p].emoji} ${PUBLICOS[p].nome}</span>`).join("");
}

function cardEvento(ev) {
  const ini = new Date(ev.inicio);
  const hoje = mesmoDia(ini, new Date()) || acontecendoAgora(ev);
  const t = TIPOS_EVENTO[ev.tipo];
  return `
    <a class="card-evento" href="#/evento/${ev.id}">
      <div class="ev-data" style="background:${fundoEv(ev.tipo)}">
        <small>${hoje ? "HOJE" : DIAS[ini.getDay()].toUpperCase()}</small>
        <b>${hoje ? fmtHora(ini) : ini.getDate()}</b>
      </div>
      <div class="ev-corpo">
        ${acontecendoAgora(ev) ? '<span class="agora">● Agora</span>' : ""}
        <h3>${t.emoji} ${esc(ev.titulo)}</h3>
        <p>📍 ${esc(ev.local)}</p>
        <p>🕒 ${rotuloQuando(ev)} · <b>${esc(ev.preco)}</b></p>
        <div class="tags">${tagsPublico(ev)}</div>
      </div>
    </a>`;
}

function cardLugar(l) {
  const cat = CATEGORIAS[l.categoria];
  return `
    <a class="card-lugar" href="#/lugar/${l.id}">
      ${capa(l)}
      <div class="card-corpo">
        <span class="chip-cat">${cat.emoji} ${cat.nome}</span>
        <h3>${esc(l.nome)}</h3>
        <p>${esc(l.resumo)}</p>
        <div class="card-meta"><span>${esc(l.preco)}</span>${Store.ehFavorito(l.id) ? '<span class="fav-on">♥</span>' : ""}</div>
      </div>
    </a>`;
}

/* ---------- telas ---------- */
function telaInicio() {
  const hoje = new Date();
  cabecalho("Andradas hoje", `${DIAS_LONGOS[hoje.getDay()]}, ${fmtData(hoje)}`);
  const deHoje = filtrarEventos({ quando: "hoje" });
  const fds = filtrarEventos({ quando: "fds" }).filter(e => !deHoje.includes(e));
  const ultimos = Store.posts().slice(0, 6);
  $view.innerHTML = `
    <form class="busca" onsubmit="event.preventDefault(); location.hash='#/busca?q='+encodeURIComponent(this.q.value)">
      <input name="q" type="search" placeholder="Buscar evento, lugar, bar, cachoeira..." aria-label="Buscar">
    </form>

    <section>
      <div class="secao-titulo"><h2>O que rola hoje (${deHoje.length})</h2><a href="#/agenda?quando=hoje">Filtrar</a></div>
      ${deHoje.length ? `<div class="lista">${deHoje.map(cardEvento).join("")}</div>`
        : `<p class="vazio">Nenhum evento cadastrado para hoje. <a href="#/agenda?quando=fds">Veja o fim de semana</a></p>`}
    </section>

    <section>
      <div class="secao-titulo"><h2>Neste fim de semana</h2><a href="#/agenda?quando=fds">Ver tudo</a></div>
      ${fds.length ? `<div class="lista">${fds.slice(0, 4).map(cardEvento).join("")}</div>`
        : `<p class="vazio">Nada cadastrado para o fim de semana ainda.</p>`}
    </section>

    <section>
      <div class="secao-titulo"><h2>Explore a cidade</h2><a href="#/lugares">Todos os lugares</a></div>
      <div class="categorias">
        ${Object.entries(CATEGORIAS).map(([k, c]) => `
          <a href="#/lugares?cat=${k}" class="cat-btn" style="background:${fundo(k)}">
            <span class="cat-emoji">${c.emoji}</span><span>${c.nome}</span>
          </a>`).join("")}
      </div>
    </section>

    <section>
      <div class="secao-titulo"><h2>Da comunidade</h2><a href="#/comunidade">Ver feed</a></div>
      <div class="grade-fotos">
        ${ultimos.map(p => `<a href="#/comunidade" class="mini-post">${fotoPost(p)}</a>`).join("")}
      </div>
      <a class="btn btn-primario btn-bloco" href="#/novo-post">📷 Compartilhar uma foto</a>
    </section>`;
}

function telaAgenda(params) {
  cabecalho("Agenda", "Eventos e festas em Andradas");
  const f = {
    quando: params.get("quando") || "semana",
    tipo: params.get("tipo") || "",
    publico: (params.get("publico") || "").split(",").filter(Boolean),
  };
  const QUANDO = { hoje: "Hoje", amanha: "Amanhã", fds: "Fim de semana", semana: "7 dias", todos: "Tudo" };

  $view.innerHTML = `
    <div class="chips" id="f-quando">
      ${Object.entries(QUANDO).map(([k, n]) => `<button class="chip ${f.quando === k ? "ativo" : ""}" data-v="${k}">${n}</button>`).join("")}
    </div>
    <div class="chips" id="f-tipo">
      <button class="chip ${!f.tipo ? "ativo" : ""}" data-v="">Todos os tipos</button>
      ${Object.entries(TIPOS_EVENTO).map(([k, t]) => `<button class="chip ${f.tipo === k ? "ativo" : ""}" data-v="${k}">${t.emoji} ${t.nome}</button>`).join("")}
    </div>
    <div class="chips" id="f-publico">
      ${Object.entries(PUBLICOS).map(([k, p]) => `<button class="chip ${f.publico.includes(k) ? "ativo" : ""}" data-v="${k}" aria-pressed="${f.publico.includes(k)}">${p.emoji} ${p.nome}</button>`).join("")}
    </div>
    <div id="ag-lista"></div>`;

  const desenhar = () => {
    // guarda os filtros na URL, para o link poder ser compartilhado
    const qs = new URLSearchParams({ quando: f.quando });
    if (f.tipo) qs.set("tipo", f.tipo);
    if (f.publico.length) qs.set("publico", f.publico.join(","));
    history.replaceState(null, "", "#/agenda?" + qs);

    const res = filtrarEventos(f);
    if (!res.length) {
      document.getElementById("ag-lista").innerHTML = `<p class="vazio">Nenhum evento com esses filtros.</p>`;
      return;
    }
    // agrupa por dia (eventos que já começaram aparecem em "hoje")
    const grupos = new Map();
    res.forEach(e => {
      const d = new Date(Math.max(new Date(e.inicio), inicioDoDia()));
      const k = inicioDoDia(d).getTime();
      if (!grupos.has(k)) grupos.set(k, []);
      grupos.get(k).push(e);
    });
    document.getElementById("ag-lista").innerHTML = [...grupos].map(([k, evs]) => {
      const d = new Date(k);
      const nome = mesmoDia(d, new Date()) ? "Hoje" : mesmoDia(d, somarDias(new Date(), 1)) ? "Amanhã" : DIAS_LONGOS[d.getDay()];
      return `<h3 class="dia-titulo">${nome}, ${fmtData(d)}</h3><div class="lista">${evs.map(cardEvento).join("")}</div>`;
    }).join("");
  };

  const unico = (id, chave) => document.getElementById(id).addEventListener("click", e => {
    const b = e.target.closest("[data-v]");
    if (!b) return;
    f[chave] = b.dataset.v;
    document.querySelectorAll(`#${id} .chip`).forEach(c => c.classList.toggle("ativo", c === b));
    desenhar();
  });
  unico("f-quando", "quando");
  unico("f-tipo", "tipo");
  document.getElementById("f-publico").addEventListener("click", e => {
    const b = e.target.closest("[data-v]");
    if (!b) return;
    const v = b.dataset.v;
    f.publico = f.publico.includes(v) ? f.publico.filter(x => x !== v) : [...f.publico, v];
    b.classList.toggle("ativo");
    b.setAttribute("aria-pressed", f.publico.includes(v));
    desenhar();
  });
  desenhar();
}

function telaEvento(id) {
  const ev = eventoPorId(id);
  if (!ev) return tela404();
  const t = TIPOS_EVENTO[ev.tipo];
  cabecalho(ev.titulo, t.nome, true);
  const lugar = ev.lugarId ? lugarPorId(ev.lugarId) : null;
  const posts = Store.posts().filter(p => p.eventoId === ev.id);
  const salvo = Store.ehFavorito(ev.id);
  const encerrado = new Date(ev.fim) < new Date();
  const ini = new Date(ev.inicio), fim = new Date(ev.fim);
  const textoShare = `${ev.titulo}\n${rotuloQuando(ev)}\n📍 ${ev.local}\n${location.href}`;

  $view.innerHTML = `
    <div class="capa capa-grande" style="background:${ev.foto ? `url('${esc(ev.foto)}') center/cover` : fundoEv(ev.tipo)}">${ev.foto ? "" : `<span>${t.emoji}</span>`}</div>
    <article class="detalhe">
      <span class="chip-cat">${t.emoji} ${t.nome}</span>
      ${ev.exemplo ? '<span class="selo-exemplo">Evento de exemplo</span>' : ""}
      ${encerrado ? '<span class="selo-exemplo">Encerrado</span>' : acontecendoAgora(ev) ? '<span class="agora">● Acontecendo agora</span>' : ""}
      <h2>${esc(ev.titulo)}</h2>
      <p>${esc(ev.descricao)}</p>
      <div class="tags">${tagsPublico(ev)}</div>

      <div class="acoes">
        <a class="btn btn-primario" href="${linkCalendario(ev)}" target="_blank" rel="noopener">📅 Adicionar à agenda</a>
        <a class="btn" href="https://wa.me/?text=${encodeURIComponent(textoShare)}" target="_blank" rel="noopener">💬 WhatsApp</a>
        <button class="btn" id="btn-fav">${salvo ? "♥ Salvo" : "♡ Salvar"}</button>
        ${ev.link ? `<a class="btn" href="${esc(ev.link)}" target="_blank" rel="noopener">🎟 Ingressos / Info</a>` : ""}
      </div>

      <dl class="infos">
        <div><dt>🕒 Quando</dt><dd>${DIAS_LONGOS[ini.getDay()]}, ${fmtData(ini)}, das ${fmtHora(ini)} às ${fmtHora(fim)}${mesmoDia(ini, fim) ? "" : ` (${fmtData(fim)})`}</dd></div>
        <div><dt>📍 Local</dt><dd>${lugar ? `<a href="#/lugar/${lugar.id}">${esc(ev.local)}</a>` : esc(ev.local)}<br>${esc(ev.endereco)}
          · <a href="https://www.google.com/maps/dir/?api=1&destination=${ev.lat},${ev.lng}" target="_blank" rel="noopener">Como chegar</a></dd></div>
        <div><dt>💲 Preço</dt><dd>${esc(ev.preco)}</dd></div>
      </dl>

      <div class="secao-titulo"><h3>Fotos do evento (${posts.length})</h3><a href="#/novo-post?evento=${ev.id}">+ Postar</a></div>
      ${posts.length ? `<div class="grade-fotos">${posts.map(p => `<div class="mini-post">${fotoPost(p)}</div>`).join("")}</div>`
        : `<p class="vazio">${encerrado || acontecendoAgora(ev) ? "Esteve lá? Poste a primeira foto!" : "As fotos aparecem aqui durante e depois do evento."}</p>`}
    </article>`;

  document.getElementById("btn-fav").onclick = e => {
    const on = Store.alternarFavorito(ev.id);
    e.target.textContent = on ? "♥ Salvo" : "♡ Salvar";
    toast(on ? "Evento salvo no seu perfil" : "Removido dos salvos");
  };
}

function telaBusca(params) {
  const q = params.get("q") || "";
  cabecalho("Busca", q ? `"${q}"` : "", true);
  const norm = s => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const termo = norm(q);
  const evs = eventosFuturos().filter(e => norm(`${e.titulo} ${e.local} ${e.descricao} ${TIPOS_EVENTO[e.tipo].nome}`).includes(termo));
  const lugs = LUGARES.filter(l => norm(`${l.nome} ${l.resumo} ${l.descricao} ${CATEGORIAS[l.categoria].nome}`).includes(termo));
  $view.innerHTML = `
    <form class="busca" onsubmit="event.preventDefault(); location.hash='#/busca?q='+encodeURIComponent(this.q.value)">
      <input name="q" type="search" value="${esc(q)}" placeholder="Buscar..." aria-label="Buscar">
    </form>
    <div class="secao-titulo"><h2>Eventos (${evs.length})</h2></div>
    ${evs.length ? `<div class="lista">${evs.map(cardEvento).join("")}</div>` : '<p class="vazio">Nenhum evento encontrado.</p>'}
    <div class="secao-titulo"><h2>Lugares (${lugs.length})</h2></div>
    ${lugs.length ? `<div class="lista">${lugs.map(cardLugar).join("")}</div>` : '<p class="vazio">Nenhum lugar encontrado.</p>'}`;
}

function telaExplorar(params) {
  cabecalho("Lugares", `${LUGARES.length} lugares para conhecer`);
  let cat = params.get("cat") || "";
  let q = params.get("q") || "";

  $view.innerHTML = `
    <form class="busca" onsubmit="event.preventDefault()">
      <input id="f-q" type="search" placeholder="Buscar..." value="${esc(q)}" aria-label="Buscar">
    </form>
    <div class="chips" id="f-cats">
      <button class="chip ${!cat ? "ativo" : ""}" data-cat="">Todos</button>
      ${Object.entries(CATEGORIAS).map(([k, c]) => `<button class="chip ${cat === k ? "ativo" : ""}" data-cat="${k}">${c.emoji} ${c.nome}</button>`).join("")}
    </div>
    <div class="lista" id="f-lista"></div>`;

  const desenhar = () => {
    const termo = q.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    const res = LUGARES.filter(l => (!cat || l.categoria === cat) &&
      (!termo || (l.nome + " " + l.resumo + " " + l.descricao).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").includes(termo)));
    document.getElementById("f-lista").innerHTML = res.length
      ? res.map(cardLugar).join("")
      : `<p class="vazio">Nenhum lugar encontrado. Tente outra busca.</p>`;
  };
  document.getElementById("f-q").addEventListener("input", e => { q = e.target.value; desenhar(); });
  document.getElementById("f-cats").addEventListener("click", e => {
    const b = e.target.closest("[data-cat]");
    if (!b) return;
    cat = b.dataset.cat;
    document.querySelectorAll("#f-cats .chip").forEach(c => c.classList.toggle("ativo", c === b));
    desenhar();
  });
  desenhar();
}

function telaLugar(id) {
  const l = lugarPorId(id);
  if (!l) return tela404();
  const cat = CATEGORIAS[l.categoria];
  cabecalho(l.nome, cat.nome, true);
  const posts = Store.postsDoLugar(l.id);
  const fav = Store.ehFavorito(l.id);
  const rota = `https://www.google.com/maps/dir/?api=1&destination=${l.lat},${l.lng}`;

  $view.innerHTML = `
    ${capa(l, "capa-grande")}
    <article class="detalhe">
      <span class="chip-cat">${cat.emoji} ${cat.nome}</span>
      ${l.exemplo ? '<span class="selo-exemplo" title="Confirme as informações e edite js/data.js">Dado de exemplo</span>' : ""}
      <h2>${esc(l.nome)}</h2>
      <p>${esc(l.descricao)}</p>

      <div class="acoes">
        <a class="btn btn-primario" href="${rota}" target="_blank" rel="noopener">🧭 Como chegar</a>
        <button class="btn" id="btn-fav">${fav ? "♥ Salvo" : "♡ Salvar"}</button>
        <button class="btn" id="btn-share">↗ Compartilhar</button>
      </div>

      <dl class="infos">
        <div><dt>📍 Endereço</dt><dd>${esc(l.endereco)}</dd></div>
        <div><dt>🕒 Horário</dt><dd>${esc(l.horario)}</dd></div>
        <div><dt>💲 Preço</dt><dd>${esc(l.preco)}</dd></div>
      </dl>

      ${(() => { const evs = eventosFuturos().filter(e => e.lugarId === l.id);
        return evs.length ? `<div class="secao-titulo"><h3>Próximos eventos aqui</h3></div><div class="lista">${evs.map(cardEvento).join("")}</div>` : ""; })()}

      ${l.dicas.length ? `<h3>Dicas</h3><ul class="dicas">${l.dicas.map(d => `<li>${esc(d)}</li>`).join("")}</ul>` : ""}

      <div class="secao-titulo"><h3>Fotos de visitantes (${posts.length})</h3>
        <a href="#/novo-post?lugar=${l.id}">+ Postar</a></div>
      ${posts.length ? `<div class="grade-fotos">${posts.map(p => `<div class="mini-post">${fotoPost(p)}</div>`).join("")}</div>`
        : `<p class="vazio">Ninguém postou aqui ainda. Seja o primeiro!</p>`}
    </article>`;

  document.getElementById("btn-fav").onclick = e => {
    const on = Store.alternarFavorito(l.id);
    e.target.textContent = on ? "♥ Salvo" : "♡ Salvar";
    toast(on ? "Salvo nos favoritos" : "Removido dos favoritos");
  };
  document.getElementById("btn-share").onclick = async () => {
    const dados = { title: l.nome, text: `${l.nome}: ${l.resumo}`, url: location.href };
    try {
      if (navigator.share) await navigator.share(dados);
      else { await navigator.clipboard.writeText(location.href); toast("Link copiado"); }
    } catch { /* usuário cancelou */ }
  };
}

function telaMapa() {
  cabecalho("Mapa", "Toque num ponto para ver detalhes");
  $view.innerHTML = `
    <div class="chips chips-mapa" id="m-cats">
      <button class="chip ativo" data-cat="">Todos</button>
      <button class="chip" data-cat="eventos">📅 Eventos (7 dias)</button>
      ${Object.entries(CATEGORIAS).map(([k, c]) => `<button class="chip" data-cat="${k}" title="${c.nome}">${c.emoji}</button>`).join("")}
    </div>
    <div id="mapa" class="mapa"></div>
    <button class="btn btn-flutuante" id="btn-local">◎ Onde estou</button>`;

  if (typeof L === "undefined") {
    document.getElementById("mapa").innerHTML = `<p class="vazio">Não foi possível carregar o mapa. Verifique a internet.</p>`;
    return;
  }
  mapa = L.map("mapa", { zoomControl: false }).setView([CENTRO_CIDADE.lat, CENTRO_CIDADE.lng], CENTRO_CIDADE.zoom);
  L.control.zoom({ position: "bottomright" }).addTo(mapa);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18, attribution: "© OpenStreetMap",
  }).addTo(mapa);

  const camada = L.layerGroup().addTo(mapa);
  const desenhar = cat => {
    camada.clearLayers();
    if (!cat || cat === "eventos") {
      filtrarEventos({ quando: "semana" }).forEach(ev => {
        const t = TIPOS_EVENTO[ev.tipo];
        const icone = L.divIcon({ className: "pino pino-evento", html: `<span style="background:${fundoEv(ev.tipo)}"><i>${t.emoji}</i></span>`, iconSize: [36, 36], iconAnchor: [18, 36] });
        L.marker([ev.lat, ev.lng], { icon: icone, zIndexOffset: 1000 }).addTo(camada)
          .bindPopup(`<strong>${esc(ev.titulo)}</strong><br>${esc(ev.local)}<br>${rotuloQuando(ev)}<br><a href="#/evento/${ev.id}">Ver evento →</a>`);
      });
    }
    if (cat === "eventos") return;
    LUGARES.filter(l => !cat || l.categoria === cat).forEach(l => {
      const c = CATEGORIAS[l.categoria];
      const icone = L.divIcon({ className: "pino", html: `<span style="background:${fundo(l.categoria)}"><i>${c.emoji}</i></span>`, iconSize: [36, 36], iconAnchor: [18, 36] });
      L.marker([l.lat, l.lng], { icon: icone }).addTo(camada)
        .bindPopup(`<strong>${esc(l.nome)}</strong><br>${esc(l.resumo)}<br><a href="#/lugar/${l.id}">Ver detalhes →</a>`);
    });
  };
  desenhar("");
  document.getElementById("m-cats").addEventListener("click", e => {
    const b = e.target.closest("[data-cat]");
    if (!b) return;
    document.querySelectorAll("#m-cats .chip").forEach(c => c.classList.toggle("ativo", c === b));
    desenhar(b.dataset.cat);
  });
  document.getElementById("btn-local").onclick = () => {
    if (!navigator.geolocation) return toast("Localização indisponível");
    navigator.geolocation.getCurrentPosition(
      pos => {
        const p = [pos.coords.latitude, pos.coords.longitude];
        L.circleMarker(p, { radius: 8, color: "#fff", weight: 3, fillColor: "#1a73e8", fillOpacity: 1 }).addTo(mapa);
        mapa.setView(p, 14);
      },
      () => toast("Permissão de localização negada"));
  };
  setTimeout(() => mapa.invalidateSize(), 50);
}

function fotoPost(p) {
  if (p.foto) return `<img src="${p.foto}" alt="${esc(p.legenda)}" loading="lazy">`;
  const ev = eventoPorId(p.eventoId);
  if (ev) return `<div class="foto-fake" style="background:${fundoEv(ev.tipo)}"><span>${TIPOS_EVENTO[ev.tipo].emoji}</span></div>`;
  const l = lugarPorId(p.lugarId);
  const cat = l ? l.categoria : "pontos";
  return `<div class="foto-fake" style="background:${fundo(cat)}"><span>${CATEGORIAS[cat].emoji}</span></div>`;
}

function cardPost(p) {
  const u = Store.usuario();
  const l = lugarPorId(p.lugarId);
  const ev = eventoPorId(p.eventoId);
  const curtiu = p.curtidas.includes(u.id);
  const meu = p.autorId === u.id;
  return `
    <article class="post" data-id="${p.id}">
      <header class="post-topo">
        <span class="avatar">${esc((p.autor || "?")[0].toUpperCase())}</span>
        <div>
          <strong>${esc(p.autor)}</strong>
          ${ev ? `<a href="#/evento/${ev.id}" class="post-lugar">📅 ${esc(ev.titulo)}</a>`
            : l ? `<a href="#/lugar/${l.id}" class="post-lugar">📍 ${esc(l.nome)}</a>` : ""}
        </div>
        <span class="post-tempo">${tempoAtras(p.data)}</span>
        ${meu ? `<button class="icon-btn" data-acao="apagar" aria-label="Apagar post">🗑</button>` : ""}
      </header>
      <div class="post-foto" data-acao="curtir-duplo">${fotoPost(p)}</div>
      <div class="post-acoes">
        <button data-acao="curtir" class="${curtiu ? "curtido" : ""}" aria-label="Curtir">${curtiu ? "♥" : "♡"} ${p.curtidas.length}</button>
        <button data-acao="abrir-coment" aria-label="Comentar">💬 ${p.comentarios.length}</button>
      </div>
      <p class="post-legenda"><strong>${esc(p.autor)}</strong> ${esc(p.legenda)}</p>
      <div class="comentarios" hidden>
        ${p.comentarios.map(c => `<p><strong>${esc(c.autor)}</strong> ${esc(c.texto)}</p>`).join("")}
        <form data-acao="comentar"><input name="t" placeholder="Escreva um comentário..." maxlength="300" required><button>Enviar</button></form>
      </div>
    </article>`;
}

function telaComunidade() {
  cabecalho("Comunidade", "Fotos de quem visitou Andradas");
  const posts = Store.posts();
  $view.innerHTML = `
    <a class="btn btn-primario btn-bloco" href="#/novo-post">📷 Nova publicação</a>
    <div class="feed" id="feed">${posts.length ? posts.map(cardPost).join("") : '<p class="vazio">Nenhuma publicação ainda.</p>'}</div>`;
  ligarFeed(document.getElementById("feed"), telaComunidade);
}

function ligarFeed(el, redesenhar) {
  el.addEventListener("click", e => {
    const alvo = e.target.closest("[data-acao]");
    if (!alvo) return;
    const post = alvo.closest(".post");
    const id = post.dataset.id;
    const acao = alvo.dataset.acao;
    if (acao === "curtir") {
      const p = Store.alternarCurtida(id);
      const curtiu = p.curtidas.includes(Store.usuario().id);
      alvo.className = curtiu ? "curtido" : "";
      alvo.textContent = `${curtiu ? "♥" : "♡"} ${p.curtidas.length}`;
    } else if (acao === "abrir-coment") {
      const c = post.querySelector(".comentarios");
      c.hidden = !c.hidden;
      if (!c.hidden) c.querySelector("input").focus();
    } else if (acao === "apagar") {
      if (confirm("Apagar esta publicação?")) { Store.apagarPost(id); redesenhar(); toast("Publicação apagada"); }
    }
  });
  el.addEventListener("dblclick", e => {
    const f = e.target.closest("[data-acao='curtir-duplo']");
    if (!f) return;
    const btn = f.closest(".post").querySelector("[data-acao='curtir']");
    if (!btn.classList.contains("curtido")) btn.click();
  });
  el.addEventListener("submit", e => {
    e.preventDefault();
    const post = e.target.closest(".post");
    Store.comentar(post.dataset.id, e.target.t.value);
    redesenhar();
    const novo = document.querySelector(`.post[data-id="${post.dataset.id}"] .comentarios`);
    if (novo) novo.hidden = false;
  });
}

function redimensionar(arquivo, max = 1000, qualidade = 0.75) {
  return new Promise((ok, erro) => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * k);
      c.height = Math.round(img.height * k);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(img.src);
      ok(c.toDataURL("image/jpeg", qualidade));
    };
    img.onerror = erro;
    img.src = URL.createObjectURL(arquivo);
  });
}

function telaNovoPost(params) {
  cabecalho("Nova publicação", "", true);
  const u = Store.usuario();
  // pré-seleção vinda de "+ Postar" num lugar ou evento
  const pre = params.get("evento") ? "e:" + params.get("evento") : params.get("lugar") ? "l:" + params.get("lugar") : "";
  // eventos que podem ser marcados: de 3 dias atrás até hoje
  const limite = somarDias(inicioDoDia(), -3);
  const evsMarcaveis = EVENTOS.filter(e => new Date(e.fim) > limite && new Date(e.inicio) < somarDias(inicioDoDia(), 1) || "e:" + e.id === pre);
  $view.innerHTML = `
    <form class="form-post" id="form-post">
      <label class="upload" id="upload">
        <input type="file" accept="image/*" id="np-foto" required>
        <span id="upload-txt">📷 Toque para escolher uma foto</span>
        <img id="np-preview" alt="" hidden>
      </label>
      ${u.nome ? "" : `<label>Seu nome<input id="np-nome" maxlength="30" placeholder="Como quer aparecer" required></label>`}
      <label>Legenda<textarea id="np-legenda" maxlength="500" rows="3" placeholder="Conte como foi..."></textarea></label>
      <label>Onde foi?
        <select id="np-lugar">
          <option value="">Não marcar</option>
          ${evsMarcaveis.length ? `<optgroup label="Eventos recentes">${evsMarcaveis.map(e => `<option value="e:${e.id}" ${"e:" + e.id === pre ? "selected" : ""}>${esc(e.titulo)} (${esc(e.local)})</option>`).join("")}</optgroup>` : ""}
          <optgroup label="Lugares">${LUGARES.map(l => `<option value="l:${l.id}" ${"l:" + l.id === pre ? "selected" : ""}>${esc(l.nome)}</option>`).join("")}</optgroup>
        </select>
      </label>
      <button class="btn btn-primario btn-bloco" id="np-enviar">Publicar</button>
    </form>`;

  let fotoData = null;
  document.getElementById("np-foto").addEventListener("change", async e => {
    const f = e.target.files[0];
    if (!f) return;
    try {
      fotoData = await redimensionar(f);
      const prev = document.getElementById("np-preview");
      prev.src = fotoData; prev.hidden = false;
      document.getElementById("upload-txt").hidden = true;
    } catch { toast("Não consegui ler essa imagem"); }
  });
  document.getElementById("form-post").addEventListener("submit", e => {
    e.preventDefault();
    if (!fotoData) return toast("Escolha uma foto");
    const nome = document.getElementById("np-nome");
    if (nome) Store.definirNome(nome.value);
    const [tipo, alvo] = document.getElementById("np-lugar").value.split(":");
    const ev = tipo === "e" ? eventoPorId(alvo) : null;
    const ok = Store.criarPost({
      foto: fotoData,
      legenda: document.getElementById("np-legenda").value,
      eventoId: ev ? ev.id : null,
      lugarId: tipo === "l" ? alvo : ev?.lugarId || null,
    });
    if (!ok) return toast("Sem espaço no aparelho. Apague posts antigos.");
    toast("Publicado!");
    location.hash = ev ? `#/evento/${ev.id}` : "#/comunidade";
  });
}

function telaPerfil() {
  const u = Store.usuario();
  cabecalho("Perfil", "");
  const meus = Store.postsDoUsuario();
  const favs = Store.favoritos().map(lugarPorId).filter(Boolean);
  const evsSalvos = eventosFuturos().filter(e => Store.ehFavorito(e.id));
  $view.innerHTML = `
    <section class="perfil">
      <span class="avatar avatar-g">${esc((u.nome || "?")[0].toUpperCase())}</span>
      <form id="form-nome" class="form-nome">
        <input name="n" value="${esc(u.nome)}" placeholder="Seu nome" maxlength="30" aria-label="Seu nome">
        <button class="btn">Salvar</button>
      </form>
      <div class="numeros"><div><b>${meus.length}</b><span>posts</span></div><div><b>${favs.length + evsSalvos.length}</b><span>salvos</span></div></div>
    </section>

    <div class="secao-titulo"><h2>Meus próximos eventos</h2></div>
    ${evsSalvos.length ? `<div class="lista">${evsSalvos.map(cardEvento).join("")}</div>` : '<p class="vazio">Toque em "♡ Salvar" num evento para lembrar dele aqui.</p>'}

    <div class="secao-titulo"><h2>Lugares salvos</h2></div>
    ${favs.length ? `<div class="lista">${favs.map(cardLugar).join("")}</div>` : '<p class="vazio">Toque em "♡ Salvar" num lugar para guardar aqui.</p>'}

    <div class="secao-titulo"><h2>Minhas fotos</h2></div>
    ${meus.length ? `<div class="grade-fotos">${meus.map(p => `<div class="mini-post">${fotoPost(p)}</div>`).join("")}</div>` : '<p class="vazio">Você ainda não publicou nada.</p>'}`;

  document.getElementById("form-nome").addEventListener("submit", e => {
    e.preventDefault();
    Store.definirNome(e.target.n.value);
    toast("Nome salvo");
    telaPerfil();
  });
}

function tela404() {
  cabecalho("Ops", "", true);
  $view.innerHTML = `<p class="vazio">Página não encontrada. <a href="#/">Voltar ao início</a></p>`;
}

/* ---------- roteador ---------- */
function rotear() {
  if (mapa) { mapa.remove(); mapa = null; }
  const [caminho, qs] = (location.hash.slice(1) || "/").split("?");
  const params = new URLSearchParams(qs || "");
  const partes = caminho.split("/").filter(Boolean);
  const aba = { "": "inicio", agenda: "agenda", evento: "agenda", lugares: "lugares", explorar: "lugares", lugar: "lugares",
    mapa: "mapa", comunidade: "comunidade", "novo-post": "comunidade", perfil: "perfil" }[partes[0] || ""];

  document.querySelectorAll("[data-tab]").forEach(a => a.classList.toggle("ativo", a.dataset.tab === aba));
  document.body.classList.toggle("modo-mapa", partes[0] === "mapa");

  switch (partes[0]) {
    case undefined: telaInicio(); break;
    case "agenda": telaAgenda(params); break;
    case "evento": telaEvento(partes[1]); break;
    case "busca": telaBusca(params); break;
    case "lugares":
    case "explorar": telaExplorar(params); break;
    case "lugar": telaLugar(partes[1]); break;
    case "mapa": telaMapa(); break;
    case "comunidade": telaComunidade(); break;
    case "novo-post": telaNovoPost(params); break;
    case "perfil": telaPerfil(); break;
    default: tela404();
  }
  window.scrollTo(0, 0);
}

$voltar.onclick = () => (history.length > 1 ? history.back() : (location.hash = "#/"));
window.addEventListener("hashchange", rotear);
rotear();

if ("serviceWorker" in navigator && location.protocol === "https:") {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
