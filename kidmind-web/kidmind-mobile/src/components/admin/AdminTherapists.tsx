import {
  ActivityIndicator,
  Alert,
  Modal,
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
  useState,
} from "react";

import type {
  ReactNode,
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
  Stethoscope,
  Trash2,
  UserPlus,
  X,
} from "lucide-react-native";

import {
  authRequest,
} from "@/api/authApi";


type TherapistItem = {
  id: number;
  full_name: string;
  email: string;
  phone?: string | null;
  role: "parent" | "therapist" | "admin";
  is_active: number | boolean;
};


type ChildItem = {
  id: number;
  full_name: string;
  region?: string | null;
};


type AssignmentItem = {
  child_id: number;
  user_id: number;
  role?: "parent" | "therapist" | null;
  link_type?: "parent" | "therapist" | null;
  child?: ChildItem;
};


type TherapistForm = {
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


const emptyForm: TherapistForm = {
  full_name: "",
  email: "",
  phone: "",
  password: "",
};


export default function AdminTherapists() {
  const [
    users,
    setUsers,
  ] = useState<TherapistItem[]>([]);

  const [
    children,
    setChildren,
  ] = useState<ChildItem[]>([]);

  const [
    assignments,
    setAssignments,
  ] = useState<AssignmentItem[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    modalMode,
    setModalMode,
  ] = useState<ModalMode>(null);

  const [
    selectedTherapist,
    setSelectedTherapist,
  ] = useState<TherapistItem | null>(
    null
  );

  const [
    form,
    setForm,
  ] = useState<TherapistForm>(
    emptyForm
  );

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    selectedChildId,
    setSelectedChildId,
  ] = useState<number | null>(
    null
  );

  const [
    childPickerVisible,
    setChildPickerVisible,
  ] = useState(false);


  const [
    availableChildOptions,
    setAvailableChildOptions,
  ] = useState<ChildItem[]>([]);


  const [
    loadingAvailableChildren,
    setLoadingAvailableChildren,
  ] = useState(false);


  const loadAvailableChildren =
    async () => {

      try {

        setLoadingAvailableChildren(
          true
        );

        const data =
          await authRequest<
            ChildItem[]
          >(
            "/users/available-children?link_type=therapist"
          );

        setAvailableChildOptions(
          Array.isArray(
            data
          )
            ? data
            : []
        );

      } catch (
        requestError
      ) {

        console.error(
          requestError
        );

        setAvailableChildOptions(
          []
        );

        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load available children."
        );

      } finally {

        setLoadingAvailableChildren(
          false
        );

      }

    };


  const loadData = async (
    manual = false
  ) => {
    try {
      if (manual) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [
        usersData,
        childrenData,
        assignmentsData,
      ] = await Promise.all([
        authRequest<TherapistItem[]>(
          "/users"
        ),

        authRequest<ChildItem[]>(
          "/children"
        ),

        authRequest<AssignmentItem[]>(
          "/users/assignments"
        ),
      ]);

      setUsers(
        Array.isArray(usersData)
          ? usersData
          : []
      );

      setChildren(
        Array.isArray(childrenData)
          ? childrenData
          : []
      );

      setAssignments(
        Array.isArray(assignmentsData)
          ? assignmentsData
          : []
      );
    } catch (requestError) {
      console.error(requestError);

      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load therapists."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  useEffect(
    () => {
      loadData();
    },
    []
  );


  const therapists =
    useMemo(
      () =>
        users.filter(
          user =>
            user.role ===
            "therapist"
        ),
      [users]
    );


  const assignmentsByTherapist =
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
              assignment.link_type ===
                "therapist" ||
              assignment.role ===
                "therapist"
          )
          .forEach(
            assignment => {
              const userId =
                Number(
                  assignment.user_id
                );

              if (!map[userId]) {
                map[userId] = [];
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

              map[userId].push({
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


  const filteredTherapists =
    useMemo(
      () => {
        const query =
          search
            .trim()
            .toLowerCase();

        if (!query) {
          return therapists;
        }

        return therapists.filter(
          therapist => {
            const linkedChildren =
              assignmentsByTherapist[
                Number(
                  therapist.id
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
                .join(" ");

            const searchable = [
              therapist.full_name,
              therapist.email,
              therapist.phone,
              therapist.id,
              childrenText,
            ]
              .filter(
                value =>
                  value !== null &&
                  value !== undefined
              )
              .join(" ")
              .toLowerCase();

            return searchable.includes(
              query
            );
          }
        );
      },
      [
        therapists,
        search,
        assignmentsByTherapist,
      ]
    );


  const activeTherapists =
    therapists.filter(
      therapist =>
        therapist.is_active ===
          true ||
        Number(
          therapist.is_active
        ) === 1
    ).length;


  const inactiveTherapists =
    therapists.length -
    activeTherapists;


  const therapistLinks =
    assignments.filter(
      assignment =>
        assignment.link_type ===
          "therapist" ||
        assignment.role ===
          "therapist"
    ).length;


  const selectedLinks =
    selectedTherapist
      ? assignmentsByTherapist[
          Number(
            selectedTherapist.id
          )
        ] || []
      : [];


  const availableChildren =
    availableChildOptions.filter(
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


  const openCreate = () => {
    setModalMode("create");
    setSelectedTherapist(null);
    setSelectedChildId(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
  };


  const openEdit = (
    therapist: TherapistItem
  ) => {
    setModalMode("edit");
    setSelectedTherapist(
      therapist
    );
    setSelectedChildId(null);

    setForm({
      full_name:
        therapist.full_name || "",

      email:
        therapist.email || "",

      phone:
        therapist.phone || "",

      password:
        "",
    });

    setError("");
    setSuccess("");
  };


  const openChildren = async (
    therapist: TherapistItem
  ) => {
    setModalMode("children");
    setSelectedTherapist(
      therapist
    );
    setSelectedChildId(null);
    setAvailableChildOptions([]);
    setError("");
    setSuccess("");

    await loadAvailableChildren();
  };


  const closeModal = () => {
    if (saving) {
      return;
    }

    setModalMode(null);
    setSelectedTherapist(null);
    setSelectedChildId(null);
    setChildPickerVisible(false);
    setAvailableChildOptions([]);
    setForm(emptyForm);
    setError("");
    setSuccess("");
  };


  const updateField = (
    field: keyof TherapistForm,
    value: string
  ) => {
    setForm(
      previous => ({
        ...previous,
        [field]: value,
      })
    );
  };


  const createTherapist =
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
        password.length < 6
      ) {
        setError(
          "Password must contain at least 6 characters."
        );

        return;
      }

      try {
        setSaving(true);
        setError("");
        setSuccess("");

        await authRequest(
          "/users/register",
          {
            method: "POST",

            body:
              JSON.stringify({
                full_name:
                  fullName,

                email,

                password,

                role:
                  "therapist",

                phone:
                  form.phone.trim() ||
                  null,
              }),
          }
        );

        setSuccess(
          "Therapist account created successfully."
        );

        await loadData(true);

        setForm(emptyForm);

        setTimeout(
          () => {
            setModalMode(null);
            setSuccess("");
          },
          500
        );
      } catch (requestError) {
        console.error(
          requestError
        );

        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to create therapist."
        );
      } finally {
        setSaving(false);
      }
    };


  const updateTherapist =
    async () => {
      if (!selectedTherapist) {
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
        setSaving(true);
        setError("");
        setSuccess("");

        await authRequest(
          `/users/${selectedTherapist.id}`,
          {
            method: "PUT",

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
          "Therapist updated successfully."
        );

        await loadData(true);

        setTimeout(
          () => {
            setModalMode(null);
            setSelectedTherapist(
              null
            );
            setSuccess("");
          },
          500
        );
      } catch (requestError) {
        console.error(
          requestError
        );

        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to update therapist."
        );
      } finally {
        setSaving(false);
      }
    };


  const performToggleStatus =
    async (
      therapist: TherapistItem
    ) => {
      const currentlyActive =
        therapist.is_active ===
          true ||
        Number(
          therapist.is_active
        ) === 1;

      try {
        setError("");
        setSuccess("");

        await authRequest(
          `/users/${therapist.id}/status`,
          {
            method: "PATCH",

            body:
              JSON.stringify({
                is_active:
                  !currentlyActive,
              }),
          }
        );

        setSuccess(
          currentlyActive
            ? "Therapist account deactivated."
            : "Therapist account activated."
        );

        await loadData(true);
      } catch (requestError) {
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


  const toggleStatus = (
    therapist: TherapistItem
  ) => {
    const currentlyActive =
      Number(
        therapist.is_active
      ) === 1;

    Alert.alert(
      currentlyActive
        ? "Deactivate Therapist"
        : "Activate Therapist",

      `${
        currentlyActive
          ? "Deactivate"
          : "Activate"
      } ${therapist.full_name}?`,

      [
        {
          text: "Cancel",
          style: "cancel",
        },

        {
          text:
            currentlyActive
              ? "Deactivate"
              : "Activate",

          onPress: () => {
            void performToggleStatus(
              therapist
            );
          },
        },
      ]
    );
  };


  const performDeleteTherapist =
    async (
      therapist: TherapistItem
    ) => {
      try {
        setError("");
        setSuccess("");

        await authRequest(
          `/users/${therapist.id}`,
          {
            method: "DELETE",
          }
        );

        setSuccess(
          "Therapist account deleted."
        );

        await loadData(true);
      } catch (requestError) {
        console.error(
          requestError
        );

        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to delete therapist."
        );
      }
    };


  const deleteTherapist = (
    therapist: TherapistItem
  ) => {
    Alert.alert(
      "Delete Therapist",

      `Delete ${therapist.full_name} permanently?\n\nTheir child assignments will also be removed.`,

      [
        {
          text: "Cancel",
          style: "cancel",
        },

        {
          text: "Delete",
          style: "destructive",

          onPress: () => {
            void performDeleteTherapist(
              therapist
            );
          },
        },
      ]
    );
  };


  const linkChild =
    async () => {
      if (
        !selectedTherapist ||
        !selectedChildId
      ) {
        return;
      }

      try {
        setSaving(true);
        setError("");
        setSuccess("");

        await authRequest(
          "/users/assignments",
          {
            method: "POST",

            body:
              JSON.stringify({
                child_id:
                  Number(
                    selectedChildId
                  ),

                user_id:
                  Number(
                    selectedTherapist.id
                  ),
              }),
          }
        );

        setSuccess(
          "Child assigned successfully."
        );

        setSelectedChildId(null);

        await loadData(true);
        await loadAvailableChildren();
      } catch (requestError) {
        console.error(
          requestError
        );

        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to assign child."
        );
      } finally {
        setSaving(false);
      }
    };


  const performUnlinkChild =
    async (
      childId: number
    ) => {
      if (!selectedTherapist) {
        return;
      }

      try {
        setSaving(true);
        setError("");
        setSuccess("");

        await authRequest(
          `/users/assignments/${childId}/${selectedTherapist.id}`,
          {
            method: "DELETE",
          }
        );

        setSuccess(
          "Child assignment removed."
        );

        await loadData(true);
        await loadAvailableChildren();
      } catch (requestError) {
        console.error(
          requestError
        );

        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to remove child assignment."
        );
      } finally {
        setSaving(false);
      }
    };


  const unlinkChild = (
    childId: number,
    childName: string
  ) => {
    if (!selectedTherapist) {
      return;
    }

    Alert.alert(
      "Remove Child",

      `Remove ${childName} from ${selectedTherapist.full_name}?`,

      [
        {
          text: "Cancel",
          style: "cancel",
        },

        {
          text: "Remove",
          style: "destructive",

          onPress: () => {
            void performUnlinkChild(
              childId
            );
          },
        },
      ]
    );
  };


  return (
    <View style={styles.page}>
      <View style={styles.heading}>
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
            Therapists
          </Text>

          <Text
            style={
              styles.subtitle
            }
          >
            Manage therapist accounts,
            account access and each
            therapist&apos;s assigned
            children.
          </Text>
        </View>

        <View
          style={
            styles.headingActions
          }
        >
          <Pressable
            disabled={refreshing}
            style={[
              styles.refreshButton,
              refreshing &&
                styles.disabled,
            ]}
            onPress={() =>
              loadData(true)
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
              styles.addButton
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
                styles.addButtonText
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
            <Stethoscope
              size={20}
              color="#5595DD"
            />
          }
          label="Total Therapists"
          value={
            therapists.length
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
            activeTherapists
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
            inactiveTherapists
          }
        />

        <StatCard
          icon={
            <Link2
              size={20}
              color="#5680A8"
            />
          }
          label="Child Assignments"
          value={
            therapistLinks
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
            value={search}
            onChangeText={
              setSearch
            }
            placeholder="Search therapist, email, phone or child..."
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
            filteredTherapists.length
          }{" "}
          {
            filteredTherapists.length ===
            1
              ? "therapist"
              : "therapists"
          }
        </Text>
      </View>


      {
        Boolean(error) && (
          <AlertBox
            type="error"
            text={error}
          />
        )
      }


      {
        Boolean(success) && (
          <AlertBox
            type="success"
            text={success}
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
                color="#5595DD"
              />

              <Text
                style={
                  styles.stateText
                }
              >
                Loading therapists...
              </Text>
            </View>
          )
          : filteredTherapists.length ===
            0
            ? (
              <View
                style={
                  styles.stateBox
                }
              >
                <Stethoscope
                  size={36}
                  color="#5595DD"
                />

                <Text
                  style={
                    styles.emptyTitle
                  }
                >
                  No therapist accounts yet
                </Text>

                <Text
                  style={
                    styles.stateText
                  }
                >
                  Create the first therapist
                  account using Add Therapist.
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
                    Add Therapist
                  </Text>
                </Pressable>
              </View>
            )
            : (
              <View
                style={
                  styles.therapistsList
                }
              >
                {
                  filteredTherapists.map(
                    therapist => {
                      const links =
                        assignmentsByTherapist[
                          Number(
                            therapist.id
                          )
                        ] || [];

                      const active =
                        Number(
                          therapist.is_active
                        ) === 1;

                      return (
                        <View
                          key={
                            therapist.id
                          }
                          style={
                            styles.therapistCard
                          }
                        >
                          <View
                            style={
                              styles.therapistTop
                            }
                          >
                            <View
                              style={
                                styles.therapistAvatar
                              }
                            >
                              <Text
                                style={
                                  styles.therapistAvatarText
                                }
                              >
                                {
                                  String(
                                    therapist.full_name ||
                                    "T"
                                  )
                                    .charAt(0)
                                    .toUpperCase()
                                }
                              </Text>
                            </View>

                            <View
                              style={
                                styles.therapistMain
                              }
                            >
                              <View
                                style={
                                  styles.nameRow
                                }
                              >
                                <Text
                                  numberOfLines={1}
                                  style={
                                    styles.therapistName
                                  }
                                >
                                  {
                                    therapist.full_name
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
                                  styles.therapistId
                                }
                              >
                                Therapist ID #
                                {
                                  therapist.id
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
                                numberOfLines={1}
                                style={
                                  styles.contactText
                                }
                              >
                                {
                                  therapist.email
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
                                numberOfLines={1}
                                style={
                                  styles.contactText
                                }
                              >
                                {
                                  therapist.phone ||
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
                                color="#5595DD"
                              />

                              <Text
                                style={
                                  styles.childrenTitle
                                }
                              >
                                Assigned Children
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
                                links.length > 0
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
                                      No children assigned
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
                                  therapist
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
                                  therapist
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
                                  therapist
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
                                deleteTherapist(
                                  therapist
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
          modalMode !== null
        }
        transparent
        animationType="fade"
        statusBarTranslucent
        hardwareAccelerated
        presentationStyle="overFullScreen"
        onRequestClose={
          closeModal
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
                      ? "Add Therapist"
                      : modalMode ===
                        "edit"
                        ? "Edit Therapist"
                        : "Manage Children"
                  }
                </Text>

                {
                  selectedTherapist && (
                    <Text
                      style={
                        styles.modalPersonName
                      }
                    >
                      {
                        selectedTherapist.full_name
                      }
                    </Text>
                  )
                }
              </View>

              <Pressable
                disabled={saving}
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
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
              contentContainerStyle={
                styles.modalContent
              }
            >
              {
                Boolean(error) && (
                  <AlertBox
                    type="error"
                    text={error}
                  />
                )
              }

              {
                Boolean(success) && (
                  <AlertBox
                    type="success"
                    text={success}
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
                      label="Full Name"
                      value={
                        form.full_name
                      }
                      placeholder="Therapist full name"
                      editable={!saving}
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
                      placeholder="therapist@example.com"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      editable={!saving}
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
                      editable={!saving}
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
                      editable={!saving}
                      onChangeText={
                        value =>
                          updateField(
                            "password",
                            value
                          )
                      }
                    />

                    <Pressable
                      disabled={saving}
                      style={[
                        styles.primaryButton,
                        saving &&
                          styles.disabled,
                      ]}
                      onPress={
                        createTherapist
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
                            : "Create Therapist Account"
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
                      label="Full Name"
                      value={
                        form.full_name
                      }
                      placeholder="Therapist full name"
                      editable={!saving}
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
                      placeholder="therapist@example.com"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      editable={!saving}
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
                      editable={!saving}
                      onChangeText={
                        value =>
                          updateField(
                            "phone",
                            value
                          )
                      }
                    />

                    <Pressable
                      disabled={saving}
                      style={[
                        styles.primaryButton,
                        saving &&
                          styles.disabled,
                      ]}
                      onPress={
                        updateTherapist
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
                selectedTherapist && (
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
                        Assigned Children
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
                                          color="#4F8BC8"
                                        />
                                      </View>

                                      <View
                                        style={
                                          styles.linkedChildMain
                                        }
                                      >
                                        <Text
                                          numberOfLines={1}
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
                                        disabled={saving}
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
                                This therapist has no
                                assigned children yet.
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
                        Assign Another Child
                      </Text>

                      {
                        Number(
                          selectedTherapist.is_active
                        ) !== 1
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
                                Activate this therapist
                                account before assigning
                                new children.
                              </Text>
                            </View>
                          )
                          : loadingAvailableChildren
                            ? (
                              <View
                                style={
                                  styles.emptyLinked
                                }
                              >
                                <ActivityIndicator
                                  size="small"
                                  color="#5595DD"
                                />

                                <Text
                                  style={
                                    styles.emptyLinkedText
                                  }
                                >
                                  Loading available children...
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
                                  No unassigned children
                                  are available.
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
                                    numberOfLines={1}
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
                                    Assign Child
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
                          color="#4F8BC8"
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
  icon: ReactNode;
  label: string;
  value: number;
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
  text: string;
}) {
  return (
    <View
      style={[
        styles.alertBox,

        type === "error"
          ? styles.alertError
          : styles.alertSuccess,
      ]}
    >
      <Text
        style={
          type === "error"
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
  label,
  value,
  placeholder,
  onChangeText,
  keyboardType,
  secureTextEntry,
  autoCapitalize,
  editable = true,
}: {
  label: string;
  value: string;
  placeholder: string;

  onChangeText:
    (value: string) => void;

  keyboardType?:
    "default" |
    "email-address" |
    "phone-pad";

  secureTextEntry?: boolean;

  autoCapitalize?:
    "none" |
    "sentences" |
    "words" |
    "characters";

  editable?: boolean;
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
        value={value}
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
        autoCorrect={false}
        editable={editable}
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
      width: "100%",
    },

    heading: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 12,
    },

    headingText: {
      flex: 1,
    },

    eyebrow: {
      color: "#8172EA",
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 1,
    },

    title: {
      marginTop: 6,
      color: "#303253",
      fontSize: 28,
      fontWeight: "800",
    },

    subtitle: {
      marginTop: 5,
      color: "#9699AC",
      fontSize: 13,
      lineHeight: 19,
    },

    headingActions: {
      flexDirection: "row",
      gap: 7,
    },

    refreshButton: {
      width: 41,
      height: 41,
      borderRadius: 13,
      borderWidth: 1,
      borderColor: "#E7E6F0",
      backgroundColor: "#FFFFFF",
      alignItems: "center",
      justifyContent: "center",
    },

    addButton: {
      height: 41,
      paddingHorizontal: 12,
      borderRadius: 13,
      backgroundColor: "#7868E8",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
    },

    addButtonText: {
      color: "#FFFFFF",
      fontSize: 11,
      fontWeight: "700",
    },

    disabled: {
      opacity: 0.5,
    },

    statsGrid: {
      marginTop: 22,
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },

    statCard: {
      width: "48%",
      minHeight: 104,
      padding: 14,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: "#ECECF4",
      backgroundColor: "#FFFFFF",
    },

    statIcon: {
      width: 34,
      height: 34,
      borderRadius: 11,
      backgroundColor: "#EDF6FF",
      alignItems: "center",
      justifyContent: "center",
    },

    statLabel: {
      marginTop: 9,
      color: "#9194A6",
      fontSize: 10.5,
    },

    statValue: {
      marginTop: 3,
      color: "#383A57",
      fontSize: 21,
      fontWeight: "800",
    },

    toolbar: {
      marginTop: 18,
      padding: 12,
      borderWidth: 1,
      borderColor: "#ECECF4",
      borderRadius: 18,
      backgroundColor: "#FFFFFF",
    },

    searchBox: {
      height: 44,
      paddingHorizontal: 13,
      borderWidth: 1,
      borderColor: "#E7E7EF",
      borderRadius: 12,
      backgroundColor: "#FAFAFC",
      flexDirection: "row",
      alignItems: "center",
      gap: 9,
    },

    searchInput: {
      flex: 1,
      height: "100%",
      color: "#42445E",
      fontSize: 12,
    },

    resultCount: {
      marginTop: 10,
      color: "#9699A9",
      fontSize: 10.5,
      textAlign: "right",
    },

    alertBox: {
      marginTop: 14,
      paddingHorizontal: 14,
      paddingVertical: 11,
      borderRadius: 12,
      borderWidth: 1,
    },

    alertError: {
      borderColor: "#F3D3DA",
      backgroundColor: "#FFF1F4",
    },

    alertSuccess: {
      borderColor: "#CFEBDD",
      backgroundColor: "#F1FBF6",
    },

    alertErrorText: {
      color: "#B74860",
      fontSize: 11,
    },

    alertSuccessText: {
      color: "#438965",
      fontSize: 11,
    },

    stateBox: {
      minHeight: 300,
      marginTop: 18,
      borderWidth: 1,
      borderColor: "#ECECF4",
      borderRadius: 21,
      backgroundColor: "#FFFFFF",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      gap: 9,
    },

    emptyTitle: {
      marginTop: 3,
      color: "#484A66",
      fontSize: 16,
      fontWeight: "800",
      textAlign: "center",
    },

    stateText: {
      color: "#999CAB",
      fontSize: 12,
      lineHeight: 18,
      textAlign: "center",
    },

    emptyAddButton: {
      marginTop: 7,
      height: 40,
      paddingHorizontal: 14,
      borderRadius: 11,
      backgroundColor: "#7969E8",
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
    },

    emptyAddText: {
      color: "#FFFFFF",
      fontSize: 11,
      fontWeight: "700",
    },

    therapistsList: {
      marginTop: 18,
      gap: 15,
    },

    therapistCard: {
      padding: 18,
      borderWidth: 1,
      borderColor: "#ECECF4",
      borderRadius: 20,
      backgroundColor: "#FFFFFF",
    },

    therapistTop: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },

    therapistAvatar: {
      width: 47,
      height: 47,
      borderRadius: 15,
      backgroundColor: "#EDF6FF",
      alignItems: "center",
      justifyContent: "center",
    },

    therapistAvatarText: {
      color: "#4B8BC8",
      fontSize: 16,
      fontWeight: "800",
    },

    therapistMain: {
      flex: 1,
      minWidth: 0,
    },

    nameRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
    },

    therapistName: {
      flex: 1,
      color: "#3E405C",
      fontSize: 15,
      fontWeight: "800",
    },

    therapistId: {
      marginTop: 4,
      color: "#A0A3B2",
      fontSize: 9,
    },

    statusPill: {
      paddingHorizontal: 8,
      paddingVertical: 5,
      borderRadius: 999,
    },

    statusActive: {
      backgroundColor: "#ECF9F2",
    },

    statusInactive: {
      backgroundColor: "#FFF0F2",
    },

    statusText: {
      fontSize: 8,
      fontWeight: "800",
    },

    statusActiveText: {
      color: "#438B69",
    },

    statusInactiveText: {
      color: "#B85A68",
    },

    contactBox: {
      marginTop: 16,
      padding: 11,
      borderRadius: 12,
      backgroundColor: "#FAFAFC",
      gap: 8,
    },

    contactRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },

    contactText: {
      flex: 1,
      color: "#85889B",
      fontSize: 10,
    },

    childrenSection: {
      marginTop: 14,
    },

    childrenHeading: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
    },

    childrenTitle: {
      flex: 1,
      color: "#74778D",
      fontSize: 10,
      fontWeight: "700",
    },

    childrenCount: {
      width: 24,
      height: 24,
      borderRadius: 8,
      backgroundColor: "#EDF6FF",
      alignItems: "center",
      justifyContent: "center",
    },

    childrenCountText: {
      color: "#4B89C5",
      fontSize: 9,
      fontWeight: "800",
    },

    childChips: {
      minHeight: 35,
      marginTop: 8,
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
      alignItems: "center",
    },

    childChip: {
      paddingHorizontal: 9,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: "#EDF6FF",
    },

    childChipText: {
      color: "#5680A8",
      fontSize: 9,
      fontWeight: "700",
    },

    noChildrenText: {
      color: "#AAAEBB",
      fontSize: 9,
    },

    actions: {
      marginTop: 15,
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 7,
    },

    actionButton: {
      flexGrow: 1,
      minWidth: 82,
      height: 38,
      paddingHorizontal: 9,
      borderWidth: 1,
      borderColor: "#E9E8F2",
      borderRadius: 11,
      backgroundColor: "#FAFAFC",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
    },

    actionText: {
      color: "#7063D4",
      fontSize: 9,
      fontWeight: "700",
    },

    disableButton: {
      backgroundColor: "#FFF8EE",
    },

    disableText: {
      color: "#B16A48",
    },

    enableButton: {
      backgroundColor: "#EFFAF4",
    },

    enableText: {
      color: "#438866",
    },

    deleteButton: {
      width: 42,
      height: 38,
      borderWidth: 1,
      borderColor: "#F8DDE2",
      borderRadius: 11,
      backgroundColor: "#FFF1F3",
      alignItems: "center",
      justifyContent: "center",
    },

    modalOverlay: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 18,
    },

    modalBackdrop: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor:
        "rgba(37,35,64,.40)",
    },

    modalCard: {
      width: "100%",
      maxWidth: 620,
      maxHeight: "82%",
      padding: 20,
      borderRadius: 22,
      backgroundColor: "#FFFFFF",
      elevation: 15,
    },

    modalHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 15,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: "#EFEFF5",
    },

    modalHeaderText: {
      flex: 1,
    },

    modalEyebrow: {
      color: "#7C6BE5",
      fontSize: 9,
      fontWeight: "800",
      letterSpacing: 1,
    },

    modalTitle: {
      marginTop: 6,
      color: "#3E405B",
      fontSize: 20,
      fontWeight: "800",
    },

    modalPersonName: {
      marginTop: 4,
      color: "#989BAC",
      fontSize: 10,
    },

    closeButton: {
      width: 36,
      height: 36,
      borderRadius: 11,
      backgroundColor: "#F5F5F9",
      alignItems: "center",
      justifyContent: "center",
    },

    modalContent: {
      paddingBottom: 28,
    },

    form: {
      marginTop: 18,
      gap: 13,
    },

    formLabel: {
      color: "#66697F",
      fontSize: 10,
      fontWeight: "700",
      marginBottom: 6,
    },

    formInput: {
      width: "100%",
      height: 50,
      paddingHorizontal: 14,
      borderWidth: 1,
      borderColor: "#E2E2EB",
      borderRadius: 12,
      backgroundColor: "#FBFBFD",
      color: "#43455D",
      fontSize: 13,
    },

    primaryButton: {
      height: 48,
      marginTop: 5,
      borderRadius: 12,
      backgroundColor: "#7969E7",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
    },

    primaryButtonText: {
      color: "#FFFFFF",
      fontSize: 11,
      fontWeight: "800",
    },

    manageChildren: {
      marginTop: 18,
      gap: 14,
    },

    manageBlock: {
      padding: 16,
      borderWidth: 1,
      borderColor: "#ECECF4",
      borderRadius: 16,
    },

    manageBlockTitle: {
      marginBottom: 12,
      color: "#53556D",
      fontSize: 12,
      fontWeight: "800",
    },

    linkedChildren: {
      gap: 7,
    },

    linkedChildRow: {
      minHeight: 56,
      padding: 9,
      borderRadius: 12,
      backgroundColor: "#F9F9FC",
      flexDirection: "row",
      alignItems: "center",
      gap: 9,
    },

    linkedChildIcon: {
      width: 34,
      height: 34,
      borderRadius: 10,
      backgroundColor: "#EDF6FF",
      alignItems: "center",
      justifyContent: "center",
    },

    linkedChildMain: {
      flex: 1,
      minWidth: 0,
    },

    linkedChildName: {
      color: "#55576D",
      fontSize: 10,
      fontWeight: "700",
    },

    linkedChildMeta: {
      marginTop: 3,
      color: "#A0A2B2",
      fontSize: 8.5,
    },

    unlinkButton: {
      width: 33,
      height: 33,
      borderRadius: 9,
      backgroundColor: "#FFF0F2",
      alignItems: "center",
      justifyContent: "center",
    },

    emptyLinked: {
      padding: 11,
      borderRadius: 11,
      backgroundColor: "#FAFAFC",
    },

    emptyLinkedText: {
      color: "#9EA1B0",
      fontSize: 10,
      lineHeight: 15,
    },

    inactiveWarning: {
      padding: 11,
      borderRadius: 11,
      backgroundColor: "#FFF7EC",
    },

    inactiveWarningText: {
      color: "#AA6F4B",
      fontSize: 10,
      lineHeight: 15,
    },

    linkNewArea: {
      gap: 8,
    },

    selectionField: {
      minHeight: 43,
      paddingHorizontal: 11,
      borderWidth: 1,
      borderColor: "#E1E1EA",
      borderRadius: 11,
      backgroundColor: "#FFFFFF",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
    },

    selectionText: {
      flex: 1,
      color: "#57596E",
      fontSize: 10,
    },

    linkButton: {
      height: 42,
      borderRadius: 11,
      backgroundColor: "#7868E6",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
    },

    linkButtonText: {
      color: "#FFFFFF",
      fontSize: 10,
      fontWeight: "700",
    },

    pickerOverlay: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 22,
    },

    pickerBackdrop: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor:
        "rgba(37,35,64,.46)",
    },

    pickerCard: {
      width: "100%",
      maxWidth: 500,
      maxHeight: "70%",
      padding: 18,
      borderRadius: 21,
      backgroundColor: "#FFFFFF",
    },

    pickerHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: "#EFEFF5",
    },

    pickerTitle: {
      marginTop: 4,
      color: "#3E405B",
      fontSize: 18,
      fontWeight: "800",
    },

    pickerList: {
      marginTop: 10,
    },

    pickerChild: {
      minHeight: 58,
      padding: 9,
      marginBottom: 7,
      borderRadius: 13,
      backgroundColor: "#F9F9FC",
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },

    pickerChildIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: "#EDF6FF",
      alignItems: "center",
      justifyContent: "center",
    },

    pickerChildMain: {
      flex: 1,
    },

    pickerChildName: {
      color: "#55576D",
      fontSize: 11,
      fontWeight: "700",
    },

    pickerChildMeta: {
      marginTop: 3,
      color: "#A0A2B2",
      fontSize: 9,
    },
  });