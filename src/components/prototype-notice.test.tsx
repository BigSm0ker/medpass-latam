import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PrototypeNotice } from "./prototype-notice";

describe("PrototypeNotice", () => {
  it("clearly warns that the application is not for clinical use", () => {
    render(<PrototypeNotice />);

    expect(screen.getByRole("note")).toHaveTextContent(
      "Prototipo de hackathon — no apto para uso clínico",
    );
  });
});
