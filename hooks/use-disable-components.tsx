import { create } from "zustand";

interface DisableComponentsStore {
  isDisabled: boolean;
  toggleDisabled: () => void;
}

export const useDisableComponents = create<DisableComponentsStore>((set) => ({
  isDisabled: false,
  toggleDisabled: () => set((state) => ({ isDisabled: !state.isDisabled })),
}));
