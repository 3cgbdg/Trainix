"use client"

import { INutritionDayPlan } from "@/types/types"


const NutritionPlanPage = ({ day }: { day: INutritionDayPlan }) => {
    console.log(day);
    return (
        <div className="">
            <h1 className="page-title mb-6">Personalized Nutrition Plan</h1>
            <div className="_border p-6 rounded-[10px] bg-[#F5FAF5FF] col-span-2">
                <div className="flex flex-col gap-12.5">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-xl leading-7 font-semibold text-black font-outfit">Today's Nutrition Goals</h2>
                        <p className="text-black text-sm">Stay on track with your personalized diet plan.</p>
                    </div>
                    <div className="grid grid-cols-4 gap-6">
                        <div className="flex flex-col gap-1">
                            <div className="flex justify-between items-center text-black">
                                <span className="font-medium">Calories</span>
                                <span className="text-sm font-semibold">{day.dailyGoals.calories.current}/{day.dailyGoals.calories.target} kcal</span>
                            </div>
                            <div className="w-full h-2 overflow-hidden bg-[#EBF5E9FF] _border rounded-sm">
                                <div style={{ "width": `${day.dailyGoals.calories.current}%` }} className={` h-full bg-green`}></div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="flex justify-between items-center text-black">
                                <span className="font-medium">Protein</span>
                                <span className="text-sm font-semibold">{day.dailyGoals.protein.current}/{day.dailyGoals.protein.target} g</span>
                            </div>
                            <div className="w-full h-2 overflow-hidden bg-[#EBF5E9FF] _border rounded-sm">
                                <div style={{ "width": `${day.dailyGoals.protein.current}%` }} className={` h-full bg-green`}></div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="flex justify-between items-center text-black">
                                <span className="font-medium">Carbs</span>
                                <span className="text-sm font-semibold">{day.dailyGoals.carbs.current}/{day.dailyGoals.carbs.target} g</span>
                            </div>
                            <div className="w-full h-2 overflow-hidden bg-[#EBF5E9FF] _border rounded-sm">
                                <div style={{ "width": `${day.dailyGoals.carbs.current}%` }} className={` h-full bg-green`}></div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="flex justify-between items-center text-black">
                                <span className="font-medium">Fats</span>
                                <span className="text-sm font-semibold">{day.dailyGoals.fats.current}/{day.dailyGoals.fats.target} g</span>
                            </div>
                            <div className="w-full h-2 overflow-hidden bg-[#EBF5E9FF] _border rounded-sm">
                                <div style={{ "width": `${day.dailyGoals.fats.current}%` }} className={` h-full bg-green`}></div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            <div className="mt-9 flex gap-6">
                <div className="flex flex-col gap-6">
                    <h2 className="section-title">Your Daily Meals</h2>
                </div>

                <div className="flex flex-col gap-6"></div>
            </div>
           

        </div>
    )
}

export default NutritionPlanPage