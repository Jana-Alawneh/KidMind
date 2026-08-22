import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type {
  ReactNode,
  RefObject,
} from "react";

import {
  Baby,
  Check,
  ChevronDown,
  Edit3,
  Link2,
  Mail,
  Phone,
  Plus,
  Power,
  RefreshCw,
  Search,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react-native";

import {
  authRequest,
} from "@/api/authApi";


type ParentItem = {
  id: number;
  full_name: string;
  email: string;
  phone?: string | null;
  role:
    | "parent"
    | "therapist"
    | "admin";
  is_active:
    | number
    | boolean;
};


type ChildItem = {
  id: number;
  full_name: string;
  region?: string | null;
};


type AssignmentItem = {
  child_id: number;
  user_id: number;
  user_name?: string;
  user_email?: string;
  role:
    | "parent"
    | "therapist";
  child?: ChildItem;
};


type ParentForm = {
  full_name: string;
  email: string;
  phone: string;
  password: string;
};


type ModalMode =
  | "create"
  | "edit"
  | "children"
  | null;


const emptyForm:
  ParentForm = {
    full_name: "",
    email: "",
    phone: "",
    password: "",
  };


export default function AdminParents() {
  const [
    users,
    setUsers,
  ] =
    useState<ParentItem[]>(
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
    success,
    setSuccess,
  ] =
    useState("");

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    modalMode,
    setModalMode,
  ] =
    useState<ModalMode>(
      null
    );

  const [
    selectedParent,
    setSelectedParent,
  ] =
    useState<ParentItem | null>(
      null
    );

  const [
    form,
    setForm,
  ] =
    useState<ParentForm>(
      emptyForm
    );

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    selectedChildId,
    setSelectedChildId,
  ] =
    useState<number | null>(
      null
    );

  const [
    childPickerVisible,
    setChildPickerVisible,
  ] =
    useState(false);


  const firstInputRef =
    useRef<TextInput>(
      null
    );


  const loadData =
    async (
      manual = false
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
          usersData,
          childrenData,
          assignmentsData,
        ] =
          await Promise.all([
            authRequest<
              ParentItem[]
            >(
              "/users"
            ),

            authRequest<
              ChildItem[]
            >(
              "/children"
            ),

            authRequest<
              AssignmentItem[]
            >(
              "/users/assignments"
            ),
          ]);

        setUsers(
          Array.isArray(
            usersData
          )
            ? usersData
            : []
        );

        setChildren(
          Array.isArray(
            childrenData
          )
            ? childrenData
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
            : "Unable to load parents."
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


  const assignmentsByParent =
    useMemo(
      () => {
        const map:
          Record<
            number,
            AssignmentItem[]
          > = {};

        assignments
          .filter(
            assignment =>
              assignment.role ===
              "parent"
          )
          .forEach(
            assignment => {
              const userId =
                Number(
                  assignment.user_id
                );

              if (
                !map[
                  userId
                ]
              ) {
                map[
                  userId
                ] = [];
              }

              const child =
                children.find(
                  item =>
                    Number(
                      item.id
                    ) ===
                    Number(
                      assignment.child_id
                    )
                );

              map[
                userId
              ].push({
                ...assignment,
                child,
              });
            }
          );

        return map;
      },
      [
        assignments,
        children,
      ]
    );


  const filteredParents =
    useMemo(
      () => {
        const query =
          search
            .trim()
            .toLowerCase();

        if (
          !query
        ) {
          return parents;
        }

        return parents.filter(
          parent => {
            const linkedChildren =
              assignmentsByParent[
                Number(
                  parent.id
                )
              ] || [];

            const childrenText =
              linkedChildren
                .map(
                  item =>
                    item.child
                      ?.full_name ||
                    ""
                )
                .join(
                  " "
                );

            const searchable =
              [
                parent.full_name,
                parent.email,
                parent.phone,
                parent.id,
                childrenText,
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
        parents,
        search,
        assignmentsByParent,
      ]
    );


  const activeParents =
    parents.filter(
      parent =>
        Number(
          parent.is_active
        ) ===
        1
    ).length;


  const inactiveParents =
    parents.length -
    activeParents;


  const parentLinksCount =
    assignments.filter(
      item =>
        item.role ===
        "parent"
    ).length;


  const focusFirstField =
    () => {
      setTimeout(
        () => {
          firstInputRef
            .current
            ?.focus();
        },
        250
      );
    };


  const openCreate =
    () => {
      setModalMode(
        "create"
      );

      setSelectedParent(
        null
      );

      setSelectedChildId(
        null
      );

      setForm(
        emptyForm
      );

      setError(
        ""
      );

      setSuccess(
        ""
      );
    };


  const openEdit =
    (
      parent:
        ParentItem
    ) => {
      setModalMode(
        "edit"
      );

      setSelectedParent(
        parent
      );

      setForm({
        full_name:
          parent.full_name ||
          "",

        email:
          parent.email ||
          "",

        phone:
          parent.phone ||
          "",

        password:
          "",
      });

      setError(
        ""
      );

      setSuccess(
        ""
      );
    };


  const openChildren =
    (
      parent:
        ParentItem
    ) => {
      setModalMode(
        "children"
      );

      setSelectedParent(
        parent
      );

      setSelectedChildId(
        null
      );

      setError(
        ""
      );

      setSuccess(
        ""
      );
    };


  const closeModal =
    () => {
      if (
        saving
      ) {
        return;
      }

      firstInputRef
        .current
        ?.blur();

      setModalMode(
        null
      );

      setSelectedParent(
        null
      );

      setSelectedChildId(
        null
      );

      setForm(
        emptyForm
      );

      setChildPickerVisible(
        false
      );
    };


  const updateField =
    (
      field:
        keyof ParentForm,
      value:
        string
    ) => {
      setForm(
        previous => ({
          ...previous,
          [field]:
            value,
        })
      );
    };


  const createParent =
    async () => {
      const fullName =
        form.full_name.trim();

      const email =
        form.email
          .trim()
          .toLowerCase();

      const password =
        form.password;

      if (
        !fullName ||
        !email ||
        !password
      ) {
        setError(
          "Name, email and password are required."
        );

        return;
      }

      if (
        password.length <
        6
      ) {
        setError(
          "Password must contain at least 6 characters."
        );

        return;
      }

      try {
        setSaving(
          true
        );

        setError(
          ""
        );

        setSuccess(
          ""
        );

        await authRequest(
          "/users/register",
          {
            method:
              "POST",

            body:
              JSON.stringify({
                full_name:
                  fullName,

                email,

                password,

                role:
                  "parent",

                phone:
                  form.phone.trim() ||
                  null,
              }),
          }
        );

        setSuccess(
          "Parent account created successfully."
        );

        await loadData(
          true
        );

        setForm(
          emptyForm
        );

        setTimeout(
          () => {
            setModalMode(
              null
            );

            setSuccess(
              ""
            );
          },
          500
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
            : "Unable to create parent."
        );

      } finally {
        setSaving(
          false
        );
      }
    };


  const updateParent =
    async () => {
      if (
        !selectedParent
      ) {
        return;
      }

      const fullName =
        form.full_name.trim();

      const email =
        form.email
          .trim()
          .toLowerCase();

      if (
        !fullName ||
        !email
      ) {
        setError(
          "Name and email are required."
        );

        return;
      }

      try {
        setSaving(
          true
        );

        setError(
          ""
        );

        setSuccess(
          ""
        );

        await authRequest(
          `/users/${selectedParent.id}`,
          {
            method:
              "PUT",

            body:
              JSON.stringify({
                full_name:
                  fullName,

                email,

                phone:
                  form.phone.trim() ||
                  null,
              }),
          }
        );

        setSuccess(
          "Parent updated successfully."
        );

        await loadData(
          true
        );

        setTimeout(
          () => {
            setModalMode(
              null
            );

            setSelectedParent(
              null
            );

            setSuccess(
              ""
            );
          },
          500
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
            : "Unable to update parent."
        );

      } finally {
        setSaving(
          false
        );
      }
    };


  const performToggleStatus =
    async (
      parent:
        ParentItem
    ) => {
      const currentlyActive =
        Number(
          parent.is_active
        ) ===
        1;

      try {
        setError(
          ""
        );

        setSuccess(
          ""
        );

        await authRequest(
          `/users/${parent.id}/status`,
          {
            method:
              "PATCH",

            body:
              JSON.stringify({
                is_active:
                  !currentlyActive,
              }),
          }
        );

        setSuccess(
          currentlyActive
            ? "Parent account deactivated."
            : "Parent account activated."
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
            : "Unable to change account status."
        );
      }
    };


  const toggleStatus =
    (
      parent:
        ParentItem
    ) => {
      const currentlyActive =
        Number(
          parent.is_active
        ) ===
        1;

      Alert.alert(
        currentlyActive
          ? "Deactivate Parent"
          : "Activate Parent",
        `${
          currentlyActive
            ? "Deactivate"
            : "Activate"
        } ${parent.full_name}?`,
        [
          {
            text:
              "Cancel",
            style:
              "cancel",
          },

          {
            text:
              currentlyActive
                ? "Deactivate"
                : "Activate",

            onPress:
              () => {
                void performToggleStatus(
                  parent
                );
              },
          },
        ]
      );
    };


  const performDeleteParent =
    async (
      parent:
        ParentItem
    ) => {
      try {
        setError(
          ""
        );

        setSuccess(
          ""
        );

        await authRequest(
          `/users/${parent.id}`,
          {
            method:
              "DELETE",
          }
        );

        setSuccess(
          "Parent account deleted."
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
            : "Unable to delete parent."
        );
      }
    };


  const deleteParent =
    (
      parent:
        ParentItem
    ) => {
      Alert.alert(
        "Delete Parent",
        `Delete ${parent.full_name} permanently?\n\nTheir child links will also be removed.`,
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
                void performDeleteParent(
                  parent
                );
              },
          },
        ]
      );
    };


  const linkChild =
    async () => {
      if (
        !selectedParent ||
        !selectedChildId
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

        setSuccess(
          ""
        );

        await authRequest(
          "/users/assignments",
          {
            method:
              "POST",

            body:
              JSON.stringify({
                child_id:
                  Number(
                    selectedChildId
                  ),

                user_id:
                  Number(
                    selectedParent.id
                  ),
              }),
          }
        );

        setSuccess(
          "Child linked successfully."
        );

        setSelectedChildId(
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
            : "Unable to link child."
        );

      } finally {
        setSaving(
          false
        );
      }
    };


  const performUnlinkChild =
    async (
      childId:
        number
    ) => {
      if (
        !selectedParent
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

        setSuccess(
          ""
        );

        await authRequest(
          `/users/assignments/${childId}/${selectedParent.id}`,
          {
            method:
              "DELETE",
          }
        );

        setSuccess(
          "Child link removed."
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
            : "Unable to remove child link."
        );

      } finally {
        setSaving(
          false
        );
      }
    };


  const unlinkChild =
    (
      childId:
        number,
      childName:
        string
    ) => {
      if (
        !selectedParent
      ) {
        return;
      }

      Alert.alert(
        "Remove Child Link",
        `Remove ${childName} from ${selectedParent.full_name}?`,
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
                void performUnlinkChild(
                  childId
                );
              },
          },
        ]
      );
    };


  const selectedLinks =
    selectedParent
      ? assignmentsByParent[
          Number(
            selectedParent.id
          )
        ] || []
      : [];


  const availableChildren =
    children.filter(
      child =>
        !selectedLinks.some(
          link =>
            Number(
              link.child_id
            ) ===
            Number(
              child.id
            )
        )
    );


  const selectedChild =
    availableChildren.find(
      child =>
        Number(
          child.id
        ) ===
        Number(
          selectedChildId
        )
    );


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
            USER MANAGEMENT
          </Text>

          <Text
            style={
              styles.title
            }
          >
            Parents
          </Text>

          <Text
            style={
              styles.subtitle
            }
          >
            Create parent accounts,
            manage access and connect
            each parent to their children.
          </Text>
        </View>

        <View
          style={
            styles.headingActions
          }
        >
          <Pressable
            disabled={
              refreshing
            }
            style={[
              styles.refreshButton,

              refreshing &&
                styles.disabled,
            ]}
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
                    size={16}
                    color="#7164D8"
                  />
                )
            }
          </Pressable>

          <Pressable
            style={
              styles.addParentButton
            }
            onPress={
              openCreate
            }
          >
            <UserPlus
              size={17}
              color="#FFFFFF"
            />

            <Text
              style={
                styles.addParentText
              }
            >
              Add
            </Text>
          </Pressable>
        </View>
      </View>


      <View
        style={
          styles.statsGrid
        }
      >
        <StatCard
          icon={
            <Users
              size={20}
              color="#7868E6"
            />
          }
          label="Total Parents"
          value={
            parents.length
          }
        />

        <StatCard
          icon={
            <Check
              size={20}
              color="#438B69"
            />
          }
          label="Active"
          value={
            activeParents
          }
        />

        <StatCard
          icon={
            <Power
              size={20}
              color="#B85A68"
            />
          }
          label="Inactive"
          value={
            inactiveParents
          }
        />

        <StatCard
          icon={
            <Link2
              size={20}
              color="#5680A8"
            />
          }
          label="Child Links"
          value={
            parentLinksCount
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
            color="#A0A2B2"
          />

          <TextInput
            value={
              search
            }
            onChangeText={
              setSearch
            }
            placeholder="Search parent, email, phone or child..."
            placeholderTextColor="#A0A2B2"
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
            filteredParents.length
          }{" "}
          {
            filteredParents.length ===
            1
              ? "parent"
              : "parents"
          }
        </Text>
      </View>


      {
        Boolean(
          error
        ) && (
          <AlertBox
            type="error"
            text={
              error
            }
          />
        )
      }


      {
        Boolean(
          success
        ) && (
          <AlertBox
            type="success"
            text={
              success
            }
          />
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
                color="#7D6DE8"
              />

              <Text
                style={
                  styles.stateText
                }
              >
                Loading parents...
              </Text>
            </View>
          )
          : filteredParents.length ===
            0
            ? (
              <View
                style={
                  styles.stateBox
                }
              >
                <Users
                  size={36}
                  color="#7D6DE8"
                />

                <Text
                  style={
                    styles.emptyTitle
                  }
                >
                  No parent accounts yet
                </Text>

                <Text
                  style={
                    styles.stateText
                  }
                >
                  Create the first parent
                  account using Add Parent.
                </Text>

                <Pressable
                  style={
                    styles.emptyAddButton
                  }
                  onPress={
                    openCreate
                  }
                >
                  <Plus
                    size={16}
                    color="#FFFFFF"
                  />

                  <Text
                    style={
                      styles.emptyAddText
                    }
                  >
                    Add Parent
                  </Text>
                </Pressable>
              </View>
            )
            : (
              <View
                style={
                  styles.parentsList
                }
              >
                {
                  filteredParents.map(
                    parent => {
                      const links =
                        assignmentsByParent[
                          Number(
                            parent.id
                          )
                        ] || [];

                      const active =
                        Number(
                          parent.is_active
                        ) ===
                        1;

                      return (
                        <View
                          key={
                            parent.id
                          }
                          style={
                            styles.parentCard
                          }
                        >
                          <View
                            style={
                              styles.parentTop
                            }
                          >
                            <View
                              style={
                                styles.parentAvatar
                              }
                            >
                              <Text
                                style={
                                  styles.parentAvatarText
                                }
                              >
                                {
                                  String(
                                    parent.full_name ||
                                    "P"
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
                                styles.parentMain
                              }
                            >
                              <View
                                style={
                                  styles.parentNameRow
                                }
                              >
                                <Text
                                  numberOfLines={
                                    1
                                  }
                                  style={
                                    styles.parentName
                                  }
                                >
                                  {
                                    parent.full_name
                                  }
                                </Text>

                                <View
                                  style={[
                                    styles.statusPill,

                                    active
                                      ? styles.statusActive
                                      : styles.statusInactive,
                                  ]}
                                >
                                  <Text
                                    style={[
                                      styles.statusText,

                                      active
                                        ? styles.statusActiveText
                                        : styles.statusInactiveText,
                                    ]}
                                  >
                                    {
                                      active
                                        ? "Active"
                                        : "Inactive"
                                    }
                                  </Text>
                                </View>
                              </View>

                              <Text
                                style={
                                  styles.parentId
                                }
                              >
                                Parent ID #
                                {
                                  parent.id
                                }
                              </Text>
                            </View>
                          </View>


                          <View
                            style={
                              styles.contactBox
                            }
                          >
                            <View
                              style={
                                styles.contactRow
                              }
                            >
                              <Mail
                                size={14}
                                color="#85889B"
                              />

                              <Text
                                numberOfLines={
                                  1
                                }
                                style={
                                  styles.contactText
                                }
                              >
                                {
                                  parent.email
                                }
                              </Text>
                            </View>

                            <View
                              style={
                                styles.contactRow
                              }
                            >
                              <Phone
                                size={14}
                                color="#85889B"
                              />

                              <Text
                                numberOfLines={
                                  1
                                }
                                style={
                                  styles.contactText
                                }
                              >
                                {
                                  parent.phone ||
                                  "No phone number"
                                }
                              </Text>
                            </View>
                          </View>


                          <View
                            style={
                              styles.childrenSection
                            }
                          >
                            <View
                              style={
                                styles.childrenHeading
                              }
                            >
                              <Baby
                                size={16}
                                color="#7B6DE4"
                              />

                              <Text
                                style={
                                  styles.childrenTitle
                                }
                              >
                                Linked Children
                              </Text>

                              <View
                                style={
                                  styles.childrenCount
                                }
                              >
                                <Text
                                  style={
                                    styles.childrenCountText
                                  }
                                >
                                  {
                                    links.length
                                  }
                                </Text>
                              </View>
                            </View>

                            <View
                              style={
                                styles.childChips
                              }
                            >
                              {
                                links.length >
                                0
                                  ? links.map(
                                      link => (
                                        <View
                                          key={
                                            link.child_id
                                          }
                                          style={
                                            styles.childChip
                                          }
                                        >
                                          <Text
                                            style={
                                              styles.childChipText
                                            }
                                          >
                                            {
                                              link.child
                                                ?.full_name ||
                                              `Child #${link.child_id}`
                                            }
                                          </Text>
                                        </View>
                                      )
                                    )
                                  : (
                                    <Text
                                      style={
                                        styles.noChildrenText
                                      }
                                    >
                                      No children linked
                                    </Text>
                                  )
                              }
                            </View>
                          </View>


                          <View
                            style={
                              styles.actions
                            }
                          >
                            <Pressable
                              style={
                                styles.actionButton
                              }
                              onPress={() =>
                                openChildren(
                                  parent
                                )
                              }
                            >
                              <Link2
                                size={14}
                                color="#7063D4"
                              />

                              <Text
                                style={
                                  styles.actionText
                                }
                              >
                                Children
                              </Text>
                            </Pressable>

                            <Pressable
                              style={
                                styles.actionButton
                              }
                              onPress={() =>
                                openEdit(
                                  parent
                                )
                              }
                            >
                              <Edit3
                                size={14}
                                color="#7063D4"
                              />

                              <Text
                                style={
                                  styles.actionText
                                }
                              >
                                Edit
                              </Text>
                            </Pressable>

                            <Pressable
                              style={[
                                styles.actionButton,

                                active
                                  ? styles.disableButton
                                  : styles.enableButton,
                              ]}
                              onPress={() =>
                                toggleStatus(
                                  parent
                                )
                              }
                            >
                              <Power
                                size={14}
                                color={
                                  active
                                    ? "#B16A48"
                                    : "#438866"
                                }
                              />

                              <Text
                                style={[
                                  styles.actionText,

                                  active
                                    ? styles.disableText
                                    : styles.enableText,
                                ]}
                              >
                                {
                                  active
                                    ? "Disable"
                                    : "Enable"
                                }
                              </Text>
                            </Pressable>

                            <Pressable
                              style={
                                styles.deleteButton
                              }
                              onPress={() =>
                                deleteParent(
                                  parent
                                )
                              }
                            >
                              <Trash2
                                size={15}
                                color="#C85669"
                              />
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
          modalMode !==
          null
        }
        transparent
        animationType="fade"
        statusBarTranslucent
        hardwareAccelerated
        presentationStyle="overFullScreen"
        onShow={
          modalMode ===
            "create" ||
          modalMode ===
            "edit"
            ? focusFirstField
            : undefined
        }
        onRequestClose={
          closeModal
        }
      >
        <KeyboardAvoidingView
          style={
            styles.keyboardAvoider
          }
          behavior={
            Platform.OS ===
            "ios"
              ? "padding"
              : "height"
          }
          keyboardVerticalOffset={
            Platform.OS ===
            "ios"
              ? 10
              : 0
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
                closeModal
              }
            />

            <View
              style={
                styles.modalCard
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
                    ADMINISTRATION
                  </Text>

                  <Text
                    style={
                      styles.modalTitle
                    }
                  >
                    {
                      modalMode ===
                      "create"
                        ? "Add Parent"
                        : modalMode ===
                          "edit"
                          ? "Edit Parent"
                          : "Manage Children"
                    }
                  </Text>

                  {
                    selectedParent && (
                      <Text
                        style={
                          styles.modalParentName
                        }
                      >
                        {
                          selectedParent.full_name
                        }
                      </Text>
                    )
                  }
                </View>

                <Pressable
                  disabled={
                    saving
                  }
                  style={
                    styles.closeButton
                  }
                  onPress={
                    closeModal
                  }
                >
                  <X
                    size={20}
                    color="#818497"
                  />
                </Pressable>
              </View>


              <ScrollView
                showsVerticalScrollIndicator={
                  false
                }
                keyboardShouldPersistTaps="always"
                keyboardDismissMode="none"
                nestedScrollEnabled
                contentContainerStyle={
                  styles.modalContent
                }
              >
                {
                  Boolean(
                    error
                  ) && (
                    <AlertBox
                      type="error"
                      text={
                        error
                      }
                    />
                  )
                }

                {
                  Boolean(
                    success
                  ) && (
                    <AlertBox
                      type="success"
                      text={
                        success
                      }
                    />
                  )
                }


                {
                  modalMode ===
                  "create" && (
                    <View
                      style={
                        styles.form
                      }
                    >
                      <FormField
                        inputRef={
                          firstInputRef
                        }
                        label="Full Name"
                        value={
                          form.full_name
                        }
                        placeholder="Parent full name"
                        editable={
                          !saving
                        }
                        onChangeText={
                          value =>
                            updateField(
                              "full_name",
                              value
                            )
                        }
                      />

                      <FormField
                        label="Email Address"
                        value={
                          form.email
                        }
                        placeholder="parent@example.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        editable={
                          !saving
                        }
                        onChangeText={
                          value =>
                            updateField(
                              "email",
                              value
                            )
                        }
                      />

                      <FormField
                        label="Phone Number"
                        value={
                          form.phone
                        }
                        placeholder="Optional"
                        keyboardType="phone-pad"
                        editable={
                          !saving
                        }
                        onChangeText={
                          value =>
                            updateField(
                              "phone",
                              value
                            )
                        }
                      />

                      <FormField
                        label="Temporary Password"
                        value={
                          form.password
                        }
                        placeholder="Minimum 6 characters"
                        secureTextEntry
                        autoCapitalize="none"
                        editable={
                          !saving
                        }
                        onChangeText={
                          value =>
                            updateField(
                              "password",
                              value
                            )
                        }
                      />

                      <Pressable
                        disabled={
                          saving
                        }
                        style={[
                          styles.primaryButton,

                          saving &&
                            styles.disabled,
                        ]}
                        onPress={
                          createParent
                        }
                      >
                        {
                          saving
                            ? (
                              <ActivityIndicator
                                size="small"
                                color="#FFFFFF"
                              />
                            )
                            : (
                              <UserPlus
                                size={16}
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
                            saving
                              ? "Creating..."
                              : "Create Parent Account"
                          }
                        </Text>
                      </Pressable>
                    </View>
                  )
                }


                {
                  modalMode ===
                  "edit" && (
                    <View
                      style={
                        styles.form
                      }
                    >
                      <FormField
                        inputRef={
                          firstInputRef
                        }
                        label="Full Name"
                        value={
                          form.full_name
                        }
                        placeholder="Parent full name"
                        editable={
                          !saving
                        }
                        onChangeText={
                          value =>
                            updateField(
                              "full_name",
                              value
                            )
                        }
                      />

                      <FormField
                        label="Email Address"
                        value={
                          form.email
                        }
                        placeholder="parent@example.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        editable={
                          !saving
                        }
                        onChangeText={
                          value =>
                            updateField(
                              "email",
                              value
                            )
                        }
                      />

                      <FormField
                        label="Phone Number"
                        value={
                          form.phone
                        }
                        placeholder="Optional"
                        keyboardType="phone-pad"
                        editable={
                          !saving
                        }
                        onChangeText={
                          value =>
                            updateField(
                              "phone",
                              value
                            )
                        }
                      />

                      <Pressable
                        disabled={
                          saving
                        }
                        style={[
                          styles.primaryButton,

                          saving &&
                            styles.disabled,
                        ]}
                        onPress={
                          updateParent
                        }
                      >
                        {
                          saving
                            ? (
                              <ActivityIndicator
                                size="small"
                                color="#FFFFFF"
                              />
                            )
                            : (
                              <Check
                                size={16}
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
                            saving
                              ? "Saving..."
                              : "Save Changes"
                          }
                        </Text>
                      </Pressable>
                    </View>
                  )
                }


                {
                  modalMode ===
                    "children" &&
                  selectedParent && (
                    <View
                      style={
                        styles.manageChildren
                      }
                    >
                      <View
                        style={
                          styles.manageBlock
                        }
                      >
                        <Text
                          style={
                            styles.manageBlockTitle
                          }
                        >
                          Linked Children
                        </Text>

                        {
                          selectedLinks.length >
                          0
                            ? (
                              <View
                                style={
                                  styles.linkedChildren
                                }
                              >
                                {
                                  selectedLinks.map(
                                    link => (
                                      <View
                                        key={
                                          link.child_id
                                        }
                                        style={
                                          styles.linkedChildRow
                                        }
                                      >
                                        <View
                                          style={
                                            styles.linkedChildIcon
                                          }
                                        >
                                          <Baby
                                            size={17}
                                            color="#7365DD"
                                          />
                                        </View>

                                        <View
                                          style={
                                            styles.linkedChildMain
                                          }
                                        >
                                          <Text
                                            numberOfLines={
                                              1
                                            }
                                            style={
                                              styles.linkedChildName
                                            }
                                          >
                                            {
                                              link.child
                                                ?.full_name ||
                                              `Child #${link.child_id}`
                                            }
                                          </Text>

                                          <Text
                                            style={
                                              styles.linkedChildMeta
                                            }
                                          >
                                            ID #
                                            {
                                              link.child_id
                                            }
                                            {
                                              link.child
                                                ?.region
                                                ? ` • ${link.child.region}`
                                                : ""
                                            }
                                          </Text>
                                        </View>

                                        <Pressable
                                          disabled={
                                            saving
                                          }
                                          style={
                                            styles.unlinkButton
                                          }
                                          onPress={() =>
                                            unlinkChild(
                                              link.child_id,
                                              link.child
                                                ?.full_name ||
                                                `Child #${link.child_id}`
                                            )
                                          }
                                        >
                                          <Trash2
                                            size={15}
                                            color="#C85869"
                                          />
                                        </Pressable>
                                      </View>
                                    )
                                  )
                                }
                              </View>
                            )
                            : (
                              <View
                                style={
                                  styles.emptyLinked
                                }
                              >
                                <Text
                                  style={
                                    styles.emptyLinkedText
                                  }
                                >
                                  This parent is not linked
                                  to any child yet.
                                </Text>
                              </View>
                            )
                        }
                      </View>


                      <View
                        style={
                          styles.manageBlock
                        }
                      >
                        <Text
                          style={
                            styles.manageBlockTitle
                          }
                        >
                          Link Another Child
                        </Text>

                        {
                          Number(
                            selectedParent.is_active
                          ) !==
                          1
                            ? (
                              <View
                                style={
                                  styles.inactiveWarning
                                }
                              >
                                <Text
                                  style={
                                    styles.inactiveWarningText
                                  }
                                >
                                  Activate this parent account
                                  before linking new children.
                                </Text>
                              </View>
                            )
                            : availableChildren.length ===
                              0
                              ? (
                                <View
                                  style={
                                    styles.emptyLinked
                                  }
                                >
                                  <Text
                                    style={
                                      styles.emptyLinkedText
                                    }
                                  >
                                    All available children
                                    are already linked.
                                  </Text>
                                </View>
                              )
                              : (
                                <View
                                  style={
                                    styles.linkNewArea
                                  }
                                >
                                  <Pressable
                                    style={
                                      styles.selectionField
                                    }
                                    onPress={() =>
                                      setChildPickerVisible(
                                        true
                                      )
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
                                        selectedChild
                                          ? `${selectedChild.full_name} — ID #${selectedChild.id}`
                                          : "Select child"
                                      }
                                    </Text>

                                    <ChevronDown
                                      size={17}
                                      color="#8D90A2"
                                    />
                                  </Pressable>

                                  <Pressable
                                    disabled={
                                      !selectedChildId ||
                                      saving
                                    }
                                    style={[
                                      styles.linkButton,

                                      (
                                        !selectedChildId ||
                                        saving
                                      ) &&
                                        styles.disabled,
                                    ]}
                                    onPress={
                                      linkChild
                                    }
                                  >
                                    <Plus
                                      size={16}
                                      color="#FFFFFF"
                                    />

                                    <Text
                                      style={
                                        styles.linkButtonText
                                      }
                                    >
                                      Link Child
                                    </Text>
                                  </Pressable>
                                </View>
                              )
                        }
                      </View>
                    </View>
                  )
                }
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>


      <Modal
        visible={
          childPickerVisible
        }
        transparent
        animationType="fade"
        statusBarTranslucent
        hardwareAccelerated
        presentationStyle="overFullScreen"
        onRequestClose={() =>
          setChildPickerVisible(
            false
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
              setChildPickerVisible(
                false
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
                    styles.modalEyebrow
                  }
                >
                  SELECT CHILD
                </Text>

                <Text
                  style={
                    styles.pickerTitle
                  }
                >
                  Available Children
                </Text>
              </View>

              <Pressable
                style={
                  styles.closeButton
                }
                onPress={() =>
                  setChildPickerVisible(
                    false
                  )
                }
              >
                <X
                  size={20}
                  color="#818497"
                />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={
                false
              }
              style={
                styles.pickerList
              }
            >
              {
                availableChildren.map(
                  child => (
                    <Pressable
                      key={
                        child.id
                      }
                      style={
                        styles.pickerChild
                      }
                      onPress={() => {
                        setSelectedChildId(
                          child.id
                        );

                        setChildPickerVisible(
                          false
                        );
                      }}
                    >
                      <View
                        style={
                          styles.pickerChildIcon
                        }
                      >
                        <Baby
                          size={17}
                          color="#7365DD"
                        />
                      </View>

                      <View
                        style={
                          styles.pickerChildMain
                        }
                      >
                        <Text
                          style={
                            styles.pickerChildName
                          }
                        >
                          {
                            child.full_name
                          }
                        </Text>

                        <Text
                          style={
                            styles.pickerChildMeta
                          }
                        >
                          ID #
                          {
                            child.id
                          }
                          {
                            child.region
                              ? ` • ${child.region}`
                              : ""
                          }
                        </Text>
                      </View>
                    </Pressable>
                  )
                )
              }
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}


function StatCard({
  icon,
  label,
  value,
}: {
  icon:
    ReactNode;
  label:
    string;
  value:
    number;
}) {
  return (
    <View
      style={
        styles.statCard
      }
    >
      <View
        style={
          styles.statIcon
        }
      >
        {icon}
      </View>

      <Text
        style={
          styles.statLabel
        }
      >
        {label}
      </Text>

      <Text
        style={
          styles.statValue
        }
      >
        {value}
      </Text>
    </View>
  );
}


function AlertBox({
  type,
  text,
}: {
  type:
    "error" |
    "success";
  text:
    string;
}) {
  return (
    <View
      style={[
        styles.alertBox,

        type ===
          "error"
          ? styles.alertError
          : styles.alertSuccess,
      ]}
    >
      <Text
        style={
          type ===
          "error"
            ? styles.alertErrorText
            : styles.alertSuccessText
        }
      >
        {text}
      </Text>
    </View>
  );
}


function FormField({
  inputRef,
  label,
  value,
  placeholder,
  onChangeText,
  keyboardType,
  secureTextEntry,
  autoCapitalize,
  editable = true,
}: {
  inputRef?:
    RefObject<
      TextInput | null
    >;

  label:
    string;

  value:
    string;

  placeholder:
    string;

  onChangeText:
    (
      value:
        string
    ) => void;

  keyboardType?:
    "default" |
    "email-address" |
    "phone-pad";

  secureTextEntry?:
    boolean;

  autoCapitalize?:
    "none" |
    "sentences" |
    "words" |
    "characters";

  editable?:
    boolean;
}) {
  return (
    <View>
      <Text
        style={
          styles.formLabel
        }
      >
        {label}
      </Text>

      <TextInput
        ref={
          inputRef
        }
        value={
          value
        }
        onChangeText={
          onChangeText
        }
        placeholder={
          placeholder
        }
        placeholderTextColor="#A2A5B5"
        keyboardType={
          keyboardType ||
          "default"
        }
        secureTextEntry={
          Boolean(
            secureTextEntry
          )
        }
        autoCapitalize={
          autoCapitalize ||
          "sentences"
        }
        autoCorrect={
          false
        }
        editable={
          editable
        }
        showSoftInputOnFocus
        selectTextOnFocus={
          false
        }
        blurOnSubmit={
          false
        }
        style={
          styles.formInput
        }
      />
    </View>
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

    headingActions: {
      flexDirection:
        "row",
      gap:
        7,
    },

    refreshButton: {
      width:
        41,
      height:
        41,
      borderRadius:
        13,
      borderWidth:
        1,
      borderColor:
        "#E7E6F0",
      backgroundColor:
        "#FFFFFF",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    addParentButton: {
      height:
        41,
      paddingHorizontal:
        12,
      borderRadius:
        13,
      backgroundColor:
        "#7868E8",
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap:
        6,
    },

    addParentText: {
      color:
        "#FFFFFF",
      fontSize:
        11,
      fontWeight:
        "700",
    },

    disabled: {
      opacity:
        0.5,
    },

    statsGrid: {
      marginTop:
        22,
      flexDirection:
        "row",
      flexWrap:
        "wrap",
      gap:
        10,
    },

    statCard: {
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

    statIcon: {
      width:
        34,
      height:
        34,
      borderRadius:
        11,
      backgroundColor:
        "#F7F5FF",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    statLabel: {
      marginTop:
        9,
      color:
        "#9194A6",
      fontSize:
        10.5,
    },

    statValue: {
      marginTop:
        3,
      color:
        "#383A57",
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
      borderWidth:
        1,
      borderColor:
        "#ECECF4",
      borderRadius:
        18,
      backgroundColor:
        "#FFFFFF",
    },

    searchBox: {
      height:
        44,
      paddingHorizontal:
        13,
      borderWidth:
        1,
      borderColor:
        "#E7E7EF",
      borderRadius:
        12,
      backgroundColor:
        "#FAFAFC",
      flexDirection:
        "row",
      alignItems:
        "center",
      gap:
        9,
    },

    searchInput: {
      flex:
        1,
      height:
        "100%",
      color:
        "#42445E",
      fontSize:
        12,
    },

    resultCount: {
      marginTop:
        10,
      color:
        "#9699A9",
      fontSize:
        10.5,
      textAlign:
        "right",
    },

    alertBox: {
      marginTop:
        14,
      paddingHorizontal:
        14,
      paddingVertical:
        11,
      borderRadius:
        12,
      borderWidth:
        1,
    },

    alertError: {
      borderColor:
        "#F3D3DA",
      backgroundColor:
        "#FFF1F4",
    },

    alertSuccess: {
      borderColor:
        "#CFEBDD",
      backgroundColor:
        "#F1FBF6",
    },

    alertErrorText: {
      color:
        "#B74860",
      fontSize:
        11,
    },

    alertSuccessText: {
      color:
        "#438965",
      fontSize:
        11,
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
        21,
      backgroundColor:
        "#FFFFFF",
      alignItems:
        "center",
      justifyContent:
        "center",
      padding:
        24,
      gap:
        9,
    },

    emptyTitle: {
      marginTop:
        3,
      color:
        "#484A66",
      fontSize:
        16,
      fontWeight:
        "800",
    },

    stateText: {
      color:
        "#999CAB",
      fontSize:
        12,
      lineHeight:
        18,
      textAlign:
        "center",
    },

    emptyAddButton: {
      marginTop:
        7,
      height:
        40,
      paddingHorizontal:
        14,
      borderRadius:
        11,
      backgroundColor:
        "#7969E8",
      flexDirection:
        "row",
      alignItems:
        "center",
      gap:
        7,
    },

    emptyAddText: {
      color:
        "#FFFFFF",
      fontSize:
        11,
      fontWeight:
        "700",
    },

    parentsList: {
      marginTop:
        18,
      gap:
        15,
    },

    parentCard: {
      padding:
        18,
      borderWidth:
        1,
      borderColor:
        "#ECECF4",
      borderRadius:
        20,
      backgroundColor:
        "#FFFFFF",
    },

    parentTop: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap:
        12,
    },

    parentAvatar: {
      width:
        47,
      height:
        47,
      borderRadius:
        15,
      backgroundColor:
        "#FCEFFA",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    parentAvatarText: {
      color:
        "#B05D9A",
      fontSize:
        16,
      fontWeight:
        "800",
    },

    parentMain: {
      flex:
        1,
      minWidth:
        0,
    },

    parentNameRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      gap:
        8,
    },

    parentName: {
      flex:
        1,
      color:
        "#3E405C",
      fontSize:
        15,
      fontWeight:
        "800",
    },

    parentId: {
      marginTop:
        4,
      color:
        "#A0A3B2",
      fontSize:
        9,
    },

    statusPill: {
      paddingHorizontal:
        8,
      paddingVertical:
        5,
      borderRadius:
        999,
    },

    statusActive: {
      backgroundColor:
        "#ECF9F2",
    },

    statusInactive: {
      backgroundColor:
        "#FFF0F2",
    },

    statusText: {
      fontSize:
        8,
      fontWeight:
        "800",
    },

    statusActiveText: {
      color:
        "#438B69",
    },

    statusInactiveText: {
      color:
        "#B85A68",
    },

    contactBox: {
      marginTop:
        16,
      padding:
        11,
      borderRadius:
        12,
      backgroundColor:
        "#FAFAFC",
      gap:
        8,
    },

    contactRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap:
        8,
    },

    contactText: {
      flex:
        1,
      color:
        "#85889B",
      fontSize:
        10,
    },

    childrenSection: {
      marginTop:
        14,
    },

    childrenHeading: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap:
        7,
    },

    childrenTitle: {
      flex:
        1,
      color:
        "#74778D",
      fontSize:
        10,
      fontWeight:
        "700",
    },

    childrenCount: {
      width:
        24,
      height:
        24,
      borderRadius:
        8,
      backgroundColor:
        "#F1EEFF",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    childrenCountText: {
      color:
        "#7767E1",
      fontSize:
        9,
      fontWeight:
        "800",
    },

    childChips: {
      minHeight:
        35,
      marginTop:
        8,
      flexDirection:
        "row",
      flexWrap:
        "wrap",
      gap:
        6,
      alignItems:
        "center",
    },

    childChip: {
      paddingHorizontal:
        9,
      paddingVertical:
        6,
      borderRadius:
        999,
      backgroundColor:
        "#F1F7FF",
    },

    childChipText: {
      color:
        "#5680A8",
      fontSize:
        9,
      fontWeight:
        "700",
    },

    noChildrenText: {
      color:
        "#AAAEBB",
      fontSize:
        9,
    },

    actions: {
      marginTop:
        15,
      flexDirection:
        "row",
      flexWrap:
        "wrap",
      gap:
        7,
    },

    actionButton: {
      flexGrow:
        1,
      minWidth:
        82,
      height:
        38,
      paddingHorizontal:
        9,
      borderWidth:
        1,
      borderColor:
        "#E9E8F2",
      borderRadius:
        11,
      backgroundColor:
        "#FAFAFC",
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap:
        5,
    },

    actionText: {
      color:
        "#7063D4",
      fontSize:
        9,
      fontWeight:
        "700",
    },

    disableButton: {
      backgroundColor:
        "#FFF8EE",
    },

    disableText: {
      color:
        "#B16A48",
    },

    enableButton: {
      backgroundColor:
        "#EFFAF4",
    },

    enableText: {
      color:
        "#438866",
    },

    deleteButton: {
      width:
        42,
      height:
        38,
      borderWidth:
        1,
      borderColor:
        "#F8DDE2",
      borderRadius:
        11,
      backgroundColor:
        "#FFF1F3",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    keyboardAvoider: {
      flex:
        1,
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

    modalCard: {
      width:
        "100%",
      maxWidth:
        620,
      maxHeight:
        "90%",
      padding:
        20,
      borderRadius:
        22,
      backgroundColor:
        "#FFFFFF",
      elevation:
        15,
    },

    modalHeader: {
      flexDirection:
        "row",
      alignItems:
        "flex-start",
      justifyContent:
        "space-between",
      gap:
        15,
      paddingBottom:
        16,
      borderBottomWidth:
        1,
      borderBottomColor:
        "#EFEFF5",
    },

    modalHeaderText: {
      flex:
        1,
    },

    modalEyebrow: {
      color:
        "#7C6BE5",
      fontSize:
        9,
      fontWeight:
        "800",
      letterSpacing:
        1,
    },

    modalTitle: {
      marginTop:
        6,
      color:
        "#3E405B",
      fontSize:
        20,
      fontWeight:
        "800",
    },

    modalParentName: {
      marginTop:
        4,
      color:
        "#989BAC",
      fontSize:
        10,
    },

    closeButton: {
      width:
        36,
      height:
        36,
      borderRadius:
        11,
      backgroundColor:
        "#F5F5F9",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    modalContent: {
      paddingBottom:
        22,
    },

    form: {
      marginTop:
        18,
      gap:
        13,
    },

    formLabel: {
      color:
        "#66697F",
      fontSize:
        10,
      fontWeight:
        "700",
      marginBottom:
        6,
    },

    formInput: {
      width:
        "100%",
      height:
        50,
      paddingHorizontal:
        14,
      borderWidth:
        1,
      borderColor:
        "#E2E2EB",
      borderRadius:
        12,
      backgroundColor:
        "#FBFBFD",
      color:
        "#43455D",
      fontSize:
        13,
    },

    primaryButton: {
      height:
        48,
      marginTop:
        5,
      borderRadius:
        12,
      backgroundColor:
        "#7969E7",
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap:
        7,
    },

    primaryButtonText: {
      color:
        "#FFFFFF",
      fontSize:
        11,
      fontWeight:
        "800",
    },

    manageChildren: {
      marginTop:
        18,
      gap:
        14,
    },

    manageBlock: {
      padding:
        16,
      borderWidth:
        1,
      borderColor:
        "#ECECF4",
      borderRadius:
        16,
    },

    manageBlockTitle: {
      marginBottom:
        12,
      color:
        "#53556D",
      fontSize:
        12,
      fontWeight:
        "800",
    },

    linkedChildren: {
      gap:
        7,
    },

    linkedChildRow: {
      minHeight:
        56,
      padding:
        9,
      borderRadius:
        12,
      backgroundColor:
        "#F9F9FC",
      flexDirection:
        "row",
      alignItems:
        "center",
      gap:
        9,
    },

    linkedChildIcon: {
      width:
        34,
      height:
        34,
      borderRadius:
        10,
      backgroundColor:
        "#EFECFF",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    linkedChildMain: {
      flex:
        1,
      minWidth:
        0,
    },

    linkedChildName: {
      color:
        "#55576D",
      fontSize:
        10,
      fontWeight:
        "700",
    },

    linkedChildMeta: {
      marginTop:
        3,
      color:
        "#A0A2B2",
      fontSize:
        8.5,
    },

    unlinkButton: {
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

    emptyLinked: {
      padding:
        11,
      borderRadius:
        11,
      backgroundColor:
        "#FAFAFC",
    },

    emptyLinkedText: {
      color:
        "#9EA1B0",
      fontSize:
        10,
      lineHeight:
        15,
    },

    inactiveWarning: {
      padding:
        11,
      borderRadius:
        11,
      backgroundColor:
        "#FFF7EC",
    },

    inactiveWarningText: {
      color:
        "#AA6F4B",
      fontSize:
        10,
      lineHeight:
        15,
    },

    linkNewArea: {
      gap:
        8,
    },

    selectionField: {
      minHeight:
        43,
      paddingHorizontal:
        11,
      borderWidth:
        1,
      borderColor:
        "#E1E1EA",
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

    selectionText: {
      flex:
        1,
      color:
        "#57596E",
      fontSize:
        10,
    },

    linkButton: {
      height:
        42,
      borderRadius:
        11,
      backgroundColor:
        "#7868E6",
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap:
        6,
    },

    linkButtonText: {
      color:
        "#FFFFFF",
      fontSize:
        10,
      fontWeight:
        "700",
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
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      paddingBottom:
        14,
      borderBottomWidth:
        1,
      borderBottomColor:
        "#EFEFF5",
    },

    pickerTitle: {
      marginTop:
        4,
      color:
        "#3E405B",
      fontSize:
        18,
      fontWeight:
        "800",
    },

    pickerList: {
      marginTop:
        10,
    },

    pickerChild: {
      minHeight:
        58,
      padding:
        9,
      marginBottom:
        7,
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

    pickerChildIcon: {
      width:
        38,
      height:
        38,
      borderRadius:
        12,
      backgroundColor:
        "#EFECFF",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    pickerChildMain: {
      flex:
        1,
    },

    pickerChildName: {
      color:
        "#55576D",
      fontSize:
        11,
      fontWeight:
        "700",
    },

    pickerChildMeta: {
      marginTop:
        3,
      color:
        "#A0A2B2",
      fontSize:
        9,
    },
  });