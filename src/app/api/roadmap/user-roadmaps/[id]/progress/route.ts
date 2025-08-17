import { auth } from "@/lib/auth";
import { db } from "@/db";
import { 
  userTopicProgress, 
  userRoadmaps,
  roadmapTopics
} from "@/db/schema/roadmaps";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const userRoadmapId = parseInt(resolvedParams.id);
    if (isNaN(userRoadmapId)) {
      return NextResponse.json(
        { error: "Invalid roadmap ID" },
        { status: 400 }
      );
    }

    const {
      topicId,
      status,
      progressPercentage,
      timeSpent,
      userNotes,
      isBookmarked,
      practiceProblemsCompleted,
      averageScore
    } = await request.json();

    if (!topicId) {
      return NextResponse.json(
        { error: "Topic ID is required" },
        { status: 400 }
      );
    }

    // Verify the roadmap belongs to the user
    const [roadmap] = await db
      .select()
      .from(userRoadmaps)
      .where(and(
        eq(userRoadmaps.id, userRoadmapId),
        eq(userRoadmaps.userId, session.user.id)
      ));

    if (!roadmap) {
      return NextResponse.json(
        { error: "Roadmap not found or unauthorized" },
        { status: 404 }
      );
    }

    // Get current progress
    const [currentProgress] = await db
      .select()
      .from(userTopicProgress)
      .where(and(
        eq(userTopicProgress.userRoadmapId, userRoadmapId),
        eq(userTopicProgress.topicId, parseInt(topicId))
      ));

    if (!currentProgress) {
      return NextResponse.json(
        { error: "Topic progress not found" },
        { status: 404 }
      );
    }

    // Update the progress
    const updateData: any = {};
    
    if (status !== undefined) {
      updateData.status = status;
      
      // Set timestamps based on status changes
      if (status === 'in_progress' && currentProgress.status !== 'in_progress') {
        updateData.startedAt = new Date().toISOString();
        updateData.lastStudiedAt = new Date().toISOString();
      } else if (status === 'completed' && currentProgress.status !== 'completed') {
        updateData.completedAt = new Date().toISOString();
        updateData.lastStudiedAt = new Date().toISOString();
        updateData.progressPercentage = 100;
      } else if (status === 'in_progress') {
        updateData.lastStudiedAt = new Date().toISOString();
      }
    }

    if (progressPercentage !== undefined) {
      updateData.progressPercentage = Math.min(100, Math.max(0, progressPercentage));
    }
    
    if (timeSpent !== undefined) {
      updateData.timeSpent = Math.max(0, timeSpent);
    }
    
    if (userNotes !== undefined) {
      updateData.userNotes = userNotes;
    }
    
    if (isBookmarked !== undefined) {
      updateData.isBookmarked = isBookmarked;
    }
    
    if (practiceProblemsCompleted !== undefined) {
      updateData.practiceProblemsCompleted = Math.max(0, practiceProblemsCompleted);
    }
    
    if (averageScore !== undefined) {
      updateData.averageScore = averageScore;
    }

    const [updatedProgress] = await db
      .update(userTopicProgress)
      .set(updateData)
      .where(and(
        eq(userTopicProgress.userRoadmapId, userRoadmapId),
        eq(userTopicProgress.topicId, parseInt(topicId))
      ))
      .returning();

    // If topic was completed, unlock next topics
    if (status === 'completed') {
      // Get the completed topic to find what topics it unlocks
      const [completedTopic] = await db
        .select()
        .from(roadmapTopics)
        .where(eq(roadmapTopics.id, parseInt(topicId)));

      if (completedTopic) {
        // Find topics that have this topic as a prerequisite
        const topicsToUnlock = await db
          .select()
          .from(roadmapTopics)
          .where(eq(roadmapTopics.templateId, completedTopic.templateId));

        // Check each topic to see if all its prerequisites are now met
        for (const topic of topicsToUnlock) {
          if (topic.prerequisiteTopicIds && topic.prerequisiteTopicIds.includes(completedTopic.id)) {
            // Check if all prerequisites for this topic are completed
            const prerequisiteProgresses = await db
              .select()
              .from(userTopicProgress)
              .where(and(
                eq(userTopicProgress.userRoadmapId, userRoadmapId)
              ));

            const progressMap = new Map(prerequisiteProgresses.map(p => [p.topicId, p.status]));
            
            const allPrerequisitesMet = topic.prerequisiteTopicIds.every(prereqId => 
              progressMap.get(prereqId) === 'completed'
            );

            if (allPrerequisitesMet) {
              // Check if topic is currently locked
              const [topicProgress] = await db
                .select()
                .from(userTopicProgress)
                .where(and(
                  eq(userTopicProgress.userRoadmapId, userRoadmapId),
                  eq(userTopicProgress.topicId, topic.id)
                ));

              if (topicProgress && topicProgress.status === 'locked') {
                await db
                  .update(userTopicProgress)
                  .set({ status: 'available' })
                  .where(and(
                    eq(userTopicProgress.userRoadmapId, userRoadmapId),
                    eq(userTopicProgress.topicId, topic.id)
                  ));
              }
            }
          }
        }
      }
    }

    // Update the roadmap's last accessed time
    await db
      .update(userRoadmaps)
      .set({ lastAccessedAt: new Date().toISOString() })
      .where(eq(userRoadmaps.id, userRoadmapId));

    return NextResponse.json({
      progress: {
        ...updatedProgress,
        id: updatedProgress.id.toString(),
        userRoadmapId: updatedProgress.userRoadmapId.toString(),
        topicId: updatedProgress.topicId.toString(),
        startedAt: updatedProgress.startedAt ? new Date(updatedProgress.startedAt) : undefined,
        completedAt: updatedProgress.completedAt ? new Date(updatedProgress.completedAt) : undefined,
        lastStudiedAt: updatedProgress.lastStudiedAt ? new Date(updatedProgress.lastStudiedAt) : undefined,
        createdAt: new Date(updatedProgress.createdAt),
        updatedAt: new Date(updatedProgress.updatedAt),
      }
    });
  } catch (error) {
    console.error("Error updating topic progress:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}