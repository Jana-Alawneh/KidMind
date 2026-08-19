import { useState } from "react";
import { Bell, Search, ChevronDown } from "lucide-react";

import Notifications from "./Notifications";
import ProfileMenu from "./ProfileMenu";

const Navbar = () => {

    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfile, setShowProfile] = useState(false);

    const today = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
    });

    return (

        <div className="flex justify-between items-center">

            {/* Left */}

            <div>

                <p className="text-sm text-slate-400">

                    {today}

                </p>

                <h1 className="text-4xl font-bold mt-1">

                    Welcome Back

                </h1>

                <p className="text-slate-500 mt-2">

                    Monitor your children's cognitive assessments in one place.

                </p>

            </div>

            {/* Right */}

            <div className="flex items-center gap-5">

                {/* Search */}

                <div className="relative">

                    <Search

                        size={18}

                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"

                    />

                    <input

                        type="text"

                        placeholder="Search..."

                        className="
                        w-80
                        h-12
                        rounded-2xl
                        bg-white
                        border
                        pl-11
                        pr-4
                        outline-none
                        focus:border-[#7B6EF6]
                        transition
                        "

                    />

                </div>

                {/* Notifications */}

                <div className="relative">

                    <button

                        onClick={() => {

                            setShowNotifications(!showNotifications);

                            setShowProfile(false);

                        }}

                        className="
                        relative
                        w-12
                        h-12
                        rounded-2xl
                        bg-white
                        border
                        flex
                        justify-center
                        items-center
                        hover:bg-[#F7F8FC]
                        transition
                        "

                    >

                        <Bell size={20} />

                        <div

                            className="
                            absolute
                            top-2
                            right-2
                            w-2
                            h-2
                            rounded-full
                            bg-red-500
                            "

                        />

                    </button>

                    {

                        showNotifications && <Notifications />

                    }

                </div>

                {/* Profile */}

                <div className="relative">

                    <button

                        onClick={() => {

                            setShowProfile(!showProfile);

                            setShowNotifications(false);

                        }}

                        className="
                        flex
                        items-center
                        gap-3
                        bg-white
                        border
                        rounded-2xl
                        px-3
                        py-2
                        hover:shadow-md
                        transition
                        "

                    >

                        <img

                            src="https://i.pravatar.cc/100"

                            className="w-11 h-11 rounded-xl"

                            alt="Doctor"

                        />

                        <div className="text-left">

                            <h3 className="font-semibold">

                                Dr. Ahmad

                            </h3>

                            <p className="text-xs text-slate-500">

                                Therapist

                            </p>

                        </div>

                        <ChevronDown size={18} />

                    </button>

                    {

                        showProfile && <ProfileMenu />

                    }

                </div>

            </div>

        </div>

    );

};

export default Navbar;