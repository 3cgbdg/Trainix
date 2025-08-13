"use client"

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
            <div className="_border rounded-2xl  flex flex-col items-center justify-between font-outfit border-none px-5.5 pb-5.5 pt-30 bg-[#F1F8FEFF] h-101  ">
                <div className="text-6xl leading-[60px] text-black font-bold ">00:45</div>
                <div className="flex flex-col gap-5 items-center">
                   <h2 className="font-outfit  text-4xl leading-10 font-bold text-black">Push-ups</h2> 
                   <p className="text-xl leading-7 tex-black">3 Підходи по 10-12 Повторень</p>
                </div>
            </div>
        </div>
    )
}

export default Page