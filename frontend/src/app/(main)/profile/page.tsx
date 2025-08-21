"use client"

import AccountSettings from "@/components/profile/AccountSettings"
import GoalsInfoForm from "@/components/profile/GoalsInfoForm"
import PersonalInfoForm from "@/components/profile/PersonalInfoForm"
import { useAppSelector } from "@/hooks/reduxHooks"
import { Check, SquarePen, UserRound } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"




const Page = () => {
  const { user } = useAppSelector(state => state.auth);

  const [editing, setEditing] = useState<null | "personal" | "password" | "goals">(null);



  useEffect(() => {
    console.log(user);
  }, [user])
  return (<>
    { user &&
    <div className="flex flex-col gap-6">
      {/* banner */}
      <div className="flex sm:flex-row flex-col  items-center gap-6 rounded-[10px]  bg-white py-4 px-8">
        <div className={`rounded-full overflow-hidden _border size-24 flex items-center justify-center bg-white ${user?.imageUrl ? "" : " "}`}>
          {user?.imageUrl ? <Image className="" width={96} height={96} src={user?.imageUrl} alt="user icon" />
            : <UserRound size={40} />}

        </div>
        <div className="flex flex-col gap-2 sm:text-start text-center">
          <h1 className="page-title">{user?.firstName} {user?.lastName}</h1>
          <p className="text-neutral-400">Manage your personal information and preferences.</p>
        </div>
      </div>
      <PersonalInfoForm user={user} editing={editing} setEditing={setEditing}/>
      <GoalsInfoForm user={user} editing={editing} setEditing={setEditing}/>
      <AccountSettings user={user}  editing={editing} setEditing={setEditing}/>

    </div>}</>
  )
}

export default Page