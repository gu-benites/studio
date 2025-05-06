
"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useCallback } from 'react';

interface UIState {
  isSidebarOpen: boolean; // Is it visually expanded?
  isSidebarPinned: boolean; // Desktop: is it manually pinned open?
  isLogoutModalOpen: boolean;
  isSubscriptionModalOpen: boolean;
  activeUserMenuSubItem: string | null; // To manage which sub-menu (like language) is open
  isUserAccountMenuExpanded: boolean;
}

interface UIStateContextType extends UIState {
  toggleDesktopSidebarPin: () => void; // For manual pin/unpin via icon
  toggleMobileSidebar: () => void;
  closeSidebarCompletely: () => void; // For navigation clicks, overlay clicks on mobile
  setLogoutModalOpen: (isOpen: boolean) => void;
  setSubscriptionModalOpen: (isOpen: boolean) => void;
  setActiveUserMenuSubItem: (item: string | null) => void;
  
  // Primary handler for avatar clicks (desktop/mobile) 
  // and for actions originating from an open user menu on desktop (e.g., navigation, modal triggers)
  handleUserMenuToggle: () => void; 
  
  // Simpler actions, for specific cases e.g. mobile sidebar internal menu toggle
  // where sidebar state is managed independently.
  openUserAccountMenuSimple: () => void; 
  closeUserAccountMenuSimple: () => void; 
  toggleUserAccountMenuSimple: () => void;
}

const UIStateContext = createContext<UIStateContextType | undefined>(undefined);

const initialState: UIState = {
  isSidebarOpen: false, 
  isSidebarPinned: false,
  isLogoutModalOpen: false,
  isSubscriptionModalOpen: false,
  activeUserMenuSubItem: null,
  isUserAccountMenuExpanded: false,
};

export function UIStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<UIState>(initialState);

  const toggleDesktopSidebarPin = useCallback(() => { // Manual pin toggle via icon
    setState((s) => {
      const newIsSidebarPinned = !s.isSidebarPinned;
      const newIsSidebarOpen = newIsSidebarPinned; // Pinning opens, unpinning via icon collapses
      return {
        ...s,
        isSidebarOpen: newIsSidebarOpen,
        isSidebarPinned: newIsSidebarPinned,
        // If sidebar collapses due to unpinning, close user menu
        isUserAccountMenuExpanded: newIsSidebarOpen ? s.isUserAccountMenuExpanded : false,
        activeUserMenuSubItem: newIsSidebarOpen ? s.activeUserMenuSubItem : null,
      };
    });
  }, []);

  const toggleMobileSidebar = useCallback(() => { // For mobile drawer
    setState((s) => {
      const newIsSidebarOpen = !s.isSidebarOpen;
      return {
        ...s,
        isSidebarOpen: newIsSidebarOpen,
        isSidebarPinned: false, // Pinning is a desktop concept
        // If mobile drawer closes, ensure menu section and sub-items are also closed
        activeUserMenuSubItem: newIsSidebarOpen ? s.activeUserMenuSubItem : null,
        isUserAccountMenuExpanded: newIsSidebarOpen ? s.isUserAccountMenuExpanded : false,
      };
    });
  }, []);
  
  const closeSidebarCompletely = useCallback(() => { // For nav clicks on mobile, overlay click etc.
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

  // Simple actions for direct menu state control, without complex sidebar logic.
  // Used when sidebar state is managed independently (e.g., mobile drawer already open).
  const openUserAccountMenuSimple = useCallback(() => {
    setState(s => ({ ...s, isUserAccountMenuExpanded: true }));
  }, []);

  const closeUserAccountMenuSimple = useCallback(() => {
    setState(s => ({ ...s, isUserAccountMenuExpanded: false, activeUserMenuSubItem: null }));
  }, []);

  const toggleUserAccountMenuSimple = useCallback(() => {
    setState(s => ({ 
      ...s, 
      isUserAccountMenuExpanded: !s.isUserAccountMenuExpanded,
      activeUserMenuSubItem: !s.isUserAccountMenuExpanded ? s.activeUserMenuSubItem : null,
    }));
  }, []);

  // Unified handler for avatar click, or for menu item click causing menu/sidebar close on desktop.
  const handleUserMenuToggle = useCallback(() => {
    setState(s => {
      const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768;

      if (s.isUserAccountMenuExpanded) { // Menu is currently open, so action is to close it
        if (isDesktop) {
          // Close menu AND collapse/unpin sidebar
          return {
            ...s,
            isUserAccountMenuExpanded: false,
            activeUserMenuSubItem: null,
            isSidebarOpen: false,
            isSidebarPinned: false,
          };
        } else { // Mobile: just close menu section, sidebar drawer state is separate
          return {
            ...s,
            isUserAccountMenuExpanded: false,
            activeUserMenuSubItem: null,
          };
        }
      } else { // Menu is currently closed, so action is to open it
        if (isDesktop) {
          // Open menu AND expand/pin sidebar
          return {
            ...s,
            isUserAccountMenuExpanded: true,
            isSidebarOpen: true,
            isSidebarPinned: true, // Sidebar becomes "pinned" while menu is open
          };
        } else { // Mobile: just open menu section.
                 // Caller (handleAvatarClick in app-sidebar) ensures mobile drawer is open first if needed.
          return {
            ...s,
            isUserAccountMenuExpanded: true,
          };
        }
      }
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
        openUserAccountMenuSimple,
        closeUserAccountMenuSimple,
        toggleUserAccountMenuSimple,
        handleUserMenuToggle,
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
