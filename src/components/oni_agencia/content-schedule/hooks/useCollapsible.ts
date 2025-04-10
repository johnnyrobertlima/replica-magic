
import { useState } from "react";

export function useCollapsible(initialState: boolean = false) {
  const [isCollapsed, setIsCollapsed] = useState(initialState);
  
  const toggle = () => setIsCollapsed(prev => !prev);
  
  return {
    isCollapsed,
    toggle
  };
}
