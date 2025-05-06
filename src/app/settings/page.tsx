
"use client";

import { User, Shield, CreditCard, Bell, X, Save } from 'lucide-react';
import { useRouter } from 'next/navigation'; // if needed for close
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";

interface Tab {
  id: string;
  label: string;
  icon: React.ElementType;
  content: React.ReactNode;
}

const GeneralSettings = () => {
  const { toast } = useToast();
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Handle form submission logic here
    toast({
      title: "Settings Saved",
      description: "Your general settings have been updated.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>General Settings</CardTitle>
        <CardDescription>Manage your basic account and application settings.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="appName">Application Name</Label>
            <Input id="appName" defaultValue="RecipeSage" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="defaultLanguage">Default Language</Label>
            <Input id="defaultLanguage" defaultValue="Português (Brasil)" />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label htmlFor="darkMode" className="font-medium">Dark Mode</Label>
              <p className="text-sm text-muted-foreground">
                Toggle dark mode for the application.
              </p>
            </div>
            <Switch id="darkMode" aria-label="Toggle dark mode" />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label htmlFor="emailNotifications" className="font-medium">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive email notifications for important updates.
              </p>
            </div>
            <Switch id="emailNotifications" defaultChecked aria-label="Toggle email notifications" />
          </div>
        </CardContent>
        <Separator />
        <div className="p-6 flex justify-end">
            <Button type="submit"><Save className="mr-2 h-4 w-4" /> Save Changes</Button>
        </div>
      </form>
    </Card>
  );
};

const ProfileSettings = () => {
  const { toast } = useToast();
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved.",
    });
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Update your personal information.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" defaultValue="User" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" defaultValue="Name" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" defaultValue="user@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" placeholder="Tell us a little about yourself" defaultValue="Chef and food enthusiast." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="avatar">Avatar</Label>
            <Input id="avatar" type="file" />
            <p className="text-xs text-muted-foreground">Upload a new profile picture. JPG, PNG, GIF up to 5MB.</p>
          </div>
        </CardContent>
         <Separator />
        <div className="p-6 flex justify-end">
            <Button type="submit"><Save className="mr-2 h-4 w-4" /> Save Changes</Button>
        </div>
      </form>
    </Card>
  );
};

const SecuritySettings = () => {
 const { toast } = useToast();
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toast({
      title: "Security Settings Saved",
      description: "Your security settings have been updated.",
      variant: "default",
    });
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Security</CardTitle>
        <CardDescription>Manage your account security settings.</CardDescription>
      </CardHeader>
       <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input id="currentPassword" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input id="newPassword" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input id="confirmPassword" type="password" />
          </div>
          <Separator />
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
                <Label htmlFor="twoFactorAuth" className="font-medium">Two-Factor Authentication (2FA)</Label>
                <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account.
                </p>
            </div>
            <Switch id="twoFactorAuth" aria-label="Toggle two-factor authentication" />
          </div>
        </CardContent>
        <Separator />
        <div className="p-6 flex justify-end">
            <Button type="submit"><Save className="mr-2 h-4 w-4" /> Update Security</Button>
        </div>
      </form>
    </Card>
  );
};

const BillingSettings = () => (
  <Card>
    <CardHeader>
      <CardTitle>Billing</CardTitle>
      <CardDescription>Manage your subscription and payment methods.</CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
        <div className="p-4 border rounded-lg bg-secondary/50">
            <h4 className="font-medium">Current Plan: Pro</h4>
            <p className="text-sm text-muted-foreground">Renews on July 26, 2024 for $29/month.</p>
            <div className="mt-3 space-x-2">
                <Button size="sm">Change Plan</Button>
                <Button variant="outline" size="sm">Cancel Subscription</Button>
            </div>
        </div>
         <div className="space-y-2">
            <h4 className="font-medium">Payment Method</h4>
            <div className="flex items-center justify-between p-3 border rounded-lg">
                <p className="text-sm">Visa ending in 1234 (Expires 12/2025)</p>
                <Button variant="outline" size="sm">Update</Button>
            </div>
        </div>
         <div className="space-y-2">
            <h4 className="font-medium">Billing History</h4>
             <p className="text-sm text-muted-foreground">No invoices yet. Your first invoice will appear here after your first billing cycle.</p>
            {/* Placeholder for billing history list */}
        </div>
    </CardContent>
    <Separator />
    <div className="p-6 flex justify-end">
        <Button onClick={() => alert("Redirecting to Stripe or payment portal...")}><CreditCard className="mr-2 h-4 w-4" /> Manage Billing</Button>
    </div>
  </Card>
);


export default function SettingsPage() {
  const router = useRouter(); // If using for close button
  const [activeTab, setActiveTab] = React.useState('general');
  const { toast } = useToast();

  const tabs: Tab[] = [
    { id: 'general', label: 'General', icon: Settings, content: <GeneralSettings /> },
    { id: 'profile', label: 'Profile', icon: User, content: <ProfileSettings /> },
    { id: 'security', label: 'Security', icon: Shield, content: <SecuritySettings /> },
    { id: 'billing', label: 'Billing', icon: CreditCard, content: <BillingSettings /> },
    // Add more tabs as needed
  ];

  const currentTab = tabs.find(tab => tab.id === activeTab) || tabs[0];
  
  const handleClose = () => {
    // router.back(); // Or router.push('/')
    toast({
        title: "Settings Closed",
        description: "You have left the settings page.",
    });
    router.push('/'); 
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <Button variant="ghost" size="icon" onClick={handleClose} aria-label="Close settings">
          <X className="h-6 w-6" />
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Vertical Tabs Navigation */}
        <nav className="md:w-1/4 lg:w-1/5 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors
                ${activeTab === tab.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'hover:bg-muted hover:text-accent-foreground'
                }`}
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Tab Content Area */}
        <div className="md:w-3/4 lg:w-4/5">
          {currentTab.content}
        </div>
      </div>
    </div>
  );
}
