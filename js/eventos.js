/*
 * AGENDA DE EVENTOS
 * ------------------------------------------------------------------
 * Eventos e festas em qualquer estabelecimento da cidade.
 * Por enquanto quem cadastra é você, editando este arquivo.
 * Depois cada bloco { ... } vira uma linha numa tabela do banco de dados.
 *
 * Datas: use o formato "AAAA-MM-DDTHH:MM", por exemplo "2026-11-15T20:00".
 *
 * Os eventos de EXEMPLO abaixo usam em(dias, "HH:MM") para que sempre
 * existam eventos "hoje" e "neste fim de semana" quando você mostrar o
 * protótipo. em(0, "20:00") = hoje às 20h; em(1, ...) = amanhã;
 * noDia(6, ...) = próximo sábado (0 = domingo ... 6 = sábado);
 * depois(inicio, 4) = 4 horas depois do início.
 * Ao cadastrar eventos reais, troque por datas fixas.
 *
 * Campos:
 *  id, titulo, tipo (chave de TIPOS_EVENTO), descricao
 *  local      nome do estabelecimento
 *  lugarId    (opcional) id de um lugar em data.js, liga o evento à página do lugar
 *  endereco, lat, lng
 *  inicio, fim
 *  preco      "Gratuito" ou "R$ 20"
 *  publico    lista com chaves de PUBLICOS (gratuito, familia, mais18, pet, acessivel)
 *  link       (opcional) Instagram ou site para ingressos
 *  exemplo    true = evento fictício de demonstração
 */

const TIPOS_EVENTO = {
  musica:      { nome: "Música",      emoji: "🎵", cor: ["#4b2a7a", "#8a5fc9"] },
  festa:       { nome: "Festa",       emoji: "🎉", cor: ["#a3264f", "#e0577f"] },
  gastronomia: { nome: "Gastronomia", emoji: "🍷", cor: ["#6b1d3a", "#a8325e"] },
  cultura:     { nome: "Cultura",     emoji: "🎭", cor: ["#7a4b12", "#c98a2e"] },
  esporte:     { nome: "Esporte",     emoji: "🚴", cor: ["#2f5d2a", "#6fa34a"] },
  feira:       { nome: "Feira",       emoji: "🛍️", cor: ["#0f5e7a", "#2fa3b8"] },
};

const PUBLICOS = {
  gratuito:  { nome: "Gratuito",      emoji: "🆓" },
  familia:   { nome: "Para família",  emoji: "👨‍👩‍👧" },
  mais18:    { nome: "+18",           emoji: "🔞" },
  pet:       { nome: "Pet friendly",  emoji: "🐾" },
  acessivel: { nome: "Acessível",     emoji: "♿" },
};

function em(dias, hora) {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  const [h, m] = hora.split(":").map(Number);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}
function noDia(diaSemana, hora) {
  const hoje = new Date().getDay();
  return em((diaSemana - hoje + 7) % 7, hora);
}
function depois(inicio, horas) {
  return new Date(new Date(inicio).getTime() + horas * 3600000).toISOString();
}

const EVENTOS = [
  {
    id: "expo-fotografia",
    titulo: "Exposição: Andradas em Fotos",
    tipo: "cultura",
    descricao: "Mostra com fotografias de moradores retratando a cidade, as serras e as vinícolas. Entrada livre o dia todo.",
    local: "Casa da Cultura",
    endereco: "Centro, Andradas - MG",
    lat: -22.0675, lng: -46.5705,
    inicio: em(0, "09:00"), fim: em(0, "23:59"),
    preco: "Gratuito",
    publico: ["gratuito", "familia", "acessivel"],
    exemplo: true,
  },
  {
    id: "voz-violao",
    titulo: "Happy hour com voz e violão",
    tipo: "musica",
    descricao: "Música ao vivo com repertório de MPB e pop rock, petiscos e chope em dobro até as 20h.",
    local: "Bar do Largo",
    endereco: "Centro, Andradas - MG",
    lat: -22.0690, lng: -46.5685,
    inicio: em(0, "18:00"), fim: em(0, "23:00"),
    preco: "Gratuito",
    publico: ["gratuito", "pet"],
    exemplo: true,
  },
  {
    id: "noite-vinhos",
    titulo: "Noite de vinhos e queijos",
    tipo: "gastronomia",
    descricao: "Degustação guiada de 5 rótulos da região harmonizados com queijos artesanais do Sul de Minas. Vagas limitadas.",
    local: "Adega Vale do Sol",
    endereco: "Zona rural de Andradas - MG",
    lat: -22.0500, lng: -46.5550,
    inicio: em(0, "20:00"), fim: em(0, "23:00"),
    preco: "R$ 90",
    publico: ["mais18"],
    link: "https://instagram.com/",
    exemplo: true,
  },
  {
    id: "trilha-guiada",
    titulo: "Trilha guiada até a cachoeira",
    tipo: "esporte",
    descricao: "Caminhada de nível fácil com guia local, saída da praça central. Leve água, protetor e roupa de banho.",
    local: "Saída: Praça Central",
    lugarId: "cachoeira-exemplo-1",
    endereco: "Praça Central, Andradas - MG",
    lat: -22.0688, lng: -46.5700,
    inicio: em(1, "07:30"), fim: em(1, "12:00"),
    preco: "R$ 30",
    publico: ["familia", "pet"],
    exemplo: true,
  },
  {
    id: "feira-produtores",
    titulo: "Feira de produtores rurais",
    tipo: "feira",
    descricao: "Frutas, queijos, doces, cachaças e artesanato direto de quem produz.",
    local: "Praça Central",
    lugarId: "praca-central",
    endereco: "Centro, Andradas - MG",
    lat: -22.0688, lng: -46.5700,
    inicio: noDia(6, "07:00"), fim: noDia(6, "13:00"),
    preco: "Gratuito",
    publico: ["gratuito", "familia", "pet", "acessivel"],
    exemplo: true,
  },
  {
    id: "pedal-vinicolas",
    titulo: "Pedal pelo circuito das vinícolas",
    tipo: "esporte",
    descricao: "Passeio de bike de 25 km passando por 3 vinícolas, com parada para café colonial.",
    local: "Saída: Igreja Matriz",
    lugarId: "igreja-matriz",
    endereco: "Centro, Andradas - MG",
    lat: -22.0680, lng: -46.5690,
    inicio: noDia(6, "08:00"), fim: noDia(6, "13:00"),
    preco: "R$ 40",
    publico: [],
    exemplo: true,
  },
  {
    id: "rock-autoral",
    titulo: "Noite do rock autoral",
    tipo: "musica",
    descricao: "Três bandas da região tocando som próprio. Abertura da casa às 21h.",
    local: "Cervejaria Serra Alta",
    endereco: "Andradas - MG",
    lat: -22.0640, lng: -46.5750,
    inicio: noDia(6, "21:00"), fim: depois(noDia(6, "21:00"), 5),
    preco: "R$ 20",
    publico: ["mais18"],
    link: "https://instagram.com/",
    exemplo: true,
  },
  {
    id: "cinema-praca",
    titulo: "Cinema na praça",
    tipo: "cultura",
    descricao: "Sessão ao ar livre com filme nacional para toda a família. Leve sua cadeira ou canga.",
    local: "Praça Central",
    lugarId: "praca-central",
    endereco: "Centro, Andradas - MG",
    lat: -22.0688, lng: -46.5700,
    inicio: noDia(0, "19:00"), fim: noDia(0, "21:30"),
    preco: "Gratuito",
    publico: ["gratuito", "familia", "pet", "acessivel"],
    exemplo: true,
  },
  {
    id: "baile-saudade",
    titulo: "Baile da saudade",
    tipo: "festa",
    descricao: "Bailinho com banda tocando sucessos dos anos 70, 80 e 90. Pista de dança e comida de boteco.",
    local: "Clube Recreativo",
    endereco: "Andradas - MG",
    lat: -22.0710, lng: -46.5660,
    inicio: noDia(5, "21:00"), fim: depois(noDia(5, "21:00"), 4),
    preco: "R$ 25",
    publico: ["acessivel"],
    exemplo: true,
  },
  {
    id: "workshop-vinho",
    titulo: "Workshop: vinho para iniciantes",
    tipo: "gastronomia",
    descricao: "Aprenda a degustar, ler rótulos e harmonizar, sem frescura.",
    local: "Adega Vale do Sol",
    endereco: "Zona rural de Andradas - MG",
    lat: -22.0500, lng: -46.5550,
    inicio: em(8, "19:00"), fim: em(8, "21:30"),
    preco: "R$ 120",
    publico: ["mais18"],
    exemplo: true,
  },
];
