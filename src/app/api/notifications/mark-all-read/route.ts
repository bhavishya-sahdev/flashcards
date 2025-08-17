import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import schema from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updatedNotifications = await db
      .update(schema.notifications)
      .set({
        read: true,
        updatedAt: new Date().toISOString(),
      })
      .where(
        and(
          eq(schema.notifications.userId, session.user.id),
          eq(schema.notifications.read, false)
        )
      )
      .returning();

    return NextResponse.json({ 
      success: true, 
      updatedCount: updatedNotifications.length 
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return NextResponse.json(
      { error: "Failed to mark notifications as read" },
      { status: 500 }
    );
  }
}