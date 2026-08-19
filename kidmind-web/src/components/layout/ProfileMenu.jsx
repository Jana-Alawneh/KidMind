const ProfileMenu = () => {
  return (

    <div className="absolute right-0 mt-3 w-56 bg-white rounded-3xl shadow-xl border overflow-hidden z-50">

      <button className="w-full text-left px-6 py-4 hover:bg-[#F7F8FC]">

        👤 My Profile

      </button>

      <button className="w-full text-left px-6 py-4 hover:bg-[#F7F8FC]">

        ⚙ Settings

      </button>

      <button className="w-full text-left px-6 py-4 text-red-500 hover:bg-red-50">

        Logout

      </button>

    </div>

  );
};

export default ProfileMenu;