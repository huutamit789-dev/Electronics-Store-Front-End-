import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface CodeGateState {
  isCodeEntered: boolean;
  enterCode: (code: string) => boolean;
  resetCodeGate: () => void;
}

const SPECIAL_CODE = '09022000'; // Updated to the hardcoded value

export const useCodeGateStore = create<CodeGateState>()(
  persist(
    (set) => ({
      isCodeEntered: false,
      enterCode: (code: string) => {
        if (code === SPECIAL_CODE) {
          set({ isCodeEntered: true });
          return true;
        }
        return false;
      },
      resetCodeGate: () => set({ isCodeEntered: false }),
    }),
    {
      name: 'code-gate-storage', // unique name
      storage: createJSONStorage(() => localStorage), // use localStorage for persistence
    }
  )
);