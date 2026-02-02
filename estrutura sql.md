# Estrutura SQL - FamilyFinance360 (Supabase/PostgreSQL)

Este documento descreve a estrutura de base de dados otimizada para o **Supabase**. No Supabase (que usa PostgreSQL), a autenticação é gerida internamente, por isso adaptamos a tabela de utilizadores para se ligar ao esquema `auth`.

## Configuração Inicial

No Supabase, não criamos uma tabela de utilizadores manual para passwords. Em vez disso, criamos um perfil que referencia `auth.users`.

### 1. Perfis de Utilizador (Profiles)
```sql
-- Esta tabela guarda metadados adicionais que o Supabase Auth não guarda por defeito.
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    family_name VARCHAR(100),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ativar RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política: Utilizadores podem ver o seu próprio perfil
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Política: Utilizadores podem atualizar o seu próprio perfil
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);
```

### 2. Membros da Família (Family Members)
```sql
CREATE TABLE public.family_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50),
    age INTEGER,
    birth_date DATE,
    nif VARCHAR(20),
    is_employed BOOLEAN DEFAULT FALSE,
    salary DECIMAL(15, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own family members" ON public.family_members
    FOR ALL USING (auth.uid() = user_id);
```

### 3. Transações (Transactions)
```sql
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(10) CHECK (type IN ('entrada', 'saida')),
    amount DECIMAL(15, 2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    establishment VARCHAR(100),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    invoice_number VARCHAR(100),
    is_no_nif BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own transactions" ON public.transactions
    FOR ALL USING (auth.uid() = user_id);
```

### 4. Rendimentos e Despesas Recorrentes
```sql
-- Rendimentos
CREATE TABLE public.recurring_incomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    member_id UUID REFERENCES public.family_members(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    source VARCHAR(50) NOT NULL,
    day_of_month INTEGER CHECK (day_of_month BETWEEN 1 AND 31),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Despesas
CREATE TABLE public.recurring_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    frequency VARCHAR(20) CHECK (frequency IN ('Mensal', 'Trimestral', 'Semestral', 'Anual')),
    day_of_month INTEGER CHECK (day_of_month BETWEEN 1 AND 31),
    last_processed_month INTEGER,
    last_processed_year INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.recurring_incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own recurring incomes" ON public.recurring_incomes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own recurring expenses" ON public.recurring_expenses FOR ALL USING (auth.uid() = user_id);
```

### 5. Dívidas, Objetivos e Investimentos
```sql
-- Long Term Debts
CREATE TABLE public.long_term_debts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50),
    contracted_value DECIMAL(15, 2) NOT NULL,
    monthly_payment DECIMAL(15, 2) NOT NULL,
    calculation_type VARCHAR(20),
    remaining_installments INTEGER,
    end_date DATE,
    total_value DECIMAL(15, 2) NOT NULL,
    remaining_value DECIMAL(15, 2) NOT NULL,
    day_of_month INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Future Goals
CREATE TABLE public.future_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    target_amount DECIMAL(15, 2) NOT NULL,
    current_amount DECIMAL(15, 2) DEFAULT 0,
    category VARCHAR(50),
    is_achieved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Investments
CREATE TABLE public.investments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    type VARCHAR(50),
    monthly_reinforcement DECIMAL(15, 2) DEFAULT 0,
    day_of_month INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.long_term_debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.future_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own long_term_debts" ON public.long_term_debts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own future_goals" ON public.future_goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own investments" ON public.investments FOR ALL USING (auth.uid() = user_id);
```

### 6. Configurações e Alertas
```sql
-- App Settings & Alert Settings
CREATE TABLE public.app_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    currency VARCHAR(10) DEFAULT 'EUR',
    language VARCHAR(10) DEFAULT 'pt',
    theme VARCHAR(10) DEFAULT 'light',
    commitment_days INTEGER DEFAULT 5,
    goal_threshold DECIMAL(5, 2) DEFAULT 90.0,
    budget_threshold DECIMAL(5, 2) DEFAULT 80.0
);

-- Category Settings (Usando JSONB para flexibilidade no Supabase)
CREATE TABLE public.category_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    custom_categories JSONB DEFAULT '[]',
    active_categories JSONB DEFAULT '[]',
    custom_income_sources JSONB DEFAULT '[]',
    active_income_sources JSONB DEFAULT '[]'
);

-- Alertas Dismissed
CREATE TABLE public.dismissed_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    alert_identifier VARCHAR(255) NOT NULL,
    dismissed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dismissed_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own app_settings" ON public.app_settings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own category_settings" ON public.category_settings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own dismissed_alerts" ON public.dismissed_alerts FOR ALL USING (auth.uid() = user_id);
```

## Índices e Performance (PostgreSQL/Supabase)

```sql
CREATE INDEX idx_transactions_user_date ON public.transactions(user_id, date DESC);
CREATE INDEX idx_recurring_expenses_user ON public.recurring_expenses(user_id);
CREATE INDEX idx_dismissed_alerts_user_id ON public.dismissed_alerts(user_id);
```

## Automatização com Triggers (Best Practice Supabase)

Podes usar este trigger para criar automaticamente uma entrada na tabela `profiles` sempre que um novo utilizador se registar via Supabase Auth:

```sql
-- Função para o trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- O trigger propriamente dito
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

## Considerações Supabase
1. **RLS (Row Level Security)**: Fundamental. Todas as tabelas têm o RLS ativo acima para garantir que um utilizador nunca acede aos dados de outro.
2. **`auth.uid()`**: Função nativa do Supabase/Postgres que devolve o ID do utilizador logado, usada nas políticas.
3. **`gen_random_uuid()`**: Função standard para gerar IDs únicos.
4. **Esquema `public`**: É o padrão onde os dados do utilizador devem residir, enquanto o `auth` é gerido pelo Supabase.
