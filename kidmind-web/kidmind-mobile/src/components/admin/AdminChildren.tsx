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
  Pencil,
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
  notes?:
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
};


type AssignmentItem = {
  child_id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  role?:
    | "parent"
    | "therapist"
    | null;
  link_type?:
    | "parent"
    | "therapist"
    | null;
  is_active?:
    | number
    | boolean;
};


type PickerMode =
  | "parent"
  | "therapist"
  | "form_parent"
  | "form_therapist"
  | null;


type ChildForm = {
  full_name: string;
  age: string;
  gender: string;
  region: string;
  notes: string;
  parent_id:
    | number
    | null;
  therapist_id:
    | number
    | null;
};


const emptyChildForm:
  ChildForm = {
    full_name: "",
    age: "",
    gender: "",
    region: "",
    notes: "",
    parent_id: null,
    therapist_id: null,
  };


const isActiveUser =
  (
    user:
      UserItem
  ) =>
    user.is_active ===
      true ||
    Number(
      user.is_active
    ) === 1;


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


  const [
    childModalMode,
    setChildModalMode,
  ] =
    useState<
      "add" |
      "edit" |
      null
    >(null);


  const [
    editingChild,
    setEditingChild,
  ] =
    useState<
      ChildItem |
      null
    >(null);


  const [
    childForm,
    setChildForm,
  ] =
    useState<ChildForm>(
      emptyChildForm
    );


  const [
    childSaving,
    setChildSaving,
  ] =
    useState(false);


  const [
    deleteSaving,
    setDeleteSaving,
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
            isActiveUser(
              user
            )
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
            isActiveUser(
              user
            )
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


  const openAddChild =
    () => {

      setEditingChild(
        null
      );

      setChildForm({
        ...emptyChildForm,
      });

      setChildModalMode(
        "add"
      );

      setError(
        ""
      );

    };


  const openEditChild =
    (
      child:
        ChildItem
    ) => {

      setEditingChild(
        child
      );

      setChildForm({
        full_name:
          child.full_name ||
          "",
        age:
          child.age ===
            null ||
          child.age ===
            undefined
            ? ""
            : String(
                child.age
              ),
        gender:
          child.gender ||
          "",
        region:
          child.region ||
          "",
        notes:
          child.notes ||
          "",
        parent_id:
          null,
        therapist_id:
          null,
      });

      setChildModalMode(
        "edit"
      );

      setError(
        ""
      );

    };


  const closeChildModal =
    () => {

      if (
        childSaving
      ) {

        return;

      }

      setChildModalMode(
        null
      );

      setEditingChild(
        null
      );

      setChildForm({
        ...emptyChildForm,
      });

      setPickerMode(
        null
      );

    };


  const updateChildForm =
    <
      K extends
        keyof ChildForm,
    >(
      key:
        K,
      value:
        ChildForm[K]
    ) => {

      setChildForm(
        previous => ({
          ...previous,
          [key]:
            value,
        })
      );

    };


  const saveChild =
    async () => {

      const fullName =
        childForm.full_name
          .trim();

      const age =
        Number(
          childForm.age
        );

      const gender =
        childForm.gender
          .trim();

      const region =
        childForm.region
          .trim();


      if (
        !fullName ||
        !Number.isInteger(
          age
        ) ||
        age <= 0 ||
        !gender ||
        !region
      ) {

        setError(
          "Full name, age, gender and region are required."
        );

        return;

      }


      try {

        setChildSaving(
          true
        );

        setError(
          ""
        );


        if (
          childModalMode ===
          "add"
        ) {

          await authRequest(
            "/children",
            {
              method:
                "POST",
              body:
                JSON.stringify({
                  full_name:
                    fullName,
                  age,
                  gender,
                  region,
                  notes:
                    childForm.notes
                      .trim(),
                  parent_id:
                    childForm.parent_id,
                  therapist_id:
                    childForm.therapist_id,
                }),
            }
          );

        } else if (
          childModalMode ===
            "edit" &&
          editingChild
        ) {

          await authRequest(
            `/children/${editingChild.id}`,
            {
              method:
                "PUT",
              body:
                JSON.stringify({
                  full_name:
                    fullName,
                  age,
                  gender,
                  region,
                  notes:
                    childForm.notes
                      .trim(),
                }),
            }
          );

        }


        setChildModalMode(
          null
        );

        setEditingChild(
          null
        );

        setChildForm({
          ...emptyChildForm,
        });

        setPickerMode(
          null
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
            : childModalMode ===
                "add"
              ? "Unable to add child."
              : "Unable to update child."
        );

      } finally {

        setChildSaving(
          false
        );

      }

    };


  const performDeleteChild =
    async (
      child:
        ChildItem,
      deleteParent:
        boolean
    ) => {

      try {

        setDeleteSaving(
          true
        );

        setError(
          ""
        );


        await authRequest(
          `/children/${child.id}`,
          {
            method:
              "DELETE",
            body:
              JSON.stringify({
                delete_parent:
                  deleteParent,
              }),
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
            : "Unable to delete child."
        );

      } finally {

        setDeleteSaving(
          false
        );

      }

    };


  const deleteChild =
    async (
      child:
        ChildItem
    ) => {

      if (
        deleteSaving
      ) {

        return;

      }


      try {

        setError(
          ""
        );


        const info =
          await authRequest<{
            parent?:
              {
                id:
                  number;
                full_name:
                  string;
                email?:
                  string |
                  null;
              } |
              null;
            parent_children?:
              ChildItem[];
            parent_has_other_children?:
              boolean;
          }>(
            `/children/${child.id}/delete-info`
          );


        if (
          info?.parent
        ) {

          const otherChildren =
            Array.isArray(
              info.parent_children
            )
              ? info.parent_children.filter(
                  item =>
                    Number(
                      item.id
                    ) !==
                    Number(
                      child.id
                    )
                )
              : [];


          const warning =
            info.parent_has_other_children
              ? `\n\n${info.parent.full_name} is also linked to ${otherChildren.length} other child${otherChildren.length === 1 ? "" : "ren"}. Deleting the parent account will remove those parent links, but the other children will remain.`
              : "";


          Alert.alert(
            "Delete Child",
            `Delete ${child.full_name}?${warning}`,
            [
              {
                text:
                  "Cancel",
                style:
                  "cancel",
              },
              {
                text:
                  "Child Only",
                style:
                  "destructive",
                onPress:
                  () => {

                    void performDeleteChild(
                      child,
                      false
                    );

                  },
              },
              {
                text:
                  "Child & Parent",
                style:
                  "destructive",
                onPress:
                  () => {

                    void performDeleteChild(
                      child,
                      true
                    );

                  },
              },
            ]
          );

          return;

        }


        Alert.alert(
          "Delete Child",
          `Delete ${child.full_name}?`,
          [
            {
              text:
                "Cancel",
              style:
                "cancel",
            },
            {
              text:
                "Delete",
              style:
                "destructive",
              onPress:
                () => {

                  void performDeleteChild(
                    child,
                    false
                  );

                },
            },
          ]
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
            : "Unable to load deletion information."
        );

      }

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
        item.link_type ===
          "parent" ||
        item.role ===
          "parent"
    );


  const selectedTherapists =
    selectedAssignments.filter(
      item =>
        item.link_type ===
          "therapist" ||
        item.role ===
          "therapist"
    );


  const availableParents =
    selectedParents.length >
      0
      ? []
      : parentUsers;


  const availableTherapists =
    selectedTherapists.length >
      0
      ? []
      : therapistUsers;


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
        : pickerMode ===
            "form_parent"
          ? parentUsers
          : pickerMode ===
              "form_therapist"
            ? therapistUsers
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


      if (
        pickerMode ===
        "form_parent"
      ) {

        updateChildForm(
          "parent_id",
          user.id
        );

      }


      if (
        pickerMode ===
        "form_therapist"
      ) {

        updateChildForm(
          "therapist_id",
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
            Add, edit and manage children,
            assessments, parents,
            and therapists.
          </Text>

        </View>


        <View
          style={
            styles.headingActions
          }
        >

          <Pressable
            style={
              styles.addChildButton
            }
            onPress={
              openAddChild
            }
          >

            <Plus
              size={17}
              color="#FFFFFF"
            />

            <Text
              style={
                styles.addChildButtonText
              }
            >
              Add
            </Text>

          </Pressable>


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

          </Pressable>

        </View>

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
                            item.link_type ===
                              "parent" ||
                            item.role ===
                              "parent"
                        );


                      const linkedTherapists =
                        childAssignments.filter(
                          item =>
                            item.link_type ===
                              "therapist" ||
                            item.role ===
                              "therapist"
                        );


                      const rawScore =
                        child.current_cognitive_score;


                      const numericScore =
                        rawScore ===
                          null ||
                        rawScore ===
                          undefined ||
                        rawScore ===
                          ""
                          ? null
                          : Number(
                              rawScore
                            );


                      const score =
                        numericScore !==
                          null &&
                        Number.isFinite(
                          numericScore
                        )
                          ? Math.round(
                              numericScore
                            )
                          : null;


                      const assessmentValue =
                        Number(
                          child.assessment_count ??
                          0
                        );


                      const assessments =
                        Number.isFinite(
                          assessmentValue
                        )
                          ? assessmentValue
                          : 0;


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
                                    : `${score}%`
                                }
                              </Text>


                              <Text
                                style={
                                  styles.scoreLabel
                                }
                              >
                                Cognitive
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


                          <RelationshipSection
                            type="parent"
                            title="Parent"
                            items={
                              linkedParents
                            }
                            emptyText="No parent account linked"
                          />


                          <RelationshipSection
                            type="therapist"
                            title="Therapist"
                            items={
                              linkedTherapists
                            }
                            emptyText="No therapist assigned"
                          />


                          <View
                            style={
                              styles.childActions
                            }
                          >

                            <Pressable
                              style={[
                                styles.manageButton,
                                styles.assignmentAction,
                              ]}
                              onPress={() =>
                                openAssignments(
                                  child
                                )
                              }
                            >

                              <Link2
                                size={16}
                                color="#7565E6"
                              />

                              <Text
                                style={
                                  styles.manageButtonText
                                }
                              >
                                Assign
                              </Text>

                            </Pressable>


                            <Pressable
                              style={
                                styles.editButton
                              }
                              onPress={() =>
                                openEditChild(
                                  child
                                )
                              }
                            >

                              <Pencil
                                size={15}
                                color="#4D87B5"
                              />

                              <Text
                                style={
                                  styles.editButtonText
                                }
                              >
                                Edit
                              </Text>

                            </Pressable>


                            <Pressable
                              style={[
                                styles.deleteButton,
                                deleteSaving &&
                                  styles.disabledButton,
                              ]}
                              disabled={
                                deleteSaving
                              }
                              onPress={() => {

                                void deleteChild(
                                  child
                                );

                              }}
                            >

                              <Trash2
                                size={15}
                                color="#C95166"
                              />

                              <Text
                                style={
                                  styles.deleteButtonText
                                }
                              >
                                Delete
                              </Text>

                            </Pressable>

                          </View>

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
          childModalMode !==
          null
        }
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={
          closeChildModal
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
              closeChildModal
            }
          />


          <View
            style={
              styles.childFormModal
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
                  {
                    childModalMode ===
                    "add"
                      ? "ADD CHILD"
                      : "EDIT CHILD"
                  }
                </Text>

                <Text
                  style={
                    styles.modalTitle
                  }
                >
                  {
                    childModalMode ===
                    "add"
                      ? "New Child"
                      : editingChild
                          ?.full_name ||
                        "Edit Child"
                  }
                </Text>

              </View>


              <Pressable
                style={
                  styles.closeButton
                }
                disabled={
                  childSaving
                }
                onPress={
                  closeChildModal
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
                styles.childFormBody
              }
            >

              <FormField
                label="Full Name"
                value={
                  childForm.full_name
                }
                placeholder="Child full name"
                onChangeText={
                  value =>
                    updateChildForm(
                      "full_name",
                      value
                    )
                }
              />


              <View
                style={
                  styles.formRow
                }
              >

                <View
                  style={
                    styles.formHalf
                  }
                >

                  <FormField
                    label="Age"
                    value={
                      childForm.age
                    }
                    placeholder="Age"
                    keyboardType="number-pad"
                    onChangeText={
                      value =>
                        updateChildForm(
                          "age",
                          value
                        )
                    }
                  />

                </View>


                <View
                  style={
                    styles.formHalf
                  }
                >

                  <Text
                    style={
                      styles.formLabel
                    }
                  >
                    Gender
                  </Text>

                  <View
                    style={
                      styles.genderRow
                    }
                  >

                    {
                      [
                        "Male",
                        "Female",
                      ].map(
                        gender => (

                          <Pressable
                            key={
                              gender
                            }
                            style={[
                              styles.genderButton,
                              childForm.gender ===
                                gender &&
                                styles.genderButtonActive,
                            ]}
                            onPress={() =>
                              updateChildForm(
                                "gender",
                                gender
                              )
                            }
                          >

                            <Text
                              style={[
                                styles.genderButtonText,
                                childForm.gender ===
                                  gender &&
                                  styles.genderButtonTextActive,
                              ]}
                            >
                              {
                                gender
                              }
                            </Text>

                          </Pressable>

                        )
                      )
                    }

                  </View>

                </View>

              </View>


              <FormField
                label="Region"
                value={
                  childForm.region
                }
                placeholder="Region"
                onChangeText={
                  value =>
                    updateChildForm(
                      "region",
                      value
                    )
                }
              />


              <FormField
                label="Notes"
                value={
                  childForm.notes
                }
                placeholder="Therapist or admin notes"
                multiline
                onChangeText={
                  value =>
                    updateChildForm(
                      "notes",
                      value
                    )
                }
              />


              {
                childModalMode ===
                "add" && (

                  <View
                    style={
                      styles.optionalLinks
                    }
                  >

                    <Text
                      style={
                        styles.optionalLinksTitle
                      }
                    >
                      Optional Assignments
                    </Text>


                    <SelectionField
                      value={
                        childForm.parent_id
                          ? parentUsers.find(
                              user =>
                                Number(
                                  user.id
                                ) ===
                                Number(
                                  childForm.parent_id
                                )
                            )
                              ?.full_name ||
                            "Select parent"
                          : "No parent yet"
                      }
                      disabled={
                        parentUsers.length ===
                        0
                      }
                      onPress={() =>
                        setPickerMode(
                          "form_parent"
                        )
                      }
                    />


                    <SelectionField
                      value={
                        childForm.therapist_id
                          ? therapistUsers.find(
                              user =>
                                Number(
                                  user.id
                                ) ===
                                Number(
                                  childForm.therapist_id
                                )
                            )
                              ?.full_name ||
                            "Select therapist"
                          : "No therapist yet"
                      }
                      disabled={
                        therapistUsers.length ===
                        0
                      }
                      onPress={() =>
                        setPickerMode(
                          "form_therapist"
                        )
                      }
                    />

                  </View>

                )
              }


              <View
                style={
                  styles.formActions
                }
              >

                <Pressable
                  style={
                    styles.cancelButton
                  }
                  disabled={
                    childSaving
                  }
                  onPress={
                    closeChildModal
                  }
                >

                  <Text
                    style={
                      styles.cancelButtonText
                    }
                  >
                    Cancel
                  </Text>

                </Pressable>


                <Pressable
                  style={[
                    styles.saveButton,
                    childSaving &&
                      styles.disabledButton,
                  ]}
                  disabled={
                    childSaving
                  }
                  onPress={() => {

                    void saveChild();

                  }}
                >

                  {
                    childSaving
                      ? (

                        <ActivityIndicator
                          size="small"
                          color="#FFFFFF"
                        />

                      )
                      : (

                        <Text
                          style={
                            styles.saveButtonText
                          }
                        >
                          {
                            childModalMode ===
                            "add"
                              ? "Add Child"
                              : "Save Changes"
                          }
                        </Text>

                      )
                  }

                </Pressable>

              </View>

            </View>

          </View>

        </View>

      </Modal>


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
                      Each child can have one parent account
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
                  selectedParents.length ===
                    0 && (

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
                            No active parent accounts exist yet.
                          </Text>

                        </View>

                      )

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
                      Each child can have one therapist
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


                {
                  selectedTherapists.length ===
                    0 && (

                    therapistUsers.length >
                      0
                      ? (

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
                            No active therapist accounts exist yet.
                          </Text>

                        </View>

                      )

                  )
                }

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
                      "parent" ||
                    pickerMode ===
                      "form_parent"
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


function FormField({
  label,
  value,
  placeholder,
  multiline =
    false,
  keyboardType =
    "default",
  onChangeText,
}: {
  label:
    string;
  value:
    string;
  placeholder:
    string;
  multiline?:
    boolean;
  keyboardType?:
    "default" |
    "number-pad";
  onChangeText:
    (
      value:
        string
    ) => void;
}) {

  return (

    <View
      style={
        styles.formField
      }
    >

      <Text
        style={
          styles.formLabel
        }
      >
        {label}
      </Text>

      <TextInput
        value={
          value
        }
        placeholder={
          placeholder
        }
        placeholderTextColor="#A3A5B5"
        multiline={
          multiline
        }
        keyboardType={
          keyboardType
        }
        onChangeText={
          onChangeText
        }
        style={[
          styles.formInput,
          multiline &&
            styles.formTextArea,
        ]}
      />

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


    headingActions: {
      alignItems:
        "center",
      gap:
        8,
    },


    addChildButton: {
      minWidth:
        80,
      height:
        40,
      paddingHorizontal:
        12,
      borderRadius:
        13,
      backgroundColor:
        "#7969EA",
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap:
        6,
    },


    addChildButtonText: {
      color:
        "#FFFFFF",
      fontSize:
        11,
      fontWeight:
        "700",
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
        80,
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


    childActions: {
      marginTop:
        15,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap:
        7,
    },


    assignmentAction: {
      flex:
        1,
      width:
        "auto",
      height:
        41,
      marginTop:
        0,
    },


    editButton: {
      flex:
        1,
      height:
        41,
      borderRadius:
        13,
      borderWidth:
        1,
      borderColor:
        "#DCEBF7",
      backgroundColor:
        "#F2F8FD",
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap:
        6,
    },


    editButtonText: {
      color:
        "#4D87B5",
      fontSize:
        10.5,
      fontWeight:
        "700",
    },


    deleteButton: {
      flex:
        1,
      height:
        41,
      borderRadius:
        13,
      borderWidth:
        1,
      borderColor:
        "#F6DDE2",
      backgroundColor:
        "#FFF4F6",
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap:
        6,
    },


    deleteButtonText: {
      color:
        "#C95166",
      fontSize:
        10.5,
      fontWeight:
        "700",
    },


    childFormModal: {
      width:
        "92%",
      maxHeight:
        "92%",
      borderRadius:
        23,
      backgroundColor:
        "#FFFFFF",
      padding:
        20,
    },


    childFormBody: {
      marginTop:
        16,
      gap:
        13,
    },


    formRow: {
      flexDirection:
        "row",
      gap:
        10,
    },


    formHalf: {
      flex:
        1,
    },


    formField: {
      gap:
        7,
    },


    formLabel: {
      color:
        "#6B6E83",
      fontSize:
        10.5,
      fontWeight:
        "700",
    },


    formInput: {
      height:
        44,
      paddingHorizontal:
        12,
      borderWidth:
        1,
      borderColor:
        "#E2E2EB",
      borderRadius:
        12,
      backgroundColor:
        "#FBFBFD",
      color:
        "#45475F",
      fontSize:
        11.5,
    },


    formTextArea: {
      height:
        90,
      paddingTop:
        11,
      textAlignVertical:
        "top",
    },


    genderRow: {
      height:
        44,
      flexDirection:
        "row",
      gap:
        6,
    },


    genderButton: {
      flex:
        1,
      borderWidth:
        1,
      borderColor:
        "#E2E2EB",
      borderRadius:
        12,
      backgroundColor:
        "#FBFBFD",
      alignItems:
        "center",
      justifyContent:
        "center",
    },


    genderButtonActive: {
      borderColor:
        "#D9D2FF",
      backgroundColor:
        "#F2EFFF",
    },


    genderButtonText: {
      color:
        "#85889B",
      fontSize:
        10.5,
      fontWeight:
        "600",
    },


    genderButtonTextActive: {
      color:
        "#7565E6",
    },


    optionalLinks: {
      paddingTop:
        14,
      borderTopWidth:
        1,
      borderTopColor:
        "#EFEFF5",
      gap:
        10,
    },


    optionalLinksTitle: {
      color:
        "#55576D",
      fontSize:
        11,
      fontWeight:
        "800",
    },


    formActions: {
      marginTop:
        4,
      flexDirection:
        "row",
      justifyContent:
        "flex-end",
      gap:
        9,
    },


    cancelButton: {
      flex:
        1,
      height:
        42,
      borderWidth:
        1,
      borderColor:
        "#E4E4EC",
      borderRadius:
        12,
      backgroundColor:
        "#FFFFFF",
      alignItems:
        "center",
      justifyContent:
        "center",
    },


    cancelButtonText: {
      color:
        "#777A8D",
      fontSize:
        10.5,
      fontWeight:
        "700",
    },


    saveButton: {
      flex:
        1.2,
      height:
        42,
      borderRadius:
        12,
      backgroundColor:
        "#7969EA",
      alignItems:
        "center",
      justifyContent:
        "center",
    },


    saveButtonText: {
      color:
        "#FFFFFF",
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
        10.5,
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