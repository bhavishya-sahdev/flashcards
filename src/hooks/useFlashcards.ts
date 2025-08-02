import { useState, useEffect } from "react";
import { Flashcard } from "@/lib/types";

export function useFlashcards(flashcards: Flashcard[]) {
  const [currentCard, setCurrentCard] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [studiedCards, setStudiedCards] = useState<Set<number>>(new Set());
  const [isFlipping, setIsFlipping] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showCodeEditor, setShowCodeEditor] = useState(false);

  // Mount animation
  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset when flashcards change
  useEffect(() => {
    setCurrentCard(0);
    setShowAnswer(false);
    setStudiedCards(new Set());
    setShowCodeEditor(false);
  }, []);

  const currentCardData = flashcards[currentCard];

  const progress =
    flashcards.length > 0 ? (studiedCards.size / flashcards.length) * 100 : 0;

  const nextCard = () => {
    if (flashcards.length === 0) return;

    if (showAnswer) {
      setStudiedCards((prev) => new Set([...prev, currentCard]));
    }

    setIsFlipping(true);
    setTimeout(() => {
      setCurrentCard((prev) => (prev + 1) % flashcards.length);
      setShowAnswer(false);
      setShowCodeEditor(false);
      setIsFlipping(false);
    }, 300);
  };

  const prevCard = () => {
    if (flashcards.length === 0) return;

    setIsFlipping(true);
    setTimeout(() => {
      setCurrentCard(
        (prev) => (prev - 1 + flashcards.length) % flashcards.length
      );
      setShowAnswer(false);
      setShowCodeEditor(false);
      setIsFlipping(false);
    }, 300);
  };

  const flipCard = () => {
    if (flashcards.length === 0) return;

    if (!showAnswer) {
      setIsRevealing(true);
      setTimeout(() => {
        setShowAnswer(true);
        setIsRevealing(false);
      }, 200);
    } else {
      setShowAnswer(false);
      setShowCodeEditor(false);
    }
  };

  const resetProgress = () => {
    setStudiedCards(new Set());
    setCurrentCard(0);
    setShowAnswer(false);
    setShowCodeEditor(false);
  };

  const toggleCodeEditor = () => {
    setShowCodeEditor((prev) => !prev);
  };

  const goToCard = (cardIndex: number) => {
    if (cardIndex >= 0 && cardIndex < flashcards.length) {
      setCurrentCard(cardIndex);
      setShowAnswer(false);
      setShowCodeEditor(false);
    }
  };

  return {
    currentCard,
    showAnswer,
    studiedCards,
    isFlipping,
    isRevealing,
    mounted,
    showCodeEditor,
    progress,
    currentCardData,
    nextCard,
    prevCard,
    flipCard,
    resetProgress,
    toggleCodeEditor,
    goToCard,
  };
}
