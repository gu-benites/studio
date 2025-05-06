"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useCallback } from 'react';

interface UIState {
  isSidebarOpen: boolean; // Is it visually expanded?
  isSidebarPinned: boolean; // Desktop: is it pinned open? (implies isSidebarOpen=true)
  isLogoutModalOpen: boolean;
  isSubscriptionModalOpen: boolean;
  activeUserMenuSubItem: string | null; // To manage which sub-menu (like language) is open
  isUserAccountMenuExpanded: boolean; // New: For inline user account menu
}

interface UIStateContextType extends UIState {
  toggleDesktopSidebarPin: () => void;
  toggleMobileSidebar: () => void;
  closeSidebarCompletely: () => void;
  setLogoutModalOpen: (isOpen: boolean) => void;
  setSubscriptionModalOpen: (isOpen: boolean) => void;
  setActiveUserMenuSubItem: (item: string | null) => void;
  openUserAccountMenu: () => void;
  closeUserAccountMenu: () => void;
  toggleUserAccountMenu: () => void; // Convenience toggle
}

const UIStateContext = createContext<UIStateContextType | undefined>(undefined);

const initialState: UIState = {
  isSidebarOpen: false, 
  isSidebarPinned: false,
  isLogoutModalOpen: false,
  isSubscriptionModalOpen: false,
  activeUserMenuSubItem: null,
  isUserAccountMenuExpanded: false, // Default to closed
};

export function UIStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<UIState>(initialState);

  const toggleDesktopSidebarPin = useCallback(() => {
    setState((s) => {
      const newIsSidebarPinned = !s.isSidebarPinned;
      const newIsSidebarOpen = newIsSidebarPinned; // Pinning means open, unpinning means collapsed (for desktop logic)
      return {
        ...s,
        isSidebarOpen: newIsSidebarOpen,
        isSidebarPinned: newIsSidebarPinned,
        activeUserMenuSubItem: newIsSidebarOpen ? s.activeUserMenuSubItem : null,
        isUserAccountMenuExpanded: newIsSidebarOpen ? s.isUserAccountMenuExpanded : false, // Close user menu if sidebar collapses
      };
    });
  }, []);

  const toggleMobileSidebar = useCallback(() => {
    setState((s) => {
      const newIsSidebarOpen = !s.isSidebarOpen;
      return {
        ...s,
        isSidebarOpen: newIsSidebarOpen,
        isSidebarPinned: false, 
        activeUserMenuSubItem: newIsSidebarOpen ? s.activeUserMenuSubItem : null,
        isUserAccountMenuExpanded: newIsSidebarOpen ? s.isUserAccountMenuExpanded : false, // Close user menu if sidebar closes
      };
    });
  }, []);
  
  const closeSidebarCompletely = useCallback(() => {
    setState((s) => ({ 
      ...s, 
      isSidebarOpen: false, 
      isSidebarPinned: false, 
      activeUserMenuSubItem: null,
      isUserAccountMenuExpanded: false, 
    }));
  }, []);

  const setLogoutModalOpen = useCallback((isOpen: boolean) => {
    setState((s) => ({ ...s, isLogoutModalOpen: isOpen }));
  }, []);

  const setSubscriptionModalOpen = useCallback((isOpen: boolean) => {
    setState((s) => ({ ...s, isSubscriptionModalOpen: isOpen }));
  }, []);

  const setActiveUserMenuSubItem = useCallback((item: string | null) => {
    setState(s => ({ 
      ...s, 
      activeUserMenuSubItem: item,
    }));
  }, []);

  const openUserAccountMenu = useCallback(() => {
    setState(s => ({ ...s, isUserAccountMenuExpanded: true }));
  }, []);

  const closeUserAccountMenu = useCallback(() => {
    setState(s => ({ ...s, isUserAccountMenuExpanded: false, activeUserMenuSubItem: null }));
  }, []);

  const toggleUserAccountMenu = useCallback(() => {
    setState(s => ({ 
      ...s, 
      isUserAccountMenuExpanded: !s.isUserAccountMenuExpanded,
      activeUserMenuSubItem: !s.isUserAccountMenuExpanded ? s.activeUserMenuSubItem : null, // Close sub-menu if user menu closes
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
        setActiveUserMenuSubItem,
        openUserAccountMenu,
        closeUserAccountMenu,
        toggleUserAccountMenu,
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
