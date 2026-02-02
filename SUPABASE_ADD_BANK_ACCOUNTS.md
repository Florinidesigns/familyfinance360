# Atualização Supabase - Contas Bancárias

Executa o seguinte script SQL no **Editor SQL** do teu painel do Supabase para ativar a funcionalidade de saldos iniciais.

```sql
-- 1. Criar a tabela de contas bancárias
CREATE TABLE IF NOT EXISTS public.bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
    initial_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Ativar Row Level Security (RLS)
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;

-- 3. Criar a política de segurança (Cada utilizador só vê as suas contas)
CREATE POLICY "Users manage own bank accounts" ON public.bank_accounts
    FOR ALL USING (auth.uid() = user_id);

-- 4. Garantir que o nome da tabela e colunas estão acessíveis para a API
COMMENT ON TABLE public.bank_accounts IS 'Armazena os saldos iniciais das contas bancárias do agregado familiar.';
```

### O que este script faz:
1.  **Cria a tabela `bank_accounts`**: Onde guardamos o nome da conta (ex: MB Way, Conta BPI), o saldo e a data.
2.  **Segurança (RLS)**: Garante que os teus dados são privados e só tu podes aceder às tuas contas.
3.  **Relacionamento**: Liga as contas automaticamente ao teu perfil de utilizador.
