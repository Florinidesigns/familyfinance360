# Criar Primeiro Utilizador - FamilyFinance360

Para criar um utilizador no Supabase que consiga fazer login na aplicação, existem duas formas. Devido à segurança do Supabase (as passwords são encriptadas), não é recomendado fazer `INSERT` direto da password em texto limpo via SQL.

## Opção 1: Via Interface Supabase (Recomendado)

Esta é a forma mais fácil e segura para nunca falhar:

1.  No painel do Supabase, vai ao menu **Authentication** (ícone do boneco 👤).
2.  Clica no botão **Add User** -> **Create new user**.
3.  Preenche os dados:
    *   **Email**: `jflorim79@gmail.com`
    *   **Password**: `flores1979/*-+`
4.  Desmarca a opção *"Send invite email"* se quiseres que ele fique ativo imediatamente sem confirmar email.
5.  Clica em **Create User**.

---

## Opção 2: Via SQL Editor (Inserção Direta)

Se preferires usar o **SQL Editor**, copia e cola o código abaixo. 
**Nota**: O Supabase trata da encriptação da password automaticamente quando usamos as suas funções internas.

```sql
-- 1. Inserir na tabela de autenticação do Supabase
-- Nota: O ID é gerado automaticamente. A password é encriptada pelo Supabase.
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'jflorim79@gmail.com',
  crypt('flores1979/*-+', gen_salt('bf')), -- Encripta a password com bcrypt
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"joao florim"}', -- Nome guardado nos metadados
  now(),
  now(),
  '',
  '',
  '',
  ''
) RETURNING id;

-- IMPORTANTE: Após correres o INSERT acima, o TRIGGER que criámos no passo anterior
-- vai criar automaticamente a entrada correspondente na tabela public.profiles.
```

---

## Passo a Passo para Criar Novos Utilizadores no Futuro

Como o Supabase separa a **Autenticação** (sistema) dos **Dados** (tua app), aqui está o fluxo lógico:

### 1. Sistema de Auth (`auth.users`)
Este é o "cofre". Tu não precisas de gerir esta tabela manualmente no dia-a-dia. O comando `supabase.auth.signUp()` da biblioteca de JavaScript trata disto por ti. Se precisares de apagar um utilizador, apaga-o no menu **Authentication**.

### 2. Perfis de Utilizador (`public.profiles`)
Esta tabela contém os dados "públicos" da tua app (ex: nome da família).
*   **Ligação**: O campo `id` de `profiles` é exatamente igual ao `id` de `auth.users`.
*   **Automação**: Graças ao **Trigger** que correste no ficheiro de estrutura, sempre que um utilizador nasce na Auth, ele nasce em Profiles. Não precisas de fazer nada manual aqui.

### 3. Membros da Família (`public.family_members`)
Para cada novo utilizador, podes querer associar membros da família.
```sql
INSERT INTO public.family_members (user_id, name, role, age)
VALUES ('ID_DO_UTILIZADOR_AQUI', 'Nome do Membro', 'Pai/Mãe', 40);
```

### Resumo das Regras:
*   **Passwords**: Sempre encriptadas (nunca uses texto simples na BD).
*   **ID**: O `user_id` em todas as tabelas (transactions, goals, etc.) deve ser o ID que o Supabase gerou para aquele utilizador.
*   **Segurança (RLS)**: Lembra-te que cada utilizador só verá os dados onde o `user_id` for igual ao seu próprio ID. 
