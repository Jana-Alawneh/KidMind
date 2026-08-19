import Card from "./Card";
import { Sparkles } from "lucide-react";

const AIRecommendation = () => {

    return (

        <Card>

            <div className="flex items-center gap-3 mb-6">

                <div className="w-12 h-12 rounded-2xl bg-[#F2EEFF] flex justify-center items-center">

                    <Sparkles className="text-[#7B6EF6]" />

                </div>

                <div>

                    <h2 className="font-semibold text-xl">

                        KidMind AI

                    </h2>

                    <p className="text-sm text-slate-500">

                        Smart Recommendation

                    </p>

                </div>

            </div>

            <div className="space-y-4">

                <div className="bg-[#F7F5FF] rounded-2xl p-4">

                    Lina's attention increased by

                    <span className="font-bold text-[#7B6EF6]">

                        {" "}12%

                    </span>

                </div>

                <div className="bg-[#EEF8E8] rounded-2xl p-4">

                    Suggested next game:

                    <br />

                    <span className="font-semibold">

                        Visual Memory Level 3

                    </span>

                </div>

                <button

                    className="
                    w-full
                    bg-[#7B6EF6]
                    text-white
                    rounded-2xl
                    py-3
                    mt-3
                    hover:bg-[#695CE5]
                    transition
                    "

                >

                    Generate Full AI Report

                </button>

            </div>

        </Card>

    )

}

export default AIRecommendation;