import { logOut } from "@/redux/authSlice";
import { store } from "@/redux/store";

describe("session isolation", () => {
  it("clears every user-scoped Redux slice on logout", () => {
    store.dispatch({ type: "auth/getProfile", payload: { _id: "first-user", firstName: "First" } });
    store.dispatch({ type: "measurement/getMeasurement", payload: { imageUrl: "private.jpg", metrics: {} } });
    store.dispatch({ type: "fitnessPlan/getWorkouts", payload: { items: [{ day: "Private workout" }], dates: [], streak: 4 } });
    store.dispatch({ type: "nutritionDay/getNutritionDay", payload: { meals: [{ mealTitle: "Private meal" }] } });

    store.dispatch(logOut());

    expect(store.getState()).toEqual({
      auth: { user: null, initialized: true },
      workouts: { workouts: null },
      nutritionDay: { nutritionDay: null },
      measurements: { measurements: null },
    });
  });
});
