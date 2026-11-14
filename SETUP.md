# Como colocar o projeto para rodar

O código da Fase 1 (Pix estático) está pronto. Para funcionar, falta ligar o Supabase.

## 1. Criar o projeto no Supabase
1. Acesse supabase.com e crie um projeto (região **São Paulo**).
2. Guarde a senha do banco num lugar seguro.

## 2. Criar as tabelas
Escolha **uma** das opções:
- **Pelo Claude (conector MCP do Supabase conectado):** peça "roda a migration".
- **Na mão:** Supabase > SQL Editor > cole todo o conteúdo de
  `supabase/migrations/20261114000000_init.sql` > Run.

## 3. Variáveis de ambiente
Copie `.env.example` para `.env.local` e preencha (Supabase > Project Settings > API):

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...   # secreta: nunca colar em chat nem commitar
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 4. Configurar o Auth
Supabase > Authentication:

- **URL Configuration**
  - Site URL: `http://localhost:3000` (em produção, o domínio real)
  - Redirect URLs: `http://localhost:3000/**` e `https://SEU-DOMINIO/**`
- **Sign In / Providers > Email**: desative "Allow new users to sign up"
  (só o celebrante cria contas, via convite).
- **Email Templates**: troque o link dos templates abaixo.

  *Invite user*:
  ```html
  <h2>Você foi convidado</h2>
  <p>Clique para criar sua senha e acessar sua lista de presentes:</p>
  <p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite&next=/definir-senha">Criar minha senha</a></p>
  ```

  *Reset password*:
  ```html
  <h2>Redefinir senha</h2>
  <p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/definir-senha">Criar nova senha</a></p>
  ```

> O e-mail padrão do Supabase tem limite baixo de envios por hora. Antes de
> produção, configure um SMTP próprio (ex.: Resend) em Project Settings > Auth > SMTP.

## 5. Criar o administrador (celebrante)
1. Authentication > Users > **Add user** > e-mail + senha (marque "Auto confirm").
2. SQL Editor:
   ```sql
   update public.profiles set papel = 'admin', nome = 'Nome do Celebrante'
   where email = 'email-do-celebrante@exemplo.com';
   ```

## 6. Rodar
```bash
npm install
```
```bash
npm run dev
```
Abra http://localhost:3000/login e entre com o admin.

## 7. (Opcional) Expirar Pix pendentes automaticamente
O sistema já expira pendentes ao criar novos Pix. Para limpar também em
segundo plano: Database > Extensions > ative `pg_cron`, depois no SQL Editor:
```sql
select cron.schedule('expirar-contribuicoes', '*/15 * * * *', 'select private.expirar_contribuicoes()');
```

## Roteiro de teste
1. Admin > Novo evento > preencha título, data, **chave Pix, nome e cidade**.
2. No evento: adicione presentes (uma cota, uma meta, um link de loja).
3. Clique **Publicar página** e abra `/slug-do-evento`.
4. Como convidado: escolha a cota > nome > Gerar Pix > confira o QR no app do banco
   (pode pagar R$ 1 numa cota de teste) > **Já paguei**.
5. No painel > Contribuições: aparece "Aguardando" com o valor exato > **Confirmar**.
6. Convide um cliente pelo e-mail e teste o login dele.

## Antes de entregar para cliente real
- [ ] Supabase no plano **Pro** (o Free pausa após ~7 dias sem acesso)
- [ ] SMTP próprio configurado
- [ ] Deploy na Vercel com as variáveis de ambiente e `NEXT_PUBLIC_SITE_URL` do domínio
- [ ] Site URL e Redirect URLs do Supabase apontando para o domínio
- [ ] Testar um Pix real de ponta a ponta
