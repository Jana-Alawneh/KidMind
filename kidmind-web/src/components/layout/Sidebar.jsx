import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Gamepad2,
  FileText,
  Bot,
  Settings,
  MessageCircle,
  Bell,
  LogOut,
} from "lucide-react";

import { NavLink } from "react-router-dom";


const menu = [

  {
    title: "Dashboard",
    icon: <LayoutDashboard size={19} />,
    path: "/",
  },

  {
    title: "Children",
    icon: <Users size={19} />,
    path: "/children",
  },

  {
    title: "Sessions",
    icon: <CalendarDays size={19} />,
    path: "/sessions",
  },

  {
    title: "Game Builder",
    icon: <Gamepad2 size={19} />,
    path: "/games",
  },

  {
    title: "Reports",
    icon: <FileText size={19} />,
    path: "/reports",
  },

  {
    title: "AI Assistant",
    icon: <Bot size={19} />,
    path: "/ai",
  },

  {
    title: "Therapist Chat",
    icon: <MessageCircle size={19} />,
    path: "/chat",
  },

  {
    title: "Notifications",
    icon: <Bell size={19} />,
    path: "/notifications",
  },

  {
    title: "Settings",
    icon: <Settings size={19} />,
    path: "/settings",
  },

];



const Sidebar = () => {


return (

<aside

className="
w-[270px]
h-screen

bg-white/80

backdrop-blur-xl

border-r
border-[#ECECF5]

shadow-[0_10px_40px_rgba(124,108,255,.08)]

flex
flex-col

px-5
py-4

"

>


{/* Logo */}

<div

className="
flex
justify-center
mb-5
"

>

<img

src="/logo.png"

alt="KidMind Logo"

className="
w-60
h-60
object-contain
"

/>


</div>




{/* Menu */}

<nav

className="
flex-1
space-y-1

"

>


{

menu.map((item)=>(


<NavLink

key={item.title}

to={item.path}


className={({isActive}) =>

`

group

relative

flex

items-center

gap-3

h-11

px-4

rounded-[16px]

transition-all

duration-300


${
isActive

?

"bg-[#F2EEFF] text-[#7C6CFF] shadow-sm"

:

"text-[#8E91A8] hover:bg-[#F8F8FC] hover:text-[#7C6CFF]"

}

`

}


>


{({isActive}) => (

<>


{
isActive &&

<div

className="
absolute
left-0
top-2
bottom-2
w-1
rounded-full
bg-[#7C6CFF]
"

/>

}



<span>

{item.icon}

</span>



<span

className="
font-medium
text-[14px]
"

>

{item.title}

</span>



</>

)}



</NavLink>


))

}


</nav>





{/* Logout */}

<button

className="

mt-3

flex

items-center

gap-3

h-11

px-4

rounded-[16px]

text-red-500

hover:bg-red-50

transition-all

duration-300

"

>


<LogOut size={19}/>


<span

className="
font-medium
text-[14px]
"

>

Logout

</span>


</button>



</aside>


);


};


export default Sidebar;