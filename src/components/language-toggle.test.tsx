import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { LanguageProvider } from "@/lib/i18n";
import { LanguageToggle } from "./language-toggle";
import { PrototypeNotice } from "./prototype-notice";

function Harness() {
  return (
    <LanguageProvider>
      <LanguageToggle />
      <PrototypeNotice />
    </LanguageProvider>
  );
}

describe("LanguageToggle", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("starts in Spanish, the product's first language", () => {
    render(<Harness />);

    expect(screen.getByRole("button", { name: "Español" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("note")).toHaveTextContent(
      "Prototipo de hackathon — no apto para uso clínico",
    );
  });

  it("switches the surrounding copy to English", async () => {
    render(<Harness />);

    await userEvent.click(screen.getByRole("button", { name: "English" }));

    expect(screen.getByRole("note")).toHaveTextContent(
      "Hackathon prototype — not for clinical use",
    );
    expect(document.documentElement.lang).toBe("en");
  });

  it("remembers the choice so a returning reader is not switched back", async () => {
    const { unmount } = render(<Harness />);
    await userEvent.click(screen.getByRole("button", { name: "English" }));
    unmount();

    render(<Harness />);

    expect(screen.getByRole("button", { name: "English" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});
