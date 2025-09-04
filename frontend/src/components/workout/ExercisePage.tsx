import { IDayPlan, IExercise } from '@/types/types';
import { Check, Clock, Lightbulb, Pause, Play, SkipForward, Square } from "lucide-react"
import Image from 'next/image';
import React, { Dispatch, SetStateAction, useCallback, useState } from 'react'
import Timer from './Timer';

interface IProps {
    workout: IDayPlan | null,
    exercise: IExercise | null,
    setIdx: Dispatch<SetStateAction<number>>,
    setExercise: Dispatch<SetStateAction<IExercise | null>>,
    setProgressPercent: Dispatch<SetStateAction<number>>,
    setIsResting: Dispatch<SetStateAction<boolean>>,
    setFinished: Dispatch<SetStateAction<boolean>>,
    setCompletedItems: Dispatch<SetStateAction<Record<"completed", boolean>[]>>,
    progressPercent: number,
    idx: number,
}

const ExercisePage = ({ workout, exercise, setIdx, idx, setExercise, setProgressPercent, progressPercent, setIsResting, setFinished, setCompletedItems }: IProps) => {
    const [isPaused, setIsPaused] = useState<boolean>(false);


    // func for checking of is undefined next item of exercises by idx 
    const goToNextExercise = useCallback(() => {
        if (!workout) return;
        setIdx(prev => {
            let nextIdx = prev + 1;

            while (nextIdx < workout.exercises!.length && workout.exercises![nextIdx].status === "completed") {
                nextIdx++;
            }
            if (nextIdx < workout.exercises!.length) {
                // creating new html image for cashing image
                const img: HTMLImageElement = new window.Image();
                img.src = workout.exercises![nextIdx].imageUrl;
                setExercise(workout.exercises![nextIdx]);
                setProgressPercent(((nextIdx) / workout.exercises!.length) * 100);
                setIsResting(true);


            } else {
                setFinished(true);
            }




            return nextIdx;
        });
    }, [workout, setIdx, setExercise, setProgressPercent, setIsResting, setFinished]);


    if (exercise)
        return (
            < div className="flex flex-col gap-6" >







                {/* exercise page  */}
                <div className="_border rounded-2xl px-10 p-3 md:pt-[42px] md:pb-[53px] flex flex-col gap-1.5 border-none bg-white">
                    <h1 className="section-title ">{workout?.day}</h1>
                    <p className="text-neutral-600">Training progress</p>
                    <div className="my-2.5 relative  w-full rounded-[6px] bg-[#e5fcea] h-4 overflow-hidden">
                        <div style={{ width: `${progressPercent}%` }} className={` h-4 bg-green`}></div>
                    </div>
                </div>

                <div className="_border rounded-2xl  flex flex-col items-center justify-between font-outfit border-none px-5.5 md:py-8 p-5.5   bg-[#e5fcea]   ">
                    {exercise.time && <Timer onFinish={() => {
                        console.log("called");
                        goToNextExercise();
                        setCompletedItems((prev) => [...prev, { completed: true }]);
                    }}  isPaused={isPaused} workoutTime={exercise.time} />}
                    <div className="flex flex-col gap-5 items-center">
                        <h2 className="font-outfit  text-4xl leading-10 font-bold text-black">{exercise?.title}</h2>

                        <Image className="aspect-square rounded-[10px]" placeholder="blur"
                            blurDataURL="https://placehold.co/250x250/png" src={exercise.imageUrl} width={250} priority height={250} alt="exercise image" />

                        {exercise?.repeats !== null ? <p className="text-xl leading-7 text-black">{exercise?.repeats} repeats</p>
                            : <span className="text-xl leading-7 text-black flex gap-1 items-center">
                                <Clock size={20} />
                                {exercise?.time != null ? (
                                    `${String(Math.floor(exercise.time / 60)).padStart(2, "0")} : ${String(exercise.time % 60).padStart(2, "0")}`
                                ) : "00 : 00"}
                            </span>}
                        <div className=" items-start gap-6 mx-auto  flex md:hidden!">
                            <button onClick={() => {
                                if (workout) {
                                    goToNextExercise();
                                    setCompletedItems(prev => [...prev, { completed: false }]);


                                }
                            }} className="_border rounded-full p-4 bg-white text-neutral-900 cursor-pointer"><SkipForward size={32} /></button>
                            <button onClick={() => {
                                if (exercise.time !== null) {
                                    setIsPaused(!isPaused)

                                } else {
                                    if (workout) {
                                        goToNextExercise();
                                        setCompletedItems(prev => [...prev, { completed: true }]);

                                    }
                                }
                            }} className="_border rounded-full p-5 text-white bg-green cursor-pointer">{exercise.time == null ? <Check size={40} /> : isPaused ? <Play size={40} /> : <Pause size={40} />}</button>
                            <button onClick={() => {
                                setFinished(true);
                                exercise.time ? setCompletedItems(prev => [...prev, { completed: false }]) : setCompletedItems(prev => [...prev, { completed: true }]);
                            }

                            }
                                className="_border rounded-full p-4 bg-red text-white cursor-pointer"><Square size={32} /></button>
                        </div>
                    </div>
                </div>
                <div className="flex-col-reverse flex md:grid!  md:grid-cols-2 items-start gap-6">
                    <div className="_border rounded-2xl p-4 pt-5  w-full bg-white">
                        <h3 className="text-lg leading-7 font-semibold text-neutral-900 mb-2">Instructions</h3>
                        <p className="text-neutral-900 mb-3.5">{exercise?.instruction}</p>
                        <div className="rounded-[10px] bg-neutral-200 p-3.5">
                            <div className="mb-1 flex items-start gap-2">
                                <Lightbulb className="text-neutral-600" size={20} />
                                <h3 className="text-lg leading-7 font-semibold text-neutral-900">Advices</h3>
                            </div>
                            <p className="text-neutral-600 ml-6">{exercise?.advices}</p>

                        </div>
                    </div>
                    <div className="flex flex-col gap-12 w-full">
                        <div className="_border rounded-2xl p-4 pt-4.5 flex items-center gap-7 bg-white">
                            {!workout?.exercises![idx + 1] ? <div className="flex items-center text-lg leading-7 font-semibold text-neutral-900">🏁 Finishing</div> : <>
                                <div className="relative w-20 h-20 overflow-hidden rounded-[10px]">
                                    <Image className=" object-cover " fill src={workout.exercises[idx + 1].imageUrl} alt="exercise image" />
                                </div>
                                <div className="">
                                    <span className="text-sm leading-5 text-neutral-600">Next exercise:</span>
                                    <h4 className="text-lg leading-7 font-semibold text-neutral-900">{workout?.exercises[idx + 1].title}</h4>
                                    {workout?.exercises[idx + 1].repeats !== null ? <span className="text-sm leading-5 text-neutral-600">{workout?.exercises[idx + 1].repeats} repeats</span>

                                        : <span className="text-sm leading-5 text-neutral-600 flex gap-1 items-center"><Clock size={12} /> {(Math.floor(workout?.exercises[idx + 1].time! / 60)).toString().padStart(2, '0')}:{(workout?.exercises[idx + 1].time! % 60).toString().padStart(2, '0')}</span>}


                                </div></>}

                        </div>
                        <div className=" items-start gap-6 mx-auto hidden md:flex">
                            <button onClick={() => {
                                if (workout) {
                                    goToNextExercise();
                                    setCompletedItems(prev => [...prev, { completed: false }]);


                                }
                            }} className="_border rounded-full p-4 bg-white text-neutral-900 cursor-pointer"><SkipForward size={32} /></button>
                            <button onClick={() => {
                                if (exercise.time !== null) {
                                    setIsPaused(!isPaused)

                                } else {
                                    if (workout) {
                                        goToNextExercise();
                                        setCompletedItems(prev => [...prev, { completed: true }]);

                                    }
                                }
                            }} className="_border rounded-full p-5 text-white bg-green cursor-pointer">{exercise.time == null ? <Check size={40} /> : isPaused ? <Play size={40} /> : <Pause size={40} />}</button>
                            <button onClick={() => {
                                setFinished(true);
                                exercise.time ? setCompletedItems(prev => [...prev, { completed: false }]) : setCompletedItems(prev => [...prev, { completed: true }]);
                            }

                            }
                                className="_border rounded-full p-4 bg-red text-white cursor-pointer"><Square size={32} /></button>
                        </div>
                    </div>
                </div>

            </div >)

}

export default React.memo(ExercisePage)