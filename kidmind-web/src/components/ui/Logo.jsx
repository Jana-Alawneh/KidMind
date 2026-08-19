import logo from "../../assets/images/logo.png";

const Logo = ({ small=false }) => {

    return (

        <div className="flex items-center gap-3">

            <img

                src={logo}

                alt="KidMind"

                className={small ? "w-12" : "w-16"}

            />

            <div>

                <h1 className="font-bold text-xl">

                    KidMind

                </h1>

                <p className="text-xs text-slate-400">

                    Cognitive Assessment

                </p>

            </div>

        </div>

    );

};

export default Logo;