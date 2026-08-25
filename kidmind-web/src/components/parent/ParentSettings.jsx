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
    <div className="parent-account-settings-toggle-row">
      <div className="parent-account-settings-toggle-icon">
        <Icon size={18} />
      </div>

      <div className="parent-account-settings-toggle-copy">
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
            ? "parent-account-settings-switch active"
            : "parent-account-settings-switch"
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


export default function ParentSettings({
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
    region: "",
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
          region:
            payload.user
              ?.region ||
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
              alt="Parent profile"
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
        !email ||
        !profile.region.trim()
      ) {
        setProfileMessage({
          type:
            "error",
          text:
            "Full name, email and region are required.",
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
              region:
                profile.region
                  .trim(),
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
            region:
              updatedUser
                .region ||
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
      <div className="parent-account-settings-state">
        <RefreshCw
          size={27}
          className="parent-account-settings-spin"
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
      <div className="parent-account-settings-state error">
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
    <div className="parent-account-settings">
      <div className="parent-account-settings-heading">
        <div>
          <span className="parent-account-settings-kicker">
            Account & Preferences
          </span>

          <h1>
            Settings
          </h1>

          <p>
            Manage your profile, security,
            notifications and parent account preferences.
          </p>
        </div>

        <button
          type="button"
          className="parent-account-settings-refresh"
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


      <section className="parent-account-settings-profile-hero">
        <div className="parent-account-settings-profile-avatar">
          {avatar}
        </div>

        <div className="parent-account-settings-profile-copy">
          <span>
            Parent Account
          </span>

          <h2>
            {
              user.full_name ||
              "Parent"
            }
          </h2>

          <p>
            {
              user.email ||
              "—"
            }
          </p>
        </div>

        <div className="parent-account-settings-status">
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


      <div className="parent-account-settings-grid">
        <section className="parent-account-settings-card parent-account-settings-card-wide">
          <div className="parent-account-settings-card-heading">
            <div className="parent-account-settings-card-icon">
              <UserRound
                size={19}
              />
            </div>

            <div>
              <h3>
                Profile
              </h3>

              <p>
                Update your parent account details.
              </p>
            </div>
          </div>

          <form
            className="parent-account-settings-form"
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

              <div className="parent-account-settings-input-icon">
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

              <div className="parent-account-settings-input-icon">
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
                Region
              </span>

              <input
                name="region"
                value={
                  profile.region
                }
                onChange={
                  handleProfileField
                }
                placeholder="Required"
                disabled={
                  profileSaving
                }
              />
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

            <div className="parent-account-settings-form-footer">
              {
                profileMessage.text
                  ? (
                    <span
                      className={
                        `parent-account-settings-message ${profileMessage.type}`
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
                className="parent-account-settings-primary-button"
                disabled={
                  profileSaving
                }
              >
                {
                  profileSaving
                    ? (
                      <RefreshCw
                        size={15}
                        className="parent-account-settings-spin"
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


        <section className="parent-account-settings-card">
          <div className="parent-account-settings-card-heading">
            <div className="parent-account-settings-card-icon security">
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
            className="parent-account-settings-password-form"
            onSubmit={
              changePassword
            }
          >
            <label>
              <span>
                Current Password
              </span>

              <div className="parent-account-settings-password-input">
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

              <div className="parent-account-settings-password-input">
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

              <div className="parent-account-settings-password-input">
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
                      `parent-account-settings-message ${passwordMessage.type}`
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
              className="parent-account-settings-primary-button full"
              disabled={
                passwordSaving
              }
            >
              {
                passwordSaving
                  ? (
                    <RefreshCw
                      size={15}
                      className="parent-account-settings-spin"
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


        <section className="parent-account-settings-card">
          <div className="parent-account-settings-card-heading">
            <div className="parent-account-settings-card-icon notifications">
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

          <div className="parent-account-settings-toggle-list">
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
              description="Updates when one of your children completes a session."
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
              description="Updates when new progress information is available for your children."
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


        <section className="parent-account-settings-card">
          <div className="parent-account-settings-card-heading">
            <div className="parent-account-settings-card-icon appearance">
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

          <div className="parent-appearance-options">
            <button
              type="button"
              className={
                preferences.appearance ===
                "light"
                  ? "parent-appearance-option active"
                  : "parent-appearance-option"
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
                  ? "parent-appearance-option active"
                  : "parent-appearance-option"
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
                  ? "parent-appearance-option active"
                  : "parent-appearance-option"
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

          <div className="parent-account-settings-preferences-footer">
            {
              preferencesMessage.text
                ? (
                  <span
                    className={
                      `parent-account-settings-message ${preferencesMessage.type}`
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
              className="parent-account-settings-primary-button"
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
                      className="parent-account-settings-spin"
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


        <section className="parent-account-settings-card parent-account-settings-card-wide">
          <div className="parent-account-settings-card-heading">
            <div className="parent-account-settings-card-icon caseload">
              <Users
                size={19}
              />
            </div>

            <div>
              <h3>
                My Children
              </h3>

              <p>
                Children linked to your parent account.
              </p>
            </div>

            <span className="parent-children-count">
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
                <div className="parent-children-empty">
                  No children are currently linked to this parent account.
                </div>
              )
              : (
                <div className="parent-children-grid">
                  {
                    children.map(
                      child => (
                        <div
                          className="parent-children-card"
                          key={
                            child.id
                          }
                        >
                          <div className="parent-children-avatar">
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


        <section className="parent-account-settings-card parent-account-settings-card-wide">
          <div className="parent-account-settings-card-heading">
            <div className="parent-account-settings-card-icon account">
              <ShieldCheck
                size={19}
              />
            </div>

            <div>
              <h3>
                Account Information
              </h3>

              <p>
                Parent account status and activity.
              </p>
            </div>
          </div>

          <div className="parent-account-grid">
            <div>
              <span>
                Account Type
              </span>

              <strong>
                Parent
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
                My Children
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
                Region
              </span>

              <strong>
                {
                  user.region ||
                  "—"
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


        <section className="parent-account-settings-card parent-account-settings-card-wide parent-account-settings-signout-card">
          <div className="parent-account-settings-card-heading">
            <div className="parent-account-settings-card-icon logout">
              <LogOut
                size={19}
              />
            </div>

            <div>
              <h3>
                Sign Out
              </h3>

              <p>
                End this KidMind parent session on this browser.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="parent-account-settings-logout-button"
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
  .parent-account-settings,
  .parent-account-settings * {
    box-sizing: border-box;
  }

  .parent-account-settings {
    width: 100%;
    color: #30324f;
  }

  .parent-account-settings-heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 22px;
  }

  .parent-account-settings-kicker {
    display: block;
    margin-bottom: 5px;
    color: #8c8ea8;
    font-size: 10px;
    font-weight: 750;
    letter-spacing: .08em;
    text-transform: uppercase;
  }

  .parent-account-settings-heading h1 {
    margin: 0;
    color: #343653;
    font-size: 27px;
    line-height: 1.15;
  }

  .parent-account-settings-heading p {
    margin: 7px 0 0;
    color: #999bae;
    font-size: 11px;
    line-height: 1.65;
  }

  .parent-account-settings-refresh {
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

  .parent-account-settings-profile-hero {
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

  .parent-account-settings-profile-avatar {
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

  .parent-account-settings-profile-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .parent-account-settings-profile-copy {
    min-width: 0;
    flex: 1;
  }

  .parent-account-settings-profile-copy > span {
    color: #8e8fa6;
    font-size: 9.5px;
    font-weight: 700;
  }

  .parent-account-settings-profile-copy h2 {
    margin: 4px 0 2px;
    color: #3d3e5c;
    font-size: 18px;
  }

  .parent-account-settings-profile-copy p {
    margin: 0;
    color: #999bad;
    font-size: 10px;
  }

  .parent-account-settings-status {
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

  .parent-account-settings-grid {
    display: grid;
    grid-template-columns: minmax(0,1.35fr) minmax(300px,.85fr);
    gap: 16px;
  }

  .parent-account-settings-card {
    min-width: 0;
    padding: 19px;
    border: 1px solid #ececf4;
    border-radius: 18px;
    background: #fff;
    box-shadow: 0 8px 28px rgba(54,54,92,.035);
  }

  .parent-account-settings-card-wide {
    grid-column: 1 / -1;
  }

  .parent-account-settings-card-heading {
    display: flex;
    align-items: flex-start;
    gap: 11px;
  }

  .parent-account-settings-card-icon {
    width: 37px;
    height: 37px;
    flex: 0 0 auto;
    display: grid;
    place-items: center;
    border-radius: 11px;
    background: #f1edff;
    color: #755fcd;
  }

  .parent-account-settings-card-icon.security {
    background: #f0edff;
    color: #7160ce;
  }

  .parent-account-settings-card-icon.notifications {
    background: #fff0f5;
    color: #b76183;
  }

  .parent-account-settings-card-icon.appearance {
    background: #eef8f4;
    color: #51856e;
  }

  .parent-account-settings-card-icon.caseload {
    background: #fff0fa;
    color: #bd67a8;
  }

  .parent-account-settings-card-icon.account {
    background: #fff5e9;
    color: #a5733d;
  }

  .parent-account-settings-card-icon.logout {
    background: #fff0f0;
    color: #b95e67;
  }

  .parent-account-settings-card-heading h3 {
    margin: 0;
    color: #42445f;
    font-size: 13px;
  }

  .parent-account-settings-card-heading p {
    margin: 4px 0 0;
    color: #9a9caf;
    font-size: 9.5px;
    line-height: 1.55;
  }

  .parent-account-settings-form {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 13px;
    margin-top: 18px;
  }

  .parent-account-settings-form label,
  .parent-account-settings-password-form label {
    display: block;
  }

  .parent-account-settings-form label > span,
  .parent-account-settings-password-form label > span {
    display: block;
    margin-bottom: 6px;
    color: #77798e;
    font-size: 9px;
    font-weight: 750;
  }

  .parent-account-settings-form input,
  .parent-account-settings-password-form input {
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

  .parent-account-settings-form input:focus,
  .parent-account-settings-password-form input:focus {
    border-color: #c7b9f4;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(138,109,233,.08);
  }

  .parent-account-settings-input-icon {
    position: relative;
  }

  .parent-account-settings-input-icon > svg {
    position: absolute;
    left: 11px;
    top: 50%;
    transform: translateY(-50%);
    color: #a3a4b4;
  }

  .parent-account-settings-input-icon input {
    padding-left: 34px;
  }

  .parent-account-settings-form-footer {
    grid-column: 1 / -1;
    min-height: 39px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    padding-top: 3px;
  }

  .parent-account-settings-primary-button {
    min-height: 38px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    padding: 0 14px;
    border: 0;
    border-radius: 10px;
    background: linear-gradient(135deg,#8a6de9,#c176c9);
    color: #fff;
    font: inherit;
    font-size: 9.5px;
    font-weight: 800;
    box-shadow: 0 8px 18px rgba(138,109,233,.16);
  }

  .parent-account-settings-primary-button.full {
    width: 100%;
    margin-top: 3px;
  }

  .parent-account-settings-primary-button:disabled,
  .parent-account-settings-refresh:disabled,
  .parent-account-settings-switch:disabled {
    opacity: .58;
    cursor: not-allowed;
  }

  .parent-account-settings-message {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 9px;
    line-height: 1.45;
  }

  .parent-account-settings-message.success {
    color: #4d8d68;
  }

  .parent-account-settings-message.error {
    color: #b85d67;
  }

  .parent-account-settings-password-form {
    display: grid;
    gap: 11px;
    margin-top: 18px;
  }

  .parent-account-settings-password-input {
    position: relative;
  }

  .parent-account-settings-password-input input {
    padding-right: 40px;
  }

  .parent-account-settings-password-input button {
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

  .parent-account-settings-toggle-list {
    display: grid;
    gap: 2px;
    margin-top: 14px;
  }

  .parent-account-settings-toggle-row {
    min-height: 58px;
    display: flex;
    align-items: center;
    gap: 10px;
    border-bottom: 1px solid #f0f0f5;
  }

  .parent-account-settings-toggle-row:last-child {
    border-bottom: 0;
  }

  .parent-account-settings-toggle-icon {
    width: 32px;
    height: 32px;
    flex: 0 0 auto;
    display: grid;
    place-items: center;
    border-radius: 9px;
    background: #f6f5fb;
    color: #7d7f94;
  }

  .parent-account-settings-toggle-copy {
    min-width: 0;
    flex: 1;
  }

  .parent-account-settings-toggle-copy strong {
    display: block;
    color: #55576c;
    font-size: 9.5px;
  }

  .parent-account-settings-toggle-copy span {
    display: block;
    margin-top: 3px;
    color: #a1a2b1;
    font-size: 8.5px;
    line-height: 1.45;
  }

  .parent-account-settings-switch {
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

  .parent-account-settings-switch > span {
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

  .parent-account-settings-switch.active {
    background: #8a6de9;
  }

  .parent-account-settings-switch.active > span {
    transform: translateX(16px);
  }

  .parent-appearance-options {
    display: grid;
    grid-template-columns: repeat(3,1fr);
    gap: 8px;
    margin-top: 18px;
  }

  .parent-appearance-option {
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

  .parent-appearance-option.active {
    border-color: #c7b9f4;
    background: #f5f1ff;
    color: #755fcd;
    box-shadow: 0 0 0 2px rgba(138,109,233,.06);
  }

  .parent-account-settings-preferences-footer {
    min-height: 42px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-top: 15px;
  }

  .parent-children-count {
    margin-left: auto;
    padding: 6px 9px;
    border-radius: 999px;
    background: #fff0fa;
    color: #4f82b8;
    font-size: 9px;
    font-weight: 800;
  }

  .parent-children-grid {
    display: grid;
    grid-template-columns: repeat(3,minmax(0,1fr));
    gap: 10px;
    margin-top: 17px;
  }

  .parent-children-card {
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px;
    border: 1px solid #eceef5;
    border-radius: 12px;
    background: #fafcff;
  }

  .parent-children-avatar {
    width: 38px;
    height: 38px;
    flex: 0 0 auto;
    display: grid;
    place-items: center;
    border-radius: 11px;
    background: #f1edff;
    color: #4f83b9;
    font-size: 12px;
    font-weight: 800;
  }

  .parent-children-card > div:last-child {
    min-width: 0;
  }

  .parent-children-card strong,
  .parent-children-card span {
    display: block;
  }

  .parent-children-card strong {
    overflow: hidden;
    color: #51536b;
    font-size: 10px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .parent-children-card span {
    margin-top: 3px;
    overflow: hidden;
    color: #9b9dad;
    font-size: 8.5px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .parent-children-empty {
    margin-top: 17px;
    padding: 24px;
    border-radius: 12px;
    background: #fafafd;
    color: #9b9dac;
    text-align: center;
    font-size: 10px;
  }

  .parent-account-grid {
    display: grid;
    grid-template-columns: repeat(6,1fr);
    gap: 10px;
    margin-top: 17px;
  }

  .parent-account-grid > div {
    min-width: 0;
    padding: 12px;
    border-radius: 11px;
    background: #fafafd;
  }

  .parent-account-grid span,
  .parent-account-grid strong {
    display: block;
  }

  .parent-account-grid span {
    color: #9b9daf;
    font-size: 8.5px;
  }

  .parent-account-grid strong {
    margin-top: 4px;
    overflow: hidden;
    color: #55576d;
    font-size: 9.5px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .parent-account-grid .status-good {
    color: #4f8b69;
  }

  .parent-account-grid .status-bad {
    color: #b85f68;
  }

  .parent-account-settings-signout-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
  }

  .parent-account-settings-logout-button {
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

  .parent-account-settings-state {
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

  .parent-account-settings-state.error {
    color: #a45f68;
  }

  .parent-account-settings-state.error strong {
    color: #5d5565;
    font-size: 13px;
  }

  .parent-account-settings-state.error span {
    color: #9897a5;
  }

  .parent-account-settings-state.error button {
    margin-top: 5px;
    padding: 9px 13px;
    border: 0;
    border-radius: 9px;
    background: #8a6de9;
    color: #fff;
    font: inherit;
    font-size: 9px;
    font-weight: 750;
  }

  .parent-account-settings-spin {
    animation: parentSettingsSpin .8s linear infinite;
  }

  @keyframes parentSettingsSpin {
    to {
      transform: rotate(360deg);
    }
  }

  html[data-kidmind-appearance="dark"] .parent-account-settings {
    color: #e7e8f1;
  }

  html[data-kidmind-appearance="dark"] .parent-account-settings-heading h1,
  html[data-kidmind-appearance="dark"] .parent-account-settings-profile-copy h2,
  html[data-kidmind-appearance="dark"] .parent-account-settings-card-heading h3,
  html[data-kidmind-appearance="dark"] .parent-account-settings-toggle-copy strong,
  html[data-kidmind-appearance="dark"] .parent-account-grid strong,
  html[data-kidmind-appearance="dark"] .parent-children-card strong {
    color: #ececf5;
  }

  html[data-kidmind-appearance="dark"] .parent-account-settings-heading p,
  html[data-kidmind-appearance="dark"] .parent-account-settings-kicker,
  html[data-kidmind-appearance="dark"] .parent-account-settings-card-heading p,
  html[data-kidmind-appearance="dark"] .parent-account-settings-toggle-copy span,
  html[data-kidmind-appearance="dark"] .parent-account-grid span,
  html[data-kidmind-appearance="dark"] .parent-children-card span {
    color: #a6a8bb;
  }

  html[data-kidmind-appearance="dark"] .parent-account-settings-card,
  html[data-kidmind-appearance="dark"] .parent-account-settings-refresh,
  html[data-kidmind-appearance="dark"] .parent-account-settings-state,
  html[data-kidmind-appearance="dark"] .parent-children-card {
    border-color: #34364a;
    background: #242637;
  }

  html[data-kidmind-appearance="dark"] .parent-account-settings-profile-hero {
    border-color: #35465d;
    background: linear-gradient(135deg,#273545,#292f3f,#2e2941);
  }

  html[data-kidmind-appearance="dark"] .parent-account-settings-form input,
  html[data-kidmind-appearance="dark"] .parent-account-settings-password-form input,
  html[data-kidmind-appearance="dark"] .parent-account-grid > div,
  html[data-kidmind-appearance="dark"] .parent-appearance-option,
  html[data-kidmind-appearance="dark"] .parent-account-settings-toggle-icon,
  html[data-kidmind-appearance="dark"] .parent-children-empty {
    border-color: #3a3c4e;
    background: #2c2e40;
    color: #dcdeea;
  }

  html[data-kidmind-appearance="dark"] .parent-appearance-option.active {
    border-color: #6695c8;
    background: #29384a;
    color: #bddcff;
  }

  html[data-kidmind-appearance="dark"] .parent-account-settings-toggle-row {
    border-bottom-color: #353748;
  }

  @media (max-width: 1050px) {
    .parent-account-settings-grid {
      grid-template-columns: 1fr;
    }

    .parent-account-settings-card-wide {
      grid-column: auto;
    }

    .parent-children-grid {
      grid-template-columns: repeat(2,1fr);
    }

    .parent-account-grid {
      grid-template-columns: repeat(3,1fr);
    }
  }

  @media (max-width: 720px) {
    .parent-account-settings-heading,
    .parent-account-settings-profile-hero,
    .parent-account-settings-signout-card,
    .parent-account-settings-form-footer,
    .parent-account-settings-preferences-footer {
      align-items: stretch;
      flex-direction: column;
    }

    .parent-account-settings-heading {
      display: flex;
    }

    .parent-account-settings-refresh,
    .parent-account-settings-logout-button {
      align-self: flex-start;
    }

    .parent-account-settings-form,
    .parent-account-grid,
    .parent-children-grid,
    .parent-appearance-options {
      grid-template-columns: 1fr;
    }

    .parent-account-settings-status,
    .parent-children-count {
      align-self: flex-start;
      margin-left: 0;
    }
  }
`;
