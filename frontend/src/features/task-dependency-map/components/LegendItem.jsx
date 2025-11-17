/**
 * LegendItem Component
 * 
 * A component that renders a single item in a status legend for the dependency graph.
 * Each legend item consists of a colored rectangle (swatch) and a text label.
 * Used in SVG contexts to create visual legends for task statuses.
 * 
 * @fileoverview Component for rendering legend items in SVG contexts
 */

import React from 'react';

/**
 * Legend item component for the status legend
 * 
 * Renders a colored swatch and label for use in SVG-based legends.
 * 
 * @param {Object} props - Component props
 * @param {number} props.x - X coordinate for positioning the legend item
 * @param {number} props.y - Y coordinate for positioning the legend item
 * @param {string} props.color - Color (hex, rgb, or named color) for the status swatch
 * @param {string} props.label - Text label to display next to the color swatch
 * @returns {JSX.Element} A React SVG group element containing a rectangle and text
 * 
 * @example
 * <LegendItem x={10} y={20} color="#3b82f6" label="In Progress" />
 */
const LegendItem = ({ x, y, color, label, fontSize = 12, boxSize = 12 }) => {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect
        x={0}
        y={0}
        width={boxSize}
        height={boxSize}
        rx={boxSize / 6}
        fill={color}
      />
      <text
        x={boxSize + 6}
        y={fontSize}           // baseline close to original 11 with fontSize=12
        fontSize={fontSize}
        fill="#374151"
      >
        {label}
      </text>
    </g>
  );
};

export default LegendItem;
