import { create } from 'zustand';

type UiState = {
  cartDrawerOpen: boolean;
  toggleCartDrawer: (open?: boolean) => void;
};

export const useUiStore = create<UiState>((set) => ({
  cartDrawerOpen: false,
  toggleCartDrawer: (open) =>
    set((s) => ({ cartDrawerOpen: open ?? !s.cartDrawerOpen })),
}));
