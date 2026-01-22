
import React from 'react';
import {
  Home, Car, ShoppingCart, Zap, Dog,
  Palmtree, GraduationCap, HeartPulse, Shield, HelpCircle,
  Briefcase, Gift, TrendingUp, Wallet, PawPrint
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

// Configurações aproximadas de IRS (Portugal)
export const IRS_CONFIG = {
  'Saúde': { percentage: 0.15, maxBenefit: 1000, description: '15% das despesas de saúde' },
  'Educação': { percentage: 0.30, maxBenefit: 800, description: '30% das despesas de formação' },
  'Habitação': { percentage: 0.15, maxBenefit: 502, description: '15% de rendas ou juros' },
  'Outros': { percentage: 0.35, maxBenefit: 250, description: 'Despesas Gerais Familiares (35%)' },
  'Lazer': { percentage: 0.15, maxBenefit: 250, description: 'IVA de Restauração, Hotelaria, Reparações e Veterinário' }
};

export const getCategoryIcon = (category: string) => {
  const iconProps = { size: 20 };
  switch (category) {
    case 'Alimentação': return <ShoppingCart {...iconProps} />;
    case 'Animais': return <PawPrint {...iconProps} />;
    case 'Despesas': return <Zap {...iconProps} />;
    case 'Educação': return <GraduationCap {...iconProps} />;
    case 'Habitação': return <Home {...iconProps} />;
    case 'Lazer': return <Palmtree {...iconProps} />;
    case 'Saúde': return <HeartPulse {...iconProps} />;
    case 'Seguros': return <Shield {...iconProps} />;
    case 'Transporte': return <Car {...iconProps} />;
    case 'Ordenado': return <Briefcase {...iconProps} />;
    case 'Presente': return <Gift {...iconProps} />;
    case 'Freelance': return <TrendingUp {...iconProps} />;
    case 'Investimento': return <Wallet {...iconProps} />;
    default: return <HelpCircle {...iconProps} />;
  }
};

export const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: '€',
  USD: '$',
  GBP: '£',
  BRL: 'R$'
};
