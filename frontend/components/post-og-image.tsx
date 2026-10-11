/* eslint-disable @next/next/no-img-element -- The card renderer (next/og) takes plain <img>; next/image cannot run there. */
import { fitPostOgTitle } from "@/lib/post-og-image";
import { SHARING_IMAGE_WIDTH } from "@/sanity/lib/image";

// Sunlit Camp colours from DESIGN.md. The card renderer cannot read CSS
// variables, so the values are repeated here.
const CREAM = "#FBF7EC";
const CAMP_GREEN_DEEP = "#14653F";
const LOGO_GREEN = "#1A8B5A";
const MARIGOLD = "#F2B93D";

const CARD_HEIGHT = 630;
const LOGO_ASPECT = 840 / 193;
const LOGO_WIDTH = 280;

// The Inner Hero's desktop scrims (components/blocks/inner-hero.tsx): a
// left-to-right shade under the copy, a band behind the logo at the top, and
// a lift behind the title at the bottom. The photo stays visible on the right.
const SCRIMS = [
  { top: 0, height: CARD_HEIGHT, image: "linear-gradient(90deg, rgba(22, 32, 15, 0.9) 0%, rgba(22, 32, 15, 0.55) 45%, rgba(22, 32, 15, 0.12) 100%)" },
  { top: 0, height: 224, image: "linear-gradient(180deg, rgba(22, 32, 15, 0.82) 0%, rgba(22, 32, 15, 0.45) 45%, rgba(22, 32, 15, 0) 100%)" },
  { top: CARD_HEIGHT / 2, height: CARD_HEIGHT / 2, image: "linear-gradient(0deg, rgba(22, 32, 15, 0.92) 0%, rgba(22, 32, 15, 0) 100%)" },
];

/**
 * The Generated sharing card: the Sharing photo across the whole card under
 * the Inner Hero's scrims, with the logo and the title on top. Without a
 * photo, camp green holds the logo's mark, large, where the photo would be.
 */
export function PostOgImage({
  eyebrow,
  logo,
  photoUrl,
  title,
}: {
  eyebrow?: string;
  /** The logo for dark grounds, as a data URL. */
  logo: string;
  photoUrl?: string | null;
  title: string;
}) {
  const fittedTitle = fitPostOgTitle(title);
  // Short titles grow to fill the open space; long ones keep the fitted size.
  const titleSize =
    fittedTitle.text.length <= 24
      ? 80
      : fittedTitle.text.length <= 48
        ? 64
        : fittedTitle.fontSize;

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        backgroundColor: CAMP_GREEN_DEEP,
        fontFamily: "Work Sans",
        fontWeight: 800,
      }}
    >
      {photoUrl ? (
        <img
          src={photoUrl}
          alt=""
          width={SHARING_IMAGE_WIDTH}
          height={CARD_HEIGHT}
          style={{ position: "absolute", top: 0, left: 0, objectFit: "cover" }}
        />
      ) : (
        <BrandRing />
      )}

      {photoUrl &&
        SCRIMS.map((scrim) => (
          <div
            key={scrim.top + scrim.height}
            style={{
              position: "absolute",
              top: scrim.top,
              left: 0,
              width: "100%",
              height: scrim.height,
              display: "flex",
              backgroundImage: scrim.image,
            }}
          />
        ))}

      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: 640,
          height: "100%",
          padding: "64px 0 76px 72px",
        }}
      >
        <img
          src={logo}
          alt=""
          width={LOGO_WIDTH}
          height={Math.round(LOGO_WIDTH / LOGO_ASPECT)}
        />

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              color: CREAM,
              fontSize: titleSize,
              lineHeight: 1.02,
              letterSpacing: "-0.025em",
            }}
          >
            {fittedTitle.text}
          </div>
          {eyebrow && (
            <div
              style={{
                display: "flex",
                marginTop: 24,
                color: "rgba(251, 247, 236, 0.82)",
                fontSize: 24,
                lineHeight: 1,
              }}
            >
              {eyebrow}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * The logo's mark, large: the turning arrow round the marigold dot. The
 * coordinates are measured from the 540-pixel mark
 * (prototype/assets/setebaid-mark-2a.png); the ring ends under the arrowhead.
 */
function BrandRing() {
  const size = 766;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 540 540"
      style={{ position: "absolute", top: -75, right: -166 }}
    >
      <path
        d="M 143.5 118.4 A 204.5 204.5 0 1 1 130.4 419.6"
        fill="none"
        stroke={LOGO_GREEN}
        strokeWidth={77}
        strokeLinecap="round"
      />
      <path d="M 22 148 L 148 22 L 181 181 Z" fill={LOGO_GREEN} />
      <circle cx={275} cy={275} r={78} fill={MARIGOLD} />
    </svg>
  );
}
