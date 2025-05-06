
"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useCallback } from 'react';

interface UIState {
  isSidebarOpen: boolean;
  isSidebarPinned: boolean;
  isLogoutModalOpen: boolean;
  isSubscriptionModalOpen: boolean;
  isLanguageSelectorOpen: boolean;
  activeUserMenuSubItem: string | null; // To manage which sub-menu (like language) is open
}

interface UIStateContextType extends UIState {
  toggleSidebar: (pin?: boolean) => void;
  openSidebar: () => void;
  closeSidebar: (force?: boolean) => void;
  pinSidebar: () => void;
  unpinSidebar: () => void;
  setLogoutModalOpen: (isOpen: boolean) => void;
  setSubscriptionModalOpen: (isOpen: boolean) => void;
  setLanguageSelectorOpen: (isOpen: boolean) => void;
  setActiveUserMenuSubItem: (item: string | null) => void;
}

const UIStateContext = createContext<UIStateContextType | undefined>(undefined);

const initialState: UIState = {
  isSidebarOpen: false, // Default to collapsed
  isSidebarPinned: false,
  isLogoutModalOpen: false,
  isSubscriptionModalOpen: false,
  isLanguageSelectorOpen: false,
  activeUserMenuSubItem: null,
};

export function UIStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<UIState>(initialState);

  const openSidebar = useCallback(() => {
    setState((s) => ({ ...s, isSidebarOpen: true }));
  }, []);

  const closeSidebar = useCallback((force = false) => {
    setState((s) => {
      if (s.isSidebarPinned && !force) return s; // Don't close if pinned unless forced
      return { ...s, isSidebarOpen: false, isSidebarPinned: force ? false : s.isSidebarPinned };
    });
  }, []);

  const pinSidebar = useCallback(() => {
    setState((s) => ({ ...s, isSidebarPinned: true, isSidebarOpen: true }));
  }, []);
  
  const unpinSidebar = useCallback(() => {
    setState((s) => ({ ...s, isSidebarPinned: false, isSidebarOpen: false }));
  }, []);

  const toggleSidebar = useCallback((pin?: boolean) => {
    setState((s) => {
      const newIsOpen = !s.isSidebarOpen;
      if (pin !== undefined) { // Explicit pinning instruction
        return { ...s, isSidebarOpen: newIsOpen, isSidebarPinned: newIsOpen && pin };
      }
      // Default toggle behavior
      if (newIsOpen) { // Opening
        return { ...s, isSidebarOpen: true, isSidebarPinned: true }; // Pin when opening with toggle
      } else { // Closing
        return { ...s, isSidebarOpen: false, isSidebarPinned: false }; // Unpin when closing with toggle
      }
    });
  }, []);


  const setLogoutModalOpen = useCallback((isOpen: boolean) => {
    setState((s) => ({ ...s, isLogoutModalOpen: isOpen }));
  }, []);

  const setSubscriptionModalOpen = useCallback((isOpen: boolean) => {
    setState((s) => ({ ...s, isSubscriptionModalOpen: isOpen }));
  }, []);

  const setLanguageSelectorOpen = useCallback((isOpen: boolean) => {
    setState((s) => ({ ...s, isLanguageSelectorOpen: isOpen, activeUserMenuSubItem: isOpen ? 'language' : null }));
  }, []);

  const setActiveUserMenuSubItem = useCallback((item: string | null) => {
    setState(s => ({ ...s, activeUserMenuSubItem: item }));
  }, []);

  return (
    <UIStateContext.Provider
      value={{
        ...state,
        toggleSidebar,
        openSidebar,
        closeSidebar,
        pinSidebar,
        unpinSidebar,
        setLogoutModalOpen,
        setSubscriptionModalOpen,
        setLanguageSelectorOpen,
        setActiveUserMenuSubItem,
      }}
    >
      {children}
    </UIStateContext.Provider>
  );
}

export function useUIState(): UIStateContextType {
  const context = useContext(UIStateContext);
  if (context === undefined) {
    throw new Error('useUIState must be used within a UIStateProvider');
  }
  return context;
}
