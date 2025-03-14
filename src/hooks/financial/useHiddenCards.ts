
import { useState } from "react";

export const useHiddenCards = () => {
  const [hiddenCards, setHiddenCards] = useState<Set<string>>(new Set());

  const hideCard = (id: string) => {
    setHiddenCards(current => {
      const newSet = new Set(current);
      newSet.add(id);
      return newSet;
    });
  };

  return {
    hiddenCards,
    hideCard
  };
};
