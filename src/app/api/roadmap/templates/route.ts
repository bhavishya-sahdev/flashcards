import { auth } from "@/lib/auth";
import { db } from "@/db";
import { roadmapTemplates, roadmapTopics } from "@/db/schema/roadmaps";
import { eq, desc, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const includeTopics = searchParams.get('includeTopics') === 'true';

    // Get roadmap templates
    const whereConditions = [eq(roadmapTemplates.isPublic, true)];
    if (category) {
      whereConditions.push(eq(roadmapTemplates.category, category));
    }

    const templates = await db
      .select({
        id: roadmapTemplates.id,
        name: roadmapTemplates.name,
        description: roadmapTemplates.description,
        category: roadmapTemplates.category,
        isPublic: roadmapTemplates.isPublic,
        totalEstimatedTime: roadmapTemplates.totalEstimatedTime,
        difficultyLevel: roadmapTemplates.difficultyLevel,
        tags: roadmapTemplates.tags,
        createdAt: roadmapTemplates.createdAt,
        updatedAt: roadmapTemplates.updatedAt,
      })
      .from(roadmapTemplates)
      .where(whereConditions.length > 1 ? and(...whereConditions) : whereConditions[0])
      .orderBy(desc(roadmapTemplates.createdAt));

    if (!includeTopics) {
      return NextResponse.json({
        templates: templates.map(template => ({
          ...template,
          id: template.id.toString(),
          createdAt: new Date(template.createdAt),
          updatedAt: new Date(template.updatedAt),
          tags: template.tags || [],
          topics: [],
        }))
      });
    }

    // If includeTopics is true, fetch topics for each template
    const templatesWithTopics = await Promise.all(
      templates.map(async (template) => {
        const topics = await db
          .select()
          .from(roadmapTopics)
          .where(eq(roadmapTopics.templateId, template.id))
          .orderBy(roadmapTopics.orderIndex);

        return {
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
        };
      })
    );

    return NextResponse.json({ templates: templatesWithTopics });
  } catch (error) {
    console.error("Error fetching roadmap templates:", error);
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

    const {
      name,
      description,
      category,
      difficultyLevel,
      totalEstimatedTime,
      tags,
      topics
    } = await request.json();

    if (!name?.trim() || !description?.trim() || !category?.trim()) {
      return NextResponse.json(
        { error: "Name, description, and category are required" },
        { status: 400 }
      );
    }

    // Create the template
    const [newTemplate] = await db
      .insert(roadmapTemplates)
      .values({
        name: name.trim(),
        description: description.trim(),
        category: category.trim(),
        difficultyLevel: difficultyLevel || 'Beginner',
        totalEstimatedTime: totalEstimatedTime || null,
        tags: tags || [],
        isPublic: false, // User-created templates are private by default
      })
      .returning();

    // Create topics if provided
    if (topics && Array.isArray(topics) && topics.length > 0) {
      const topicsToInsert = topics.map((topic, index) => ({
        templateId: newTemplate.id,
        name: topic.name,
        description: topic.description,
        difficulty: topic.difficulty || 'Beginner',
        estimatedTimeHours: topic.estimatedTimeHours || 8,
        orderIndex: index,
        subtopics: topic.subtopics || [],
        practiceProblemsCount: topic.practiceProblemsCount || 0,
        keyLearningPoints: topic.keyLearningPoints || [],
        prerequisiteTopicIds: topic.prerequisiteTopicIds || [],
        linkedFolderId: topic.linkedFolderId ? parseInt(topic.linkedFolderId) : null,
      }));

      await db.insert(roadmapTopics).values(topicsToInsert);
    }

    return NextResponse.json({
      template: {
        id: newTemplate.id.toString(),
        name: newTemplate.name,
        description: newTemplate.description,
        category: newTemplate.category,
        isPublic: newTemplate.isPublic,
        totalEstimatedTime: newTemplate.totalEstimatedTime,
        difficultyLevel: newTemplate.difficultyLevel,
        tags: newTemplate.tags || [],
        createdAt: new Date(newTemplate.createdAt),
        updatedAt: new Date(newTemplate.updatedAt),
      }
    });
  } catch (error) {
    console.error("Error creating roadmap template:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}