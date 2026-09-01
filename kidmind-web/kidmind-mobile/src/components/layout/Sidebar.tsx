import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  Bell,
  Bot,
  CalendarDays,
  FileText,
  Gamepad2,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Settings,
  Users,
  X,
} from "lucide-react-native";

import {
  router,
} from "expo-router";

import {
  clearAuthSession,
} from "@/api/authApi";


type MenuItem = {
  title: string;
  icon: any;

  path:
    | "/"
    | "/children"
    | "/sessions"
    | "/games"
    | "/reports"
    | "/ai"
    | "/chat"
    | "/notifications"
    | "/settings";
};


const menu: MenuItem[] = [

  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/",
  },

  {
    title: "Children",
    icon: Users,
    path: "/children",
  },

  {
    title: "Sessions",
    icon: CalendarDays,
    path: "/sessions",
  },

  {
    title: "Game Builder",
    icon: Gamepad2,
    path: "/games",
  },

  {
    title: "Reports",
    icon: FileText,
    path: "/reports",
  },

  {
    title: "AI Assistant",
    icon: Bot,
    path: "/ai",
  },

  {
    title: "Therapist Chat",
    icon: MessageCircle,
    path: "/chat",
  },

  {
    title: "Notifications",
    icon: Bell,
    path: "/notifications",
  },

  {
    title: "Settings",
    icon: Settings,
    path: "/settings",
  },

];


const Sidebar = ({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) => {

  const active =
    "Dashboard";


  const handleLogout =
    () => {

      /*
       * امسح معلومات تسجيل الدخول
       */
      clearAuthSession();


      /*
       * اغلق السايد بار
       */
      onClose();


      /*
       * ارجع لصفحة تسجيل الدخول.
       *
       * نستخدم replace وليس push
       * حتى لا يستطيع المستخدم الرجوع
       * للـ Dashboard بزر Back.
       */
      router.replace(
        "/login" as never
      );

    };


  if (!visible) {
    return null;
  }


  return (

    <View
      style={
        styles.container
      }
    >


      <TouchableOpacity
        style={
          styles.closeButton
        }
        onPress={
          onClose
        }
        activeOpacity={
          0.8
        }
      >

        <X
          size={24}
          color="#55586C"
        />

      </TouchableOpacity>


      <View
        style={
          styles.logoContainer
        }
      >

        <Image
          source={
            require(
              "../../../assets/images/logo.png"
            )
          }
          style={
            styles.logo
          }
          resizeMode="contain"
        />

      </View>


      <ScrollView
        style={
          styles.menu
        }
        showsVerticalScrollIndicator={
          false
        }
      >

        {
          menu.map(
            item => {

              const Icon =
                item.icon;

              const isActive =
                item.title ===
                active;


              return (

                <TouchableOpacity
                  key={
                    item.title
                  }
                  activeOpacity={
                    0.8
                  }
                  style={[
                    styles.menuItem,

                    isActive &&
                    styles.activeItem,
                  ]}
                  onPress={() => {

                    onClose();

                    router.push(
                      item.path as any
                    );

                  }}
                >

                  {
                    isActive && (

                      <View
                        style={
                          styles.activeLine
                        }
                      />

                    )
                  }


                  <Icon
                    size={19}
                    color={
                      isActive
                        ? "#7C6CFF"
                        : "#8E91A8"
                    }
                  />


                  <Text
                    style={[
                      styles.menuText,

                      isActive &&
                      styles.activeText,
                    ]}
                  >
                    {
                      item.title
                    }
                  </Text>

                </TouchableOpacity>

              );

            }
          )
        }

      </ScrollView>


      <TouchableOpacity
        style={
          styles.logout
        }
        activeOpacity={
          0.8
        }
        onPress={
          handleLogout
        }
      >

        <LogOut
          size={19}
          color="#EF4444"
        />


        <Text
          style={
            styles.logoutText
          }
        >
          Logout
        </Text>

      </TouchableOpacity>

    </View>

  );

};


const styles =
  StyleSheet.create({

    container: {

      position:
        "absolute",

      left:
        0,

      top:
        0,

      bottom:
        0,

      width:
        270,

      backgroundColor:
        "#FFFFFF",

      borderRightWidth:
        1,

      borderColor:
        "#ECECF5",

      paddingHorizontal:
        20,

      paddingVertical:
        16,

      zIndex:
        100,

      elevation:
        20,

    },


    closeButton: {

      position:
        "absolute",

      right:
        15,

      top:
        15,

      width:
        40,

      height:
        40,

      borderRadius:
        12,

      backgroundColor:
        "#F7F8FC",

      justifyContent:
        "center",

      alignItems:
        "center",

      zIndex:
        10,

    },


    logoContainer: {

      alignItems:
        "center",

      marginBottom:
        20,

    },


    logo: {

      width:
        180,

      height:
        180,

    },


    menu: {

      flex:
        1,

    },


    menuItem: {

      height:
        44,

      borderRadius:
        16,

      paddingHorizontal:
        16,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        12,

      marginBottom:
        4,

    },


    activeItem: {

      backgroundColor:
        "#F2EEFF",

    },


    activeLine: {

      position:
        "absolute",

      left:
        0,

      top:
        8,

      bottom:
        8,

      width:
        4,

      borderRadius:
        10,

      backgroundColor:
        "#7C6CFF",

    },


    menuText: {

      fontSize:
        14,

      fontWeight:
        "500",

      color:
        "#8E91A8",

    },


    activeText: {

      color:
        "#7C6CFF",

      fontWeight:
        "700",

    },


    logout: {

      height:
        46,

      borderRadius:
        16,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        12,

      paddingHorizontal:
        16,

      marginTop:
        12,

      backgroundColor:
        "#FFF7F7",

    },


    logoutText: {

      color:
        "#EF4444",

      fontSize:
        14,

      fontWeight:
        "600",

    },

  });


export default Sidebar;