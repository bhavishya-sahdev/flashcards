"use client";

import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface NotificationPreferences {
  id?: number;
  userId: string;
  studyRemindersEnabled: boolean;
  dailyReminderTime: string;
  weekendReminders: boolean;
  achievementNotifications: boolean;
  streakNotifications: boolean;
  dueCardsNotifications: boolean;
  dueCardsThreshold: number;
  systemNotifications: boolean;
  emailNotifications: boolean;
}

export function NotificationSettings() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await fetch("/api/notifications/preferences");
      if (response.ok) {
        const data = await response.json();
        setPreferences(data.preferences);
      }
    } catch (error) {
      console.error("Error fetching preferences:", error);
      toast.error("Failed to load notification preferences");
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!preferences) return;

    setSaving(true);
    try {
      const response = await fetch("/api/notifications/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        toast.success("Notification preferences saved");
      } else {
        toast.error("Failed to save preferences");
      }
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = (key: keyof NotificationPreferences, value: any) => {
    if (!preferences) return;
    setPreferences({ ...preferences, [key]: value });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="h-32 bg-gray-200 rounded animate-pulse" />
        <div className="h-32 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Failed to load notification preferences</p>
        <Button onClick={fetchPreferences} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Notification Settings</h2>
        <p className="text-muted-foreground">
          Customize when and how you receive notifications
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Study Reminders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Daily study reminders</Label>
              <p className="text-sm text-muted-foreground">
                Get reminded to study at a specific time each day
              </p>
            </div>
            <Switch
              checked={preferences.studyRemindersEnabled}
              onCheckedChange={(checked) =>
                updatePreference("studyRemindersEnabled", checked)
              }
            />
          </div>

          {preferences.studyRemindersEnabled && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="reminderTime">Reminder time</Label>
                <Input
                  id="reminderTime"
                  type="time"
                  value={preferences.dailyReminderTime}
                  onChange={(e) =>
                    updatePreference("dailyReminderTime", e.target.value)
                  }
                  className="w-40"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Weekend reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Include weekends in your daily reminders
                  </p>
                </div>
                <Switch
                  checked={preferences.weekendReminders}
                  onCheckedChange={(checked) =>
                    updatePreference("weekendReminders", checked)
                  }
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Achievement Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Achievement notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when you unlock achievements
              </p>
            </div>
            <Switch
              checked={preferences.achievementNotifications}
              onCheckedChange={(checked) =>
                updatePreference("achievementNotifications", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Streak notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get notified about your study streaks and milestones
              </p>
            </div>
            <Switch
              checked={preferences.streakNotifications}
              onCheckedChange={(checked) =>
                updatePreference("streakNotifications", checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Due Cards</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Due cards notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when you have cards to review
              </p>
            </div>
            <Switch
              checked={preferences.dueCardsNotifications}
              onCheckedChange={(checked) =>
                updatePreference("dueCardsNotifications", checked)
              }
            />
          </div>

          {preferences.dueCardsNotifications && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="threshold">Notification threshold</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="threshold"
                    type="number"
                    min="1"
                    max="100"
                    value={preferences.dueCardsThreshold}
                    onChange={(e) =>
                      updatePreference("dueCardsThreshold", parseInt(e.target.value) || 1)
                    }
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">
                    cards due before notification
                  </span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>System notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get notified about app updates and important announcements
              </p>
            </div>
            <Switch
              checked={preferences.systemNotifications}
              onCheckedChange={(checked) =>
                updatePreference("systemNotifications", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email (coming soon)
              </p>
            </div>
            <Switch
              checked={preferences.emailNotifications}
              onCheckedChange={(checked) =>
                updatePreference("emailNotifications", checked)
              }
              disabled
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={savePreferences} disabled={saving}>
          {saving ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </div>
  );
}