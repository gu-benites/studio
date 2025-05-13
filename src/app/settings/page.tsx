
"use client";

import { User, Shield, CreditCard, Bell, X, Save, Settings as SettingsIcon, LogOut, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import ProtectedRoute from '@/components/auth/protected-route';

interface Tab {
  id: string;
  label: string;
  icon: React.ElementType;
  content: React.ReactNode;
}

const GeneralSettings = () => {
  const { toast } = useToast();
  const { language, setLanguage, languages, isLoading } = useLanguage();
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    
    try {
      // Get form data
      const formData = new FormData(event.currentTarget);
      const selectedLanguage = formData.get('language') as string;
      
      // Update language if it changed
      if (selectedLanguage && selectedLanguage !== language) {
        await setLanguage(selectedLanguage);
      }
      
      toast({
        title: "Settings Saved",
        description: "Your general settings have been updated.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error Saving Settings",
        description: "There was a problem saving your settings.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
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
            <Label htmlFor="language">Default Language</Label>
            <Select name="language" defaultValue={language} disabled={loading || isLoading}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <div className="flex items-center gap-2">
                      {lang.flag && <span>{lang.flag}</span>}
                      <span>{lang.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Choose your preferred language for the application</p>
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
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  // Get user metadata for form defaults
  const firstName = user?.user_metadata?.first_name || '';
  const lastName = user?.user_metadata?.last_name || '';
  const email = user?.email || '';
  
  // Import the storage utilities
  const { uploadFile, updateUserAvatar } = require('@/lib/supabase/storage-utils');
  const { supabase } = require('@/lib/supabase/client');
  
  // Fetch the user's profile on component mount
  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);
  
  const fetchProfile = async () => {
    try {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }
      
      if (data?.avatar_url) {
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };
  
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!user) return;
      if (!event.target.files || event.target.files.length === 0) return;
      
      const file = event.target.files[0];
      const fileSize = file.size / 1024 / 1024; // size in MB
      
      if (fileSize > 5) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 5MB.",
          variant: "destructive"
        });
        return;
      }
      
      setLoading(true);
      
      // Upload the file to Supabase Storage
      const publicUrl = await uploadFile(file, 'avatars', user.id);
      
      // Update the user's profile with the avatar URL
      await updateUserAvatar(user.id, publicUrl);
      
      // Update the local state
      setAvatarUrl(publicUrl);
      
      toast({
        title: "Avatar Updated",
        description: "Your profile picture has been updated.",
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your avatar.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    
    try {
      if (!user) return;
      
      // Get form data
      const formData = new FormData(event.currentTarget);
      const firstName = formData.get('firstName') as string;
      const lastName = formData.get('lastName') as string;
      const bio = formData.get('bio') as string;
      
      // Update user metadata in Supabase Auth
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          first_name: firstName,
          last_name: lastName,
        }
      });
      
      if (metadataError) throw metadataError;
      
      // Update profile in the profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (profileError) throw profileError;
      
      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: "There was an error updating your profile.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Update your personal information.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={email} disabled />
            <p className="text-xs text-muted-foreground mt-1">Your email address cannot be changed</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" name="firstName" defaultValue={firstName} disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" name="lastName" defaultValue={lastName} disabled={loading} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" name="bio" placeholder="Tell us a little about yourself" defaultValue="Chef and food enthusiast." disabled={loading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="avatar">Avatar</Label>
            <div className="flex items-center gap-4 mb-2">
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt="Profile Avatar" 
                  className="h-16 w-16 rounded-full object-cover border"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center border">
                  <span className="text-muted-foreground text-xl font-medium">
                    {firstName && lastName ? `${firstName[0]}${lastName[0]}` : '?'}
                  </span>
                </div>
              )}
              <Input 
                id="avatar" 
                name="avatar" 
                type="file" 
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={loading}
              />
            </div>
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
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  
  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Import the Supabase client
  const { supabase } = require('@/lib/supabase/client');
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Store a reference to the form
    const form = event.currentTarget;
    setLoading(true);
    setPasswordError('');
    
    // Get form data
    const formData = new FormData(form);
    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    
    // Client-side validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All password fields are required');
      setLoading(false);
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      setLoading(false);
      return;
    }
    
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      setLoading(false);
      return;
    }
    
    try {
      // Use Supabase's built-in password update functionality
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        setPasswordError(error.message || 'Failed to update password');
        toast({
          title: "Password Update Failed",
          description: error.message || "There was a problem updating your password.",
          variant: "destructive"
        });
      } else {
        // Success case
        toast({
          title: "Password Updated",
          description: "Your password has been successfully changed.",
        });
        
        // Clear form
        form.reset();
      }
    } catch (e) {
      // This catch block should rarely be hit since Supabase handles errors in the result
      // But we keep it as a fallback
      setPasswordError('An unexpected error occurred');
      toast({
        title: "Password Update Failed",
        description: "An unexpected error occurred while updating your password.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Security</CardTitle>
        <CardDescription>Manage your account security settings.</CardDescription>
      </CardHeader>
       <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {passwordError && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {passwordError}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <div className="relative">
              <Input 
                id="currentPassword" 
                name="currentPassword" 
                type={showCurrentPassword ? "text" : "password"} 
                required 
                disabled={loading}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                tabIndex={-1}
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">Enter your current password for verification</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input 
                id="newPassword" 
                name="newPassword" 
                type={showNewPassword ? "text" : "password"} 
                required 
                disabled={loading}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowNewPassword(!showNewPassword)}
                tabIndex={-1}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">Password must be at least 8 characters</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Input 
                id="confirmPassword" 
                name="confirmPassword" 
                type={showConfirmPassword ? "text" : "password"} 
                required 
                disabled={loading}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </CardContent>
        <Separator />
        <div className="p-6 flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Update Password
                </>
              )}
            </Button>
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
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState('general');
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const tabs: Tab[] = [
    { id: 'general', label: 'General', icon: SettingsIcon, content: <GeneralSettings /> },
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
    <ProtectedRoute>
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-5xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={handleSignOut}
              disabled={isLoggingOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {isLoggingOut ? 'Signing out...' : 'Sign out'}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleClose} aria-label="Close settings">
              <X className="h-6 w-6" />
            </Button>
          </div>
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
    </ProtectedRoute>
  );
}
