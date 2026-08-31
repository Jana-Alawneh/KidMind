import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Bell,
  Camera,
  Check,
  Eye,
  EyeOff,
  ImagePlus,
  KeyRound,
  Laptop,
  LogOut,
  Mail,
  MonitorCog,
  Moon,
  Phone,
  RefreshCw,
  Save,
  ShieldCheck,
  Smartphone,
  Sun,
  Trash2,
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


const MAX_AVATAR_SIZE =
  5 * 1024 * 1024;


const allowedAvatarTypes =
  new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
  ]);


const resolveAvatarUrl =
  value => {
    const avatarUrl =
      String(
        value || ""
      ).trim();

    if (!avatarUrl) {
      return "";
    }

    if (
      /^(https?:|data:|blob:)/i.test(
        avatarUrl
      )
    ) {
      return avatarUrl;
    }

    const baseUrl =
      String(
        api.defaults.baseURL ||
        ""
      ).trim();

    if (!baseUrl) {
      return avatarUrl;
    }

    try {
      return new URL(
        avatarUrl,
        baseUrl
      ).toString();
    } catch {
      const normalizedBase =
        baseUrl.replace(
          /\/$/,
          ""
        );

      return avatarUrl.startsWith(
        "/"
      )
        ? `${normalizedBase}${avatarUrl}`
        : `${normalizedBase}/${avatarUrl}`;
    }
  };


const getInitials = value => {
  const parts =
    String(value || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  if (parts.length === 0) {
    return "A";
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
    <div className="settings-toggle-row">
      <div className="settings-toggle-icon">
        <Icon size={18} />
      </div>

      <div className="settings-toggle-copy">
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
            ? "settings-switch active"
            : "settings-switch"
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


export default function AdminSettings({
  onProfileUpdated,
}) {
  const navigate =
    useNavigate();

  const photoInputRef =
    useRef(null);

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
    photoFile,
    setPhotoFile,
  ] = useState(null);

  const [
    photoPreviewUrl,
    setPhotoPreviewUrl,
  ] = useState("");

  const [
    removeAvatar,
    setRemoveAvatar,
  ] = useState(false);

  const [
    photoMessage,
    setPhotoMessage,
  ] = useState({
    type: "",
    text: "",
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


  useEffect(
    () => {
      return () => {
        if (
          photoPreviewUrl &&
          photoPreviewUrl.startsWith(
            "blob:"
          )
        ) {
          URL.revokeObjectURL(
            photoPreviewUrl
          );
        }
      };
    },
    [
      photoPreviewUrl,
    ]
  );


  const clearPhotoDraft =
    () => {
      setPhotoFile(
        null
      );

      setPhotoPreviewUrl(
        ""
      );

      setRemoveAvatar(
        false
      );

      setPhotoMessage({
        type: "",
        text: "",
      });

      if (
        photoInputRef.current
      ) {
        photoInputRef.current.value =
          "";
      }
    };


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

        clearPhotoDraft();


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

  const summary =
    roleInfo?.summary || {};

  const system =
    roleInfo?.system || {
      name: "KIDMIND",
      version: "1.0.0",
    };


  const storedAvatarUrl =
    removeAvatar
      ? ""
      : resolveAvatarUrl(
          profile.avatar_url
        );


  const displayAvatarUrl =
    photoPreviewUrl ||
    storedAvatarUrl;


  const avatar =
    useMemo(
      () => {
        if (
          displayAvatarUrl
        ) {
          return (
            <img
              src={
                displayAvatarUrl
              }
              alt="Admin profile"
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
        displayAvatarUrl,
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


  const handlePhotoSelect =
    event => {
      const file =
        event.target.files?.[0];

      if (!file) {
        return;
      }

      setProfileMessage({
        type: "",
        text: "",
      });

      if (
        !allowedAvatarTypes.has(
          file.type
        )
      ) {
        setPhotoMessage({
          type:
            "error",
          text:
            "Please choose a JPG, PNG or WEBP image.",
        });

        event.target.value =
          "";

        return;
      }

      if (
        file.size >
        MAX_AVATAR_SIZE
      ) {
        setPhotoMessage({
          type:
            "error",
          text:
            "Profile photo must be 5MB or smaller.",
        });

        event.target.value =
          "";

        return;
      }

      const previewUrl =
        URL.createObjectURL(
          file
        );

      setPhotoFile(
        file
      );

      setPhotoPreviewUrl(
        previewUrl
      );

      setRemoveAvatar(
        false
      );

      setPhotoMessage({
        type:
          "success",
        text:
          "Photo selected. Save your profile to keep it.",
      });
    };


  const handleRemovePhoto =
    () => {
      setPhotoFile(
        null
      );

      setPhotoPreviewUrl(
        ""
      );

      setRemoveAvatar(
        true
      );

      if (
        photoInputRef.current
      ) {
        photoInputRef.current.value =
          "";
      }

      setProfileMessage({
        type: "",
        text: "",
      });

      setPhotoMessage({
        type:
          "success",
        text:
          "Photo will be removed when you save your profile.",
      });
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

        let response;

        if (
          photoFile ||
          removeAvatar
        ) {
          const formData =
            new FormData();

          formData.append(
            "full_name",
            fullName
          );

          formData.append(
            "email",
            email
          );

          formData.append(
            "phone",
            profile.phone
              .trim()
          );

          formData.append(
            "remove_avatar",
            removeAvatar
              ? "1"
              : "0"
          );

          if (
            photoFile
          ) {
            formData.append(
              "avatar",
              photoFile
            );
          }

          response =
            await api.put(
              "/users/settings/profile",
              formData
            );
        } else {
          response =
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
        }

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

          clearPhotoDraft();

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
      <div className="admin-settings-state">
        <RefreshCw
          size={27}
          className="settings-spin"
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
      <div className="admin-settings-state error">
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
    <div className="admin-settings">
      <div className="settings-heading">
        <div>
          <span className="settings-kicker">
            Account & Preferences
          </span>

          <h1>
            Settings
          </h1>

          <p>
            Manage your profile, security,
            notifications and KidMind appearance.
          </p>
        </div>

        <button
          type="button"
          className="settings-refresh"
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


      <section className="settings-profile-hero">
        <div className="settings-profile-avatar">
          {avatar}
        </div>

        <div className="settings-profile-copy">
          <span>
            Administrator Account
          </span>

          <h2>
            {
              user.full_name ||
              "Administrator"
            }
          </h2>

          <p>
            {
              user.email ||
              "—"
            }
          </p>
        </div>

        <div className="settings-status">
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


      <div className="settings-grid">
        <section className="settings-card settings-card-wide">
          <div className="settings-card-heading">
            <div className="settings-card-icon">
              <UserRound
                size={19}
              />
            </div>

            <div>
              <h3>
                Profile
              </h3>

              <p>
                Update your administrator account details and profile photo.
              </p>
            </div>
          </div>

          <form
            className="settings-form"
            onSubmit={
              saveProfile
            }
          >
            <div className="settings-photo-editor">
              <div className="settings-photo-preview">
                {avatar}

                <div className="settings-photo-camera">
                  <Camera
                    size={14}
                  />
                </div>
              </div>

              <div className="settings-photo-copy">
                <strong>
                  Profile Photo
                </strong>

                <span>
                  Upload your own profile photo from your device.
                  JPG, PNG or WEBP. Maximum 5MB.
                </span>

                {
                  photoFile
                    ? (
                      <small>
                        Selected: {
                          photoFile.name
                        }
                      </small>
                    )
                    : null
                }

                {
                  photoMessage.text
                    ? (
                      <span
                        className={
                          `settings-photo-message ${photoMessage.type}`
                        }
                      >
                        {
                          photoMessage.type ===
                          "error"
                            ? (
                              <XCircle
                                size={13}
                              />
                            )
                            : (
                              <Check
                                size={13}
                              />
                            )
                        }

                        {
                          photoMessage.text
                        }
                      </span>
                    )
                    : null
                }
              </div>

              <div className="settings-photo-actions">
                <input
                  ref={
                    photoInputRef
                  }
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="settings-photo-input"
                  onChange={
                    handlePhotoSelect
                  }
                  disabled={
                    profileSaving
                  }
                />

                <button
                  type="button"
                  className="settings-photo-upload"
                  onClick={() =>
                    photoInputRef
                      .current
                      ?.click()
                  }
                  disabled={
                    profileSaving
                  }
                >
                  <ImagePlus
                    size={15}
                  />

                  {
                    displayAvatarUrl
                      ? "Change Photo"
                      : "Upload Photo"
                  }
                </button>

                <button
                  type="button"
                  className="settings-photo-remove"
                  onClick={
                    handleRemovePhoto
                  }
                  disabled={
                    profileSaving ||
                    (
                      !displayAvatarUrl &&
                      !photoFile
                    )
                  }
                >
                  <Trash2
                    size={14}
                  />

                  Remove Photo
                </button>
              </div>
            </div>

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

              <div className="settings-input-icon">
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

              <div className="settings-input-icon">
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


            <div className="settings-form-footer">
              {
                profileMessage.text
                  ? (
                    <span
                      className={
                        `settings-message ${profileMessage.type}`
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
                className="settings-primary-button"
                disabled={
                  profileSaving
                }
              >
                {
                  profileSaving
                    ? (
                      <RefreshCw
                        size={15}
                        className="settings-spin"
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


        <section className="settings-card">
          <div className="settings-card-heading">
            <div className="settings-card-icon security">
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
            className="settings-password-form"
            onSubmit={
              changePassword
            }
          >
            <label>
              <span>
                Current Password
              </span>

              <div className="settings-password-input">
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

              <div className="settings-password-input">
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

              <div className="settings-password-input">
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
                      `settings-message ${passwordMessage.type}`
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
              className="settings-primary-button full"
              disabled={
                passwordSaving
              }
            >
              {
                passwordSaving
                  ? (
                    <RefreshCw
                      size={15}
                      className="settings-spin"
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


        <section className="settings-card">
          <div className="settings-card-heading">
            <div className="settings-card-icon notifications">
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

          <div className="settings-toggle-list">
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
              description="Updates related to assessment sessions."
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
              icon={MonitorCog}
              title="Progress Notifications"
              description="Updates when new progress information is available."
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


        <section className="settings-card">
          <div className="settings-card-heading">
            <div className="settings-card-icon appearance">
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

          <div className="appearance-options">
            <button
              type="button"
              className={
                preferences.appearance ===
                "light"
                  ? "appearance-option active"
                  : "appearance-option"
              }
              onClick={() =>
                setPreference(
                  "appearance",
                  "light"
                )
              }
            >
              <Sun
                size={18}
              />

              <span>
                Light
              </span>

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
                  ? "appearance-option active"
                  : "appearance-option"
              }
              onClick={() =>
                setPreference(
                  "appearance",
                  "dark"
                )
              }
            >
              <Moon
                size={18}
              />

              <span>
                Dark
              </span>

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
                  ? "appearance-option active"
                  : "appearance-option"
              }
              onClick={() =>
                setPreference(
                  "appearance",
                  "system"
                )
              }
            >
              <Laptop
                size={18}
              />

              <span>
                System
              </span>

              {
                preferences.appearance ===
                "system"
                  ? <Check size={15} />
                  : null
              }
            </button>
          </div>

          <div className="settings-preferences-footer">
            {
              preferencesMessage.text
                ? (
                  <span
                    className={
                      `settings-message ${preferencesMessage.type}`
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
              className="settings-primary-button"
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
                      className="settings-spin"
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


        <section className="settings-card settings-card-wide">
          <div className="settings-card-heading">
            <div className="settings-card-icon system">
              <ShieldCheck
                size={19}
              />
            </div>

            <div>
              <h3>
                System Information
              </h3>

              <p>
                Administrator overview and KidMind account information.
              </p>
            </div>
          </div>

          <div className="settings-system-grid">
            <div>
              <span>
                Platform
              </span>

              <strong>
                {
                  system.name ||
                  "KIDMIND"
                }
              </strong>
            </div>

            <div>
              <span>
                Version
              </span>

              <strong>
                {
                  system.version ||
                  "1.0.0"
                }
              </strong>
            </div>

            <div>
              <span>
                Role
              </span>

              <strong>
                Administrator
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

          <div className="settings-summary-grid">
            <div>
              <Users
                size={19}
              />

              <span>
                Total Users
              </span>

              <strong>
                {
                  Number(
                    summary.total_users ||
                    0
                  )
                }
              </strong>
            </div>

            <div>
              <ShieldCheck
                size={19}
              />

              <span>
                Admins
              </span>

              <strong>
                {
                  Number(
                    summary.total_admins ||
                    0
                  )
                }
              </strong>
            </div>

            <div>
              <UserRound
                size={19}
              />

              <span>
                Parents
              </span>

              <strong>
                {
                  Number(
                    summary.total_parents ||
                    0
                  )
                }
              </strong>
            </div>

            <div>
              <MonitorCog
                size={19}
              />

              <span>
                Therapists
              </span>

              <strong>
                {
                  Number(
                    summary.total_therapists ||
                    0
                  )
                }
              </strong>
            </div>

            <div>
              <Smartphone
                size={19}
              />

              <span>
                Children
              </span>

              <strong>
                {
                  Number(
                    summary.total_children ||
                    0
                  )
                }
              </strong>
            </div>

            <div>
              <Bell
                size={19}
              />

              <span>
                Sessions
              </span>

              <strong>
                {
                  Number(
                    summary.total_sessions ||
                    0
                  )
                }
              </strong>
            </div>
          </div>
        </section>


        <section className="settings-card settings-card-wide settings-signout-card">
          <div>
            <div className="settings-card-heading">
              <div className="settings-card-icon logout">
                <LogOut
                  size={19}
                />
              </div>

              <div>
                <h3>
                  Sign Out
                </h3>

                <p>
                  End this KidMind administrator session on this browser.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="settings-logout-button"
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
  .admin-settings,
  .admin-settings * {
    box-sizing: border-box;
  }

  .admin-settings {
    width: 100%;
    color: #30324f;
  }

  .settings-heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 22px;
  }

  .settings-kicker {
    display: block;
    margin-bottom: 5px;
    color: #8c8ea8;
    font-size: 10px;
    font-weight: 750;
    letter-spacing: .08em;
    text-transform: uppercase;
  }

  .settings-heading h1 {
    margin: 0;
    color: #343653;
    font-size: 27px;
    line-height: 1.15;
  }

  .settings-heading p {
    margin: 7px 0 0;
    color: #999bae;
    font-size: 11px;
    line-height: 1.65;
  }

  .settings-refresh {
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

  .settings-profile-hero {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 19px;
    margin-bottom: 18px;
    border: 1px solid #ebe8ff;
    border-radius: 20px;
    background:
      linear-gradient(
        135deg,
        #f5f1ff 0%,
        #fff7fb 52%,
        #f5f8ff 100%
      );
  }

  .settings-profile-avatar {
    width: 66px;
    height: 66px;
    flex: 0 0 auto;
    display: grid;
    place-items: center;
    overflow: hidden;
    border: 4px solid rgba(255,255,255,.86);
    border-radius: 20px;
    box-shadow: 0 10px 25px rgba(98,82,184,.12);
    background: linear-gradient(135deg,#ded7ff,#ffdce9);
    color: #6454b4;
    font-size: 18px;
    font-weight: 850;
  }

  .settings-profile-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .settings-profile-copy {
    min-width: 0;
    flex: 1;
  }

  .settings-profile-copy > span {
    color: #8e8fa6;
    font-size: 9.5px;
    font-weight: 700;
  }

  .settings-profile-copy h2 {
    margin: 4px 0 2px;
    color: #3d3e5c;
    font-size: 18px;
  }

  .settings-profile-copy p {
    margin: 0;
    color: #999bad;
    font-size: 10px;
  }

  .settings-status {
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

  .settings-grid {
    display: grid;
    grid-template-columns: minmax(0,1.35fr) minmax(300px,.85fr);
    gap: 16px;
  }

  .settings-card {
    min-width: 0;
    padding: 19px;
    border: 1px solid #ececf4;
    border-radius: 18px;
    background: #fff;
    box-shadow: 0 8px 28px rgba(54,54,92,.035);
  }

  .settings-card-wide {
    grid-column: 1 / -1;
  }

  .settings-card-heading {
    display: flex;
    align-items: flex-start;
    gap: 11px;
  }

  .settings-card-icon {
    width: 37px;
    height: 37px;
    flex: 0 0 auto;
    display: grid;
    place-items: center;
    border-radius: 11px;
    background: #eeeaff;
    color: #705fd1;
  }

  .settings-card-icon.security {
    background: #eaf4ff;
    color: #4f7eaf;
  }

  .settings-card-icon.notifications {
    background: #fff0f5;
    color: #b76183;
  }

  .settings-card-icon.appearance {
    background: #eef8f4;
    color: #51856e;
  }

  .settings-card-icon.system {
    background: #fff5e9;
    color: #a5733d;
  }

  .settings-card-icon.logout {
    background: #fff0f0;
    color: #b95e67;
  }

  .settings-card-heading h3 {
    margin: 0;
    color: #42445f;
    font-size: 13px;
  }

  .settings-card-heading p {
    margin: 4px 0 0;
    color: #9a9caf;
    font-size: 9.5px;
    line-height: 1.55;
  }

  .settings-form {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 13px;
    margin-top: 18px;
  }

  .settings-photo-editor {
    grid-column: 1 / -1;
    display: flex;
    align-items: center;
    gap: 15px;
    min-height: 112px;
    padding: 16px;
    border: 1px solid #e9e9f2;
    border-radius: 15px;
    background:
      linear-gradient(
        135deg,
        #fbfcff,
        #f9f8ff
      );
  }

  .settings-photo-preview {
    width: 78px;
    height: 78px;
    flex: 0 0 auto;
    position: relative;
    display: grid;
    place-items: center;
    overflow: visible;
    border: 4px solid #ffffff;
    border-radius: 19px;
    background: linear-gradient(135deg,#ded7ff,#ffdce9);
    color: #6454b4;
    box-shadow: 0 9px 24px rgba(98,82,184,.12);
    font-size: 20px;
    font-weight: 850;
  }

  .settings-photo-preview > img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    border-radius: 15px;
  }

  .settings-photo-preview > span {
    display: grid;
    place-items: center;
  }

  .settings-photo-camera {
    width: 25px;
    height: 25px;
    position: absolute;
    right: -7px;
    bottom: -6px;
    display: grid;
    place-items: center;
    border: 3px solid #fff;
    border-radius: 9px;
    background: #7668dd;
    color: #fff;
    box-shadow: 0 5px 12px rgba(85,100,180,.2);
  }

  .settings-photo-copy {
    min-width: 0;
    flex: 1;
  }

  .settings-photo-copy > strong {
    display: block;
    color: #4d4f68;
    font-size: 11px;
  }

  .settings-photo-copy > span {
    display: block;
    max-width: 430px;
    margin-top: 5px;
    color: #9a9cad;
    font-size: 9px;
    line-height: 1.55;
  }

  .settings-photo-copy > small {
    display: block;
    max-width: 430px;
    margin-top: 6px;
    overflow: hidden;
    color: #73768d;
    font-size: 8.5px;
    font-weight: 700;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .settings-photo-message {
    display: flex !important;
    align-items: center;
    gap: 5px;
    margin-top: 7px !important;
    font-weight: 700;
  }

  .settings-photo-message.success {
    color: #4f8b69 !important;
  }

  .settings-photo-message.error {
    color: #b85d67 !important;
  }

  .settings-photo-actions {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .settings-photo-input {
    display: none;
  }

  .settings-photo-upload,
  .settings-photo-remove {
    min-height: 36px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 0 11px;
    border-radius: 10px;
    font: inherit;
    font-size: 9px;
    font-weight: 800;
    cursor: pointer;
  }

  .settings-photo-upload {
    border: 1px solid #ded8f5;
    background: #f3f0ff;
    color: #6557b3;
  }

  .settings-photo-remove {
    border: 1px solid #f0d7da;
    background: #fff7f7;
    color: #b25f68;
  }

  .settings-photo-upload:disabled,
  .settings-photo-remove:disabled {
    opacity: .5;
    cursor: not-allowed;
  }

  .settings-form label,
  .settings-password-form label {
    display: block;
  }

  .settings-form label > span,
  .settings-password-form label > span {
    display: block;
    margin-bottom: 6px;
    color: #77798e;
    font-size: 9px;
    font-weight: 750;
  }

  .settings-form input,
  .settings-password-form input {
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

  .settings-form input:focus,
  .settings-password-form input:focus {
    border-color: #bdb3f7;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(119,102,225,.08);
  }

  .settings-input-icon {
    position: relative;
  }

  .settings-input-icon > svg {
    position: absolute;
    left: 11px;
    top: 50%;
    transform: translateY(-50%);
    color: #a3a4b4;
  }

  .settings-input-icon input {
    padding-left: 34px;
  }

  .settings-form-footer {
    grid-column: 1 / -1;
    min-height: 39px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    padding-top: 3px;
  }

  .settings-primary-button {
    min-height: 38px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    padding: 0 14px;
    border: 0;
    border-radius: 10px;
    background: linear-gradient(135deg,#7768df,#8f77e8);
    color: #fff;
    font: inherit;
    font-size: 9.5px;
    font-weight: 800;
    box-shadow: 0 8px 18px rgba(116,96,214,.16);
  }

  .settings-primary-button.full {
    width: 100%;
    margin-top: 3px;
  }

  .settings-primary-button:disabled,
  .settings-refresh:disabled,
  .settings-switch:disabled {
    opacity: .58;
    cursor: not-allowed;
  }

  .settings-message {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 9px;
    line-height: 1.45;
  }

  .settings-message.success {
    color: #4d8d68;
  }

  .settings-message.error {
    color: #b85d67;
  }

  .settings-password-form {
    display: grid;
    gap: 11px;
    margin-top: 18px;
  }

  .settings-password-input {
    position: relative;
  }

  .settings-password-input input {
    padding-right: 40px;
  }

  .settings-password-input button {
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

  .settings-toggle-list {
    display: grid;
    gap: 2px;
    margin-top: 14px;
  }

  .settings-toggle-row {
    min-height: 58px;
    display: flex;
    align-items: center;
    gap: 10px;
    border-bottom: 1px solid #f0f0f5;
  }

  .settings-toggle-row:last-child {
    border-bottom: 0;
  }

  .settings-toggle-icon {
    width: 32px;
    height: 32px;
    flex: 0 0 auto;
    display: grid;
    place-items: center;
    border-radius: 9px;
    background: #f6f5fb;
    color: #7d7f94;
  }

  .settings-toggle-copy {
    min-width: 0;
    flex: 1;
  }

  .settings-toggle-copy strong {
    display: block;
    color: #55576c;
    font-size: 9.5px;
  }

  .settings-toggle-copy span {
    display: block;
    margin-top: 3px;
    color: #a1a2b1;
    font-size: 8.5px;
    line-height: 1.45;
  }

  .settings-switch {
    width: 38px;
    height: 22px;
    flex: 0 0 auto;
    position: relative;
    border: 0;
    border-radius: 999px;
    background: #dcdeE7;
    padding: 0;
    transition: background .18s ease;
  }

  .settings-switch > span {
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

  .settings-switch.active {
    background: #7b6be0;
  }

  .settings-switch.active > span {
    transform: translateX(16px);
  }

  .appearance-options {
    display: grid;
    grid-template-columns: repeat(3,1fr);
    gap: 8px;
    margin-top: 18px;
  }

  .appearance-option {
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

  .appearance-option.active {
    border-color: #bcb3f3;
    background: #f2efff;
    color: #6656bf;
    box-shadow: 0 0 0 2px rgba(119,103,216,.06);
  }

  .settings-preferences-footer {
    min-height: 42px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-top: 15px;
  }

  .settings-system-grid {
    display: grid;
    grid-template-columns: repeat(3,1fr);
    gap: 10px;
    margin-top: 17px;
  }

  .settings-system-grid > div {
    min-width: 0;
    padding: 12px;
    border-radius: 11px;
    background: #fafafd;
  }

  .settings-system-grid span,
  .settings-system-grid strong {
    display: block;
  }

  .settings-system-grid span {
    color: #9b9daf;
    font-size: 8.5px;
  }

  .settings-system-grid strong {
    margin-top: 4px;
    overflow: hidden;
    color: #55576d;
    font-size: 9.5px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .settings-system-grid .status-good {
    color: #4f8b69;
  }

  .settings-system-grid .status-bad {
    color: #b85f68;
  }

  .settings-summary-grid {
    display: grid;
    grid-template-columns: repeat(6,1fr);
    gap: 9px;
    margin-top: 12px;
  }

  .settings-summary-grid > div {
    min-width: 0;
    min-height: 84px;
    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-rows: auto auto;
    align-content: center;
    gap: 4px 7px;
    padding: 11px;
    border: 1px solid #eeeeF4;
    border-radius: 12px;
    background: #fff;
  }

  .settings-summary-grid svg {
    grid-row: 1 / 3;
    align-self: center;
    color: #7565ce;
  }

  .settings-summary-grid span {
    align-self: end;
    color: #9c9eae;
    font-size: 8px;
  }

  .settings-summary-grid strong {
    align-self: start;
    color: #494b67;
    font-size: 17px;
  }

  .settings-signout-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
  }

  .settings-logout-button {
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

  .admin-settings-state {
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

  .admin-settings-state.error {
    color: #a45f68;
  }

  .admin-settings-state.error strong {
    color: #5d5565;
    font-size: 13px;
  }

  .admin-settings-state.error span {
    color: #9897a5;
  }

  .admin-settings-state.error button {
    margin-top: 5px;
    padding: 9px 13px;
    border: 0;
    border-radius: 9px;
    background: #7768dd;
    color: #fff;
    font: inherit;
    font-size: 9px;
    font-weight: 750;
  }

  .settings-spin {
    animation: settingsSpin .8s linear infinite;
  }

  @keyframes settingsSpin {
    to {
      transform: rotate(360deg);
    }
  }

  html[data-kidmind-appearance="dark"] .admin-settings {
    color: #e7e8f1;
  }

  html[data-kidmind-appearance="dark"] .settings-heading h1,
  html[data-kidmind-appearance="dark"] .settings-profile-copy h2,
  html[data-kidmind-appearance="dark"] .settings-card-heading h3,
  html[data-kidmind-appearance="dark"] .settings-toggle-copy strong,
  html[data-kidmind-appearance="dark"] .settings-system-grid strong,
  html[data-kidmind-appearance="dark"] .settings-summary-grid strong {
    color: #ececf5;
  }

  html[data-kidmind-appearance="dark"] .settings-heading p,
  html[data-kidmind-appearance="dark"] .settings-kicker,
  html[data-kidmind-appearance="dark"] .settings-card-heading p,
  html[data-kidmind-appearance="dark"] .settings-toggle-copy span,
  html[data-kidmind-appearance="dark"] .settings-system-grid span,
  html[data-kidmind-appearance="dark"] .settings-summary-grid span {
    color: #a6a8bb;
  }

  html[data-kidmind-appearance="dark"] .settings-card,
  html[data-kidmind-appearance="dark"] .settings-refresh,
  html[data-kidmind-appearance="dark"] .admin-settings-state,
  html[data-kidmind-appearance="dark"] .settings-summary-grid > div {
    border-color: #34364a;
    background: #242637;
  }

  html[data-kidmind-appearance="dark"] .settings-profile-hero {
    border-color: #3a3a55;
    background: linear-gradient(135deg,#2c2943,#302936,#272d3e);
  }

  html[data-kidmind-appearance="dark"] .settings-photo-editor {
    border-color: #393b50;
    background:
      linear-gradient(
        135deg,
        #292b3d,
        #2c2d41
      );
  }

  html[data-kidmind-appearance="dark"] .settings-photo-preview {
    border-color: #37394b;
  }

  html[data-kidmind-appearance="dark"] .settings-photo-camera {
    border-color: #292b3d;
  }

  html[data-kidmind-appearance="dark"] .settings-photo-copy > strong {
    color: #ececf5;
  }

  html[data-kidmind-appearance="dark"] .settings-photo-copy > span,
  html[data-kidmind-appearance="dark"] .settings-photo-copy > small {
    color: #a6a8bb;
  }

  html[data-kidmind-appearance="dark"] .settings-photo-upload {
    border-color: #3e536b;
    background: #29384a;
    color: #b9d8f7;
  }

  html[data-kidmind-appearance="dark"] .settings-photo-remove {
    border-color: #5d3c45;
    background: #3b2d33;
    color: #e3a5ad;
  }

  html[data-kidmind-appearance="dark"] .settings-form input,
  html[data-kidmind-appearance="dark"] .settings-password-form input,
  html[data-kidmind-appearance="dark"] .settings-system-grid > div,
  html[data-kidmind-appearance="dark"] .appearance-option,
  html[data-kidmind-appearance="dark"] .settings-toggle-icon {
    border-color: #3a3c4e;
    background: #2c2e40;
    color: #dcdeea;
  }

  html[data-kidmind-appearance="dark"] .appearance-option.active {
    border-color: #8175ce;
    background: #35304d;
    color: #c8bdfd;
  }

  html[data-kidmind-appearance="dark"] .settings-toggle-row {
    border-bottom-color: #353748;
  }

  html[data-kidmind-appearance="dark"] .settings-refresh {
    color: #b8bacb;
  }

  @media (max-width: 1050px) {
    .settings-grid {
      grid-template-columns: 1fr;
    }

    .settings-card-wide {
      grid-column: auto;
    }

    .settings-summary-grid {
      grid-template-columns: repeat(3,1fr);
    }
  }

  @media (max-width: 720px) {
    .settings-photo-editor {
      flex-direction: column;
      align-items: flex-start;
    }

    .settings-photo-actions {
      width: 100%;
      flex-wrap: wrap;
    }

    .settings-heading,
    .settings-profile-hero,
    .settings-signout-card,
    .settings-form-footer,
    .settings-preferences-footer {
      align-items: stretch;
      flex-direction: column;
    }

    .settings-heading {
      display: flex;
    }

    .settings-refresh,
    .settings-logout-button {
      align-self: flex-start;
    }

    .settings-form,
    .settings-system-grid {
      grid-template-columns: 1fr;
    }

    .appearance-options {
      grid-template-columns: 1fr;
    }

    .settings-summary-grid {
      grid-template-columns: repeat(2,1fr);
    }

    .settings-status {
      align-self: flex-start;
    }
  }
`;
