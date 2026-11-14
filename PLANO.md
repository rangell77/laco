# Plano do Projeto — Lista de Presentes do Celebrante

> Documento vivo. Última atualização: 14/11/2026.
> Status: **Fase 1 (MVP com Pix estático) em desenvolvimento.** Fase com gateway de pagamento está planejada, mas **não será feita agora**.

---

## 1. Visão geral

Plataforma própria do celebrante (casamentos, 15 anos, bodas e outros eventos) para oferecer aos seus clientes uma **lista de presentes online personalizada**.

- O celebrante (admin) cria um evento para cada cliente.
- Cada evento tem uma **página pública personalizada** com link próprio, por exemplo: `seudominio.com.br/ana-e-joao`.
- O cliente (noivos, debutante) envia o link aos convidados pelo WhatsApp.
- O convidado abre o link, escolhe um presente e paga, **sem criar conta**.
- O cliente acompanha no painel quem deu cada presente e confirma os recebimentos.

### Objetivos
1. Ser um diferencial de venda para o celebrante (lista inclusa no pacote ou vendida à parte).
2. Experiência simples para o convidado: abrir, escolher, pagar e deixar um recado em menos de 1 minuto.
3. Registrar quem deu cada presente, para o cliente saber e poder agradecer.
4. Custo de operação baixo no começo e caminho claro para crescer.

---

## 2. Perfis de usuário

| Perfil | Acesso | O que faz |
|---|---|---|
| **Super admin** (celebrante) | Login | Cria e edita eventos, cadastra clientes, vê todos os eventos e totais, define configurações gerais. |
| **Cliente** (noivos / debutante) | Login (convite por e-mail) | Edita a própria página, cadastra presentes, vê contribuições, confirma ou recusa pagamentos, exporta lista. |
| **Convidado** | **Sem login** | Abre o link, escolhe presente, informa o nome, paga via Pix e clica em "Já paguei". |

### Dados do convidado (mínimos)
- **Nome**: obrigatório (é o que aparece para o cliente).
- **Recado**: opcional.
- **WhatsApp ou e-mail**: opcional (para agradecimento futuro).

Não pedimos senha, CPF nem endereço. Rodapé da página com o aviso: "Seu nome e recado serão compartilhados com os anfitriões do evento."

---

## 3. Tipos de presente

1. **Link externo**: produto de loja (Amazon, Magalu, Mercado Livre etc.) com foto, preço de referência e link. O convidado compra na loja e clica em "Já comprei" informando o nome. O item fica marcado como presenteado (configurável: permitir ou não mais de uma compra).
   - Futuro: usar links de afiliado para gerar comissão ao celebrante.
2. **Presente virtual (cota)**: item com valor fixo, por exemplo "Jantar na lua de mel, R$ 250". Pago via Pix. Pode ter quantidade (ex.: 4 cotas de "Passeio de barco").
3. **Meta / vaquinha**: objetivo com valor alvo, por exemplo "Viagem para Gramado, meta de R$ 8.000". O convidado escolhe quanto quer contribuir. Barra de progresso na página.
4. **Pix livre**: botão "Enviar um presente em dinheiro" com valor livre.

---

## 4. Pagamentos

### 4.1 Opção A — Pix estático (FASE 1, fazer agora)

O dinheiro cai **direto na chave Pix do cliente**. A plataforma não toca no dinheiro e não tem custo de transação.

**Fluxo do convidado**
1. Escolhe o presente e informa nome e recado (e o valor, no caso de meta ou Pix livre).
2. O sistema cria a contribuição com status `pendente` e gera:
   - **Valor com centavos únicos** (ex.: R$ 150,00 vira R$ 150,37) para facilitar a conferência no extrato.
   - **QR Code Pix estático** e código **copia e cola**, no padrão BR Code do Banco Central, com chave, nome do recebedor, cidade e valor.
3. O convidado paga no app do banco.
4. O convidado clica em **"Já paguei"** e o status muda para `aguardando_confirmacao`.
5. Tela de agradecimento.

**Fluxo do cliente (confirmação)**
1. No painel, aba "Aguardando confirmação", aparece: nome, presente, valor exato (com centavos) e data/hora.
2. O cliente confere no extrato do banco (nome do pagador e centavos).
3. Clica em **"Confirmar"** (status `confirmado`) ou **"Não recebi"** (status `recusado`, e o item volta a ficar disponível).

**Regras**
- Contribuição `pendente` sem "Já paguei" expira em **24h** (status `expirado`) e libera o item.
- Os centavos únicos (de 01 a 99) são sorteados de modo a não repetir entre contribuições abertas de mesmo valor base no mesmo evento.
- Na página pública, o item aparece como "Presenteado" quando estiver `aguardando_confirmacao` ou `confirmado`, para evitar duplicidade.
- A meta soma, na barra de progresso, apenas contribuições `confirmado` (opcionalmente exibe "+ R$ X aguardando confirmação").

**Prós**: custo zero, simples e o dinheiro vai direto ao cliente.
**Contras**: confirmação manual e o "Já paguei" depende da palavra do convidado.

### 4.2 Opção B — Pix via gateway com webhook (FASE FUTURA, não fazer agora)

> **Planejado. Não será implementado na Fase 1.** A estrutura de dados já nasce preparada para recebê-lo.

**Gateways candidatos**: Asaas, Mercado Pago, Pagar.me (escolher pela taxa e pelo suporte a split).

**Fluxo**
1. O convidado informa os dados e o sistema cria a contribuição `pendente`.
2. O back-end chama a API do gateway criando a cobrança Pix com `external_reference = id da contribuição`.
3. O gateway devolve um QR Pix **dinâmico**, exibido ao convidado.
4. O convidado paga e o gateway chama o **webhook** da plataforma.
5. O webhook valida a assinatura, localiza a contribuição e marca como `confirmado` automaticamente.
6. Opcional: cartão de crédito parcelado.

**Split de pagamento**
- A parte do cliente vai direto para a conta (subconta) dele no gateway.
- A taxa do celebrante vai para a conta do celebrante.
- A plataforma **nunca custodia** dinheiro de terceiros.

**Taxas**: a taxa do gateway (aprox. R$ 1–2 por Pix ou %) pode ser repassada ao convidado ("taxa de conveniência") ou descontada do cliente, configurável por evento.

**Requisitos técnicos quando for implementar**
- Rota `POST /api/webhooks/[gateway]` com validação de assinatura e idempotência (não processar o mesmo evento duas vezes).
- Tabela `payments` (já prevista no modelo) para guardar o id do gateway, valores e payload.
- Campo `payment_mode` no evento (`pix_estatico` | `gateway`) para escolher o modo por evento.
- Onboarding do cliente no gateway (criação de subconta, KYC).

**Prós**: automático, sem conferência manual e com prova de pagamento.
**Contras**: custo por transação e onboarding/KYC do cliente.

---

## 5. Funcionalidades por fase

### Fase 1 — MVP (Pix estático) ← **agora**
**Admin**
- [ ] Login (Supabase Auth, e-mail + senha)
- [ ] Dashboard: eventos ativos, total confirmado, contribuições aguardando
- [ ] Criar e editar evento: tipo, nomes, data, local, slug, chave Pix, nome e cidade do recebedor
- [ ] Convidar cliente por e-mail (vincula o cliente ao evento)
- [ ] Ativar e desativar evento

**Cliente**
- [ ] Login via convite
- [ ] Editor da página: foto de capa, texto/história, cor principal, tema, com preview
- [ ] CRUD de presentes (4 tipos), com foto, ordem e ativo/inativo
- [ ] Lista de contribuições com filtros (aguardando / confirmado / recusado / expirado)
- [ ] Botões Confirmar e Não recebi
- [ ] Compartilhar: copiar link, QR do link e texto pronto para WhatsApp
- [ ] Exportar lista (CSV) para agradecimentos

**Página pública (convidado)**
- [ ] Capa: foto, nomes, data, local e contagem regressiva
- [ ] Texto/história do casal ou debutante
- [ ] Grade de presentes (link, cota, meta com barra, Pix livre)
- [ ] Modal de presente: nome, recado, valor (quando livre)
- [ ] Tela Pix: QR, copia e cola (botão copiar), valor exato e botão "Já paguei"
- [ ] Tela de agradecimento
- [ ] Mobile-first (a maioria dos acessos vem do WhatsApp)
- [ ] Meta tags Open Graph (foto e nomes aparecem bonitos no preview do WhatsApp)

**Infra**
- [ ] Imagens comprimidas no navegador (WebP, máx. 1600px) antes do upload
- [ ] Upload pelo Supabase Storage, isolado na função `uploadImage()` para trocar por Cloudflare R2 no futuro
- [ ] Job de expiração das pendentes (pg_cron ou verificação na leitura)

### Fase 2 — Comodidades
- [ ] Notificação ao cliente quando alguém clicar em "Já paguei" (e-mail; WhatsApp depois)
- [ ] Exportar PDF bonito da lista de presentes recebidos
- [ ] Catálogo de presentes sugeridos (adicionar com um clique)
- [ ] Mais temas visuais (casamento clássico, rústico, praia, 15 anos etc.)

### Fase 3 — Gateway de pagamento (ver 4.2)
- [ ] Integração com o gateway escolhido
- [ ] Webhook + confirmação automática
- [ ] Split e taxa do celebrante
- [ ] Cartão parcelado (opcional)

### Fase 4 — Upsell / extras
- [ ] RSVP (confirmação de presença, acompanhantes, restrições alimentares)
- [ ] Mural de recados público
- [ ] Galeria de fotos pós-evento
- [ ] Domínio próprio por cliente
- [ ] Links de afiliado nos produtos externos

### Fase 5 — Escala
- [ ] Multi-celebrante (vender a plataforma como SaaS para outros profissionais)
- [ ] Migrar imagens para Cloudflare R2 se o storage passar de ~1 GB

---

## 6. Stack técnica

| Camada | Escolha |
|---|---|
| Front + back | Next.js (App Router) + TypeScript |
| Estilo | Tailwind CSS |
| Banco | Supabase Postgres, com RLS (Row Level Security) isolando dados por evento |
| Auth | Supabase Auth (admin e clientes; convidado não loga) |
| Arquivos | Supabase Storage (futuro: Cloudflare R2) |
| QR Code Pix | Geração do payload BR Code no servidor + biblioteca `qrcode` |
| Hospedagem | Vercel |
| Plano Supabase | Free durante o desenvolvimento; **Pro (~US$ 25/mês) ao entrar em produção**, porque o Free pausa após ~7 dias sem acesso |

---

## 7. Modelo de dados

```
profiles
  id (uuid, = auth.users.id)
  nome
  papel           admin | cliente
  criado_em

events
  id (uuid)
  slug            único, ex.: "ana-e-joao"
  tipo            casamento | quinze_anos | bodas | outro
  titulo          ex.: "Ana & João"
  data_evento
  local
  historia        texto livre
  capa_url
  tema            ex.: "classico"
  cor_principal   hex
  pix_chave
  pix_nome        nome do recebedor (máx. 25 caracteres no BR Code)
  pix_cidade      cidade do recebedor (máx. 15 caracteres)
  payment_mode    pix_estatico | gateway   (Fase 1: sempre pix_estatico)
  ativo           boolean
  criado_por      → profiles
  criado_em

event_members
  event_id        → events
  profile_id      → profiles
  (cliente(s) com acesso ao evento)

gift_items
  id (uuid)
  event_id        → events
  tipo            link | cota | meta | pix_livre
  titulo
  descricao
  imagem_url
  valor           cota: valor fixo | meta: valor alvo | link: preço de referência
  quantidade      cota: nº de cotas (null = ilimitado) | link: 1 por padrão
  url_externa     só para tipo link
  ordem
  ativo
  criado_em

contributions
  id (uuid)
  event_id        → events
  gift_item_id    → gift_items (null no Pix livre avulso)
  convidado_nome
  convidado_contato  opcional
  mensagem        opcional
  valor_base      valor escolhido
  valor_cobrado   valor com centavos únicos (Pix estático)
  status          pendente | aguardando_confirmacao | confirmado | recusado | expirado
  payment_id      → payments (null na Fase 1)
  expira_em
  pago_em         quando clicou "Já paguei"
  confirmado_em
  criado_em

payments          ← FASE FUTURA (gateway). Tabela pode ser criada depois.
  id
  contribution_id
  gateway         asaas | mercadopago | ...
  gateway_id
  metodo          pix | cartao
  valor_bruto, taxa, valor_liquido
  status
  payload         jsonb
  criado_em
```

### Segurança (RLS)
- **Admin**: lê e escreve tudo.
- **Cliente**: lê e escreve apenas eventos em que está em `event_members`.
- **Público (anon)**: lê eventos `ativo = true` e seus `gift_items` ativos. **Não** lê `contributions` diretamente; a criação e o "Já paguei" passam por rotas do servidor (Server Actions) que validam os dados.
- O contador de presenteados e o progresso das metas são expostos por uma *view*/função que retorna só totais, sem nomes.

---

## 8. Mapa de rotas

```
/                               landing do celebrante (vitrine do serviço)
/[slug]                         página pública do evento
/[slug]/presente/[id]           (modal/tela) escolher presente
/[slug]/pix/[contribuicaoId]    QR + copia e cola + "Já paguei"
/[slug]/obrigado

/login
/admin                          dashboard do celebrante
/admin/eventos
/admin/eventos/novo
/admin/eventos/[id]

/painel                         dashboard do cliente
/painel/[eventoId]/pagina       editor da página
/painel/[eventoId]/presentes
/painel/[eventoId]/contribuicoes
/painel/[eventoId]/compartilhar

/api/webhooks/[gateway]         ← FASE FUTURA
```

---

## 9. Cronograma estimado (1 dev)

| Semana | Entrega |
|---|---|
| 1 | Setup Next.js + Supabase, schema, RLS, login, admin: CRUD de eventos |
| 2 | Página pública (capa, história, grade de presentes), temas e cores |
| 3 | Fluxo Pix estático (BR Code, centavos únicos, QR, "Já paguei"), painel do cliente com confirmação |
| 4 | Editor de página, upload de imagens, compartilhar, exportar CSV, expiração, testes e deploy |
| **Fim da semana 4** | **MVP no ar** |
| 5–6 | Fase 2 (notificações, PDF, catálogo, temas) |
| Depois | Fase 3 (gateway), conforme demanda |

---

## 10. Modelo de negócio (para o celebrante decidir)
- Lista **inclusa** no pacote de celebração (diferencial).
- **Taxa fixa** por evento (ex.: R$ 97 a R$ 297).
- Na fase do gateway: **% sobre os presentes** via split (ex.: 3 a 5%).
- Comissão de **afiliado** nos links de loja.

---

## 11. Riscos e cuidados
- **LGPD**: coletar só nome, recado e contato opcional. Política de privacidade simples no rodapé.
- **Confirmação manual (Pix estático)**: depende do cliente conferir o extrato. Mitigado com centavos únicos e notificação.
- **Chave Pix errada**: validar formato no cadastro e mostrar um "Pix de teste" para o cliente conferir antes de divulgar.
- **Links de loja quebrados ou preço desatualizado**: aviso no painel; checagem automática no futuro.
- **Plano gratuito do Supabase pausa por inatividade**: migrar para o Pro antes de entregar o primeiro cliente real.
- **Gateway (futuro)**: validar assinatura do webhook, garantir idempotência e nunca custodiar dinheiro (usar split).

---

## 12. Decisões pendentes
1. Nome e domínio da plataforma.
2. Link por caminho (`/ana-e-joao`, padrão adotado) ou subdomínio.
3. O cliente edita a própria página ou só o celebrante monta? (Plano atual: os dois podem.)
4. Modelo de cobrança do celebrante.
5. Gateway a usar na fase futura (Asaas, Mercado Pago ou Pagar.me).
