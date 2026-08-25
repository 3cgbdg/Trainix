import { configureStore } from "@reduxjs/toolkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, waitFor } from "@testing-library/react";
import { StrictMode } from "react";
import { Provider } from "react-redux";
import AuthClientUpload from "@/components/loads/AuthClientUpload";
import authReducer from "@/redux/authSlice";
import measurementReducer from "@/redux/measurementSlice";
import nutritionDayReducer from "@/redux/nutritionDaySlice";
import workoutsReducer from "@/redux/workoutsSlice";

const apiGet = jest.fn();
const apiDelete = jest.fn();
const replace = jest.fn();

jest.mock("@/api/axiosInstance", () => ({
  api: {
    get: (...args: unknown[]) => apiGet(...args),
    delete: (...args: unknown[]) => apiDelete(...args),
  },
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

describe("authenticated application bootstrap", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("establishes the session once before loading dependent user data", async () => {
    let resolveProfile!: (value: { data: { user: Record<string, unknown> } }) => void;
    const profile = new Promise<{ data: { user: Record<string, unknown> } }>((resolve) => { resolveProfile = resolve; });

    apiGet.mockImplementation((url: string) => {
      if (url === "/api/auth/profile") return profile;
      if (url.includes("measurement")) return Promise.resolve({ data: { hasMeasurement: false, measurement: null } });
      if (url.includes("fitness-plan")) return Promise.resolve({ data: { hasPlan: false, items: [], dates: [], todayWorkoutNumber: null, currentWeekTitle: null, streak: 0 } });
      if (url.includes("nutrition-plan")) return Promise.resolve({ data: { hasPlan: false, hasCurrentDay: false } });
      return Promise.reject(new Error(`Unexpected request: ${url}`));
    });

    const store = configureStore({
      reducer: {
        auth: authReducer,
        measurements: measurementReducer,
        nutritionDay: nutritionDayReducer,
        workouts: workoutsReducer,
      },
    });
    const queryClient = new QueryClient();

    render(
      <StrictMode>
        <QueryClientProvider client={queryClient}>
          <Provider store={store}>
            <AuthClientUpload />
          </Provider>
        </QueryClientProvider>
      </StrictMode>,
    );

    await waitFor(() => expect(apiGet).toHaveBeenCalledTimes(1));
    expect(apiGet).toHaveBeenCalledWith("/api/auth/profile");

    await act(async () => {
      resolveProfile({ data: { user: { _id: "qa-user", firstName: "QA" } } });
      await profile;
    });

    await waitFor(() => expect(apiGet).toHaveBeenCalledTimes(4));
    expect(apiGet.mock.calls.map(([url]) => url)).toEqual([
      "/api/auth/profile",
      "api/measurement/measurements",
      "/api/fitness-plan/workouts",
      "api/nutrition-plan/nutrition-plans",
    ]);
    expect(store.getState().auth.user?._id).toBe("qa-user");
    expect(store.getState().measurements.measurements).toBeNull();
    expect(store.getState().nutritionDay.nutritionDay).toBeNull();
    expect(replace).not.toHaveBeenCalled();
  });
});
