"use client"

import { IMeal } from "@/types/types"
import { ChevronDown } from "lucide-react"
import { Dispatch, SetStateAction } from "react"

const MealAccordion = ({meal,isOpen,setIsOpen}:{meal:IMeal,isOpen:string|null,setIsOpen:Dispatch<SetStateAction<string|null>>}) => {
    return (
        <div className="_border  rounded-[10px] pt-[27px] px-4 pb-4 w-full">
            <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg leading-7 font-semibold text-neutral-900">
                    {meal.mealTitle}
                </h3>
                <button onClick={()=>setIsOpen(prev=>prev==meal.mealTitle ? null :meal.mealTitle )} className={`text-neutral-900 transition-transform  ${isOpen==meal.mealTitle?"rotate-90 ":"" }`}>
                    <ChevronDown/>
                </button>
            </div>
            <span className="text-sm text-neutral-600"><b>Time:</b> {meal.time  }</span>
        </div>
    )
}

export default MealAccordion