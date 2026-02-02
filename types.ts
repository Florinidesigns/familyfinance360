
export type Category =
  | 'Alimentação' | 'Animais' | 'Despesas' | 'Educação' | 'Habitação'
  | 'Lazer' | 'Outros' | 'Saúde' | 'Seguros' | 'Transporte';

export type IncomeSource =
  | 'Ordenado' | 'Freelance' | 'Presente' | 'Investimento' | 'Outro';

export type InvestmentType = 'PPR' | 'Certificados de Aforro' | 'Acções' | 'Cryptomoeda' | 'Outro';

export type Frequency = 'Mensal' | 'Trimestral' | 'Semestral' | 'Anual';

export interface Transaction {
  id: string;
  type: 'entrada' | 'saida';
  amount: number;
  category: Category | IncomeSource;
  description: string;
  establishment?: string;
  date: string;
  invoiceNumber?: string;
  isNoNif?: boolean;
}

export interface RecurringIncome {
  id: string;
  name: string;
  amount: number;
  source: IncomeSource;
  memberId?: string;
  dayOfMonth: number;
}

export interface RecurringExpense {
  id: string;
  name: string;
  amount: number;
  category: Category;
  frequency: Frequency;
  dayOfMonth: number;
  month?: number; // 1-12
  year?: number;  // Ano da última liquidação
}

export interface LongTermDebt {
  id: string;
  name: string;
  type: 'Hipoteca' | 'Carro' | 'Empréstimo' | 'Outro';
  contractedValue: number; // Valor pedido ao banco
  monthlyPayment: number;
  calculationType: 'installments' | 'endDate';
  remainingInstallments?: number;
  endDate?: string;
  totalValue: number; // Valor total a pagar (Mensalidade * Prestações Totais)
  remainingValue: number; // Valor que ainda falta pagar efetivamente
  dayOfMonth?: number;
}

export interface FutureGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  category: Category;
  isAchieved?: boolean;
}

export interface Investment {
  id: string;
  name: string;
  amount: number;
  type: InvestmentType;
  dayOfMonth?: number;
  monthlyReinforcement?: number;
}

export interface BankAccount {
  id: string;
  name: string;
  balance: number;
  initialDate: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  role: string;
  age: number;
  birthDate: string;
  nif?: string;
  isEmployed: boolean;
  salary?: number;
}

export interface FamilyInfo {
  familyName: string;
  members: FamilyMember[];
}

export interface CategorySettings {
  customCategories: string[];
  activeCategories: string[];
  customIncomeSources: string[];
  activeIncomeSources: string[];
}

export interface AppSettings {
  currency: string;
  language: string;
  theme: 'light' | 'dark';
  categorySettings?: CategorySettings;
}

export interface AlertSettings {
  commitmentDays: number;
  goalThreshold: number;
  budgetThreshold: number;
}

export interface FinanceState {
  transactions: Transaction[];
  debts: LongTermDebt[];
  goals: FutureGoal[];
  recurringIncomes: RecurringIncome[];
  recurringExpenses: RecurringExpense[];
  investments: Investment[];
  bankAccounts?: BankAccount[];
  familyInfo?: FamilyInfo;
  appSettings?: AppSettings;
  alertSettings?: AlertSettings;
  dismissedAlerts?: string[]; // Array of alert IDs that have been dismissed
}

