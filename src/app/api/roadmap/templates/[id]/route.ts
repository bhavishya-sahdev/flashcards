import { auth } from "@/lib/auth";
import { db } from "@/db";
import { roadmapTemplates, roadmapTopics } from "@/db/schema/roadmaps";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const templateId = parseInt(resolvedParams.id);
    
    if (isNaN(templateId)) {
      return NextResponse.json(
        { error: "Invalid template ID" },
        { status: 400 }
      );
    }

    // Get template
    const [template] = await db
      .select()
      .from(roadmapTemplates)
      .where(eq(roadmapTemplates.id, templateId));

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    // Get topics for this template
    const topics = await db
      .select()
      .from(roadmapTopics)
      .where(eq(roadmapTopics.templateId, templateId))
      .orderBy(roadmapTopics.orderIndex);

    const templateWithTopics = {
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

    return NextResponse.json({ template: templateWithTopics });
  } catch (error) {
    console.error("Error fetching roadmap template:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}