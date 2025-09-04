import Image from "next/image";
import React from "react";

interface BodyImagesProps {
    current: string;
    last?: string | null;
}

const BodyImages = React.memo(({ current, last }: BodyImagesProps) => {

    if (last !== current && last)
        return (
            <div className=" flex justify-center gap-8 sm:gap-10 md:gap-22 xl:gap-40 flex-wrap">
                <div className="flex gap-2 justify-center flex-col text-center">
                    <h3 className="text-xl leading-7 font-semibold text-neutral-900 font-outfit">Before</h3>
                    <Image className="rounded-[10px] _border object-cover h-full" src={`${last}`} priority width={267} height={400} alt="body image" />
                </div>
                <div className="flex gap-2 justify-cente flex-col text-center">
                    <h3 className="text-xl leading-7 font-semibold text-neutral-900 font-outfit">After</h3>
                    <Image className="rounded-[10px] _border object-cover h-full" src={`${current}`} priority width={267} height={400} alt="body image" />
                </div>
            </div>)
    else
        return (<div className=" flex justify-center">
            <div className="flex gap-2 justify-center flex-col text-center">
                <h3 className="text-xl leading-7 font-semibold text-neutral-900 font-outfit">Current form</h3>
                <Image className="rounded-[10px] _border object-cover h-full" src={`${current}`} priority width={267} height={400} alt="body image" />
            </div>

        </div>)
});
BodyImages.displayName = "BodyImages";
export default BodyImages;
