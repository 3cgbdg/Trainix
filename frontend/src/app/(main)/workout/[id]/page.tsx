"use client"
import { api } from "@/api/axiosInstance"
import { useMutation } from "@tanstack/react-query"
import { Check, Clock, Lightbulb, Pause, Play, SkipForward, Square } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { IDayPlan, IExercise } from "@/types/types";
import Image from "next/image";
import { useEffect, useState } from "react";
import Timer from "@/components/workout/Timer"
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks"
import { updateWorkouts } from "@/redux/workoutsSlice"
const Page = () => {
    const { workouts } = useAppSelector(state => state.workouts);
    const { id } = useParams();
    const [completedItems, setCompletedItems] = useState<Record<"completed", boolean>[]>([]);
    const [isResting, setIsResting] = useState<boolean>(false);
    const [workout, setWorkout] = useState<IDayPlan | null>(null);
    const [time, setTime] = useState<number>(15);
    const router = useRouter();
    const [progressPercent, setProgressPercent] = useState<number>(0);
    const [isPaused, setIsPaused] = useState<boolean>(false);
    const [finished, setFinished] = useState<boolean>(false);
    const [exercise, setExercise] = useState<IExercise | null>(null);
    const [idx, setIdx] = useState<number>(0);
    const [start, setStart] = useState<boolean>(false);
    const dispatch = useAppDispatch();


    // post async fync for completed exercises
    const completeWorkout = async () => {
        const res = await api.post(`/api/fitness-plan/workouts/${Number(id) - 1}/completed`, completedItems);
        return res.data
    }
    // post mutation
    const mutation = useMutation({
        mutationFn: completeWorkout,
        onSuccess: (data) => {
            dispatch(updateWorkouts({ day: data.day, streak: data.streak }))
            router.push(`/workout/${id}/sucess`)
        },
    })

    // resting process
    useEffect(() => {
        setTime(15);
        if (isResting) {
            const timer = setTimeout(() => {
                setIsResting(false);
            }, 15000);
            const interval = setInterval(() => {
                setTime(prev => (prev > 0 ? prev - 1 : 0));
            }, 1000)
            return () => {
                clearTimeout(timer);
                clearInterval(interval)
            };
        }
    }, [isResting])



    // func for checking of is undefined next item of exercises by idx 
    const goToNextExercise = () => {
        if (!workout) return;
        setIdx(prev => {
            let nextIdx = prev + 1;

            while (nextIdx < workout.exercises.length && workout.exercises[nextIdx].status === "completed") {
                nextIdx++;
            }
            if (nextIdx < workout.exercises.length) {

                setExercise(workout.exercises[nextIdx]);
                setProgressPercent(((nextIdx) / workout.exercises.length) * 100);
                setIsResting(true);


            } else {
                setFinished(true);

            }




            return nextIdx;
        });
    };
    useEffect(() => {
        if (workouts) setWorkout(workouts.items[Number(id) - 1])
    }, [workouts]);
    // getting current exercise
    useEffect(() => {
        if (workout) {

            if (workout.status == "Completed") {
                router.push(`/workout/${id}/sucess`);
            }
            for (let [i, exercise] of workout.exercises.entries()) {
                if (exercise.status == "incompleted") {
                    setExercise(workout.exercises[i]);
                    setIdx(i);
                    break;
                } else {
                    setProgressPercent(((i + 1) / workout.exercises.length) * 100);
                    setCompletedItems(prev => [...prev, { completed: true }]);
                }
            }
        }
    }, [workout]);

    // ending day with post request
    useEffect(() => {
        if (finished) {
            mutation.mutate();
        }
    }, [finished]);




    const totalCalories = workout?.exercises.reduce((acc, cur) => { return (cur.status == "completed" ? acc + cur.calories : acc) }, 0);

    return (
        <div>
            {!start ?
                // getting ready section to start doing exercises
                <div className="grid grid-cols-2 gap-6">
                    <div className="flex items-center justify-center gap-6 bg-[#e5fcea] w-fit mx-auto _border rounded-2xl flex-col p-3 min-h-[350px]">

                        <div className="p-6 max-w-3xl mx-auto">
                            <h1 className="page-title mb-4"> Day {id}</h1>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-green p-4 rounded-lg text-center ">
                                    <p className="text-sm">Calories</p>
                                    <p className="text-xl font-semibold">{totalCalories} kcal</p>
                                </div>

                                <div className="bg-green p-4 rounded-lg text-center">
                                    <p className="text-sm">Exercises completed</p>
                                    <p className="text-xl font-semibold">
                                        {workout?.exercises.filter((ex) => ex.status === "completed").length} / {workout?.exercises.length}
                                    </p>
                                </div>
                                <div className="bg-green p-4 rounded-lg text-center">
                                    <p className="text-sm">Streak</p>
                                    <p className="text-xl font-semibold">{workouts?.streak} </p>
                                </div>
                            </div>


                            <h2 className="text-xl font-semibold mb-2">Exercises</h2>
                            <ul className="flex flex-col gap-2">
                                {workout?.exercises.map((ex, idx) => (
                                    <li
                                        key={idx}
                                        className={`flex justify-between p-3 rounded-lg gap-1 border ${ex.status === "completed" ? "bg-green-50 border-green" : "bg-gray-50 border-gray-200"
                                            }`}>
                                        <span>{ex.title}</span>
                                        <span>
                                            {ex.calories} kcal | {ex.time ? (ex.time / 60).toFixed(0) + " min" : ex.repeats + " repeats"}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>


                    </div>
                    <div className="flex items-center justify-center gap-6 bg-[#e5fcea] _border rounded-2xl flex-col p-6 min-h-[350px]">
                        <span className="text-center page-title pb-10">Start workout: {exercise?.title}</span>
                        {exercise?.repeats !== null ? <p className="text-xl leading-7 text-black">{exercise?.repeats} repeats</p>
                            : <span className="text-xl leading-7 text-black flex gap-1 items-center"><Clock size={20} />{exercise.time !== null ? exercise.time / 60 >= 10 ? Math.floor(exercise.time / 60) + ":0" + exercise.time % 60 : "0" + Math.floor(exercise.time / 60) + ":0" + exercise.time % 60 : ""}</span>}
                        <button onClick={() => setStart(true)} className="button-transparent max-w-[200px]  font-outfit flex items-center gap-2 w-full"> <span className="text-2xl">Start</span></button>

                    </div></div>
                : isResting ?
                    // resting section between exercise completing
                    <div className="flex items-center justify-center bg-[#e5fcea] _border rounded-2xl flex-col p-3">
                        <div className="text-6xl leading-[60px] text-black font-bold h-60 flex items-center justify-center">00:{time < 10 ? "0" + time : time}</div>
                        <span className="text-center text-[40px] leading-7 font-semibold font-outfit pb-10">Rest</span>
                        <button onClick={() => setIsResting(false)} className="button-transparent max-w-[200px]  font-outfit flex items-center gap-2 w-full"> <span className="text-2xl">Skip</span> <SkipForward size={20} /></button>
                    </div>
                    :
                    <div className="flex flex-col gap-6">
                        {exercise && <>
                            {/* exercise page  */}
                            <div className="_border rounded-2xl px-10 pt-[42px] pb-[53px] flex flex-col gap-1.5 border-none bg-white">
                                <h1 className="section-title ">{workout?.day}</h1>
                                <p className="text-neutral-600">Training progress</p>
                                <div className="my-2.5 relative  w-full rounded-[6px] bg-[#e5fcea] h-4 overflow-hidden">
                                    <div style={{ width: `${progressPercent}%` }} className={` h-4 bg-green`}></div>
                                </div>
                            </div>
                            <div className="_border rounded-2xl  flex flex-col items-center justify-between font-outfit border-none px-5.5 py-8   bg-[#e5fcea]   ">
                                {exercise.time && <Timer goToNextExercise={goToNextExercise} setCompletedItems={setCompletedItems} isPaused={isPaused} workoutTime={exercise.time} />}
                                <div className="flex flex-col gap-5 items-center">
                                    <h2 className="font-outfit  text-4xl leading-10 font-bold text-black">{exercise?.title}</h2>
                                    <div className="w-[250px] rounded-[10px] overflow-hidden relative aspect-square">
                                    <Image className="" src={exercise.imageUrl} fill alt="exercise image"/>
                                    </div>
                                    {exercise?.repeats !== null ? <p className="text-xl leading-7 text-black">{exercise?.repeats} repeats</p>
                                        : <span className="text-xl leading-7 text-black flex gap-1 items-center"><Clock size={20} />{exercise.time !== null ? exercise.time / 60 >= 10 ? Math.floor(exercise.time / 60) + ":0" + exercise.time % 60 : "0" + Math.floor(exercise.time / 60) + ":0" + exercise.time % 60 : ""}</span>}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 items-start gap-6">
                                <div className="_border rounded-2xl p-4 pt-5  bg-white">
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
                                <div className="flex flex-col gap-12">
                                    <div className="_border rounded-2xl p-4 pt-4.5 flex items-center gap-7 bg-white">
                                        {!workout?.exercises[idx + 1] ? <div className="flex items-center text-lg leading-7 font-semibold text-neutral-900">🏁 Finishing</div> : <> <Image width={80} height={80} src={workout.exercises[idx+1].imageUrl} alt="exercise image" />
                                            <div className="">
                                                <span className="text-sm leading-5 text-neutral-600">Next exercise:</span>
                                                <h4 className="text-lg leading-7 font-semibold text-neutral-900">{workout?.exercises[idx + 1].title}</h4>
                                                {workout?.exercises[idx + 1].repeats !== null ? <span className="text-sm leading-5 text-neutral-600">{workout?.exercises[idx + 1].repeats} repeats</span>

                                                    : <span className="text-sm leading-5 text-neutral-600 flex gap-1 items-center"><Clock size={12} /> 01:30</span>}


                                            </div></>}

                                    </div>
                                    <div className="flex items-start gap-6 mx-auto">
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

                        </>}

                    </div >}


        </div>

    )
}

export default Page