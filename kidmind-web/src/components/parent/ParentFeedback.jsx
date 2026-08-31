import {
  useState,
} from "react";

import {
  CheckCircle2,
  MessageSquareText,
  Send,
} from "lucide-react";

import {
  sendParentFeedback,
} from "../../api/feedbackApi";


const MAX_LENGTH =
  2000;


export default function ParentFeedback() {

  const [
    message,
    setMessage,
  ] =
    useState("");


  const [
    sending,
    setSending,
  ] =
    useState(false);


  const [
    error,
    setError,
  ] =
    useState("");


  const [
    success,
    setSuccess,
  ] =
    useState("");


  const handleSubmit =
    async event => {

      event.preventDefault();


      const trimmedMessage =
        message.trim();


      setError("");
      setSuccess("");


      if (
        !trimmedMessage
      ) {

        setError(
          "Please write your feedback before sending."
        );

        return;

      }


      try {

        setSending(
          true
        );


        await sendParentFeedback(
          trimmedMessage
        );


        setMessage("");


        setSuccess(
          "Thank you. Your feedback was sent to the KidMind administration."
        );

      } catch (
        requestError
      ) {

        console.error(
          "Unable to send feedback:",
          requestError
        );


        setError(
          requestError.response
            ?.data
            ?.message ||
          "Unable to send feedback. Please try again."
        );

      } finally {

        setSending(
          false
        );

      }

    };


  return (

    <div className="parent-feedback-page">

      <section className="parent-feedback-hero">

        <div className="parent-feedback-icon">
          <MessageSquareText
            size={28}
          />
        </div>


        <div>

          <span className="parent-feedback-eyebrow">
            PARENT FEEDBACK
          </span>

          <h1>
            Share your feedback
          </h1>

          <p>
            Tell the KidMind administration about your experience, suggestions, or anything you think could be improved.
          </p>

        </div>

      </section>


      <section className="parent-feedback-card">

        <div className="parent-feedback-card-heading">

          <div>

            <h2>
              Your message
            </h2>

            <p>
              This is sent directly to the KidMind administration. It is separate from therapist messages and chat.
            </p>

          </div>

        </div>


        <form
          onSubmit={
            handleSubmit
          }
        >

          <label
            htmlFor="parent-feedback-message"
          >
            Feedback
          </label>


          <textarea
            id="parent-feedback-message"
            value={
              message
            }
            onChange={
              event => {

                setMessage(
                  event.target.value
                );

                if (
                  error
                ) {
                  setError("");
                }

                if (
                  success
                ) {
                  setSuccess("");
                }

              }
            }
            maxLength={
              MAX_LENGTH
            }
            placeholder="Write your feedback here..."
            disabled={
              sending
            }
          />


          <div className="parent-feedback-meta">

            <span>
              Your feedback helps us improve KidMind.
            </span>

            <strong>
              {message.length}/{MAX_LENGTH}
            </strong>

          </div>


          {
            error && (

              <div className="parent-feedback-message parent-feedback-error">
                {error}
              </div>

            )
          }


          {
            success && (

              <div className="parent-feedback-message parent-feedback-success">

                <CheckCircle2
                  size={18}
                />

                <span>
                  {success}
                </span>

              </div>

            )
          }


          <button
            type="submit"
            className="parent-feedback-submit"
            disabled={
              sending ||
              !message.trim()
            }
          >

            <Send
              size={18}
            />

            {
              sending
                ? "Sending..."
                : "Send Feedback"
            }

          </button>

        </form>

      </section>


      <style>
        {`

        .parent-feedback-page {
          display: grid;
          gap: 20px;
          width: 100%;
        }

        .parent-feedback-hero {
          display: flex;
          gap: 17px;
          align-items: flex-start;
          padding: 24px;
          border: 1px solid #ececf4;
          border-radius: 22px;
          background:
            linear-gradient(
              135deg,
              #ffffff 0%,
              #f7f5ff 100%
            );
        }

        .parent-feedback-icon {
          width: 54px;
          height: 54px;
          flex: 0 0 54px;
          display: grid;
          place-items: center;
          border-radius: 17px;
          color: #7465e8;
          background: #eeeaff;
        }

        .parent-feedback-eyebrow {
          display: block;
          margin-bottom: 5px;
          color: #7465e8;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .parent-feedback-hero h1 {
          margin: 0;
          color: #252852;
          font-size: 26px;
          line-height: 1.2;
        }

        .parent-feedback-hero p {
          max-width: 700px;
          margin: 8px 0 0;
          color: #74778e;
          line-height: 1.65;
        }

        .parent-feedback-card {
          padding: 26px;
          border: 1px solid #ececf4;
          border-radius: 22px;
          background: #ffffff;
          box-shadow:
            0 10px 30px
            rgba(
              60,
              54,
              117,
              0.05
            );
        }

        .parent-feedback-card-heading h2 {
          margin: 0;
          color: #252852;
          font-size: 19px;
        }

        .parent-feedback-card-heading p {
          margin: 7px 0 0;
          color: #85879a;
          font-size: 13px;
          line-height: 1.6;
        }

        .parent-feedback-card form {
          margin-top: 22px;
        }

        .parent-feedback-card label {
          display: block;
          margin-bottom: 8px;
          color: #333554;
          font-size: 13px;
          font-weight: 750;
        }

        .parent-feedback-card textarea {
          width: 100%;
          min-height: 190px;
          resize: vertical;
          padding: 16px;
          border: 1px solid #ddddea;
          border-radius: 17px;
          outline: none;
          color: #333554;
          background: #fbfbfd;
          font: inherit;
          line-height: 1.65;
          transition:
            border-color 0.2s,
            box-shadow 0.2s,
            background 0.2s;
        }

        .parent-feedback-card textarea:focus {
          border-color: #9186ed;
          background: #ffffff;
          box-shadow:
            0 0 0 4px
            rgba(
              116,
              101,
              232,
              0.1
            );
        }

        .parent-feedback-card textarea::placeholder {
          color: #a7a8b8;
        }

        .parent-feedback-meta {
          display: flex;
          justify-content: space-between;
          gap: 14px;
          margin-top: 8px;
          color: #9a9bad;
          font-size: 11px;
        }

        .parent-feedback-meta strong {
          color: #7465e8;
        }

        .parent-feedback-message {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 15px;
          padding: 12px 14px;
          border-radius: 13px;
          font-size: 13px;
          font-weight: 650;
        }

        .parent-feedback-error {
          color: #c34859;
          border: 1px solid #ffd3da;
          background: #fff3f5;
        }

        .parent-feedback-success {
          color: #21835a;
          border: 1px solid #c9eedc;
          background: #f0fbf6;
        }

        .parent-feedback-submit {
          min-height: 48px;
          margin-top: 18px;
          padding: 0 22px;
          border: 0;
          border-radius: 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          color: #ffffff;
          background: #7465e8;
          font: inherit;
          font-weight: 800;
          cursor: pointer;
          box-shadow:
            0 8px 20px
            rgba(
              116,
              101,
              232,
              0.2
            );
        }

        .parent-feedback-submit:hover:not(:disabled) {
          background: #6757db;
        }

        .parent-feedback-submit:disabled {
          cursor: not-allowed;
          opacity: 0.55;
          box-shadow: none;
        }

        @media (max-width: 700px) {

          .parent-feedback-hero {
            padding: 20px;
          }

          .parent-feedback-card {
            padding: 20px;
          }

          .parent-feedback-submit {
            width: 100%;
          }

        }

        `}
      </style>

    </div>

  );

}