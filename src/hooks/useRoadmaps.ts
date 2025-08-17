import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import {
  RoadmapTemplate,
  UserRoadmap,
  UserTopicProgress,
  RoadmapProgressSummary,
} from "@/lib/types";

export const useRoadmaps = () => {
  const { data: session } = useSession();
  const [templates, setTemplates] = useState<RoadmapTemplate[]>([]);
  const [userRoadmaps, setUserRoadmaps] = useState<UserRoadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch available roadmap templates
  const fetchTemplates = async (category?: string, includeTopics = false) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (category) params.append("category", category);
      if (includeTopics) params.append("includeTopics", "true");

      const response = await fetch(`/api/roadmap/templates?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch roadmap templates");
      }

      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching templates:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's roadmaps
  const fetchUserRoadmaps = async () => {
    if (!session?.user) {
      setUserRoadmaps([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/roadmap/user-roadmaps");

      if (!response.ok) {
        throw new Error("Failed to fetch user roadmaps");
      }

      const data = await response.json();
      setUserRoadmaps(data.userRoadmaps || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching user roadmaps:", err);
    } finally {
      setLoading(false);
    }
  };

  // Start a roadmap (create user roadmap from template)
  const startRoadmap = async (
    templateId: string,
    customName?: string,
    customDescription?: string,
    targetCompletionDate?: Date
  ): Promise<UserRoadmap> => {
    if (!session?.user) {
      throw new Error("Authentication required");
    }

    try {
      const response = await fetch("/api/roadmap/user-roadmaps", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          templateId,
          customName,
          customDescription,
          targetCompletionDate: targetCompletionDate?.toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to start roadmap");
      }

      const data = await response.json();

      // Refresh user roadmaps after starting a new one
      await fetchUserRoadmaps();

      return data.userRoadmap;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to start roadmap"
      );
    }
  };

  // Update topic progress
  const updateTopicProgress = async (
    userRoadmapId: string,
    topicId: string,
    updates: {
      status?: "locked" | "available" | "in_progress" | "completed";
      progressPercentage?: number;
      timeSpent?: number;
      userNotes?: string;
      isBookmarked?: boolean;
      practiceProblemsCompleted?: number;
      averageScore?: number;
    }
  ): Promise<UserTopicProgress> => {
    if (!session?.user) {
      throw new Error("Authentication required");
    }

    try {
      const response = await fetch(
        `/api/roadmap/user-roadmaps/${userRoadmapId}/progress`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            topicId,
            ...updates,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update progress");
      }

      const data = await response.json();

      // Update the local state
      setUserRoadmaps((prev) =>
        prev.map((roadmap) => {
          if (roadmap.id === userRoadmapId) {
            return {
              ...roadmap,
              topicProgress: roadmap.topicProgress.map((progress) =>
                progress.topicId === topicId ? data.progress : progress
              ),
            };
          }
          return roadmap;
        })
      );

      return data.progress;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to update progress"
      );
    }
  };

  // Initialize DSA roadmap
  const initializeDSARoadmap = async () => {
    if (!session?.user) {
      throw new Error("Authentication required");
    }

    try {
      const response = await fetch("/api/roadmap/initialize-dsa", {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to initialize DSA roadmap");
      }

      // Refresh user roadmaps after initialization
      await fetchUserRoadmaps();

      return true;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to initialize DSA roadmap"
      );
    }
  };

  // Get roadmap progress summary
  const getRoadmapProgress = (
    userRoadmap: UserRoadmap
  ): RoadmapProgressSummary => {
    const { topicProgress } = userRoadmap;

    const totalTopics = topicProgress.length;
    const completedTopics = topicProgress.filter(
      (p) => p.status === "completed"
    ).length;
    const inProgressTopics = topicProgress.filter(
      (p) => p.status === "in_progress"
    ).length;
    const availableTopics = topicProgress.filter(
      (p) => p.status === "available"
    ).length;
    const lockedTopics = topicProgress.filter(
      (p) => p.status === "locked"
    ).length;

    const totalTimeSpent = topicProgress.reduce(
      (sum, p) => sum + p.timeSpent,
      0
    );

    const scoresWithValues = topicProgress.filter(
      (p) => p.averageScore !== undefined && p.averageScore !== null
    );
    const averageScore =
      scoresWithValues.length > 0
        ? scoresWithValues.reduce((sum, p) => sum + p.averageScore!, 0) /
          scoresWithValues.length
        : undefined;

    // Calculate current streak (consecutive days with study activity)
    const studyDates = topicProgress
      .filter((p) => p.lastStudiedAt)
      .map((p) => p.lastStudiedAt!)
      .sort((a, b) => b.getTime() - a.getTime());

    let currentStreak = 0;
    let lastStudyDate: Date | undefined;

    if (studyDates.length > 0) {
      lastStudyDate = studyDates[0];
      const today = new Date();
      const daysDiff = Math.floor(
        (today.getTime() - (lastStudyDate?.getTime() ?? 0)) /
          (1000 * 60 * 60 * 24)
      );

      // If studied today or yesterday, calculate streak
      if (daysDiff <= 1) {
        currentStreak = 1;
        let currentDate = new Date(lastStudyDate);

        for (let i = 1; i < studyDates.length; i++) {
          const prevDate = studyDates[i];
          const daysBetween = Math.floor(
            (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (daysBetween === 1) {
            currentStreak++;
            currentDate = prevDate;
          } else {
            break;
          }
        }
      }
    }

    return {
      totalTopics,
      completedTopics,
      inProgressTopics,
      availableTopics,
      lockedTopics,
      totalTimeSpent,
      averageScore,
      currentStreak,
      lastStudyDate,
    };
  };

  // Fetch data on component mount and when session changes
  useEffect(() => {
    fetchTemplates("programming", true);
    fetchUserRoadmaps();
  }, [session]);

  return {
    templates,
    userRoadmaps,
    loading,
    error,
    fetchTemplates,
    fetchUserRoadmaps,
    startRoadmap,
    updateTopicProgress,
    initializeDSARoadmap,
    getRoadmapProgress,
    refetch: () => {
      fetchTemplates("programming", true);
      fetchUserRoadmaps();
    },
  };
};

export default useRoadmaps;
