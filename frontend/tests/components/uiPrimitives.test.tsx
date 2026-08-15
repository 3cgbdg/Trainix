import { fireEvent, render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/Feedback";
import { TextField } from "@/components/ui/Field";
import { Switch } from "@/components/ui/Switch";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { TrendChart } from "@/components/ui/TrendChart";

describe("UI primitives", () => {
  it("announces a busy button and prevents duplicate activation", () => {
    render(<Button loading loadingLabel="Saving profile">Save</Button>);

    const button = screen.getByRole("button", { name: "Saving profile" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  it("connects field errors to the input", () => {
    render(<TextField label="Email" error="Enter a valid email" />);

    const input = screen.getByRole("textbox", { name: "Email" });
    const error = screen.getByRole("alert");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", error.id);
  });

  it("exposes switch state and toggles through one callback", () => {
    const onCheckedChange = jest.fn();
    render(<Switch checked={false} onCheckedChange={onCheckedChange} label="Workout reminders" />);

    const control = screen.getByRole("switch", { name: "Workout reminders" });
    expect(control).toHaveAttribute("aria-checked", "false");
    fireEvent.click(control);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("provides a retry action for recoverable failures", () => {
    const onRetry = jest.fn();
    render(<ErrorState onRetry={onRetry} />);

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("clamps progress values while exposing the real scale", () => {
    render(<ProgressBar label="Daily calories" value={2600} max={2200} />);

    const progress = screen.getByRole("progressbar", { name: "Daily calories" });
    expect(progress).toHaveAttribute("aria-valuemin", "0");
    expect(progress).toHaveAttribute("aria-valuemax", "2200");
    expect(progress).toHaveAttribute("aria-valuenow", "2200");
    expect(progress.firstChild).toHaveStyle({ width: "100%" });
  });

  it("gives lightweight trend charts an accessible name", () => {
    render(
      <TrendChart
        ariaLabel="Weight over time"
        data={[{ label: "Jan", values: { weight: 80 } }, { label: "Feb", values: { weight: 78 } }]}
        series={[{ key: "weight", label: "Weight", color: "green" }]}
      />,
    );

    expect(screen.getByRole("img", { name: "Weight over time" })).toBeInTheDocument();
    expect(screen.getByText("Jan")).toBeInTheDocument();
    expect(screen.getByText("Feb")).toBeInTheDocument();
  });
});
