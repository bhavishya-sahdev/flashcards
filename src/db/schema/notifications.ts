import {
  pgTable,
  text,
  integer,
  timestamp,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./user";

export const notifications = pgTable("notifications", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // "study_reminder", "achievement", "streak_broken", "cards_due", "streak_milestone"
  title: text("title").notNull(),
  message: text("message").notNull(),
  read: boolean("read").notNull().default(false),
  actionUrl: text("action_url"), // Optional URL to navigate to when clicked
  metadata: jsonb("metadata"), // Additional data like flashcard counts, folder info, etc.
  priority: text("priority").notNull().default("normal"), // "low", "normal", "high", "urgent"
  category: text("category").notNull().default("general"), // "study", "achievement", "system", "reminder"
  expiresAt: timestamp("expires_at", { mode: "date" }), // Optional expiration for time-sensitive notifications
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
});

export const notificationPreferences = pgTable("notification_preferences", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" })
    .unique(),
  
  // Study Reminders
  studyRemindersEnabled: boolean("study_reminders_enabled").notNull().default(true),
  dailyReminderTime: text("daily_reminder_time").default("09:00"), // Format: "HH:MM"
  weekendReminders: boolean("weekend_reminders").notNull().default(false),
  
  // Achievement Notifications
  achievementNotifications: boolean("achievement_notifications").notNull().default(true),
  streakNotifications: boolean("streak_notifications").notNull().default(true),
  
  // Due Cards Notifications
  dueCardsNotifications: boolean("due_cards_notifications").notNull().default(true),
  dueCardsThreshold: integer("due_cards_threshold").notNull().default(5), // Notify when X+ cards are due
  
  // System Notifications
  systemNotifications: boolean("system_notifications").notNull().default(true),
  
  // Email Notifications (for future use)
  emailNotifications: boolean("email_notifications").notNull().default(false),
  
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
});

// Relations
export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(user, {
    fields: [notifications.userId],
    references: [user.id],
  }),
}));

export const notificationPreferencesRelations = relations(
  notificationPreferences,
  ({ one }) => ({
    user: one(user, {
      fields: [notificationPreferences.userId],
      references: [user.id],
    }),
  })
);