// Migration: move the hero's View Film array button into the dedicated
// filmButton field on the PUBLISHED homePage, in place. The draft was
// already migrated separately; published stays published.
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-01-01" });

async function run() {
  const doc = await client.getDocument("homePage");
  if (!doc) throw new Error("homePage not found");
  const hero = (doc.blocks as Array<any> | undefined)?.find(
    (b) => b._type === "homeHero",
  );
  if (!hero) throw new Error("homeHero block not found");
  const film = (hero.buttons as Array<any> | undefined)?.find(
    (b) => b.url?.type === "external" && /youtube|vimeo/.test(b.url.external ?? ""),
  );
  if (!film) {
    console.log("No film button in published buttons; nothing to do.");
    return;
  }
  await client
    .patch("homePage")
    .set({
      [`blocks[_key=="${hero._key}"].filmButton`]: {
        label: film.text ?? "Watch the film",
        url: film.url.external,
      },
    })
    .unset([`blocks[_key=="${hero._key}"].buttons[_key=="${film._key}"]`])
    .commit();
  console.log("Migrated published homePage film button:", film._key);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
