import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import measurementReducer from "../../redux/measurementSlice"
import authReducer from "../../redux/authSlice"
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import AiAnalysysPage from "@/app/(main)/ai-analysis/page"
import { store } from "@/redux/store";
import { reportExtractFunc } from "@/utils/report";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
 const AiDay1: string = `{
    "briefAnalysis": {
    "targetWeight": number,
    "fitnessLevel": string,
    "primaryFitnessGoal": string
  },
  "advices": {
    "nutrition": "dasdsad",
    "hydration": "dasdsad",
    "recovery": "dasdsad",
    "progress": "dasdsad"
  },
  "week1Title": "dasd3gf",
  "week2Title": "dasd3gf",
  "week3Title": "dasd3gf",
  "week4Title": "dasd3gf",
  "day":{
  "day": "Day 1",
  "dayNumber": 1,
  "calories": 2200,
  "status": "Pending",
  "date": "2025-09-01",
  "exercises": [
    {
      "imageUrl": "https://example.com/pushups.png",
      "status": "incompleted",
      "calories": 120,
      "title": "Push Ups",
      "repeats": 20,
      "time": null,
      "instruction": "Keep your back straight, lower chest to the floor, push back up.",
      "advices": "Do it slowly for better control."
    }
  ]
  }
  
    }`;
const mockMutate1 = jest.fn();
const mockMutateAsync1 = jest.fn();
const mockMutate2 = jest.fn();
const mockMutateAsync2 = jest.fn();

const mockUseQuery = jest.fn();
mockUseQuery.mockImplementation(() => ({
    data: { advices: null },
    isLoading: false,
    error: null,
}));
jest.mock("@tanstack/react-query", () => ({
    ...jest.requireActual("@tanstack/react-query"),
    useQuery: mockUseQuery,
    useMutation: jest
        .fn()
        .mockImplementationOnce((options) => ({
            mutate: (variables:any) => {
                mockMutate1(variables);
                if (options.onSuccess) {
                    options.onSuccess({ AIreport: AiDay1 });
                }
            },
            mutateAsync: mockMutateAsync1,
            isLoading: false,
        }))
        .mockImplementation(() => ({
            mutate: mockMutate2,
            mutateAsync: mockMutateAsync2,
            isLoading: false
        })),

}));


jest.mock("@/utils/report", () => ({
    reportExtractFunc: jest.fn()
}
))

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
    // ai report for  iterations
    const AiDay2: string = `{
  "day": "Day 2",
  "dayNumber": 2,
  "calories": 2200,
  "status": "Pending",
  "date": "2025-09-01",
  "exercises": [
    {
      "imageUrl": "https://example.com/pushups.png",
      "status": "incompleted",
      "calories": 120,
      "title": "Push Ups",
      "repeats": 20,
      "time": null,
      "instruction": "Keep your back straight, lower chest to the floor, push back up.",
      "advices": "Do it slowly for better control."
    }
  ]
    }`;
    // body metrics


    it("generating", async () => {
        //mocking getanalysis
        renderWithReduxState(<AiAnalysysPage />, {
            measurements: { measurements: null },
            auth: {
                user: {
                    firstName: "dasd",
                    lastName: "dsadas",
                    email: "dsadas",
                    dateOfBirth: Date,
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


        mockUseQuery
            .mockImplementationOnce(() => ({
                data: { data: { advices: null } }, 
                isLoading: false,
                error: null,
            }))
            .mockImplementationOnce(() => ({
                data: {
                    metrics: {
                        height: 188,
                        weight: 76,
                        waistToHipRatio: 53,
                        shoulderToWaistRatio: 23,
                        bodyFatPercent: 12,
                        muscleMass: 421,
                        leanBodyMass: 123,
                    },
                    imageUrl: "url",
                },
                isLoading: false,
                error: null,
            }));

        mockedReportExtractFunc.mockResolvedValue(undefined);
        // mocking post apis
        const file = new File(["dummy content"], "photo.png", { type: "image/png" });
        const input = screen.getByLabelText("input");
        fireEvent.change(input, {
            target: { files: [file] },
        });
        mockMutate1.mockImplementation((file, { onSuccess }) => {
            onSuccess({ AIreport: AiDay1 });
        });
        mockMutateAsync2.mockResolvedValue({ AIreport: AiDay2 });

        // clicking button
        await waitFor(() => {
            expect(screen.getByRole("button", { name: /Proceed to Analysis/i })).toBeInTheDocument();
        });
        const btn = screen.getByRole("button", { name: /Proceed to Analysis/i });
        await act(async () => {
            fireEvent.click(btn);
        })
        expect(btn).toHaveTextContent(/Processing/i);
        // creating generated measurement
        await waitFor(async () => {
            expect(mockMutate1).toHaveBeenCalledTimes(1);
        })
        // then getting generated days created
        expect(store.getState().measurements.measurements).not.toBeNull();
        await waitFor(async () => {
            expect(mockMutateAsync2).toHaveBeenCalledTimes(28);
        })

        expect(btn).toHaveTextContent(/Proceed to Analysis/i)





        jest.clearAllMocks();
    });



})