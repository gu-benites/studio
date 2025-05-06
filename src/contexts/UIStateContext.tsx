"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useCallback } from 'react';

interface UIState {
  isSidebarOpen: boolean; // Is it visually expanded?
  isSidebarPinned: boolean; // Desktop: is it pinned open? (implies isSidebarOpen=true)
  isLogoutModalOpen: boolean;
  isSubscriptionModalOpen: boolean;
  isLanguageSelectorOpen: boolean; // Kept for explicitness, though activeUserMenuSubItem covers it
  activeUserMenuSubItem: string | null; // To manage which sub-menu (like language) is open
}

interface UIStateContextType extends UIState {
  toggleDesktopSidebarPin: () => void;
  toggleMobileSidebar: () => void;
  closeSidebarCompletely: () => void; // New: to fully close sidebar and sub-menus
  setLogoutModalOpen: (isOpen: boolean) => void;
  setSubscriptionModalOpen: (isOpen: boolean) => void;
  setLanguageSelectorOpen: (isOpen: boolean) => void; // May be deprecated if activeUserMenuSubItem is sole controller
  setActiveUserMenuSubItem: (item: string | null) => void;
}

const UIStateContext = createContext<UIStateContextType | undefined>(undefined);

const initialState: UIState = {
  isSidebarOpen: false, 
  isSidebarPinned: false, // Desktop sidebar starts collapsed and unpinned
  isLogoutModalOpen: false,
  isSubscriptionModalOpen: false,
  isLanguageSelectorOpen: false,
  activeUserMenuSubItem: null,
};

export function UIStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<UIState>(initialState);

  const toggleDesktopSidebarPin = useCallback(() => {
    setState((s) => {
      if (s.isSidebarOpen && s.isSidebarPinned) { // Open & Pinned -> Close & Unpin
        return { ...s, isSidebarOpen: false, isSidebarPinned: false, activeUserMenuSubItem: null };
      } else { // Closed (or unpinned but open, though current logic avoids this state) -> Open & Pin
        return { ...s, isSidebarOpen: true, isSidebarPinned: true };
      }
    });
  }, []);

  const toggleMobileSidebar = useCallback(() => {
    setState((s) => ({
      ...s,
      isSidebarOpen: !s.isSidebarOpen,
      isSidebarPinned: false, // Mobile sidebar is an overlay, not "pinned"
      activeUserMenuSubItem: !s.isSidebarOpen ? s.activeUserMenuSubItem : null, // Close sub-menu if sidebar is closing
    }));
  }, []);
  
  const closeSidebarCompletely = useCallback(() => {
    setState((s) => ({ 
      ...s, 
      isSidebarOpen: false, 
      isSidebarPinned: false, 
      activeUserMenuSubItem: null,
      isLanguageSelectorOpen: false // ensure language selector also closes
    }));
  }, []);


  const setLogoutModalOpen = useCallback((isOpen: boolean) => {
    setState((s) => ({ ...s, isLogoutModalOpen: isOpen }));
  }, []);

  const setSubscriptionModalOpen = useCallback((isOpen: boolean) => {
    setState((s) => ({ ...s, isSubscriptionModalOpen: isOpen }));
  }, []);

  const setLanguageSelectorOpen = useCallback((isOpen: boolean) => {
    // This directly controls the language selector if needed,
    // but setActiveUserMenuSubItem is preferred for generic sub-menus.
    setState(s => ({ 
      ...s, 
      isLanguageSelectorOpen: isOpen, 
      activeUserMenuSubItem: isOpen ? 'language' : (s.activeUserMenuSubItem === 'language' ? null : s.activeUserMenuSubItem)
    }));
  }, []);

  const setActiveUserMenuSubItem = useCallback((item: string | null) => {
    setState(s => ({ 
      ...s, 
      activeUserMenuSubItem: item,
      // If language selector is being closed via this, update its specific state too
      isLanguageSelectorOpen: item === 'language' ? s.isLanguageSelectorOpen : false 
    }));
  }, []);

  return (
    <UIStateContext.Provider
      value={{
        ...state,
        toggleDesktopSidebarPin,
        toggleMobileSidebar,
        closeSidebarCompletely,
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