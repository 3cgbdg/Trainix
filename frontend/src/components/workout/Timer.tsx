"use client"

import React, { Dispatch, SetStateAction, useEffect, useState } from "react";

const Timer = ({ workoutTime, isPaused, setCompletedItems, goToNextExercise }: { workoutTime: number, goToNextExercise: () => void, setCompletedItems: Dispatch<SetStateAction<Record<"completed", boolean>[]>>, isPaused: boolean }) => {
    const [time, setTime] = useState<number>(workoutTime);

    // timer engine
    useEffect(() => {
        if (isPaused) return;

        const interval = setInterval(() => {
            setTime(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setTimeout(() => {
                        setCompletedItems(prev => [...prev, { completed: true }]);
                        goToNextExercise();
                    }, 0);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [isPaused, goToNextExercise, setCompletedItems]);



    const minutes = Math.floor(time / 60);
    const seconds = time % 60;

    return (
        <div className="text-6xl leading-[60px] text-black font-bold md:h-40 h-20 flex items-center justify-center mb-2">{minutes < 10 ? "0" + minutes : minutes}:{seconds < 10 ? "0" + seconds : seconds}</div>

    )
}

export default React.memo(Timer)