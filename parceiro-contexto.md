# Contexto do projeto: Descubra Andradas

## Produto
- Guia vivo de Andradas (MG): o que fazer, onde ir e o que está rolando na cidade, com fotos da comunidade.
- Alternativa ao site de turismo da prefeitura, que é desatualizado, tem fotos de baixa qualidade e linguagem/visual "tiozão".
- Objetivo em uma frase: ser o lugar onde qualquer pessoa descobre o que está acontecendo em Andradas, hoje e neste fim de semana.

## Histórias de usuário
1. Como pessoa que mora ou visita Andradas, quero ver os eventos e festas de hoje e do fim de semana, em qualquer estabelecimento, para decidir onde ir.
2. Como visitante, quero encontrar vinícolas, cachoeiras e pontos turísticos com fotos boas e informação atualizada.
3. Como visitante, quero postar minhas fotos dos lugares que conheci.

## Telas existentes (protótipo v2, foco em funcionalidade)
- Hoje (início): busca geral, eventos de hoje, fim de semana, categorias de lugares, fotos. Estado: funcional, visual pendente.
- Agenda: filtros de quando (hoje, amanhã, fim de semana, 7 dias, tudo), tipo e público; agrupada por dia; filtros ficam na URL. Estado: funcional.
- Detalhe do evento: adicionar ao Google Agenda, compartilhar no WhatsApp, salvar, como chegar, link de ingresso, fotos do evento. Estado: funcional.
- Busca: eventos e lugares juntos. Estado: funcional.
- Lugares (antigo Explorar): lista com busca e filtro. Estado: rascunho.
- Detalhe do lugar: infos, próximos eventos no lugar, como chegar, salvar, fotos. Estado: rascunho.
- Mapa: lugares + eventos dos próximos 7 dias. Estado: rascunho.
- Comunidade: feed com curtir e comentar. Estado: rascunho.
- Nova publicação: marca lugar ou evento recente. Perfil: eventos e lugares salvos. Estado: rascunho.

## Sistema visual (v1, ainda não aprovado)
- Cores: vinho #6b1d3a (primária), fundo #f7f3ef, texto #2a1f22, texto suave #6f6266, borda #e8dfd9. Modo escuro automático.
- Tipografia: fonte do sistema.
- Raio: 16px em cards, pílula (999px) em botões e chips.
- Componentes: botão primário, botão secundário, chip de filtro, card de lugar, card de evento (bloco de data + infos + tags de público), tag de público, card de post.
- Navegação: 5 abas (Hoje, Agenda, Lugares, Mapa, Fotos) embaixo no celular e no topo no desktop; perfil no ícone do topo.

## Decisões
- 2026-11-11: eventos e festas da cidade são prioridade do app, incluindo eventos de qualquer estabelecimento (não só turismo oficial). Motivo: é o que o site da prefeitura não entrega e o que deixa o app "vivo".
- 2026-11-11: público principal são moradores e turistas juntos; a tela inicial mostra "o que rola hoje". Motivo: serve aos dois públicos ao mesmo tempo.
- 2026-11-11: no protótipo, só o Davi cadastra eventos (arquivo js/eventos.js). Motivo: validar antes de construir área para estabelecimentos.
- 2026-11-11: primeiro site (responsivo), depois app. Motivo: app é mais complexo.
- 2026-11-11: objetivo de curto prazo é usar o protótipo para propor parceria com a prefeitura.
- 2026-11-11: fazer funcionalidades primeiro, UI/UX e design depois.
- 2026-11-11: o app deve ser inclusivo e não ter cara de "tiozão". Motivo: o site atual não conversa com todos os públicos.

## Em aberto
- Fase de design: identidade visual, fotos reais, tipografia (depois das funcionalidades).
- Como coletar eventos reais para a demo da prefeitura (Instagram dos estabelecimentos?).
- O que "incluir a todos" significa na prática (acessibilidade, faixas de idade, filtros como gratuito, pet friendly, para crianças)?
