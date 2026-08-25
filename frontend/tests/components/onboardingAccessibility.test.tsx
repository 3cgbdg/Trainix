import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import OnboardingPage from "@/app/(auth)/onboarding/page";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

describe("onboarding accessibility", () => {
  it("associates the fitness selects with their visible labels", () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });

    render(
      <QueryClientProvider client={queryClient}>
        <OnboardingPage />
      </QueryClientProvider>,
    );

    expect(screen.getByLabelText("Your Fitness Level")).toHaveAttribute("name", "fitnessLevel");
    expect(screen.getByLabelText("Your Primary Fitness Goal")).toHaveAttribute("name", "primaryFitnessGoal");
  });
});
