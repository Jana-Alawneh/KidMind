import {
  Image,
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
        >
          <Menu
            size={24}
          />
        </TouchableOpacity>


        <View
          style={
            styles.titleContainer
          }
        >

          <Text
            style={
              styles.date
            }
          >
            {today}
          </Text>

          <Text
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
            size={20}
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
          size={18}
          color="#94A3B8"
        />

        <TextInput
          placeholder="Search..."
          style={
            styles.input
          }
        />

      </View>


      <TouchableOpacity
        style={
          styles.profileButton
        }
        onPress={() => {

          setShowProfile(
            !showProfile
          );

        }}
      >

        <Image
          source={{
            uri:
              "https://i.pravatar.cc/100",
          }}
          style={
            styles.avatar
          }
        />

        <View>

          <Text
            style={
              styles.name
            }
          >
            Dr. Ahmad
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
          size={18}
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

      backgroundColor:
        "#F7F8FC",

      marginBottom:
        20,

    },


    top: {

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      marginBottom:
        15,

    },


    menuButton: {

      width:
        45,

      height:
        45,

      backgroundColor:
        "#FFFFFF",

      borderRadius:
        16,

      justifyContent:
        "center",

      alignItems:
        "center",

      borderWidth:
        1,

      borderColor:
        "#ECECF5",

    },


    titleContainer: {

      flex:
        1,

      marginLeft:
        15,

    },


    date: {

      fontSize:
        12,

      color:
        "#94A3B8",

    },


    heading: {

      fontSize:
        32,

      fontWeight:
        "700",

      marginTop:
        3,

      color:
        "#1F2937",

    },


    description: {

      color:
        "#64748B",

      marginTop:
        15,

      marginBottom:
        10,

      fontSize:
        14,

    },


    iconButton: {

      width:
        45,

      height:
        45,

      borderRadius:
        16,

      backgroundColor:
        "#FFFFFF",

      justifyContent:
        "center",

      alignItems:
        "center",

      borderWidth:
        1,

      borderColor:
        "#ECECF5",

    },


    badge: {

      position:
        "absolute",

      top:
        -5,

      right:
        -5,

      minWidth:
        20,

      height:
        20,

      paddingHorizontal:
        5,

      borderRadius:
        10,

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

      height:
        48,

      backgroundColor:
        "#FFFFFF",

      borderRadius:
        16,

      borderWidth:
        1,

      borderColor:
        "#ECECF5",

      flexDirection:
        "row",

      alignItems:
        "center",

      paddingHorizontal:
        15,

      gap:
        10,

    },


    input: {

      flex:
        1,

    },


    profileButton: {

      marginTop:
        15,

      height:
        60,

      backgroundColor:
        "#FFFFFF",

      borderRadius:
        16,

      borderWidth:
        1,

      borderColor:
        "#ECECF5",

      flexDirection:
        "row",

      alignItems:
        "center",

      paddingHorizontal:
        10,

      gap:
        12,

    },


    avatar: {

      width:
        44,

      height:
        44,

      borderRadius:
        12,

    },


    name: {

      fontWeight:
        "600",

    },


    role: {

      fontSize:
        12,

      color:
        "#64748B",

    },

  });
