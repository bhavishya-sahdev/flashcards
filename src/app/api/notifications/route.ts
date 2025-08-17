import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import schema from "@/db/schema";
import { eq, desc, and, lte, gte, or, isNull } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const baseCondition = eq(schema.notifications.userId, session.user.id);
    
    let whereConditions;
    if (unreadOnly) {
      whereConditions = and(
        baseCondition,
        eq(schema.notifications.read, false)
      );
    } else {
      whereConditions = baseCondition;
    }

    // Filter out expired notifications (only include non-expired ones)
    // Include notifications that have no expiry date or haven't expired yet
    const now = new Date();
    const finalConditions = and(
      whereConditions,
      or(
        isNull(schema.notifications.expiresAt),
        gte(schema.notifications.expiresAt, now)
      )
    );

    const notifications = await db
      .select()
      .from(schema.notifications)
      .where(finalConditions)
      .orderBy(desc(schema.notifications.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, title, message, actionUrl, metadata, priority, category, expiresAt } = body;

    if (!type || !title || !message) {
      return NextResponse.json(
        { error: "Missing required fields: type, title, message" },
        { status: 400 }
      );
    }

    const notification = await db
      .insert(schema.notifications)
      .values({
        userId: session.user.id,
        type,
        title,
        message,
        actionUrl,
        metadata,
        priority: priority || "normal",
        category: category || "general",
        expiresAt,
      })
      .returning();

    return NextResponse.json({ notification: notification[0] });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}