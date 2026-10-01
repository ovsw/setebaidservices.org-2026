import { createImageUrlBuilder, type SanityImageSource } from "@sanity/image-url";
import {
  Box,
  Button,
  Card,
  Dialog,
  Flex,
  PortalProvider,
  Stack,
  Text,
  usePortal,
} from "@sanity/ui";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  PatchEvent,
  set,
  type ArrayOfObjectsInputProps,
  useClient,
  useFormValue,
} from "sanity";
import {
  FacilityMapCanvas,
  type FacilityMapPlacementValue,
} from "./facility-map-canvas.tsx";

type MapImageValue = {
  asset?: { _ref?: string; _type?: "reference" };
  crop?: { bottom?: number; left?: number; right?: number; top?: number };
};

const FALLBACK_ASPECT_RATIO = 1320 / 766;

function useMapPreview(itemCount: number) {
  const [running, setRunning] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!running || itemCount < 2) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % itemCount);
    }, 2400);
    return () => window.clearInterval(timer);
  }, [itemCount, running]);

  useEffect(() => {
    setIndex((current) => (itemCount ? Math.min(current, itemCount - 1) : 0));
  }, [itemCount]);

  return {
    index,
    reset: () => {
      setRunning(false);
      setIndex(0);
    },
    running,
    setRunning,
  };
}

export default function FacilityMapPlacementsInput(
  props: ArrayOfObjectsInputProps<FacilityMapPlacementValue>,
) {
  const client = useClient({ apiVersion: "2026-03-23" });
  const dialogId = useId();
  const dialogContentRef = useRef<HTMLDivElement>(null);
  const expandButtonRef = useRef<HTMLButtonElement>(null);
  const parentPortal = usePortal();
  const mapImage = useFormValue(["mapImage"]) as MapImageValue | undefined;
  const [dialogContentHeight, setDialogContentHeight] = useState<number>();
  const [expanded, setExpanded] = useState(false);
  // Portal target inside the fullscreen dialog card. Placement edit dialogs
  // render into it while the map is expanded, so they always stack above the
  // map and their clicks register as inside the fullscreen dialog.
  const [expandedPortalElement, setExpandedPortalElement] =
    useState<HTMLElement | null>(null);
  const [facilityNames, setFacilityNames] = useState<Record<string, string>>({});
  const placements = props.value ?? [];
  const inlinePreview = useMapPreview(placements.length);
  const fullscreenPreview = useMapPreview(placements.length);
  const referenceIds = useMemo(
    () =>
      Array.from(
        new Set(
          placements.flatMap((placement) =>
            placement.facility?._ref ? [placement.facility._ref] : [],
          ),
        ),
      ),
    [placements],
  );
  const referenceIdsKey = referenceIds.join("|");

  useEffect(() => {
    let cancelled = false;
    if (!referenceIds.length) {
      setFacilityNames({});
      return;
    }

    const versionIds = referenceIds.flatMap((id) => [id, `drafts.${id}`]);
    const refreshFacilityNames = async () => {
      const facilities = await client.fetch<
        Array<{ _id: string; name?: string }>
      >(
        `*[_type == "facility" && _id in $ids]{_id, name}`,
        { ids: versionIds },
        { perspective: "raw" },
      );
      if (cancelled) return;

      const names: Record<string, string> = {};
      for (const facility of facilities) {
        const publishedId = facility._id.replace(/^drafts\./, "");
        if (facility._id.startsWith("drafts.") || !names[publishedId]) {
          names[publishedId] = facility.name || "Untitled Facility";
        }
      }
      setFacilityNames(names);
    };

    void refreshFacilityNames();
    const subscription = client
      .listen(`*[_type == "facility" && _id in $ids]`, { ids: versionIds })
      .subscribe(() => {
        void refreshFacilityNames();
      });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [client, referenceIdsKey]);

  useEffect(() => {
    if (!expanded) return;
    const content = dialogContentRef.current;
    if (!content) return;

    const matchContentHeight = () => {
      setDialogContentHeight((current) =>
        current === content.clientHeight ? current : content.clientHeight,
      );
    };
    let resizeFrame: number | undefined;
    const refitContentHeight = () => {
      setDialogContentHeight(undefined);
      if (resizeFrame) window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(() => {
        resizeFrame = window.requestAnimationFrame(matchContentHeight);
      });
    };
    matchContentHeight();
    const observer = new ResizeObserver(matchContentHeight);
    observer.observe(content);
    window.addEventListener("resize", refitContentHeight);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", refitContentHeight);
      if (resizeFrame) window.cancelAnimationFrame(resizeFrame);
    };
  }, [expanded]);

  const mapUrl = useMemo(() => {
    if (!mapImage?.asset?._ref) return undefined;
    return createImageUrlBuilder(client)
      .image(mapImage as SanityImageSource)
      .width(1400)
      .fit("max")
      .url();
  }, [client, mapImage]);
  // Match the website frame: the asset's dimensions (encoded in its _ref)
  // reduced by any Studio crop.
  const mapAspectRatio = useMemo(() => {
    const match = mapImage?.asset?._ref?.match(/-(\d+)x(\d+)-/);
    if (!match) return FALLBACK_ASPECT_RATIO;
    const crop = mapImage?.crop;
    const width =
      Number(match[1]) * (1 - (crop?.left ?? 0) - (crop?.right ?? 0));
    const height =
      Number(match[2]) * (1 - (crop?.top ?? 0) - (crop?.bottom ?? 0));
    return width > 0 && height > 0 ? width / height : FALLBACK_ASPECT_RATIO;
  }, [mapImage]);
  const openPlacement = (key: string) => {
    // onItemOpen needs the absolute path (from the document root); a relative
    // path silently opens nothing. The focus call is load-bearing: the array
    // list virtualizes rows, and the edit dialog is rendered by its row. The
    // virtualizer only keeps an offscreen row mounted while the focus path
    // points into it, so without this the dialog unmounts as soon as the row
    // is recycled.
    props.onItemOpen([...props.path, { _key: key }]);
    props.onPathFocus([{ _key: key }, "facility"]);
  };

  const updatePlacement = (key: string, x: number, y: number) => {
    props.onChange(
      PatchEvent.from([
        set(x, [{ _key: key }, "x"]),
        set(y, [{ _key: key }, "y"]),
      ]),
    );
  };
  const openExpandedMap = () => {
    inlinePreview.setRunning(false);
    fullscreenPreview.reset();
    setDialogContentHeight(undefined);
    setExpanded(true);
  };
  const closeExpandedMap = () => {
    setExpanded(false);
    window.requestAnimationFrame(() => expandButtonRef.current?.focus());
  };

  return (
    <Stack space={4}>
      <Card border padding={3} radius={2}>
        <Stack space={3}>
          <Flex align="center" justify="space-between" gap={3}>
            <Stack space={2}>
              <Text as="div" size={1} weight="semibold">
                Map editor
              </Text>
              <Text as="div" muted size={1}>
                Drag markers to position them. Click a marker to edit it.
              </Text>
            </Stack>
            <Flex gap={2} wrap="wrap">
              <Button
                disabled={placements.length < 2}
                mode="ghost"
                onClick={() =>
                  inlinePreview.setRunning((running) => !running)
                }
                text={
                  inlinePreview.running ? "Pause preview" : "Play preview"
                }
                type="button"
              />
              <Button
                disabled={!mapUrl}
                mode="ghost"
                onClick={openExpandedMap}
                ref={expandButtonRef}
                text="Expand map"
                type="button"
              />
            </Flex>
          </Flex>

          {mapUrl ? (
            <FacilityMapCanvas
              facilityNames={facilityNames}
              mapAspectRatio={mapAspectRatio}
              mapUrl={mapUrl}
              onPlacementChange={updatePlacement}
              onPlacementOpen={openPlacement}
              onPreviewStop={() => inlinePreview.setRunning(false)}
              placements={placements}
              previewIndex={inlinePreview.index}
              previewRunning={inlinePreview.running}
            />
          ) : (
            <Card border padding={4} radius={2} tone="caution">
              <Text size={1}>Add the map image to position Facilities.</Text>
            </Card>
          )}
        </Stack>
      </Card>

      <PortalProvider
        __unstable_elements={parentPortal.elements}
        boundaryElement={parentPortal.boundaryElement}
        element={
          expanded && expandedPortalElement
            ? expandedPortalElement
            : parentPortal.element
        }
      >
        {props.renderDefault(props)}
      </PortalProvider>

      {expanded && mapUrl ? (
        <Dialog
          __unstable_hideCloseButton
          cardRadius={[0, 2]}
          contentRef={dialogContentRef}
          id={dialogId}
          onClose={closeExpandedMap}
          padding={[0, 3]}
          width="auto"
        >
          {/* The header slot is intentionally unused: it paints above the
              dialog content, where the placement edit dialogs render. */}
          <Flex
            direction="column"
            style={{
              boxSizing: "border-box",
              height: dialogContentHeight ?? "100dvh",
              minHeight: 0,
            }}
          >
            <Flex align="center" gap={3} justify="space-between" padding={3}>
              <Flex align="center" gap={3}>
                <Text as="span" size={1} weight="semibold">
                  Facilities Map
                </Text>
                <Button
                  disabled={placements.length < 2}
                  mode="ghost"
                  onClick={() =>
                    fullscreenPreview.setRunning((running) => !running)
                  }
                  text={
                    fullscreenPreview.running ? "Pause preview" : "Play preview"
                  }
                  type="button"
                />
              </Flex>
              <Button
                mode="ghost"
                onClick={closeExpandedMap}
                text="Close"
                type="button"
              />
            </Flex>
            <Box
              flex={1}
              paddingBottom={[2, 3]}
              paddingX={[2, 3]}
              style={{ minHeight: 0 }}
            >
              <FacilityMapCanvas
                facilityNames={facilityNames}
                fillAvailable
                mapAspectRatio={mapAspectRatio}
                mapUrl={mapUrl}
                onPlacementChange={updatePlacement}
                onPlacementOpen={openPlacement}
                onPreviewStop={() => fullscreenPreview.setRunning(false)}
                placements={placements}
                previewIndex={fullscreenPreview.index}
                previewRunning={fullscreenPreview.running}
              />
            </Box>
          </Flex>
          <div ref={setExpandedPortalElement} />
        </Dialog>
      ) : null}
    </Stack>
  );
}
