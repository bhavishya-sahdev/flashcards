import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import schema from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let preferences = await db
      .select()
      .from(schema.notificationPreferences)
      .where(eq(schema.notificationPreferences.userId, session.user.id))
      .limit(1);

    // Create default preferences if none exist
    if (preferences.length === 0) {
      const newPreferences = await db
        .insert(schema.notificationPreferences)
        .values({
          userId: session.user.id,
        })
        .returning();
      preferences = newPreferences;
    }

    return NextResponse.json({ preferences: preferences[0] });
  } catch (error) {
    console.error("Error fetching notification preferences:", error);
    return NextResponse.json(
      { error: "Failed to fetch notification preferences" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      studyRemindersEnabled,
      dailyReminderTime,
      weekendReminders,
      achievementNotifications,
      streakNotifications,
      dueCardsNotifications,
      dueCardsThreshold,
      systemNotifications,
      emailNotifications,
    } = body;

    // Check if preferences exist
    const existingPreferences = await db
      .select()
      .from(schema.notificationPreferences)
      .where(eq(schema.notificationPreferences.userId, session.user.id))
      .limit(1);

    let preferences;
    if (existingPreferences.length === 0) {
      // Create new preferences
      preferences = await db
        .insert(schema.notificationPreferences)
        .values({
          userId: session.user.id,
          studyRemindersEnabled,
          dailyReminderTime,
          weekendReminders,
          achievementNotifications,
          streakNotifications,
          dueCardsNotifications,
          dueCardsThreshold,
          systemNotifications,
          emailNotifications,
        })
        .returning();
    } else {
      // Update existing preferences
      preferences = await db
        .update(schema.notificationPreferences)
        .set({
          studyRemindersEnabled,
          dailyReminderTime,
          weekendReminders,
          achievementNotifications,
          streakNotifications,
          dueCardsNotifications,
          dueCardsThreshold,
          systemNotifications,
          emailNotifications,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(schema.notificationPreferences.userId, session.user.id))
        .returning();
    }

    return NextResponse.json({ preferences: preferences[0] });
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    return NextResponse.json(
      { error: "Failed to update notification preferences" },
      { status: 500 }
    );
  }
}