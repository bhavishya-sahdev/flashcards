import { db } from "@/db";
import schema from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";

export interface CreateNotificationParams {
  userId: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: any;
  priority?: "low" | "normal" | "high" | "urgent";
  category?: string;
  expiresAt?: string;
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    const notification = await db
      .insert(schema.notifications)
      .values({
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        actionUrl: params.actionUrl,
        metadata: params.metadata,
        priority: params.priority || "normal",
        category: params.category || "general",
        expiresAt: params.expiresAt ? new Date(params.expiresAt) : undefined,
      })
      .returning();

    return notification[0];
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
}

export async function getNotificationPreferences(userId: string) {
  try {
    let preferences = await db
      .select()
      .from(schema.notificationPreferences)
      .where(eq(schema.notificationPreferences.userId, userId))
      .limit(1);

    // Create default preferences if none exist
    if (preferences.length === 0) {
      const newPreferences = await db
        .insert(schema.notificationPreferences)
        .values({ userId })
        .returning();
      preferences = newPreferences;
    }

    return preferences[0];
  } catch (error) {
    console.error("Error getting notification preferences:", error);
    throw error;
  }
}

// Notification helpers for specific events
export async function notifyStudyReminder(userId: string, dueCardsCount: number) {
  const preferences = await getNotificationPreferences(userId);
  
  if (!preferences.studyRemindersEnabled) return;

  await createNotification({
    userId,
    type: "study_reminder",
    title: "Time to study!",
    message: `You have ${dueCardsCount} cards ready for review.`,
    actionUrl: "/study",
    category: "reminder",
    priority: "normal",
    metadata: { dueCardsCount },
  });
}

export async function notifyDueCards(userId: string, dueCardsCount: number, folderName?: string) {
  const preferences = await getNotificationPreferences(userId);
  
  if (!preferences.dueCardsNotifications || dueCardsCount < preferences.dueCardsThreshold) {
    return;
  }

  const message = folderName 
    ? `You have ${dueCardsCount} cards due in "${folderName}"`
    : `You have ${dueCardsCount} cards ready for review`;

  await createNotification({
    userId,
    type: "cards_due",
    title: "Cards ready for review",
    message,
    actionUrl: folderName ? `/folders/${folderName}` : "/study",
    category: "study",
    priority: dueCardsCount >= 20 ? "high" : "normal",
    metadata: { dueCardsCount, folderName },
  });
}

export async function notifyStreakMilestone(userId: string, streakCount: number) {
  const preferences = await getNotificationPreferences(userId);
  
  if (!preferences.streakNotifications) return;

  const milestones = [7, 14, 30, 50, 100, 200, 365];
  if (!milestones.includes(streakCount)) return;

  let title, message;
  if (streakCount === 7) {
    title = "Week streak! 🔥";
    message = "Amazing! You've studied for 7 days straight!";
  } else if (streakCount === 30) {
    title = "Month streak! 🚀";
    message = "Incredible! 30 days of consistent studying!";
  } else if (streakCount === 365) {
    title = "Year streak! 🏆";
    message = "Legendary! A full year of dedication!";
  } else {
    title = `${streakCount}-day streak! 🔥`;
    message = `Keep it up! You've studied for ${streakCount} days in a row!`;
  }

  await createNotification({
    userId,
    type: "streak_milestone",
    title,
    message,
    actionUrl: "/analytics",
    category: "achievement",
    priority: "high",
    metadata: { streakCount, milestone: true },
  });
}

export async function notifyStreakBroken(userId: string, streakCount: number) {
  const preferences = await getNotificationPreferences(userId);
  
  if (!preferences.streakNotifications || streakCount < 3) return;

  await createNotification({
    userId,
    type: "streak_broken",
    title: "Streak broken 💔",
    message: `Your ${streakCount}-day streak has ended. Don't give up!`,
    actionUrl: "/study",
    category: "reminder",
    priority: "normal",
    metadata: { previousStreak: streakCount },
  });
}

export async function notifyAchievement(
  userId: string, 
  achievementName: string, 
  description: string,
  metadata?: any
) {
  const preferences = await getNotificationPreferences(userId);
  
  if (!preferences.achievementNotifications) return;

  await createNotification({
    userId,
    type: "achievement",
    title: `Achievement unlocked: ${achievementName}`,
    message: description,
    actionUrl: "/achievements",
    category: "achievement",
    priority: "high",
    metadata: { achievementName, ...metadata },
  });
}

export async function notifySystemMessage(
  userId: string,
  title: string,
  message: string,
  priority: "low" | "normal" | "high" | "urgent" = "normal",
  actionUrl?: string
) {
  const preferences = await getNotificationPreferences(userId);
  
  if (!preferences.systemNotifications) return;

  await createNotification({
    userId,
    type: "system",
    title,
    message,
    actionUrl,
    category: "system",
    priority,
  });
}

// Cleanup expired notifications
export async function cleanupExpiredNotifications() {
  try {
    const now = new Date();
    await db
      .delete(schema.notifications)
      .where(lte(schema.notifications.expiresAt, now));
  } catch (error) {
    console.error("Error cleaning up expired notifications:", error);
  }
}