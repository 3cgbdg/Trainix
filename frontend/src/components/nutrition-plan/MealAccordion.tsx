"use client"

import { api } from "@/api/axiosInstance"
import { useAppDispatch } from "@/hooks/reduxHooks"
import { changeStatus } from "@/redux/nutritionDaySlice"
import { IMeal } from "@/types/types"
import { useMutation } from "@tanstack/react-query"
import { Check, ChevronDown, Soup, Timer } from "lucide-react"
import Image from "next/image"
import { Dispatch, SetStateAction } from "react"
const MealAccordion = ({ meal, isOpen, setIsOpen, dayNumber, idx }: { dayNumber: number, idx: number, meal: IMeal, isOpen: string | null, setIsOpen: Dispatch<SetStateAction<string | null>> }) => {
    const dispatch = useAppDispatch();
    const updateMealStatus = async (dayNumber: number, index: number) => {
        const res = await api.patch(`api/nutrition-plan/nutrition-plans/days/${dayNumber}/meal/status`, { index });
        return res.data;

    }
    const mutation = useMutation({
        mutationFn: ({ dayNumber, index }: { dayNumber: number; index: number }) => updateMealStatus(dayNumber, index),
        onSuccess: () => {
            dispatch(changeStatus(idx))
        }

    })


    return (<div className={`_border relative rounded-[10px] overflow-hidden pt-[27px] px-4 pb-4 w-full `}>
      
            <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg leading-7 font-semibold text-neutral-900">
                    {meal.mealTitle}
                </h3>
                <button onClick={() => setIsOpen(prev => prev == meal.mealTitle ? null : meal.mealTitle)} className={`text-neutral-900 transition-transform cursor-pointer outline-0 ${isOpen == meal.mealTitle ? "rotate-180 " : ""}`}>
                    <ChevronDown />
                </button>
            </div>
            <span className="text-sm text-neutral-600 mb-4"><b>Time:</b> {meal.time}</span>
            <div className="rounded-md overflow-hidden mb-4 _border">
                <Image height={144} width={516} src={meal.imageUrl} alt="food picture" />
            </div>
            <div className="flex items-center justify-between">
                <p className="text-sm text-neutral-900 ">{meal.description}</p>
                {
                    meal.status !== "eaten" ?


                        <button onClick={() => mutation.mutate({ dayNumber: dayNumber - 1, index: idx })} className="button-green max-w-[50px]"><Check /></button>
                        : <span className="button-transparent pointer-events-none">Eaten</span>
                }
            </div>
            {isOpen === meal.mealTitle &&
                <div className="pt-4 flex flex-col gap-4 mt-4 border-t-[1px] border-neutral-300">
                    <div className="flex flex-col gap-2">
                        <h4 className="text-neutral-900 font-semibold flex items-center gap-2">
                            <Soup size={16} className="text-green" />
                            <span>Ingredients:</span>
                        </h4>
                        <div className="text-sm text-neutral-600">
                            {meal.ingredients.map((item, idx) => (<p key={idx}>{item}</p>))}
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <h4 className="text-neutral-900 font-semibold flex items-center gap-2">
                            <Timer size={16} className="text-green" />
                            <span>Preparation:</span>
                        </h4>
                        <div className="text-sm text-neutral-600">
                            {meal.preparation.split(".").map((item, idx) => (<p key={idx}>{item}</p>))}
                        </div>
                    </div>
                </div>
            }
      
    

    </div>
    )
}

export default MealAccordion