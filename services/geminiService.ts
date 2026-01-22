
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { FinanceState } from "../types";

export const getFinancialAdvice = async (state: FinanceState, currencySymbol: string = '€'): Promise<string> => {
  // Always use the named parameter for apiKey and use process.env.API_KEY directly.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const totalIncome = state.transactions
    .filter(t => t.type === 'entrada')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpenses = state.transactions
    .filter(t => t.type === 'saida')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalMonthlyDebt = state.debts.reduce((acc, curr) => acc + curr.monthlyPayment, 0);

  const prompt = `
    Analise a seguinte situação financeira familiar e dê conselhos práticos em Português de Portugal.
    
    Rendimento Mensal: ${totalIncome}${currencySymbol}
    Gastos Correntes (Presente): ${totalExpenses}${currencySymbol}
    Compromissos de Longo Prazo (Passado - Mensal): ${totalMonthlyDebt}${currencySymbol}
    Total em Poupanças (Futuro): ${state.goals.reduce((acc, g) => acc + g.currentAmount, 0)}${currencySymbol}
    
    Dívidas Atuais:
    ${state.debts.map(d => `- ${d.name}: Falta pagar ${d.remainingValue}${currencySymbol} (${d.monthlyPayment}${currencySymbol}/mês)`).join('\n')}
    
    Dê 3 sugestões curtas e diretas para melhorar a saúde financeira.
  `;

  try {
    // Correct way to call generateContent: pass model and contents in the same call.
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    // response.text is a property, not a method.
    return response.text || "Não foi possível gerar conselhos de momento.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Erro ao contactar o consultor financeiro IA.";
  }
};
