import {
  useMemo,
} from "react";

import {
  Stethoscope,
} from "lucide-react";

import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

import StatsSection from "../components/dashboard/StatsSection";
import PerformanceChart from "../components/dashboard/PerformanceChart";
import TodaySessions from "../components/dashboard/TodaySessions";
import RecentAssessments from "../components/dashboard/RecentAssessments";
import QuickActions from "../components/dashboard/QuickActions";

import RecentChildren from "../components/ui/RecentChildren";
import AIRecommendation from "../components/ui/AIRecommendation";


const Dashboard = () => {

  const currentUser =
    useMemo(
      () => {

        try {

          return JSON.parse(
            sessionStorage.getItem(
              "kidmind_user"
            ) || "{}"
          );

        } catch {

          return {};

        }

      },
      []
    );


  return (

    <div className="therapist-page">

      <Sidebar />


      <main className="therapist-main">

        <Navbar />


        <div className="therapist-content">

          <section className="therapist-welcome">

            <div>

              <span className="therapist-eyebrow">
                THERAPIST WORKSPACE
              </span>


              <h1>

                Welcome back,
                {" "}

                {
                  currentUser.full_name ||
                  "Therapist"
                }

              </h1>


              <p>
                Review children&apos;s progress,
                manage assessment sessions,
                and keep track of cognitive
                performance from one organized
                workspace.
              </p>

            </div>


            <div className="therapist-welcome-icon">

              <Stethoscope
                size={34}
              />

            </div>

          </section>


          <StatsSection />


          <div className="therapist-primary-grid">

            <PerformanceChart />

            <QuickActions />

          </div>


          <div className="therapist-secondary-grid">

            <TodaySessions />

            <AIRecommendation />

          </div>


          <div className="therapist-full-section">

            <RecentChildren />

          </div>


          <div className="therapist-full-section">

            <RecentAssessments />

          </div>

        </div>

      </main>


      <style>
        {`

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
        }

        .therapist-page {
          min-height: 100vh;
          display: flex;
          background: #F7F8FC;
          color: #252852;
          font-family:
            Inter,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .therapist-main {
          flex: 1;
          min-width: 0;
        }

        .therapist-content {
          padding: 32px 34px 45px;
        }

        .therapist-welcome {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 30px;
          padding: 29px 31px;
          border-radius: 25px;
          color: white;
          background:
            linear-gradient(
              110deg,
              #7769F2,
              #9870EE,
              #D276D7
            );
          box-shadow:
            0 18px 40px
            rgba(119,105,242,.18);
        }

        .therapist-eyebrow {
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: .1em;
          opacity: .8;
        }

        .therapist-welcome h1 {
          margin: 8px 0 7px;
          font-size: 29px;
          line-height: 1.2;
          font-weight: 700;
        }

        .therapist-welcome p {
          max-width: 650px;
          margin: 0;
          color: rgba(255,255,255,.82);
          font-size: 13.5px;
          line-height: 1.6;
        }

        .therapist-welcome-icon {
          width: 68px;
          height: 68px;
          flex: 0 0 auto;
          display: grid;
          place-items: center;
          border-radius: 20px;
          color: white;
          background: rgba(255,255,255,.15);
          border: 1px solid rgba(255,255,255,.2);
        }

        .therapist-primary-grid {
          display: grid;
          grid-template-columns:
            minmax(0, 2fr)
            minmax(280px, .85fr);
          gap: 20px;
          margin-top: 20px;
          align-items: stretch;
        }

        .therapist-secondary-grid {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 20px;
          margin-top: 20px;
        }

        .therapist-full-section {
          margin-top: 20px;
        }

        @media (max-width: 1150px) {

          .therapist-primary-grid {
            grid-template-columns: 1fr;
          }

        }

        @media (max-width: 900px) {

          .therapist-content {
            padding:
              25px 22px 40px;
          }

          .therapist-secondary-grid {
            grid-template-columns: 1fr;
          }

          .therapist-welcome {
            padding: 25px;
          }

          .therapist-welcome h1 {
            font-size: 25px;
          }

        }

        `}
      </style>

    </div>

  );

};


export default Dashboard;