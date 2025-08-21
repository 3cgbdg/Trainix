"use client"
import { useForm } from "react-hook-form"
import { IUser } from "@/types/types";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Check, Lock, SquarePen } from "lucide-react";
import { updateProfile } from "@/api/profile";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/api/axiosInstance";

type formType = {
  password: string,
  newPassword: string,
  newPasswordAgain: string,
  emailNotifications: boolean,
  inAppNotifications: boolean,
}

const AccountSettings = ({ user, setEditing, editing }: { user: IUser, editing: string | null, setEditing: Dispatch<SetStateAction<"password" | "personal" | "goals" | null>> }) => {
  const { register, formState: { errors }, handleSubmit, reset, watch } = useForm<formType>({});
  const [emailNotifsEnabled, setEmailNotifsEnabled] = useState<boolean | null>(null);
  const [inAppNotifsEnabled, setInAppNotifsEnabled] = useState<boolean | null>(null);
  const [error, setError] = useState<null | string>(null);
  const router = useRouter();
  // form request func
  const handleSave = handleSubmit(async (data) => {
    // Partial - for unnessasary fields
    const payload: Partial<formType> = {};
    if (data.newPassword && data.newPassword === data.newPasswordAgain && data.password) {
      payload.password = data.password;
      payload.newPassword = data.newPassword;
      payload.newPasswordAgain = data.newPasswordAgain;
    }

    // if nothing has changed returning;
    if (Object.keys(payload).length === 0) {
      setEditing(null);
      return;

    }

    const res = await updateProfile(payload, setError);
    if (!res) return;
    setEditing(null);
    reset();
    setError(null);
  }
  )
  
  // starting value of switchers
  useEffect(() => {
    if (user) {
      setEmailNotifsEnabled(user.emailNotifications);
      setInAppNotifsEnabled(user.inAppNotifications);
    }
  }, [user])

  // requests for switchers
  useEffect(() => {
    if (emailNotifsEnabled === null || inAppNotifsEnabled === null) return;
    const updateNotifications = async () => {
      const payload: any = {};
      if (inAppNotifsEnabled !== user.inAppNotifications) {
        payload.inAppNotifications = inAppNotifsEnabled;
      }

      if (emailNotifsEnabled !== user.emailNotifications) {
        payload.emailNotifications = emailNotifsEnabled;

      }

      if (Object.keys(payload).length > 0) {
        await updateProfile(payload, setError);
      }
    };

    updateNotifications();
  }, [inAppNotifsEnabled, emailNotifsEnabled])

  // mutatin delete account request
  const mutation = useMutation({
    mutationFn:async()=>await api.delete("/api/auth/profile"),
    onSuccess: () => router.push("/auth/login"),

  })

  return (
    <div className=" rounded-[10px]  bg-white py-6 px-8 ">

      <h2 className="section-title mb-6">Account Settings</h2>
      <div className="flex flex-col gap-6 mb-4">
        <div className="flex items-center justify-between">
          <h3 className="leading-3.5 font-medium ">Email Notifications</h3>
          <button type="button" onClick={() => { setEmailNotifsEnabled(!emailNotifsEnabled) }} className={`w-11 h-6  overflow-hidden relative flex items-center cursor-pointer _border rounded-xl p-0.5 ${!emailNotifsEnabled ? "bg-white" : "bg-green"}`}>
            <div className={`bg-white w-5 h-5 border rounded-full  transform transition-transform duration-300 ${emailNotifsEnabled ? "translate-x-4.5!" : "translate-x-0 bg-green!"
              }`}></div>
          </button>
        </div>
        <div className="flex items-center justify-between">
          <h3 className="leading-3.5 font-medium ">In-App Notifications</h3>
          <button type="button" onClick={() => { setInAppNotifsEnabled(!inAppNotifsEnabled) }} className={`w-11 h-6  overflow-hidden relative flex items-center cursor-pointer _border rounded-xl p-0.5 ${!inAppNotifsEnabled ? "bg-white" : "bg-green"}`}>
            <div className={`bg-white w-5 h-5 border rounded-full  transform transition-transform duration-300 ${inAppNotifsEnabled ? "translate-x-4.5!" : "translate-x-0 bg-green!"
              }`}></div>
          </button>
        </div>
        <div className="flex items-center flex-wrap gap-4 justify-between">
          <h3 className="leading-3.5 font-medium">Change Password</h3>
          <button onClick={async () => {
            setEditing("password");
            if (editing == "password") await handleSave();

          }} type="button" className="button-transparent inline-flex gap-4   hover:text-green! ">
            {editing !== "password" ?
              <>
                <Lock className="" size={16} />
                <span className="text-sm font-medium">Change Password</span>
              </>
              :
              <>
                <Check className="" size={16} />
                <span className="text-sm font-medium">Save</span>
              </>
            }

          </button>
        </div>
      </div>

      {/* FORM FOR PASS CHANGING */}
      {editing === "password" &&
        <form className="py-4 border-t-[1px] border-neutral-700 mt-6" >

          <h2 className="section-title mb-6">Password Management</h2>
          <div className="grid sm:grid-cols-2 gap-x-4  gap-y-3.5 text-sm">
            <div className="flex flex-col gap-[10px]">
              <label className="leading-3.5 font-medium">Current Password</label>
              <input className={`input px-3 py-2 ${!error && !errors.password ? "" : "border-red-500!"}  `}
                type="password"
                {...register("password", { validate: (value) => value == "" && watch("newPassword") === "" || "The field is required" })}

                disabled={editing !== "password"}
              />
            </div>
            <div className="flex flex-col gap-[10px]">
              <label className={`leading-3.5 font-medium `}>New Password</label>
              <input className={`input px-3 py-2 ${!errors.newPassword && !error ? "" : "border-red-500!"}  `}
                type="password"
                {...register("newPassword", {
                  validate: {
                    password: (value) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/.test(value) || value == "" || "Password must have at least one lowercase, one uppercase, one digit and minimum 8 characters",
                  }
                })}
                disabled={editing !== "password"}
              />
              {errors.newPassword && (
                <span data-testid='error' className="text-red-500 font-medium ">
                  {errors.newPassword.message}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-[10px] ">

              <label className={`leading-3.5 font-medium `}>Confirm New Password</label>
              <input className={`input px-3 py-2 ${!error ? "" : "border-red-500!"}`}
                type="password"
                {...register("newPasswordAgain", {
                  validate: {
                    isMatch: (value) => value === watch("newPassword") || "Passwords do not match!"
                  }
                })}
                disabled={editing !== "password"}
              />
      
              {error && !errors.newPasswordAgain && (
                <span data-testid='error' className="text-red-500 font-medium ">
                  {error}
                </span>
              )}


            </div>





          </div>


        </form>
      }
      <div className=" flex flex-col gap-2 border-t-[1px] border-neutral-700 pt-4">
        <button onClick={()=>mutation.mutate()} className="text-sm inline-flex  items-center max-w-40 w-full justify-center leading-5.5 font-medium text-white bg-[#ed746eff] rounded-md p-2.5 transition-colors hover:bg-[#c52118ff] cursor-pointer">Delete Account</button>
        <p className="text-neutral-400">This action is irreversible and will permanently delete your account and all data.</p>
      </div>

    </div >
  )
}

export default AccountSettings