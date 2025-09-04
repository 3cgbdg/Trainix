"use client"

import React, { Dispatch, SetStateAction, useEffect, useState } from "react";

const Timer = ({ workoutTime, isPaused, onFinish }: { workoutTime: number, onFinish: () => void, isPaused: boolean }) => {
    const [time, setTime] = useState<number>(workoutTime);

    //seeting local time state
    useEffect(() => {
        setTime(workoutTime);
    }, [workoutTime]);

    //checking the end oof the timer 

    useEffect(() => {
        if (time <= 0) {
            onFinish()
        }
    },[time])

    // timer engine
    useEffect(() => {
        if (isPaused) return;

        const interval = setInterval(() => {
            setTime(prev => prev - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [isPaused]);



    const minutes = Math.floor(time / 60);
    const seconds = time % 60;

    return (
        <div className="text-6xl leading-[60px] text-black font-bold md:h-40 h-20 flex items-center justify-center mb-2">{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}</div>

    )
}

export default React.memo(Timer)