import AxeBuilder from "@axe-core/playwright";
import {
  expect,
  test,
  type APIRequestContext,
  type Page,
} from "@playwright/test";

// The smoke runs against `next start` after `next build`. Every sitemap route
// is prerendered, so these checks prove the built HTML, not a live Sanity
// fetch. The card-image test below is the one request-time proof.

const desktop = { height: 720, width: 1280 };
const mobile = { height: 844, width: 390 };

async function sitemapRoutes(request: APIRequestContext) {
  const response = await request.get("/sitemap.xml");
  expect(response.ok(), "sitemap should respond successfully").toBe(true);
  const routes = [...(await response.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (match) => new URL(match[1]).pathname,
  );
  expect(routes.length, "sitemap should list at least one route").toBeGreaterThan(0);
  return routes;
}

async function gotoRoute(page: Page, path: string) {
  const response = await page.goto(path, { waitUntil: "domcontentloaded" });
  expect(response?.ok(), `${path} should respond successfully`).toBe(true);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
}

async function expectAccessibleRoute(page: Page) {
  await expect(page.locator("main")).toHaveCount(1);
  await expect(page.locator("h1")).toHaveCount(1);
  const mainNavigation = page.getByRole("navigation", {
    name: "Main navigation",
  });
  await expect(mainNavigation).toHaveCount(1);
  // An empty menu has no size; it must show once the navigation has items.
  if (await mainNavigation.locator("a, button").count()) {
    await expect(mainNavigation).toBeVisible();
  }
  await expect(page.getByRole("contentinfo")).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: /\b(theme|colou?r mode|dark mode|light mode)\b/i,
    }),
  ).toHaveCount(0);
  await expect(
    page.locator("[aria-hidden='false'], [aria-hidden='true'][tabindex='0']"),
  ).toHaveCount(0);
  await expect(page.locator("img:not([alt])")).toHaveCount(0);
}

function horizontalOverflow(page: Page) {
  return page
    .locator("html")
    .evaluate((element) => element.scrollWidth - element.clientWidth);
}

function motionViolations(page: Page) {
  return page.locator("body *").evaluateAll((elements) =>
    elements.filter((element) => {
      const style = getComputedStyle(element);
      const movingProperties = new Set([
        "all",
        "rotate",
        "scale",
        "transform",
        "translate",
      ]);
      // Computed lists are comma-separated and a shorter duration list
      // repeats, so pair each entry with its own duration by index.
      const list = (value: string) => value.split(",").map((item) => item.trim());
      const durations = list(style.transitionDuration);
      const hasMovementTransition = list(style.transitionProperty).some(
        (property, index) =>
          movingProperties.has(property) &&
          parseFloat(durations[index % durations.length]) > 0,
      );
      const animationDurations = list(style.animationDuration);
      const hasAnimation = list(style.animationName).some(
        (name, index) =>
          name !== "none" &&
          parseFloat(animationDurations[index % animationDurations.length]) > 0,
      );

      return hasAnimation || hasMovementTransition;
    }).length,
  );
}

test.describe("every prebuilt route", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" }, viewport: desktop });

  // A full site lists over a hundred routes. Walking them in one test took
  // 67 s of the release gate, so the walk is split into fixed shards that
  // Playwright runs in parallel workers against the same server. A shard
  // with no routes passes.
  const routeShards = 4;

  for (let shard = 0; shard < routeShards; shard += 1) {
    test(`renders with landmarks, no overflow, and no reduced-motion movement (shard ${shard + 1} of ${routeShards})`, async ({
      page,
      request,
    }) => {
      test.setTimeout(180_000);

      const routes = (await sitemapRoutes(request)).filter(
        (_, index) => index % routeShards === shard,
      );

      for (const route of routes) {
        await test.step(route, async () => {
          await gotoRoute(page, route);
          await expectAccessibleRoute(page);
          expect(
            await motionViolations(page),
            `${route} moves for reduced-motion visitors`,
          ).toBe(0);

          // The main navigation only exists at desktop widths; overflow only
          // shows at phone widths. Resize in place instead of loading twice.
          await page.setViewportSize(mobile);
          expect(await horizontalOverflow(page), `${route} overflows at ${mobile.width}px`).toBe(0);
          await page.setViewportSize(desktop);
        });
      }
    });
  }

  // One route per template that has published content. Scanning every
  // content document turns editor mistakes (skipped heading levels in old
  // posts) into red PRs, and the route loop above already covers every
  // document for the cheap rules. The home page always exists; the other
  // templates join the scan once the sitemap lists a route for them.
  test("passes an axe accessibility scan on each template", async ({
    page,
    request,
  }) => {
    const routes = await sitemapRoutes(request);
    expect(routes, "sitemap should list the home page").toContain("/");
    const templates = [
      "/",
      routes.find((route) => route !== "/" && !/^\/blog(?:\/|$)/.test(route)),
      routes.find((route) => route === "/blog"),
      routes.find((route) => /^\/blog\/(?!category\/)[^/]+$/.test(route)),
      routes.find((route) => /^\/blog\/category\/[^/]+$/.test(route)),
    ].filter((route): route is string => Boolean(route));
    const violations: string[] = [];

    for (const route of templates) {
      await test.step(route, async () => {
        await gotoRoute(page, route);
        const results = await new AxeBuilder({ page }).analyze();
        for (const violation of results.violations) {
          violations.push(
            `${route}: ${violation.id} (${violation.impact}) on ${violation.nodes.length} node(s) — ${violation.help}`,
          );
        }
      });
    }

    expect(violations).toEqual([]);
  });
});

test("serves the page card image at request time", async ({ page, request }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const ogImage = await page
    .locator('meta[property="og:image"]')
    .getAttribute("content");
  expect(ogImage, "home page should declare an og:image").toMatch(/\/api\/og\/page\//);

  const { pathname, search } = new URL(ogImage!);
  const response = await request.get(pathname + search);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toMatch(/^image\//);
});

test("reaches the skip link and the home link by keyboard", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main-content$/);

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: /home page/i }).first(),
  ).toBeFocused();
});

// The name of the camp site this code base started from. Built from parts
// so the repository search for leftover names stays at zero hits.
const previousSiteName = new RegExp(["Canadian", "Adventure", "Camp"].join("\\s+"), "i");

test("shows the Setebaid site name on the home page and not the previous one", async ({
  page,
}) => {
  await gotoRoute(page, "/");

  await expect(page).toHaveTitle(/Setebaid Services/);
  await expect(page.locator("body")).toContainText("Setebaid Services");
  // The whole document, so meta tags, alt text and accessible names count.
  expect(await page.content()).not.toMatch(previousSiteName);
});

// The contact page joins this check once it is published.
test("keeps the home and contact pages free of horizontal overflow at every width", async ({
  page,
  request,
}) => {
  const routes = await sitemapRoutes(request);
  const pages = ["/", "/contact"].filter((route) => routes.includes(route));
  expect(pages, "sitemap should list the home page").toContain("/");

  for (const viewport of [
    mobile,
    { height: 1024, width: 768 },
    { height: 1000, width: 1440 },
  ]) {
    await page.setViewportSize(viewport);
    for (const route of pages) {
      await gotoRoute(page, route);
      expect(await horizontalOverflow(page), `${route} at ${viewport.width}px`).toBe(0);
    }
  }
});
