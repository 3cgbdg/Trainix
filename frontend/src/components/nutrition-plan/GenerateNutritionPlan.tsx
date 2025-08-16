"use client"

import { UseMutateFunction } from "@tanstack/react-query"

const GenerateNutritionPlan = ({ mutate,isPending }: { mutate: UseMutateFunction<any, unknown, void, unknown>, isPending:boolean}) => {
    return (
       <div className="flex flex-col items-center ">
            <div className="w-[900px] text-center">
                <h1 className='page-title mb-10'>AI Nutrition Plan Generating</h1>
            
                <button disabled={isPending ? true : false} onClick={() => {
                    mutate();
                }} className={`button-green w-full disabled:bg-neutral-800 ${isPending ? "!bg-neutral-700 !cursor-auto" : ""}`}>{isPending ? "Processing" : "Proceed to Analysis"}</button>
            </div>
        </div >

    )
}

export default GenerateNutritionPlan