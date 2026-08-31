import {
  Image,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  resolveApiAssetUrl,
} from "@/api/authApi";


export const getUserInitials = (
  value?:
    | string
    | null
) => {

  const parts =
    String(
      value || ""
    )
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  if (
    parts.length ===
    0
  ) {
    return "U";
  }

  return parts
    .slice(
      0,
      2
    )
    .map(
      part =>
        part
          .charAt(0)
          .toUpperCase()
    )
    .join("");

};


type Props = {
  name?:
    | string
    | null;
  avatarUrl?:
    | string
    | null;
  style?:
    StyleProp<ViewStyle>;
  textStyle?:
    StyleProp<TextStyle>;
  fallback?:
    ReactNode;
  accessibilityLabel?:
    string;
};


export default function UserAvatar({
  name,
  avatarUrl,
  style,
  textStyle,
  fallback,
  accessibilityLabel,
}: Props) {

  const resolvedAvatar =
    resolveApiAssetUrl(
      avatarUrl
    );

  const [
    failed,
    setFailed,
  ] =
    useState(false);


  useEffect(
    () => {

      setFailed(
        false
      );

    },
    [
      resolvedAvatar,
    ]
  );


  const showImage =
    Boolean(
      resolvedAvatar
    ) &&
    !failed;


  return (

    <View
      style={[
        styles.base,
        style,
      ]}
      accessibilityRole="image"
      accessibilityLabel={
        accessibilityLabel ||
        (
          name
            ? `${name} profile photo`
            : "Profile photo"
        )
      }
    >

      {
        showImage
          ? (
            <Image
              source={{
                uri:
                  resolvedAvatar,
              }}
              style={
                StyleSheet
                  .absoluteFill
              }
              resizeMode="cover"
              onError={() =>
                setFailed(
                  true
                )
              }
            />
          )
          : (
            fallback ?? (
              <Text
                style={
                  textStyle
                }
              >
                {
                  getUserInitials(
                    name
                  )
                }
              </Text>
            )
          )
      }

    </View>

  );

}


const styles =
  StyleSheet.create({

    base: {
      overflow:
        "hidden",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

  });
