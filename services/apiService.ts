
import { FinanceState } from "../types";

const DB_KEY = 'financas360_database_v1';
const USER_KEY = 'financas360_user_session';

export const apiService = {
  // --- AUTH METHODS ---
  login: async (email: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.setItem(USER_KEY, JSON.stringify({ email, loggedIn: true }));
        resolve(true);
      }, 800);
    });
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem(USER_KEY);
    window.location.reload();
  },

  checkAuth: (): boolean => {
    const session = localStorage.getItem(USER_KEY);
    return !!session;
  },

  // --- DATA METHODS ---
  saveFinanceData: async (state: FinanceState): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          localStorage.setItem(DB_KEY, JSON.stringify(state));
          resolve(true);
        } catch (e) {
          resolve(false);
        }
      }, 300);
    });
  },

  loadFinanceData: async (): Promise<FinanceState | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = localStorage.getItem(DB_KEY);
        if (data) {
          try {
            resolve(JSON.parse(data));
          } catch {
            resolve(null);
          }
        } else {
          resolve(null);
        }
      }, 500);
    });
  },

  clearDatabase: async (): Promise<void> => {
    localStorage.removeItem(DB_KEY);
    window.location.reload();
  }
};
