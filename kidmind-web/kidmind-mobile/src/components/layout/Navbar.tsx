import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  Bell,
  ChevronDown,
  Menu,
  Stethoscope,
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


  const loadUnreadCount =
    useCallback(
      async () => {

        try {

          const count =
            await getUnreadNotificationCount();


          setUnreadCount(
            count
          );

        } catch (
          error
        ) {

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


        return undefined;

      },
      [
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


  return (

    <View
      style={
        styles.container
      }
    >

      <TouchableOpacity
        onPress={
          onMenuPress
        }
        activeOpacity={
          0.75
        }
        style={
          styles.menuButton
        }
      >

        <Menu
          size={20}
          color="#757991"
        />

      </TouchableOpacity>


      <View
        style={
          styles.identity
        }
      >

        <Text
          style={
            styles.portalLabel
          }
          numberOfLines={
            1
          }
        >
          KidMind Therapist Portal
        </Text>


        <Text
          style={
            styles.portalTitle
          }
          numberOfLines={
            1
          }
        >
          Therapist
        </Text>

      </View>


      <View
        style={
          styles.actions
        }
      >

        <TouchableOpacity
          style={
            styles.notificationButton
          }
          activeOpacity={
            0.75
          }
          onPress={() => {

            setShowProfile(
              false
            );


            router.push(
              "/notifications" as never
            );

          }}
        >

          <Bell
            size={19}
            color="#757991"
          />


          {
            unreadCount >
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

                  {
                    unreadCount >
                    99
                      ? "99+"
                      : unreadCount
                  }

                </Text>

              </View>

            )
          }

        </TouchableOpacity>


        <View
          style={
            styles.profileWrapper
          }
        >

          <TouchableOpacity
            activeOpacity={
              0.75
            }
            style={
              styles.profileButton
            }
            onPress={() => {

              setShowProfile(
                previous =>
                  !previous
              );

            }}
          >

            <View
              style={
                styles.profileIcon
              }
            >

              <Stethoscope
                size={16}
                color="#7566EB"
              />

            </View>


            <ChevronDown
              size={15}
              color="#8A8EA5"
              style={{
                transform: [
                  {
                    rotate:
                      showProfile
                        ? "180deg"
                        : "0deg",
                  },
                ],
              }}
            />

          </TouchableOpacity>


          {
            showProfile && (

              <ProfileMenu />

            )
          }

        </View>

      </View>

    </View>

  );

}


const styles =
  StyleSheet.create({

    container: {

      minHeight:
        68,

      paddingHorizontal:
        18,

      flexDirection:
        "row",

      alignItems:
        "center",

      backgroundColor:
        "#FFFFFF",

      borderBottomWidth:
        1,

      borderBottomColor:
        "#EEEFF5",

      shadowColor:
        "#44446E",

      shadowOffset: {
        width: 0,
        height: 3,
      },

      shadowOpacity:
        0.025,

      shadowRadius:
        7,

      elevation:
        1,

      zIndex:
        20,

    },


    menuButton: {

      width:
        40,

      height:
        40,

      flexShrink:
        0,

      borderRadius:
        13,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#FFFFFF",

      borderWidth:
        1,

      borderColor:
        "#ECECF4",

    },


    identity: {

      flex:
        1,

      minWidth:
        0,

      marginLeft:
        12,

      justifyContent:
        "center",

    },


    portalLabel: {

      color:
        "#A0A3B5",

      fontSize:
        9.5,

      lineHeight:
        13,

    },


    portalTitle: {

      marginTop:
        1,

      color:
        "#343654",

      fontSize:
        13,

      lineHeight:
        18,

      fontWeight:
        "700",

    },


    actions: {

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        8,

      marginLeft:
        8,

    },


    notificationButton: {

      width:
        40,

      height:
        40,

      position:
        "relative",

      borderRadius:
        13,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#FFFFFF",

      borderWidth:
        1,

      borderColor:
        "#ECECF4",

    },


    badge: {

      position:
        "absolute",

      top:
        -5,

      right:
        -5,

      minWidth:
        19,

      height:
        19,

      paddingHorizontal:
        4,

      borderRadius:
        10,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#7C6CFF",

      borderWidth:
        2,

      borderColor:
        "#FFFFFF",

    },


    badgeText: {

      color:
        "#FFFFFF",

      fontSize:
        8,

      fontWeight:
        "800",

      lineHeight:
        10,

    },


    profileWrapper: {

      position:
        "relative",

      zIndex:
        50,

    },


    profileButton: {

      height:
        40,

      minWidth:
        68,

      paddingHorizontal:
        7,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        5,

      borderRadius:
        13,

      backgroundColor:
        "#FFFFFF",

      borderWidth:
        1,

      borderColor:
        "#ECECF4",

    },


    profileIcon: {

      width:
        27,

      height:
        27,

      borderRadius:
        9,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#F0EDFF",

    },

  });