"use client"

import { api } from "@/api/axiosInstance"
import { useAppDispatch } from "@/hooks/reduxHooks"
import { IMeal } from "@/types/types"
import { useMutation } from "@tanstack/react-query"
import { ChevronDown, Soup, Timer } from "lucide-react"
import Image from "next/image"
import { Dispatch, SetStateAction } from "react"
const MealAccordion = ({ meal, isOpen, setIsOpen, dayNumber, key }: { dayNumber: number, key: number, meal: IMeal, isOpen: string | null, setIsOpen: Dispatch<SetStateAction<string | null>> }) => {
    const dispatch = useAppDispatch();
    const updateMealStatus = async (dayNumber: number, key: number) => {
        const res = await api.patch("/nutrition-plans/days/dayNumber/meal/status", key);
        return res.data;

    }
    const mutation = useMutation({
        mutationFn: ({ dayNumber, key }: { dayNumber: number; key: number }) => updateMealStatus(dayNumber, key),
        onSuccess: () => {
// dispatch() !!toDOIT
        }

    })



    return (
        <div className="_border  rounded-[10px] pt-[27px] px-4 pb-4 w-full">
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
            <p className="text-sm text-neutral-900">{meal.description}</p>
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