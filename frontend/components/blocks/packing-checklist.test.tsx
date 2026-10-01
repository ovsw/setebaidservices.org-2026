import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PackingChecklist from "./packing-checklist";

type Group = NonNullable<ComponentProps<typeof PackingChecklist>["groups"]>[number];

function group(
  key: string,
  title: string,
  items: Array<[string, string, string | null]>,
  tone: "normal" | "leaveAtHome" = "normal",
): Group {
  return {
    _key: key,
    title,
    tone,
    items: items.map(([itemKey, label, quantity]) => ({
      _key: itemKey,
      label,
      quantity,
    })),
  };
}

const block: ComponentProps<typeof PackingChecklist> = {
  _key: "kit",
  _type: "packingChecklist",
  background: "green",
  eyebrow: "What to pack",
  title: [
    {
      _key: "heading",
      _type: "block",
      style: "normal",
      markDefs: null,
      children: [
        { _key: "plain", _type: "span", marks: [], text: "Pack it " },
        { _key: "accent", _type: "span", marks: ["em"], text: "once" },
      ],
    },
  ],
  intro: "Tick things off as they go in the bag.",
  groups: [
    group("clothing", "Clothing", [
      ["underwear", "Underwear", "14"],
      ["socks", "Socks", "12"],
    ]),
    group("bedding", "Bedding", [["pillow", "Pillow", null]]),
    group(
      "home",
      "Leave at home",
      [["phone", "Phones. They stay home; friendships don't.", null]],
      "leaveAtHome",
    ),
  ],
  note: null,
  pdf: {
    _id: "file-abc-pdf",
    url: "https://cdn.sanity.io/files/test/test/abc.pdf",
    originalFilename: "packing-list.pdf",
    size: 1024,
  },
  image: null,
  dataAttribute: (path) => `section:${path}`,
};

function checkbox(name: string) {
  return screen.getByRole("checkbox", { name });
}

describe("PackingChecklist", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.print = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("names every checkbox with its label and quantity, and never makes leave-at-home items tickable", () => {
    render(<PackingChecklist {...block} />);

    expect(checkbox("Underwear × 14")).not.toBeChecked();
    expect(checkbox("Socks × 12")).not.toBeChecked();
    expect(checkbox("Pillow")).not.toBeChecked();
    expect(screen.getAllByRole("checkbox")).toHaveLength(3);

    const home = screen.getByRole("list", { name: "Leave at home" });
    expect(within(home).queryByRole("checkbox")).toBeNull();
    expect(
      within(home).getByText("Phones. They stay home; friendships don't."),
    ).toBeInTheDocument();
  });

  it("keeps ticks across a remount on the same page and clears them on request", async () => {
    const user = userEvent.setup();
    const first = render(<PackingChecklist {...block} />);

    await user.click(checkbox("Underwear × 14"));
    await user.click(checkbox("Pillow"));
    expect(screen.getByRole("status")).toHaveTextContent("2 of 3 packed");
    first.unmount();

    render(<PackingChecklist {...block} />);
    expect(checkbox("Underwear × 14")).toBeChecked();
    expect(checkbox("Pillow")).toBeChecked();
    expect(checkbox("Socks × 12")).not.toBeChecked();
    expect(screen.getByRole("status")).toHaveTextContent("2 of 3 packed");

    await user.click(screen.getByRole("button", { name: "Clear ticks" }));
    expect(screen.getAllByRole("checkbox").every((box) => !(box as HTMLInputElement).checked)).toBe(
      true,
    );
    expect(screen.getByRole("status")).toHaveTextContent("0 of 3 packed");
    expect(screen.getByRole("button", { name: "Clear ticks" })).toBeDisabled();
    expect(
      Object.keys(window.localStorage).filter((key) => key.startsWith("cac:packing-checklist")),
    ).toHaveLength(0);
  });

  it("keeps items with the same key in different groups independent", async () => {
    const user = userEvent.setup();
    render(
      <PackingChecklist
        {...block}
        groups={[
          group("clothing", "Clothing", [["hat", "Sun hat", null]]),
          group("must", "Must bring", [["hat", "Warm hat", null]]),
        ]}
      />,
    );

    await user.click(checkbox("Sun hat"));
    expect(checkbox("Sun hat")).toBeChecked();
    expect(checkbox("Warm hat")).not.toBeChecked();
    expect(screen.getByRole("status")).toHaveTextContent("1 of 2 packed");
    expect(checkbox("Sun hat").id).not.toBe(checkbox("Warm hat").id);
  });

  it("keeps a collapsed group collapsed while ticks change elsewhere", async () => {
    const user = userEvent.setup();
    render(<PackingChecklist {...block} />);

    const bedding = screen.getByText("Bedding").closest("details") as HTMLDetailsElement;
    expect(bedding.open).toBe(true);
    await user.click(screen.getByText("Bedding"));
    expect(bedding.open).toBe(false);

    await user.click(checkbox("Underwear × 14"));
    await user.click(screen.getByRole("button", { name: "Clear ticks" }));
    expect(bedding.open).toBe(false);
  });

  it("works from the keyboard: tab to the print button and each box, space toggles", async () => {
    const user = userEvent.setup();
    render(<PackingChecklist {...block} />);

    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Print list" }));
    await user.keyboard("{Enter}");
    expect(window.print).toHaveBeenCalledTimes(1);

    // Clear ticks is disabled with nothing packed, so focus skips past it. The
    // group summary is focusable in browsers but not in jsdom, so allow one
    // extra stop before the first box.
    await user.tab();
    if (document.activeElement !== checkbox("Underwear × 14")) await user.tab();
    expect(document.activeElement).toBe(checkbox("Underwear × 14"));
    await user.keyboard(" ");
    expect(checkbox("Underwear × 14")).toBeChecked();
    await user.tab();
    expect(document.activeElement).toBe(checkbox("Socks × 12"));
  });

  it("isolates the section for print and restores the page after", async () => {
    const user = userEvent.setup();
    const sibling = document.createElement("footer");
    document.body.append(sibling);
    render(<PackingChecklist {...block} />);

    await user.click(screen.getByRole("button", { name: "Print list" }));
    expect(sibling).toHaveAttribute("data-print-hidden");
    expect(document.getElementById("packing-checklist-kit")).not.toHaveAttribute(
      "data-print-hidden",
    );

    window.dispatchEvent(new Event("afterprint"));
    expect(sibling).not.toHaveAttribute("data-print-hidden");
    sibling.remove();
  });

  it("links the PDF and keeps editing paths keyed", () => {
    render(<PackingChecklist {...block} />);

    expect(screen.getByRole("link", { name: "Download the list as a PDF" })).toHaveAttribute(
      "href",
      "https://cdn.sanity.io/files/test/test/abc.pdf",
    );
    expect(screen.getByText("Clothing")).toHaveAttribute(
      "data-sanity",
      'section:groups[_key=="clothing"].title',
    );
    expect(checkbox("Underwear × 14").closest("li")).toHaveAttribute(
      "data-sanity",
      'section:groups[_key=="clothing"].items[_key=="underwear"]',
    );
  });

  it("renders nothing without a heading or without a complete group", () => {
    const { container, unmount } = render(<PackingChecklist {...block} title={null} />);
    expect(container.querySelector("section")).toBeNull();
    unmount();

    const empty = render(
      <PackingChecklist {...block} groups={[group("blank", "   ", [["x", "", null]])]} />,
    );
    expect(empty.container.querySelector("section")).toBeNull();
  });
});
