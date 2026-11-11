# Descubra Andradas

Aplicativo web (PWA) de turismo para Andradas (MG): vinícolas, cachoeiras, pontos turísticos, mapa e uma comunidade onde visitantes postam fotos.

Funciona no navegador do celular e pode ser "instalado" na tela inicial (menu do navegador → *Adicionar à tela inicial*).

## Telas

- **Hoje** (início): eventos acontecendo hoje, fim de semana, categorias de lugares e fotos
- **Agenda**: eventos filtrados por quando (hoje, amanhã, fim de semana, 7 dias), tipo e público (gratuito, família, +18, pet, acessível)
- **Evento**: adicionar ao Google Agenda, compartilhar no WhatsApp, salvar, como chegar e fotos de quem foi
- **Busca**: procura em eventos e lugares ao mesmo tempo
- **Lugares**: lista com busca e filtro por categoria
- **Detalhe do lugar**: descrição, horário, preço, dicas, botão "Como chegar" (Google Maps), salvar, compartilhar e fotos de visitantes daquele lugar
- **Mapa**: todos os lugares no OpenStreetMap, com filtro e botão "Onde estou"
- **Comunidade**: feed de fotos com curtir (botão ou toque duplo na foto), comentar e apagar os próprios posts
- **Nova publicação**: escolher foto (reduzida automaticamente), legenda e marcar o lugar
- **Perfil**: nome, lugares salvos e suas fotos

## Como rodar no seu computador

Não precisa instalar nada além do Python (ou qualquer servidor estático):

```bash
python3 -m http.server 8000
```

Depois abra `http://localhost:8000` no navegador. Para ver como celular, aperte F12 e ative o modo de dispositivo.

## Estrutura

```
index.html      casca do app (topo, área das telas, menu inferior)
css/style.css   visual (cores na seção :root)
js/data.js      lugares e categorias  ← é aqui que você edita os lugares
js/eventos.js   agenda de eventos     ← é aqui que você cadastra os eventos
js/store.js     onde os dados de posts/favoritos são salvos
js/app.js       telas e navegação
sw.js           cache offline
manifest.json   dados para instalar como app
```

## Como cadastrar um evento

1. Abra `js/eventos.js`
2. Copie um bloco `{ ... }` da lista `EVENTOS`
3. Preencha `inicio` e `fim` no formato `"2026-11-15T20:00"`
4. Em `publico`, use as chaves `gratuito`, `familia`, `mais18`, `pet`, `acessivel`
5. Se o evento acontece num lugar cadastrado em `data.js`, coloque o `lugarId` dele: o evento aparece na página do lugar
6. Eventos que já terminaram somem sozinhos do site

## Como adicionar ou corrigir um lugar

1. Abra `js/data.js`
2. Copie um bloco `{ ... }` da lista `LUGARES`
3. Troque `id`, `nome`, `descricao` etc.
4. Para as coordenadas: no Google Maps, clique com o botão direito no local e clique nos números para copiar
5. Coloque `exemplo: false` quando a informação estiver confirmada (some o selo amarelo "Dado de exemplo")
6. Para usar foto real: salve em `img/` e preencha `foto: "img/nome-da-foto.jpg"`

> Atenção: todos os lugares vieram marcados como exemplo. Nomes como Casa Geraldo e Pico do Gavião existem, mas endereço, coordenadas e horários são aproximados. Cachoeiras e o empório são fictícios e precisam ser trocados pelos reais.

## Limitação atual: a rede social é local

Os posts ficam salvos no `localStorage` do navegador. Ou seja, cada pessoa vê só os próprios posts (mais os 3 de exemplo). Para todos verem as fotos de todos, é preciso um backend. Caminho sugerido:

1. Criar um projeto grátis no **Supabase** (banco Postgres + login + armazenamento de fotos)
2. Criar a tabela `posts` e um bucket `fotos`
3. Reescrever as funções de `js/store.js` para chamar o Supabase (o resto do app não muda)
4. Adicionar login (Google ou e-mail) e moderação (denunciar post)

## Publicar de graça (GitHub Pages)

Settings → Pages → Source: *Deploy from a branch* → `main` / `root`. Em alguns minutos o app fica em `https://SEU-USUARIO.github.io/NOME-DO-REPO/`.
