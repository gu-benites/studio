"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useCallback } from 'react';

interface UIState {
  isSidebarOpen: boolean; // Is it visually expanded?
  isSidebarPinned: boolean; // Desktop: is it pinned open? (implies isSidebarOpen=true)
  sidebarAutoPinnedForMenu: boolean; // Desktop: was sidebar auto-pinned to show user menu?
  isLogoutModalOpen: boolean;
  isSubscriptionModalOpen: boolean;
  activeUserMenuSubItem: string | null; // To manage which sub-menu (like language) is open
  isUserAccountMenuExpanded: boolean;
}

interface UIStateContextType extends UIState {
  toggleDesktopSidebarPin: () => void; // For manual pin/unpin via icon
  toggleMobileSidebar: () => void;
  closeSidebarCompletely: () => void;
  setLogoutModalOpen: (isOpen: boolean) => void;
  setSubscriptionModalOpen: (isOpen: boolean) => void;
  setActiveUserMenuSubItem: (item: string | null) => void;
  openUserAccountMenu: () => void; // Simple menu opener
  closeUserAccountMenu: () => void; // Simple menu closer
  toggleUserAccountMenu: () => void; // Simple toggle, mainly for mobile or when sidebar state is managed independently
  openUserMenuAndExpandSidebarIfNeeded: () => void; // For avatar click on desktop
  closeUserMenuAndCollapseSidebarIfAutoExpanded: () => void; // For avatar click or navigation from menu on desktop
}

const UIStateContext = createContext<UIStateContextType | undefined>(undefined);

const initialState: UIState = {
  isSidebarOpen: false, 
  isSidebarPinned: false,
  sidebarAutoPinnedForMenu: false,
  isLogoutModalOpen: false,
  isSubscriptionModalOpen: false,
  activeUserMenuSubItem: null,
  isUserAccountMenuExpanded: false,
};

export function UIStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<UIState>(initialState);

  const toggleDesktopSidebarPin = useCallback(() => { // Manual pin toggle
    setState((s) => {
      const newIsSidebarPinned = !s.isSidebarPinned;
      const newIsSidebarOpen = newIsSidebarPinned; // Pinning opens, unpinning collapses
      return {
        ...s,
        isSidebarOpen: newIsSidebarOpen,
        isSidebarPinned: newIsSidebarPinned,
        sidebarAutoPinnedForMenu: false, // Manual pin action clears auto-pin flag
        isUserAccountMenuExpanded: newIsSidebarOpen ? s.isUserAccountMenuExpanded : false, // Close menu if sidebar collapses
        activeUserMenuSubItem: newIsSidebarOpen ? s.activeUserMenuSubItem : null,
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
        sidebarAutoPinnedForMenu: false,
        activeUserMenuSubItem: newIsSidebarOpen ? s.activeUserMenuSubItem : null,
        isUserAccountMenuExpanded: newIsSidebarOpen ? s.isUserAccountMenuExpanded : false,
      };
    });
  }, []);
  
  const closeSidebarCompletely = useCallback(() => {
    setState((s) => ({ 
      ...s, 
      isSidebarOpen: false, 
      isSidebarPinned: false, 
      sidebarAutoPinnedForMenu: false,
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

  const openUserAccountMenu = useCallback(() => { // Simple open, assumes sidebar is handled
    setState(s => ({ ...s, isUserAccountMenuExpanded: true }));
  }, []);

  const closeUserAccountMenu = useCallback(() => { // Simple close
    setState(s => ({ ...s, isUserAccountMenuExpanded: false, activeUserMenuSubItem: null }));
  }, []);

  const toggleUserAccountMenu = useCallback(() => { // Simple toggle for mobile or specific cases
    setState(s => ({ 
      ...s, 
      isUserAccountMenuExpanded: !s.isUserAccountMenuExpanded,
      activeUserMenuSubItem: !s.isUserAccountMenuExpanded ? s.activeUserMenuSubItem : null,
    }));
  }, []);

  const openUserMenuAndExpandSidebarIfNeeded = useCallback(() => {
    setState(s => {
      if (s.isUserAccountMenuExpanded) return s; // Already open

      // Desktop, sidebar is collapsed and unpinned: auto-expand and pin for menu
      if (!s.isSidebarPinned && !s.isSidebarOpen && !(typeof window !== 'undefined' && window.innerWidth < 768)) {
        return {
          ...s,
          isSidebarOpen: true,
          isSidebarPinned: true, // Auto-pin
          sidebarAutoPinnedForMenu: true,
          isUserAccountMenuExpanded: true,
        };
      }
      // Sidebar is already pinned/open, or on mobile: just open menu
      return {
        ...s,
        isUserAccountMenuExpanded: true,
      };
    });
  }, []);

  const closeUserMenuAndCollapseSidebarIfAutoExpanded = useCallback(() => {
    setState(s => {
      if (!s.isUserAccountMenuExpanded) return s; // Already closed

      const newState = {
        ...s,
        isUserAccountMenuExpanded: false,
        activeUserMenuSubItem: null,
      };

      // If sidebar was auto-pinned for the menu (desktop only behavior)
      if (s.sidebarAutoPinnedForMenu && !(typeof window !== 'undefined' && window.innerWidth < 768)) {
        newState.isSidebarOpen = false;
        newState.isSidebarPinned = false;
        newState.sidebarAutoPinnedForMenu = false;
      }
      // If sidebar was manually pinned, it remains open and pinned.
      // On mobile, this action just closes the menu, sidebar state managed by toggleMobileSidebar or closeSidebarCompletely.
      return newState;
    });
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
        openUserMenuAndExpandSidebarIfNeeded,
        closeUserMenuAndCollapseSidebarIfAutoExpanded,
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
