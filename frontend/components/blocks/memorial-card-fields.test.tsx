import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { sendMemorialCard, track } = vi.hoisted(() => ({
  sendMemorialCard: vi.fn(),
  track: vi.fn(),
}));

vi.mock("@/app/actions/memorial-card", () => ({ sendMemorialCard }));
vi.mock("@vercel/analytics", () => ({ track }));

import { MemorialCardFields } from "./memorial-card-fields";

const PRESET = "Extending our Sincerest Sympathy to you and your family at this time of sorrow.";

function renderForm() {
  return render(
    <MemorialCardFields
      byMailLine="Mail your check to Setebaid Services, P.O. Box 196, Winfield, PA 17889-0196."
      cards={[
        { key: "dove", label: "Dove With Sympathy", value: "Dove With Sympathy" },
        { key: "water", label: "Water With Sympathy", value: "Water With Sympathy" },
      ]}
      editing={{}}
      errorMessage="We could not send your card details."
      givingLink="https://setebaid.campbraingiving.com/"
      messages={[{ label: PRESET, value: PRESET }]}
      officePhone="(570) 524-9090"
      privacyLine="We use these details only for your gift and the card."
      successMessage="Thank you. We have your card details."
    />,
  );
}

async function next(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Next" }));
}

async function fillIn(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByLabelText("In memory of"));
  await user.type(screen.getByLabelText("The person's full name"), "Ruth Ellen Baker");
  await user.type(screen.getByLabelText("Gift amount"), "50");
  await user.click(screen.getByLabelText("Online in Camp Brain"));
  await next(user);

  await user.type(screen.getByLabelText("Name"), "The Baker family");
  await user.type(screen.getByLabelText("Street address"), "12 Orchard Lane");
  await user.type(screen.getByLabelText("City"), "Lewisburg");
  await user.type(screen.getByLabelText("State"), "PA");
  await user.type(screen.getByLabelText("Zip code"), "17837");
  await next(user);

  await user.click(screen.getByLabelText("Dove With Sympathy"));
  await user.click(screen.getByLabelText(PRESET));
  await next(user);

  await user.type(screen.getByLabelText("Name"), "Dana Rivera");
  await user.type(screen.getByLabelText("Street address"), "4 Mill Street");
  await user.type(screen.getByLabelText("City"), "Winfield");
  await user.type(screen.getByLabelText("State"), "PA");
  await user.type(screen.getByLabelText("Zip code"), "17889");
  await user.type(screen.getByLabelText("Phone"), "570-555-0142");
  await user.type(screen.getByLabelText("Email"), "dana@example.com");
}

describe("MemorialCardFields", () => {
  beforeEach(() => {
    sendMemorialCard.mockReset();
    track.mockReset();
    window.sessionStorage.setItem(
      "setebaid-visit-source",
      JSON.stringify({ source: "obituary", medium: "print", campaign: "fall-2026-events" }),
    );
    window.history.replaceState(null, "", "/donate/memorial");
  });

  it("checks only the current step on Next, and stays on it", async () => {
    renderForm();
    const user = userEvent.setup();
    await next(user);

    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("Step 1 of 4");
    expect(screen.getByLabelText("The person's full name")).toHaveAccessibleDescription(
      "Enter the person's full name.",
    );
    // Focus goes to the first answer with a problem.
    expect(screen.getByLabelText("In memory of")).toHaveFocus();
    expect(screen.queryByLabelText("Street address")).not.toBeInTheDocument();
    expect(sendMemorialCard).not.toHaveBeenCalled();
  });

  it("moves focus to the next step's heading, and Back keeps every answer", async () => {
    renderForm();
    const user = userEvent.setup();
    await user.click(screen.getByLabelText("In honor of"));
    await user.type(screen.getByLabelText("The person's full name"), "Coach Miller");
    await user.type(screen.getByLabelText(/The occasion/), "Retirement");
    await user.type(screen.getByLabelText("Gift amount"), "25");
    await user.click(screen.getByLabelText("By check in the mail"));
    await next(user);

    const heading = screen.getByRole("heading", { level: 3 });
    expect(heading).toHaveTextContent("Step 2 of 4Who gets the card");
    expect(heading).toHaveFocus();

    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByRole("heading", { level: 3 })).toHaveFocus();
    expect(screen.getByLabelText("In honor of")).toBeChecked();
    expect(screen.getByLabelText("The person's full name")).toHaveValue("Coach Miller");
    expect(screen.getByLabelText(/The occasion/)).toHaveValue("Retirement");
    expect(screen.getByLabelText("Gift amount")).toHaveValue("25");
    expect(screen.getByLabelText("By check in the mail")).toBeChecked();
  });

  it("sends every answer once, and records form_sent with only the Source and the page", async () => {
    sendMemorialCard.mockResolvedValue({ status: "sent" });
    renderForm();
    const user = userEvent.setup();
    await fillIn(user);
    await user.click(screen.getByRole("button", { name: "Send the card details" }));

    const thanks = await screen.findByRole("status");
    expect(thanks).toHaveTextContent("Thank you. We have your card details.");
    expect(within(thanks).getByRole("link", { name: /Give in Camp Brain/ })).toHaveAttribute(
      "href",
      "https://setebaid.campbraingiving.com/",
    );
    expect(track).toHaveBeenCalledTimes(1);
    expect(track).toHaveBeenCalledWith("form_sent", { source: "obituary", page: "/donate/memorial" });

    expect(sendMemorialCard).toHaveBeenCalledTimes(1);
    const sent = sendMemorialCard.mock.calls[0][0] as FormData;
    expect(sent.get("honoreeName")).toBe("Ruth Ellen Baker");
    expect(sent.get("recipientZip")).toBe("17837");
    expect(sent.get("cardDesign")).toBe("Dove With Sympathy");
    expect(sent.get("donorEmail")).toBe("dana@example.com");
    expect(sent.get("source")).toBe("obituary");
    expect(sent.get("page")).toBe("/donate/memorial");
  });

  it("shows the error message and the office phone when sending fails, and keeps the answers", async () => {
    sendMemorialCard.mockResolvedValue({ status: "failed" });
    renderForm();
    const user = userEvent.setup();
    await fillIn(user);
    await user.click(screen.getByRole("button", { name: "Send the card details" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("We could not send your card details.");
    expect(screen.getByRole("link", { name: "(570) 524-9090" })).toHaveAttribute("href", "tel:5705249090");
    expect(screen.getByLabelText("Email")).toHaveValue("dana@example.com");
    expect(track).not.toHaveBeenCalled();
  });
});
