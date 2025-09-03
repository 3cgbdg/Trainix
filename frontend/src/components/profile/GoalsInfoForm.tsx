"use client"
import { useForm } from "react-hook-form"
import { IUser } from "@/types/types";
import { Dispatch, SetStateAction, useState } from "react";
import { Check, SquarePen } from "lucide-react";
import { updateProfile } from "@/api/profile";

type formType = {

  targetWeight: number,
  fitnessLevel: "Beginner" | "Intermediate" | "Advanced",
  primaryFitnessGoal: "Lose weight" | "Gain muscle" | "Stay fit" | "Improve endurance",
}

const GoalsInfoForm = ({ user, setEditing, editing }: { user: IUser, editing: string | null, setEditing: Dispatch<SetStateAction<"personal" | "password" | "goals" | null>> }) => {
  const { register, formState: { errors }, handleSubmit } = useForm<formType>({
  });
  const [error, setError] = useState<null | string>(null);


  const handleSave = handleSubmit(async (data) => {
    // Partial - for unnessasary fields
    const payload: Partial<formType> = {};
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        // @ts-expect-error TS cannot infer key type
        payload[key] = value;
      }
    });
    // checking if (changed)
    setEditing(null);
    // if nothing has changed returning;
    if (Object.keys(payload).length === 0) return;

    await updateProfile(payload, setError);

  })
  return (
    <div className="flex flex-col gap-8  rounded-[10px]  bg-white py-6 sm:px-8 px-4 ">

      <div className="flex items-center md:flex-row flex-col gap-2 justify-between">
        <h2 className="section-title">Fitness Goals</h2>
    
      </div>

      <form >
        <div className="grid   md:grid-cols-2 gap-4  ">
          <div className="flex flex-col gap-[10px]">
            <label className="leading-3.5 font-medium">Target Weight (kg)</label>
            <input className="input px-3 py-2"

              defaultValue={user?.targetWeight}
              {...register("targetWeight", {})}
              disabled={editing !== "goals"}
            />
          </div>

          <div className="flex flex-col gap-[10px]">
            <label className="leading-3.5 font-medium">Fitness Level</label>
            <select defaultValue={user?.fitnessLevel} disabled={editing !== "goals"} id="fitnessLevel" {...register("fitnessLevel")} className="input px-3 py-2 cursor-pointer">
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          <div className="flex flex-col gap-[10px]">
            <label className="leading-3.5 font-medium">Goal Type</label>
            <select defaultValue={user?.primaryFitnessGoal} disabled={editing !== "goals"} id="primaryFitnessGoal" {...register("primaryFitnessGoal")} className="input px-3 py-2 cursor-pointer">
              <option value="Lose weight">Lose weight</option>
              <option value="Gain muscle">Gain muscle</option>
              <option value="Stay fit">Stay fit</option>
              <option value="Improve endurance">Improve endurance</option>
            </select>
          </div>

        </div>
      </form>
      <div className="max-w-70 w-full  flex justify-end flex-wrap  gap-5">
          <button onClick={handleSave} disabled={editing !== "goals"} className="button-transparent max-w-[130px] w-full btn p-2 disabled:bg-gray-500!  disabled:pointer-events-none  flex items-center gap-2">
            <Check size={16} />
            Save
          </button>
          <button onClick={() => { setEditing("goals") }} disabled={editing === "goals"} className="button-transparent max-w-[130px] w-full btn p-2 disabled:bg-gray-500!  disabled:pointer-events-none flex items-center gap-2">
            <SquarePen size={16} />
            Edit Details
          </button>
        </div>
    </div>
  )
}


export default GoalsInfoForm