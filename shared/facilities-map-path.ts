import { curveCatmullRom, curveLinear, line } from "d3-shape";

export type FacilitiesMapPoint = {
  x: number;
  y: number;
};

/** Build the open tour route through every point in editor order. */
export function createFacilitiesMapPath<T extends FacilitiesMapPoint>(
  points: T[],
) {
  if (points.length < 2) return undefined;
  return (
    line<T>()
      .x(({ x }) => x)
      .y(({ y }) => y)
      .curve(points.length < 3 ? curveLinear : curveCatmullRom.alpha(0.5))(
      points,
    ) ?? undefined
  );
}
