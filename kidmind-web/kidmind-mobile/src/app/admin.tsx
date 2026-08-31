


import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  ReactNode,
} from "react";

import {
  router,
} from "expo-router";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  Bell,
  BrainCircuit,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Link2,
  LogOut,
  Menu,
  MessageCircle,
  Settings,
  ShieldCheck,
  UserRound,
  UserRoundCog,
  Users,
  X,
} from "lucide-react-native";

import {
  authRequest,
  clearAuthSession,
  fetchCurrentUser,
  type AuthUser,
} from "@/api/authApi";

import {
  getUnreadNotificationCount,
} from "@/api/notificationsApi";

import AdminChildren from "@/components/admin/AdminChildren";
import AdminParents from "@/components/admin/AdminParents";
import AdminTherapists from "@/components/admin/AdminTherapists";
import AdminAssignments from "@/components/admin/AdminAssignments";
import AdminReports from "@/components/admin/AdminReports";
import AdminAIInsights from "@/components/admin/AdminAIInsights";
import MobileSettings from "@/components/settings/MobileSettings";
import MobileChat from "@/components/chat/MobileChat";
import UserAvatar from "@/components/common/UserAvatar";
import MobileNotificationsContent from "@/components/notifications/MobileNotificationsContent";


type UserRole =
  | "admin"
  | "therapist"
  | "parent";


type UserItem = {
  id: number;
  full_name: string;
  email: string;
  role: UserRole;
  is_active:
    | number
    | boolean;
  is_online?:
    | number
    | boolean
    | null;
  avatar_url?:
    | string
    | null;
  created_at?:
    | string
    | null;
};


type ChildItem = {
  id: number;
  full_name: string;
  region?:
    | string
    | null;
  parent_name?:
    | string
    | null;
  current_cognitive_score?:
    | number
    | string
    | null;
  assessment_count?:
    | number
    | string
    | null;
  created_at?:
    | string
    | null;
};


type AssignmentItem = {
  child_id: number;
  user_id: number;
  role?:
    | UserRole
    | null;
  link_type?:
    | "parent"
    | "therapist"
    | null;
  user_name?:
    | string
    | null;
  user_email?:
    | string
    | null;
  is_active?:
    | number
    | boolean
    | null;
};


type SessionItem = {
  id: number;
  status?:
    | string
    | null;
};


type SectionKey =
  | "overview"
  | "children"
  | "parents"
  | "therapists"
  | "assignments"
  | "reports"
  | "ai-insights"
  | "messages"
  | "notifications"
  | "feedback"
  | "settings";


type MenuItem = {
  key:
    SectionKey;
  title:
    string;
  icon:
    typeof LayoutDashboard;
};


const menu:
  MenuItem[] = [
    {
      key:
        "overview",
      title:
        "Overview",
      icon:
        LayoutDashboard,
    },

    {
      key:
        "children",
      title:
        "Children",
      icon:
        Users,
    },

    {
      key:
        "parents",
      title:
        "Parents",
      icon:
        UserRound,
    },

    {
      key:
        "therapists",
      title:
        "Therapists",
      icon:
        UserRoundCog,
    },

    {
      key:
        "assignments",
      title:
        "Care Coordination",
      icon:
        Link2,
    },

    {
      key:
        "reports",
      title:
        "Reports",
      icon:
        FileText,
    },

    {
      key:
        "ai-insights",
      title:
        "AI Insights",
      icon:
        BrainCircuit,
    },

    {
      key:
        "messages",
      title:
        "Messages",
      icon:
        MessageCircle,
    },

    {
      key:
        "notifications",
      title:
        "Notifications",
      icon:
        Bell,
    },

    {
      key:
        "feedback",
      title:
        "Feedback",
      icon:
        ClipboardList,
    },

    {
      key:
        "settings",
      title:
        "Settings",
      icon:
        Settings,
    },
  ];


const roleLabel:
  Record<
    UserRole,
    string
  > = {
    admin:
      "Admin",

    therapist:
      "Therapist",

    parent:
      "Parent",
  };


export default function AdminDashboard() {

  const [
    activeSection,
    setActiveSection,
  ] =
    useState<SectionKey>(
      "overview"
    );


  const [
    sidebarVisible,
    setSidebarVisible,
  ] =
    useState(false);


  const [
    currentUser,
    setCurrentUser,
  ] =
    useState<
      AuthUser | null
    >(
      null
    );


  const [
    users,
    setUsers,
  ] =
    useState<UserItem[]>(
      []
    );


  const [
    children,
    setChildren,
  ] =
    useState<ChildItem[]>(
      []
    );


  const [
    sessions,
    setSessions,
  ] =
    useState<SessionItem[]>(
      []
    );


  const [
    assignments,
    setAssignments,
  ] =
    useState<AssignmentItem[]>(
      []
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
    unreadCount,
    setUnreadCount,
  ] =
    useState(0);


  const loadDashboard =
    async () => {

      try {

        setLoading(
          true
        );

        setError(
          ""
        );


        const user =
          await fetchCurrentUser();


        if (
          user.role !==
          "admin"
        ) {

          clearAuthSession();

          router.replace(
            "/login"
          );

          return;

        }


        setCurrentUser(
          user
        );


        const results =
          await Promise.allSettled([

            authRequest<
              UserItem[]
            >(
              "/users"
            ),

            authRequest<
              ChildItem[]
            >(
              "/children"
            ),

            authRequest<
              SessionItem[]
            >(
              "/sessions"
            ),

            authRequest<
              AssignmentItem[]
            >(
              "/users/assignments"
            ),

          ]);


        const [
          usersResult,
          childrenResult,
          sessionsResult,
          assignmentsResult,
        ] =
          results;


        if (
          usersResult.status ===
          "fulfilled"
        ) {

          setUsers(
            Array.isArray(
              usersResult.value
            )
              ? usersResult.value
              : []
          );

        } else {

          setUsers(
            []
          );

        }


        if (
          childrenResult.status ===
          "fulfilled"
        ) {

          setChildren(
            Array.isArray(
              childrenResult.value
            )
              ? childrenResult.value
              : []
          );

        } else {

          setChildren(
            []
          );

        }


        if (
          sessionsResult.status ===
          "fulfilled"
        ) {

          setSessions(
            Array.isArray(
              sessionsResult.value
            )
              ? sessionsResult.value
              : []
          );

        } else {

          setSessions(
            []
          );

        }


        if (
          assignmentsResult.status ===
          "fulfilled"
        ) {

          setAssignments(
            Array.isArray(
              assignmentsResult.value
            )
              ? assignmentsResult.value
              : []
          );

        } else {

          setAssignments(
            []
          );

        }


        if (
          results.some(
            result =>
              result.status ===
              "rejected"
          )
        ) {

          setError(
            "Some admin dashboard data could not be loaded."
          );

        }

      } catch (
        requestError
      ) {

        console.error(
          requestError
        );

        setError(
          "Unable to load admin dashboard data."
        );

      } finally {

        setLoading(
          false
        );

      }

    };


  useEffect(
    () => {

      loadDashboard();

    },
    []
  );


  useEffect(
    () => {

      if (
        activeSection ===
        "overview"
      ) {

        loadDashboard();

      }

    },
    [
      activeSection,
    ]
  );


  useEffect(
    () => {

      if (
        activeSection !==
        "overview"
      ) {
        return;
      }

      let active =
        true;

      const refreshUserPresence =
        async () => {

          try {

            const data =
              await authRequest<
                UserItem[]
              >(
                "/users"
              );

            if (
              active
            ) {
              setUsers(
                Array.isArray(
                  data
                )
                  ? data
                  : []
              );
            }

          } catch (
            requestError
          ) {

            console.error(
              "Unable to refresh user presence:",
              requestError
            );

          }

        };

      const interval =
        setInterval(
          refreshUserPresence,
          30000
        );

      return () => {

        active =
          false;

        clearInterval(
          interval
        );

      };

    },
    [
      activeSection,
    ]
  );


  useEffect(
    () => {

      let active =
        true;

      const refreshUnreadCount =
        async () => {

          try {

            const count =
              await getUnreadNotificationCount();

            if (
              active
            ) {
              setUnreadCount(
                count
              );
            }

          } catch (
            requestError
          ) {

            console.error(
              "Unable to load notification count:",
              requestError
            );

          }

        };

      refreshUnreadCount();

      const interval =
        setInterval(
          refreshUnreadCount,
          30000
        );

      return () => {

        active =
          false;

        clearInterval(
          interval
        );

      };

    },
    []
  );


  const parents =
    useMemo(
      () =>
        users.filter(
          user =>
            user.role ===
            "parent"
        ),
      [
        users,
      ]
    );


  const therapists =
    useMemo(
      () =>
        users.filter(
          user =>
            user.role ===
            "therapist"
        ),
      [
        users,
      ]
    );


  const completedAssessments =
    useMemo(
      () =>
        sessions.filter(
          session => {

            const status =
              String(
                session.status ||
                ""
              ).toLowerCase();


            return (
              status ===
                "completed" ||
              status ===
                "ended"
            );

          }
        ).length,
      [
        sessions,
      ]
    );


  const parentByChild =
    useMemo(
      () => {

        const map:
          Record<
            number,
            AssignmentItem
          > = {};


        assignments.forEach(
          assignment => {

            const isParent =
              assignment.link_type ===
                "parent" ||
              assignment.role ===
                "parent";


            if (!isParent) {
              return;
            }


            const childId =
              Number(
                assignment.child_id
              );


            if (
              !map[
                childId
              ]
            ) {

              map[
                childId
              ] =
                assignment;

            }

          }
        );


        return map;

      },
      [
        assignments,
      ]
    );


  const recentUsers =
    useMemo(
      () => {

        return [
          ...users,
        ]
          .sort(
            (
              first,
              second
            ) => {

              const firstDate =
                new Date(
                  first.created_at ||
                  0
                ).getTime();


              const secondDate =
                new Date(
                  second.created_at ||
                  0
                ).getTime();


              return (
                secondDate -
                firstDate
              );

            }
          )
          .slice(
            0,
            5
          );

      },
      [
        users,
      ]
    );


  const recentChildren =
    useMemo(
      () => {

        return [
          ...children,
        ]
          .sort(
            (
              first,
              second
            ) => {

              const firstDate =
                first.created_at
                  ? new Date(
                      first.created_at
                    ).getTime()
                  : Number(
                      first.id ||
                      0
                    );


              const secondDate =
                second.created_at
                  ? new Date(
                      second.created_at
                    ).getTime()
                  : Number(
                      second.id ||
                      0
                    );


              return (
                secondDate -
                firstDate
              );

            }
          )
          .slice(
            0,
            5
          );

      },
      [
        children,
      ]
    );


  const handleLogout =
    () => {

      clearAuthSession();

      router.replace(
        "/login"
      );

    };


  const selectSection =
    (
      section:
        SectionKey
    ) => {

      setActiveSection(
        section
      );

      setSidebarVisible(
        false
      );

    };


  const stats = [

    {
      title:
        "Children",
      value:
        children.length,
      subtitle:
        "Registered children",
      icon:
        Users,
      type:
        "purple",
    },

    {
      title:
        "Parents",
      value:
        parents.length,
      subtitle:
        "Parent accounts",
      icon:
        UserRound,
      type:
        "pink",
    },

    {
      title:
        "Therapists",
      value:
        therapists.length,
      subtitle:
        "Therapist accounts",
      icon:
        UserRoundCog,
      type:
        "blue",
    },

    {
      title:
        "Assessments",
      value:
        completedAssessments,
      subtitle:
        "Completed sessions",
      icon:
        FileText,
      type:
        "green",
    },

  ];


  const renderOverview =
    () => {

      return (

        <>

          <View
            style={
              styles.welcomeCard
            }
          >

            <View
              style={
                styles.welcomeText
              }
            >

              <Text
                style={
                  styles.eyebrow
                }
              >
                ADMIN CONTROL CENTER
              </Text>


              <Text
                style={
                  styles.welcomeTitle
                }
              >
                Welcome back,{" "}
                {
                  currentUser?.full_name ||
                  "Admin"
                }
              </Text>


              <Text
                style={
                  styles.welcomeSubtitle
                }
              >
                Monitor KidMind users,
                children, assessments,
                and system activity from
                one place.
              </Text>

            </View>


            <View
              style={
                styles.welcomeIcon
              }
            >

              <ShieldCheck
                size={31}
                color="#FFFFFF"
              />

            </View>

          </View>


          {
            Boolean(
              error
            ) && (

              <View
                style={
                  styles.errorBox
                }
              >

                <Text
                  style={
                    styles.errorText
                  }
                >
                  {error}
                </Text>

              </View>

            )
          }


          <View
            style={
              styles.statsGrid
            }
          >

            {
              stats.map(
                item => {

                  const Icon =
                    item.icon;


                  return (

                    <View
                      key={
                        item.title
                      }
                      style={
                        styles.statCard
                      }
                    >

                      <View
                        style={[

                          styles.statIcon,

                          item.type ===
                            "purple" &&
                            styles.statPurple,

                          item.type ===
                            "pink" &&
                            styles.statPink,

                          item.type ===
                            "blue" &&
                            styles.statBlue,

                          item.type ===
                            "green" &&
                            styles.statGreen,

                        ]}
                      >

                        <Icon
                          size={21}
                          color={
                            item.type ===
                            "purple"
                              ? "#7566EB"
                              : item.type ===
                                  "pink"
                                ? "#D867B4"
                                : item.type ===
                                    "blue"
                                  ? "#5595DD"
                                  : "#48A784"
                          }
                        />

                      </View>


                      <Text
                        style={
                          styles.statLabel
                        }
                      >
                        {item.title}
                      </Text>


                      <Text
                        style={
                          styles.statValue
                        }
                      >
                        {
                          loading
                            ? "—"
                            : item.value
                        }
                      </Text>


                      <Text
                        style={
                          styles.statSubtitle
                        }
                      >
                        {
                          item.subtitle
                        }
                      </Text>

                    </View>

                  );

                }
              )
            }

          </View>


          <View
            style={
              styles.panel
            }
          >

            <View
              style={
                styles.panelHeading
              }
            >

              <Text
                style={
                  styles.panelTitle
                }
              >
                Recent Users
              </Text>


              <Text
                style={
                  styles.panelSubtitle
                }
              >
                Latest accounts added
                to KidMind
              </Text>

            </View>


            {
              loading
                ? (

                  <LoadingBlock
                    text="Loading users..."
                  />

                )
                : recentUsers.length ===
                  0
                  ? (

                    <EmptyBlock
                      text="No users yet."
                    />

                  )
                  : (

                    recentUsers.map(
                      user => (

                        <View
                          key={
                            user.id
                          }
                          style={
                            styles.userRow
                          }
                        >

                          <UserAvatar
                            name={
                              user.full_name
                            }
                            avatarUrl={
                              user.avatar_url
                            }
                            style={
                              styles.userAvatar
                            }
                            textStyle={
                              styles.userAvatarText
                            }
                          />


                          <View
                            style={
                              styles.userMain
                            }
                          >

                            <Text
                              numberOfLines={
                                1
                              }
                              style={
                                styles.rowName
                              }
                            >
                              {
                                user.full_name
                              }
                            </Text>


                            <Text
                              numberOfLines={
                                1
                              }
                              style={
                                styles.rowSecondary
                              }
                            >
                              {
                                user.email
                              }
                            </Text>

                          </View>


                          <View
                            style={[
                              styles.rolePill,

                              user.role ===
                                "admin" &&
                                styles.roleAdmin,

                              user.role ===
                                "therapist" &&
                                styles.roleTherapist,

                              user.role ===
                                "parent" &&
                                styles.roleParent,
                            ]}
                          >

                            <Text
                              style={[
                                styles.roleText,

                                user.role ===
                                  "admin" &&
                                  styles.roleAdminText,

                                user.role ===
                                  "therapist" &&
                                  styles.roleTherapistText,

                                user.role ===
                                  "parent" &&
                                  styles.roleParentText,
                              ]}
                            >
                              {
                                roleLabel[
                                  user.role
                                ] ||
                                user.role
                              }
                            </Text>

                          </View>


                          <View
                            style={[
                              styles.statusDot,

                              user.is_online ===
                                true ||
                              Number(
                                user.is_online
                              ) === 1
                                ? styles.statusActive
                                : styles.statusInactive,
                            ]}
                          />

                        </View>

                      )
                    )

                  )
            }

          </View>


          <View
            style={
              styles.panel
            }
          >

            <View
              style={
                styles.panelHeading
              }
            >

              <Text
                style={
                  styles.panelTitle
                }
              >
                Recent Children
              </Text>


              <Text
                style={
                  styles.panelSubtitle
                }
              >
                Latest registered
                children
              </Text>

            </View>


            {
              loading
                ? (

                  <LoadingBlock
                    text="Loading children..."
                  />

                )
                : recentChildren.length ===
                  0
                  ? (

                    <EmptyBlock
                      text="No children yet."
                    />

                  )
                  : (

                    recentChildren.map(
                      child => {

                        const parent =
                          parentByChild[
                            Number(
                              child.id
                            )
                          ];


                        const scoreValue =
                          child.current_cognitive_score ===
                            null ||
                          child.current_cognitive_score ===
                            undefined ||
                          child.current_cognitive_score ===
                            ""
                            ? null
                            : Number(
                                child.current_cognitive_score
                              );


                        const score =
                          scoreValue !==
                            null &&
                          Number.isFinite(
                            scoreValue
                          )
                            ? Math.round(
                                scoreValue
                              )
                            : null;


                        return (

                          <View
                            key={
                              child.id
                            }
                            style={
                              styles.childRow
                            }
                          >

                            <View
                              style={
                                styles.childAvatar
                              }
                            >

                              <Text
                                style={
                                  styles.childAvatarText
                                }
                              >
                                {
                                  String(
                                    child.full_name ||
                                    "C"
                                  )
                                    .charAt(
                                      0
                                    )
                                    .toUpperCase()
                                }
                              </Text>

                            </View>


                            <View
                              style={
                                styles.childMain
                              }
                            >

                              <Text
                                numberOfLines={
                                  1
                                }
                                style={
                                  styles.rowName
                                }
                              >
                                {
                                  child.full_name
                                }
                              </Text>


                              <Text
                                numberOfLines={
                                  1
                                }
                                style={
                                  styles.rowSecondary
                                }
                              >
                                {
                                  child.region ||
                                  "No region"
                                }

                                {
                                  score !==
                                  null
                                    ? ` • ${score}%`
                                    : ""
                                }
                              </Text>

                            </View>


                            <View
                              style={
                                styles.childMeta
                              }
                            >

                              <Text
                                style={
                                  styles.childMetaLabel
                                }
                              >
                                Parent
                              </Text>


                              <Text
                                numberOfLines={
                                  1
                                }
                                style={
                                  styles.childMetaValue
                                }
                              >
                                {
                                  parent
                                    ?.user_name ||
                                  "—"
                                }
                              </Text>

                            </View>

                          </View>

                        );

                      }
                    )

                  )
            }

          </View>


          <View
            style={[
              styles.panel,
              styles.managementPanel,
            ]}
          >

            <View
              style={
                styles.panelHeading
              }
            >

              <Text
                style={
                  styles.panelTitle
                }
              >
                Administration
              </Text>


              <Text
                style={
                  styles.panelSubtitle
                }
              >
                Manage the main areas
                of the KidMind system
              </Text>

            </View>


            <View
              style={
                styles.managementGrid
              }
            >

              <ManagementButton
                icon={
                  <Users
                    size={22}
                    color="#7566E8"
                  />
                }
                title="Manage Children"
                subtitle="View children, results and care relationships"
                onPress={() =>
                  selectSection(
                    "children"
                  )
                }
              />


              <ManagementButton
                icon={
                  <UserRound
                    size={22}
                    color="#7566E8"
                  />
                }
                title="Manage Parents"
                subtitle="Create and manage parent accounts"
                onPress={() =>
                  selectSection(
                    "parents"
                  )
                }
              />


              <ManagementButton
                icon={
                  <UserRoundCog
                    size={22}
                    color="#7566E8"
                  />
                }
                title="Manage Therapists"
                subtitle="Review therapists and assigned children"
                onPress={() =>
                  selectSection(
                    "therapists"
                  )
                }
              />


              <ManagementButton
                icon={
                  <Link2
                    size={22}
                    color="#7566E8"
                  />
                }
                title="Care Coordination"
                subtitle="Connect children with parents and therapists"
                onPress={() =>
                  selectSection(
                    "assignments"
                  )
                }
              />


              <ManagementButton
                icon={
                  <FileText
                    size={22}
                    color="#7566E8"
                  />
                }
                title="Reports"
                subtitle="Review assessment sessions and cognitive results"
                onPress={() =>
                  selectSection(
                    "reports"
                  )
                }
              />


              <ManagementButton
                icon={
                  <BrainCircuit
                    size={22}
                    color="#7566E8"
                  />
                }
                title="AI Insights"
                subtitle="Analyze platform statistics, trends and recommendations"
                onPress={() =>
                  selectSection(
                    "ai-insights"
                  )
                }
              />

            </View>

          </View>

        </>

      );

    };


  const renderPlaceholder =
    () => {

      const item =
        menu.find(
          menuItem =>
            menuItem.key ===
            activeSection
        );


      const Icon =
        item?.icon ||
        LayoutDashboard;


      return (

        <View
          style={
            styles.placeholder
          }
        >

          <View
            style={
              styles.placeholderIcon
            }
          >

            <Icon
              size={31}
              color="#7565E8"
            />

          </View>


          <Text
            style={
              styles.placeholderTitle
            }
          >
            {
              item?.title ||
              "Admin"
            }
          </Text>


          <Text
            style={
              styles.placeholderText
            }
          >
            We will build this
            administration module
            next.
          </Text>


          <Pressable
            style={
              styles.backButton
            }
            onPress={() =>
              selectSection(
                "overview"
              )
            }
          >

            <Text
              style={
                styles.backButtonText
              }
            >
              Back to Overview
            </Text>

          </Pressable>

        </View>

      );

    };


  const renderSection =
    () => {

      if (
        activeSection ===
        "overview"
      ) {
        return renderOverview();
      }


      if (
        activeSection ===
        "children"
      ) {
        return (
          <AdminChildren />
        );
      }


      if (
        activeSection ===
        "parents"
      ) {
        return (
          <AdminParents />
        );
      }


      if (
        activeSection ===
        "therapists"
      ) {
        return (
          <AdminTherapists />
        );
      }


      if (
        activeSection ===
        "assignments"
      ) {
        return (
          <AdminAssignments />
        );
      }


      if (
        activeSection ===
        "reports"
      ) {
        return (
          <AdminReports />
        );
      }


      if (
        activeSection ===
        "ai-insights"
      ) {
        return (
          <AdminAIInsights />
        );
      }


      if (
        activeSection ===
        "messages"
      ) {
        return (
          <MobileChat />
        );
      }


      if (
        activeSection ===
        "notifications"
      ) {
        return (
          <MobileNotificationsContent
            onUnreadCountChange={
              setUnreadCount
            }
            onNavigateSection={
              (section: string) => {

                const matched =
                  menu.find(
                    item =>
                      item.key ===
                      section
                  );

                if (
                  matched
                ) {
                  selectSection(
                    matched.key
                  );
                }

              }
            }
          />
        );
      }


      if (
        activeSection ===
        "settings"
      ) {
        return (
          <MobileSettings
            role="admin"
            onProfileUpdated={
              updatedUser =>
                setCurrentUser(
                  previous => ({
                    ...(previous || {}),
                    ...updatedUser,
                  }) as AuthUser
                )
            }
          />
        );
      }


      return renderPlaceholder();

    };


  return (

    <SafeAreaView
      style={
        styles.safeArea
      }
      edges={[
        "top",
      ]}
    >

      <View
        style={
          styles.page
        }
      >

        <View
          style={
            styles.header
          }
        >

          <Pressable
            style={
              styles.headerButton
            }
            onPress={() =>
              setSidebarVisible(
                true
              )
            }
          >

            <Menu
              size={21}
              color="#72768F"
            />

          </Pressable>


          <View
            style={
              styles.headerText
            }
          >

            <Text
              style={
                styles.headerLabel
              }
            >
              KidMind Administration
            </Text>


            <Text
              numberOfLines={
                1
              }
              style={
                styles.headerName
              }
            >
              {
                currentUser?.full_name ||
                "Administrator"
              }
            </Text>

          </View>


          <Pressable
            style={
              styles.headerButton
            }
            onPress={() =>
              selectSection(
                "notifications"
              )
            }
            accessibilityLabel="Open notifications"
          >

            <Bell
              size={20}
              color="#757991"
            />

            {
              unreadCount >
                0 && (
                <View
                  style={
                    styles.headerBadge
                  }
                >
                  <Text
                    style={
                      styles.headerBadgeText
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

          </Pressable>

        </View>


        {
          activeSection ===
          "messages"
            ? (
              <View
                style={
                  styles.chatContent
                }
              >
                <MobileChat />
              </View>
            )
            : (
              <ScrollView
                showsVerticalScrollIndicator={
                  false
                }
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={
                  styles.content
                }
              >

                {
                  renderSection()
                }

              </ScrollView>
            )
        }


        {
          sidebarVisible && (

            <View
              style={
                styles.sidebarOverlay
              }
            >

              <Pressable
                style={
                  styles.sidebarBackdrop
                }
                onPress={() =>
                  setSidebarVisible(
                    false
                  )
                }
              />


              <View
                style={
                  styles.sidebar
                }
              >

                <View
                  style={
                    styles.sidebarTop
                  }
                >

                  <Image
                    source={require(
                      "../../assets/images/logo.png"
                    )}
                    style={
                      styles.logo
                    }
                    resizeMode="contain"
                  />


                  <Pressable
                    style={
                      styles.closeButton
                    }
                    onPress={() =>
                      setSidebarVisible(
                        false
                      )
                    }
                  >

                    <X
                      size={20}
                      color="#777B92"
                    />

                  </Pressable>

                </View>


                <View
                  style={
                    styles.adminRole
                  }
                >

                  <View
                    style={
                      styles.adminRoleIcon
                    }
                  >

                    <ShieldCheck
                      size={19}
                      color="#7665EE"
                    />

                  </View>


                  <View>

                    <Text
                      style={
                        styles.adminRoleTitle
                      }
                    >
                      Administrator
                    </Text>


                    <Text
                      style={
                        styles.adminRoleSubtitle
                      }
                    >
                      KidMind Control Center
                    </Text>

                  </View>

                </View>


                <ScrollView
                  showsVerticalScrollIndicator={
                    false
                  }
                  style={
                    styles.sidebarMenu
                  }
                >

                  {
                    menu.map(
                      item => {

                        const Icon =
                          item.icon;


                        const selected =
                          activeSection ===
                          item.key;


                        return (

                          <Pressable
                            key={
                              item.key
                            }
                            style={[
                              styles.menuItem,

                              selected &&
                                styles.menuItemActive,
                            ]}
                            onPress={() =>
                              selectSection(
                                item.key
                              )
                            }
                          >

                            <Icon
                              size={19}
                              color={
                                selected
                                  ? "#7465E8"
                                  : "#8A8EA5"
                              }
                            />


                            <Text
                              style={[
                                styles.menuItemText,

                                selected &&
                                  styles.menuItemTextActive,
                              ]}
                            >
                              {
                                item.title
                              }
                            </Text>

                            {
                              item.key ===
                                "notifications" &&
                              unreadCount >
                                0 && (
                                <View
                                  style={
                                    styles.menuBadge
                                  }
                                >
                                  <Text
                                    style={
                                      styles.menuBadgeText
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

                          </Pressable>

                        );

                      }
                    )
                  }

                </ScrollView>


                <Pressable
                  style={
                    styles.logoutButton
                  }
                  onPress={
                    handleLogout
                  }
                >

                  <LogOut
                    size={19}
                    color="#E35469"
                  />


                  <Text
                    style={
                      styles.logoutText
                    }
                  >
                    Logout
                  </Text>

                </Pressable>

              </View>

            </View>

          )
        }

      </View>

    </SafeAreaView>

  );

}


function LoadingBlock({
  text,
}: {
  text:
    string;
}) {

  return (

    <View
      style={
        styles.emptyBlock
      }
    >

      <ActivityIndicator
        size="small"
        color="#7566EB"
      />


      <Text
        style={
          styles.emptyText
        }
      >
        {text}
      </Text>

    </View>

  );

}


function EmptyBlock({
  text,
}: {
  text:
    string;
}) {

  return (

    <View
      style={
        styles.emptyBlock
      }
    >

      <Text
        style={
          styles.emptyText
        }
      >
        {text}
      </Text>

    </View>

  );

}


function ManagementButton({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon:
    ReactNode;

  title:
    string;

  subtitle:
    string;

  onPress:
    () => void;
}) {

  return (

    <Pressable
      style={
        styles.managementButton
      }
      onPress={
        onPress
      }
    >

      {icon}


      <Text
        style={
          styles.managementTitle
        }
      >
        {title}
      </Text>


      <Text
        style={
          styles.managementSubtitle
        }
      >
        {subtitle}
      </Text>

    </Pressable>

  );

}


const styles =
  StyleSheet.create({

    safeArea: {
      flex:
        1,
      backgroundColor:
        "#FFFFFF",
    },


    page: {
      flex:
        1,
      backgroundColor:
        "#F7F8FC",
    },


    header: {
      height:
        74,
      paddingHorizontal:
        18,
      flexDirection:
        "row",
      alignItems:
        "center",
      borderBottomWidth:
        1,
      borderBottomColor:
        "#EEEFF5",
      backgroundColor:
        "#FFFFFF",
    },


    headerButton: {
      width:
        42,
      height:
        42,
      borderRadius:
        13,
      borderWidth:
        1,
      borderColor:
        "#ECECF4",
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#FFFFFF",
    },


    headerBadge: {
      minWidth:
        19,
      height:
        19,
      paddingHorizontal:
        4,
      position:
        "absolute",
      top:
        -5,
      right:
        -5,
      borderRadius:
        999,
      alignItems:
        "center",
      justifyContent:
        "center",
      borderWidth:
        2,
      borderColor:
        "#FFFFFF",
      backgroundColor:
        "#7C6CFF",
    },


    headerBadgeText: {
      color:
        "#FFFFFF",
      fontSize:
        8,
      fontWeight:
        "900",
    },


    headerText: {
      flex:
        1,
      paddingHorizontal:
        13,
    },


    headerLabel: {
      color:
        "#A0A3B5",
      fontSize:
        10.5,
    },


    headerName: {
      marginTop:
        2,
      color:
        "#343654",
      fontSize:
        14,
      fontWeight:
        "700",
    },


    content: {
      padding:
        18,
      paddingBottom:
        45,
    },


    chatContent: {
      flex:
        1,
    },


    welcomeCard: {
      minHeight:
        190,
      padding:
        24,
      borderRadius:
        25,
      backgroundColor:
        "#866DF0",
      overflow:
        "hidden",
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
    },


    welcomeText: {
      flex:
        1,
      paddingRight:
        15,
    },


    eyebrow: {
      color:
        "rgba(255,255,255,.82)",
      fontSize:
        10,
      fontWeight:
        "800",
      letterSpacing:
        1,
    },


    welcomeTitle: {
      marginTop:
        9,
      color:
        "#FFFFFF",
      fontSize:
        26,
      lineHeight:
        32,
      fontWeight:
        "800",
    },


    welcomeSubtitle: {
      marginTop:
        8,
      color:
        "rgba(255,255,255,.82)",
      fontSize:
        13,
      lineHeight:
        20,
    },


    welcomeIcon: {
      width:
        62,
      height:
        62,
      borderRadius:
        19,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "rgba(255,255,255,.15)",
      borderWidth:
        1,
      borderColor:
        "rgba(255,255,255,.2)",
    },


    errorBox: {
      marginTop:
        17,
      padding:
        14,
      borderRadius:
        14,
      backgroundColor:
        "#FFF0F3",
      borderWidth:
        1,
      borderColor:
        "#F6D8DF",
    },


    errorText: {
      color:
        "#B9415E",
      fontSize:
        13,
    },


    statsGrid: {
      flexDirection:
        "row",
      flexWrap:
        "wrap",
      gap:
        12,
      marginTop:
        18,
    },


    statCard: {
      width:
        "48%",
      minHeight:
        145,
      padding:
        16,
      borderRadius:
        20,
      backgroundColor:
        "#FFFFFF",
      borderWidth:
        1,
      borderColor:
        "#ECECF4",
    },


    statIcon: {
      width:
        43,
      height:
        43,
      borderRadius:
        13,
      alignItems:
        "center",
      justifyContent:
        "center",
      marginBottom:
        13,
    },


    statPurple: {
      backgroundColor:
        "#F0EDFF",
    },


    statPink: {
      backgroundColor:
        "#FFF0FA",
    },


    statBlue: {
      backgroundColor:
        "#EDF6FF",
    },


    statGreen: {
      backgroundColor:
        "#ECFAF4",
    },


    statLabel: {
      color:
        "#85899D",
      fontSize:
        11.5,
    },


    statValue: {
      marginTop:
        3,
      color:
        "#2E3054",
      fontSize:
        25,
      fontWeight:
        "800",
    },


    statSubtitle: {
      marginTop:
        2,
      color:
        "#A0A3B3",
      fontSize:
        10.5,
    },


    panel: {
      marginTop:
        18,
      padding:
        19,
      borderRadius:
        22,
      backgroundColor:
        "#FFFFFF",
      borderWidth:
        1,
      borderColor:
        "#ECECF4",
    },


    panelHeading: {
      marginBottom:
        14,
    },


    panelTitle: {
      color:
        "#333554",
      fontSize:
        16,
      fontWeight:
        "800",
    },


    panelSubtitle: {
      marginTop:
        4,
      color:
        "#A0A3B4",
      fontSize:
        11.5,
    },


    emptyBlock: {
      minHeight:
        130,
      alignItems:
        "center",
      justifyContent:
        "center",
      gap:
        9,
    },


    emptyText: {
      color:
        "#A1A4B5",
      fontSize:
        12,
    },


    userRow: {
      minHeight:
        67,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap:
        9,
      borderBottomWidth:
        1,
      borderBottomColor:
        "#F1F1F6",
    },


    childRow: {
      minHeight:
        67,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap:
        10,
      borderBottomWidth:
        1,
      borderBottomColor:
        "#F1F1F6",
    },


    userAvatar: {
      width:
        38,
      height:
        38,
      borderRadius:
        12,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#F0EDFF",
    },


    userAvatarText: {
      color:
        "#7465E8",
      fontSize:
        13,
      fontWeight:
        "800",
    },


    childAvatar: {
      width:
        38,
      height:
        38,
      borderRadius:
        12,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#FFF0FA",
    },


    childAvatarText: {
      color:
        "#B05D9B",
      fontSize:
        13,
      fontWeight:
        "800",
    },


    userMain: {
      flex:
        1,
      minWidth:
        0,
    },


    childMain: {
      flex:
        1,
      minWidth:
        0,
    },


    rowName: {
      color:
        "#373953",
      fontSize:
        12.5,
      fontWeight:
        "700",
    },


    rowSecondary: {
      marginTop:
        2,
      color:
        "#A1A4B4",
      fontSize:
        10.5,
    },


    rolePill: {
      paddingHorizontal:
        8,
      paddingVertical:
        5,
      borderRadius:
        999,
    },


    roleText: {
      fontSize:
        9,
      fontWeight:
        "700",
    },


    roleAdmin: {
      backgroundColor:
        "#F0EDFF",
    },


    roleAdminText: {
      color:
        "#755FDC",
    },


    roleTherapist: {
      backgroundColor:
        "#EDF6FF",
    },


    roleTherapistText: {
      color:
        "#4589C7",
    },


    roleParent: {
      backgroundColor:
        "#FFF0FA",
    },


    roleParentText: {
      color:
        "#C257A4",
    },


    statusDot: {
      width:
        8,
      height:
        8,
      borderRadius:
        4,
    },


    statusActive: {
      backgroundColor:
        "#4AC494",
    },


    statusInactive: {
      backgroundColor:
        "#D7D8E2",
    },


    childMeta: {
      width:
        80,
      alignItems:
        "flex-end",
    },


    childMetaLabel: {
      color:
        "#AAADBC",
      fontSize:
        9,
    },


    childMetaValue: {
      marginTop:
        2,
      color:
        "#686A80",
      fontSize:
        10,
      fontWeight:
        "600",
    },


    managementPanel: {
      marginBottom:
        10,
    },


    managementGrid: {
      flexDirection:
        "row",
      flexWrap:
        "wrap",
      gap:
        11,
    },


    managementButton: {
      width:
        "48%",
      minHeight:
        145,
      padding:
        15,
      borderRadius:
        17,
      borderWidth:
        1,
      borderColor:
        "#ECEAF6",
      backgroundColor:
        "#FBFAFF",
    },


    managementTitle: {
      marginTop:
        10,
      color:
        "#3C3E5D",
      fontSize:
        12.5,
      fontWeight:
        "800",
    },


    managementSubtitle: {
      marginTop:
        5,
      color:
        "#A0A2B2",
      fontSize:
        10.5,
      lineHeight:
        15,
    },


    placeholder: {
      minHeight:
        570,
      alignItems:
        "center",
      justifyContent:
        "center",
      padding:
        30,
      borderRadius:
        25,
      backgroundColor:
        "#FFFFFF",
      borderWidth:
        1,
      borderColor:
        "#ECECF4",
    },


    placeholderIcon: {
      width:
        64,
      height:
        64,
      borderRadius:
        19,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#F0EDFF",
    },


    placeholderTitle: {
      marginTop:
        17,
      color:
        "#34365A",
      fontSize:
        25,
      fontWeight:
        "800",
    },


    placeholderText: {
      marginTop:
        7,
      color:
        "#989BAD",
      fontSize:
        13,
      textAlign:
        "center",
    },


    backButton: {
      marginTop:
        23,
      paddingHorizontal:
        18,
      paddingVertical:
        12,
      borderRadius:
        13,
      backgroundColor:
        "#7968ED",
    },


    backButtonText: {
      color:
        "#FFFFFF",
      fontWeight:
        "700",
      fontSize:
        13,
    },


    sidebarOverlay: {
      position:
        "absolute",
      top:
        0,
      right:
        0,
      bottom:
        0,
      left:
        0,
      zIndex:
        100,
      flexDirection:
        "row",
    },


    sidebarBackdrop: {
      position:
        "absolute",
      top:
        0,
      right:
        0,
      bottom:
        0,
      left:
        0,
      backgroundColor:
        "rgba(35,37,64,.32)",
    },


    sidebar: {
      width:
        285,
      height:
        "100%",
      paddingHorizontal:
        16,
      paddingTop:
        16,
      paddingBottom:
        18,
      backgroundColor:
        "#FFFFFF",
      borderRightWidth:
        1,
      borderRightColor:
        "#ECECF5",
    },


    sidebarTop: {
      height:
        112,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
    },


    logo: {
      width:
        190,
      height:
        105,
    },


    closeButton: {
      width:
        38,
      height:
        38,
      borderRadius:
        12,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#F7F7FB",
    },


    adminRole: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap:
        11,
      marginBottom:
        16,
      padding:
        12,
      borderRadius:
        16,
      backgroundColor:
        "#F5F0FF",
      borderWidth:
        1,
      borderColor:
        "#EBE5FF",
    },


    adminRoleIcon: {
      width:
        38,
      height:
        38,
      borderRadius:
        12,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#FFFFFF",
    },


    adminRoleTitle: {
      color:
        "#37306F",
      fontSize:
        13,
      fontWeight:
        "800",
    },


    adminRoleSubtitle: {
      marginTop:
        2,
      color:
        "#989AB0",
      fontSize:
        10.5,
    },


    sidebarMenu: {
      flex:
        1,
    },


    menuItem: {
      height:
        45,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap:
        12,
      paddingHorizontal:
        14,
      marginBottom:
        4,
      borderRadius:
        14,
    },


    menuItemActive: {
      backgroundColor:
        "#F0EDFF",
    },


    menuItemText: {
      color:
        "#8A8EA5",
      fontSize:
        13.5,
    },


    menuItemTextActive: {
      color:
        "#7465E8",
      fontWeight:
        "700",
    },


    menuBadge: {
      minWidth:
        21,
      height:
        21,
      paddingHorizontal:
        5,
      marginLeft:
        "auto",
      borderRadius:
        999,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#7C6CFF",
    },


    menuBadgeText: {
      color:
        "#FFFFFF",
      fontSize:
        8,
      fontWeight:
        "900",
    },


    logoutButton: {
      height:
        46,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap:
        12,
      paddingHorizontal:
        14,
      borderRadius:
        14,
      backgroundColor:
        "#FFF8F9",
    },


    logoutText: {
      color:
        "#E35469",
      fontSize:
        13.5,
      fontWeight:
        "700",
    },

  });