process.env.NEXT_PUBLIC_API_URL = "http://localhost:5200";

import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import measurementReducer from "../../src/redux/measurementSlice"
import authReducer from "../../src/redux/authSlice"
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import AiAnalysysPage from "@/app/(main)/ai-analysis/page"
import { reportExtractFunc } from "@/utils/report";
import { QueryClient, QueryClientProvider, } from "@tanstack/react-query";

const mockMutate1 = jest.fn();
const mockUseQuery = jest.fn();
const mockApiGet = jest.fn();
const mockApiPost = jest.fn();

// captures the handlers registered on the fake socket so the test can drive them
// (fitnessPlanProgress / fitnessPlanReady / fitnessPlanError) the way the real
// backend would over the actual socket connection
type SocketHandlers = Record<string, (payload?: unknown) => void>;
let lastSocketHandlers: SocketHandlers = {};
const mockSocketDisconnect = jest.fn();
const mockIo = jest.fn((..._args: unknown[]) => {
    lastSocketHandlers = {};
    return {
        on: (event: string, cb: (payload?: unknown) => void) => { lastSocketHandlers[event] = cb; },
        off: jest.fn(),
        disconnect: mockSocketDisconnect,
    };
});

// mocking useDropzone
jest.mock('react-dropzone', () => ({
    useDropzone: jest.fn().mockImplementation(({ onDrop }) => ({
        getRootProps: jest.fn(() => ({})),
        getInputProps: jest.fn(() => ({
            type: "file",
            onChange: (e: any) => {
                const files = e.target.files;
                if (files.length) onDrop(files);
            }
        })),
        isDragActive: false,
    }))
}));

jest.mock("socket.io-client", () => ({
    io: (...args: unknown[]) => mockIo(...args),
}));

mockUseQuery.mockReturnValue({
    data: { advices: null },
    isLoading: false,
    error: null,
});

jest.mock("@tanstack/react-query", () => ({
    ...jest.requireActual("@tanstack/react-query"),
    useQuery: (...args: any) => mockUseQuery(...args),
    useMutation: jest.fn((options) => {
        return {
            mutate: (variables: any) => mockMutate1(variables, options),
            isLoading: false,
        };
    })
}));


jest.mock("@/utils/report", () => ({
    reportExtractFunc: jest.fn()
}
))

jest.mock("@/api/axiosInstance", () => ({
    api: {
        get: (...args: any[]) => mockApiGet(...args),
        post: (...args: any[]) => mockApiPost(...args),
    },
}));

// rendering with redux + tanstack providers
const renderWithReduxState = (ui: React.ReactNode, preloadedState = {}) => {
    const store = configureStore({
        reducer: {
            measurements: measurementReducer,
            auth: authReducer,
        },
        preloadedState
    });
    const queryClient = new QueryClient();
    return {

        ...render(

            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    {ui}
                </QueryClientProvider>
            </Provider>
        ),
        store,
    }
}

describe("testing ai-analysis", () => {
    // mocking func for parsing aiData
    const mockedReportExtractFunc = reportExtractFunc as jest.Mock;

    beforeEach(() => {
        mockApiGet.mockImplementation((url: string) => {
            if (url === "/api/auth/socket-token") return Promise.resolve({ data: { token: "socket-token" } });
            if (url === "/api/fitness-plan/workouts") return Promise.resolve({ data: { items: [{ dayNumber: 1 }], dates: [] } });
            return Promise.resolve({ data: {} });
        });
        mockApiPost.mockResolvedValue({ data: { message: "Plan generation started" } });
    });

    it("kicks off server-side generation and waits for the socket to report completion", async () => {
        const { store: testStore } = renderWithReduxState(<AiAnalysysPage />, {
            measurements: { measurements: null },
            auth: {
                user: {
                    firstName: "dasd",
                    lastName: "dsadas",
                    email: "dsadas",
                    dateOfBirth: "dasdsadasd",
                    gender: "Male",
                    metrics: {
                        weight: 12,
                        height: 12,
                        waistToHipRatio: 12,
                        shoulerToWaistRatio: 12,
                        percentOfLegsLength: 12,
                        shoulderAsymmetricLine: 12,
                        shoulderAngle: 12

                    },
                    _id: "dasdasdsad",
                    imageUrl: "url",
                    longestStreak: 31,
                    targetWeight: 31,
                    fitnessLevel: "Beginner",
                    primaryFitnessGoal: "Lose weight",
                    inAppNotifications: false,
                }
            }
        });


        mockUseQuery.mockReturnValueOnce({
            data: { advices: null },
            isLoading: false,
            error: null,
        });

        mockedReportExtractFunc.mockResolvedValue({
            metrics: {
                height: 188,
                weight: 76,
                waistToHipRatio: 0.82,
                shoulderToWaistRatio: 1.42,
                bodyFatPercent: 18,
                muscleMass: 34,
                leanBodyMass: 62,
            },
            imageUrl: "url",
        });

        // mocking file dragging
        const file = new File(["dummy content"], "photo.png", { type: "image/png" });
        const input = screen.getByLabelText("input");
        await act(async () => {
            fireEvent.change(input, { target: { files: [file] } });
        });


        // clicking button
        await waitFor(() => {
            expect(screen.getByLabelText("btn")).toBeInTheDocument();
        });
        const btn = screen.getByLabelText("btn");
        expect(btn).toBeEnabled();
        await act(async () => {
            fireEvent.click(btn);
        })

        // creating generated measurement
        await waitFor(async () => {
            expect(mockMutate1).toHaveBeenCalledTimes(1);
        })
        const mutationOptions = mockMutate1.mock.calls[0][1];
        act(() => {
            void mutationOptions.onSuccess({ AIreport: "{}" });
        });

        // measurement gets stored right away, before generation finishes
        await waitFor(() => {
            expect(testStore.getState().measurements.measurements).not.toBeNull();
        });

        // the whole 28-day plan is now generated server-side, in a single request
        await waitFor(() => {
            expect(mockApiPost).toHaveBeenCalledWith("/api/fitness-plan/generate");
        });

        // the socket connection is opened to track progress
        await waitFor(() => {
            expect(mockIo).toHaveBeenCalledTimes(1);
            expect(lastSocketHandlers.fitnessPlanProgress).toBeDefined();
        });

        // simulate the backend pushing progress, then completion
        act(() => {
            lastSocketHandlers.fitnessPlanProgress?.({ day: 14, total: 28 });
        });
        await waitFor(() => {
            expect(screen.getByText(/Generating day 14 of 28/i)).toBeInTheDocument();
        });

        act(() => {
            lastSocketHandlers.fitnessPlanReady?.({ total: 28 });
        });

        // once generation is reported ready, the plan/workouts get refetched and the
        // upload screen returns to its idle state
        await waitFor(() => {
            expect(mockApiGet).toHaveBeenCalledWith("/api/fitness-plan/workouts");
        });
        await waitFor(() => {
            expect(btn).toHaveTextContent(/Analyze photo/i);
        });
        expect(mockSocketDisconnect).toHaveBeenCalled();

        jest.clearAllMocks();
    });



})
