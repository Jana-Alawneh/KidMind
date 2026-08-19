import StatCard from "../ui/StatCard";

import {
    Users,
    CalendarCheck,
    FileText,
    Bot
} from "lucide-react";


const StatsSection = () => {


    const stats = [

        {
            title:"Children",
            value:"24",
            subtitle:"Registered children",
            change:"+12%",
            bg:"#F1EDFF",
            iconBg:"#7B6EF6",
            icon:<Users />
        },

        {
            title:"Sessions",
            value:"18",
            subtitle:"This month",
            change:"+8%",
            bg:"#EAF7FF",
            iconBg:"#63B3ED",
            icon:<CalendarCheck />
        },


        {
            title:"Reports",
            value:"46",
            subtitle:"Generated reports",
            change:"+15%",
            bg:"#FFF4E8",
            iconBg:"#F6AD55",
            icon:<FileText />
        },


        {
            title:"AI Insights",
            value:"18",
            subtitle:"Recommendations",
            change:"+20%",
            bg:"#EEF8E8",
            iconBg:"#48BB78",
            icon:<Bot />
        }

    ];


    return (

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-6 mt-8">


            {
                stats.map((item)=>(

                    <StatCard

                        key={item.title}

                        {...item}

                    />

                ))
            }


        </div>

    )


}


export default StatsSection;