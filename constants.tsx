
import React from 'react';
import {
  Home, Car, ShoppingCart, Zap, Dog,
  Palmtree, GraduationCap, HeartPulse, Shield, HelpCircle,
  Briefcase, Gift, TrendingUp, Wallet, PawPrint, Users, BookOpen, Utensils, Scissors, Bike, Bus
} from 'lucide-react';
import { Category, IncomeSource } from './types';

// Categorias Ordenadas A-Z
export const CATEGORIES: Category[] = [
  'Alimentação', 'Animais', 'Despesas', 'Educação', 'Habitação',
  'Lazer', 'Outros', 'Saúde', 'Seguros', 'Transporte'
];

export const INCOME_SOURCES: IncomeSource[] = [
  'Freelance', 'Investimento', 'Ordenado', 'Outro', 'Presente'
];

export const SUPERMARKETS = [
  'Aldi', 'Auchan', 'Continente', 'Intermarché', 'Lidl', 'Mercadona', 'Mini Preço', 'Pingo Docê'
];

export const HABITACAO_TYPES = [
  'IMI', 'Obras', 'Reparações'
];

export const TRANSPORTE_TYPES = [
  'IUC', 'Oficina', 'Passe'
];

export const DESPESAS_TYPES = [
  'Água', 'Gás', 'Luz', 'Telecomunicações'
];

export const ANIMAIS_TYPES = [
  'Medicamentos', 'Ração', 'Veterinário'
];

// Configurações detalhadas de IRS (Portugal) baseadas no e-fatura
export const IRS_CONFIG = {
  'Despesas Gerais Familiares': { percentage: 0.35, maxBenefit: 250, description: '35% das despesas gerais', color: 'bg-cyan-500' },
  'Saúde': { percentage: 0.15, maxBenefit: 1000, description: '15% das despesas de saúde', color: 'bg-rose-500' },
  'Educação': { percentage: 0.30, maxBenefit: 800, description: '30% das despesas de formação', color: 'bg-orange-500' },
  'Habitação': { percentage: 0.15, maxBenefit: 502, description: '15% de rendas ou juros', color: 'bg-lime-500' },
  'Lares': { percentage: 0.25, maxBenefit: 403.75, description: '25% de apoio domiciliário/lares', color: 'bg-emerald-600' },
  'Reparação de Automóveis': { percentage: 0.0345, maxBenefit: 250, description: '15% do IVA pago', color: 'bg-sky-600' },
  'Reparação de Motociclos': { percentage: 0.0345, maxBenefit: 250, description: '15% do IVA pago', color: 'bg-sky-500' },
  'Restauração e Alojamento': { percentage: 0.02, maxBenefit: 250, description: '15% do IVA pago', color: 'bg-amber-500' },
  'Cabeleireiros': { percentage: 0.0345, maxBenefit: 250, description: '15% do IVA pago', color: 'bg-indigo-400' },
  'Atividades Veterinárias': { percentage: 0.0345, maxBenefit: 250, description: '15% do IVA pago', color: 'bg-orange-400' },
  'Passes Mensais': { percentage: 0.06, maxBenefit: 250, description: '100% do IVA pago', color: 'bg-blue-500' }
};

export const getCategoryIcon = (category: string) => {
  const iconProps = { size: 24 }; // Aumentado para o visual e-fatura
  switch (category) {
    case 'Alimentação': return <ShoppingCart {...iconProps} />;
    case 'Animais':
    case 'Atividades Veterinárias': return <PawPrint {...iconProps} />;
    case 'Despesas': return <Zap {...iconProps} />;
    case 'Educação': return <BookOpen {...iconProps} />;
    case 'Habitação': return <Home {...iconProps} />;
    case 'Lazer': return <Palmtree {...iconProps} />;
    case 'Saúde': return <HeartPulse {...iconProps} />;
    case 'Seguros': return <Shield {...iconProps} />;
    case 'Transporte':
    case 'Reparação de Automóveis': return <Car {...iconProps} />;
    case 'Reparação de Motociclos': return <Bike {...iconProps} />;
    case 'Ordenado': return <Briefcase {...iconProps} />;
    case 'Presente': return <Gift {...iconProps} />;
    case 'Freelance': return <TrendingUp {...iconProps} />;
    case 'Investimento': return <Wallet {...iconProps} />;
    case 'Despesas Gerais Familiares': return <Users {...iconProps} />;
    case 'Lares': return <Home {...iconProps} />; // Portal usa casa com seta ou similar, Home serve
    case 'Restauração e Alojamento': return <Utensils {...iconProps} />;
    case 'Cabeleireiros': return <Scissors {...iconProps} />;
    case 'Passes Mensais': return <Bus {...iconProps} />;
    default: return <HelpCircle {...iconProps} />;
  }
};

export const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: '€',
  USD: '$',
  GBP: '£',
  BRL: 'R$'
};
