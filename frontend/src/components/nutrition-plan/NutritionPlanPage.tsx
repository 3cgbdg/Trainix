"use client"

import { INutritionDayPlan } from "@/types/types"
import { useRef, useState } from "react"
import MealAccordion from "./MealAccordion";
import { GlassWater } from "lucide-react";
import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "@/api/axiosInstance";
import { useMutation, useQuery } from "@tanstack/react-query";
import { logWater } from "@/redux/nutritionDaySlice";
import { useAppDispatch } from "@/hooks/reduxHooks";





const NutritionPlanPage = ({ day }: { day: INutritionDayPlan }) => {
    const [isOpen, setIsOpen] = useState<string | null>(null);
    const input = useRef<HTMLInputElement>(null);
    const dispatch = useAppDispatch();
    // amount of drinked water  
    const [amount, setAmount] = useState<number>(0);
    const [error, setError] = useState<string | null>(null);
    const weekNumber = day.dayNumber < 8 ? 1 : day.dayNumber < 15 ? 2 : day.dayNumber < 22 ? 3 : 4
    const getWeeklyStatistics = async () => {
        const res = await api.get(`/api/nutrition-plan/statistics?week=${weekNumber}`);
        return res.data;
    }
    const { isLoading, data: statistics } = useQuery({
        queryKey: ["statistics", weekNumber],
        queryFn: getWeeklyStatistics,
    })
    const logWaterAmount = async (dayNumber: number, amount: number) => {
        const res = await api.patch(`api/nutrition-plan/nutrition-plans/days/${dayNumber}/water`, { amount });
        return res.data;

    }
    const mutation = useMutation({
        mutationFn: ({ dayNumber, amount }: { dayNumber: number; amount: number }) => logWaterAmount(dayNumber, amount),
        onSuccess: () => {
            dispatch(logWater(amount))
        }

    })
        return (
        <div className="">
            <h1 className="page-title mb-6">Personalized Nutrition Plan</h1>
            <div className="_border p-6 rounded-[10px]  bg-[#F5FAF5FF] col-span-2">
                <div className="flex flex-col gap-12.5">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-xl leading-7 font-semibold text-black font-outfit">Today's Nutrition Goals</h2>
                        <p className="text-black text-sm">Stay on track with your personalized diet plan.</p>
                    </div>
                    <div className="grid md:grid-cols-4 gap-6">
                        <div className="flex flex-col gap-1">
                            <div className="flex justify-between  text-black gap-2 flex-col">
                                <span className="font-medium">Calories</span>
                                <span className="text-sm font-semibold">{day.dailyGoals.calories.current}/{day.dailyGoals.calories.target} kcal</span>
                            </div>
                            <div className="w-full h-2 overflow-hidden bg-[#EBF5E9FF] _border rounded-sm">
                                <div style={{ "width": `${day.dailyGoals.calories.current / day.dailyGoals.calories.target * 100}%` }} className={` h-full bg-green transition-all`}></div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="flex justify-between  text-black gap-2 flex-col">
                                <span className="font-medium">Protein</span>
                                <span className="text-sm font-semibold">{day.dailyGoals.protein.current}/{day.dailyGoals.protein.target} g</span>
                            </div>
                            <div className="w-full h-2 overflow-hidden bg-[#EBF5E9FF] _border rounded-sm">
                                <div style={{ "width": `${day.dailyGoals.protein.current / day.dailyGoals.protein.target * 100}%` }} className={` h-full bg-green transition-all`}></div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="flex justify-between  text-black gap-2 flex-col">
                                <span className="font-medium">Carbs</span>
                                <span className="text-sm font-semibold">{day.dailyGoals.carbs.current}/{day.dailyGoals.carbs.target} g</span>
                            </div>
                            <div className="w-full h-2 overflow-hidden bg-[#EBF5E9FF] _border rounded-sm">
                                <div style={{ "width": `${day.dailyGoals.carbs.current / day.dailyGoals.carbs.target * 100}%` }} className={` h-full bg-green transition-all`}></div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="flex justify-between  text-black gap-2 flex-col">
                                <span className="font-medium">Fats</span>
                                <span className="text-sm font-semibold">{day.dailyGoals.fats.current}/{day.dailyGoals.fats.target} g</span>
                            </div>
                            <div className="w-full h-2 overflow-hidden bg-[#EBF5E9FF] _border rounded-sm">
                                <div style={{ "width": `${day.dailyGoals.fats.current / day.dailyGoals.fats.target * 100}%` }} className={` h-full bg-green transition-all`}></div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            <div className="mt-9 flex gap-6 md:flex-row flex-col-reverse">
                <div className="flex flex-col gap-6 grow-1">
                    <h2 className="section-title">Your Daily Meals</h2>
                    {day.meals.map((item, idx) => (
                        <MealAccordion dayNumber={day.dayNumber} key={idx} idx={idx} meal={item} isOpen={isOpen} setIsOpen={setIsOpen} />
                    ))}
                </div>

                <div className="flex flex-col gap-6 basis-[540px]">
                    <div className="_border pt-6 px-4 pb-4 rounded-[10px]">
                        <div className="flex flex-col gap-1 mb-10">
                            <h3 className="text-lg leading-7 font-semibold text-neutral-900">Daily Tracking</h3>
                            <p className="text-sm text-neutal-600">Log your intake to stay on target.</p>
                        </div>
                        <div className="flex flex-col gap-2 ">
                            <div className="flex gap-2 items-center">
                                <GlassWater className="text-[#E67E00FF]" size={16} />
                                <span className="text-neutral-900 font-medium">Water Intake</span>
                            </div><div className="">
                                <div className="flex gap-2  flex-wrap md:flex-no">
                                    <input ref={input} onChange={(e) => {
                                        const amount = Number(e.target.value);
                                        if (amount) {
                                            setAmount(amount);

                                        }
                                        else if (e.target.value == "" || amount) {

                                            setError(null);
                                        }
                                        else {
                                            setError("Must be digits!");
                                        }

                                    }} className="basis-[450px] text-sm input p-2!" />
                                    <button onClick={() => { mutation.mutate({ amount: amount, dayNumber: day.dayNumber - 1 }); input.current!.value = "" }
                                    } className={`button-green basis-[100px] md:basis-[45px] p-2! ${error ? "pointer-events-none opacity-65" : ""}`}>Log</button>
                                </div>
                                {error &&
                                    <span data-testid='error' className="text-red-500 font-medium ">
                                        {error}
                                    </span>
                                }
                            </div>
                            <div className="w-full h-2 overflow-hidden bg-[#EBF5E9FF] _border rounded-sm">
                                <div style={{ "width": `${day.waterIntake.current / day.waterIntake.target * 100}%` }} className={` h-full bg-green transition-all`}></div>
                            </div>
                            <div className="text-sm text-neutral-600">You've consumed {day.waterIntake.current} ml out of {day.waterIntake.target} ml today.</div>
                        </div>
                    </div>
                    <div className="_border pt-6 px-4 pb-4 rounded-[10px]">
                        <div className="flex flex-col gap-1 mb-10">
                            <h3 className="text-lg leading-7 font-semibold text-neutral-900">Weekly Nutrition Trends</h3>
                            <p className="text-sm text-neutal-600">Overview of your daily intake over the week</p>
                        </div>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={statistics}>
                                <XAxis dataKey="day" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar radius={[10, 10, 10, 10]} className="" dataKey="calories" fill="#58A446" />
                                <Bar radius={[10, 10, 10, 10]} dataKey="protein" fill="#0B1D2B" />
                                <Bar radius={[10, 10, 10, 10]} dataKey="carbs" fill="#F57C00" />
                                <Bar radius={[10, 10, 10, 10]} dataKey="fats" fill="#F5DEB3" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>



        </div >
    )
}

export default NutritionPlanPage