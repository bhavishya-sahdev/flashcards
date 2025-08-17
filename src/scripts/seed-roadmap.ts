import { db } from "@/db";
import { roadmapTemplates, roadmapTopics } from "@/db/schema/roadmaps";

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

async function seedRoadmapTemplate() {
  try {
    console.log("🌱 Seeding DSA roadmap template...");

    // Check if template already exists
    const [existingTemplate] = await db
      .select()
      .from(roadmapTemplates)
      .where(eq(roadmapTemplates.name, DSA_TEMPLATE.name));

    if (existingTemplate) {
      console.log("✅ DSA template already exists, skipping...");
      return;
    }

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

    console.log(`✅ Created template: ${newTemplate.name} (ID: ${newTemplate.id})`);

    // Create topics
    const createdTopics = [];
    for (const topicData of DSA_TEMPLATE.topics) {
      const [topic] = await db
        .insert(roadmapTopics)
        .values({
          templateId: newTemplate.id,
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
      console.log(`  ✅ Created topic: ${topic.name} (ID: ${topic.id})`);
    }

    // Update prerequisites after all topics are created
    const topicIdMap = new Map(createdTopics.map(topic => [topic.orderIndex, topic.id]));
    
    // Set up prerequisites (each topic depends on the previous one, except first two)
    const prerequisiteUpdates = [
      { topicIndex: 2, prereqIndices: [1] }, // Stacks & Queues depends on Linked Lists
      { topicIndex: 3, prereqIndices: [2] }, // Trees depends on Stacks & Queues
      { topicIndex: 4, prereqIndices: [3] }, // Heaps depends on Trees
      { topicIndex: 5, prereqIndices: [4] }, // Graphs depends on Heaps
      { topicIndex: 6, prereqIndices: [5] }, // DP depends on Graphs
      { topicIndex: 7, prereqIndices: [6] }, // Advanced depends on DP
    ];

    for (const update of prerequisiteUpdates) {
      const topicId = topicIdMap.get(update.topicIndex)!;
      const prereqIds = update.prereqIndices.map(index => topicIdMap.get(index)!);
      
      await db
        .update(roadmapTopics)
        .set({ prerequisiteTopicIds: prereqIds })
        .where(eq(roadmapTopics.id, topicId));
      
      const topicName = createdTopics.find(t => t.id === topicId)?.name;
      console.log(`  ✅ Updated prerequisites for: ${topicName}`);
    }

    console.log("🎉 DSA roadmap template seeded successfully!");
    console.log(`📊 Created ${createdTopics.length} topics with proper prerequisite relationships`);

  } catch (error) {
    console.error("❌ Error seeding roadmap template:", error);
    throw error;
  }
}

// Import eq for the where clause
import { eq } from "drizzle-orm";

// Run the seeder if this file is executed directly
if (require.main === module) {
  seedRoadmapTemplate()
    .then(() => {
      console.log("✅ Seeding completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Seeding failed:", error);
      process.exit(1);
    });
}

export { seedRoadmapTemplate };