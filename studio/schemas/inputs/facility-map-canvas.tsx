import { Box } from "@sanity/ui";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { createFacilitiesMapPath } from "../../../shared/facilities-map-path.ts";

export type FacilityMapPlacementValue = {
  _key: string;
  _type?: "facilityMapPlacement";
  facility?: { _ref?: string; _type?: "reference" };
  labelPosition?: "above" | "auto" | "below" | "left" | "right";
  prominent?: boolean;
  x?: number;
  y?: number;
};

type DragState = {
  key: string;
  moved: boolean;
  pointerId: number;
  startX: number;
  startY: number;
  x: number;
  y: number;
};

type FittedSize = { height: number; width: number };

type FacilityMapCanvasProps = {
  facilityNames: Readonly<Record<string, string>>;
  fillAvailable?: boolean;
  mapAspectRatio: number;
  mapUrl: string;
  onPlacementChange: (key: string, x: number, y: number) => void;
  onPlacementOpen: (key: string) => void;
  onPreviewStop: () => void;
  placements: FacilityMapPlacementValue[];
  previewIndex: number;
  previewRunning: boolean;
};

const clampPercentage = (value: number) =>
  Math.min(100, Math.max(0, Number(value.toFixed(2))));

function labelTransform(position: FacilityMapPlacementValue["labelPosition"]) {
  switch (position) {
    case "below":
      return "translate(-50%, 16px)";
    case "left":
      return "translate(calc(-100% - 16px), -50%)";
    case "right":
      return "translate(16px, -50%)";
    case "above":
    case "auto":
    default:
      return "translate(-50%, calc(-100% - 16px))";
  }
}

function positionedPlacements(placements: FacilityMapPlacementValue[]) {
  return placements.filter(
    (
      placement,
    ): placement is FacilityMapPlacementValue & { x: number; y: number } =>
      typeof placement.x === "number" && typeof placement.y === "number",
  );
}

export function FacilityMapCanvas({
  facilityNames,
  fillAvailable = false,
  mapAspectRatio,
  mapUrl,
  onPlacementChange,
  onPlacementOpen,
  onPreviewStop,
  placements,
  previewIndex,
  previewRunning,
}: FacilityMapCanvasProps) {
  const availableRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | undefined>(undefined);
  const draggedRef = useRef(false);
  const [dragState, setDragState] = useState<DragState>();
  const [fittedSize, setFittedSize] = useState<FittedSize>();

  useEffect(() => {
    if (!fillAvailable) return;
    const available = availableRef.current;
    if (!available) return;

    const fitMap = () => {
      const { height: availableHeight, width: availableWidth } =
        available.getBoundingClientRect();
      if (availableHeight <= 0 || availableWidth <= 0) return;

      const availableAspectRatio = availableWidth / availableHeight;
      const next =
        availableAspectRatio > mapAspectRatio
          ? {
              height: availableHeight,
              width: availableHeight * mapAspectRatio,
            }
          : {
              height: availableWidth / mapAspectRatio,
              width: availableWidth,
            };
      setFittedSize((current) =>
        current &&
        Math.abs(current.height - next.height) < 0.5 &&
        Math.abs(current.width - next.width) < 0.5
          ? current
          : next,
      );
    };

    fitMap();
    const observer = new ResizeObserver(fitMap);
    observer.observe(available);
    return () => observer.disconnect();
  }, [fillAvailable, mapAspectRatio]);

  const displayedPlacements = placements.map((placement) =>
    dragState?.key === placement._key
      ? { ...placement, x: dragState.x, y: dragState.y }
      : placement,
  );
  const pathData = createFacilitiesMapPath(
    positionedPlacements(displayedPlacements),
  );

  const updateDrag = (event: PointerEvent<HTMLButtonElement>) => {
    const current = dragRef.current;
    const mapBounds = mapRef.current?.getBoundingClientRect();
    if (!current || !mapBounds || event.pointerId !== current.pointerId) return;

    const moved =
      current.moved ||
      Math.hypot(event.clientX - current.startX, event.clientY - current.startY) >
        3;
    const outerX = ((event.clientX - mapBounds.left) / mapBounds.width) * 100;
    const outerY = ((event.clientY - mapBounds.top) / mapBounds.height) * 100;
    const next = {
      ...current,
      moved,
      x: clampPercentage(outerX),
      y: clampPercentage(outerY),
    };
    dragRef.current = next;
    setDragState(next);
    if (moved) onPreviewStop();
  };

  const finishDrag = (event: PointerEvent<HTMLButtonElement>) => {
    const current = dragRef.current;
    if (!current || event.pointerId !== current.pointerId) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    dragRef.current = undefined;
    setDragState(undefined);
    draggedRef.current = true;

    if (current.moved) {
      onPlacementChange(current.key, current.x, current.y);
    } else {
      onPlacementOpen(current.key);
    }
  };

  const cancelDrag = (event: PointerEvent<HTMLButtonElement>) => {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = undefined;
    draggedRef.current = false;
    setDragState(undefined);
  };

  return (
    <Box
      ref={availableRef}
      style={
        fillAvailable
          ? {
              alignItems: "center",
              display: "flex",
              height: "100%",
              justifyContent: "center",
              minHeight: 0,
              width: "100%",
            }
          : { width: "100%" }
      }
    >
      <Box
        ref={mapRef}
        style={{
          aspectRatio: mapAspectRatio,
          background: "#16200f",
          borderRadius: 3,
          height: fillAvailable && fittedSize ? fittedSize.height : undefined,
          maxHeight: "100%",
          maxWidth: "100%",
          overflow: "hidden",
          position: "relative",
          touchAction: "none",
          visibility: fillAvailable && !fittedSize ? "hidden" : undefined,
          width: fillAvailable && fittedSize ? fittedSize.width : "100%",
        }}
      >
        <img
          alt="Facilities Map editor preview"
          draggable={false}
          src={mapUrl}
          style={{
            height: "100%",
            objectFit: "cover",
            position: "absolute",
            width: "100%",
          }}
        />

        {pathData ? (
          <svg
            aria-hidden="true"
            preserveAspectRatio="none"
            style={{ height: "100%", inset: 0, position: "absolute", width: "100%" }}
            viewBox="0 0 100 100"
          >
            <path
              d={pathData}
              fill="none"
              stroke="#e5a934"
              strokeDasharray="4 4"
              strokeLinecap="round"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        ) : null}

        {displayedPlacements.map((placement, index) => {
          if (
            typeof placement.x !== "number" ||
            typeof placement.y !== "number"
          ) {
            return null;
          }
          const editorX = placement.x;
          const editorY = placement.y;
          const referenceId = placement.facility?._ref;
          const name = referenceId
            ? facilityNames[referenceId] || "Facility"
            : "Choose a Facility";
          const active = previewRunning && index === previewIndex;

          return (
            <div
              key={placement._key}
              style={{
                left: `${editorX}%`,
                pointerEvents: "none",
                position: "absolute",
                top: `${editorY}%`,
              }}
            >
              <span
                style={{
                  background: "rgba(0,0,0,.86)",
                  color: "white",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: ".06em",
                  padding: "3px 5px",
                  position: "absolute",
                  textTransform: "uppercase",
                  transform: labelTransform(placement.labelPosition),
                  whiteSpace: "nowrap",
                }}
              >
                {name}
              </span>
              <button
                aria-label={`Position ${name}`}
                onClick={() => {
                  if (draggedRef.current) {
                    draggedRef.current = false;
                    return;
                  }
                  onPlacementOpen(placement._key);
                }}
                onPointerCancel={cancelDrag}
                onPointerDown={(event) => {
                  event.currentTarget.setPointerCapture(event.pointerId);
                  draggedRef.current = false;
                  const next = {
                    key: placement._key,
                    moved: false,
                    pointerId: event.pointerId,
                    startX: event.clientX,
                    startY: event.clientY,
                    x: editorX,
                    y: editorY,
                  };
                  dragRef.current = next;
                  setDragState(next);
                }}
                onPointerMove={updateDrag}
                onPointerUp={finishDrag}
                style={{
                  background: active ? "#e5a934" : "#111",
                  border: active ? "3px solid white" : "2px solid white",
                  boxShadow: active ? "0 0 0 2px #111" : "none",
                  cursor: dragState?.key === placement._key ? "grabbing" : "grab",
                  height: placement.prominent ? 22 : 18,
                  left: 0,
                  padding: 0,
                  pointerEvents: "auto",
                  position: "absolute",
                  top: 0,
                  transform: "translate(-50%, -50%) rotate(45deg)",
                  width: placement.prominent ? 22 : 18,
                }}
                type="button"
              />
            </div>
          );
        })}
      </Box>
    </Box>
  );
}
