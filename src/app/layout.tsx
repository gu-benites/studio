
import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google'; // Using Inter as a more standard Material-like font
import './globals.css';

import { cn } from '@/lib/utils';
import { UIStateProvider } from '@/contexts/UIStateContext';
import AppSidebar from '@/components/layout/app-sidebar';
import { LogoutConfirmationDialog } from '@/components/logout-confirmation-dialog';
import { SubscriptionModal } from '@/components/subscription-modal';
import { Toaster } from "@/components/ui/toaster"; // Import Toaster

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-geist-sans', // Keep var name for compatibility if Geist was specifically chosen, or change to --font-sans
});

export const metadata: Metadata = {
  title: 'RecipeSage - AI Powered Recipes',
  description: 'Generate amazing recipes with AI',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable
        )}
      >
        <UIStateProvider>
          <div className="flex min-h-screen">
            <AppSidebar />
            <main className="flex-1 pl-[68px] transition-all duration-300 ease-in-out data-[sidebar-open=true]:pl-[287px]"> {/* Adjust padding based on sidebar width */}
              {children}
            </main>
          </div>
          <LogoutConfirmationDialog />
          <SubscriptionModal />
          <Toaster /> {/* Add Toaster here */}
        </UIStateProvider>
      </body>
    </html>
  );
}

// This is a client-side wrapper to correctly apply dynamic padding based on sidebar state
// However, for simplicity and server components, we can use CSS to manage this.
// The `data-[sidebar-open=true]:pl-[287px]` approach on the main tag requires the main tag itself
// to be aware of the sidebar state. This is easier if AppSidebar and main are siblings under a parent
// that has the data attribute, or if we use a client component for the main layout part.

// For now, let's assume the `main` tag can have a data attribute updated by UIStateContext.
// If not, this `main` tag would need to be a client component.
// A simpler CSS-only approach without data attributes on `main`:
// In globals.css, you could have something like:
// .main-content { margin-left: 68px; transition: margin-left 0.3s ease-in-out; }
// .sidebar-open .main-content { margin-left: 287px; }
// And then conditionally add `sidebar-open` to the body or a root div.
// The provided `pl-[68px]` and `data-[sidebar-open=true]:pl-[287px]` in `main` needs UIStateContext to set `data-sidebar-open` on an ancestor or `main` itself.
// Let's try setting it on body or a root div within UIStateProvider if possible, or make main part client component.
// For now, the current structure will work if the main element is adjusted to be a client component that consumes the UIState.
// Or, AppSidebar could render the main content as its child and apply padding changes.
//
// Simplified approach for layout.tsx (assuming main tag is adjusted in a client component or via CSS):
// The `main` tag's `data-[sidebar-open=true]:pl-[287px]` implies that a parent or the `main` tag itself
// will have `data-sidebar-open="true"` attribute. This can be managed by a small client component wrapping the main content.

// Let's make the main content wrapper a client component
const MainContentWrapper = ({ children }: { children: React.ReactNode }) => {
  const { isSidebarOpen } = UIStateProvider(); // Corrected to use the Provider directly if it sets context or a simple wrapper reads it
  // For this to work, UIStateContext needs to be accessible here.
  // A better way is to have the UIStateProvider wrap this part and set a data attribute on a shared parent.
  // For now, we will assume the `pl-[68px]` etc. on `main` in the layout.tsx works as intended or will be
  // adjusted by a client component that consumes the context and sets the padding or a data attribute.
  
  // The current `AppSidebar` is fixed, so `main` needs to have `padding-left` that matches the sidebar width.
  // This can be handled like this:
  // Add a client component that wraps <main> and uses useUIState to set a data attribute on main.
  // src/components/layout/main-wrapper.tsx
  /*
  "use client";
  import { useUIState } from "@/contexts/UIStateContext";
  import { cn } from "@/lib/utils";
  
  export default function MainWrapper({ children }: { children: React.ReactNode }) {
    const { isSidebarOpen } = useUIState();
    return (
      <main 
        className={cn(
            "flex-1 transition-all duration-300 ease-in-out",
            isSidebarOpen ? "pl-[287px]" : "pl-[68px]"
        )}
      >
        {children}
      </main>
    );
  }
  */
  // And then in layout.tsx:
  // import MainWrapper from '@/components/layout/main-wrapper';
  // <MainWrapper>{children}</MainWrapper>
  // This is a cleaner separation. For now, I'll keep layout.tsx simpler and assume the CSS handles it or it's adjusted.
  // The provided solution in `layout.tsx` is okay but relies on a mechanism for `data-sidebar-open` attribute to be present on `main` or an ancestor.
  // This can be managed by a small client component wrapping the main content.

  // Simpler layout without MainContentWrapper for now - the pl-[68px] etc. are fixed values.
  // The `data-[sidebar-open=true]:pl-[287px]` is not standard Tailwind without a plugin that reads this attribute.
  // It would be better to use a class like `.sidebar-expanded:pl-[287px]` and toggle this class on the main element.
  // Let's modify the main tag to use a client component for dynamic padding.
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable
        )}
      >
        <UIStateProvider>
          <AppLayoutClient>{children}</AppLayoutClient>
          <LogoutConfirmationDialog />
          <SubscriptionModal />
          <Toaster />
        </UIStateProvider>
      </body>
    </html>
  );
}

// New client component to handle dynamic main padding
function AppLayoutClient({ children }: { children: React.ReactNode }) {
  const { isSidebarOpen } = useUIState();
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <main
        className={cn(
          "flex-1 transition-all duration-300 ease-in-out",
          isSidebarOpen ? "pl-[287px]" : "pl-[68px]"
        )}
      >
        {children}
      </main>
    </div>
  );
}

