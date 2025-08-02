import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { FlashcardFolder, Flashcard } from "@/lib/types";
import { useLocalStorage } from "./useLocalStorage";
import { initializeNewCard } from "@/lib/spaced-repetition";

export const useFolders = () => {
  const { data: session } = useSession();
  const [folders, setFolders] = useState<FlashcardFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Local storage for unauthenticated users
  const [localFolders, setLocalFolders] = useLocalStorage<FlashcardFolder[]>(
    "flashcard-folders",
    []
  );

  // Fetch folders from API or local storage
  const fetchFolders = async () => {
    setLoading(true);
    setError(null);

    try {
      if (session?.user) {
        // Authenticated user - fetch from API
        const response = await fetch("/api/flashcard/folders");

        if (!response.ok) {
          throw new Error("Failed to fetch folders");
        }

        const data = await response.json();
        setFolders(data.folders || []);
      } else {
        // Unauthenticated user - use local storage
        setFolders(localFolders);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching folders:", err);
    } finally {
      setLoading(false);
    }
  };

  // Create a new folder
  const createFolder = async (name: string, description: string): Promise<FlashcardFolder> => {
    try {
      if (session?.user) {
        // Authenticated user - create via API
        const response = await fetch("/api/flashcard/folders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, description }),
        });

        if (!response.ok) {
          throw new Error("Failed to create folder");
        }

        const data = await response.json();
        const createdFolder = data.folder;
        setFolders((prev) => [...prev, createdFolder]);
        return createdFolder;
      } else {
        // Unauthenticated user - create locally
        const newFolder: FlashcardFolder = {
          id: Date.now().toString(),
          name,
          description,
          flashcards: [],
          createdAt: new Date(),
        };

        const updatedFolders = [...folders, newFolder];
        setFolders(updatedFolders);
        setLocalFolders(updatedFolders);
        return newFolder;
      }
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to create folder"
      );
    }
  };

  // Edit a folder
  const editFolder = async (
    folderId: string,
    name: string,
    description: string
  ) => {
    try {
      if (session?.user) {
        // Authenticated user - edit via API
        const response = await fetch(`/api/flashcard/folders/${folderId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, description }),
        });

        if (!response.ok) {
          throw new Error("Failed to update folder");
        }

        const data = await response.json();
        setFolders((prev) =>
          prev.map((folder) =>
            folder.id === folderId ? { ...folder, ...data.folder } : folder
          )
        );
      } else {
        // Unauthenticated user - edit locally
        const updatedFolders = folders.map((folder) =>
          folder.id === folderId ? { ...folder, name, description } : folder
        );
        setFolders(updatedFolders);
        setLocalFolders(updatedFolders);
      }
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to update folder"
      );
    }
  };

  // Delete a folder
  const deleteFolder = async (folderId: string) => {
    try {
      if (session?.user) {
        // Authenticated user - delete via API
        const response = await fetch(`/api/flashcard/folders/${folderId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete folder");
        }

        setFolders((prev) => prev.filter((folder) => folder.id !== folderId));
      } else {
        // Unauthenticated user - delete locally
        const updatedFolders = folders.filter(
          (folder) => folder.id !== folderId
        );
        setFolders(updatedFolders);
        setLocalFolders(updatedFolders);
      }
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to delete folder"
      );
    }
  };

  // Create a flashcard in a folder
  const createFlashcard = async (
    flashcardData: Pick<
      Flashcard,
      "question" | "answer" | "category" | "difficulty" | "codeTemplate"
    >,
    folderId: string
  ) => {
    try {
      if (session?.user) {
        // Authenticated user - create via API
        const response = await fetch("/api/flashcard/flashcards", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...flashcardData, folderId }),
        });

        if (!response.ok) {
          throw new Error("Failed to create flashcard");
        }

        const data = await response.json();

        // Update the folder with the new flashcard
        setFolders((prev) =>
          prev.map((folder) =>
            folder.id === folderId
              ? {
                  ...folder,
                  flashcards: [...folder.flashcards, data.flashcard],
                }
              : folder
          )
        );
      } else {
        // Unauthenticated user - create locally
        const now = new Date();
        const spacedRepetitionDefaults = initializeNewCard();

        const newFlashcard: Flashcard = {
          ...flashcardData,
          id: Date.now().toString(),
          createdAt: now,
          updatedAt: now,
          easeFactor: spacedRepetitionDefaults.easeFactor!,
          interval: spacedRepetitionDefaults.interval!,
          repetitions: spacedRepetitionDefaults.repetitions!,
          nextReviewDate: now, // Available for immediate review
          isLearning: spacedRepetitionDefaults.isLearning!,
          totalReviews: 0,
          correctReviews: 0,
          streakCount: 0,
          maxStreak: 0,
        };

        const updatedFolders = folders.map((folder) =>
          folder.id === folderId
            ? { ...folder, flashcards: [...folder.flashcards, newFlashcard] }
            : folder
        );

        setFolders(updatedFolders);
        setLocalFolders(updatedFolders);
      }
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to create flashcard"
      );
    }
  };

  // Initialize default folders
  const initializeDefaultFolders = async () => {
    try {
      if (session?.user) {
        // Authenticated user - initialize via API
        const response = await fetch("/api/flashcard/folders/initialize", {
          method: "POST",
        });

        if (!response.ok) {
          throw new Error("Failed to initialize folders");
        }

        const data = await response.json();
        setFolders(data.folders || []);
      } else {
        // Unauthenticated user - initialize locally
        const { defaultFolders } = await import("@/lib/Flashcards");
        setFolders(defaultFolders);
        setLocalFolders(defaultFolders);
      }
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Failed to initialize folders"
      );
    }
  };

  // Fetch folders on component mount and when session changes
  useEffect(() => {
    fetchFolders();
  }, [session]);

  return {
    folders,
    loading,
    error,
    createFolder,
    editFolder,
    deleteFolder,
    createFlashcard,
    initializeDefaultFolders,
    refetch: fetchFolders,
  };
};
