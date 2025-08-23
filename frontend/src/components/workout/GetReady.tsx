import { IWorkouts } from "@/redux/workoutsSlice"
import { IDayPlan, IExercise } from "@/types/types"
import { Clock } from "lucide-react"
import React, { Dispatch, SetStateAction } from "react"

const GetReady = ({ id, workout, workouts, exercise, setStart }: { id: string, workout: IDayPlan | null, workouts: IWorkouts, exercise: IExercise | null, setStart: Dispatch<SetStateAction<boolean>> }) => {
    // getting ready section to start doing exercises
    
    return (
        <div className="grid lg:grid-cols-2 justify-center gap-6">
            <div className="flex items-center justify-center gap-6 bg-[#e5fcea] w-fit mx-auto _border rounded-2xl flex-col p-3 ">

                <div className="p-6 max-w-3xl mx-auto">
                    <h1 className="page-title mb-4"> Day {id}</h1>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-4 mb-6">
                        <div className="bg-green p-4 rounded-lg text-center ">
                            <p className="text-sm">Total Calories</p>
                            <p className="text-xl font-semibold">{workout?.calories} kcal</p>
                        </div>

                        <div className="bg-green p-4 rounded-lg text-center">
                            <p className="text-sm">Exercises Completed</p>
                            <p className="text-xl font-semibold">
                                {workout?.exercises.filter((ex) => ex.status === "completed").length} / {workout?.exercises.length}
                            </p>
                        </div>
                        <div className="bg-green p-4 rounded-lg text-center">
                            <p className="text-sm">Streak</p>
                            <p className="text-xl font-semibold">{workouts?.streak} </p>
                        </div>
                    </div>


                    <h2 className="text-xl font-semibold mb-2">Exercises</h2>
                    <ul className="flex flex-col gap-2">
                        {workout?.exercises.map((ex, idx) => (
                            <li
                                key={idx}
                                className={`flex justify-between item-center  p-3 rounded-lg gap-3 border ${ex.status === "completed" ? "bg-green-50 border-green" : "bg-gray-50 border-gray-200"
                                    }`}>
                                <span className="">{ex.title}</span>
                                <span className="whitespace-nowrap">
                                    {ex.calories} kcal | {ex.time ? (ex.time / 60).toFixed(0) + " min" : ex.repeats + " repeats"}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>


            </div>
            <div className="flex items-center justify-center lg:max-w-full max-w-[620px] gap-6 bg-[#e5fcea] _border rounded-2xl flex-col p-6 lg:min-h-[350px]">
                <span className="text-center page-title pb-10">Start workout: {exercise?.title}</span>
                {exercise?.repeats !== null ? <p className="text-xl leading-7 text-black">{exercise?.repeats} repeats</p>
                    : <span className="text-xl leading-7 text-black flex gap-1 items-center">
                        <Clock size={20} />
                        {exercise?.time != null ? (
                            `${String(Math.floor(exercise.time / 60)).padStart(2, "0")} : ${String(exercise.time % 60).padStart(2, "0")}`
                        ) : "00 : 00"}
                    </span>}
                <button onClick={() => setStart(true)} className="button-transparent max-w-[200px]  font-outfit flex items-center gap-2 w-full"> <span className="text-2xl">Start</span></button>

            </div></div>
    )
}

export default React.memo(GetReady)