"use client"

import { useAppSelector } from "@/hooks/reduxHooks"
import { UseMutateFunction } from "@tanstack/react-query"

const GenerateNutritionPlan = ({ mutateAsync, isPending }: { mutateAsync: UseMutateFunction<any, unknown, number, unknown>, isPending: boolean }) => {
    const { workouts } = useAppSelector(state => state.workouts)

    return (
        <div className="flex flex-col items-center ">
            <div className="w-[900px] text-center">
                <h1 className='page-title mb-10'>AI Nutrition Plan Generating</h1>

                <button disabled={isPending ? true : false} onClick={async () => {
                    if (workouts?.items) {
                        for (let i = 0; i < workouts.items.length; i++) {
                            await mutateAsync(i + 1);

                        }
                    }



                }} className={`button-green w-full disabled:bg-neutral-800 ${isPending ? "!bg-neutral-700 !cursor-auto" : ""}`}>{isPending ? "Processing" : "Proceed to Analysis"}</button>
            </div>
        </div >

    )
}

export default GenerateNutritionPlan