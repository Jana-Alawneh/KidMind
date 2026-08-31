import {
  useEffect,
  useState,
} from "react";

import {
  ClipboardList,
  Mail,
  MessageSquareText,
  RefreshCw,
} from "lucide-react";

import {
  getAdminFeedback,
} from "../../api/feedbackApi";


const formatDateTime =
  value => {

    if (
      !value
    ) {
      return "—";
    }


    const date =
      new Date(
        String(value).replace(
          " ",
          "T"
        )
      );


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "—";
    }


    return date.toLocaleString(
      "en-US",
      {
        month:
          "short",
        day:
          "numeric",
        year:
          "numeric",
        hour:
          "numeric",
        minute:
          "2-digit",
      }
    );

  };


const getInitials =
  name => {

    const cleanName =
      String(
        name || ""
      )
        .trim();


    if (
      !cleanName
    ) {
      return "P";
    }


    return cleanName
      .split(/\s+/)
      .slice(
        0,
        2
      )
      .map(
        part =>
          part[0]
            ?.toUpperCase()
      )
      .join("");

  };


export default function AdminFeedback() {

  const [
    feedback,
    setFeedback,
  ] =
    useState([]);


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  const [
    refreshing,
    setRefreshing,
  ] =
    useState(false);


  const [
    error,
    setError,
  ] =
    useState("");


  const loadFeedback =
    async (
      refresh = false
    ) => {

      try {

        if (
          refresh
        ) {
          setRefreshing(
            true
          );
        } else {
          setLoading(
            true
          );
        }


        setError("");


        const data =
          await getAdminFeedback();


        setFeedback(
          data
        );

      } catch (
        requestError
      ) {

        console.error(
          "Unable to load feedback:",
          requestError
        );


        setError(
          requestError.response
            ?.data
            ?.message ||
          "Unable to load parent feedback."
        );

      } finally {

        setLoading(
          false
        );

        setRefreshing(
          false
        );

      }

    };


  useEffect(
    () => {

      loadFeedback();

    },
    []
  );


  return (

    <div className="admin-feedback-page">

      <div className="admin-feedback-heading">

        <div>

          <span className="admin-feedback-eyebrow">
            FAMILY EXPERIENCE
          </span>

          <h1>
            Parent Feedback
          </h1>

          <p>
            Feedback submitted directly by parent accounts. These messages are separate from KidMind chat.
          </p>

        </div>


        <button
          type="button"
          className="admin-feedback-refresh"
          disabled={
            refreshing
          }
          onClick={() =>
            loadFeedback(
              true
            )
          }
        >

          <RefreshCw
            size={17}
            className={
              refreshing
                ? "admin-feedback-spinning"
                : ""
            }
          />

          {
            refreshing
              ? "Refreshing..."
              : "Refresh"
          }

        </button>

      </div>


      <div className="admin-feedback-summary">

        <div className="admin-feedback-summary-icon">

          <ClipboardList
            size={23}
          />

        </div>


        <div>

          <span>
            Total Feedback
          </span>

          <strong>
            {feedback.length}
          </strong>

        </div>

      </div>


      {
        loading ? (

          <div className="admin-feedback-state">

            <div className="admin-feedback-loader" />

            <h2>
              Loading feedback
            </h2>

            <p>
              Retrieving parent feedback messages.
            </p>

          </div>

        ) : error ? (

          <div className="admin-feedback-state admin-feedback-error">

            <MessageSquareText
              size={34}
            />

            <h2>
              Unable to load feedback
            </h2>

            <p>
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                loadFeedback()
              }
            >
              Try Again
            </button>

          </div>

        ) : feedback.length ===
          0 ? (

          <div className="admin-feedback-state">

            <div className="admin-feedback-empty-icon">

              <MessageSquareText
                size={31}
              />

            </div>

            <h2>
              No feedback yet
            </h2>

            <p>
              Parent feedback will appear here after a parent submits a message.
            </p>

          </div>

        ) : (

          <div className="admin-feedback-list">

            {
              feedback.map(
                item => (

                  <article
                    key={
                      item.id
                    }
                    className="admin-feedback-card"
                  >

                    <div className="admin-feedback-card-top">

                      <div className="admin-feedback-parent">

                        <div className="admin-feedback-avatar">
                          {
                            getInitials(
                              item.parent_name
                            )
                          }
                        </div>


                        <div>

                          <strong>
                            {
                              item.parent_name ||
                              "Parent"
                            }
                          </strong>

                          <span>
                            <Mail
                              size={13}
                            />

                            {
                              item.parent_email ||
                              "No email"
                            }
                          </span>

                        </div>

                      </div>


                      <time>
                        {
                          formatDateTime(
                            item.created_at
                          )
                        }
                      </time>

                    </div>


                    <div className="admin-feedback-body">

                      <MessageSquareText
                        size={18}
                      />

                      <p>
                        {item.message}
                      </p>

                    </div>

                  </article>

                )
              )
            }

          </div>

        )
      }


      <style>
        {`

        .admin-feedback-page {
          display: grid;
          gap: 20px;
        }

        .admin-feedback-heading {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
        }

        .admin-feedback-eyebrow {
          display: block;
          margin-bottom: 5px;
          color: #7465e8;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .admin-feedback-heading h1 {
          margin: 0;
          color: #252852;
          font-size: 28px;
        }

        .admin-feedback-heading p {
          max-width: 700px;
          margin: 8px 0 0;
          color: #77798f;
          line-height: 1.6;
        }

        .admin-feedback-refresh {
          min-height: 44px;
          padding: 0 16px;
          border: 1px solid #e1dff4;
          border-radius: 13px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #6558cf;
          background: #ffffff;
          font: inherit;
          font-size: 13px;
          font-weight: 750;
          cursor: pointer;
        }

        .admin-feedback-refresh:disabled {
          opacity: 0.6;
          cursor: wait;
        }

        .admin-feedback-summary {
          width: fit-content;
          min-width: 190px;
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 16px 18px;
          border: 1px solid #ececf4;
          border-radius: 18px;
          background: #ffffff;
        }

        .admin-feedback-summary-icon {
          width: 44px;
          height: 44px;
          display: grid;
          place-items: center;
          border-radius: 14px;
          color: #7465e8;
          background: #eeeaff;
        }

        .admin-feedback-summary span {
          display: block;
          color: #8a8c9e;
          font-size: 11px;
          font-weight: 700;
        }

        .admin-feedback-summary strong {
          display: block;
          margin-top: 2px;
          color: #252852;
          font-size: 22px;
        }

        .admin-feedback-list {
          display: grid;
          gap: 14px;
        }

        .admin-feedback-card {
          padding: 20px;
          border: 1px solid #ececf4;
          border-radius: 20px;
          background: #ffffff;
          box-shadow:
            0 8px 24px
            rgba(
              52,
              48,
              100,
              0.04
            );
        }

        .admin-feedback-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
        }

        .admin-feedback-parent {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .admin-feedback-avatar {
          width: 46px;
          height: 46px;
          flex: 0 0 46px;
          display: grid;
          place-items: center;
          border-radius: 15px;
          color: #6758d5;
          background: #eeeaff;
          font-size: 13px;
          font-weight: 850;
        }

        .admin-feedback-parent strong {
          display: block;
          color: #333554;
          font-size: 14px;
        }

        .admin-feedback-parent span {
          display: flex;
          align-items: center;
          gap: 5px;
          margin-top: 5px;
          color: #9697a8;
          font-size: 11px;
          word-break: break-all;
        }

        .admin-feedback-card time {
          flex: 0 0 auto;
          color: #9a9bad;
          font-size: 11px;
        }

        .admin-feedback-body {
          display: flex;
          align-items: flex-start;
          gap: 11px;
          margin-top: 17px;
          padding: 16px;
          border-radius: 15px;
          color: #7768e8;
          background: #faf9ff;
        }

        .admin-feedback-body svg {
          flex: 0 0 auto;
          margin-top: 2px;
        }

        .admin-feedback-body p {
          margin: 0;
          color: #51536e;
          font-size: 13px;
          line-height: 1.7;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .admin-feedback-state {
          min-height: 300px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 30px;
          text-align: center;
          border: 1px solid #ececf4;
          border-radius: 20px;
          color: #77798f;
          background: #ffffff;
        }

        .admin-feedback-state h2 {
          margin: 14px 0 0;
          color: #333554;
          font-size: 18px;
        }

        .admin-feedback-state p {
          max-width: 450px;
          margin: 7px 0 0;
          line-height: 1.6;
        }

        .admin-feedback-empty-icon {
          width: 62px;
          height: 62px;
          display: grid;
          place-items: center;
          border-radius: 20px;
          color: #7465e8;
          background: #eeeaff;
        }

        .admin-feedback-error {
          color: #c34d5f;
        }

        .admin-feedback-error button {
          min-height: 42px;
          margin-top: 15px;
          padding: 0 18px;
          border: 0;
          border-radius: 12px;
          color: #ffffff;
          background: #7465e8;
          font: inherit;
          font-weight: 750;
          cursor: pointer;
        }

        .admin-feedback-loader {
          width: 30px;
          height: 30px;
          border: 3px solid #ebe8ff;
          border-top-color: #7465e8;
          border-radius: 50%;
          animation:
            adminFeedbackSpin
            .8s
            linear
            infinite;
        }

        .admin-feedback-spinning {
          animation:
            adminFeedbackSpin
            .8s
            linear
            infinite;
        }

        @keyframes adminFeedbackSpin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 700px) {

          .admin-feedback-heading {
            flex-direction: column;
          }

          .admin-feedback-refresh {
            width: 100%;
          }

          .admin-feedback-card-top {
            flex-direction: column;
          }

        }

        `}
      </style>

    </div>

  );

}