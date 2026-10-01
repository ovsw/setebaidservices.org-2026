import type { FacilitiesMapPoint } from "../../../shared/facilities-map-path";

export {
  createFacilitiesMapPath,
  type FacilitiesMapPoint,
} from "../../../shared/facilities-map-path";

export type FacilitiesMapRouteSample = {
  distance: number;
  point: FacilitiesMapPoint;
};

const formatCoordinate = (value: number) => String(Number(value.toFixed(2)));

/**
 * Trace the route from its start up to `distance` as a standalone path, so the
 * highlight is one contiguous stroke ending exactly at the active stop.
 * Dash-based reveals are unreliable here: `vector-effect: non-scaling-stroke`
 * on a non-uniformly stretched viewBox makes browsers measure dashes in a
 * different space than the route, which caused both the wrong-endpoint and the
 * repeated-segments bugs.
 */
export function createFacilitiesMapTrailPath(
  samples: FacilitiesMapRouteSample[],
  distance: number,
) {
  const first = samples[0];
  if (!first || samples.length < 2 || distance <= 0) return undefined;
  const points: FacilitiesMapPoint[] = [first.point];
  for (let index = 1; index < samples.length; index += 1) {
    const sample = samples[index];
    const previous = samples[index - 1];
    if (!sample || !previous) break;
    if (sample.distance <= distance) {
      points.push(sample.point);
      continue;
    }
    const span = sample.distance - previous.distance;
    const progress = span > 0 ? (distance - previous.distance) / span : 0;
    points.push({
      x: previous.point.x + (sample.point.x - previous.point.x) * progress,
      y: previous.point.y + (sample.point.y - previous.point.y) * progress,
    });
    break;
  }
  return points
    .map(
      ({ x, y }, index) =>
        `${index ? "L" : "M"}${formatCoordinate(x)},${formatCoordinate(y)}`,
    )
    .join("");
}
