import { auth } from "@/lib/auth";
import { db } from "@/db";
import { 
  roadmapTemplates, 
  roadmapTopics,
  userRoadmaps,
  userTopicProgress
} from "@/db/schema/roadmaps";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

const DSA_TEMPLATE = {
  name: "DSA Fundamentals",
  description: "Master Data Structures & Algorithms step by step with hands-on practice",
  category: "programming",
  difficultyLevel: "Beginner",
  totalEstimatedTime: 200, // hours
  tags: ["algorithms", "data-structures", "coding-interview", "computer-science"],
  topics: [
    {
      name: "Arrays & Strings",
      description: "Master the fundamentals of linear data structures",
      difficulty: "Beginner",
      estimatedTimeHours: 20,
      orderIndex: 0,
      subtopics: ["Array manipulation", "Two pointers", "Sliding window", "String algorithms"],
      practiceProblemsCount: 25,
      keyLearningPoints: [
        "Array indexing and traversal",
        "Two-pointer technique for optimization",
        "Sliding window for subarray problems",
        "String manipulation and pattern matching"
      ],
      prerequisiteTopicIds: [],
    },
    {
      name: "Linked Lists",
      description: "Understanding pointer-based data structures",
      difficulty: "Beginner",
      estimatedTimeHours: 15,
      orderIndex: 1,
      subtopics: ["Singly linked lists", "Doubly linked lists", "Circular lists", "List operations"],
      practiceProblemsCount: 20,
      keyLearningPoints: [
        "Pointer manipulation and traversal",
        "Insertion and deletion operations",
        "Cycle detection algorithms",
        "Merging and reversing techniques"
      ],
      prerequisiteTopicIds: [],
    },
    {
      name: "Stacks & Queues",
      description: "LIFO and FIFO data structures and applications",
      difficulty: "Beginner",
      estimatedTimeHours: 12,
      orderIndex: 2,
      subtopics: ["Stack operations", "Queue operations", "Priority queues", "Deque"],
      practiceProblemsCount: 18,
      keyLearningPoints: [
        "Stack-based algorithm design",
        "Queue applications in BFS",
        "Priority queue operations",
        "Expression evaluation and parsing"
      ],
      prerequisiteTopicIds: [], // Will be set to linked lists after creation
    },
    {
      name: "Trees & BST",
      description: "Hierarchical data structures and tree algorithms",
      difficulty: "Intermediate",
      estimatedTimeHours: 30,
      orderIndex: 3,
      subtopics: ["Binary trees", "BST operations", "Tree traversal", "Tree construction"],
      practiceProblemsCount: 30,
      keyLearningPoints: [
        "Tree traversal algorithms (DFS, BFS)",
        "Binary search tree properties",
        "Tree construction and validation",
        "Balanced tree concepts"
      ],
      prerequisiteTopicIds: [], // Will be set to stacks & queues after creation
    },
    {
      name: "Heaps",
      description: "Priority queue implementation and heap algorithms",
      difficulty: "Intermediate",
      estimatedTimeHours: 12,
      orderIndex: 4,
      subtopics: ["Min/Max heaps", "Heap operations", "Heapify", "Heap sort"],
      practiceProblemsCount: 15,
      keyLearningPoints: [
        "Heap property and maintenance",
        "Efficient priority queue operations",
        "Heap sort algorithm",
        "K-way merge applications"
      ],
      prerequisiteTopicIds: [], // Will be set to trees after creation
    },
    {
      name: "Graphs",
      description: "Graph theory, traversal, and advanced algorithms",
      difficulty: "Advanced",
      estimatedTimeHours: 40,
      orderIndex: 5,
      subtopics: ["Graph representation", "DFS/BFS", "Shortest paths", "MST"],
      practiceProblemsCount: 35,
      keyLearningPoints: [
        "Graph representation techniques",
        "Depth-first and breadth-first search",
        "Shortest path algorithms (Dijkstra, Floyd-Warshall)",
        "Minimum spanning tree algorithms"
      ],
      prerequisiteTopicIds: [], // Will be set to heaps after creation
    },
    {
      name: "Dynamic Programming",
      description: "Optimization technique for overlapping subproblems",
      difficulty: "Advanced",
      estimatedTimeHours: 50,
      orderIndex: 6,
      subtopics: ["Memoization", "Tabulation", "Common patterns", "Optimization"],
      practiceProblemsCount: 40,
      keyLearningPoints: [
        "Identifying optimal substructure",
        "Memoization vs tabulation approaches",
        "Classic DP patterns and problems",
        "Space optimization techniques"
      ],
      prerequisiteTopicIds: [], // Will be set to graphs after creation
    },
    {
      name: "Advanced Topics",
      description: "Complex algorithms and data structures",
      difficulty: "Advanced",
      estimatedTimeHours: 60,
      orderIndex: 7,
      subtopics: ["Trie", "Segment trees", "Union find", "Advanced algorithms"],
      practiceProblemsCount: 50,
      keyLearningPoints: [
        "Trie data structure for string processing",
        "Segment trees for range queries",
        "Union-find for connectivity problems",
        "Advanced algorithmic techniques"
      ],
      prerequisiteTopicIds: [], // Will be set to dynamic programming after creation
    }
  ]
};

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if DSA template already exists
    const [existingTemplate] = await db
      .select()
      .from(roadmapTemplates)
      .where(eq(roadmapTemplates.name, DSA_TEMPLATE.name));

    let templateId: number;

    if (existingTemplate) {
      templateId = existingTemplate.id;
    } else {
      // Create the DSA template
      const [newTemplate] = await db
        .insert(roadmapTemplates)
        .values({
          name: DSA_TEMPLATE.name,
          description: DSA_TEMPLATE.description,
          category: DSA_TEMPLATE.category,
          difficultyLevel: DSA_TEMPLATE.difficultyLevel,
          totalEstimatedTime: DSA_TEMPLATE.totalEstimatedTime,
          tags: DSA_TEMPLATE.tags,
          isPublic: true,
        })
        .returning();

      templateId = newTemplate.id;

      // Create topics
      const createdTopics = [];
      for (const topicData of DSA_TEMPLATE.topics) {
        const [topic] = await db
          .insert(roadmapTopics)
          .values({
            templateId,
            name: topicData.name,
            description: topicData.description,
            difficulty: topicData.difficulty,
            estimatedTimeHours: topicData.estimatedTimeHours,
            orderIndex: topicData.orderIndex,
            subtopics: topicData.subtopics,
            practiceProblemsCount: topicData.practiceProblemsCount,
            keyLearningPoints: topicData.keyLearningPoints,
            prerequisiteTopicIds: [], // Will be updated below
          })
          .returning();
        
        createdTopics.push(topic);
      }

      // Update prerequisites after all topics are created
      const topicIdMap = new Map(createdTopics.map(topic => [topic.orderIndex, topic.id]));
      
      // Set up prerequisites (each topic depends on the previous one, except first two)
      await db
        .update(roadmapTopics)
        .set({ prerequisiteTopicIds: [topicIdMap.get(1)!] })
        .where(eq(roadmapTopics.id, topicIdMap.get(2)!)); // Stacks & Queues depends on Linked Lists

      await db
        .update(roadmapTopics)
        .set({ prerequisiteTopicIds: [topicIdMap.get(2)!] })
        .where(eq(roadmapTopics.id, topicIdMap.get(3)!)); // Trees depends on Stacks & Queues

      await db
        .update(roadmapTopics)
        .set({ prerequisiteTopicIds: [topicIdMap.get(3)!] })
        .where(eq(roadmapTopics.id, topicIdMap.get(4)!)); // Heaps depends on Trees

      await db
        .update(roadmapTopics)
        .set({ prerequisiteTopicIds: [topicIdMap.get(4)!] })
        .where(eq(roadmapTopics.id, topicIdMap.get(5)!)); // Graphs depends on Heaps

      await db
        .update(roadmapTopics)
        .set({ prerequisiteTopicIds: [topicIdMap.get(5)!] })
        .where(eq(roadmapTopics.id, topicIdMap.get(6)!)); // DP depends on Graphs

      await db
        .update(roadmapTopics)
        .set({ prerequisiteTopicIds: [topicIdMap.get(6)!] })
        .where(eq(roadmapTopics.id, topicIdMap.get(7)!)); // Advanced depends on DP
    }

    // Check if user already has this roadmap
    const [existingUserRoadmap] = await db
      .select()
      .from(userRoadmaps)
      .where(and(
        eq(userRoadmaps.userId, session.user.id),
        eq(userRoadmaps.templateId, templateId)
      ));

    if (existingUserRoadmap) {
      return NextResponse.json(
        { error: "You already have the DSA roadmap" },
        { status: 400 }
      );
    }

    // Create user roadmap
    const [newUserRoadmap] = await db
      .insert(userRoadmaps)
      .values({
        userId: session.user.id,
        templateId,
        isCustomized: false,
      })
      .returning();

    // Get all topics for this template
    const topics = await db
      .select()
      .from(roadmapTopics)
      .where(eq(roadmapTopics.templateId, templateId))
      .orderBy(roadmapTopics.orderIndex);

    // Initialize progress for all topics
    const progressEntries = topics.map((topic, index) => {
      // First two topics (Arrays & Strings, Linked Lists) are available
      const isAvailable = index <= 1;
      
      return {
        userId: session.user.id,
        userRoadmapId: newUserRoadmap.id,
        topicId: topic.id,
        status: isAvailable ? 'available' : 'locked',
        progressPercentage: 0,
        timeSpent: 0,
        practiceProblemsCompleted: 0,
        isBookmarked: false,
      };
    });

    await db.insert(userTopicProgress).values(progressEntries);

    return NextResponse.json({
      message: "DSA roadmap initialized successfully",
      userRoadmapId: newUserRoadmap.id.toString(),
    });
  } catch (error) {
    console.error("Error initializing DSA roadmap:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}