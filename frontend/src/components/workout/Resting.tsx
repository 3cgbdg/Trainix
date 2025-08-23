
import { SkipForward } from "lucide-react"
import React, { Dispatch, SetStateAction } from "react"

const Resting = ({ setIsResting,time }: { setIsResting: Dispatch<SetStateAction<boolean>> ,time:number}) => {
    return (
        // resting section between exercise completing
        <div className="flex items-center justify-center bg-[#e5fcea] _border rounded-2xl flex-col p-3">
            <div className="text-6xl leading-[60px] text-black font-bold h-60 flex items-center justify-center">00:{String(time).padStart(2, "0")}</div>
            <span className="text-center text-[40px] leading-7 font-semibold font-outfit pb-10">Rest</span>
            <button onClick={() => setIsResting(false)} className="button-transparent max-w-[200px]  font-outfit flex items-center gap-2 w-full"> <span className="text-2xl">Skip</span> <SkipForward size={20} /></button>
        </div>
    )
}

export default React.memo(Resting)