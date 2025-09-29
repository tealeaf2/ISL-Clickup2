import React from 'react';

/**
 * Legend item component for the status legend
 */
const LegendItem = ({ x, y, color, label }) => {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect x={0} y={0} width={12} height={12} rx={2} fill={color} />
      <text x={18} y={11} fontSize={12} fill="#374151">
        {label}
      </text>
    </g>
  );
};

export default LegendItem;
