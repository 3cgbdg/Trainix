"use client"
import { api } from "@/api/axiosInstance"
import { useMutation } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { IDayPlan, IExercise } from "@/types/types";
import {  useCallback, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks"
import { updateWorkouts } from "@/redux/workoutsSlice"
import GetReady from "@/components/workout/GetReady"
import Resting from "@/components/workout/Resting"
import ExercisePage from "@/components/workout/ExercisePage";
const Page = () => {
    const { workouts } = useAppSelector(state => state.workouts);
    const { id } = useParams();
    const [completedItems, setCompletedItems] = useState<Record<"completed", boolean>[]>([]);
    const [isResting, setIsResting] = useState<boolean>(false);
    const [workout, setWorkout] = useState<IDayPlan | null>(null);
    const [time, setTime] = useState<number>(15);
    const router = useRouter();
    const [progressPercent, setProgressPercent] = useState<number>(0);
    const [finished, setFinished] = useState<boolean>(false);
    const [exercise, setExercise] = useState<IExercise | null>(null);
    const [idx, setIdx] = useState<number>(0);
    const [start, setStart] = useState<boolean>(false);
    const dispatch = useAppDispatch();

    // post async fync for completed exercises
    const completeWorkout =useCallback( async () => {
        const res = await api.post(`/api/fitness-plan/workouts/${Number(id) - 1}/completed`, completedItems);
        return res.data
    },[id,completedItems]);

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





    return (
        <div>{workouts ?
            !start ?
                // getting ready section to start doing exercises
                <GetReady workout={workout} workouts={workouts} setStart={setStart} id={String(id)} exercise={exercise}/>
                : isResting ?
                // resting section between exercise completing
                    <Resting setIsResting={setIsResting} time={time}/>
                    :
                    <ExercisePage progressPercent={progressPercent} idx={idx} workout={workout}  setExercise={setExercise} setCompletedItems={setCompletedItems} setProgressPercent={setProgressPercent} setIdx={setIdx} setFinished={setFinished} setIsResting={setIsResting}  exercise={exercise}/>
            : <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-green border-solid mx-auto mt-20"></div>}

        </div>

    )
}

export default Page