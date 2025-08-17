import { auth } from "@/lib/auth";
import { db } from "@/db";
import { 
  userRoadmaps, 
  roadmapTemplates, 
  roadmapTopics, 
  userTopicProgress 
} from "@/db/schema/roadmaps";
import { eq, desc, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's roadmaps with templates
    const userRoadmapData = await db
      .select({
        userRoadmap: userRoadmaps,
        template: roadmapTemplates,
      })
      .from(userRoadmaps)
      .leftJoin(roadmapTemplates, eq(userRoadmaps.templateId, roadmapTemplates.id))
      .where(eq(userRoadmaps.userId, session.user.id))
      .orderBy(desc(userRoadmaps.lastAccessedAt));

    // Get progress for each roadmap
    const roadmapsWithProgress = await Promise.all(
      userRoadmapData.map(async ({ userRoadmap, template }) => {
        if (!template) return null;

        // Get template topics
        const topics = await db
          .select()
          .from(roadmapTopics)
          .where(eq(roadmapTopics.templateId, template.id))
          .orderBy(roadmapTopics.orderIndex);

        // Get user progress for these topics
        const progress = await db
          .select()
          .from(userTopicProgress)
          .where(eq(userTopicProgress.userRoadmapId, userRoadmap.id));

        const progressMap = new Map(progress.map(p => [p.topicId, p]));

        const topicProgress = topics.map(topic => {
          const userProgress = progressMap.get(topic.id);
          return {
            id: userProgress?.id.toString() || '',
            userId: session.user.id,
            userRoadmapId: userRoadmap.id.toString(),
            topicId: topic.id.toString(),
            status: userProgress?.status || 'locked',
            progressPercentage: userProgress?.progressPercentage || 0,
            timeSpent: userProgress?.timeSpent || 0,
            startedAt: userProgress?.startedAt ? new Date(userProgress.startedAt) : undefined,
            completedAt: userProgress?.completedAt ? new Date(userProgress.completedAt) : undefined,
            lastStudiedAt: userProgress?.lastStudiedAt ? new Date(userProgress.lastStudiedAt) : undefined,
            userNotes: userProgress?.userNotes || undefined,
            isBookmarked: userProgress?.isBookmarked || false,
            practiceProblemsCompleted: userProgress?.practiceProblemsCompleted || 0,
            averageScore: userProgress?.averageScore || undefined,
            createdAt: userProgress?.createdAt ? new Date(userProgress.createdAt) : new Date(),
            updatedAt: userProgress?.updatedAt ? new Date(userProgress.updatedAt) : new Date(),
            topic: {
              ...topic,
              id: topic.id.toString(),
              templateId: topic.templateId.toString(),
              linkedFolderId: topic.linkedFolderId?.toString(),
              createdAt: new Date(topic.createdAt),
              updatedAt: new Date(topic.updatedAt),
              subtopics: topic.subtopics || [],
              keyLearningPoints: topic.keyLearningPoints || [],
              prerequisiteTopicIds: (topic.prerequisiteTopicIds || []).map(id => id.toString()),
            }
          };
        });

        return {
          ...userRoadmap,
          id: userRoadmap.id.toString(),
          templateId: userRoadmap.templateId.toString(),
          startedAt: userRoadmap.startedAt ? new Date(userRoadmap.startedAt) : undefined,
          targetCompletionDate: userRoadmap.targetCompletionDate ? new Date(userRoadmap.targetCompletionDate) : undefined,
          lastAccessedAt: userRoadmap.lastAccessedAt ? new Date(userRoadmap.lastAccessedAt) : new Date(),
          createdAt: new Date(userRoadmap.createdAt),
          updatedAt: new Date(userRoadmap.updatedAt),
          template: {
            ...template,
            id: template.id.toString(),
            createdAt: new Date(template.createdAt),
            updatedAt: new Date(template.updatedAt),
            tags: template.tags || [],
            topics: topics.map(topic => ({
              ...topic,
              id: topic.id.toString(),
              templateId: topic.templateId.toString(),
              linkedFolderId: topic.linkedFolderId?.toString(),
              createdAt: new Date(topic.createdAt),
              updatedAt: new Date(topic.updatedAt),
              subtopics: topic.subtopics || [],
              keyLearningPoints: topic.keyLearningPoints || [],
              prerequisiteTopicIds: (topic.prerequisiteTopicIds || []).map(id => id.toString()),
            }))
          },
          topicProgress
        };
      })
    );

    const validRoadmaps = roadmapsWithProgress.filter(Boolean);

    return NextResponse.json({ userRoadmaps: validRoadmaps });
  } catch (error) {
    console.error("Error fetching user roadmaps:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { templateId, customName, customDescription, targetCompletionDate } = await request.json();

    if (!templateId) {
      return NextResponse.json(
        { error: "Template ID is required" },
        { status: 400 }
      );
    }

    // Check if template exists
    const [template] = await db
      .select()
      .from(roadmapTemplates)
      .where(eq(roadmapTemplates.id, parseInt(templateId)));

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    // Check if user already has this roadmap
    const [existingRoadmap] = await db
      .select()
      .from(userRoadmaps)
      .where(and(
        eq(userRoadmaps.userId, session.user.id),
        eq(userRoadmaps.templateId, parseInt(templateId))
      ));

    if (existingRoadmap) {
      return NextResponse.json(
        { error: "You already have this roadmap" },
        { status: 400 }
      );
    }

    // Create user roadmap
    const [newUserRoadmap] = await db
      .insert(userRoadmaps)
      .values({
        userId: session.user.id,
        templateId: parseInt(templateId),
        isCustomized: !!(customName || customDescription),
        customName: customName || null,
        customDescription: customDescription || null,
        targetCompletionDate: targetCompletionDate ? new Date(targetCompletionDate).toISOString() : null,
      })
      .returning();

    // Get template topics to initialize progress
    const topics = await db
      .select()
      .from(roadmapTopics)
      .where(eq(roadmapTopics.templateId, parseInt(templateId)))
      .orderBy(roadmapTopics.orderIndex);

    // Initialize progress for all topics
    if (topics.length > 0) {
      const progressEntries = topics.map((topic, index) => {
        // First topic (index 0) is available, rest are locked
        // Topics with no prerequisites are also available
        const hasNoPrereqs = !topic.prerequisiteTopicIds || topic.prerequisiteTopicIds.length === 0;
        const isFirstTopic = index === 0;
        
        return {
          userId: session.user.id,
          userRoadmapId: newUserRoadmap.id,
          topicId: topic.id,
          status: (isFirstTopic || hasNoPrereqs) ? 'available' : 'locked',
          progressPercentage: 0,
          timeSpent: 0,
          practiceProblemsCompleted: 0,
          isBookmarked: false,
        };
      });

      await db.insert(userTopicProgress).values(progressEntries);
    }

    return NextResponse.json({
      userRoadmap: {
        id: newUserRoadmap.id.toString(),
        userId: newUserRoadmap.userId,
        templateId: newUserRoadmap.templateId.toString(),
        isCustomized: newUserRoadmap.isCustomized,
        customName: newUserRoadmap.customName,
        customDescription: newUserRoadmap.customDescription,
        isActive: newUserRoadmap.isActive,
        startedAt: newUserRoadmap.startedAt ? new Date(newUserRoadmap.startedAt) : undefined,
        targetCompletionDate: newUserRoadmap.targetCompletionDate ? new Date(newUserRoadmap.targetCompletionDate) : undefined,
        totalTimeSpent: newUserRoadmap.totalTimeSpent,
        lastAccessedAt: newUserRoadmap.lastAccessedAt ? new Date(newUserRoadmap.lastAccessedAt) : new Date(),
        createdAt: new Date(newUserRoadmap.createdAt),
        updatedAt: new Date(newUserRoadmap.updatedAt),
      }
    });
  } catch (error) {
    console.error("Error creating user roadmap:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}