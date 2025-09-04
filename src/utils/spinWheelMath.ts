export const PANEL_COUNT = 8;
export const BULB_COUNT = 14;

export const deg2rad = (deg: number) => (deg * Math.PI) / 180;
export const rad2deg = (rad: number) => (rad * 180) / Math.PI;

export const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
  const a = deg2rad(angleDeg);
  return {
    x: cx + r * Math.cos(a),
    y: cy + r * Math.sin(a),
  };
};

export const angleForPanel = (index: number, count: number = PANEL_COUNT) => 360 * (index / count);

export const getPanelIndexFromAngle = (finalAngleDeg: number, count: number = PANEL_COUNT) => {
  // 0deg points to the right; our pointer is at -90deg (top). Shift so that 0deg is at top
  const angle = (450 - (finalAngleDeg % 360)) % 360; // 90deg shift and normalize
  const segmentAngle = 360 / count;
  return Math.floor(angle / segmentAngle) % count;
};

export const RARE_PANEL_INDEXES = [1];
export const isRarePanel = (index: number) => RARE_PANEL_INDEXES.includes(index);

export const buildSegmentPath = (
  cx: number,
  cy: number,
  innerR: number,
  outerR: number,
  startAngle: number,
  endAngle: number
) => {
  // Returns SVG path string compatible with Skia Path
  const startOuter = polarToCartesian(cx, cy, outerR, startAngle);
  const endOuter = polarToCartesian(cx, cy, outerR, endAngle);
  const startInner = polarToCartesian(cx, cy, innerR, endAngle);
  const endInner = polarToCartesian(cx, cy, innerR, startAngle);

  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${endOuter.x} ${endOuter.y}`,
    `L ${startInner.x} ${startInner.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${endInner.x} ${endInner.y}`,
    "Z",
  ].join(" ");
};
