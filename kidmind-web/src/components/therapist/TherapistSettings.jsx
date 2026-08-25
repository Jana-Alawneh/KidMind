import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Bell,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Laptop,
  LogOut,
  Mail,
  Moon,
  Phone,
  RefreshCw,
  Save,
  ShieldCheck,
  Smartphone,
  Sun,
  UserRound,
  Users,
  XCircle,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import api from "../../services/api";


const emptySettings = {
  email_notifications: true,
  account_notifications: true,
  session_notifications: true,
  progress_notifications: true,
  appearance: "system",
};


const getInitials = value => {
  const parts =
    String(value || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  if (parts.length === 0) {
    return "T";
  }

  return parts
    .slice(0, 2)
    .map(part =>
      part
        .charAt(0)
        .toUpperCase()
    )
    .join("");
};


const formatDate = value => {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

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
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  );
};


const getErrorMessage = (
  error,
  fallback
) => {
  return (
    error?.response?.data?.message ||
    fallback
  );
};


const resolveAppearance = mode => {
  if (
    mode === "dark" ||
    mode === "light"
  ) {
    return mode;
  }

  if (
    typeof window !==
      "undefined" &&
    window.matchMedia
  ) {
    return window
      .matchMedia(
        "(prefers-color-scheme: dark)"
      )
      .matches
      ? "dark"
      : "light";
  }

  return "light";
};


const applyAppearance = mode => {
  if (
    typeof document ===
    "undefined"
  ) {
    return;
  }

  const normalized =
    [
      "system",
      "light",
      "dark",
    ].includes(mode)
      ? mode
      : "system";

  const resolved =
    resolveAppearance(
      normalized
    );

  document.documentElement.dataset.kidmindAppearance =
    resolved;

  document.documentElement.style.colorScheme =
    resolved;

  localStorage.setItem(
    "kidmind_appearance",
    normalized
  );
};


function ToggleRow({
  icon: Icon,
  title,
  description,
  value,
  onChange,
  disabled,
}) {
  return (
    <div className="therapist-settings-toggle-row">
      <div className="therapist-settings-toggle-icon">
        <Icon size={18} />
      </div>

      <div className="therapist-settings-toggle-copy">
        <strong>
          {title}
        </strong>

        <span>
          {description}
        </span>
      </div>

      <button
        type="button"
        className={
          value
            ? "therapist-settings-switch active"
            : "therapist-settings-switch"
        }
        onClick={() =>
          onChange(!value)
        }
        disabled={disabled}
        aria-pressed={value}
      >
        <span />
      </button>
    </div>
  );
}


export default function TherapistSettings({
  onProfileUpdated,
}) {
  const navigate =
    useNavigate();

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    loadError,
    setLoadError,
  ] = useState("");

  const [
    data,
    setData,
  ] = useState(null);

  const [
    profile,
    setProfile,
  ] = useState({
    full_name: "",
    email: "",
    phone: "",
    avatar_url: "",
  });

  const [
    preferences,
    setPreferences,
  ] = useState(
    emptySettings
  );

  const [
    passwordForm,
    setPasswordForm,
  ] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [
    profileSaving,
    setProfileSaving,
  ] = useState(false);

  const [
    preferencesSaving,
    setPreferencesSaving,
  ] = useState(false);

  const [
    passwordSaving,
    setPasswordSaving,
  ] = useState(false);

  const [
    profileMessage,
    setProfileMessage,
  ] = useState({
    type: "",
    text: "",
  });

  const [
    preferencesMessage,
    setPreferencesMessage,
  ] = useState({
    type: "",
    text: "",
  });

  const [
    passwordMessage,
    setPasswordMessage,
  ] = useState({
    type: "",
    text: "",
  });

  const [
    showCurrentPassword,
    setShowCurrentPassword,
  ] = useState(false);

  const [
    showNewPassword,
    setShowNewPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);


  const loadSettings =
    async () => {
      try {
        setLoading(true);
        setLoadError("");

        const response =
          await api.get(
            "/users/settings"
          );

        const payload =
          response.data || {};

        setData(
          payload
        );

        setProfile({
          full_name:
            payload.user
              ?.full_name ||
            "",
          email:
            payload.user
              ?.email ||
            "",
          phone:
            payload.user
              ?.phone ||
            "",
          avatar_url:
            payload.user
              ?.avatar_url ||
            "",
        });

        setPreferences({
          ...emptySettings,
          ...(
            payload.settings ||
            {}
          ),
        });

        applyAppearance(
          payload.settings
            ?.appearance ||
          "system"
        );
      } catch (error) {
        console.error(
          error
        );

        setLoadError(
          getErrorMessage(
            error,
            "Unable to load settings."
          )
        );
      } finally {
        setLoading(false);
      }
    };


  useEffect(
    () => {
      loadSettings();
    },
    []
  );


  useEffect(
    () => {
      if (
        preferences
          .appearance !==
        "system"
      ) {
        return;
      }

      if (
        typeof window ===
          "undefined" ||
        !window.matchMedia
      ) {
        return;
      }

      const media =
        window.matchMedia(
          "(prefers-color-scheme: dark)"
        );

      const handleChange =
        () => {
          applyAppearance(
            "system"
          );
        };

      media.addEventListener?.(
        "change",
        handleChange
      );

      return () => {
        media.removeEventListener?.(
          "change",
          handleChange
        );
      };
    },
    [
      preferences
        .appearance,
    ]
  );


  const user =
    data?.user || {};

  const roleInfo =
    data?.role_info || {};

  const children =
    Array.isArray(
      roleInfo.children
    )
      ? roleInfo.children
      : [];


  const avatar =
    useMemo(
      () => {
        if (
          profile.avatar_url
            .trim()
        ) {
          return (
            <img
              src={
                profile
                  .avatar_url
                  .trim()
              }
              alt="Therapist profile"
            />
          );
        }

        return (
          <span>
            {
              getInitials(
                profile.full_name
              )
            }
          </span>
        );
      },
      [
        profile.avatar_url,
        profile.full_name,
      ]
    );


  const handleProfileField =
    event => {
      const {
        name,
        value,
      } =
        event.target;

      setProfile(
        previous => ({
          ...previous,
          [name]:
            value,
        })
      );
    };


  const handlePasswordField =
    event => {
      const {
        name,
        value,
      } =
        event.target;

      setPasswordForm(
        previous => ({
          ...previous,
          [name]:
            value,
        })
      );
    };


  const saveProfile =
    async event => {
      event.preventDefault();

      const fullName =
        profile.full_name
          .trim();

      const email =
        profile.email
          .trim()
          .toLowerCase();

      if (
        !fullName ||
        !email
      ) {
        setProfileMessage({
          type:
            "error",
          text:
            "Full name and email are required.",
        });

        return;
      }

      try {
        setProfileSaving(
          true
        );

        setProfileMessage({
          type: "",
          text: "",
        });

        const response =
          await api.put(
            "/users/settings/profile",
            {
              full_name:
                fullName,
              email,
              phone:
                profile.phone
                  .trim() ||
                null,
              avatar_url:
                profile
                  .avatar_url
                  .trim() ||
                null,
            }
          );

        const updatedUser =
          response.data?.user;

        if (
          updatedUser
        ) {
          const storedUser =
            (() => {
              try {
                return JSON.parse(
                  sessionStorage.getItem(
                    "kidmind_user"
                  ) ||
                  "{}"
                );
              } catch {
                return {};
              }
            })();

          const nextStoredUser = {
            ...storedUser,
            ...updatedUser,
          };

          sessionStorage.setItem(
            "kidmind_user",
            JSON.stringify(
              nextStoredUser
            )
          );

          setData(
            previous => ({
              ...previous,
              user:
                updatedUser,
            })
          );

          setProfile({
            full_name:
              updatedUser
                .full_name ||
              "",
            email:
              updatedUser
                .email ||
              "",
            phone:
              updatedUser
                .phone ||
              "",
            avatar_url:
              updatedUser
                .avatar_url ||
              "",
          });

          onProfileUpdated?.(
            updatedUser
          );
        }

        setProfileMessage({
          type:
            "success",
          text:
            "Profile updated successfully.",
        });
      } catch (error) {
        console.error(
          error
        );

        setProfileMessage({
          type:
            "error",
          text:
            getErrorMessage(
              error,
              "Unable to update profile."
            ),
        });
      } finally {
        setProfileSaving(
          false
        );
      }
    };


  const changePassword =
    async event => {
      event.preventDefault();

      if (
        !passwordForm
          .current_password ||
        !passwordForm
          .new_password ||
        !passwordForm
          .confirm_password
      ) {
        setPasswordMessage({
          type:
            "error",
          text:
            "Complete all password fields.",
        });

        return;
      }

      if (
        passwordForm
          .new_password
          .length < 6
      ) {
        setPasswordMessage({
          type:
            "error",
          text:
            "New password must be at least 6 characters.",
        });

        return;
      }

      if (
        passwordForm
          .new_password !==
        passwordForm
          .confirm_password
      ) {
        setPasswordMessage({
          type:
            "error",
          text:
            "Password confirmation does not match.",
        });

        return;
      }

      try {
        setPasswordSaving(
          true
        );

        setPasswordMessage({
          type: "",
          text: "",
        });

        await api.put(
          "/users/settings/password",
          passwordForm
        );

        setPasswordForm({
          current_password:
            "",
          new_password:
            "",
          confirm_password:
            "",
        });

        setPasswordMessage({
          type:
            "success",
          text:
            "Password changed successfully.",
        });
      } catch (error) {
        console.error(
          error
        );

        setPasswordMessage({
          type:
            "error",
          text:
            getErrorMessage(
              error,
              "Unable to change password."
            ),
        });
      } finally {
        setPasswordSaving(
          false
        );
      }
    };


  const savePreferences =
    async () => {
      try {
        setPreferencesSaving(
          true
        );

        setPreferencesMessage({
          type: "",
          text: "",
        });

        const response =
          await api.put(
            "/users/settings/preferences",
            preferences
          );

        const updated =
          response.data
            ?.settings || {
            ...preferences,
          };

        setPreferences(
          updated
        );

        applyAppearance(
          updated
            .appearance ||
          "system"
        );

        setData(
          previous => ({
            ...previous,
            settings:
              updated,
          })
        );

        setPreferencesMessage({
          type:
            "success",
          text:
            "Preferences saved successfully.",
        });
      } catch (error) {
        console.error(
          error
        );

        setPreferencesMessage({
          type:
            "error",
          text:
            getErrorMessage(
              error,
              "Unable to save preferences."
            ),
        });
      } finally {
        setPreferencesSaving(
          false
        );
      }
    };


  const setPreference =
    (
      key,
      value
    ) => {
      setPreferences(
        previous => ({
          ...previous,
          [key]:
            value,
        })
      );

      if (
        key ===
        "appearance"
      ) {
        applyAppearance(
          value
        );
      }
    };


  const handleLogout =
    () => {
      sessionStorage.removeItem(
        "kidmind_token"
      );

      sessionStorage.removeItem(
        "kidmind_user"
      );

      navigate(
        "/login",
        {
          replace:
            true,
        }
      );
    };


  if (loading) {
    return (
      <div className="therapist-settings-state">
        <RefreshCw
          size={27}
          className="therapist-settings-spin"
        />

        <span>
          Loading settings...
        </span>

        <style>
          {settingsStyles}
        </style>
      </div>
    );
  }


  if (
    loadError ||
    !data
  ) {
    return (
      <div className="therapist-settings-state error">
        <XCircle
          size={30}
        />

        <strong>
          Settings could not be loaded
        </strong>

        <span>
          {
            loadError ||
            "Unable to load settings."
          }
        </span>

        <button
          type="button"
          onClick={
            loadSettings
          }
        >
          Try Again
        </button>

        <style>
          {settingsStyles}
        </style>
      </div>
    );
  }


  return (
    <div className="therapist-settings">
      <div className="therapist-settings-heading">
        <div>
          <span className="therapist-settings-kicker">
            Account & Preferences
          </span>

          <h1>
            Settings
          </h1>

          <p>
            Manage your profile, security,
            notifications and therapist account preferences.
          </p>
        </div>

        <button
          type="button"
          className="therapist-settings-refresh"
          onClick={
            loadSettings
          }
        >
          <RefreshCw
            size={16}
          />
          Refresh
        </button>
      </div>


      <section className="therapist-settings-profile-hero">
        <div className="therapist-settings-profile-avatar">
          {avatar}
        </div>

        <div className="therapist-settings-profile-copy">
          <span>
            Therapist Account
          </span>

          <h2>
            {
              user.full_name ||
              "Therapist"
            }
          </h2>

          <p>
            {
              user.email ||
              "—"
            }
          </p>
        </div>

        <div className="therapist-settings-status">
          <ShieldCheck
            size={16}
          />

          <span>
            {
              user.is_active
                ? "Active"
                : "Inactive"
            }
          </span>
        </div>
      </section>


      <div className="therapist-settings-grid">
        <section className="therapist-settings-card therapist-settings-card-wide">
          <div className="therapist-settings-card-heading">
            <div className="therapist-settings-card-icon">
              <UserRound
                size={19}
              />
            </div>

            <div>
              <h3>
                Profile
              </h3>

              <p>
                Update your therapist account details.
              </p>
            </div>
          </div>

          <form
            className="therapist-settings-form"
            onSubmit={
              saveProfile
            }
          >
            <label>
              <span>
                Full Name
              </span>

              <input
                name="full_name"
                value={
                  profile.full_name
                }
                onChange={
                  handleProfileField
                }
                disabled={
                  profileSaving
                }
              />
            </label>

            <label>
              <span>
                Email
              </span>

              <div className="therapist-settings-input-icon">
                <Mail
                  size={15}
                />

                <input
                  name="email"
                  type="email"
                  value={
                    profile.email
                  }
                  onChange={
                    handleProfileField
                  }
                  disabled={
                    profileSaving
                  }
                />
              </div>
            </label>

            <label>
              <span>
                Phone
              </span>

              <div className="therapist-settings-input-icon">
                <Phone
                  size={15}
                />

                <input
                  name="phone"
                  value={
                    profile.phone
                  }
                  onChange={
                    handleProfileField
                  }
                  placeholder="Optional"
                  disabled={
                    profileSaving
                  }
                />
              </div>
            </label>

            <label>
              <span>
                Avatar URL
              </span>

              <input
                name="avatar_url"
                value={
                  profile.avatar_url
                }
                onChange={
                  handleProfileField
                }
                placeholder="Optional image URL"
                disabled={
                  profileSaving
                }
              />
            </label>

            <div className="therapist-settings-form-footer">
              {
                profileMessage.text
                  ? (
                    <span
                      className={
                        `therapist-settings-message ${profileMessage.type}`
                      }
                    >
                      {
                        profileMessage.type ===
                        "success"
                          ? <Check size={14} />
                          : <XCircle size={14} />
                      }

                      {
                        profileMessage.text
                      }
                    </span>
                  )
                  : <span />
              }

              <button
                type="submit"
                className="therapist-settings-primary-button"
                disabled={
                  profileSaving
                }
              >
                {
                  profileSaving
                    ? (
                      <RefreshCw
                        size={15}
                        className="therapist-settings-spin"
                      />
                    )
                    : (
                      <Save
                        size={15}
                      />
                    )
                }

                {
                  profileSaving
                    ? "Saving..."
                    : "Save Profile"
                }
              </button>
            </div>
          </form>
        </section>


        <section className="therapist-settings-card">
          <div className="therapist-settings-card-heading">
            <div className="therapist-settings-card-icon security">
              <KeyRound
                size={19}
              />
            </div>

            <div>
              <h3>
                Security
              </h3>

              <p>
                Change your account password.
              </p>
            </div>
          </div>

          <form
            className="therapist-settings-password-form"
            onSubmit={
              changePassword
            }
          >
            <label>
              <span>
                Current Password
              </span>

              <div className="therapist-settings-password-input">
                <input
                  name="current_password"
                  type={
                    showCurrentPassword
                      ? "text"
                      : "password"
                  }
                  value={
                    passwordForm
                      .current_password
                  }
                  onChange={
                    handlePasswordField
                  }
                  disabled={
                    passwordSaving
                  }
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowCurrentPassword(
                      previous =>
                        !previous
                    )
                  }
                >
                  {
                    showCurrentPassword
                      ? <EyeOff size={15} />
                      : <Eye size={15} />
                  }
                </button>
              </div>
            </label>

            <label>
              <span>
                New Password
              </span>

              <div className="therapist-settings-password-input">
                <input
                  name="new_password"
                  type={
                    showNewPassword
                      ? "text"
                      : "password"
                  }
                  value={
                    passwordForm
                      .new_password
                  }
                  onChange={
                    handlePasswordField
                  }
                  disabled={
                    passwordSaving
                  }
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowNewPassword(
                      previous =>
                        !previous
                    )
                  }
                >
                  {
                    showNewPassword
                      ? <EyeOff size={15} />
                      : <Eye size={15} />
                  }
                </button>
              </div>
            </label>

            <label>
              <span>
                Confirm New Password
              </span>

              <div className="therapist-settings-password-input">
                <input
                  name="confirm_password"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={
                    passwordForm
                      .confirm_password
                  }
                  onChange={
                    handlePasswordField
                  }
                  disabled={
                    passwordSaving
                  }
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      previous =>
                        !previous
                    )
                  }
                >
                  {
                    showConfirmPassword
                      ? <EyeOff size={15} />
                      : <Eye size={15} />
                  }
                </button>
              </div>
            </label>

            {
              passwordMessage.text
                ? (
                  <span
                    className={
                      `therapist-settings-message ${passwordMessage.type}`
                    }
                  >
                    {
                      passwordMessage.type ===
                      "success"
                        ? <Check size={14} />
                        : <XCircle size={14} />
                    }

                    {
                      passwordMessage.text
                    }
                  </span>
                )
                : null
            }

            <button
              type="submit"
              className="therapist-settings-primary-button full"
              disabled={
                passwordSaving
              }
            >
              {
                passwordSaving
                  ? (
                    <RefreshCw
                      size={15}
                      className="therapist-settings-spin"
                    />
                  )
                  : (
                    <KeyRound
                      size={15}
                    />
                  )
              }

              {
                passwordSaving
                  ? "Updating..."
                  : "Change Password"
              }
            </button>
          </form>
        </section>


        <section className="therapist-settings-card">
          <div className="therapist-settings-card-heading">
            <div className="therapist-settings-card-icon notifications">
              <Bell
                size={19}
              />
            </div>

            <div>
              <h3>
                Notifications
              </h3>

              <p>
                Choose which KidMind updates you want.
              </p>
            </div>
          </div>

          <div className="therapist-settings-toggle-list">
            <ToggleRow
              icon={Mail}
              title="Email Notifications"
              description="Receive important KidMind updates by email."
              value={
                preferences
                  .email_notifications
              }
              onChange={
                value =>
                  setPreference(
                    "email_notifications",
                    value
                  )
              }
              disabled={
                preferencesSaving
              }
            />

            <ToggleRow
              icon={ShieldCheck}
              title="Account Notifications"
              description="Account changes and security activity."
              value={
                preferences
                  .account_notifications
              }
              onChange={
                value =>
                  setPreference(
                    "account_notifications",
                    value
                  )
              }
              disabled={
                preferencesSaving
              }
            />

            <ToggleRow
              icon={Smartphone}
              title="Session Notifications"
              description="Updates related to child assessment sessions."
              value={
                preferences
                  .session_notifications
              }
              onChange={
                value =>
                  setPreference(
                    "session_notifications",
                    value
                  )
              }
              disabled={
                preferencesSaving
              }
            />

            <ToggleRow
              icon={Users}
              title="Progress Notifications"
              description="Updates when new child progress information is available."
              value={
                preferences
                  .progress_notifications
              }
              onChange={
                value =>
                  setPreference(
                    "progress_notifications",
                    value
                  )
              }
              disabled={
                preferencesSaving
              }
            />
          </div>
        </section>


        <section className="therapist-settings-card">
          <div className="therapist-settings-card-heading">
            <div className="therapist-settings-card-icon appearance">
              <Laptop
                size={19}
              />
            </div>

            <div>
              <h3>
                Appearance
              </h3>

              <p>
                Choose how KidMind looks on this account.
              </p>
            </div>
          </div>

          <div className="therapist-appearance-options">
            <button
              type="button"
              className={
                preferences.appearance ===
                "light"
                  ? "therapist-appearance-option active"
                  : "therapist-appearance-option"
              }
              onClick={() =>
                setPreference(
                  "appearance",
                  "light"
                )
              }
            >
              <Sun size={18} />
              <span>Light</span>
              {
                preferences.appearance ===
                "light"
                  ? <Check size={15} />
                  : null
              }
            </button>

            <button
              type="button"
              className={
                preferences.appearance ===
                "dark"
                  ? "therapist-appearance-option active"
                  : "therapist-appearance-option"
              }
              onClick={() =>
                setPreference(
                  "appearance",
                  "dark"
                )
              }
            >
              <Moon size={18} />
              <span>Dark</span>
              {
                preferences.appearance ===
                "dark"
                  ? <Check size={15} />
                  : null
              }
            </button>

            <button
              type="button"
              className={
                preferences.appearance ===
                "system"
                  ? "therapist-appearance-option active"
                  : "therapist-appearance-option"
              }
              onClick={() =>
                setPreference(
                  "appearance",
                  "system"
                )
              }
            >
              <Laptop size={18} />
              <span>System</span>
              {
                preferences.appearance ===
                "system"
                  ? <Check size={15} />
                  : null
              }
            </button>
          </div>

          <div className="therapist-settings-preferences-footer">
            {
              preferencesMessage.text
                ? (
                  <span
                    className={
                      `therapist-settings-message ${preferencesMessage.type}`
                    }
                  >
                    {
                      preferencesMessage.type ===
                      "success"
                        ? <Check size={14} />
                        : <XCircle size={14} />
                    }

                    {
                      preferencesMessage.text
                    }
                  </span>
                )
                : <span />
            }

            <button
              type="button"
              className="therapist-settings-primary-button"
              onClick={
                savePreferences
              }
              disabled={
                preferencesSaving
              }
            >
              {
                preferencesSaving
                  ? (
                    <RefreshCw
                      size={15}
                      className="therapist-settings-spin"
                    />
                  )
                  : (
                    <Save
                      size={15}
                    />
                  )
              }

              {
                preferencesSaving
                  ? "Saving..."
                  : "Save Preferences"
              }
            </button>
          </div>
        </section>


        <section className="therapist-settings-card therapist-settings-card-wide">
          <div className="therapist-settings-card-heading">
            <div className="therapist-settings-card-icon caseload">
              <Users
                size={19}
              />
            </div>

            <div>
              <h3>
                My Caseload
              </h3>

              <p>
                Children currently linked to your therapist account.
              </p>
            </div>

            <span className="therapist-caseload-count">
              {
                Number(
                  roleInfo.child_count ??
                  children.length
                )
              }
              {" "}
              {
                Number(
                  roleInfo.child_count ??
                  children.length
                ) === 1
                  ? "child"
                  : "children"
              }
            </span>
          </div>

          {
            children.length === 0
              ? (
                <div className="therapist-caseload-empty">
                  No children are currently assigned to this therapist account.
                </div>
              )
              : (
                <div className="therapist-caseload-grid">
                  {
                    children.map(
                      child => (
                        <div
                          className="therapist-caseload-card"
                          key={
                            child.id
                          }
                        >
                          <div className="therapist-caseload-avatar">
                            {
                              String(
                                child.full_name ||
                                "C"
                              )
                                .charAt(0)
                                .toUpperCase()
                            }
                          </div>

                          <div>
                            <strong>
                              {
                                child.full_name ||
                                "Child"
                              }
                            </strong>

                            <span>
                              {
                                child.age
                                  ? `${child.age} years`
                                  : "Age not set"
                              }
                              {
                                child.region
                                  ? ` • ${child.region}`
                                  : ""
                              }
                            </span>
                          </div>
                        </div>
                      )
                    )
                  }
                </div>
              )
          }
        </section>


        <section className="therapist-settings-card therapist-settings-card-wide">
          <div className="therapist-settings-card-heading">
            <div className="therapist-settings-card-icon account">
              <ShieldCheck
                size={19}
              />
            </div>

            <div>
              <h3>
                Account Information
              </h3>

              <p>
                Therapist account status and activity.
              </p>
            </div>
          </div>

          <div className="therapist-account-grid">
            <div>
              <span>
                Account Type
              </span>

              <strong>
                Therapist
              </strong>
            </div>

            <div>
              <span>
                Account Status
              </span>

              <strong
                className={
                  user.is_active
                    ? "status-good"
                    : "status-bad"
                }
              >
                {
                  user.is_active
                    ? "Active"
                    : "Inactive"
                }
              </strong>
            </div>

            <div>
              <span>
                Assigned Children
              </span>

              <strong>
                {
                  Number(
                    roleInfo.child_count ??
                    children.length
                  )
                }
              </strong>
            </div>

            <div>
              <span>
                Last Login
              </span>

              <strong>
                {
                  formatDate(
                    user.last_login_at
                  )
                }
              </strong>
            </div>

            <div>
              <span>
                Member Since
              </span>

              <strong>
                {
                  formatDate(
                    user.created_at
                  )
                }
              </strong>
            </div>
          </div>
        </section>


        <section className="therapist-settings-card therapist-settings-card-wide therapist-settings-signout-card">
          <div className="therapist-settings-card-heading">
            <div className="therapist-settings-card-icon logout">
              <LogOut
                size={19}
              />
            </div>

            <div>
              <h3>
                Sign Out
              </h3>

              <p>
                End this KidMind therapist session on this browser.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="therapist-settings-logout-button"
            onClick={
              handleLogout
            }
          >
            <LogOut
              size={16}
            />
            Logout
          </button>
        </section>
      </div>

      <style>
        {settingsStyles}
      </style>
    </div>
  );
}


const settingsStyles = `
  .therapist-settings,
  .therapist-settings * {
    box-sizing: border-box;
  }

  .therapist-settings {
    width: 100%;
    color: #30324f;
  }

  .therapist-settings-heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 22px;
  }

  .therapist-settings-kicker {
    display: block;
    margin-bottom: 5px;
    color: #8c8ea8;
    font-size: 10px;
    font-weight: 750;
    letter-spacing: .08em;
    text-transform: uppercase;
  }

  .therapist-settings-heading h1 {
    margin: 0;
    color: #343653;
    font-size: 27px;
    line-height: 1.15;
  }

  .therapist-settings-heading p {
    margin: 7px 0 0;
    color: #999bae;
    font-size: 11px;
    line-height: 1.65;
  }

  .therapist-settings-refresh {
    min-height: 38px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    padding: 0 13px;
    border: 1px solid #e8e7f1;
    border-radius: 11px;
    background: #fff;
    color: #696b82;
    font: inherit;
    font-size: 10px;
    font-weight: 750;
  }

  .therapist-settings-profile-hero {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 19px;
    margin-bottom: 18px;
    border: 1px solid #dfeefe;
    border-radius: 20px;
    background:
      linear-gradient(
        135deg,
        #eef7ff 0%,
        #f7fbff 50%,
        #f4f1ff 100%
      );
  }

  .therapist-settings-profile-avatar {
    width: 66px;
    height: 66px;
    flex: 0 0 auto;
    display: grid;
    place-items: center;
    overflow: hidden;
    border: 4px solid rgba(255,255,255,.86);
    border-radius: 20px;
    box-shadow: 0 10px 25px rgba(70,115,170,.12);
    background: linear-gradient(135deg,#dceeff,#e5ddff);
    color: #5179ae;
    font-size: 18px;
    font-weight: 850;
  }

  .therapist-settings-profile-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .therapist-settings-profile-copy {
    min-width: 0;
    flex: 1;
  }

  .therapist-settings-profile-copy > span {
    color: #8e8fa6;
    font-size: 9.5px;
    font-weight: 700;
  }

  .therapist-settings-profile-copy h2 {
    margin: 4px 0 2px;
    color: #3d3e5c;
    font-size: 18px;
  }

  .therapist-settings-profile-copy p {
    margin: 0;
    color: #999bad;
    font-size: 10px;
  }

  .therapist-settings-status {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 8px 11px;
    border-radius: 999px;
    background: #eaf8f0;
    color: #4a8b68;
    font-size: 9px;
    font-weight: 800;
  }

  .therapist-settings-grid {
    display: grid;
    grid-template-columns: minmax(0,1.35fr) minmax(300px,.85fr);
    gap: 16px;
  }

  .therapist-settings-card {
    min-width: 0;
    padding: 19px;
    border: 1px solid #ececf4;
    border-radius: 18px;
    background: #fff;
    box-shadow: 0 8px 28px rgba(54,54,92,.035);
  }

  .therapist-settings-card-wide {
    grid-column: 1 / -1;
  }

  .therapist-settings-card-heading {
    display: flex;
    align-items: flex-start;
    gap: 11px;
  }

  .therapist-settings-card-icon {
    width: 37px;
    height: 37px;
    flex: 0 0 auto;
    display: grid;
    place-items: center;
    border-radius: 11px;
    background: #eaf4ff;
    color: #4f7eaf;
  }

  .therapist-settings-card-icon.security {
    background: #f0edff;
    color: #7160ce;
  }

  .therapist-settings-card-icon.notifications {
    background: #fff0f5;
    color: #b76183;
  }

  .therapist-settings-card-icon.appearance {
    background: #eef8f4;
    color: #51856e;
  }

  .therapist-settings-card-icon.caseload {
    background: #edf6ff;
    color: #5595dd;
  }

  .therapist-settings-card-icon.account {
    background: #fff5e9;
    color: #a5733d;
  }

  .therapist-settings-card-icon.logout {
    background: #fff0f0;
    color: #b95e67;
  }

  .therapist-settings-card-heading h3 {
    margin: 0;
    color: #42445f;
    font-size: 13px;
  }

  .therapist-settings-card-heading p {
    margin: 4px 0 0;
    color: #9a9caf;
    font-size: 9.5px;
    line-height: 1.55;
  }

  .therapist-settings-form {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 13px;
    margin-top: 18px;
  }

  .therapist-settings-form label,
  .therapist-settings-password-form label {
    display: block;
  }

  .therapist-settings-form label > span,
  .therapist-settings-password-form label > span {
    display: block;
    margin-bottom: 6px;
    color: #77798e;
    font-size: 9px;
    font-weight: 750;
  }

  .therapist-settings-form input,
  .therapist-settings-password-form input {
    width: 100%;
    height: 40px;
    border: 1px solid #e7e7ef;
    outline: none;
    border-radius: 10px;
    background: #fafafd;
    color: #45475f;
    padding: 0 11px;
    font: inherit;
    font-size: 10px;
    transition: border-color .18s ease, box-shadow .18s ease, background .18s ease;
  }

  .therapist-settings-form input:focus,
  .therapist-settings-password-form input:focus {
    border-color: #aacbed;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(85,149,221,.08);
  }

  .therapist-settings-input-icon {
    position: relative;
  }

  .therapist-settings-input-icon > svg {
    position: absolute;
    left: 11px;
    top: 50%;
    transform: translateY(-50%);
    color: #a3a4b4;
  }

  .therapist-settings-input-icon input {
    padding-left: 34px;
  }

  .therapist-settings-form-footer {
    grid-column: 1 / -1;
    min-height: 39px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    padding-top: 3px;
  }

  .therapist-settings-primary-button {
    min-height: 38px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    padding: 0 14px;
    border: 0;
    border-radius: 10px;
    background: linear-gradient(135deg,#5595dd,#6d83dc);
    color: #fff;
    font: inherit;
    font-size: 9.5px;
    font-weight: 800;
    box-shadow: 0 8px 18px rgba(85,149,221,.16);
  }

  .therapist-settings-primary-button.full {
    width: 100%;
    margin-top: 3px;
  }

  .therapist-settings-primary-button:disabled,
  .therapist-settings-refresh:disabled,
  .therapist-settings-switch:disabled {
    opacity: .58;
    cursor: not-allowed;
  }

  .therapist-settings-message {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 9px;
    line-height: 1.45;
  }

  .therapist-settings-message.success {
    color: #4d8d68;
  }

  .therapist-settings-message.error {
    color: #b85d67;
  }

  .therapist-settings-password-form {
    display: grid;
    gap: 11px;
    margin-top: 18px;
  }

  .therapist-settings-password-input {
    position: relative;
  }

  .therapist-settings-password-input input {
    padding-right: 40px;
  }

  .therapist-settings-password-input button {
    width: 34px;
    height: 34px;
    position: absolute;
    right: 3px;
    top: 3px;
    display: grid;
    place-items: center;
    border: 0;
    background: transparent;
    color: #9294a6;
  }

  .therapist-settings-toggle-list {
    display: grid;
    gap: 2px;
    margin-top: 14px;
  }

  .therapist-settings-toggle-row {
    min-height: 58px;
    display: flex;
    align-items: center;
    gap: 10px;
    border-bottom: 1px solid #f0f0f5;
  }

  .therapist-settings-toggle-row:last-child {
    border-bottom: 0;
  }

  .therapist-settings-toggle-icon {
    width: 32px;
    height: 32px;
    flex: 0 0 auto;
    display: grid;
    place-items: center;
    border-radius: 9px;
    background: #f6f5fb;
    color: #7d7f94;
  }

  .therapist-settings-toggle-copy {
    min-width: 0;
    flex: 1;
  }

  .therapist-settings-toggle-copy strong {
    display: block;
    color: #55576c;
    font-size: 9.5px;
  }

  .therapist-settings-toggle-copy span {
    display: block;
    margin-top: 3px;
    color: #a1a2b1;
    font-size: 8.5px;
    line-height: 1.45;
  }

  .therapist-settings-switch {
    width: 38px;
    height: 22px;
    flex: 0 0 auto;
    position: relative;
    border: 0;
    border-radius: 999px;
    background: #dcdfe8;
    padding: 0;
    transition: background .18s ease;
  }

  .therapist-settings-switch > span {
    width: 16px;
    height: 16px;
    position: absolute;
    left: 3px;
    top: 3px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 2px 6px rgba(41,43,70,.18);
    transition: transform .18s ease;
  }

  .therapist-settings-switch.active {
    background: #5595dd;
  }

  .therapist-settings-switch.active > span {
    transform: translateX(16px);
  }

  .therapist-appearance-options {
    display: grid;
    grid-template-columns: repeat(3,1fr);
    gap: 8px;
    margin-top: 18px;
  }

  .therapist-appearance-option {
    min-height: 72px;
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 7px;
    padding: 0 11px;
    border: 1px solid #e9e9f0;
    border-radius: 12px;
    background: #fafafd;
    color: #77798d;
    font: inherit;
    font-size: 9px;
    font-weight: 750;
    text-align: left;
  }

  .therapist-appearance-option.active {
    border-color: #aacbed;
    background: #eef7ff;
    color: #4f7eaf;
    box-shadow: 0 0 0 2px rgba(85,149,221,.06);
  }

  .therapist-settings-preferences-footer {
    min-height: 42px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-top: 15px;
  }

  .therapist-caseload-count {
    margin-left: auto;
    padding: 6px 9px;
    border-radius: 999px;
    background: #edf6ff;
    color: #4f82b8;
    font-size: 9px;
    font-weight: 800;
  }

  .therapist-caseload-grid {
    display: grid;
    grid-template-columns: repeat(3,minmax(0,1fr));
    gap: 10px;
    margin-top: 17px;
  }

  .therapist-caseload-card {
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px;
    border: 1px solid #eceef5;
    border-radius: 12px;
    background: #fafcff;
  }

  .therapist-caseload-avatar {
    width: 38px;
    height: 38px;
    flex: 0 0 auto;
    display: grid;
    place-items: center;
    border-radius: 11px;
    background: #eaf4ff;
    color: #4f83b9;
    font-size: 12px;
    font-weight: 800;
  }

  .therapist-caseload-card > div:last-child {
    min-width: 0;
  }

  .therapist-caseload-card strong,
  .therapist-caseload-card span {
    display: block;
  }

  .therapist-caseload-card strong {
    overflow: hidden;
    color: #51536b;
    font-size: 10px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .therapist-caseload-card span {
    margin-top: 3px;
    overflow: hidden;
    color: #9b9dad;
    font-size: 8.5px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .therapist-caseload-empty {
    margin-top: 17px;
    padding: 24px;
    border-radius: 12px;
    background: #fafafd;
    color: #9b9dac;
    text-align: center;
    font-size: 10px;
  }

  .therapist-account-grid {
    display: grid;
    grid-template-columns: repeat(5,1fr);
    gap: 10px;
    margin-top: 17px;
  }

  .therapist-account-grid > div {
    min-width: 0;
    padding: 12px;
    border-radius: 11px;
    background: #fafafd;
  }

  .therapist-account-grid span,
  .therapist-account-grid strong {
    display: block;
  }

  .therapist-account-grid span {
    color: #9b9daf;
    font-size: 8.5px;
  }

  .therapist-account-grid strong {
    margin-top: 4px;
    overflow: hidden;
    color: #55576d;
    font-size: 9.5px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .therapist-account-grid .status-good {
    color: #4f8b69;
  }

  .therapist-account-grid .status-bad {
    color: #b85f68;
  }

  .therapist-settings-signout-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
  }

  .therapist-settings-logout-button {
    min-height: 38px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    padding: 0 14px;
    border: 1px solid #f0ced2;
    border-radius: 10px;
    background: #fff4f4;
    color: #ad5963;
    font: inherit;
    font-size: 9.5px;
    font-weight: 800;
  }

  .therapist-settings-state {
    min-height: 350px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 9px;
    border: 1px solid #ededf5;
    border-radius: 18px;
    background: #fff;
    color: #85879d;
    font-family: Inter, Arial, sans-serif;
    font-size: 11px;
  }

  .therapist-settings-state.error {
    color: #a45f68;
  }

  .therapist-settings-state.error strong {
    color: #5d5565;
    font-size: 13px;
  }

  .therapist-settings-state.error span {
    color: #9897a5;
  }

  .therapist-settings-state.error button {
    margin-top: 5px;
    padding: 9px 13px;
    border: 0;
    border-radius: 9px;
    background: #5595dd;
    color: #fff;
    font: inherit;
    font-size: 9px;
    font-weight: 750;
  }

  .therapist-settings-spin {
    animation: therapistSettingsSpin .8s linear infinite;
  }

  @keyframes therapistSettingsSpin {
    to {
      transform: rotate(360deg);
    }
  }

  html[data-kidmind-appearance="dark"] .therapist-settings {
    color: #e7e8f1;
  }

  html[data-kidmind-appearance="dark"] .therapist-settings-heading h1,
  html[data-kidmind-appearance="dark"] .therapist-settings-profile-copy h2,
  html[data-kidmind-appearance="dark"] .therapist-settings-card-heading h3,
  html[data-kidmind-appearance="dark"] .therapist-settings-toggle-copy strong,
  html[data-kidmind-appearance="dark"] .therapist-account-grid strong,
  html[data-kidmind-appearance="dark"] .therapist-caseload-card strong {
    color: #ececf5;
  }

  html[data-kidmind-appearance="dark"] .therapist-settings-heading p,
  html[data-kidmind-appearance="dark"] .therapist-settings-kicker,
  html[data-kidmind-appearance="dark"] .therapist-settings-card-heading p,
  html[data-kidmind-appearance="dark"] .therapist-settings-toggle-copy span,
  html[data-kidmind-appearance="dark"] .therapist-account-grid span,
  html[data-kidmind-appearance="dark"] .therapist-caseload-card span {
    color: #a6a8bb;
  }

  html[data-kidmind-appearance="dark"] .therapist-settings-card,
  html[data-kidmind-appearance="dark"] .therapist-settings-refresh,
  html[data-kidmind-appearance="dark"] .therapist-settings-state,
  html[data-kidmind-appearance="dark"] .therapist-caseload-card {
    border-color: #34364a;
    background: #242637;
  }

  html[data-kidmind-appearance="dark"] .therapist-settings-profile-hero {
    border-color: #35465d;
    background: linear-gradient(135deg,#273545,#292f3f,#2e2941);
  }

  html[data-kidmind-appearance="dark"] .therapist-settings-form input,
  html[data-kidmind-appearance="dark"] .therapist-settings-password-form input,
  html[data-kidmind-appearance="dark"] .therapist-account-grid > div,
  html[data-kidmind-appearance="dark"] .therapist-appearance-option,
  html[data-kidmind-appearance="dark"] .therapist-settings-toggle-icon,
  html[data-kidmind-appearance="dark"] .therapist-caseload-empty {
    border-color: #3a3c4e;
    background: #2c2e40;
    color: #dcdeea;
  }

  html[data-kidmind-appearance="dark"] .therapist-appearance-option.active {
    border-color: #6695c8;
    background: #29384a;
    color: #bddcff;
  }

  html[data-kidmind-appearance="dark"] .therapist-settings-toggle-row {
    border-bottom-color: #353748;
  }

  @media (max-width: 1050px) {
    .therapist-settings-grid {
      grid-template-columns: 1fr;
    }

    .therapist-settings-card-wide {
      grid-column: auto;
    }

    .therapist-caseload-grid {
      grid-template-columns: repeat(2,1fr);
    }

    .therapist-account-grid {
      grid-template-columns: repeat(3,1fr);
    }
  }

  @media (max-width: 720px) {
    .therapist-settings-heading,
    .therapist-settings-profile-hero,
    .therapist-settings-signout-card,
    .therapist-settings-form-footer,
    .therapist-settings-preferences-footer {
      align-items: stretch;
      flex-direction: column;
    }

    .therapist-settings-heading {
      display: flex;
    }

    .therapist-settings-refresh,
    .therapist-settings-logout-button {
      align-self: flex-start;
    }

    .therapist-settings-form,
    .therapist-account-grid,
    .therapist-caseload-grid,
    .therapist-appearance-options {
      grid-template-columns: 1fr;
    }

    .therapist-settings-status,
    .therapist-caseload-count {
      align-self: flex-start;
      margin-left: 0;
    }
  }
`;
