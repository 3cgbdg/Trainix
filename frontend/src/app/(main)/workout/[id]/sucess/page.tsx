"use client"

import { useAppSelector } from "@/hooks/reduxHooks";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";

const Page = () => {
  const {id} = useParams() ;
  const { workouts } = useAppSelector(state => state.workouts);

  const workout = workouts?.items[Number(id) - 1];
  const totalCalories = useMemo(()=>workout?.exercises.reduce((acc, cur) => { return (cur.status == "completed" ? acc + cur.calories : acc) }, 0),[workout]);
  return (
    <div className="flex flex-col gap-3 items-center">
      <div className="flex items-center justify-center gap-6 bg-[#e5fcea] w-fit mx-auto _border rounded-2xl flex-col p-3 min-h-[350px]">

        <div className="p-6 max-w-3xl mx-auto">
          <h1 className="section-title mb-4">Results for the Day {id}</h1>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-green p-4 rounded-lg text-center ">
              <p className="text-sm">Calories</p>
              <p className="text-xl font-semibold">{totalCalories} kcal</p>
            </div>

            <div className="bg-green p-4 rounded-lg text-center">
              <p className="text-sm">Exercises completed</p>
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
                className={`flex justify-between p-3  rounded-lg gap-3 border ${ex.status === "completed" ? "bg-green-50 border-green" : "bg-gray-50 border-gray-200"
                  }`}>
                <span>{ex.title}</span>
                <span className=" whitespace-nowrap">
                  {ex.calories} kcal | {ex.time ?(ex.time/60).toFixed(0) + " min": ex.repeats + " repeats"} 
                </span>
              </li>
            ))}
          </ul>
        </div>
        

      </div>
          <Link className="button-transparent w-[150px] flex items-center gap-1" href={"/workout-plan"}><span>Go to your plan</span><ArrowRight size={20}/></Link>
      </div>
   
  )
}

export default Page