
"use client";

import { useUIState } from '@/contexts/UIStateContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export const LogoutConfirmationDialog: React.FC = () => {
  const { isLogoutModalOpen, setLogoutModalOpen } = useUIState();

  const handleLogout = () => {
    // Implement actual logout logic here
    console.log("User logged out");
    setLogoutModalOpen(false);
    // Example: router.push('/login');
  };

  return (
    <AlertDialog open={isLogoutModalOpen} onOpenChange={setLogoutModalOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to sign out?</AlertDialogTitle>
          <AlertDialogDescription>
            You will be returned to the login page.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setLogoutModalOpen(false)}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleLogout} className="font-semibold">
            Sign Out
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
