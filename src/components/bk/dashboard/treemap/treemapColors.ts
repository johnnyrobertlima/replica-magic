
/**
 * Provides color palette for treemap visualization
 */
import * as d3 from "d3";
import { TreemapDataItem } from "./treemapTypes";

// Muted/pastel color palette for treemap blocks
export const colorRange = [
  "#D3E4FD", // Soft Blue
  "#E5DEFF", // Soft Purple
  "#FFDEE2", // Soft Pink
  "#FDE1D3", // Soft Peach
  "#FEC6A1", // Soft Orange
  "#FEF7CD", // Soft Yellow
  "#F2FCE2", // Soft Green
  "#F1F0FB", // Soft Gray
  "#D4E6F1", // Light Blue
  "#D5F5E3", // Light Green
  "#FAE5D3"  // Light Orange
];

/**
 * Gets a D3 color scale for the treemap
 */
export const getTreemapColorScale = (d3: typeof import("d3"), data: TreemapDataItem[]) => {
  return d3.scaleOrdinal<string>()
    .domain(data.map((_, i) => i.toString()))
    .range(colorRange);
};
