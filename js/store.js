/*
 * ARMAZENAMENTO (versão protótipo)
 * ------------------------------------------------------------------
 * Tudo fica salvo no localStorage do navegador: cada pessoa vê apenas
 * os próprios posts. Para virar uma rede social de verdade (todos veem
 * os posts de todos), troque as funções deste arquivo por chamadas a
 * um backend (ex: Firebase ou Supabase). O resto do app não precisa
 * mudar, porque ele só conversa com o objeto `Store`.
 */

const Store = (() => {
  const K = { user: "andr_user", posts: "andr_posts", favs: "andr_favs" };

  function ler(chave, padrao) {
    try {
      const v = localStorage.getItem(chave);
      return v ? JSON.parse(v) : padrao;
    } catch { return padrao; }
  }
  function gravar(chave, valor) {
    try { localStorage.setItem(chave, JSON.stringify(valor)); return true; }
    catch { return false; } // cota cheia ou modo privado
  }
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  const POSTS_INICIAIS = [
    { id: "s1", autor: "Marina", lugarId: "pico-do-gaviao", foto: null,
      legenda: "Pôr do sol no Pico do Gavião. Vale cada curva da estrada! 🌄",
      data: Date.now() - 1000 * 60 * 60 * 5, curtidas: ["a", "b", "c"],
      comentarios: [{ autor: "Lucas", texto: "Que vista!", data: Date.now() - 1000 * 60 * 60 * 3 }] },
    { id: "s2", autor: "Rafael", lugarId: "casa-geraldo", foto: null,
      legenda: "Degustação de domingo com a família 🍷",
      data: Date.now() - 1000 * 60 * 60 * 26, curtidas: ["a"], comentarios: [] },
    { id: "s3", autor: "Bia", lugarId: "cachoeira-exemplo-1", foto: null,
      legenda: "Água gelada, mas compensa demais 💧",
      data: Date.now() - 1000 * 60 * 60 * 50, curtidas: [], comentarios: [] },
  ];

  function usuario() {
    let u = ler(K.user, null);
    if (!u) { u = { id: uid(), nome: "" }; gravar(K.user, u); }
    return u;
  }

  return {
    usuario,
    definirNome(nome) { const u = usuario(); u.nome = nome.trim().slice(0, 30); gravar(K.user, u); return u; },

    posts() { return ler(K.posts, POSTS_INICIAIS).sort((a, b) => b.data - a.data); },
    postsDoLugar(lugarId) { return this.posts().filter(p => p.lugarId === lugarId); },
    postsDoUsuario() { const u = usuario(); return this.posts().filter(p => p.autorId === u.id); },

    criarPost({ legenda, foto, lugarId, eventoId }) {
      const u = usuario();
      const lista = this.posts();
      lista.unshift({ id: uid(), autor: u.nome || "Visitante", autorId: u.id, lugarId: lugarId || null,
        eventoId: eventoId || null, foto, legenda: legenda.trim().slice(0, 500), data: Date.now(), curtidas: [], comentarios: [] });
      return gravar(K.posts, lista);
    },
    apagarPost(id) {
      const u = usuario();
      gravar(K.posts, this.posts().filter(p => !(p.id === id && p.autorId === u.id)));
    },
    alternarCurtida(id) {
      const u = usuario();
      const lista = this.posts();
      const p = lista.find(x => x.id === id);
      if (!p) return;
      const i = p.curtidas.indexOf(u.id);
      i >= 0 ? p.curtidas.splice(i, 1) : p.curtidas.push(u.id);
      gravar(K.posts, lista);
      return p;
    },
    comentar(id, texto) {
      const u = usuario();
      const lista = this.posts();
      const p = lista.find(x => x.id === id);
      if (!p || !texto.trim()) return;
      p.comentarios.push({ autor: u.nome || "Visitante", texto: texto.trim().slice(0, 300), data: Date.now() });
      gravar(K.posts, lista);
      return p;
    },

    favoritos() { return ler(K.favs, []); },
    ehFavorito(id) { return this.favoritos().includes(id); },
    alternarFavorito(id) {
      const f = this.favoritos();
      const i = f.indexOf(id);
      i >= 0 ? f.splice(i, 1) : f.push(id);
      gravar(K.favs, f);
      return i < 0;
    },
  };
})();
