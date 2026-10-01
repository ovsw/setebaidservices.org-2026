import { act, fireEvent, render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ActivitySchedule from "./activity-schedule";

const motion = vi.hoisted(
  (): { inView: boolean; reduced: boolean | null } => ({
    inView: false,
    reduced: false,
  }),
);

vi.mock("motion/react", () => ({
  useInView: () => motion.inView,
  useReducedMotion: () => motion.reduced,
}));

const featuredActivities = Array.from({ length: 18 }, (_, index) => ({
  _id: `activity-${index + 1}`,
  _key: `activity-${index + 1}`,
  title: `Activity ${index + 1}`,
}));

const activitySchedule: ComponentProps<typeof ActivitySchedule> = {
  _key: "schedule-test",
  _type: "activitySchedule",
  background: "green",
  activityCount: 19,
  camperNames: ["Maya", "Leo"],
  description: "Choose a different day every morning.",
  featuredActivities,
  heading: [
    {
      _key: "heading-block",
      _type: "block",
      style: "normal",
      markDefs: null,
      children: [
        {
          _key: "heading-display",
          _type: "span",
          text: "activities. ",
          marks: [],
        },
        {
          _key: "heading-hand",
          _type: "span",
          text: "Their pick, every day.",
          marks: ["em"],
        },
      ],
    },
  ],
  dataAttribute: (path) => `section:${path}`,
  activityDataAttribute: (documentId, path) =>
    `activity:${documentId}:${path}`,
};

describe("ActivitySchedule", () => {
  beforeEach(() => {
    motion.inView = false;
    motion.reduced = false;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("shows the automatic total, 18 featured Activities, and the remainder link", () => {
    render(<ActivitySchedule {...activitySchedule} />);

    expect(
      screen.getByRole("heading", {
        name: "activities. Their pick, every day.",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: /^Activity \d+$/ }),
    ).toHaveLength(18);
    expect(
      screen.getByLabelText("19 activities. Their pick, every day."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "+ 1 more Activity" }),
    ).toHaveAttribute("href", "/summer-camp-activities");
  });

  it("never displays more than 18 featured Activities from stale data", () => {
    render(
      <ActivitySchedule
        {...activitySchedule}
        activityCount={25}
        featuredActivities={[
          ...featuredActivities,
          { _id: "activity-19", _key: "activity-19", title: "Activity 19" },
          { _id: "activity-20", _key: "activity-20", title: "Activity 20" },
        ]}
      />,
    );

    expect(screen.getAllByRole("button", { name: /^Activity \d+$/ })).toHaveLength(
      18,
    );
    expect(
      screen.getByRole("link", { name: "+ 7 more Activities" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Activity 19" }),
    ).not.toBeInTheDocument();
  });

  it("lets visitors add and remove a featured Activity", () => {
    render(<ActivitySchedule {...activitySchedule} />);

    const activity = screen.getByRole("button", { name: "Activity 1" });
    expect(activity).toHaveAttribute("aria-pressed", "false");
    expect(
      screen.getByRole("list", { name: "Maya's Tuesday schedule" }),
    ).toBeInTheDocument();

    fireEvent.click(activity);
    expect(activity).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByText("Activity 1", { selector: "ol span" }).className,
    ).toMatch(/activityReveal/);
    expect(
      screen.getByRole("list", { name: "Your Tuesday schedule" }),
    ).toBeInTheDocument();

    fireEvent.click(activity);
    expect(activity).toHaveAttribute("aria-pressed", "false");
  });

  it("tracks same-title Activities independently by document identity", () => {
    render(
      <ActivitySchedule
        {...activitySchedule}
        featuredActivities={[
          { _id: "climbing-a", _key: "climbing-a", title: "Climbing" },
          { _id: "climbing-b", _key: "climbing-b", title: "Climbing" },
          ...featuredActivities.slice(2),
        ]}
      />,
    );

    const [firstClimbing, secondClimbing] = screen.getAllByRole("button", {
      name: "Climbing",
    });
    fireEvent.click(firstClimbing);

    expect(firstClimbing).toHaveAttribute("aria-pressed", "true");
    expect(secondClimbing).toHaveAttribute("aria-pressed", "false");
  });

  it("pauses and resumes automatic schedule updates", () => {
    vi.useFakeTimers();
    motion.inView = true;
    render(<ActivitySchedule {...activitySchedule} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Pause automatic schedule" }),
    );
    expect(
      screen.getByRole("button", { name: "Resume automatic schedule" }),
    ).toHaveAttribute("aria-pressed", "true");

    act(() => vi.advanceTimersByTime(3000));
    expect(screen.getByRole("list")).not.toHaveTextContent("Activity 1");

    fireEvent.click(
      screen.getByRole("button", { name: "Resume automatic schedule" }),
    );
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByRole("list")).toHaveTextContent(/Activity \d+/);
  });

  it("updates a selected Activity when its title changes while paused", () => {
    const { rerender } = render(<ActivitySchedule {...activitySchedule} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Pause automatic schedule" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Activity 1" }));

    rerender(
      <ActivitySchedule
        {...activitySchedule}
        featuredActivities={featuredActivities.map((activity) =>
          activity._id === "activity-1"
            ? { ...activity, title: "Updated Activity" }
            : activity,
        )}
      />,
    );

    expect(screen.getByRole("list")).toHaveTextContent("Updated Activity");
    expect(screen.getByRole("list")).not.toHaveTextContent("Activity 1");
    expect(
      screen.getByRole("button", { name: "Resume automatic schedule" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("removes a selected Activity that is removed from the props while paused", () => {
    const { rerender } = render(<ActivitySchedule {...activitySchedule} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Pause automatic schedule" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Activity 1" }));

    rerender(
      <ActivitySchedule
        {...activitySchedule}
        featuredActivities={featuredActivities.filter(
          (activity) => activity._id !== "activity-1",
        )}
      />,
    );

    expect(screen.getByRole("list")).not.toHaveTextContent("Activity 1");
    expect(
      screen.getByRole("button", { name: "Resume automatic schedule" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("resumes immediately after a manual selection made while paused", () => {
    vi.useFakeTimers();
    vi.spyOn(Math, "random").mockReturnValue(0);
    motion.inView = true;
    render(<ActivitySchedule {...activitySchedule} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Pause automatic schedule" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Activity 1" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Resume automatic schedule" }),
    );

    act(() => vi.advanceTimersByTime(1000));

    expect(screen.getByRole("list")).toHaveTextContent("Activity 2");
  });

  it("hydrates safely when the reduced-motion preference resolves in the browser", async () => {
    motion.reduced = null;
    const container = document.createElement("div");
    container.innerHTML = renderToString(
      <ActivitySchedule {...activitySchedule} />,
    );
    expect(
      container.querySelector('[aria-label="Pause automatic schedule"]'),
    ).toBeNull();

    motion.reduced = false;
    const recoverableErrors: unknown[] = [];
    let root: ReturnType<typeof hydrateRoot>;
    await act(async () => {
      root = hydrateRoot(container, <ActivitySchedule {...activitySchedule} />, {
        onRecoverableError: (error) => recoverableErrors.push(error),
      });
    });

    expect(recoverableErrors).toEqual([]);
    expect(
      container.querySelector('[aria-label="Pause automatic schedule"]'),
    ).not.toBeNull();
    act(() => root.unmount());
  });

  it("returns ownership to automation when a new camper day begins", () => {
    vi.useFakeTimers();
    vi.spyOn(Math, "random").mockReturnValue(0);
    motion.inView = true;
    render(<ActivitySchedule {...activitySchedule} />);

    fireEvent.click(screen.getByRole("button", { name: "Activity 1" }));
    expect(screen.getByRole("list")).toHaveAccessibleName(
      "Your Tuesday schedule",
    );

    act(() => vi.advanceTimersByTime(12_000));
    expect(screen.getByRole("list")).toHaveAccessibleName(
      "Leo's Wednesday schedule",
    );
  });

  it("leaves blank schedule lines empty", () => {
    render(<ActivitySchedule {...activitySchedule} />);

    const schedule = screen.getByRole("list", {
      name: "Maya's Tuesday schedule",
    });

    expect(schedule.querySelector("[aria-hidden='true']")).toBeNull();
  });

  it("shows a complete static schedule when reduced motion is preferred", () => {
    motion.reduced = true;

    render(<ActivitySchedule {...activitySchedule} />);

    const schedule = screen.getByRole("list", {
      name: "Maya's Tuesday schedule",
    });
    expect(schedule).toHaveTextContent("Activity 1");
    expect(schedule).toHaveTextContent("Activity 4");
    expect(screen.queryByText("Building a day…")).not.toBeInTheDocument();
    expect(screen.getByText("Full day!")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /automatic schedule/ }),
    ).not.toBeInTheDocument();
  });

  it("links section fields and Activity titles back to Studio", () => {
    const { container } = render(<ActivitySchedule {...activitySchedule} />);

    expect(container.querySelector('[data-sanity="section:heading"]')).not.toBeNull();
    expect(container.querySelector('[data-sanity="section:description"]')).not.toBeNull();
    expect(container.querySelector('[data-sanity="section:camperNames"]')).not.toBeNull();
    expect(
      container.querySelector(
        '[data-sanity="activity:activity-1:title"]',
      ),
    ).not.toBeNull();
  });
});
