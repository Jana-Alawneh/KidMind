import Card from "../ui/Card";
import {
    UserPlus,
    CalendarPlus,
    FileText,
    Sparkles
} from "lucide-react";

const actions = [

    {
        title: "Add Child",
        icon: <UserPlus size={22} />,
        color: "bg-[#F3EEFF]"
    },

    {
        title: "Create Session",
        icon: <CalendarPlus size={22} />,
        color: "bg-[#EAF7FF]"
    },

    {
        title: "Generate Report",
        icon: <FileText size={22} />,
        color: "bg-[#FFF4E8]"
    },

    {
        title: "AI Assistant",
        icon: <Sparkles size={22} />,
        color: "bg-[#EEF8E8]"
    }

];

const QuickActions = () => {

    return (

        <Card>

            <h2 className="text-xl font-semibold mb-6">

                Quick Actions

            </h2>

            <div className="grid grid-cols-2 gap-4">

                {

                    actions.map((action) => (

                        <button

                            key={action.title}

                            className={`
                                ${action.color}
                                rounded-2xl
                                p-5
                                flex
                                flex-col
                                items-center
                                gap-3
                                hover:scale-105
                                transition
                            `}

                        >

                            {action.icon}

                            <span className="font-semibold">

                                {action.title}

                            </span>

                        </button>

                    ))

                }

            </div>

        </Card>

    )

}

export default QuickActions;