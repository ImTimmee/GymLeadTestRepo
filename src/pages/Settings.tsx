import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { Palette, Building2, Mail, Calendar, Save, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

// ✅ PAS DIT PAD AAN NAAR JOUW PROJECT
import { supabase } from "@/integrations/supabase/client";

const accentColors = [
  { name: 'Lime', value: '#84cc16' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Rose', value: '#f43f5e' },
];

export default function Settings() {
  const { profile, loading, updateProfile } = useProfile();
  const { user } = useAuth();
  const [businessName, setBusinessName] = useState('');
  const [notificationEmail, setNotificationEmail] = useState('');
  const [calendlyLink, setCalendlyLink] = useState('');
  const [accentColor, setAccentColor] = useState('');

  // ✅ Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const handleSave = () => {
    updateProfile.mutate({
      business_name: businessName || profile?.business_name,
      notification_email: notificationEmail || profile?.notification_email,
      calendly_link: calendlyLink || profile?.calendly_link,
      accent_color: accentColor || profile?.accent_color,
    });
  };

  // ✅ Password change handler (Supabase: re-auth -> updateUser)
  const handleChangePassword = async () => {
    try {
      if (!user?.email) {
        toast.error('Je bent niet ingelogd.');
        return;
      }

      if (newPassword.length < 8) {
        toast.error('Nieuw wachtwoord moet minimaal 8 tekens zijn.');
        return;
      }

      if (newPassword !== confirmNewPassword) {
        toast.error('Nieuwe wachtwoorden komen niet overeen.');
        return;
      }

      setChangingPassword(true);

      // 1) Re-auth: check current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        toast.error('Huidig wachtwoord klopt niet.');
        return;
      }

      // 2) Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        toast.error(updateError.message);
        return;
      }

      toast.success('Wachtwoord succesvol gewijzigd ✅');

      // clear fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (e: any) {
      toast.error(e?.message ?? 'Er ging iets mis bij het wijzigen van je wachtwoord.');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Settings">
        <div className="space-y-6 max-w-2xl">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Settings">
      <div className="max-w-2xl space-y-6">
        {/* Business Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Business Information
            </CardTitle>
            <CardDescription>
              Update your business details shown in the chatbot
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                placeholder="Your Business Name"
                value={businessName || profile?.business_name || ''}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notificationEmail">Notification Email</Label>
              <Input
                id="notificationEmail"
                type="email"
                placeholder="notifications@yourbusiness.com"
                value={notificationEmail || profile?.notification_email || ''}
                onChange={(e) => setNotificationEmail(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Receive notifications when new leads come in
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="calendlyLink">Calendly Link (Optional)</Label>
              <Input
                id="calendlyLink"
                placeholder="https://calendly.com/yourbusiness"
                value={calendlyLink || profile?.calendly_link || ''}
                onChange={(e) => setCalendlyLink(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Add a booking link to let leads schedule calls
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Branding */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-accent" />
              Branding
            </CardTitle>
            <CardDescription>
              Customize the appearance of your chatbot
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Accent Color</Label>
              <div className="grid grid-cols-5 gap-2">
                {accentColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setAccentColor(color.value)}
                    className={`w-full aspect-square rounded-lg border-2 transition-all ${
                      (accentColor || profile?.accent_color) === color.value
                        ? 'border-foreground scale-110 shadow-lg'
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Custom Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={accentColor || profile?.accent_color || '#84cc16'}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-14 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={accentColor || profile?.accent_color || '#84cc16'}
                  onChange={(e) => setAccentColor(e.target.value)}
                  placeholder="#84cc16"
                  className="font-mono"
                />
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <Label>Preview</Label>
              <div
                className="rounded-xl p-4 text-white"
                style={{ backgroundColor: accentColor || profile?.accent_color || '#84cc16' }}
              >
                <p className="font-semibold">
                  {businessName || profile?.business_name || 'Your Business'}
                </p>
                <p className="text-sm opacity-90 mt-1">
                  Hi! 👋 How can I help you today?
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-muted-foreground" />
              Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium">Member Since</p>
                <p className="text-sm text-muted-foreground">
                  {user?.created_at && new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        {/* ✅ Password change */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-muted-foreground" />
              Password
            </CardTitle>
            <CardDescription>Change your account password</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 8 characters"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword">Confirm new password</Label>
              <Input
                id="confirmNewPassword"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Repeat new password"
              />
            </div>

            <Button
              type="button"
              onClick={handleChangePassword}
              disabled={changingPassword || !currentPassword || !newPassword || !confirmNewPassword}
              className="w-full"
            >
              {changingPassword ? 'Updating...' : 'Update password'}
            </Button>
          </CardContent>
        </Card>

        <Button
          onClick={handleSave}
          disabled={updateProfile.isPending}
          className="w-full gradient-primary"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </DashboardLayout>
  );
}
