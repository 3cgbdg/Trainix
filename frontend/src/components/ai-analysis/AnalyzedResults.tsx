"use client"
import { api } from "@/api/axiosInstance";
import { useMutation } from "@tanstack/react-query";
import Image from "next/image"
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import BodyImages from "./BodyImages";


// interface for metrics needed ai to analyze and create proper plan
interface IReceivedAnalysis {
  weight: { data: number, difference: number | null },
  chartData: { month: string, bodyFatPercent: number }[],
  leanBodyMass: { data: number, difference: number | null },
  bodyFatPercent: { data: number, difference: number | null },
  MuscleMass: { data: number, difference: number | null },
  bmi: { data: number, difference: number | null },
  imageUrlCurrent: string,
  imageUrlLast: string | null,
  waistToHipRatio: { data: number, difference: number | null },
  advices: {
    nutrition: string;
    hydration: string;
    recovery: string;
    progress: string;
  }

}



const AnalyzedResults = ({ data }: { data: IReceivedAnalysis }) => {
  const router = useRouter();
  const retakePhoto = useCallback(async () => {
    const res = await api.delete("/api/fitness-plan/plan");
    return res.data;
  }, []);
  const retakePhotoMutation = useMutation({
    mutationFn: retakePhoto,
    onSuccess: () => {
      router.refresh();
    }
  })
  return (
    <div className="flex flex-col gap-10">
      <h1 className="page-title">AI Photo Analysis: Analyzing Results</h1>
      <div className="flex flex-col gap-6">
        <div className="bg-white rounded-[10px] _border p-6">
          <div className="flex flex-col gap-1.5 mb-6">
            <h2 className="section-title">Photo Analysis Comparison</h2>
            <p className="leading-5 text-sm text-neutral-600">See the visual changes between your previous and latest fitness photos.</p>
          </div>
          {/* image */}
          <BodyImages current={data.imageUrlCurrent} last={data.imageUrlLast} />

        </div>
        {/* metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div className="pt-8 pb-8 md:pb-6 lg:p-6 p-4 _border rounded-[10px] bg-white flex flex-col justify-between gap-4 font-outfit">
            <h3 className="text-lg leading-7 font-medium text-neutral-600">Body Fat %</h3>
            <div className="flex md:items-end justify-between md:flex-row flex-col gap-2 ">
              <span className="text-4xl leading-10 font-bold text-black">{data.bodyFatPercent.data}%</span>
              <span className={`tex-sm leading-5 font-semibold ${data.bodyFatPercent.difference && data.bodyFatPercent.difference > 0 ? "text-red" : "text-green"} `}>{data.bodyFatPercent.difference !== null && data.bodyFatPercent.difference >= 0 ? "+" + data.bodyFatPercent.difference : data.bodyFatPercent.difference}%</span>
            </div>
          </div>
          <div className="pt-8 pb-8 md:pb-6 lg:p-6 p-4 _border rounded-[10px] bg-white flex flex-col justify-between gap-4 font-outfit">
            <h3 className="text-lg leading-7 font-medium text-neutral-600">Muscle Mass</h3>
            <div className="flex md:items-end justify-between md:flex-row flex-col gap-2">
              <span className="text-4xl leading-10 font-bold text-black">{data.MuscleMass.data} kg</span>
              <span className={`tex-sm leading-5 font-semibold ${data.MuscleMass.difference && data.MuscleMass.difference < 0 ? "text-red" : "text-green"} `}>{data.MuscleMass.difference !== null && data.MuscleMass.difference >= 0 ? "+" + data.MuscleMass.difference : data.MuscleMass.difference} kg</span>
            </div>
          </div>
          <div className="pt-8 pb-8 md:pb-6 lg:p-6 p-4 _border rounded-[10px] bg-white flex flex-col justify-between gap-4 font-outfit">
            <h3 className="text-lg leading-7 font-medium text-neutral-600">BMI</h3>
            <div className="flex md:items-end justify-between md:flex-row flex-col gap-2">
              <span className="text-4xl leading-10 font-bold text-black">{data.bmi.data}</span>
              <span className={`tex-sm leading-5 font-semibold ${data.bmi.difference && data.bmi.difference > 0 ? "text-red" : "text-green"} `}>{data.bmi.difference !== null && data.bmi.difference >= 0 ? "+" + data.bmi.difference : data.bmi.difference}</span>
            </div>
          </div>

          <div className="pt-8 pb-8 md:pb-6 lg:p-6 p-4 _border rounded-[10px] bg-white flex flex-col justify-between gap-4 font-outfit">
            <h3 className="text-lg leading-7 font-medium text-neutral-600">Waist-to-Hip Ratio</h3>
            <div className="flex md:items-end justify-between md:flex-row flex-col gap-2">
              <span className="text-4xl leading-10 font-bold text-black">{data.waistToHipRatio.data}</span>
              <span className={`tex-sm leading-5 font-semibold ${data.waistToHipRatio.difference && data.waistToHipRatio.difference > 0 ? "text-red" : "text-green"} `}>{data.waistToHipRatio.difference !== null && data.waistToHipRatio.difference >= 0 ? "+" + data.waistToHipRatio.difference : data.waistToHipRatio.difference}</span>
            </div>
          </div>
          <div className="pt-8 pb-8 md:pb-6 lg:p-6 p-4 _border rounded-[10px] bg-white flex flex-col justify-between gap-4 font-outfit">
            <h3 className="text-lg leading-7 font-medium text-neutral-600">Body Weight</h3>
            <div className="flex md:items-end justify-between md:flex-row flex-col gap-2">
              <span className="text-4xl leading-10 font-bold text-black">{data.weight.data} kg</span>
              <span className={`tex-sm leading-5 font-semibold ${data.weight.difference && data.weight.difference > 0 ? "text-red" : "text-green"} `}>{data.weight.difference !== null && data.weight.difference >= 0 ? "+" + data.weight.difference : data.weight.difference} kg</span>
            </div>
          </div>
          <div className="pt-8 pb-8 md:pb-6 lg:p-6 p-4 _border rounded-[10px] bg-white flex flex-col justify-between gap-4 font-outfit">
            <h3 className="text-lg leading-7 font-medium text-neutral-600">Lean Body Mass</h3>
            <div className="flex md:items-end justify-between md:flex-row flex-col gap-2">
              <span className="text-4xl leading-10 font-bold text-black">{data.leanBodyMass.data} kg</span>
              <span className={`tex-sm leading-5 font-semibold ${data.leanBodyMass.difference && data.leanBodyMass.difference > 0 ? "text-red" : "text-black"} `}>{data.leanBodyMass.difference !== null && data.leanBodyMass.difference >= 0 ? "+" + data.leanBodyMass.difference.toFixed(2) : data.leanBodyMass.difference?.toFixed(2)} kg</span>
            </div>
          </div>

        </div>
        {/* AI-Powered Insights & Recommendations */}
        <div className="bg-white rounded-[10px] _border p-6">
          <div className="flex flex-col gap-1.5 mb-6">
            <h2 className="section-title">AI-Powered Insights & Recommendations</h2>
            <p className="text-sm leading-5 text-neutral-600">Detailed analysis and personalized advice based on your fitness photo.</p>
          </div>
          <div className="flex flex-col gap-5.5">
            <div className="">
              <h3 className="text-xl leading-7 font-semibold font-outfit mb-2.5">Hydration💧</h3>
              <p className="leading-[26px] text-neutral-900">{data.advices.hydration}</p>
            </div>
            <div className="">
              <h3 className="text-xl leading-7 font-semibold font-outfit mb-2.5">Nutrition🍓</h3>
              <p className="leading-[26px] text-neutral-900">{data.advices.nutrition}</p>
            </div>
            <div className="">
              <h3 className="text-xl leading-7 font-semibold font-outfit mb-2.5">Progress📈</h3>
              <p className="leading-[26px] text-neutral-900">{data.advices.progress}</p>
            </div>
            <div className="">
              <h3 className="text-xl leading-7 font-semibold font-outfit mb-2.5">Recovery😪</h3>
              <p className="leading-[26px] text-neutral-900">{data.advices.recovery}</p>
            </div>
          </div>
        </div>
        {/* body fat chart */}
        <div className="bg-white rounded-[10px] _border p-6 mb-3.5">
          <div className="flex flex-col gap-1.5 mb-6">
            <h2 className="section-title">Body Fat Percentage Trend</h2>
            <p className="text-sm leading-5 text-neutral-600">Visualizing your body fat percentage changes over the past 6 months.</p>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data.chartData}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis dataKey="bodyFat" domain={['auto', 'auto']} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="Body Fat (%)"
                stroke="#22c55e"
                dot={{ stroke: "#22c55e", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {/* retake photo by deleting the previous plan */}
        <div className="flex items-center justify-end gap-4 max-w-[272px] ml-auto w-full">
          <button onClick={() => retakePhotoMutation.mutate()} className="button-transparent !bg-white">Retake Photo</button>
        </div>
      </div>
    </div>
  )
}

export default AnalyzedResults