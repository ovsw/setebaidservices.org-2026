# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: site.spec.ts >> every prebuilt route >> passes an axe accessibility scan on each template
- Location: e2e/site.spec.ts:137:3

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 3

- Array []
+ Array [
+   "/stories: heading-order (moderate) on 1 node(s) — Heading levels should only increase by one",
+ ]
```

# Page snapshot

```yaml
- generic [active] [ref=f4e1]:
  - link "Skip to content" [ref=f4e2] [cursor=pointer]:
    - /url: "#main-content"
  - banner [ref=f4e3]:
    - generic [ref=f4e4]:
      - link "Setebaid Services home page" [ref=f4e5] [cursor=pointer]:
        - /url: /
        - img "Setebaid Services" [ref=f4e8]
      - navigation "Main navigation" [ref=f4e9]:
        - button "Camps" [ref=f4e10]
        - button "Parents" [ref=f4e14]
        - link "Stories" [ref=f4e18] [cursor=pointer]:
          - /url: /stories
        - button "Get involved" [ref=f4e19]
        - button "About" [ref=f4e23]
      - generic [ref=f4e27]:
        - link "Register" [ref=f4e28] [cursor=pointer]:
          - /url: https://setebaid.campbrainregistration.com/
        - link "Donate" [ref=f4e29] [cursor=pointer]:
          - /url: /donate
  - main [ref=f4e30]:
    - region [ref=f4e31]:
      - generic [ref=f4e32]:
        - generic [ref=f4e33]:
          - navigation "Breadcrumb" [ref=f4e34]:
            - link "Stories" [ref=f4e35] [cursor=pointer]:
              - /url: /stories
            - text: / Camper
          - heading "Camper" [level=1] [ref=f4e36]
          - paragraph [ref=f4e37]: Stories told by campers, past and present.
        - heading "Posts in Camper" [level=2] [ref=f4e38]
        - list [ref=f4e39]:
          - listitem [ref=f4e40]:
            - article [ref=f4e41]:
              - figure [ref=f4e42]:
                - img "A young woman in a blue bandana bends over a chalk line on a gravel path during a camp game, with campers waiting behind her." [ref=f4e43]
              - generic [ref=f4e44]:
                - heading [level=3] [ref=f4e45]:
                  - link "The Future Diabetes Camp Showed Me" [ref=f4e46] [cursor=pointer]:
                    - /url: /stories/the-future-diabetes-camp-showed-me
                - paragraph [ref=f4e47]: Liz came to Setebaid as a camper and came back as a counselor. She wrote about what diabetes camp showed her about her own future.
                - time [ref=f4e49]: APR 25, 2016
        - paragraph [ref=f4e53]: Showing 1–1 of 1 posts
  - contentinfo [ref=f4e54]:
    - generic [ref=f4e55]:
      - generic [ref=f4e56]:
        - heading "Until next summer, see you at camp" [level=2] [ref=f4e58]: Until next summer,see you at camp
        - generic [ref=f4e59]:
          - link "Register" [ref=f4e60] [cursor=pointer]:
            - /url: https://setebaid.campbrainregistration.com/
          - link "Donate" [ref=f4e62] [cursor=pointer]:
            - /url: /donate
      - generic [ref=f4e64]:
        - region "Setebaid Services contact information" [ref=f4e65]:
          - link [ref=f4e67] [cursor=pointer]:
            - /url: /
            - img "Setebaid Services" [ref=f4e69]
          - list [ref=f4e70]:
            - listitem [ref=f4e71]:
              - 'link "Address: 1157 Westbranch Highway Winfield, PA 17889" [ref=f4e75] [cursor=pointer]':
                - /url: https://www.google.com/maps/search/?api=1&query=1157%20Westbranch%20Highway%2C%20Winfield%2C%20PA%2017889
                - generic [ref=f4e76]:
                  - generic [ref=f4e77]: "Address:"
                  - text: 1157 Westbranch Highway Winfield, PA 17889
            - listitem [ref=f4e78]:
              - 'link "Phone: (570) 524-9090" [ref=f4e81] [cursor=pointer]':
                - /url: tel:+15705249090
                - generic [ref=f4e82]:
                  - generic [ref=f4e83]: "Phone:"
                  - text: (570) 524-9090
            - listitem [ref=f4e84]:
              - 'link "Email: info@setebaidservices.org" [ref=f4e88] [cursor=pointer]':
                - /url: mailto:info@setebaidservices.org
                - generic [ref=f4e89]:
                  - generic [ref=f4e90]: "Email:"
                  - text: info@setebaidservices.org
        - region [ref=f4e91]:
          - heading "Camps" [level=2] [ref=f4e92]
          - list [ref=f4e93]:
            - listitem [ref=f4e94]:
              - link "All camps and programs" [ref=f4e95] [cursor=pointer]:
                - /url: /camps
            - listitem [ref=f4e97]:
              - link "Camp Setebaid" [ref=f4e98] [cursor=pointer]:
                - /url: /camps/camp-setebaid
            - listitem [ref=f4e100]:
              - link "Harrisburg Diabetic Youth Camp" [ref=f4e101] [cursor=pointer]:
                - /url: /camps/harrisburg-diabetic-youth-camp
            - listitem [ref=f4e103]:
              - link "Family Camp" [ref=f4e104] [cursor=pointer]:
                - /url: /camps/family-camp
            - listitem [ref=f4e106]:
              - link "Dates and prices" [ref=f4e107] [cursor=pointer]:
                - /url: /dates-and-prices
            - listitem [ref=f4e109]:
              - link "Financial help" [ref=f4e110] [cursor=pointer]:
                - /url: /dates-and-prices/financial-help
        - region [ref=f4e112]:
          - heading "Parents" [level=2] [ref=f4e113]
          - list [ref=f4e114]:
            - listitem [ref=f4e115]:
              - link "First-time parents" [ref=f4e116] [cursor=pointer]:
                - /url: /parents
            - listitem [ref=f4e118]:
              - link "Medical care and safety" [ref=f4e119] [cursor=pointer]:
                - /url: /parents/medical-care
            - listitem [ref=f4e121]:
              - link "Before camp" [ref=f4e122] [cursor=pointer]:
                - /url: /parents/before-camp
            - listitem [ref=f4e124]:
              - link "FAQs" [ref=f4e125] [cursor=pointer]:
                - /url: /parents/faqs
            - listitem [ref=f4e127]:
              - link "Ask about camp" [ref=f4e128] [cursor=pointer]:
                - /url: /ask-about-camp
        - region [ref=f4e130]:
          - heading "Get involved" [level=2] [ref=f4e131]
          - list [ref=f4e132]:
            - listitem [ref=f4e133]:
              - link "Donate" [ref=f4e134] [cursor=pointer]:
                - /url: /donate
            - listitem [ref=f4e136]:
              - link "Volunteer at camp" [ref=f4e137] [cursor=pointer]:
                - /url: /volunteer
            - listitem [ref=f4e139]:
              - link "Open positions" [ref=f4e140] [cursor=pointer]:
                - /url: /volunteer/positions
            - listitem [ref=f4e142]:
              - link "Campaigns and fundraisers" [ref=f4e143] [cursor=pointer]:
                - /url: /donate/campaigns
        - region [ref=f4e145]:
          - heading "About" [level=2] [ref=f4e146]
          - list [ref=f4e147]:
            - listitem [ref=f4e148]:
              - link "About Setebaid" [ref=f4e149] [cursor=pointer]:
                - /url: /about
            - listitem [ref=f4e151]:
              - link "Our team" [ref=f4e152] [cursor=pointer]:
                - /url: /about/team
            - listitem [ref=f4e154]:
              - link "Stories" [ref=f4e155] [cursor=pointer]:
                - /url: /stories
            - listitem [ref=f4e157]:
              - link "Contact" [ref=f4e158] [cursor=pointer]:
                - /url: /contact
      - list "Affiliations and history" [ref=f4e160]:
        - listitem [ref=f4e161]:
          - link [ref=f4e162] [cursor=pointer]:
            - /url: /about
            - img "Setebaid Services, Inc." [ref=f4e164]
        - listitem [ref=f4e165]:
          - link [ref=f4e166] [cursor=pointer]:
            - /url: /about
            - img "Camp Setebaid" [ref=f4e168]
        - listitem [ref=f4e169]:
          - link [ref=f4e170] [cursor=pointer]:
            - /url: /about
            - img "HDYC, Harrisburg Diabetic Youth Camp" [ref=f4e172]
        - listitem [ref=f4e173]:
          - link [ref=f4e174] [cursor=pointer]:
            - /url: https://www.diabetescamps.org/
            - img "Diabetes Education and Camping Association" [ref=f4e176]
        - listitem [ref=f4e177]:
          - link [ref=f4e178] [cursor=pointer]:
            - /url: https://www.acacamps.org/
            - img "American Camp Association Accredited" [ref=f4e180]
      - generic [ref=f4e181]:
        - paragraph [ref=f4e182]: ©2026 Setebaid Services, Inc. All rights reserved.
        - link "Privacy policy" [ref=f4e183] [cursor=pointer]:
          - /url: /privacy-policy
        - link "Terms of use" [ref=f4e184] [cursor=pointer]:
          - /url: /terms-of-use
        - link "Payment and refund policy" [ref=f4e185] [cursor=pointer]:
          - /url: /refund-policy
        - link "Accessibility" [ref=f4e186] [cursor=pointer]:
          - /url: /accessibility
        - link "Cookie policy" [ref=f4e187] [cursor=pointer]:
          - /url: /cookie-policy
      - paragraph [ref=f4e188]: Setebaid Services® is a 501(c)(3) nonprofit organization-donations to which are tax deductible to the fullest extent permitted by law. The official registration and financial information of Setebaid Services, Inc. may be obtained from the Pennsylvania Department of State by calling toll free, within Pennsylvania, 1-800-732-0999. Registration does not imply endorsement.
  - region "Notifications alt+T"
  - alert [ref=f4e189]
```

# Test source

```ts
  64  |       const style = getComputedStyle(element);
  65  |       const movingProperties = new Set([
  66  |         "all",
  67  |         "rotate",
  68  |         "scale",
  69  |         "transform",
  70  |         "translate",
  71  |       ]);
  72  |       // Computed lists are comma-separated and a shorter duration list
  73  |       // repeats, so pair each entry with its own duration by index.
  74  |       const list = (value: string) => value.split(",").map((item) => item.trim());
  75  |       const durations = list(style.transitionDuration);
  76  |       const hasMovementTransition = list(style.transitionProperty).some(
  77  |         (property, index) =>
  78  |           movingProperties.has(property) &&
  79  |           parseFloat(durations[index % durations.length]) > 0,
  80  |       );
  81  |       const animationDurations = list(style.animationDuration);
  82  |       const hasAnimation = list(style.animationName).some(
  83  |         (name, index) =>
  84  |           name !== "none" &&
  85  |           parseFloat(animationDurations[index % animationDurations.length]) > 0,
  86  |       );
  87  | 
  88  |       return hasAnimation || hasMovementTransition;
  89  |     }).length,
  90  |   );
  91  | }
  92  | 
  93  | test.describe("every prebuilt route", () => {
  94  |   test.use({ contextOptions: { reducedMotion: "reduce" }, viewport: desktop });
  95  | 
  96  |   // A full site lists over a hundred routes. Walking them in one test took
  97  |   // 67 s of the release gate, so the walk is split into fixed shards that
  98  |   // Playwright runs in parallel workers against the same server. A shard
  99  |   // with no routes passes.
  100 |   const routeShards = 4;
  101 | 
  102 |   for (let shard = 0; shard < routeShards; shard += 1) {
  103 |     test(`renders with landmarks, no overflow, and no reduced-motion movement (shard ${shard + 1} of ${routeShards})`, async ({
  104 |       page,
  105 |       request,
  106 |     }) => {
  107 |       test.setTimeout(180_000);
  108 | 
  109 |       const routes = (await sitemapRoutes(request)).filter(
  110 |         (_, index) => index % routeShards === shard,
  111 |       );
  112 | 
  113 |       for (const route of routes) {
  114 |         await test.step(route, async () => {
  115 |           await gotoRoute(page, route);
  116 |           await expectAccessibleRoute(page);
  117 |           expect(
  118 |             await motionViolations(page),
  119 |             `${route} moves for reduced-motion visitors`,
  120 |           ).toBe(0);
  121 | 
  122 |           // The main navigation only exists at desktop widths; overflow only
  123 |           // shows at phone widths. Resize in place instead of loading twice.
  124 |           await page.setViewportSize(mobile);
  125 |           expect(await horizontalOverflow(page), `${route} overflows at ${mobile.width}px`).toBe(0);
  126 |           await page.setViewportSize(desktop);
  127 |         });
  128 |       }
  129 |     });
  130 |   }
  131 | 
  132 |   // One route per template that has published content. Scanning every
  133 |   // content document turns editor mistakes (skipped heading levels in old
  134 |   // posts) into red PRs, and the route loop above already covers every
  135 |   // document for the cheap rules. The home page always exists; the other
  136 |   // templates join the scan once the sitemap lists a route for them.
  137 |   test("passes an axe accessibility scan on each template", async ({
  138 |     page,
  139 |     request,
  140 |   }) => {
  141 |     const routes = await sitemapRoutes(request);
  142 |     expect(routes, "sitemap should list the home page").toContain("/");
  143 |     const templates = [
  144 |       "/",
  145 |       routes.find((route) => route !== "/" && !/^\/stories(?:\/|$)/.test(route)),
  146 |       routes.find((route) => route === "/stories"),
  147 |       routes.find((route) => /^\/stories\/(?!category\/)[^/]+$/.test(route)),
  148 |       routes.find((route) => /^\/stories\/category\/[^/]+$/.test(route)),
  149 |     ].filter((route): route is string => Boolean(route));
  150 |     const violations: string[] = [];
  151 | 
  152 |     for (const route of templates) {
  153 |       await test.step(route, async () => {
  154 |         await gotoRoute(page, route);
  155 |         const results = await new AxeBuilder({ page }).analyze();
  156 |         for (const violation of results.violations) {
  157 |           violations.push(
  158 |             `${route}: ${violation.id} (${violation.impact}) on ${violation.nodes.length} node(s) — ${violation.help}`,
  159 |           );
  160 |         }
  161 |       });
  162 |     }
  163 | 
> 164 |     expect(violations).toEqual([]);
      |                        ^ Error: expect(received).toEqual(expected) // deep equality
  165 |   });
  166 | });
  167 | 
  168 | test("serves the page card image at request time", async ({ page, request }) => {
  169 |   await page.goto("/", { waitUntil: "domcontentloaded" });
  170 |   const ogImage = await page
  171 |     .locator('meta[property="og:image"]')
  172 |     .getAttribute("content");
  173 |   expect(ogImage, "home page should declare an og:image").toMatch(/\/api\/og\/page\//);
  174 | 
  175 |   const { pathname, search } = new URL(ogImage!);
  176 |   const response = await request.get(pathname + search);
  177 |   expect(response.status()).toBe(200);
  178 |   expect(response.headers()["content-type"]).toMatch(/^image\//);
  179 | });
  180 | 
  181 | test("reaches the skip link and the home link by keyboard", async ({ page }) => {
  182 |   await page.goto("/", { waitUntil: "domcontentloaded" });
  183 | 
  184 |   await page.keyboard.press("Tab");
  185 |   await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  186 |   await page.keyboard.press("Enter");
  187 |   await expect(page).toHaveURL(/#main-content$/);
  188 | 
  189 |   await page.goto("/", { waitUntil: "domcontentloaded" });
  190 |   await page.keyboard.press("Tab");
  191 |   await page.keyboard.press("Tab");
  192 |   await expect(
  193 |     page.getByRole("link", { name: /home page/i }).first(),
  194 |   ).toBeFocused();
  195 | });
  196 | 
  197 | // The name of the camp site this code base started from. Built from parts
  198 | // so the repository search for leftover names stays at zero hits.
  199 | const previousSiteName = new RegExp(["Canadian", "Adventure", "Camp"].join("\\s+"), "i");
  200 | 
  201 | test("shows the Setebaid site name on the home page and not the previous one", async ({
  202 |   page,
  203 | }) => {
  204 |   await gotoRoute(page, "/");
  205 | 
  206 |   await expect(page).toHaveTitle(/Setebaid Services/);
  207 |   await expect(page.locator("body")).toContainText("Setebaid Services");
  208 |   // The whole document, so meta tags, alt text and accessible names count.
  209 |   expect(await page.content()).not.toMatch(previousSiteName);
  210 | });
  211 | 
  212 | // The contact page joins this check once it is published.
  213 | test("keeps the home and contact pages free of horizontal overflow at every width", async ({
  214 |   page,
  215 |   request,
  216 | }) => {
  217 |   const routes = await sitemapRoutes(request);
  218 |   const pages = ["/", "/contact"].filter((route) => routes.includes(route));
  219 |   expect(pages, "sitemap should list the home page").toContain("/");
  220 | 
  221 |   for (const viewport of [
  222 |     mobile,
  223 |     { height: 1024, width: 768 },
  224 |     { height: 1000, width: 1440 },
  225 |   ]) {
  226 |     await page.setViewportSize(viewport);
  227 |     for (const route of pages) {
  228 |       await gotoRoute(page, route);
  229 |       expect(await horizontalOverflow(page), `${route} at ${viewport.width}px`).toBe(0);
  230 |     }
  231 |   }
  232 | });
  233 | 
```