import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  Bell,
  ChevronDown,
  Menu,
  Search,
} from "lucide-react-native";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  router,
  useFocusEffect,
} from "expo-router";

import {
  getUnreadNotificationCount,
} from "@/api/notificationsApi";

import {
  fetchCurrentUser,
  getCurrentUser,
  subscribeAuthUser,
  type AuthUser,
} from "@/api/authApi";

import UserAvatar from "@/components/common/UserAvatar";
import ProfileMenu from "./ProfileMenu";


type Props = {
  onMenuPress: () => void;
};


export default function Navbar({
  onMenuPress,
}: Props) {

  const [
    showProfile,
    setShowProfile,
  ] =
    useState(false);

  const [
    unreadCount,
    setUnreadCount,
  ] =
    useState(0);

  const [
    currentUser,
    setCurrentUser,
  ] =
    useState<AuthUser | null>(
      getCurrentUser()
    );


  useEffect(
    () => {

      return subscribeAuthUser(
        user =>
          setCurrentUser(
            user
          )
      );

    },
    []
  );


  const loadCurrentUser =
    useCallback(
      async () => {

        const cachedUser =
          getCurrentUser();

        if (
          cachedUser
        ) {
          setCurrentUser(
            cachedUser
          );
        }

        try {

          const user =
            await fetchCurrentUser();

          setCurrentUser(
            user
          );

        } catch (
          error
        ) {

          console.error(
            "Failed to refresh current user:",
            error
          );

        }

      },
      []
    );


  const loadUnreadCount =
    useCallback(
      async () => {

        try {

          const count =
            await getUnreadNotificationCount();

          setUnreadCount(
            count
          );

        } catch (error) {

          console.error(
            "Failed to load notification count:",
            error
          );

        }

      },
      []
    );


  useFocusEffect(
    useCallback(
      () => {

        loadUnreadCount();
        loadCurrentUser();

        return undefined;

      },
      [
        loadCurrentUser,
        loadUnreadCount,
      ]
    )
  );


  useEffect(
    () => {

      const timer =
        setInterval(
          () => {
            loadUnreadCount();
          },
          30000
        );

      return () => {
        clearInterval(
          timer
        );
      };

    },
    [
      loadUnreadCount,
    ]
  );


  const today =
    new Date()
      .toLocaleDateString(
        "en-US",
        {
          weekday:
            "long",
          month:
            "long",
          day:
            "numeric",
          year:
            "numeric",
        }
      );


  return (

    <View
      style={
        styles.container
      }
    >

      <View
        style={
          styles.top
        }
      >

        <TouchableOpacity
          onPress={
            onMenuPress
          }
          style={
            styles.menuButton
          }
          activeOpacity={0.75}
        >
          <Menu
            size={20}
            color="#263041"
          />
        </TouchableOpacity>


        <View
          style={
            styles.titleContainer
          }
        >

          <Text
            numberOfLines={1}
            style={
              styles.date
            }
          >
            {today}
          </Text>

          <Text
            numberOfLines={1}
            style={
              styles.heading
            }
          >
            Welcome Back
          </Text>

        </View>


        <TouchableOpacity
          style={
            styles.iconButton
          }
          activeOpacity={0.75}
          onPress={() => {

            setShowProfile(
              false
            );

            router.push(
              "/notifications"
            );

          }}
        >

          <Bell
            size={18}
            color="#263041"
          />

          {unreadCount >
            0 && (
            <View
              style={
                styles.badge
              }
            >
              <Text
                style={
                  styles.badgeText
                }
              >
                {unreadCount >
                99
                  ? "99+"
                  : unreadCount}
              </Text>
            </View>
          )}

        </TouchableOpacity>

      </View>


      <View
        style={
          styles.searchBox
        }
      >

        <Search
          size={17}
          color="#94A3B8"
        />

        <TextInput
          placeholder="Search..."
          placeholderTextColor="#9AA4B5"
          style={
            styles.input
          }
        />

      </View>


      <TouchableOpacity
        style={
          styles.profileButton
        }
        activeOpacity={0.78}
        onPress={() => {

          setShowProfile(
            !showProfile
          );

        }}
      >

        <UserAvatar
          name={
            currentUser
              ?.full_name
          }
          avatarUrl={
            currentUser
              ?.avatar_url
          }
          style={
            styles.avatar
          }
          textStyle={
            styles.avatarText
          }
        />

        <View
          style={
            styles.profileCopy
          }
        >

          <Text
            numberOfLines={1}
            style={
              styles.name
            }
          >
            {
              currentUser
                ?.full_name ||
              "Therapist"
            }
          </Text>

          <Text
            style={
              styles.role
            }
          >
            Therapist
          </Text>

        </View>

        <ChevronDown
          size={16}
          color="#4B5563"
        />

      </TouchableOpacity>


      <Text
        style={
          styles.description
        }
      >
        Monitor your children's cognitive assessments in one place.
      </Text>


      {showProfile &&
        <ProfileMenu />
      }

    </View>

  );

}


const styles =
  StyleSheet.create({

    container: {
      width:
        "100%",

      alignSelf:
        "stretch",

      backgroundColor:
        "#F7F8FC",

      paddingHorizontal:
        16,

      paddingTop:
        8,

      paddingBottom:
        8,

      marginBottom:
        12,
    },


    top: {
      width:
        "100%",

      flexDirection:
        "row",

      alignItems:
        "center",

      marginBottom:
        11,
    },


    menuButton: {
      width:
        40,

      height:
        40,

      flexShrink:
        0,

      backgroundColor:
        "#FFFFFF",

      borderRadius:
        13,

      justifyContent:
        "center",

      alignItems:
        "center",

      borderWidth:
        1,

      borderColor:
        "#E9ECF3",
    },


    titleContainer: {
      flex:
        1,

      minWidth:
        0,

      marginHorizontal:
        12,
    },


    date: {
      fontSize:
        10,

      color:
        "#94A3B8",
    },


    heading: {
      marginTop:
        1,

      fontSize:
        23,

      lineHeight:
        28,

      fontWeight:
        "700",

      color:
        "#1F2937",
    },


    iconButton: {
      width:
        40,

      height:
        40,

      flexShrink:
        0,

      borderRadius:
        13,

      backgroundColor:
        "#FFFFFF",

      justifyContent:
        "center",

      alignItems:
        "center",

      borderWidth:
        1,

      borderColor:
        "#E9ECF3",
    },


    badge: {
      position:
        "absolute",

      top:
        -5,

      right:
        -5,

      minWidth:
        18,

      height:
        18,

      paddingHorizontal:
        4,

      borderRadius:
        9,

      backgroundColor:
        "#EF4444",

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth:
        2,

      borderColor:
        "#F7F8FC",
    },


    badgeText: {
      color:
        "#FFFFFF",

      fontSize:
        9,

      fontWeight:
        "800",
    },


    searchBox: {
      width:
        "100%",

      height:
        44,

      backgroundColor:
        "#FFFFFF",

      borderRadius:
        14,

      borderWidth:
        1,

      borderColor:
        "#E9ECF3",

      flexDirection:
        "row",

      alignItems:
        "center",

      paddingHorizontal:
        14,

      gap:
        9,
    },


    input: {
      flex:
        1,

      minWidth:
        0,

      height:
        "100%",

      fontSize:
        13,

      color:
        "#334155",

      paddingVertical:
        0,
    },


    profileButton: {
      width:
        "100%",

      marginTop:
        10,

      minHeight:
        52,

      backgroundColor:
        "#FFFFFF",

      borderRadius:
        14,

      borderWidth:
        1,

      borderColor:
        "#E9ECF3",

      flexDirection:
        "row",

      alignItems:
        "center",

      paddingHorizontal:
        10,

      paddingVertical:
        7,

      gap:
        10,
    },


    avatar: {
      width:
        38,

      height:
        38,

      borderRadius:
        11,

      flexShrink:
        0,
    },


    avatarText: {
      color:
        "#7566EB",

      fontSize:
        10,

      fontWeight:
        "800",
    },


    profileCopy: {
      minWidth:
        0,

      flex:
        1,
    },


    name: {
      fontSize:
        13,

      lineHeight:
        17,

      fontWeight:
        "700",

      color:
        "#1F2937",
    },


    role: {
      marginTop:
        1,

      fontSize:
        10,

      color:
        "#64748B",
    },


    description: {
      marginTop:
        10,

      marginBottom:
        5,

      paddingHorizontal:
        1,

      color:
        "#64748B",

      fontSize:
        11.5,

      lineHeight:
        17,
    },

  });
