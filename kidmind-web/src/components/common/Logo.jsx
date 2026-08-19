import logo from "../../assets/images/logo.png";

const Logo = () => {
  return (
    <div className="flex justify-center mb-8">

      <img
        src={logo}
        alt="KidMind"
        className="w-40"
      />

    </div>
  );
};

export default Logo;