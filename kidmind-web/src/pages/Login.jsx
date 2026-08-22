import {
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import api from "../services/api";


export default function Login() {

  const navigate =
    useNavigate();


  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");


  const handleSubmit = async (
    event
  ) => {

    event.preventDefault();

    setError("");


    if (
      !email.trim() ||
      !password
    ) {

      setError(
        "Please enter your email and password."
      );

      return;
    }


    try {

      setLoading(true);


      const response =
        await api.post(
          "/users/login",
          {
            email:
              email.trim(),
            password,
          }
        );


      const {
        token,
        user,
      } = response.data;


      sessionStorage.setItem(
        "kidmind_token",
        token
      );

      sessionStorage.setItem(
        "kidmind_user",
        JSON.stringify(user)
      );


      navigate(
        "/",
        {
          replace: true,
        }
      );

    } catch (requestError) {

      const message =
        requestError.response
          ?.data
          ?.message;


      if (
        message ===
        "Invalid email or password"
      ) {

        setError(
          "Incorrect email or password."
        );

      } else if (
        message ===
        "This account is inactive"
      ) {

        setError(
          "Your account is currently inactive. Please contact the administrator."
        );

      } else {

        setError(
          "Unable to sign in. Please try again."
        );

      }

    } finally {

      setLoading(false);

    }

  };


  return (

    <div className="kidmind-login-page">

      <div className="login-bg-shape shape-one" />

      <div className="login-bg-shape shape-two" />


      <section className="login-visual-section">

        <div className="visual-content">


          <div className="visual-badge">

            Child Cognitive Assessment Platform

          </div>


          <h1>

            Supporting Growth.
            <br />

            <span>
              Understanding Every Mind.
            </span>

          </h1>


          <p>

            KidMind helps therapists and
            care teams assess children's
            cognitive skills, track their
            progress, and understand each
            child's development journey
            through interactive assessment
            sessions.

          </p>


          <div className="visual-image-wrap">

            <img
  src="/login-illustration.png"
  alt="KidMind child learning illustration"
  className="visual-image"
/>

          </div>

        </div>

      </section>


      <section className="login-form-section">

        <div className="login-card">


          <div className="brand">

            <img
              src="/logo.png"
              alt="KidMind Logo"
              className="login-logo"
            />

          </div>


          <div className="login-heading">

            <h2>
              Welcome Back
            </h2>

            <p>
              Sign in to access child
              assessments, sessions,
              progress, and reports.
            </p>

          </div>


          <form
            onSubmit={handleSubmit}
            className="login-form"
          >


            <div className="form-group">

              <label
                htmlFor="email"
              >
                Email address
              </label>


              <div className="input-wrapper">

                <span className="input-icon">

                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >

                    <path
                      d="M4 6h16v12H4V6Zm0 1 8 6 8-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                  </svg>

                </span>


                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(
                    event
                  ) =>
                    setEmail(
                      event.target.value
                    )
                  }
                  placeholder="Enter your email"
                  autoComplete="email"
                  disabled={loading}
                />

              </div>

            </div>


            <div className="form-group">

              <label
                htmlFor="password"
              >
                Password
              </label>


              <div className="input-wrapper">

                <span className="input-icon">

                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >

                    <rect
                      x="5"
                      y="10"
                      width="14"
                      height="10"
                      rx="2"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />

                    <path
                      d="M8 10V7a4 4 0 0 1 8 0v3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />

                  </svg>

                </span>


                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(
                    event
                  ) =>
                    setPassword(
                      event.target.value
                    )
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={loading}
                />


                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (
                        current
                      ) => !current
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >

                  {showPassword
                    ? (

                      <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >

                        <path
                          d="M3 3l18 18M10.6 10.7a2 2 0 0 0 2.7 2.7M9.9 4.4A10.7 10.7 0 0 1 12 4c5.5 0 9 5 9 5s-1.2 1.8-3.2 3.2M6.2 6.2C4.2 7.4 3 9 3 9s3.5 5 9 5c1 0 1.9-.2 2.7-.4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                      </svg>

                    )
                    : (

                      <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >

                        <path
                          d="M3 12s3.5-5 9-5 9 5 9 5-3.5 5-9 5-9-5-9-5Z"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        />

                        <circle
                          cx="12"
                          cy="12"
                          r="2.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        />

                      </svg>

                    )}

                </button>

              </div>

            </div>


            {error && (

              <div className="login-error">

                <span>
                  !
                </span>

                {error}

              </div>

            )}


            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >

              {loading
                ? (

                  <>

                    <span className="button-spinner" />

                    Signing in...

                  </>

                )
                : "Login"}

            </button>

          </form>


          <div className="login-footer">

            <div className="secure-icon">

              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
              >

                <path
                  d="M12 3 5 6v5c0 4.7 2.8 8.2 7 10 4.2-1.8 7-5.3 7-10V6l-7-3Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinejoin="round"
                />

                <path
                  d="m9.5 12 1.6 1.6 3.5-3.7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

              </svg>

            </div>

            <span>
              Secure access for authorized
              KidMind users
            </span>

          </div>

        </div>

      </section>


      <style>
        {`

          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
          }

          .kidmind-login-page {
            min-height: 100vh;
            width: 100%;
            overflow: hidden;

            display: grid;

            grid-template-columns:
              minmax(0, 1.08fr)
              minmax(480px, 0.92fr);

            position: relative;

            background:
              radial-gradient(
                circle at 11% 10%,
                rgba(125, 108, 255, 0.08),
                transparent 27%
              ),
              radial-gradient(
                circle at 92% 88%,
                rgba(236, 112, 203, 0.11),
                transparent 31%
              ),
              linear-gradient(
                145deg,
                #ffffff 0%,
                #fdfcff 48%,
                #f7f3ff 100%
              );

            font-family:
              Inter,
              system-ui,
              -apple-system,
              BlinkMacSystemFont,
              "Segoe UI",
              sans-serif;

            color: #202453;
          }


          .kidmind-login-page::before {
            content: "";

            position: absolute;

            width: 780px;
            height: 430px;

            left: -180px;
            bottom: -270px;

            border-radius: 50%;

            background:
              linear-gradient(
                135deg,
                rgba(133, 119, 255, 0.14),
                rgba(211, 161, 255, 0.06)
              );

            transform:
              rotate(-8deg);

            pointer-events:
              none;
          }


          .kidmind-login-page::after {
            content: "";

            position: absolute;

            width: 850px;
            height: 420px;

            right: -220px;
            bottom: -290px;

            border-radius: 50%;

            background:
              linear-gradient(
                135deg,
                rgba(189, 147, 255, 0.14),
                rgba(247, 142, 217, 0.09)
              );

            transform:
              rotate(-9deg);

            pointer-events:
              none;
          }


          .login-bg-shape {
            position: absolute;

            border-radius: 50%;

            pointer-events: none;
          }


          .shape-one {
            width: 180px;
            height: 180px;

            top: -95px;
            left: 40%;

            background:
              rgba(134, 112, 255, 0.06);
          }


          .shape-two {
            width: 230px;
            height: 230px;

            right: -110px;
            top: 20%;

            background:
              rgba(237, 109, 204, 0.06);
          }


          .login-visual-section {
            position: relative;

            z-index: 1;

            min-height: 100vh;

            display: flex;

            align-items: center;

            justify-content: center;

            padding:
              42px
              clamp(48px, 7vw, 115px);
          }


          .visual-content {
            width:
              min(
                680px,
                100%
              );
          }


          .visual-badge {
            display: inline-flex;

            align-items: center;

            min-height: 34px;

            padding:
              0 16px;

            margin-bottom: 20px;

            border-radius: 999px;

            background:
              rgba(120, 105, 255, 0.08);

            border:
              1px solid
              rgba(120, 105, 255, 0.11);

            color: #6d61df;

            font-size: 13px;

            font-weight: 700;

            letter-spacing:
              0.02em;
          }


          .visual-content h1 {
            margin: 0;

            font-size:
              clamp(
                40px,
                4vw,
                62px
              );

            line-height: 1.08;

            letter-spacing:
              -0.04em;

            color: #2c266e;

            font-weight: 800;
          }


          .visual-content h1 span {
            background:
              linear-gradient(
                100deg,
                #746cff,
                #ae68ef,
                #ed77c6
              );

            -webkit-background-clip:
              text;

            background-clip:
              text;

            color: transparent;
          }


          .visual-content > p {
            width:
              min(
                560px,
                100%
              );

            margin:
              24px
              0
              4px;

            color: #53607d;

            font-size:
              clamp(
                16px,
                1.2vw,
                18px
              );

            line-height: 1.7;
          }


          .visual-image-wrap {
            position: relative;

            width:
              min(
                620px,
                100%
              );

            height: 430px;

            margin-top: 6px;

            display: flex;

            align-items: flex-end;

            justify-content: center;
          }


          .visual-image-wrap::before {
            content: "";

            position: absolute;

            width: 78%;
            height: 42%;

            left: 11%;
            bottom: 12px;

            border-radius: 50%;

            background:
              radial-gradient(
                circle,
                rgba(129, 115, 255, 0.16),
                transparent 67%
              );

            filter:
              blur(5px);
          }


          .visual-image {
            position: relative;

            z-index: 1;

            display: block;

            width: 100%;
            height: 100%;

            object-fit: contain;
          }


          .login-form-section {
            position: relative;

            z-index: 2;

            min-height: 100vh;

            display: flex;

            align-items: center;

            justify-content: center;

            padding:
              42px
              54px;
          }


          .login-card {
            width:
              min(
                570px,
                100%
              );

            padding:
              clamp(
                42px,
                4.5vw,
                62px
              );

            border-radius: 34px;

            background:
              rgba(255, 255, 255, 0.88);

            border:
              1px solid
              rgba(99, 90, 168, 0.12);

            box-shadow:
              0
              28px
              80px
              rgba(86, 66, 159, 0.11);

            backdrop-filter:
              blur(22px);
          }


          .brand {
            display: flex;

            justify-content: center;

            align-items: center;

            margin-bottom: 30px;
          }


          .login-logo {
            display: block;

            width: 245px;

            max-width: 80%;

            height: auto;

            object-fit: contain;
          }


          .login-heading {
            text-align: center;

            margin-bottom: 34px;
          }


          .login-heading h2 {
            margin:
              0
              0
              11px;

            font-size:
              clamp(
                32px,
                3vw,
                42px
              );

            letter-spacing:
              -0.025em;

            color: #322a7a;
          }


          .login-heading p {
            max-width: 430px;

            margin:
              0 auto;

            color: #68738f;

            line-height: 1.6;

            font-size: 15.5px;
          }


          .login-form {
            display: flex;

            flex-direction: column;

            gap: 22px;
          }


          .form-group {
            display: flex;

            flex-direction: column;

            gap: 9px;
          }


          .form-group label {
            color: #28335b;

            font-size: 14px;

            font-weight: 700;
          }


          .input-wrapper {
            position: relative;

            height: 58px;
          }


          .input-wrapper input {
            width: 100%;
            height: 100%;

            padding:
              0 52px
              0 50px;

            outline: none;

            border-radius: 16px;

            border:
              1.5px solid
              #e0e2ee;

            background:
              rgba(
                255,
                255,
                255,
                0.84
              );

            color: #252852;

            font-size: 15px;

            transition:
              border-color 0.18s ease,
              box-shadow 0.18s ease,
              background 0.18s ease;
          }


          .input-wrapper input::placeholder {
            color: #a3abc0;
          }


          .input-wrapper input:focus {
            border-color:
              #8a7cf5;

            background:
              #ffffff;

            box-shadow:
              0
              0
              0
              4px
              rgba(
                125,
                111,
                242,
                0.09
              );
          }


          .input-wrapper input:disabled {
            cursor: not-allowed;

            opacity: 0.7;
          }


          .input-icon {
            position: absolute;

            z-index: 2;

            left: 17px;

            top: 50%;

            transform:
              translateY(-50%);

            width: 21px;

            height: 21px;

            color: #9ba3ba;

            pointer-events:
              none;
          }


          .input-icon svg {
            width: 100%;

            height: 100%;
          }


          .password-toggle {
            position: absolute;

            z-index: 2;

            right: 15px;

            top: 50%;

            transform:
              translateY(-50%);

            width: 32px;

            height: 32px;

            border: 0;

            border-radius: 9px;

            background:
              transparent;

            color: #969eb5;

            display: grid;

            place-items: center;

            cursor: pointer;

            padding: 6px;
          }


          .password-toggle:hover {
            background:
              rgba(
                120,
                106,
                242,
                0.08
              );

            color: #7669e5;
          }


          .password-toggle svg {
            width: 20px;

            height: 20px;
          }


          .login-error {
            min-height: 46px;

            display: flex;

            align-items: center;

            gap: 10px;

            padding:
              10px
              14px;

            margin-top: -3px;

            border-radius: 13px;

            border:
              1px solid
              rgba(
                221,
                76,
                105,
                0.15
              );

            background:
              rgba(
                255,
                238,
                242,
                0.9
              );

            color: #b63f5b;

            font-size: 13.5px;

            line-height: 1.45;
          }


          .login-error span {
            width: 22px;

            height: 22px;

            flex: 0 0 auto;

            border-radius: 50%;

            background: #db5873;

            color: white;

            display: grid;

            place-items: center;

            font-size: 12px;

            font-weight: 800;
          }


          .login-button {
            height: 58px;

            border: 0;

            border-radius: 16px;

            margin-top: 3px;

            color: #ffffff;

            background:
              linear-gradient(
                100deg,
                #706cff 0%,
                #9c6bf1 52%,
                #ed70c6 100%
              );

            font-size: 17px;

            font-weight: 700;

            cursor: pointer;

            box-shadow:
              0
              13px
              28px
              rgba(
                126,
                103,
                231,
                0.22
              );

            display: flex;

            align-items: center;

            justify-content: center;

            gap: 10px;

            transition:
              transform 0.16s ease,
              box-shadow 0.16s ease,
              opacity 0.16s ease;
          }


          .login-button:hover:not(:disabled) {
            transform:
              translateY(-1px);

            box-shadow:
              0
              16px
              32px
              rgba(
                126,
                103,
                231,
                0.28
              );
          }


          .login-button:disabled {
            cursor: not-allowed;

            opacity: 0.72;
          }


          .button-spinner {
            width: 19px;

            height: 19px;

            border-radius: 50%;

            border:
              2px solid
              rgba(
                255,
                255,
                255,
                0.45
              );

            border-top-color:
              #ffffff;

            animation:
              kidmindSpin
              0.75s
              linear
              infinite;
          }


          @keyframes kidmindSpin {

            to {
              transform:
                rotate(360deg);
            }

          }


          .login-footer {
            margin-top: 30px;

            padding-top: 22px;

            border-top:
              1px solid
              #edeaf5;

            display: flex;

            justify-content: center;

            align-items: center;

            gap: 9px;

            color: #9299ad;

            font-size: 12.5px;
          }


          .secure-icon {
            width: 18px;

            height: 18px;

            color: #8173e7;

            flex: 0 0 auto;
          }


          .secure-icon svg {
            width: 100%;

            height: 100%;
          }


          @media (
            max-width: 1100px
          ) {

            .kidmind-login-page {
              grid-template-columns:
                1fr
                0.95fr;
            }


            .login-visual-section {
              padding:
                40px
                44px;
            }


            .visual-image-wrap {
              height: 360px;
            }


            .login-form-section {
              padding:
                34px;
            }

          }


          @media (
            max-width: 860px
          ) {

            .kidmind-login-page {
              display: flex;
            }


            .login-visual-section {
              display: none;
            }


            .login-form-section {
              width: 100%;

              min-height: 100vh;

              padding:
                28px
                18px;
            }


            .login-card {
              width:
                min(
                  540px,
                  100%
                );

              padding:
                40px
                28px;

              border-radius: 28px;
            }


            .login-logo {
              width: 210px;
            }

          }


          @media (
            max-width: 480px
          ) {

            .login-card {
              padding:
                34px
                20px;

              border-radius: 24px;
            }


            .login-heading {
              margin-bottom: 29px;
            }


            .login-heading h2 {
              font-size: 30px;
            }


            .login-form {
              gap: 19px;
            }


            .input-wrapper {
              height: 55px;
            }


            .login-button {
              height: 55px;
            }


            .login-footer {
              text-align: center;
            }

          }

        `}
      </style>

    </div>

  );

}