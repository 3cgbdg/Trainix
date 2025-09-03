"use client"
import { useForm } from "react-hook-form"
import { IUser } from "@/types/types";
import { Dispatch, SetStateAction, useState } from "react";
import { Check, SquarePen } from "lucide-react";
import { updateProfile } from "@/api/profile";

type formType = {
  firstName: string,
  lastName: string,
  email: string,
  gender: "Male" | "Female",
  weight: number,
  height: number,
  dateOfBirth: Date,

}

const PersonalInfoForm = ({ user, setEditing, editing }: { user: IUser, editing: string | null, setEditing: Dispatch<SetStateAction<"personal" | "password" | "goals" | null>> }) => {
  const { register, formState: { errors }, handleSubmit } = useForm<formType>({
  });
  const [error, setError] = useState<null | string>(null);


  const handleSave = handleSubmit(async (data) => {
    // Partial - for unnessasary fields
    const payload: Partial<formType> = {};
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        // @ts-expect-error
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
    <div className="flex flex-col gap-8  rounded-[10px]  bg-white py-6 sm:px-8 px-4">
      <div className="flex items-center md:flex-row flex-col gap-2 justify-between">
        <h2 className="section-title">Personal Information</h2>
       
      </div>
      <form >
        <div className="grid  md:grid-cols-2 gap-4  ">
          <div className="flex flex-col gap-[10px]">
            <label className="leading-3.5 font-medium">First Name</label>
            <input className="input px-3 py-2"

              defaultValue={user?.firstName}
              {...register("firstName", {})}
              disabled={editing !== "personal"}
            />
          </div>
          <div className="flex flex-col gap-[10px]">
            <label className="leading-3.5 font-medium">Last Name</label>
            <input className="input px-3 py-2"

              defaultValue={user?.lastName}
              {...register("lastName", {})}
              disabled={editing !== "personal"}
            />
          </div>
          <div className="flex flex-col gap-[10px]">
            <label className="leading-3.5 font-medium">Email Address</label>
            <input className="input px-3 py-2"

              defaultValue={user?.email || ""}
              {...register("email", {
                validate: {
                  // validating email format with regex
                  isValidEmailForm: (value) => {
                    if (!value) return true;
                    return /^\w+@\w+\.\w{2,3}$/.test(value) || "Wrong email format";
                  },
                }
              })}
              disabled={editing !== "personal"}
            />
            {errors.email && (
              <span className="text-red-500 font-medium ">
                {errors.email.message}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-[10px]">
            <label className="leading-3.5 font-medium">Date of birth</label>
            <input disabled={editing !== "personal"} defaultValue={user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split("T")[0] : undefined} {...register("dateOfBirth", { required: "Wrong age" })} className="input w-full" type="date" min="1900-01-01"
              max="2018-12-31" id="dateOfBirth" />
            {errors.dateOfBirth && (
              <span data-testid='error' className="text-red-500 font-medium ">
                {errors.dateOfBirth.message}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-[10px]">
            <label className="leading-3.5 font-medium">Gender</label>
            <select defaultValue={user?.gender} disabled={editing !== "personal"} id="gender" {...register("gender")} className="input px-3 py-2 cursor-pointer">
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>

          </div>
          <div className="flex flex-col gap-[10px]">
            <label className="leading-3.5 font-medium">Height (cm)</label>
            <input className="input px-3 py-2"

              defaultValue={user?.metrics.height}
              {...register("height", {
                validate: {
                  checkIfNum: (value) => !isNaN(Number(value)) || "Must be a number"
                }
              })}
              disabled={editing !== "personal"}
            />
            {errors.height && (
              <div className="">{errors.height.message}</div>
            )}
          </div>
          <div className="flex flex-col gap-[10px]">
            <label className="leading-3.5 font-medium">Weight (kg)</label>
            <input className="input px-3 py-2"

              defaultValue={user?.metrics.weight}
              {...register("weight", {
                validate: {
                  checkIfNum: (value) => !isNaN(Number(value)) || "Must be a number"
                }
              })}
              disabled={editing !== "personal"}
            />
            {errors.weight && (
              <div className="">{errors.weight.message}</div>
            )}
          </div>
        </div>
      </form>
       <div className="max-w-70 w-full  flex justify-end flex-wrap  gap-5">
          <button onClick={handleSave} disabled={editing !== "personal"} className="button-transparent max-w-[130px] w-full btn p-2 disabled:bg-gray-500!  disabled:pointer-events-none  flex items-center gap-2">
            <Check size={16} />
            Save
          </button>
          <button onClick={() => { setEditing("personal") }} disabled={editing === "personal"} className="button-transparent max-w-[130px] w-full btn p-2 disabled:bg-gray-500!  disabled:pointer-events-none flex items-center gap-2">
            <SquarePen size={16} />
            Edit Details
          </button>
        </div>
    </div>
  )
}

export default PersonalInfoForm