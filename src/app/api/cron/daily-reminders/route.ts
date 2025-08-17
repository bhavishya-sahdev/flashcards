import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import schema from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { notifyStudyReminder, cleanupExpiredNotifications } from "@/lib/notifications";

// This endpoint would be called by a cron job (e.g., Vercel Cron, GitHub Actions, etc.)
// It should be protected by an API key or webhook secret in production
export async function POST(request: NextRequest) {
  try {
    // Verify authorization (in production, check for API key or webhook secret)
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Running daily notification job...");

    // Clean up expired notifications first
    await cleanupExpiredNotifications();

    // Get current time info
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    const isWeekend = now.getDay() === 0 || now.getDay() === 6; // Sunday = 0, Saturday = 6

    // Get users who should receive study reminders at this time
    const usersToNotify = await db
      .select({
        userId: schema.notificationPreferences.userId,
        dailyReminderTime: schema.notificationPreferences.dailyReminderTime,
        weekendReminders: schema.notificationPreferences.weekendReminders,
      })
      .from(schema.notificationPreferences)
      .where(
        and(
          eq(schema.notificationPreferences.studyRemindersEnabled, true),
          eq(schema.notificationPreferences.dailyReminderTime, currentTime),
          // Include weekend logic
          isWeekend 
            ? eq(schema.notificationPreferences.weekendReminders, true)
            : eq(schema.notificationPreferences.weekendReminders, true) // Always include weekday users
        )
      );

    console.log(`Found ${usersToNotify.length} users to notify at ${currentTime}`);

    let notificationsSent = 0;
    let errors = 0;

    for (const user of usersToNotify) {
      try {
        // Get user's due cards count
        const dueCards = await db
          .select({
            id: schema.flashcards.id,
            nextReviewDate: schema.flashcards.nextReviewDate,
          })
          .from(schema.flashcards)
          .leftJoin(
            schema.flashcardFolders,
            eq(schema.flashcards.folderId, schema.flashcardFolders.id)
          )
          .where(
            and(
              eq(schema.flashcardFolders.ownerId, user.userId),
              lte(schema.flashcards.nextReviewDate, now.toISOString())
            )
          );

        if (dueCards.length > 0) {
          await notifyStudyReminder(user.userId, dueCards.length);
          notificationsSent++;
          console.log(`Sent reminder to user ${user.userId} (${dueCards.length} due cards)`);
        }
      } catch (error) {
        console.error(`Error sending notification to user ${user.userId}:`, error);
        errors++;
      }
    }

    console.log(`Daily reminder job completed. Sent: ${notificationsSent}, Errors: ${errors}`);

    return NextResponse.json({
      success: true,
      notificationsSent,
      errors,
      processedUsers: usersToNotify.length,
    });
  } catch (error) {
    console.error("Error in daily reminder job:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}