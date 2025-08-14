"use client"

import { Clock, Lightbulb, Pause, SkipForward, Square } from "lucide-react"
import Image from "next/image"

const Page = () => {
    return (
        <div className="flex flex-col gap-6">
            <div className="_border rounded-2xl px-10 pt-[42px] pb-[53px] flex flex-col gap-1.5 border-none bg-white">
                <h1 className="section-title ">dsd</h1>
                <p className="text-neutral-600">Training progress</p>
                <div className="my-2.5 relative  w-full rounded-[6px] bg-[#E5F2FCFF] h-4 overflow-hidden">
                    <div className="w-[20%] h-4 bg-[#3295ECFF]"></div>
                </div>
            </div>
            <div className="_border rounded-2xl  flex flex-col items-center justify-between font-outfit border-none px-5.5 pb-5.5 pt-30  bg-[#F1F8FEFF] h-101  ">
                <div className="text-6xl leading-[60px] text-black font-bold ">00:45</div>
                <div className="flex flex-col gap-5 items-center">
                    <h2 className="font-outfit  text-4xl leading-10 font-bold text-black">Push-ups</h2>
                    <p className="text-xl leading-7 tex-black">3 Підходи по 10-12 Повторень</p>
                </div>
            </div>
            <div className="grid grid-cols-2 items-start gap-6">
                <div className="_border rounded-2xl p-4 pt-5  bg-white">
                    <h3 className="text-lg leading-7 font-semibold text-neutral-900 mb-2">Instructions</h3>
                    <p className="text-neutral-900 mb-3.5">Почніть з положення планки, руки трохи ширше плечей, пальці спрямовані вперед.</p>
                    <div className="rounded-[10px] bg-neutral-200 p-3.5">
                        <div className="mb-1 flex items-start gap-2">
                            <Lightbulb className="text-neutral-600" size={20} />
                            <h3 className="text-lg leading-7 font-semibold text-neutral-900">Advices</h3>
                        </div>
                        <p className="text-neutral-600 ml-6">Якщо важко, спробуйте віджиматися з колін або від підвищеної поверхні (наприклад, столу).</p>

                    </div>
                </div>
                <div className="flex flex-col gap-12">
                    <div className="_border rounded-2xl p-4 pt-4.5 flex items-center gap-7 bg-white">
                        <Image width={80} height={80} src={"/dashboard/workout.jpg"} alt="exercise image" />
                        <div className="">
                            <span className="text-sm leading-5 text-neutral-600">Next exercise:</span>
                            <h4 className="text-lg leading-7 font-semibold text-neutral-900">Присідання</h4>
                            <span className="text-sm leading-5 text-neutral-600">3 Підходи по 12-15 Повторень</span>
                            <span className="text-sm leading-5 text-neutral-600 flex gap-1 items-center"><Clock size={12} /> 01:30</span>

                        </div>
                    </div>
                    <div className="flex items-start gap-6 mx-auto">
                        <button className="_border rounded-full p-4 bg-white text-neutral-900 cursor-pointer"><SkipForward size={32} /></button>
                        <button className="_border rounded-full p-5 text-white bg-green cursor-pointer"><Pause size={40} /></button>
                        <button className="_border rounded-full p-4 bg-red text-white cursor-pointer"><Square size={32} /></button>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default Page