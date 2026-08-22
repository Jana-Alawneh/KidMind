import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ChevronDown,
  Link2,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserRound,
  UserRoundCog,
  Users,
  X,
} from "lucide-react-native";

import {
  authRequest,
} from "@/api/authApi";


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
};


type ChildItem = {
  id: number;
  full_name: string;
  age?:
    | number
    | null;
  gender?:
    | string
    | null;
  region?:
    | string
    | null;
  parent_name?:
    | string
    | null;
};


type AssignmentItem = {
  child_id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  role:
    | "parent"
    | "therapist";
  is_active?:
    | number
    | boolean;
};


type SessionGame = {
  game_name?: string | null;
  status?: string | null;
  score?: number | string | null;
  started_at?: string | null;
  ended_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};


type SessionItem = {
  id: number;
  child_id: number;
  status?: string | null;
  games?: SessionGame[];
  started_at?: string | null;
  ended_at?: string | null;
  scheduled_at?: string | null;
  created_at?: string | null;
};


type PickerMode =
  | "parent"
  | "therapist"
  | null;


const normalizeGameName =
  (
    value:
      string |
      null |
      undefined
  ) =>
    String(
      value || ""
    )
      .trim()
      .toLowerCase();


const domainGames = {
  attention:
    "focus finder",

  workingMemory:
    "memory match",

  visualSpatial:
    "puzzle path",

  reading:
    "reading adventure",

  processingSpeed:
    "quick match",
};


const getGameDate =
  (
    game:
      SessionGame,
    session:
      SessionItem
  ) => {

    const value =
      game.ended_at ||
      game.started_at ||
      game.updated_at ||
      game.created_at ||
      session.ended_at ||
      session.started_at ||
      session.scheduled_at ||
      session.created_at;


    const time =
      value
        ? new Date(
            value
          ).getTime()
        : 0;


    return Number.isFinite(
      time
    )
      ? time
      : 0;

  };


const calculateChildScore =
  (
    childId:
      number,
    sessions:
      SessionItem[]
  ) => {

    const latestByDomain:
      Record<
        string,
        {
          score:
            number;
          time:
            number;
        }
      > = {};


    sessions
      .filter(
        session =>
          Number(
            session.child_id
          ) ===
          Number(
            childId
          )
      )
      .forEach(
        session => {

          const games =
            Array.isArray(
              session.games
            )
              ? session.games
              : [];


          games.forEach(
            game => {

              const status =
                String(
                  game.status ||
                  ""
                )
                  .trim()
                  .toLowerCase();


              if (
                status !==
                  "completed" &&
                status !==
                  "failed"
              ) {

                return;

              }


              const score =
                Number(
                  game.score
                );


              if (
                !Number.isFinite(
                  score
                )
              ) {

                return;

              }


              const gameName =
                normalizeGameName(
                  game.game_name
                );


              const domain =
                Object.entries(
                  domainGames
                ).find(
                  (
                    [
                      ,
                      expectedGame,
                    ]
                  ) =>
                    gameName ===
                    expectedGame
                )?.[0];


              if (
                !domain
              ) {

                return;

              }


              const time =
                getGameDate(
                  game,
                  session
                );


              const existing =
                latestByDomain[
                  domain
                ];


              if (
                !existing ||
                time >=
                  existing.time
              ) {

                latestByDomain[
                  domain
                ] = {

                  score:
                    Math.max(
                      0,
                      Math.min(
                        100,
                        Math.round(
                          score
                        )
                      )
                    ),

                  time,

                };

              }

            }
          );

        }
      );


    const scores =
      Object.values(
        latestByDomain
      ).map(
        item =>
          item.score
      );


    if (
      scores.length ===
      0
    ) {

      return null;

    }


    return Math.round(
      scores.reduce(
        (
          total,
          score
        ) =>
          total +
          score,
        0
      ) /
        scores.length
    );

  };


const getChildAssessmentCount =
  (
    childId:
      number,
    sessions:
      SessionItem[]
  ) => {

    return sessions.filter(
      session => {

        if (
          Number(
            session.child_id
          ) !==
          Number(
            childId
          )
        ) {

          return false;

        }


        const status =
          String(
            session.status ||
            ""
          )
            .trim()
            .toLowerCase();


        return (
          status ===
            "completed" ||
          status ===
            "ended"
        );

      }
    ).length;

  };


export default function AdminChildren() {

  const [
    children,
    setChildren,
  ] =
    useState<
      ChildItem[]
    >([]);


  const [
    users,
    setUsers,
  ] =
    useState<
      UserItem[]
    >([]);


  const [
    assignments,
    setAssignments,
  ] =
    useState<
      AssignmentItem[]
    >([]);


  const [
    sessions,
    setSessions,
  ] =
    useState<
      SessionItem[]
    >([]);


  const [
    search,
    setSearch,
  ] =
    useState("");


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  const [
    refreshing,
    setRefreshing,
  ] =
    useState(false);


  const [
    error,
    setError,
  ] =
    useState("");


  const [
    selectedChild,
    setSelectedChild,
  ] =
    useState<
      ChildItem |
      null
    >(null);


  const [
    selectedParentId,
    setSelectedParentId,
  ] =
    useState<
      number |
      null
    >(null);


  const [
    selectedTherapistId,
    setSelectedTherapistId,
  ] =
    useState<
      number |
      null
    >(null);


  const [
    pickerMode,
    setPickerMode,
  ] =
    useState<
      PickerMode
    >(null);


  const [
    saving,
    setSaving,
  ] =
    useState(false);


  const loadData =
    async (
      manual =
        false
    ) => {

      try {

        if (
          manual
        ) {

          setRefreshing(
            true
          );

        } else {

          setLoading(
            true
          );

        }


        setError(
          ""
        );


        const [
          childrenData,
          usersData,
          assignmentsData,
          sessionsData,
        ] =
          await Promise.all([

            authRequest<
              ChildItem[]
            >(
              "/children"
            ),

            authRequest<
              UserItem[]
            >(
              "/users"
            ),

            authRequest<
              AssignmentItem[]
            >(
              "/users/assignments"
            ),

            authRequest<
              SessionItem[]
            >(
              "/sessions"
            ),

          ]);


        setChildren(
          Array.isArray(
            childrenData
          )
            ? childrenData
            : []
        );


        setUsers(
          Array.isArray(
            usersData
          )
            ? usersData
            : []
        );


        setAssignments(
          Array.isArray(
            assignmentsData
          )
            ? assignmentsData
            : []
        );


        setSessions(
          Array.isArray(
            sessionsData
          )
            ? sessionsData
            : []
        );

      } catch (
        requestError
      ) {

        console.error(
          requestError
        );


        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load children."
        );

      } finally {

        setLoading(
          false
        );

        setRefreshing(
          false
        );

      }

    };


  useEffect(
    () => {

      loadData();

    },
    []
  );


  const parentUsers =
    useMemo(
      () =>
        users.filter(
          user =>
            user.role ===
              "parent" &&
            Number(
              user.is_active
            ) ===
              1
        ),
      [
        users,
      ]
    );


  const therapistUsers =
    useMemo(
      () =>
        users.filter(
          user =>
            user.role ===
              "therapist" &&
            Number(
              user.is_active
            ) ===
              1
        ),
      [
        users,
      ]
    );


  const assignmentsByChild =
    useMemo(
      () => {

        const map:
          Record<
            number,
            AssignmentItem[]
          > = {};


        assignments.forEach(
          assignment => {

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
              ] = [];

            }


            map[
              childId
            ].push(
              assignment
            );

          }
        );


        return map;

      },
      [
        assignments,
      ]
    );


  const filteredChildren =
    useMemo(
      () => {

        const query =
          search
            .trim()
            .toLowerCase();


        if (
          !query
        ) {

          return children;

        }


        return children.filter(
          child => {

            const childAssignments =
              assignmentsByChild[
                Number(
                  child.id
                )
              ] || [];


            const assignmentText =
              childAssignments
                .map(
                  item =>
                    [
                      item.user_name,
                      item.user_email,
                    ]
                      .filter(
                        Boolean
                      )
                      .join(
                        " "
                      )
                )
                .join(
                  " "
                );


            const searchable =
              [
                child.full_name,
                child.parent_name,
                child.region,
                child.gender,
                child.id,
                assignmentText,
              ]
                .filter(
                  value =>
                    value !==
                      null &&
                    value !==
                      undefined
                )
                .join(
                  " "
                )
                .toLowerCase();


            return searchable.includes(
              query
            );

          }
        );

      },
      [
        search,
        children,
        assignmentsByChild,
      ]
    );


  const openAssignments =
    (
      child:
        ChildItem
    ) => {

      setSelectedChild(
        child
      );

      setSelectedParentId(
        null
      );

      setSelectedTherapistId(
        null
      );

      setPickerMode(
        null
      );

    };


  const closeAssignments =
    () => {

      if (
        saving
      ) {

        return;

      }


      setSelectedChild(
        null
      );

      setSelectedParentId(
        null
      );

      setSelectedTherapistId(
        null
      );

      setPickerMode(
        null
      );

    };


  const assignUser =
    async (
      userId:
        number |
        null
    ) => {

      if (
        !selectedChild ||
        !userId
      ) {

        return;

      }


      try {

        setSaving(
          true
        );

        setError(
          ""
        );


        await authRequest(
          "/users/assignments",
          {
            method:
              "POST",

            body:
              JSON.stringify(
                {
                  child_id:
                    Number(
                      selectedChild.id
                    ),

                  user_id:
                    Number(
                      userId
                    ),
                }
              ),
          }
        );


        await loadData(
          true
        );


        setSelectedParentId(
          null
        );

        setSelectedTherapistId(
          null
        );

      } catch (
        requestError
      ) {

        console.error(
          requestError
        );


        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to create assignment."
        );

      } finally {

        setSaving(
          false
        );

      }

    };


  const performRemoveAssignment =
    async (
      childId:
        number,
      userId:
        number
    ) => {

      try {

        setSaving(
          true
        );

        setError(
          ""
        );


        await authRequest(
          `/users/assignments/${childId}/${userId}`,
          {
            method:
              "DELETE",
          }
        );


        await loadData(
          true
        );

      } catch (
        requestError
      ) {

        console.error(
          requestError
        );


        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to remove assignment."
        );

      } finally {

        setSaving(
          false
        );

      }

    };


  const removeAssignment =
    (
      childId:
        number,
      userId:
        number,
      userName:
        string
    ) => {

      Alert.alert(
        "Remove Assignment",
        `Remove ${userName} from this child?`,
        [
          {
            text:
              "Cancel",
            style:
              "cancel",
          },
          {
            text:
              "Remove",
            style:
              "destructive",
            onPress:
              () => {

                void performRemoveAssignment(
                  childId,
                  userId
                );

              },
          },
        ]
      );

    };


  const selectedAssignments =
    selectedChild
      ? assignmentsByChild[
          Number(
            selectedChild.id
          )
        ] || []
      : [];


  const selectedParents =
    selectedAssignments.filter(
      item =>
        item.role ===
        "parent"
    );


  const selectedTherapists =
    selectedAssignments.filter(
      item =>
        item.role ===
        "therapist"
    );


  const availableParents =
    parentUsers.filter(
      user =>
        !selectedParents.some(
          item =>
            Number(
              item.user_id
            ) ===
            Number(
              user.id
            )
        )
    );


  const availableTherapists =
    therapistUsers.filter(
      user =>
        !selectedTherapists.some(
          item =>
            Number(
              item.user_id
            ) ===
            Number(
              user.id
            )
        )
    );


  const selectedParent =
    parentUsers.find(
      user =>
        Number(
          user.id
        ) ===
        Number(
          selectedParentId
        )
    );


  const selectedTherapist =
    therapistUsers.find(
      user =>
        Number(
          user.id
        ) ===
        Number(
          selectedTherapistId
        )
    );


  const pickerUsers =
    pickerMode ===
    "parent"
      ? availableParents
      : pickerMode ===
        "therapist"
        ? availableTherapists
        : [];


  const choosePickerUser =
    (
      user:
        UserItem
    ) => {

      if (
        pickerMode ===
        "parent"
      ) {

        setSelectedParentId(
          user.id
        );

      }


      if (
        pickerMode ===
        "therapist"
      ) {

        setSelectedTherapistId(
          user.id
        );

      }


      setPickerMode(
        null
      );

    };


  return (

    <View
      style={
        styles.page
      }
    >

      <View
        style={
          styles.heading
        }
      >

        <View
          style={
            styles.headingText
          }
        >

          <Text
            style={
              styles.eyebrow
            }
          >
            CHILD MANAGEMENT
          </Text>


          <Text
            style={
              styles.title
            }
          >
            Children
          </Text>


          <Text
            style={
              styles.subtitle
            }
          >
            View every child,
            assessment results,
            parents, and assigned
            therapists.
          </Text>

        </View>


        <Pressable
          style={[
            styles.refreshButton,

            refreshing &&
              styles.disabledButton,
          ]}
          disabled={
            refreshing
          }
          onPress={() =>
            loadData(
              true
            )
          }
        >

          {
            refreshing
              ? (

                <ActivityIndicator
                  size="small"
                  color="#7164D8"
                />

              )
              : (

                <RefreshCw
                  size={17}
                  color="#7164D8"
                />

              )
          }


          <Text
            style={
              styles.refreshText
            }
          >
            Refresh
          </Text>

        </Pressable>

      </View>


      <View
        style={
          styles.summaryGrid
        }
      >

        <SummaryCard
          icon={

            <Users
              size={20}
              color="#7566E8"
            />

          }
          title="Total Children"
          value={
            children.length
          }
        />


        <SummaryCard
          icon={

            <UserRound
              size={20}
              color="#D867B4"
            />

          }
          title="Parent Accounts"
          value={
            parentUsers.length
          }
        />


        <SummaryCard
          icon={

            <UserRoundCog
              size={20}
              color="#5595DD"
            />

          }
          title="Therapists"
          value={
            therapistUsers.length
          }
        />


        <SummaryCard
          icon={

            <Link2
              size={20}
              color="#48A784"
            />

          }
          title="Active Links"
          value={
            assignments.length
          }
        />

      </View>


      <View
        style={
          styles.toolbar
        }
      >

        <View
          style={
            styles.searchBox
          }
        >

          <Search
            size={18}
            color="#A0A3B6"
          />


          <TextInput
            value={
              search
            }
            onChangeText={
              setSearch
            }
            placeholder="Search child, parent, therapist, region or ID..."
            placeholderTextColor="#A0A3B6"
            style={
              styles.searchInput
            }
          />

        </View>


        <Text
          style={
            styles.resultCount
          }
        >
          {
            filteredChildren.length
          }{" "}
          {
            filteredChildren.length ===
            1
              ? "child"
              : "children"
          }
        </Text>

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


      {
        loading
          ? (

            <View
              style={
                styles.stateBox
              }
            >

              <ActivityIndicator
                size="large"
                color="#8172EA"
              />


              <Text
                style={
                  styles.stateText
                }
              >
                Loading children...
              </Text>

            </View>

          )
          : filteredChildren.length ===
            0
            ? (

              <View
                style={
                  styles.stateBox
                }
              >

                <Users
                  size={34}
                  color="#8879EE"
                />


                <Text
                  style={
                    styles.emptyTitle
                  }
                >
                  No children found
                </Text>


                <Text
                  style={
                    styles.stateText
                  }
                >
                  Try another search.
                </Text>

              </View>

            )
            : (

              <View
                style={
                  styles.childrenList
                }
              >

                {
                  filteredChildren.map(
                    child => {

                      const childAssignments =
                        assignmentsByChild[
                          Number(
                            child.id
                          )
                        ] || [];


                      const linkedParents =
                        childAssignments.filter(
                          item =>
                            item.role ===
                            "parent"
                        );


                      const linkedTherapists =
                        childAssignments.filter(
                          item =>
                            item.role ===
                            "therapist"
                        );


                      const score =
                        calculateChildScore(
                          child.id,
                          sessions
                        );


                      const assessments =
                        getChildAssessmentCount(
                          child.id,
                          sessions
                        );


                      return (

                        <View
                          key={
                            child.id
                          }
                          style={
                            styles.childCard
                          }
                        >

                          <View
                            style={
                              styles.childTop
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
                                styles.childTitleBox
                              }
                            >

                              <Text
                                numberOfLines={
                                  1
                                }
                                style={
                                  styles.childName
                                }
                              >
                                {
                                  child.full_name
                                }
                              </Text>


                              <Text
                                style={
                                  styles.childId
                                }
                              >
                                ID #
                                {
                                  child.id
                                }
                              </Text>

                            </View>


                            <View
                              style={
                                styles.scoreBox
                              }
                            >

                              <Text
                                style={
                                  styles.scoreValue
                                }
                              >
                                {
                                  score ===
                                  null
                                    ? "—"
                                    : score
                                }
                              </Text>


                              <Text
                                style={
                                  styles.scoreLabel
                                }
                              >
                                Score
                              </Text>

                            </View>

                          </View>


                          <View
                            style={
                              styles.infoGrid
                            }
                          >

                            <InfoBox
                              label="Age"
                              value={
                                child.age ??
                                "—"
                              }
                            />


                            <InfoBox
                              label="Gender"
                              value={
                                child.gender ||
                                "—"
                              }
                            />


                            <InfoBox
                              label="Assessments"
                              value={
                                assessments
                              }
                            />

                          </View>


                          <View
                            style={
                              styles.locationBox
                            }
                          >

                            <MapPin
                              size={15}
                              color="#85899D"
                            />


                            <Text
                              numberOfLines={
                                1
                              }
                              style={
                                styles.locationText
                              }
                            >
                              {
                                child.region ||
                                "No region"
                              }
                            </Text>

                          </View>


                          <View
                            style={
                              styles.legacyParent
                            }
                          >

                            <Text
                              style={
                                styles.legacyLabel
                              }
                            >
                              Parent name on child record
                            </Text>


                            <Text
                              numberOfLines={
                                1
                              }
                              style={
                                styles.legacyValue
                              }
                            >
                              {
                                child.parent_name ||
                                "—"
                              }
                            </Text>

                          </View>


                          <RelationshipSection
                            type="parent"
                            title="Parents"
                            items={
                              linkedParents
                            }
                            emptyText="No parent account linked"
                          />


                          <RelationshipSection
                            type="therapist"
                            title="Therapists"
                            items={
                              linkedTherapists
                            }
                            emptyText="No therapist assigned"
                          />


                          <Pressable
                            style={
                              styles.manageButton
                            }
                            onPress={() =>
                              openAssignments(
                                child
                              )
                            }
                          >

                            <Link2
                              size={17}
                              color="#7565E6"
                            />


                            <Text
                              style={
                                styles.manageButtonText
                              }
                            >
                              Manage Assignments
                            </Text>

                          </Pressable>

                        </View>

                      );

                    }
                  )
                }

              </View>

            )
      }


      <Modal
        visible={
          Boolean(
            selectedChild
          )
        }
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={
          closeAssignments
        }
      >

        <View
          style={
            styles.modalOverlay
          }
        >

          <Pressable
            style={
              styles.modalBackdrop
            }
            onPress={
              closeAssignments
            }
          />


          <View
            style={
              styles.assignmentModal
            }
          >

            <View
              style={
                styles.modalHeader
              }
            >

              <View
                style={
                  styles.modalHeaderText
                }
              >

                <Text
                  style={
                    styles.modalEyebrow
                  }
                >
                  MANAGE ASSIGNMENTS
                </Text>


                <Text
                  numberOfLines={
                    1
                  }
                  style={
                    styles.modalTitle
                  }
                >
                  {
                    selectedChild
                      ?.full_name
                  }
                </Text>

              </View>


              <Pressable
                style={
                  styles.closeButton
                }
                disabled={
                  saving
                }
                onPress={
                  closeAssignments
                }
              >

                <X
                  size={20}
                  color="#85889B"
                />

              </Pressable>

            </View>


            <View
              style={
                styles.modalScroll
              }
            >

              <View
                style={
                  styles.assignmentBlock
                }
              >

                <View
                  style={
                    styles.assignmentHeading
                  }
                >

                  <UserRound
                    size={18}
                    color="#7869E5"
                  />


                  <View
                    style={
                      styles.assignmentHeadingText
                    }
                  >

                    <Text
                      style={
                        styles.assignmentTitle
                      }
                    >
                      Parent Accounts
                    </Text>


                    <Text
                      style={
                        styles.assignmentSubtitle
                      }
                    >
                      Link parents to this child
                    </Text>

                  </View>

                </View>


                {
                  selectedParents.length >
                  0
                    ? (

                      <View
                        style={
                          styles.assignedList
                        }
                      >

                        {
                          selectedParents.map(
                            parent => (

                              <AssignedUser
                                key={
                                  parent.user_id
                                }
                                item={
                                  parent
                                }
                                saving={
                                  saving
                                }
                                onRemove={() =>
                                  removeAssignment(
                                    selectedChild
                                      ?.id ||
                                      0,
                                    parent.user_id,
                                    parent.user_name
                                  )
                                }
                              />

                            )
                          )
                        }

                      </View>

                    )
                    : (

                      <View
                        style={
                          styles.assignmentEmpty
                        }
                      >

                        <Text
                          style={
                            styles.assignmentEmptyText
                          }
                        >
                          No parent account linked.
                        </Text>

                      </View>

                    )
                }


                {
                  parentUsers.length >
                  0
                    ? (

                      <View
                        style={
                          styles.addSection
                        }
                      >

                        <SelectionField
                          value={
                            selectedParent
                              ? `${selectedParent.full_name} — ${selectedParent.email}`
                              : "Select parent"
                          }
                          disabled={
                            availableParents.length ===
                            0
                          }
                          onPress={() =>
                            setPickerMode(
                              "parent"
                            )
                          }
                        />


                        <Pressable
                          style={[
                            styles.addButton,

                            (
                              !selectedParentId ||
                              saving
                            ) &&
                              styles.addButtonDisabled,
                          ]}
                          disabled={
                            !selectedParentId ||
                            saving
                          }
                          onPress={() =>
                            assignUser(
                              selectedParentId
                            )
                          }
                        >

                          <Plus
                            size={16}
                            color="#FFFFFF"
                          />


                          <Text
                            style={
                              styles.addButtonText
                            }
                          >
                            Link Parent
                          </Text>

                        </Pressable>

                      </View>

                    )
                    : (

                      <View
                        style={
                          styles.noAccounts
                        }
                      >

                        <Text
                          style={
                            styles.noAccountsText
                          }
                        >
                          No parent accounts exist yet.
                          Create them from the Parents
                          section first.
                        </Text>

                      </View>

                    )
                }

              </View>


              <View
                style={
                  styles.assignmentBlock
                }
              >

                <View
                  style={
                    styles.assignmentHeading
                  }
                >

                  <UserRoundCog
                    size={18}
                    color="#7869E5"
                  />


                  <View
                    style={
                      styles.assignmentHeadingText
                    }
                  >

                    <Text
                      style={
                        styles.assignmentTitle
                      }
                    >
                      Therapists
                    </Text>


                    <Text
                      style={
                        styles.assignmentSubtitle
                      }
                    >
                      Assign therapists responsible
                      for this child
                    </Text>

                  </View>

                </View>


                {
                  selectedTherapists.length >
                  0
                    ? (

                      <View
                        style={
                          styles.assignedList
                        }
                      >

                        {
                          selectedTherapists.map(
                            therapist => (

                              <AssignedUser
                                key={
                                  therapist.user_id
                                }
                                item={
                                  therapist
                                }
                                saving={
                                  saving
                                }
                                onRemove={() =>
                                  removeAssignment(
                                    selectedChild
                                      ?.id ||
                                      0,
                                    therapist.user_id,
                                    therapist.user_name
                                  )
                                }
                              />

                            )
                          )
                        }

                      </View>

                    )
                    : (

                      <View
                        style={
                          styles.assignmentEmpty
                        }
                      >

                        <Text
                          style={
                            styles.assignmentEmptyText
                          }
                        >
                          No therapist assigned.
                        </Text>

                      </View>

                    )
                }


                <View
                  style={
                    styles.addSection
                  }
                >

                  <SelectionField
                    value={
                      selectedTherapist
                        ? `${selectedTherapist.full_name} — ${selectedTherapist.email}`
                        : "Select therapist"
                    }
                    disabled={
                      availableTherapists.length ===
                      0
                    }
                    onPress={() =>
                      setPickerMode(
                        "therapist"
                      )
                    }
                  />


                  <Pressable
                    style={[
                      styles.addButton,

                      (
                        !selectedTherapistId ||
                        saving
                      ) &&
                        styles.addButtonDisabled,
                    ]}
                    disabled={
                      !selectedTherapistId ||
                      saving
                    }
                    onPress={() =>
                      assignUser(
                        selectedTherapistId
                      )
                    }
                  >

                    <Plus
                      size={16}
                      color="#FFFFFF"
                    />


                    <Text
                      style={
                        styles.addButtonText
                      }
                    >
                      Assign Therapist
                    </Text>

                  </Pressable>

                </View>

              </View>


              {
                saving && (

                  <View
                    style={
                      styles.savingRow
                    }
                  >

                    <ActivityIndicator
                      size="small"
                      color="#7566DF"
                    />


                    <Text
                      style={
                        styles.savingText
                      }
                    >
                      Updating assignments...
                    </Text>

                  </View>

                )
              }

            </View>

          </View>

        </View>

      </Modal>


      <Modal
        visible={
          pickerMode !==
          null
        }
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() =>
          setPickerMode(
            null
          )
        }
      >

        <View
          style={
            styles.pickerOverlay
          }
        >

          <Pressable
            style={
              styles.pickerBackdrop
            }
            onPress={() =>
              setPickerMode(
                null
              )
            }
          />


          <View
            style={
              styles.pickerCard
            }
          >

            <View
              style={
                styles.pickerHeader
              }
            >

              <View>

                <Text
                  style={
                    styles.pickerEyebrow
                  }
                >
                  SELECT ACCOUNT
                </Text>


                <Text
                  style={
                    styles.pickerTitle
                  }
                >
                  {
                    pickerMode ===
                    "parent"
                      ? "Select Parent"
                      : "Select Therapist"
                  }
                </Text>

              </View>


              <Pressable
                style={
                  styles.closeButton
                }
                onPress={() =>
                  setPickerMode(
                    null
                  )
                }
              >

                <X
                  size={20}
                  color="#85889B"
                />

              </Pressable>

            </View>


            <View
              style={
                styles.pickerList
              }
            >

              {
                pickerUsers.length ===
                0
                  ? (

                    <View
                      style={
                        styles.pickerEmpty
                      }
                    >

                      <Text
                        style={
                          styles.pickerEmptyText
                        }
                      >
                        No available accounts.
                      </Text>

                    </View>

                  )
                  : (

                    pickerUsers.map(
                      user => (

                        <Pressable
                          key={
                            user.id
                          }
                          style={
                            styles.pickerUser
                          }
                          onPress={() =>
                            choosePickerUser(
                              user
                            )
                          }
                        >

                          <View
                            style={
                              styles.pickerAvatar
                            }
                          >

                            <Text
                              style={
                                styles.pickerAvatarText
                              }
                            >
                              {
                                String(
                                  user.full_name ||
                                  "U"
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
                              styles.pickerUserText
                            }
                          >

                            <Text
                              style={
                                styles.pickerUserName
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
                                styles.pickerUserEmail
                              }
                            >
                              {
                                user.email
                              }
                            </Text>

                          </View>

                        </Pressable>

                      )
                    )

                  )
              }

            </View>

          </View>

        </View>

      </Modal>

    </View>

  );

}


function SummaryCard({
  icon,
  title,
  value,
}: {
  icon:
    React.ReactNode;

  title:
    string;

  value:
    number;
}) {

  return (

    <View
      style={
        styles.summaryCard
      }
    >

      <View
        style={
          styles.summaryIcon
        }
      >
        {icon}
      </View>


      <Text
        style={
          styles.summaryTitle
        }
      >
        {title}
      </Text>


      <Text
        style={
          styles.summaryValue
        }
      >
        {value}
      </Text>

    </View>

  );

}


function InfoBox({
  label,
  value,
}: {
  label:
    string;

  value:
    string |
    number;
}) {

  return (

    <View
      style={
        styles.infoBox
      }
    >

      <Text
        style={
          styles.infoLabel
        }
      >
        {label}
      </Text>


      <Text
        numberOfLines={
          1
        }
        style={
          styles.infoValue
        }
      >
        {value}
      </Text>

    </View>

  );

}


function RelationshipSection({
  type,
  title,
  items,
  emptyText,
}: {
  type:
    "parent" |
    "therapist";

  title:
    string;

  items:
    AssignmentItem[];

  emptyText:
    string;
}) {

  return (

    <View
      style={
        styles.relationshipSection
      }
    >

      <View
        style={
          styles.relationshipHeading
        }
      >

        {
          type ===
          "parent"
            ? (

              <UserRound
                size={16}
                color="#777A90"
              />

            )
            : (

              <UserRoundCog
                size={16}
                color="#777A90"
              />

            )
        }


        <Text
          style={
            styles.relationshipTitle
          }
        >
          {title}
        </Text>

      </View>


      <View
        style={
          styles.relationshipItems
        }
      >

        {
          items.length >
          0
            ? (

              items.map(
                item => (

                  <View
                    key={
                      item.user_id
                    }
                    style={[

                      styles.relationshipChip,

                      type ===
                        "parent"
                        ? styles.parentChip
                        : styles.therapistChip,

                    ]}
                  >

                    <Text
                      style={[
                        styles.relationshipChipText,

                        type ===
                          "parent"
                          ? styles.parentChipText
                          : styles.therapistChipText,
                      ]}
                    >
                      {
                        item.user_name
                      }
                    </Text>

                  </View>

                )
              )

            )
            : (

              <Text
                style={
                  styles.noRelation
                }
              >
                {emptyText}
              </Text>

            )
        }

      </View>

    </View>

  );

}


function AssignedUser({
  item,
  saving,
  onRemove,
}: {
  item:
    AssignmentItem;

  saving:
    boolean;

  onRemove:
    () => void;
}) {

  return (

    <View
      style={
        styles.assignedUser
      }
    >

      <View
        style={
          styles.assignedUserText
        }
      >

        <Text
          numberOfLines={
            1
          }
          style={
            styles.assignedName
          }
        >
          {
            item.user_name
          }
        </Text>


        <Text
          numberOfLines={
            1
          }
          style={
            styles.assignedEmail
          }
        >
          {
            item.user_email
          }
        </Text>

      </View>


      <Pressable
        disabled={
          saving
        }
        style={[
          styles.removeButton,

          saving &&
            styles.disabledButton,
        ]}
        onPress={
          onRemove
        }
      >

        <Trash2
          size={15}
          color="#D65768"
        />

      </Pressable>

    </View>

  );

}


function SelectionField({
  value,
  disabled,
  onPress,
}: {
  value:
    string;

  disabled:
    boolean;

  onPress:
    () => void;
}) {

  return (

    <Pressable
      disabled={
        disabled
      }
      style={[
        styles.selectionField,

        disabled &&
          styles.selectionDisabled,
      ]}
      onPress={
        onPress
      }
    >

      <Text
        numberOfLines={
          1
        }
        style={
          styles.selectionText
        }
      >
        {
          disabled
            ? "No available accounts"
            : value
        }
      </Text>


      <ChevronDown
        size={17}
        color="#8E91A5"
      />

    </Pressable>

  );

}


const styles =
  StyleSheet.create({

    page: {
      width:
        "100%",
    },


    heading: {
      flexDirection:
        "row",
      alignItems:
        "flex-start",
      justifyContent:
        "space-between",
      gap:
        12,
    },


    headingText: {
      flex:
        1,
    },


    eyebrow: {
      color:
        "#8172EA",
      fontSize:
        10,
      fontWeight:
        "800",
      letterSpacing:
        1,
    },


    title: {
      marginTop:
        6,
      color:
        "#303253",
      fontSize:
        28,
      fontWeight:
        "800",
    },


    subtitle: {
      marginTop:
        5,
      color:
        "#9699AC",
      fontSize:
        13,
      lineHeight:
        19,
    },


    refreshButton: {
      minWidth:
        100,
      height:
        40,
      paddingHorizontal:
        12,
      borderWidth:
        1,
      borderColor:
        "#E8E7F2",
      borderRadius:
        13,
      backgroundColor:
        "#FFFFFF",
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap:
        7,
    },


    refreshText: {
      color:
        "#7164D8",
      fontSize:
        12,
      fontWeight:
        "700",
    },


    disabledButton: {
      opacity:
        0.55,
    },


    summaryGrid: {
      marginTop:
        22,
      flexDirection:
        "row",
      flexWrap:
        "wrap",
      gap:
        10,
    },


    summaryCard: {
      width:
        "48%",
      minHeight:
        104,
      padding:
        14,
      borderRadius:
        18,
      borderWidth:
        1,
      borderColor:
        "#ECECF4",
      backgroundColor:
        "#FFFFFF",
    },


    summaryIcon: {
      width:
        34,
      height:
        34,
      borderRadius:
        11,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#F7F5FF",
    },


    summaryTitle: {
      marginTop:
        9,
      color:
        "#8D90A5",
      fontSize:
        10.5,
    },


    summaryValue: {
      marginTop:
        3,
      color:
        "#333553",
      fontSize:
        21,
      fontWeight:
        "800",
    },


    toolbar: {
      marginTop:
        18,
      padding:
        12,
      borderRadius:
        18,
      borderWidth:
        1,
      borderColor:
        "#ECECF4",
      backgroundColor:
        "#FFFFFF",
    },


    searchBox: {
      height:
        45,
      borderWidth:
        1,
      borderColor:
        "#E7E7F0",
      borderRadius:
        13,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap:
        10,
      paddingHorizontal:
        13,
      backgroundColor:
        "#FBFBFD",
    },


    searchInput: {
      flex:
        1,
      height:
        "100%",
      color:
        "#343654",
      fontSize:
        12,
    },


    resultCount: {
      marginTop:
        10,
      color:
        "#9699AC",
      fontSize:
        11,
      textAlign:
        "right",
    },


    errorBox: {
      marginTop:
        15,
      paddingHorizontal:
        15,
      paddingVertical:
        12,
      borderRadius:
        13,
      borderWidth:
        1,
      borderColor:
        "#F5D5DD",
      backgroundColor:
        "#FFF1F4",
    },


    errorText: {
      color:
        "#B8445D",
      fontSize:
        12,
    },


    stateBox: {
      minHeight:
        300,
      marginTop:
        18,
      borderWidth:
        1,
      borderColor:
        "#ECECF4",
      borderRadius:
        22,
      backgroundColor:
        "#FFFFFF",
      alignItems:
        "center",
      justifyContent:
        "center",
      padding:
        25,
      gap:
        9,
    },


    stateText: {
      color:
        "#9A9DAE",
      fontSize:
        13,
    },


    emptyTitle: {
      color:
        "#484A68",
      fontSize:
        16,
      fontWeight:
        "800",
    },


    childrenList: {
      marginTop:
        18,
      gap:
        15,
    },


    childCard: {
      padding:
        18,
      borderWidth:
        1,
      borderColor:
        "#ECECF4",
      borderRadius:
        21,
      backgroundColor:
        "#FFFFFF",
      shadowColor:
        "#3D3E5E",
      shadowOffset: {
        width:
          0,
        height:
          7,
      },
      shadowOpacity:
        0.035,
      shadowRadius:
        14,
      elevation:
        2,
    },


    childTop: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap:
        12,
    },


    childAvatar: {
      width:
        48,
      height:
        48,
      borderRadius:
        15,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#F3EEFF",
    },


    childAvatarText: {
      color:
        "#7968E9",
      fontSize:
        17,
      fontWeight:
        "800",
    },


    childTitleBox: {
      flex:
        1,
      minWidth:
        0,
    },


    childName: {
      color:
        "#373957",
      fontSize:
        16,
      fontWeight:
        "800",
    },


    childId: {
      marginTop:
        3,
      color:
        "#A2A5B5",
      fontSize:
        10,
    },


    scoreBox: {
      width:
        52,
      height:
        52,
      borderRadius:
        16,
      backgroundColor:
        "#F5F2FF",
      alignItems:
        "center",
      justifyContent:
        "center",
    },


    scoreValue: {
      color:
        "#7666E6",
      fontSize:
        17,
      fontWeight:
        "800",
    },


    scoreLabel: {
      color:
        "#999BAC",
      fontSize:
        8,
    },


    infoGrid: {
      marginTop:
        17,
      flexDirection:
        "row",
      gap:
        8,
    },


    infoBox: {
      flex:
        1,
      padding:
        10,
      borderRadius:
        12,
      backgroundColor:
        "#F9F9FC",
    },


    infoLabel: {
      color:
        "#A1A4B4",
      fontSize:
        9,
    },


    infoValue: {
      marginTop:
        3,
      color:
        "#5A5C72",
      fontSize:
        11,
      fontWeight:
        "700",
    },


    locationBox: {
      minHeight:
        34,
      marginTop:
        10,
      paddingHorizontal:
        10,
      borderRadius:
        11,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap:
        7,
      backgroundColor:
        "#FAFAFC",
    },


    locationText: {
      flex:
        1,
      color:
        "#85899D",
      fontSize:
        10.5,
    },


    legacyParent: {
      marginTop:
        11,
      padding:
        11,
      borderWidth:
        1,
      borderColor:
        "#EFEDF6",
      borderRadius:
        12,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      gap:
        10,
    },


    legacyLabel: {
      flex:
        1,
      color:
        "#A1A3B3",
      fontSize:
        9.5,
    },


    legacyValue: {
      maxWidth:
        130,
      color:
        "#686A80",
      fontSize:
        10.5,
      fontWeight:
        "700",
    },


    relationshipSection: {
      marginTop:
        13,
    },


    relationshipHeading: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap:
        7,
    },


    relationshipTitle: {
      color:
        "#777A90",
      fontSize:
        10.5,
      fontWeight:
        "700",
    },


    relationshipItems: {
      minHeight:
        30,
      marginTop:
        7,
      flexDirection:
        "row",
      flexWrap:
        "wrap",
      gap:
        6,
      alignItems:
        "center",
    },


    relationshipChip: {
      paddingHorizontal:
        9,
      paddingVertical:
        6,
      borderRadius:
        999,
    },


    parentChip: {
      backgroundColor:
        "#FFF0FA",
    },


    therapistChip: {
      backgroundColor:
        "#EDF6FF",
    },


    relationshipChipText: {
      fontSize:
        9.5,
      fontWeight:
        "700",
    },


    parentChipText: {
      color:
        "#BF599F",
    },


    therapistChipText: {
      color:
        "#4387C4",
    },


    noRelation: {
      color:
        "#B0B2BF",
      fontSize:
        9.5,
    },


    manageButton: {
      width:
        "100%",
      height:
        43,
      marginTop:
        15,
      borderWidth:
        1,
      borderColor:
        "#E5E0FF",
      borderRadius:
        13,
      backgroundColor:
        "#F7F4FF",
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap:
        8,
    },


    manageButtonText: {
      color:
        "#7565E6",
      fontSize:
        11,
      fontWeight:
        "700",
    },


    modalOverlay: {
      flex:
        1,
      alignItems:
        "center",
      justifyContent:
        "center",
      padding:
        18,
    },


    modalBackdrop: {
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
        "rgba(37,35,64,.40)",
    },


    assignmentModal: {
      width:
        "100%",
      maxWidth:
        620,
      maxHeight:
        "88%",
      borderRadius:
        23,
      backgroundColor:
        "#FFFFFF",
      padding:
        20,
      shadowColor:
        "#26234B",
      shadowOffset: {
        width:
          0,
        height:
          20,
      },
      shadowOpacity:
        0.2,
      shadowRadius:
        35,
      elevation:
        15,
    },


    modalHeader: {
      paddingBottom:
        17,
      borderBottomWidth:
        1,
      borderBottomColor:
        "#EFEFF5",
      flexDirection:
        "row",
      alignItems:
        "flex-start",
      justifyContent:
        "space-between",
      gap:
        15,
    },


    modalHeaderText: {
      flex:
        1,
    },


    modalEyebrow: {
      color:
        "#8070EA",
      fontSize:
        9.5,
      fontWeight:
        "800",
      letterSpacing:
        0.9,
    },


    modalTitle: {
      marginTop:
        5,
      color:
        "#353754",
      fontSize:
        21,
      fontWeight:
        "800",
    },


    closeButton: {
      width:
        37,
      height:
        37,
      borderRadius:
        11,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#F5F5F9",
    },


    modalScroll: {
      paddingBottom:
        5,
    },


    assignmentBlock: {
      marginTop:
        18,
      padding:
        15,
      borderRadius:
        17,
      borderWidth:
        1,
      borderColor:
        "#ECECF4",
    },


    assignmentHeading: {
      flexDirection:
        "row",
      alignItems:
        "flex-start",
      gap:
        10,
    },


    assignmentHeadingText: {
      flex:
        1,
    },


    assignmentTitle: {
      color:
        "#484A66",
      fontSize:
        12.5,
      fontWeight:
        "800",
    },


    assignmentSubtitle: {
      marginTop:
        2,
      color:
        "#A0A2B2",
      fontSize:
        9.5,
      lineHeight:
        14,
    },


    assignedList: {
      marginTop:
        14,
      gap:
        7,
    },


    assignedUser: {
      minHeight:
        52,
      paddingLeft:
        12,
      paddingRight:
        9,
      paddingVertical:
        8,
      borderRadius:
        12,
      backgroundColor:
        "#F9F9FC",
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      gap:
        10,
    },


    assignedUserText: {
      flex:
        1,
      minWidth:
        0,
    },


    assignedName: {
      color:
        "#505269",
      fontSize:
        11,
      fontWeight:
        "700",
    },


    assignedEmail: {
      marginTop:
        2,
      color:
        "#A2A4B3",
      fontSize:
        9.5,
    },


    removeButton: {
      width:
        33,
      height:
        33,
      borderRadius:
        9,
      backgroundColor:
        "#FFF0F2",
      alignItems:
        "center",
      justifyContent:
        "center",
    },


    assignmentEmpty: {
      marginTop:
        13,
      padding:
        11,
      borderRadius:
        11,
      backgroundColor:
        "#FAFAFC",
    },


    assignmentEmptyText: {
      color:
        "#A4A6B5",
      fontSize:
        10.5,
    },


    addSection: {
      marginTop:
        13,
      gap:
        9,
    },


    selectionField: {
      minHeight:
        45,
      paddingHorizontal:
        12,
      borderWidth:
        1,
      borderColor:
        "#E1E1EC",
      borderRadius:
        11,
      backgroundColor:
        "#FFFFFF",
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      gap:
        8,
    },


    selectionDisabled: {
      opacity:
        0.5,
      backgroundColor:
        "#F7F7F9",
    },


    selectionText: {
      flex:
        1,
      color:
        "#585A70",
      fontSize:
        10.5,
    },


    addButton: {
      height:
        43,
      paddingHorizontal:
        13,
      borderRadius:
        11,
      backgroundColor:
        "#7969EA",
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap:
        7,
    },


    addButtonDisabled: {
      opacity:
        0.45,
    },


    addButtonText: {
      color:
        "#FFFFFF",
      fontSize:
        10.5,
      fontWeight:
        "700",
    },


    noAccounts: {
      marginTop:
        13,
      padding:
        11,
      borderRadius:
        11,
      backgroundColor:
        "#FFF5F8",
    },


    noAccountsText: {
      color:
        "#A06B81",
      fontSize:
        10.5,
      lineHeight:
        16,
    },


    savingRow: {
      marginTop:
        15,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap:
        7,
    },


    savingText: {
      color:
        "#7566DF",
      fontSize:
        10.5,
    },


    pickerOverlay: {
      flex:
        1,
      alignItems:
        "center",
      justifyContent:
        "center",
      padding:
        22,
    },


    pickerBackdrop: {
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
        "rgba(37,35,64,.46)",
    },


    pickerCard: {
      width:
        "100%",
      maxWidth:
        500,
      maxHeight:
        "70%",
      padding:
        18,
      borderRadius:
        21,
      backgroundColor:
        "#FFFFFF",
    },


    pickerHeader: {
      paddingBottom:
        14,
      borderBottomWidth:
        1,
      borderBottomColor:
        "#EFEFF5",
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
    },


    pickerEyebrow: {
      color:
        "#8070EA",
      fontSize:
        9,
      fontWeight:
        "800",
      letterSpacing:
        0.8,
    },


    pickerTitle: {
      marginTop:
        4,
      color:
        "#353754",
      fontSize:
        18,
      fontWeight:
        "800",
    },


    pickerList: {
      marginTop:
        10,
      gap:
        7,
    },


    pickerUser: {
      minHeight:
        58,
      padding:
        9,
      borderRadius:
        13,
      backgroundColor:
        "#F9F9FC",
      flexDirection:
        "row",
      alignItems:
        "center",
      gap:
        10,
    },


    pickerAvatar: {
      width:
        38,
      height:
        38,
      borderRadius:
        12,
      backgroundColor:
        "#F0EDFF",
      alignItems:
        "center",
      justifyContent:
        "center",
    },


    pickerAvatarText: {
      color:
        "#7566E8",
      fontSize:
        13,
      fontWeight:
        "800",
    },


    pickerUserText: {
      flex:
        1,
      minWidth:
        0,
    },


    pickerUserName: {
      color:
        "#4A4C67",
      fontSize:
        11.5,
      fontWeight:
        "700",
    },


    pickerUserEmail: {
      marginTop:
        2,
      color:
        "#A0A2B2",
      fontSize:
        9.5,
    },


    pickerEmpty: {
      minHeight:
        100,
      alignItems:
        "center",
      justifyContent:
        "center",
    },


    pickerEmptyText: {
      color:
        "#A0A2B2",
      fontSize:
        11,
    },

  });