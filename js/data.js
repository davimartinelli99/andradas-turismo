/*
 * DADOS DOS LUGARES
 * ------------------------------------------------------------------
 * Este é o "banco de dados" do guia. Para adicionar um lugar novo,
 * copie um bloco { ... } e altere os campos.
 *
 * IMPORTANTE: itens com `exemplo: true` têm nome, endereço ou
 * coordenadas de EXEMPLO. Confirme as informações (Google Maps,
 * Secretaria de Turismo de Andradas, redes sociais do local) e depois
 * troque para `exemplo: false`. O app mostra um selo "Dado de exemplo"
 * enquanto isso não for feito.
 *
 * Campos:
 *  id        identificador único, sem espaço (usado na URL)
 *  nome      nome exibido
 *  categoria uma das chaves de CATEGORIAS abaixo
 *  resumo    frase curta para os cards
 *  descricao texto completo da página de detalhes
 *  endereco  endereço ou referência
 *  lat, lng  coordenadas (clique com botão direito no Google Maps para copiar)
 *  horario   horário de funcionamento
 *  preco     "Gratuito", "$", "$$" ou "$$$"
 *  dicas     lista de dicas rápidas
 *  foto      caminho de uma imagem em /img (opcional; sem foto usa um degradê)
 *  exemplo   true = informação ainda não confirmada
 */

const CATEGORIAS = {
  vinicolas:   { nome: "Vinícolas",          emoji: "🍷", cor: ["#6b1d3a", "#a8325e"] },
  cachoeiras:  { nome: "Cachoeiras",         emoji: "💧", cor: ["#0f5e7a", "#2fa3b8"] },
  pontos:      { nome: "Pontos turísticos",  emoji: "⛪", cor: ["#7a4b12", "#c98a2e"] },
  aventura:    { nome: "Aventura",           emoji: "🪂", cor: ["#2f5d2a", "#6fa34a"] },
  gastronomia: { nome: "Gastronomia",        emoji: "🧀", cor: ["#8a3b12", "#d9733a"] },
};

// Centro aproximado de Andradas (MG)
const CENTRO_CIDADE = { lat: -22.0680, lng: -46.5690, zoom: 12 };

const LUGARES = [
  {
    id: "casa-geraldo",
    nome: "Vinícola Casa Geraldo",
    categoria: "vinicolas",
    resumo: "Uma das vinícolas mais tradicionais da região, com loja e degustação.",
    descricao: "Vinícola familiar com produção de vinhos, espumantes e sucos de uva. Costuma oferecer visitas guiadas, degustação e loja com produtos da casa. Ótima parada para quem quer entender a tradição vinícola de Andradas.",
    endereco: "Zona rural de Andradas - MG",
    lat: -22.0450, lng: -46.5480,
    horario: "Confirmar no site ou redes sociais",
    preco: "$$",
    dicas: ["Agende a visita guiada com antecedência", "Leve um motorista da rodada se for degustar"],
    destaque: true,
    exemplo: true,
  },
  {
    id: "stella-valentino",
    nome: "Vinícola Stella Valentino",
    categoria: "vinicolas",
    resumo: "Vinhos de inverno e paisagem de serra.",
    descricao: "Vinícola conhecida pelos vinhos de colheita de inverno (dupla poda), técnica que fez o Sul de Minas ganhar destaque no cenário nacional. Experiência de degustação em meio aos vinhedos.",
    endereco: "Andradas - MG",
    lat: -22.0900, lng: -46.5900,
    horario: "Confirmar no site ou redes sociais",
    preco: "$$$",
    dicas: ["Pergunte sobre o calendário de colheita (meio do ano)"],
    destaque: true,
    exemplo: true,
  },
  {
    id: "pico-do-gaviao",
    nome: "Pico do Gavião",
    categoria: "aventura",
    resumo: "Rampa de voo livre com vista panorâmica de toda a região.",
    descricao: "Um dos pontos mais altos da região e referência nacional em voo livre e parapente. Mesmo sem voar, vale subir para ver o pôr do sol e a vista das serras do Sul de Minas.",
    endereco: "Estrada do Pico do Gavião, Andradas - MG",
    lat: -22.0300, lng: -46.6150,
    horario: "Aberto todos os dias (melhor no fim de tarde)",
    preco: "Gratuito",
    dicas: ["Leve agasalho: venta bastante lá em cima", "Voos duplos de parapente podem ser agendados com instrutores locais"],
    destaque: true,
    exemplo: true,
  },
  {
    id: "cachoeira-exemplo-1",
    nome: "Cachoeira da Serra",
    categoria: "cachoeiras",
    resumo: "Queda d'água com poço para banho, cercada de mata.",
    descricao: "Cachoeira de acesso por trilha curta, com poço para banho e área de pedras para descanso. Substitua este texto pelas informações reais de uma cachoeira de Andradas.",
    endereco: "Zona rural de Andradas - MG",
    lat: -22.1100, lng: -46.5400,
    horario: "Durante o dia",
    preco: "Gratuito",
    dicas: ["Use calçado com boa aderência", "Não deixe lixo na trilha"],
    destaque: false,
    exemplo: true,
  },
  {
    id: "cachoeira-exemplo-2",
    nome: "Cachoeira do Vale",
    categoria: "cachoeiras",
    resumo: "Trilha média com várias quedas pelo caminho.",
    descricao: "Trilha de nível médio que passa por pequenas quedas até chegar à principal. Substitua este texto pelas informações reais.",
    endereco: "Zona rural de Andradas - MG",
    lat: -22.0200, lng: -46.5300,
    horario: "Durante o dia",
    preco: "Gratuito",
    dicas: ["Evite em dias de chuva forte (risco de cabeça d'água)"],
    destaque: false,
    exemplo: true,
  },
  {
    id: "igreja-matriz",
    nome: "Igreja Matriz",
    categoria: "pontos",
    resumo: "Igreja central, cartão postal do centro da cidade.",
    descricao: "Igreja principal da cidade, localizada no centro, ao lado da praça. Ponto de partida ideal para um passeio a pé pelo comércio e pela arquitetura local.",
    endereco: "Centro, Andradas - MG",
    lat: -22.0680, lng: -46.5690,
    horario: "Confirmar horários de missa e visitação",
    preco: "Gratuito",
    dicas: ["Combine com um café na praça"],
    destaque: false,
    exemplo: true,
  },
  {
    id: "praca-central",
    nome: "Praça Central",
    categoria: "pontos",
    resumo: "Coração da cidade, com comércio, cafés e movimento.",
    descricao: "Praça no centro de Andradas, cercada por lojas, cafés e restaurantes. Boa para descansar entre um passeio e outro.",
    endereco: "Centro, Andradas - MG",
    lat: -22.0688, lng: -46.5700,
    horario: "Aberta 24h",
    preco: "Gratuito",
    dicas: [],
    destaque: false,
    exemplo: true,
  },
  {
    id: "rota-queijos",
    nome: "Empório de Queijos e Vinhos",
    categoria: "gastronomia",
    resumo: "Queijos artesanais, doces e vinhos locais.",
    descricao: "Exemplo de estabelecimento gastronômico. Troque pelo nome de um empório, restaurante ou cafeteria real da cidade.",
    endereco: "Centro, Andradas - MG",
    lat: -22.0670, lng: -46.5720,
    horario: "Seg a sáb, 9h às 18h",
    preco: "$$",
    dicas: [],
    destaque: false,
    exemplo: true,
  },
];
