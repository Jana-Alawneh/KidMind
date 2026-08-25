import {
  ActivityIndicator,
  Alert,
  Appearance,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  router,
} from "expo-router";

import {
  Bell,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Laptop,
  LogOut,
  Mail,
  MapPin,
  Moon,
  Phone,
  RefreshCw,
  Save,
  ShieldCheck,
  Smartphone,
  Sun,
  UserRound,
  Users,
} from "lucide-react-native";

import {
  clearAuthSession,
  fetchCurrentUser,
  type UserRole,
} from "@/api/authApi";

import {
  changeUserPassword,
  getUserSettings,
  updateUserPreferences,
  updateUserProfile,
  type AppearanceMode,
  type SettingsChild,
  type SettingsUser,
  type UserPreferences,
  type UserSettingsResponse,
} from "@/api/settingsApi";


type Props = {
  role: UserRole;
  onProfileUpdated?: (
    user: SettingsUser
  ) => void;
};


const defaultPreferences: UserPreferences = {
  email_notifications: true,
  account_notifications: true,
  session_notifications: true,
  progress_notifications: true,
  appearance: "system",
};


const getInitials = (
  value?: string | null
) => {
  const parts =
    String(value || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  if (
    parts.length === 0
  ) {
    return "K";
  }

  return parts
    .slice(0, 2)
    .map(
      part =>
        part
          .charAt(0)
          .toUpperCase()
    )
    .join("");
};


const formatDate = (
  value?: string | null
) => {
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

  return date.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
};


const getRoleTitle = (
  role: UserRole
) => {
  if (
    role === "admin"
  ) {
    return "Administrator";
  }

  if (
    role === "therapist"
  ) {
    return "Therapist";
  }

  return "Parent";
};


const getRoleSubtitle = (
  role: UserRole
) => {
  if (
    role === "admin"
  ) {
    return "KidMind Control Center";
  }

  if (
    role === "therapist"
  ) {
    return "KidMind Therapist Account";
  }

  return "KidMind Family Account";
};


const getRoleAccent = (
  role: UserRole
) => {
  if (
    role === "therapist"
  ) {
    return "#5595DD";
  }

  if (
    role === "parent"
  ) {
    return "#B96AA8";
  }

  return "#7867D9";
};


const resolveDarkMode = (
  appearance: AppearanceMode,
  systemScheme:
    | "light"
    | "dark"
    | "unspecified"
    | null
    | undefined
) => {
  if (
    appearance === "dark"
  ) {
    return true;
  }

  if (
    appearance === "light"
  ) {
    return false;
  }

  return (
    systemScheme === "dark"
  );
};


const applyNativeAppearance = (
  appearance: AppearanceMode
) => {
  try {
    Appearance.setColorScheme(
      appearance === "system"
        ? "unspecified"
        : appearance
    );
  } catch {
    return;
  }
};


function PreferenceRow({
  title,
  description,
  value,
  onChange,
  disabled,
  accent,
  dark,
}: {
  title: string;
  description: string;
  value: boolean;
  onChange: (
    value: boolean
  ) => void;
  disabled: boolean;
  accent: string;
  dark: boolean;
}) {
  return (
    <View
      style={[
        styles.preferenceRow,
        dark &&
          styles.preferenceRowDark,
      ]}
    >
      <View
        style={[
          styles.preferenceIcon,
          dark &&
            styles.preferenceIconDark,
        ]}
      >
        <Bell
          size={17}
          color={
            dark
              ? "#C7C9D7"
              : "#73768D"
          }
        />
      </View>

      <View
        style={
          styles.preferenceCopy
        }
      >
        <Text
          style={[
            styles.preferenceTitle,
            dark &&
              styles.textPrimaryDark,
          ]}
        >
          {title}
        </Text>

        <Text
          style={[
            styles.preferenceDescription,
            dark &&
              styles.textSecondaryDark,
          ]}
        >
          {description}
        </Text>
      </View>

      <Switch
        value={value}
        onValueChange={
          onChange
        }
        disabled={disabled}
        trackColor={{
          false:
            dark
              ? "#4A4C5F"
              : "#DADCE5",
          true:
            accent,
        }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}


function AppearanceOption({
  label,
  value,
  selected,
  onPress,
  dark,
  accent,
}: {
  label: string;
  value: AppearanceMode;
  selected: boolean;
  onPress: (
    value: AppearanceMode
  ) => void;
  dark: boolean;
  accent: string;
}) {
  const Icon =
    value === "light"
      ? Sun
      : value === "dark"
        ? Moon
        : Laptop;

  return (
    <Pressable
      onPress={() =>
        onPress(value)
      }
      style={[
        styles.appearanceOption,
        dark &&
          styles.appearanceOptionDark,
        selected && {
          borderColor:
            accent,
          backgroundColor:
            dark
              ? "#343248"
              : "#F4F1FF",
        },
      ]}
    >
      <Icon
        size={18}
        color={
          selected
            ? accent
            : dark
              ? "#B7B9C8"
              : "#777A90"
        }
      />

      <Text
        style={[
          styles.appearanceText,
          dark &&
            styles.textPrimaryDark,
          selected && {
            color:
              accent,
          },
        ]}
      >
        {label}
      </Text>

      {
        selected && (
          <Check
            size={16}
            color={
              accent
            }
          />
        )
      }
    </Pressable>
  );
}


function ChildCard({
  child,
  dark,
  accent,
}: {
  child: SettingsChild;
  dark: boolean;
  accent: string;
}) {
  return (
    <View
      style={[
        styles.childCard,
        dark &&
          styles.childCardDark,
      ]}
    >
      <View
        style={[
          styles.childAvatar,
          {
            backgroundColor:
              dark
                ? "#343248"
                : "#F0EDFF",
          },
        ]}
      >
        <Text
          style={[
            styles.childAvatarText,
            {
              color:
                accent,
            },
          ]}
        >
          {
            getInitials(
              child.full_name
            )
          }
        </Text>
      </View>

      <View
        style={
          styles.childInfo
        }
      >
        <Text
          style={[
            styles.childName,
            dark &&
              styles.textPrimaryDark,
          ]}
          numberOfLines={1}
        >
          {
            child.full_name ||
            "Child"
          }
        </Text>

        <Text
          style={[
            styles.childMeta,
            dark &&
              styles.textSecondaryDark,
          ]}
          numberOfLines={1}
        >
          {
            child.age !==
              null &&
            child.age !==
              undefined
              ? `${child.age} years`
              : "Age not set"
          }
          {
            child.region
              ? ` • ${child.region}`
              : ""
          }
        </Text>
      </View>
    </View>
  );
}


export default function MobileSettings({
  role,
  onProfileUpdated,
}: Props) {
  const systemScheme =
    useColorScheme();

  const [
    data,
    setData,
  ] =
    useState<UserSettingsResponse | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    profileSaving,
    setProfileSaving,
  ] =
    useState(false);

  const [
    passwordSaving,
    setPasswordSaving,
  ] =
    useState(false);

  const [
    preferencesSaving,
    setPreferencesSaving,
  ] =
    useState(false);

  const [
    fullName,
    setFullName,
  ] =
    useState("");

  const [
    email,
    setEmail,
  ] =
    useState("");

  const [
    phone,
    setPhone,
  ] =
    useState("");

  const [
    region,
    setRegion,
  ] =
    useState("");

  const [
    avatarUrl,
    setAvatarUrl,
  ] =
    useState("");

  const [
    currentPassword,
    setCurrentPassword,
  ] =
    useState("");

  const [
    newPassword,
    setNewPassword,
  ] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] =
    useState("");

  const [
    showCurrentPassword,
    setShowCurrentPassword,
  ] =
    useState(false);

  const [
    showNewPassword,
    setShowNewPassword,
  ] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] =
    useState(false);

  const [
    preferences,
    setPreferences,
  ] =
    useState<UserPreferences>(
      defaultPreferences
    );


  const accent =
    getRoleAccent(role);

  const dark =
    resolveDarkMode(
      preferences.appearance,
      systemScheme
    );


  const fillFromData = (
    payload: UserSettingsResponse
  ) => {
    setData(payload);

    setFullName(
      payload.user
        ?.full_name ||
      ""
    );

    setEmail(
      payload.user
        ?.email ||
      ""
    );

    setPhone(
      payload.user
        ?.phone ||
      ""
    );

    setRegion(
      payload.user
        ?.region ||
      ""
    );

    setAvatarUrl(
      payload.user
        ?.avatar_url ||
      ""
    );

    setPreferences({
      ...defaultPreferences,
      ...payload.settings,
    });

    applyNativeAppearance(
      payload.settings
        ?.appearance ||
      "system"
    );
  };


  const loadSettings =
    async () => {
      try {
        setLoading(true);
        setError("");

        const payload =
          await getUserSettings();

        if (
          payload.user.role !==
          role
        ) {
          throw new Error(
            "This settings page does not match the current account."
          );
        }

        fillFromData(
          payload
        );
      } catch (
        requestError
      ) {
        setError(
          requestError instanceof
            Error
            ? requestError.message
            : "Unable to load settings."
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


  const children =
    useMemo(
      () => {
        if (
          !data ||
          data.role_info.type ===
            "admin"
        ) {
          return [];
        }

        return Array.isArray(
          data.role_info.children
        )
          ? data.role_info.children
          : [];
      },
      [
        data,
      ]
    );


  const saveProfile =
    async () => {
      const cleanName =
        fullName.trim();

      const cleanEmail =
        email
          .trim()
          .toLowerCase();

      const cleanRegion =
        region.trim();

      if (
        !cleanName ||
        !cleanEmail
      ) {
        Alert.alert(
          "Profile",
          "Full name and email are required."
        );

        return;
      }

      if (
        role === "parent" &&
        !cleanRegion
      ) {
        Alert.alert(
          "Profile",
          "Region is required for parent accounts."
        );

        return;
      }

      try {
        setProfileSaving(
          true
        );

        const response =
          await updateUserProfile({
            full_name:
              cleanName,
            email:
              cleanEmail,
            phone:
              phone.trim() ||
              null,
            avatar_url:
              avatarUrl.trim() ||
              null,
            ...(role ===
              "parent"
              ? {
                  region:
                    cleanRegion,
                }
              : {}),
          });

        const updatedUser =
          response.user;

        setData(
          previous =>
            previous
              ? {
                  ...previous,
                  user:
                    updatedUser,
                }
              : previous
        );

        setFullName(
          updatedUser.full_name ||
          ""
        );

        setEmail(
          updatedUser.email ||
          ""
        );

        setPhone(
          updatedUser.phone ||
          ""
        );

        setRegion(
          updatedUser.region ||
          ""
        );

        setAvatarUrl(
          updatedUser.avatar_url ||
          ""
        );

        try {
          await fetchCurrentUser();
        } catch {
        }

        onProfileUpdated?.(
          updatedUser
        );

        Alert.alert(
          "Profile",
          "Profile updated successfully."
        );
      } catch (
        requestError
      ) {
        Alert.alert(
          "Profile",
          requestError instanceof
            Error
            ? requestError.message
            : "Unable to update profile."
        );
      } finally {
        setProfileSaving(
          false
        );
      }
    };


  const savePassword =
    async () => {
      if (
        !currentPassword ||
        !newPassword ||
        !confirmPassword
      ) {
        Alert.alert(
          "Password",
          "Complete all password fields."
        );

        return;
      }

      if (
        newPassword.length < 6
      ) {
        Alert.alert(
          "Password",
          "New password must be at least 6 characters."
        );

        return;
      }

      if (
        newPassword !==
        confirmPassword
      ) {
        Alert.alert(
          "Password",
          "Password confirmation does not match."
        );

        return;
      }

      try {
        setPasswordSaving(
          true
        );

        await changeUserPassword({
          current_password:
            currentPassword,
          new_password:
            newPassword,
          confirm_password:
            confirmPassword,
        });

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        Alert.alert(
          "Password",
          "Password changed successfully."
        );
      } catch (
        requestError
      ) {
        Alert.alert(
          "Password",
          requestError instanceof
            Error
            ? requestError.message
            : "Unable to change password."
        );
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

        const response =
          await updateUserPreferences(
            preferences
          );

        setPreferences(
          response.settings
        );

        setData(
          previous =>
            previous
              ? {
                  ...previous,
                  settings:
                    response.settings,
                }
              : previous
        );

        applyNativeAppearance(
          response.settings
            .appearance
        );

        Alert.alert(
          "Preferences",
          "Preferences saved successfully."
        );
      } catch (
        requestError
      ) {
        Alert.alert(
          "Preferences",
          requestError instanceof
            Error
            ? requestError.message
            : "Unable to save preferences."
        );
      } finally {
        setPreferencesSaving(
          false
        );
      }
    };


  const setAppearance =
    (
      value: AppearanceMode
    ) => {
      setPreferences(
        previous => ({
          ...previous,
          appearance:
            value,
        })
      );

      applyNativeAppearance(
        value
      );
    };


  const logout = () => {
    clearAuthSession();

    router.replace(
      "/login"
    );
  };


  if (loading) {
    return (
      <View
        style={[
          styles.stateCard,
          dark &&
            styles.cardDark,
        ]}
      >
        <ActivityIndicator
          size="large"
          color={accent}
        />

        <Text
          style={[
            styles.stateText,
            dark &&
              styles.textSecondaryDark,
          ]}
        >
          Loading settings...
        </Text>
      </View>
    );
  }


  if (
    error ||
    !data
  ) {
    return (
      <View
        style={[
          styles.stateCard,
          dark &&
            styles.cardDark,
        ]}
      >
        <Text
          style={[
            styles.stateTitle,
            dark &&
              styles.textPrimaryDark,
          ]}
        >
          Settings could not be loaded
        </Text>

        <Text
          style={[
            styles.stateText,
            dark &&
              styles.textSecondaryDark,
          ]}
        >
          {
            error ||
            "Unable to load settings."
          }
        </Text>

        <Pressable
          style={[
            styles.primaryButton,
            {
              backgroundColor:
                accent,
            },
          ]}
          onPress={
            loadSettings
          }
        >
          <RefreshCw
            size={17}
            color="#FFFFFF"
          />

          <Text
            style={
              styles.primaryButtonText
            }
          >
            Try Again
          </Text>
        </Pressable>
      </View>
    );
  }


  const roleInfo =
    data.role_info;

  const user =
    data.user;

  const childCount =
    roleInfo.type ===
      "admin"
      ? 0
      : Number(
          roleInfo.child_count ??
          children.length
        );


  return (
    <View
      style={[
        styles.root,
        dark &&
          styles.rootDark,
      ]}
    >
      <View
        style={
          styles.heading
        }
      >
        <View
          style={
            styles.headingCopy
          }
        >
          <Text
            style={[
              styles.kicker,
              dark &&
                styles.textSecondaryDark,
            ]}
          >
            ACCOUNT & PREFERENCES
          </Text>

          <Text
            style={[
              styles.headingTitle,
              dark &&
                styles.textPrimaryDark,
            ]}
          >
            Settings
          </Text>

          <Text
            style={[
              styles.headingSubtitle,
              dark &&
                styles.textSecondaryDark,
            ]}
          >
            Manage your profile, security, notifications and appearance.
          </Text>
        </View>

        <Pressable
          style={[
            styles.refreshButton,
            dark &&
              styles.secondaryButtonDark,
          ]}
          onPress={
            loadSettings
          }
        >
          <RefreshCw
            size={16}
            color={accent}
          />

          <Text
            style={[
              styles.refreshText,
              {
                color:
                  accent,
              },
            ]}
          >
            Refresh
          </Text>
        </Pressable>
      </View>


      <View
        style={[
          styles.hero,
          {
            borderColor:
              dark
                ? "#3A3B50"
                : role ===
                    "therapist"
                  ? "#DDEBFA"
                  : "#EAE5FF",
            backgroundColor:
              dark
                ? "#292A3B"
                : role ===
                    "parent"
                  ? "#FFF7FB"
                  : role ===
                      "therapist"
                    ? "#F5FAFF"
                    : "#F8F6FF",
          },
        ]}
      >
        <View
          style={[
            styles.heroAvatar,
            {
              backgroundColor:
                dark
                  ? "#38394E"
                  : "#EEE9FF",
            },
          ]}
        >
          <Text
            style={[
              styles.heroAvatarText,
              {
                color:
                  accent,
              },
            ]}
          >
            {
              getInitials(
                user.full_name
              )
            }
          </Text>
        </View>

        <View
          style={
            styles.heroCopy
          }
        >
          <Text
            style={[
              styles.heroRole,
              dark &&
                styles.textSecondaryDark,
            ]}
          >
            {
              getRoleTitle(
                role
              )
            }
            {" "}Account
          </Text>

          <Text
            style={[
              styles.heroName,
              dark &&
                styles.textPrimaryDark,
            ]}
            numberOfLines={1}
          >
            {
              user.full_name ||
              getRoleTitle(
                role
              )
            }
          </Text>

          <Text
            style={[
              styles.heroEmail,
              dark &&
                styles.textSecondaryDark,
            ]}
            numberOfLines={1}
          >
            {
              user.email ||
              "—"
            }
          </Text>

          <Text
            style={[
              styles.heroSubtitle,
              dark &&
                styles.textSecondaryDark,
            ]}
          >
            {
              getRoleSubtitle(
                role
              )
            }
          </Text>
        </View>

        <View
          style={
            styles.activeBadge
          }
        >
          <ShieldCheck
            size={14}
            color="#438761"
          />

          <Text
            style={
              styles.activeBadgeText
            }
          >
            {
              user.is_active ===
                false ||
              Number(
                user.is_active
              ) === 0
                ? "Inactive"
                : "Active"
            }
          </Text>
        </View>
      </View>


      <View
        style={[
          styles.card,
          dark &&
            styles.cardDark,
        ]}
      >
        <View
          style={
            styles.cardHeading
          }
        >
          <View
            style={[
              styles.cardIcon,
              {
                backgroundColor:
                  dark
                    ? "#35364A"
                    : "#F0EDFF",
              },
            ]}
          >
            <UserRound
              size={19}
              color={accent}
            />
          </View>

          <View
            style={
              styles.cardHeadingCopy
            }
          >
            <Text
              style={[
                styles.cardTitle,
                dark &&
                  styles.textPrimaryDark,
              ]}
            >
              Profile
            </Text>

            <Text
              style={[
                styles.cardSubtitle,
                dark &&
                  styles.textSecondaryDark,
              ]}
            >
              Update your account details.
            </Text>
          </View>
        </View>

        <View
          style={
            styles.form
          }
        >
          <Text
            style={[
              styles.label,
              dark &&
                styles.textSecondaryDark,
            ]}
          >
            Full Name
          </Text>

          <TextInput
            value={
              fullName
            }
            onChangeText={
              setFullName
            }
            editable={
              !profileSaving
            }
            style={[
              styles.input,
              dark &&
                styles.inputDark,
            ]}
            placeholderTextColor={
              dark
                ? "#777A8D"
                : "#A7A8B7"
            }
          />

          <Text
            style={[
              styles.label,
              dark &&
                styles.textSecondaryDark,
            ]}
          >
            Email
          </Text>

          <View
            style={[
              styles.iconInput,
              dark &&
                styles.inputDark,
            ]}
          >
            <Mail
              size={16}
              color={
                dark
                  ? "#A8AABD"
                  : "#9597A9"
              }
            />

            <TextInput
              value={
                email
              }
              onChangeText={
                setEmail
              }
              editable={
                !profileSaving
              }
              autoCapitalize="none"
              keyboardType="email-address"
              style={[
                styles.iconTextInput,
                dark &&
                  styles.inputTextDark,
              ]}
              placeholderTextColor={
                dark
                  ? "#777A8D"
                  : "#A7A8B7"
              }
            />
          </View>

          <Text
            style={[
              styles.label,
              dark &&
                styles.textSecondaryDark,
            ]}
          >
            Phone
          </Text>

          <View
            style={[
              styles.iconInput,
              dark &&
                styles.inputDark,
            ]}
          >
            <Phone
              size={16}
              color={
                dark
                  ? "#A8AABD"
                  : "#9597A9"
              }
            />

            <TextInput
              value={
                phone
              }
              onChangeText={
                setPhone
              }
              editable={
                !profileSaving
              }
              keyboardType="phone-pad"
              style={[
                styles.iconTextInput,
                dark &&
                  styles.inputTextDark,
              ]}
              placeholder="Optional"
              placeholderTextColor={
                dark
                  ? "#777A8D"
                  : "#A7A8B7"
              }
            />
          </View>

          {
            role ===
              "parent" && (
              <>
                <Text
                  style={[
                    styles.label,
                    dark &&
                      styles.textSecondaryDark,
                  ]}
                >
                  Region
                </Text>

                <View
                  style={[
                    styles.iconInput,
                    dark &&
                      styles.inputDark,
                  ]}
                >
                  <MapPin
                    size={16}
                    color={
                      dark
                        ? "#A8AABD"
                        : "#9597A9"
                    }
                  />

                  <TextInput
                    value={
                      region
                    }
                    onChangeText={
                      setRegion
                    }
                    editable={
                      !profileSaving
                    }
                    style={[
                      styles.iconTextInput,
                      dark &&
                        styles.inputTextDark,
                    ]}
                    placeholder="Required"
                    placeholderTextColor={
                      dark
                        ? "#777A8D"
                        : "#A7A8B7"
                    }
                  />
                </View>
              </>
            )
          }

          <Text
            style={[
              styles.label,
              dark &&
                styles.textSecondaryDark,
            ]}
          >
            Avatar URL
          </Text>

          <TextInput
            value={
              avatarUrl
            }
            onChangeText={
              setAvatarUrl
            }
            editable={
              !profileSaving
            }
            autoCapitalize="none"
            style={[
              styles.input,
              dark &&
                styles.inputDark,
            ]}
            placeholder="Optional image URL"
            placeholderTextColor={
              dark
                ? "#777A8D"
                : "#A7A8B7"
            }
          />

          <Pressable
            onPress={
              saveProfile
            }
            disabled={
              profileSaving
            }
            style={[
              styles.primaryButton,
              {
                backgroundColor:
                  accent,
              },
              profileSaving &&
                styles.disabled,
            ]}
          >
            {
              profileSaving
                ? (
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />
                )
                : (
                  <Save
                    size={17}
                    color="#FFFFFF"
                  />
                )
            }

            <Text
              style={
                styles.primaryButtonText
              }
            >
              {
                profileSaving
                  ? "Saving..."
                  : "Save Profile"
              }
            </Text>
          </Pressable>
        </View>
      </View>


      <View
        style={[
          styles.card,
          dark &&
            styles.cardDark,
        ]}
      >
        <View
          style={
            styles.cardHeading
          }
        >
          <View
            style={[
              styles.cardIcon,
              {
                backgroundColor:
                  dark
                    ? "#35364A"
                    : "#EEF5FF",
              },
            ]}
          >
            <KeyRound
              size={19}
              color={accent}
            />
          </View>

          <View
            style={
              styles.cardHeadingCopy
            }
          >
            <Text
              style={[
                styles.cardTitle,
                dark &&
                  styles.textPrimaryDark,
              ]}
            >
              Security
            </Text>

            <Text
              style={[
                styles.cardSubtitle,
                dark &&
                  styles.textSecondaryDark,
              ]}
            >
              Change your account password.
            </Text>
          </View>
        </View>

        <View
          style={
            styles.form
          }
        >
          <Text
            style={[
              styles.label,
              dark &&
                styles.textSecondaryDark,
            ]}
          >
            Current Password
          </Text>

          <View
            style={[
              styles.passwordInput,
              dark &&
                styles.inputDark,
            ]}
          >
            <TextInput
              value={
                currentPassword
              }
              onChangeText={
                setCurrentPassword
              }
              secureTextEntry={
                !showCurrentPassword
              }
              editable={
                !passwordSaving
              }
              style={[
                styles.passwordTextInput,
                dark &&
                  styles.inputTextDark,
              ]}
            />

            <Pressable
              onPress={() =>
                setShowCurrentPassword(
                  previous =>
                    !previous
                )
              }
            >
              {
                showCurrentPassword
                  ? (
                    <EyeOff
                      size={18}
                      color="#8C8FA2"
                    />
                  )
                  : (
                    <Eye
                      size={18}
                      color="#8C8FA2"
                    />
                  )
              }
            </Pressable>
          </View>

          <Text
            style={[
              styles.label,
              dark &&
                styles.textSecondaryDark,
            ]}
          >
            New Password
          </Text>

          <View
            style={[
              styles.passwordInput,
              dark &&
                styles.inputDark,
            ]}
          >
            <TextInput
              value={
                newPassword
              }
              onChangeText={
                setNewPassword
              }
              secureTextEntry={
                !showNewPassword
              }
              editable={
                !passwordSaving
              }
              style={[
                styles.passwordTextInput,
                dark &&
                  styles.inputTextDark,
              ]}
            />

            <Pressable
              onPress={() =>
                setShowNewPassword(
                  previous =>
                    !previous
                )
              }
            >
              {
                showNewPassword
                  ? (
                    <EyeOff
                      size={18}
                      color="#8C8FA2"
                    />
                  )
                  : (
                    <Eye
                      size={18}
                      color="#8C8FA2"
                    />
                  )
              }
            </Pressable>
          </View>

          <Text
            style={[
              styles.label,
              dark &&
                styles.textSecondaryDark,
            ]}
          >
            Confirm New Password
          </Text>

          <View
            style={[
              styles.passwordInput,
              dark &&
                styles.inputDark,
            ]}
          >
            <TextInput
              value={
                confirmPassword
              }
              onChangeText={
                setConfirmPassword
              }
              secureTextEntry={
                !showConfirmPassword
              }
              editable={
                !passwordSaving
              }
              style={[
                styles.passwordTextInput,
                dark &&
                  styles.inputTextDark,
              ]}
            />

            <Pressable
              onPress={() =>
                setShowConfirmPassword(
                  previous =>
                    !previous
                )
              }
            >
              {
                showConfirmPassword
                  ? (
                    <EyeOff
                      size={18}
                      color="#8C8FA2"
                    />
                  )
                  : (
                    <Eye
                      size={18}
                      color="#8C8FA2"
                    />
                  )
              }
            </Pressable>
          </View>

          <Pressable
            onPress={
              savePassword
            }
            disabled={
              passwordSaving
            }
            style={[
              styles.primaryButton,
              {
                backgroundColor:
                  accent,
              },
              passwordSaving &&
                styles.disabled,
            ]}
          >
            {
              passwordSaving
                ? (
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />
                )
                : (
                  <KeyRound
                    size={17}
                    color="#FFFFFF"
                  />
                )
            }

            <Text
              style={
                styles.primaryButtonText
              }
            >
              {
                passwordSaving
                  ? "Updating..."
                  : "Change Password"
              }
            </Text>
          </Pressable>
        </View>
      </View>


      <View
        style={[
          styles.card,
          dark &&
            styles.cardDark,
        ]}
      >
        <View
          style={
            styles.cardHeading
          }
        >
          <View
            style={[
              styles.cardIcon,
              {
                backgroundColor:
                  dark
                    ? "#35364A"
                    : "#FFF0F5",
              },
            ]}
          >
            <Bell
              size={19}
              color={accent}
            />
          </View>

          <View
            style={
              styles.cardHeadingCopy
            }
          >
            <Text
              style={[
                styles.cardTitle,
                dark &&
                  styles.textPrimaryDark,
              ]}
            >
              Notifications
            </Text>

            <Text
              style={[
                styles.cardSubtitle,
                dark &&
                  styles.textSecondaryDark,
              ]}
            >
              Choose which KidMind updates you want.
            </Text>
          </View>
        </View>

        <View
          style={
            styles.preferences
          }
        >
          <PreferenceRow
            title="Email Notifications"
            description="Receive important KidMind updates by email."
            value={
              preferences
                .email_notifications
            }
            onChange={
              value =>
                setPreferences(
                  previous => ({
                    ...previous,
                    email_notifications:
                      value,
                  })
                )
            }
            disabled={
              preferencesSaving
            }
            accent={accent}
            dark={dark}
          />

          <PreferenceRow
            title="Account Notifications"
            description="Account changes and security activity."
            value={
              preferences
                .account_notifications
            }
            onChange={
              value =>
                setPreferences(
                  previous => ({
                    ...previous,
                    account_notifications:
                      value,
                  })
                )
            }
            disabled={
              preferencesSaving
            }
            accent={accent}
            dark={dark}
          />

          <PreferenceRow
            title="Session Notifications"
            description="Updates related to assessment sessions."
            value={
              preferences
                .session_notifications
            }
            onChange={
              value =>
                setPreferences(
                  previous => ({
                    ...previous,
                    session_notifications:
                      value,
                  })
                )
            }
            disabled={
              preferencesSaving
            }
            accent={accent}
            dark={dark}
          />

          <PreferenceRow
            title="Progress Notifications"
            description="Updates when new progress information is available."
            value={
              preferences
                .progress_notifications
            }
            onChange={
              value =>
                setPreferences(
                  previous => ({
                    ...previous,
                    progress_notifications:
                      value,
                  })
                )
            }
            disabled={
              preferencesSaving
            }
            accent={accent}
            dark={dark}
          />
        </View>
      </View>


      <View
        style={[
          styles.card,
          dark &&
            styles.cardDark,
        ]}
      >
        <View
          style={
            styles.cardHeading
          }
        >
          <View
            style={[
              styles.cardIcon,
              {
                backgroundColor:
                  dark
                    ? "#35364A"
                    : "#EEF8F4",
              },
            ]}
          >
            <Laptop
              size={19}
              color={accent}
            />
          </View>

          <View
            style={
              styles.cardHeadingCopy
            }
          >
            <Text
              style={[
                styles.cardTitle,
                dark &&
                  styles.textPrimaryDark,
              ]}
            >
              Appearance
            </Text>

            <Text
              style={[
                styles.cardSubtitle,
                dark &&
                  styles.textSecondaryDark,
              ]}
            >
              Choose how KidMind looks on this account.
            </Text>
          </View>
        </View>

        <View
          style={
            styles.appearanceGrid
          }
        >
          <AppearanceOption
            label="Light"
            value="light"
            selected={
              preferences.appearance ===
              "light"
            }
            onPress={
              setAppearance
            }
            dark={dark}
            accent={accent}
          />

          <AppearanceOption
            label="Dark"
            value="dark"
            selected={
              preferences.appearance ===
              "dark"
            }
            onPress={
              setAppearance
            }
            dark={dark}
            accent={accent}
          />

          <AppearanceOption
            label="System"
            value="system"
            selected={
              preferences.appearance ===
              "system"
            }
            onPress={
              setAppearance
            }
            dark={dark}
            accent={accent}
          />
        </View>

        <Pressable
          onPress={
            savePreferences
          }
          disabled={
            preferencesSaving
          }
          style={[
            styles.primaryButton,
            {
              backgroundColor:
                accent,
            },
            preferencesSaving &&
              styles.disabled,
          ]}
        >
          {
            preferencesSaving
              ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              )
              : (
                <Save
                  size={17}
                  color="#FFFFFF"
                />
              )
          }

          <Text
            style={
              styles.primaryButtonText
            }
          >
            {
              preferencesSaving
                ? "Saving..."
                : "Save Preferences"
            }
          </Text>
        </Pressable>
      </View>


      {
        roleInfo.type ===
          "admin" ? (
          <View
            style={[
              styles.card,
              dark &&
                styles.cardDark,
            ]}
          >
            <View
              style={
                styles.cardHeading
              }
            >
              <View
                style={[
                  styles.cardIcon,
                  {
                    backgroundColor:
                      dark
                        ? "#35364A"
                        : "#FFF5E9",
                  },
                ]}
              >
                <ShieldCheck
                  size={19}
                  color={accent}
                />
              </View>

              <View
                style={
                  styles.cardHeadingCopy
                }
              >
                <Text
                  style={[
                    styles.cardTitle,
                    dark &&
                      styles.textPrimaryDark,
                  ]}
                >
                  System Information
                </Text>

                <Text
                  style={[
                    styles.cardSubtitle,
                    dark &&
                      styles.textSecondaryDark,
                  ]}
                >
                  KidMind administrator overview.
                </Text>
              </View>
            </View>

            <View
              style={
                styles.infoGrid
              }
            >
              <View
                style={[
                  styles.infoBlock,
                  dark &&
                    styles.infoBlockDark,
                ]}
              >
                <Text
                  style={[
                    styles.infoLabel,
                    dark &&
                      styles.textSecondaryDark,
                  ]}
                >
                  Platform
                </Text>

                <Text
                  style={[
                    styles.infoValue,
                    dark &&
                      styles.textPrimaryDark,
                  ]}
                >
                  {
                    roleInfo.system
                      .name ||
                    "KIDMIND"
                  }
                </Text>
              </View>

              <View
                style={[
                  styles.infoBlock,
                  dark &&
                    styles.infoBlockDark,
                ]}
              >
                <Text
                  style={[
                    styles.infoLabel,
                    dark &&
                      styles.textSecondaryDark,
                  ]}
                >
                  Version
                </Text>

                <Text
                  style={[
                    styles.infoValue,
                    dark &&
                      styles.textPrimaryDark,
                  ]}
                >
                  {
                    roleInfo.system
                      .version ||
                    "1.0.0"
                  }
                </Text>
              </View>
            </View>

            <View
              style={
                styles.summaryGrid
              }
            >
              {
                [
                  [
                    "Users",
                    roleInfo.summary
                      .total_users,
                  ],
                  [
                    "Admins",
                    roleInfo.summary
                      .total_admins,
                  ],
                  [
                    "Parents",
                    roleInfo.summary
                      .total_parents,
                  ],
                  [
                    "Therapists",
                    roleInfo.summary
                      .total_therapists,
                  ],
                  [
                    "Children",
                    roleInfo.summary
                      .total_children,
                  ],
                  [
                    "Sessions",
                    roleInfo.summary
                      .total_sessions,
                  ],
                ].map(
                  item => (
                    <View
                      key={
                        String(
                          item[0]
                        )
                      }
                      style={[
                        styles.summaryBlock,
                        dark &&
                          styles.summaryBlockDark,
                      ]}
                    >
                      <Text
                        style={[
                          styles.summaryLabel,
                          dark &&
                            styles.textSecondaryDark,
                        ]}
                      >
                        {
                          String(
                            item[0]
                          )
                        }
                      </Text>

                      <Text
                        style={[
                          styles.summaryValue,
                          {
                            color:
                              accent,
                          },
                        ]}
                      >
                        {
                          Number(
                            item[1] ||
                            0
                          )
                        }
                      </Text>
                    </View>
                  )
                )
              }
            </View>
          </View>
        ) : (
          <View
            style={[
              styles.card,
              dark &&
                styles.cardDark,
            ]}
          >
            <View
              style={
                styles.cardHeading
              }
            >
              <View
                style={[
                  styles.cardIcon,
                  {
                    backgroundColor:
                      dark
                        ? "#35364A"
                        : "#F0EDFF",
                  },
                ]}
              >
                <Users
                  size={19}
                  color={accent}
                />
              </View>

              <View
                style={
                  styles.cardHeadingCopy
                }
              >
                <Text
                  style={[
                    styles.cardTitle,
                    dark &&
                      styles.textPrimaryDark,
                  ]}
                >
                  {
                    role ===
                      "therapist"
                      ? "My Caseload"
                      : "My Children"
                  }
                </Text>

                <Text
                  style={[
                    styles.cardSubtitle,
                    dark &&
                      styles.textSecondaryDark,
                  ]}
                >
                  {
                    childCount
                  }
                  {" "}
                  {
                    childCount ===
                      1
                      ? "child"
                      : "children"
                  }
                  {" "}linked to this account.
                </Text>
              </View>
            </View>

            {
              children.length
                ? (
                  <View
                    style={
                      styles.childrenList
                    }
                  >
                    {
                      children.map(
                        child => (
                          <ChildCard
                            key={
                              child.id
                            }
                            child={
                              child
                            }
                            dark={
                              dark
                            }
                            accent={
                              accent
                            }
                          />
                        )
                      )
                    }
                  </View>
                )
                : (
                  <Text
                    style={[
                      styles.emptyText,
                      dark &&
                        styles.textSecondaryDark,
                    ]}
                  >
                    No children are currently linked to this account.
                  </Text>
                )
            }
          </View>
        )
      }


      <View
        style={[
          styles.card,
          dark &&
            styles.cardDark,
        ]}
      >
        <View
          style={
            styles.cardHeading
          }
        >
          <View
            style={[
              styles.cardIcon,
              {
                backgroundColor:
                  dark
                    ? "#35364A"
                    : "#F4F3F8",
              },
            ]}
          >
            <Smartphone
              size={19}
              color={accent}
            />
          </View>

          <View
            style={
              styles.cardHeadingCopy
            }
          >
            <Text
              style={[
                styles.cardTitle,
                dark &&
                  styles.textPrimaryDark,
              ]}
            >
              Account Information
            </Text>

            <Text
              style={[
                styles.cardSubtitle,
                dark &&
                  styles.textSecondaryDark,
              ]}
            >
              Account status and activity.
            </Text>
          </View>
        </View>

        <View
          style={
            styles.infoGrid
          }
        >
          <View
            style={[
              styles.infoBlock,
              dark &&
                styles.infoBlockDark,
            ]}
          >
            <Text
              style={[
                styles.infoLabel,
                dark &&
                  styles.textSecondaryDark,
              ]}
            >
              Account Type
            </Text>

            <Text
              style={[
                styles.infoValue,
                dark &&
                  styles.textPrimaryDark,
              ]}
            >
              {
                getRoleTitle(
                  role
                )
              }
            </Text>
          </View>

          <View
            style={[
              styles.infoBlock,
              dark &&
                styles.infoBlockDark,
            ]}
          >
            <Text
              style={[
                styles.infoLabel,
                dark &&
                  styles.textSecondaryDark,
              ]}
            >
              Status
            </Text>

            <Text
              style={[
                styles.infoValue,
                {
                  color:
                    user.is_active ===
                      false ||
                    Number(
                      user.is_active
                    ) === 0
                      ? "#C45D70"
                      : "#438761",
                },
              ]}
            >
              {
                user.is_active ===
                  false ||
                Number(
                  user.is_active
                ) === 0
                  ? "Inactive"
                  : "Active"
              }
            </Text>
          </View>

          {
            role ===
              "parent" && (
              <View
                style={[
                  styles.infoBlock,
                  dark &&
                    styles.infoBlockDark,
                ]}
              >
                <Text
                  style={[
                    styles.infoLabel,
                    dark &&
                      styles.textSecondaryDark,
                  ]}
                >
                  Region
                </Text>

                <Text
                  style={[
                    styles.infoValue,
                    dark &&
                      styles.textPrimaryDark,
                  ]}
                  numberOfLines={1}
                >
                  {
                    user.region ||
                    "—"
                  }
                </Text>
              </View>
            )
          }

          <View
            style={[
              styles.infoBlock,
              dark &&
                styles.infoBlockDark,
            ]}
          >
            <Text
              style={[
                styles.infoLabel,
                dark &&
                  styles.textSecondaryDark,
              ]}
            >
              Last Login
            </Text>

            <Text
              style={[
                styles.infoValue,
                dark &&
                  styles.textPrimaryDark,
              ]}
            >
              {
                formatDate(
                  user.last_login_at
                )
              }
            </Text>
          </View>

          <View
            style={[
              styles.infoBlock,
              dark &&
                styles.infoBlockDark,
            ]}
          >
            <Text
              style={[
                styles.infoLabel,
                dark &&
                  styles.textSecondaryDark,
              ]}
            >
              Member Since
            </Text>

            <Text
              style={[
                styles.infoValue,
                dark &&
                  styles.textPrimaryDark,
              ]}
            >
              {
                formatDate(
                  user.created_at
                )
              }
            </Text>
          </View>
        </View>
      </View>


      <View
        style={[
          styles.logoutCard,
          dark &&
            styles.cardDark,
        ]}
      >
        <View
          style={
            styles.logoutCopy
          }
        >
          <Text
            style={[
              styles.cardTitle,
              dark &&
                styles.textPrimaryDark,
            ]}
          >
            Sign Out
          </Text>

          <Text
            style={[
              styles.cardSubtitle,
              dark &&
                styles.textSecondaryDark,
            ]}
          >
            End this KidMind session on this device.
          </Text>
        </View>

        <Pressable
          onPress={
            logout
          }
          style={
            styles.logoutButton
          }
        >
          <LogOut
            size={17}
            color="#B65E69"
          />

          <Text
            style={
              styles.logoutButtonText
            }
          >
            Logout
          </Text>
        </Pressable>
      </View>
    </View>
  );
}


const styles =
  StyleSheet.create({
    root: {
      gap: 16,
    },

    rootDark: {
      backgroundColor:
        "#1E1F2C",
      padding: 12,
      borderRadius: 22,
    },

    heading: {
      gap: 12,
    },

    headingCopy: {
      gap: 4,
    },

    kicker: {
      color:
        "#9294A6",
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 1,
    },

    headingTitle: {
      color:
        "#343653",
      fontSize: 28,
      fontWeight: "800",
    },

    headingSubtitle: {
      color:
        "#989AAD",
      fontSize: 12,
      lineHeight: 18,
    },

    refreshButton: {
      alignSelf:
        "flex-start",
      minHeight: 40,
      paddingHorizontal: 14,
      borderWidth: 1,
      borderColor:
        "#E8E8F0",
      borderRadius: 12,
      backgroundColor:
        "#FFFFFF",
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 7,
    },

    secondaryButtonDark: {
      backgroundColor:
        "#292A3B",
      borderColor:
        "#3A3B50",
    },

    refreshText: {
      fontSize: 11,
      fontWeight: "700",
    },

    hero: {
      minHeight: 120,
      padding: 17,
      borderWidth: 1,
      borderRadius: 20,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 12,
      flexWrap:
        "wrap",
    },

    heroAvatar: {
      width: 62,
      height: 62,
      borderRadius: 19,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    heroAvatarText: {
      fontSize: 18,
      fontWeight: "800",
    },

    heroCopy: {
      minWidth: 150,
      flex: 1,
    },

    heroRole: {
      color:
        "#9496A8",
      fontSize: 10,
      fontWeight: "700",
    },

    heroName: {
      marginTop: 3,
      color:
        "#3C3E5B",
      fontSize: 17,
      fontWeight: "800",
    },

    heroEmail: {
      marginTop: 2,
      color:
        "#989AAD",
      fontSize: 10,
    },

    heroSubtitle: {
      marginTop: 4,
      color:
        "#A0A2B2",
      fontSize: 9,
    },

    activeBadge: {
      minHeight: 31,
      paddingHorizontal: 10,
      borderRadius: 999,
      backgroundColor:
        "#EAF8F0",
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 5,
    },

    activeBadgeText: {
      color:
        "#438761",
      fontSize: 9,
      fontWeight: "800",
    },

    card: {
      padding: 17,
      borderWidth: 1,
      borderColor:
        "#ECECF3",
      borderRadius: 18,
      backgroundColor:
        "#FFFFFF",
    },

    cardDark: {
      backgroundColor:
        "#292A3B",
      borderColor:
        "#3A3B50",
    },

    cardHeading: {
      flexDirection:
        "row",
      alignItems:
        "flex-start",
      gap: 10,
    },

    cardIcon: {
      width: 38,
      height: 38,
      borderRadius: 11,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    cardHeadingCopy: {
      flex: 1,
    },

    cardTitle: {
      color:
        "#43455F",
      fontSize: 14,
      fontWeight: "800",
    },

    cardSubtitle: {
      marginTop: 3,
      color:
        "#9A9CAE",
      fontSize: 10,
      lineHeight: 15,
    },

    form: {
      marginTop: 17,
      gap: 8,
    },

    label: {
      marginTop: 5,
      color:
        "#73768B",
      fontSize: 10,
      fontWeight: "700",
    },

    input: {
      height: 44,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor:
        "#E7E7EF",
      borderRadius: 11,
      backgroundColor:
        "#FAFAFD",
      color:
        "#45475F",
      fontSize: 12,
    },

    inputDark: {
      backgroundColor:
        "#323346",
      borderColor:
        "#43455A",
      color:
        "#ECECF4",
    },

    inputTextDark: {
      color:
        "#ECECF4",
    },

    iconInput: {
      minHeight: 44,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor:
        "#E7E7EF",
      borderRadius: 11,
      backgroundColor:
        "#FAFAFD",
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 9,
    },

    iconTextInput: {
      minWidth: 0,
      flex: 1,
      color:
        "#45475F",
      fontSize: 12,
    },

    passwordInput: {
      minHeight: 44,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor:
        "#E7E7EF",
      borderRadius: 11,
      backgroundColor:
        "#FAFAFD",
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 8,
    },

    passwordTextInput: {
      minWidth: 0,
      flex: 1,
      color:
        "#45475F",
      fontSize: 12,
    },

    primaryButton: {
      minHeight: 42,
      marginTop: 8,
      paddingHorizontal: 14,
      borderRadius: 11,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 7,
    },

    primaryButtonText: {
      color:
        "#FFFFFF",
      fontSize: 11,
      fontWeight: "800",
    },

    disabled: {
      opacity: .6,
    },

    preferences: {
      marginTop: 12,
    },

    preferenceRow: {
      minHeight: 64,
      paddingVertical: 9,
      borderBottomWidth: 1,
      borderBottomColor:
        "#F0F0F5",
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 9,
    },

    preferenceRowDark: {
      borderBottomColor:
        "#3B3C50",
    },

    preferenceIcon: {
      width: 34,
      height: 34,
      borderRadius: 10,
      backgroundColor:
        "#F5F5FA",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    preferenceIconDark: {
      backgroundColor:
        "#343548",
    },

    preferenceCopy: {
      minWidth: 0,
      flex: 1,
    },

    preferenceTitle: {
      color:
        "#55576C",
      fontSize: 10,
      fontWeight: "700",
    },

    preferenceDescription: {
      marginTop: 2,
      color:
        "#A0A2B1",
      fontSize: 9,
      lineHeight: 13,
    },

    appearanceGrid: {
      marginTop: 15,
      gap: 8,
    },

    appearanceOption: {
      minHeight: 52,
      paddingHorizontal: 13,
      borderWidth: 1,
      borderColor:
        "#E8E8EF",
      borderRadius: 12,
      backgroundColor:
        "#FAFAFD",
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 9,
    },

    appearanceOptionDark: {
      backgroundColor:
        "#323346",
      borderColor:
        "#43455A",
    },

    appearanceText: {
      flex: 1,
      color:
        "#6F7287",
      fontSize: 11,
      fontWeight: "700",
    },

    childrenList: {
      marginTop: 15,
      gap: 9,
    },

    childCard: {
      padding: 11,
      borderWidth: 1,
      borderColor:
        "#ECEEF5",
      borderRadius: 12,
      backgroundColor:
        "#FAFBFE",
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 10,
    },

    childCardDark: {
      backgroundColor:
        "#323346",
      borderColor:
        "#43455A",
    },

    childAvatar: {
      width: 38,
      height: 38,
      borderRadius: 11,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    childAvatarText: {
      fontSize: 12,
      fontWeight: "800",
    },

    childInfo: {
      minWidth: 0,
      flex: 1,
    },

    childName: {
      color:
        "#51536B",
      fontSize: 11,
      fontWeight: "800",
    },

    childMeta: {
      marginTop: 3,
      color:
        "#9A9CAC",
      fontSize: 9,
    },

    emptyText: {
      marginTop: 15,
      padding: 18,
      borderRadius: 11,
      backgroundColor:
        "#FAFAFD",
      color:
        "#989AAC",
      fontSize: 10,
      textAlign:
        "center",
    },

    infoGrid: {
      marginTop: 15,
      flexDirection:
        "row",
      flexWrap:
        "wrap",
      gap: 9,
    },

    infoBlock: {
      width: "47%",
      minHeight: 61,
      padding: 11,
      borderRadius: 11,
      backgroundColor:
        "#FAFAFD",
    },

    infoBlockDark: {
      backgroundColor:
        "#323346",
    },

    infoLabel: {
      color:
        "#9A9CAD",
      fontSize: 9,
    },

    infoValue: {
      marginTop: 4,
      color:
        "#55576D",
      fontSize: 10,
      fontWeight: "800",
    },

    summaryGrid: {
      marginTop: 12,
      flexDirection:
        "row",
      flexWrap:
        "wrap",
      gap: 9,
    },

    summaryBlock: {
      width: "30%",
      minHeight: 74,
      padding: 10,
      borderWidth: 1,
      borderColor:
        "#EEEEF4",
      borderRadius: 11,
      backgroundColor:
        "#FFFFFF",
      justifyContent:
        "center",
    },

    summaryBlockDark: {
      backgroundColor:
        "#323346",
      borderColor:
        "#43455A",
    },

    summaryLabel: {
      color:
        "#9A9CAD",
      fontSize: 8,
    },

    summaryValue: {
      marginTop: 4,
      fontSize: 20,
      fontWeight: "800",
    },

    logoutCard: {
      padding: 17,
      borderWidth: 1,
      borderColor:
        "#F0DFE2",
      borderRadius: 18,
      backgroundColor:
        "#FFFFFF",
      gap: 13,
    },

    logoutCopy: {
      gap: 2,
    },

    logoutButton: {
      minHeight: 42,
      borderWidth: 1,
      borderColor:
        "#F0CED2",
      borderRadius: 11,
      backgroundColor:
        "#FFF4F4",
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 7,
    },

    logoutButtonText: {
      color:
        "#B65E69",
      fontSize: 11,
      fontWeight: "800",
    },

    stateCard: {
      minHeight: 260,
      padding: 24,
      borderWidth: 1,
      borderColor:
        "#ECECF3",
      borderRadius: 18,
      backgroundColor:
        "#FFFFFF",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 10,
    },

    stateTitle: {
      color:
        "#41435E",
      fontSize: 15,
      fontWeight: "800",
      textAlign:
        "center",
    },

    stateText: {
      color:
        "#9395A7",
      fontSize: 11,
      lineHeight: 17,
      textAlign:
        "center",
    },

    textPrimaryDark: {
      color:
        "#ECECF4",
    },

    textSecondaryDark: {
      color:
        "#A9ABBC",
    },
  });
