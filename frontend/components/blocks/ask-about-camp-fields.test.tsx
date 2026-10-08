import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { sendAskAboutCamp, track } = vi.hoisted(() => ({
  sendAskAboutCamp: vi.fn(),
  track: vi.fn(),
}));

vi.mock("@/app/actions/ask-about-camp", () => ({ sendAskAboutCamp }));
vi.mock("@vercel/analytics", () => ({ track }));

import { AskAboutCampFields } from "./ask-about-camp-fields";

function renderForm() {
  return render(
    <AskAboutCampFields
      choices={[{ label: "Cost and financial help", value: "Cost and financial help" }]}
      director={{ label: "Talk with the camp director", value: "Talk with the camp director" }}
      editing={{}}
      errorMessage="We could not send your request."
      officePhone="(610) 555-0100"
      privacyLine="We only use this to call you back."
      successMessage="Thank you. We will call you within two working days."
    />,
  );
}

async function fillIn() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Your name"), "Dana Rivera");
  await user.type(screen.getByLabelText("Phone"), "610-555-0123");
  await user.type(screen.getByLabelText("Email"), "dana@example.com");
  await user.type(screen.getByLabelText("Your child's age"), "9");
  await user.click(screen.getByLabelText("Cost and financial help"));
  return user;
}

describe("AskAboutCampFields", () => {
  beforeEach(() => {
    sendAskAboutCamp.mockReset();
    track.mockReset();
    window.sessionStorage.setItem(
      "setebaid-visit-source",
      JSON.stringify({ source: "chop-nurses", medium: "qr-card", campaign: "fall-2026-events" }),
    );
    window.history.replaceState(null, "", "/go/events");
  });

  it("records form_sent with only the Source and the page", async () => {
    sendAskAboutCamp.mockResolvedValue({ status: "sent" });
    renderForm();
    const user = await fillIn();
    await user.click(screen.getByRole("button", { name: "Send my request" }));

    await screen.findByText("Thank you. We will call you within two working days.");
    expect(track).toHaveBeenCalledTimes(1);
    expect(track).toHaveBeenCalledWith("form_sent", { source: "chop-nurses", page: "/go/events" });

    const sentData = sendAskAboutCamp.mock.calls[0][1] as FormData;
    expect(sentData.get("source")).toBe("chop-nurses");
    expect(sentData.get("campaign")).toBe("fall-2026-events");
    expect(sentData.get("page")).toBe("/go/events");
  });

  it("does not send or record anything when an answer is missing", async () => {
    renderForm();
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Send my request" }));

    expect(screen.getByLabelText("Your name")).toHaveAccessibleDescription("Enter your name.");
    expect(screen.getByLabelText("Your name")).toHaveFocus();
    expect(sendAskAboutCamp).not.toHaveBeenCalled();
    expect(track).not.toHaveBeenCalled();
  });

  it("shows the error message and the office phone when sending fails", async () => {
    sendAskAboutCamp.mockResolvedValue({ status: "failed" });
    renderForm();
    const user = await fillIn();
    await user.click(screen.getByRole("button", { name: "Send my request" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("We could not send your request.");
    expect(screen.getByRole("link", { name: "(610) 555-0100" })).toHaveAttribute(
      "href",
      "tel:6105550100",
    );
    expect(screen.getByLabelText("Your name")).toHaveValue("Dana Rivera");
    expect(track).not.toHaveBeenCalled();
  });

  it("ticks the director choice when opened from a Talk to the director link", async () => {
    window.history.replaceState(null, "", "/ask-about-camp#talk-to-the-director");
    renderForm();

    await waitFor(() =>
      expect(screen.getByLabelText("Talk with the camp director")).toBeChecked(),
    );
  });

  it("ticks the director choice when a link on the same page is clicked", async () => {
    window.history.replaceState(null, "", "/ask-about-camp");
    renderForm();
    render(
      // Like a Next.js link: the hash changes without a hashchange event.
      <a href="#talk-to-the-director" onClick={(event) => event.preventDefault()}>
        Ask for the director
      </a>,
    );

    expect(screen.getByLabelText("Talk with the camp director")).not.toBeChecked();
    await userEvent.setup().click(screen.getByRole("link", { name: "Ask for the director" }));
    expect(screen.getByLabelText("Talk with the camp director")).toBeChecked();
  });
});
