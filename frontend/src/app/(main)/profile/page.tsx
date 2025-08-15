"use client"

import { useAppSelector } from "@/hooks/reduxHooks"
import { Check, SquarePen, UserRound } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"


type formType = {
  firstName: string,
  lastName: string,
  password: string,
  newPassword: string,
  newPasswordAgain: string,
  email: string,
  gender: "Male" | "Female",
  weight: number,
  height: number,
  dateOfBirth: Date,
  targetWeight: number,
  fitnessLevel: "Beginner" | "Intermediate" | "Advanced",
  primaryFitnessGoal: "Lose weight" | "Gain muscle" | "Stay fit" | "Improve endurance",
}

const Page = () => {
  const { user } = useAppSelector(state => state.auth);

  const [editing, setEditing] = useState<null | "personal" | "password" | "goals">(null);
  const [isEquals, setIsEquals] = useState<boolean>(true);
  const { register, getValues, formState: { errors }, handleSubmit } = useForm<formType>({
  });
  const handleSave = handleSubmit(async (data) => {
    // Partial - for unnessasary fields
    const payload: Partial<formType> = {};
    // checking if (changed)
    if (data.firstName && data.firstName !== user?.fullName.split(" ")[0]) {
      payload.firstName = data.firstName;
    }
    if (data.lastName && data.lastName !== user?.fullName.split(" ")[1]) {
      payload.lastName = data.lastName;
    }

    if (data.email && data.email !== user?.email) {
      payload.email = data.email;
    }
    if (data.newPassword && data.newPassword === data.newPasswordAgain && data.password) {
      payload.password = data.password;
      payload.newPassword = data.newPassword;
      payload.newPasswordAgain = data.newPasswordAgain;
      if (payload.newPassword !== payload.newPasswordAgain) {
        setIsEquals(false)
        return;
      };
    }
    setEditing(null);

    // if nothing has changed returning;
    if (Object.keys(payload).length === 0) return;
    // try {
    //   const res = await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile`, {
    //     payload
    //   }, { withCredentials: true });
    //   if (res.data)
    //     dispatch(login(res.data));
    //   setEditing(false);
    // } catch (err) {
    //   console.error(err);
    // }
  })


  useEffect(() => {
    console.log(editing);
  }, [editing])
  return (
    <div className="flex flex-col gap-6">
      {/* banner */}
      <div className="flex items-center gap-6 rounded-[10px]  bg-white py-4 px-8">
        <div className={`rounded-full overflow-hidden _border size-24 flex items-center justify-center bg-white ${user?.imageUrl ? "" : " "}`}>
          {user?.imageUrl ? <Image className="" width={96} height={96} src={user?.imageUrl} alt="user icon" />
            : <UserRound size={40} />}

        </div>
        <div className="flex flex-col gap-2">
          <h1 className="page-title">{user?.fullName}</h1>
          <p className="text-neutral-400">Manage your personal information and preferences.</p>
        </div>
      </div>
      {/* personal form */}
      <div className="flex flex-col gap-8  rounded-[10px]  bg-white py-6 px-8">
        <div className="flex items-center justify-between">
          <h2 className="section-title">Personal Information</h2>
          <div className="w-70  flex items-center gap-5">
            <button onClick={handleSave} disabled={editing !== "personal"} className="button-transparent w-[130px] btn p-2 disabled:bg-gray-500!  disabled:pointer-events-none  flex items-center gap-2">
              <Check size={16} />
              Save
            </button>
            <button onClick={() => { setEditing("personal") }} disabled={editing === "personal"} className="button-transparent w-[130px] btn p-2 disabled:bg-gray-500!  disabled:pointer-events-none flex items-center gap-2">
              <SquarePen size={16} />
              Edit Details
            </button>
          </div>
        </div>
        <form >
          <div className="grid  grid-cols-2 gap-4  ">
            <div className="flex flex-col gap-[10px]">
              <label className="leading-3.5 font-medium">First Name</label>
              <input className="input px-3 py-2"

                defaultValue={user?.fullName.split(" ")[0]}
                {...register("firstName", {})}
                disabled={editing !== "personal"}
              />
            </div>
            <div className="flex flex-col gap-[10px]">
              <label className="leading-3.5 font-medium">Last Name</label>
              <input className="input px-3 py-2"

                defaultValue={user?.fullName.split(" ")[1]}
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
                <div className="">{errors.email.message}</div>
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
              <select disabled={editing !== "personal"} id="gender" {...register("gender")} className="input px-3 py-2 cursor-pointer">
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
      </div>

      {/* goals form */}
      <div className="flex flex-col gap-8  rounded-[10px]  bg-white py-6 px-8">
        <div className="flex items-center justify-between">
          <h2 className="section-title">Fitness Goals</h2>
          <div className="w-70  flex items-center gap-5">
            <button onClick={handleSave} disabled={editing !== "goals"} className="button-transparent w-[130px] btn p-2 disabled:bg-gray-500!  disabled:pointer-events-none  flex items-center gap-2">
              <Check size={16} />
              Save
            </button>
            <button onClick={() => { setEditing("goals") }} disabled={editing === "goals"} className="button-transparent w-[130px] btn p-2 disabled:bg-gray-500!  disabled:pointer-events-none flex items-center gap-2">
              <SquarePen size={16} />
              Edit Details
            </button>
          </div>
        </div>
        <form >
          <div className="grid  grid-cols-2 gap-4  ">
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
              <select disabled={editing !== "goals"} id="fitnessLevel" {...register("fitnessLevel")} className="input px-3 py-2 cursor-pointer">
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <div className="flex flex-col gap-[10px]">
              <label className="leading-3.5 font-medium">Goal Type</label>
              <select disabled={editing !== "goals"} id="primaryFitnessGoal" {...register("primaryFitnessGoal")} className="input px-3 py-2 cursor-pointer">
                <option value="Lose weight">Lose weight</option>
                <option value="Gain muscle">Gain muscle</option>
                <option value="Stay fit">Stay fit</option>
                <option value="Improve endurance">Improve endurance</option>
              </select>
            </div>
      
          </div>
        </form>
      </div>


      {/* <div className="">
          <h2 className="text-[18px] leading-7 font-medium mb-2.5">Password Management</h2>
          <div className="grid sm:grid-cols-2 gap-x-4  gap-y-3.5 text-sm">
            <div className="flex flex-col gap-[10px]">
              <label className="leading-3.5 font-medium">Current Password</label>
              <input className="input px-3 py-2"
                type="password"
                {...register("password", {})}

                disabled={editing !== "personal"}
              />
            </div>
            <div className="flex flex-col gap-[10px]">
              <label className={`leading-3.5 font-medium `}>New Password</label>
              <input className={`input px-3 py-2 ${isEquals ? "" : "border-red-500!"}  `}
                type="password"
                {...register("newPassword", {})}
                disabled={editing !== "personal"}
              />
            </div>
            <div className="flex flex-col gap-[10px] ">
              <label className={`leading-3.5 font-medium `}>Confirm New Password</label>
              <input className={`input px-3 py-2 ${isEquals ? "" : "border-red-500!"}`}
                type="password"
                {...register("newPasswordAgain", {})}
                disabled={editing !== "personal"}
              />
            </div>



          </div>
        </div> */}
    </div>
  )
}

export default Page