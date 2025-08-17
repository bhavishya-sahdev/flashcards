import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { 
  createNotification, 
  notifyAchievement, 
  notifyStreakMilestone,
  notifyDueCards,
  notifyStudyReminder 
} from "@/lib/notifications";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type } = await request.json();

    switch (type) {
      case "basic":
        await createNotification({
          userId: session.user.id,
          type: "test",
          title: "Test Notification",
          message: "This is a test notification to verify the system is working!",
          priority: "normal",
          category: "system",
        });
        break;

      case "achievement":
        await notifyAchievement(
          session.user.id,
          "Test Achievement",
          "You've successfully tested the notification system!",
          { test: true }
        );
        break;

      case "streak":
        await notifyStreakMilestone(session.user.id, 7);
        break;

      case "due-cards":
        await notifyDueCards(session.user.id, 10, "Test Folder");
        break;

      case "study-reminder":
        await notifyStudyReminder(session.user.id, 5);
        break;

      default:
        return NextResponse.json(
          { error: "Invalid test type" },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true, message: "Test notification sent!" });
  } catch (error) {
    console.error("Error sending test notification:", error);
    return NextResponse.json(
      { error: "Failed to send test notification" },
      { status: 500 }
    );
  }
}