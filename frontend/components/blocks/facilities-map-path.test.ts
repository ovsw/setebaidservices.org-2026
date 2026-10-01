import { describe, expect, it } from "vitest";
import {
  createFacilitiesMapPath,
  createFacilitiesMapTrailPath,
  type FacilitiesMapRouteSample,
} from "./facilities-map-path";

describe("createFacilitiesMapPath", () => {
  it("returns no route until two Facilities have positions", () => {
    expect(createFacilitiesMapPath([])).toBeUndefined();
    expect(createFacilitiesMapPath([{ x: 20, y: 30 }])).toBeUndefined();
  });

  it("passes through two points without inventing a return route", () => {
    expect(
      createFacilitiesMapPath([
        { x: 20, y: 30 },
        { x: 70, y: 60 },
      ]),
    ).toBe("M20,30L70,60");
  });

  it("changes the route when editors reorder Facilities", () => {
    const points = [
      { x: 15, y: 20 },
      { x: 45, y: 65 },
      { x: 80, y: 30 },
    ];
    expect(createFacilitiesMapPath(points)).not.toBe(
      createFacilitiesMapPath([points[0], points[2], points[1]]),
    );
  });
});

describe("createFacilitiesMapTrailPath", () => {
  const samples: FacilitiesMapRouteSample[] = [
    { distance: 0, point: { x: 0, y: 50 } },
    { distance: 50, point: { x: 25, y: 50 } },
    { distance: 100, point: { x: 50, y: 50 } },
    { distance: 150, point: { x: 75, y: 50 } },
    { distance: 200, point: { x: 100, y: 50 } },
  ];

  it("draws one contiguous stroke from the start to the exact distance", () => {
    expect(createFacilitiesMapTrailPath(samples, 125)).toBe(
      "M0,50L25,50L50,50L62.5,50",
    );
  });

  it("covers the whole route at full distance", () => {
    expect(createFacilitiesMapTrailPath(samples, 200)).toBe(
      "M0,50L25,50L50,50L75,50L100,50",
    );
  });

  it("draws nothing before the walker leaves the first stop", () => {
    expect(createFacilitiesMapTrailPath(samples, 0)).toBeUndefined();
    expect(createFacilitiesMapTrailPath([], 40)).toBeUndefined();
  });
});
