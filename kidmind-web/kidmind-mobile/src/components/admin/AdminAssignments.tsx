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
  AlertTriangle,
  ArrowRightLeft,
  Baby,
  Check,
  CheckCircle2,
  ChevronDown,
  Link2,
  RefreshCw,
  Search,
  Stethoscope,
  UserRound,
  UserRoundCog,
  Users,
  X,
  XCircle,
} from "lucide-react-native";

import {
  authRequest,
} from "@/api/authApi";


const CASELOAD_WARNING_THRESHOLD =
  5;


type UserRole =
  | "admin"
  | "parent"
  | "therapist";


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
  role:
    | "parent"
    | "therapist";
  user_name?: string | null;
  user_email?: string | null;
  is_active?:
    | number
    | boolean
    | null;
};


type CoordinationStatus =
  | "complete"
  | "unassigned"
  | "missing_parent"
  | "missing_therapist"
  | "inactive_therapist"
  | "multiple_therapists";


type CoordinationRow = {
  child: ChildItem;
  parents: AssignmentItem[];
  therapists: AssignmentItem[];
  inactiveTherapists:
    AssignmentItem[];
  status:
    CoordinationStatus;
};


type FilterKey =
  | "all"
  | "attention"
  | "missing_parent"
  | "missing_therapist"
  | "inactive_therapist"
  | "multiple_therapists"
  | "complete";


type PickerOption = {
  value: string;
  label: string;
  subtitle?: string;
};


const statusConfig:
  Record<
    CoordinationStatus,
    {
      label: string;
      type:
        | "success"
        | "warning"
        | "danger"
        | "info";
    }
  > = {
    complete: {
      label:
        "Complete",
      type:
        "success",
    },

    unassigned: {
      label:
        "No Coverage",
      type:
        "danger",
    },

    missing_parent: {
      label:
        "Missing Parent",
      type:
        "warning",
    },

    missing_therapist: {
      label:
        "Missing Therapist",
      type:
        "warning",
    },

    inactive_therapist: {
      label:
        "Inactive Therapist",
      type:
        "danger",
    },

    multiple_therapists: {
      label:
        "Multiple Therapists",
      type:
        "info",
    },
  };


const filterOptions:
  PickerOption[] = [
    {
      value:
        "all",
      label:
        "All Children",
    },
    {
      value:
        "attention",
      label:
        "Needs Attention",
    },
    {
      value:
        "missing_parent",
      label:
        "Missing Parent",
    },
    {
      value:
        "missing_therapist",
      label:
        "Missing Therapist",
    },
    {
      value:
        "inactive_therapist",
      label:
        "Inactive Therapist",
    },
    {
      value:
        "multiple_therapists",
      label:
        "Multiple Therapists",
    },
    {
      value:
        "complete",
      label:
        "Complete Coverage",
    },
  ];


export default function AdminAssignments() {

  const [
    children,
    setChildren,
  ] =
    useState<ChildItem[]>(
      []
    );


  const [
    users,
    setUsers,
  ] =
    useState<UserItem[]>(
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
    filter,
    setFilter,
  ] =
    useState<FilterKey>(
      "all"
    );


  const [
    selectedChildIds,
    setSelectedChildIds,
  ] =
    useState<number[]>(
      []
    );


  const [
    bulkTherapistId,
    setBulkTherapistId,
  ] =
    useState("");


  const [
    bulkSaving,
    setBulkSaving,
  ] =
    useState(false);


  const [
    fromTherapistId,
    setFromTherapistId,
  ] =
    useState("");


  const [
    transferChildSelection,
    setTransferChildSelection,
  ] =
    useState(
      "all"
    );


  const [
    toTherapistId,
    setToTherapistId,
  ] =
    useState("");


  const [
    transferSaving,
    setTransferSaving,
  ] =
    useState(false);


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
            : "Unable to load care coordination data."
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


  const activeTherapists =
    useMemo(
      () =>
        therapists.filter(
          therapist =>
            Number(
              therapist.is_active
            ) ===
            1
        ),
      [
        therapists,
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


  const coordinationRows =
    useMemo(
      () => {

        return children.map(
          child => {

            const childAssignments =
              assignmentsByChild[
                Number(
                  child.id
                )
              ] || [];


            const parentLinks =
              childAssignments.filter(
                item =>
                  item.role ===
                  "parent"
              );


            const therapistLinks =
              childAssignments.filter(
                item =>
                  item.role ===
                  "therapist"
              );


            const inactiveTherapists =
              therapistLinks.filter(
                item =>
                  Number(
                    item.is_active
                  ) !==
                  1
              );


            let status:
              CoordinationStatus =
                "complete";


            if (
              parentLinks.length ===
                0 &&
              therapistLinks.length ===
                0
            ) {

              status =
                "unassigned";

            } else if (
              inactiveTherapists.length >
              0
            ) {

              status =
                "inactive_therapist";

            } else if (
              parentLinks.length ===
              0
            ) {

              status =
                "missing_parent";

            } else if (
              therapistLinks.length ===
              0
            ) {

              status =
                "missing_therapist";

            } else if (
              therapistLinks.length >
              1
            ) {

              status =
                "multiple_therapists";

            }


            return {
              child,
              parents:
                parentLinks,
              therapists:
                therapistLinks,
              inactiveTherapists,
              status,
            } satisfies CoordinationRow;

          }
        );

      },
      [
        children,
        assignmentsByChild,
      ]
    );


  const completeCount =
    coordinationRows.filter(
      row =>
        row.status ===
        "complete"
    ).length;


  const missingParentCount =
    coordinationRows.filter(
      row =>
        row.parents.length ===
        0
    ).length;


  const missingTherapistCount =
    coordinationRows.filter(
      row =>
        row.therapists.length ===
        0
    ).length;


  const attentionCount =
    coordinationRows.filter(
      row =>
        row.status !==
        "complete"
    ).length;


  const coverageRate =
    children.length >
    0
      ? Math.round(
          (
            completeCount /
            children.length
          ) *
            100
        )
      : 0;


  const therapistCaseload =
    useMemo(
      () => {

        return therapists
          .map(
            therapist => {

              const childIds =
                new Set(
                  assignments
                    .filter(
                      assignment =>
                        assignment.role ===
                          "therapist" &&
                        Number(
                          assignment.user_id
                        ) ===
                          Number(
                            therapist.id
                          )
                    )
                    .map(
                      assignment =>
                        Number(
                          assignment.child_id
                        )
                    )
                );


              return {
                ...therapist,
                caseload:
                  childIds.size,
              };

            }
          )
          .sort(
            (
              first,
              second
            ) =>
              second.caseload -
              first.caseload
          );

      },
      [
        therapists,
        assignments,
      ]
    );


  const overloadedTherapists =
    therapistCaseload.filter(
      therapist =>
        therapist.caseload >=
        CASELOAD_WARNING_THRESHOLD
    );


  const maxCaseload =
    Math.max(
      1,
      ...therapistCaseload.map(
        therapist =>
          therapist.caseload
      )
    );


  const filteredRows =
    useMemo(
      () => {

        const query =
          search
            .trim()
            .toLowerCase();


        return coordinationRows.filter(
          row => {

            if (
              filter ===
                "attention" &&
              row.status ===
                "complete"
            ) {

              return false;

            }


            if (
              filter ===
                "missing_parent" &&
              row.parents.length >
                0
            ) {

              return false;

            }


            if (
              filter ===
                "missing_therapist" &&
              row.therapists.length >
                0
            ) {

              return false;

            }


            if (
              filter ===
                "inactive_therapist" &&
              row.inactiveTherapists
                .length ===
                0
            ) {

              return false;

            }


            if (
              filter ===
                "multiple_therapists" &&
              row.therapists.length <=
                1
            ) {

              return false;

            }


            if (
              filter ===
                "complete" &&
              row.status !==
                "complete"
            ) {

              return false;

            }


            if (
              !query
            ) {

              return true;

            }


            const relationText =
              [
                ...row.parents,
                ...row.therapists,
              ]
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
                row.child
                  .full_name,
                row.child
                  .region,
                row.child
                  .parent_name,
                row.child.id,
                relationText,
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
        coordinationRows,
        search,
        filter,
      ]
    );


  const visibleIds =
    filteredRows.map(
      row =>
        Number(
          row.child.id
        )
    );


  const allVisibleSelected =
    visibleIds.length >
      0 &&
    visibleIds.every(
      id =>
        selectedChildIds.includes(
          id
        )
    );


  const toggleChild =
    (
      childId:
        number
    ) => {

      const numericId =
        Number(
          childId
        );


      setSelectedChildIds(
        previous =>
          previous.includes(
            numericId
          )
            ? previous.filter(
                id =>
                  id !==
                  numericId
              )
            : [
                ...previous,
                numericId,
              ]
      );

    };


  const toggleVisible =
    () => {

      if (
        allVisibleSelected
      ) {

        setSelectedChildIds(
          previous =>
            previous.filter(
              id =>
                !visibleIds.includes(
                  id
                )
            )
        );

        return;

      }


      setSelectedChildIds(
        previous =>
          Array.from(
            new Set([
              ...previous,
              ...visibleIds,
            ])
          )
      );

    };


  const bulkAssignTherapist =
    async () => {

      if (
        selectedChildIds.length ===
          0 ||
        !bulkTherapistId
      ) {

        setError(
          "Select at least one child and an active therapist."
        );

        return;

      }


      try {

        setBulkSaving(
          true
        );

        setError(
          ""
        );

        setSuccess(
          ""
        );


        let created =
          0;

        let skipped =
          0;


        for (
          const childId of
          selectedChildIds
        ) {

          const alreadyLinked =
            (
              assignmentsByChild[
                childId
              ] || []
            ).some(
              assignment =>
                assignment.role ===
                  "therapist" &&
                Number(
                  assignment.user_id
                ) ===
                  Number(
                    bulkTherapistId
                  )
            );


          if (
            alreadyLinked
          ) {

            skipped +=
              1;

            continue;

          }


          await authRequest(
            "/users/assignments",
            {
              method:
                "POST",

              body:
                JSON.stringify({
                  child_id:
                    childId,

                  user_id:
                    Number(
                      bulkTherapistId
                    ),
                }),
            }
          );


          created +=
            1;

        }


        setSuccess(
          `Bulk assignment complete: ${created} linked${
            skipped >
            0
              ? `, ${skipped} already assigned`
              : ""
          }.`
        );


        setSelectedChildIds(
          []
        );

        setBulkTherapistId(
          ""
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
            : "Unable to complete bulk assignment."
        );

      } finally {

        setBulkSaving(
          false
        );

      }

    };


  const sourceCaseload =
    fromTherapistId
      ? assignments.filter(
          assignment =>
            assignment.role ===
              "therapist" &&
            Number(
              assignment.user_id
            ) ===
              Number(
                fromTherapistId
              )
        )
      : [];


  const sourceChildIds =
    Array.from(
      new Set(
        sourceCaseload.map(
          assignment =>
            Number(
              assignment.child_id
            )
        )
      )
    );


  const sourceChildren =
    sourceChildIds.map(
      childId => {

        const child =
          children.find(
            item =>
              Number(
                item.id
              ) ===
              childId
          );


        return {
          id:
            childId,
          full_name:
            child
              ?.full_name ||
            `Child #${childId}`,
        };

      }
    );


  const selectedTransferChildIds =
    transferChildSelection ===
    "all"
      ? sourceChildIds
      : transferChildSelection
        ? [
            Number(
              transferChildSelection
            ),
          ]
        : [];


  const performTransfer =
    async () => {

      if (
        !fromTherapistId ||
        !toTherapistId
      ) {

        return;

      }


      try {

        setTransferSaving(
          true
        );

        setError(
          ""
        );

        setSuccess(
          ""
        );


        let transferred =
          0;


        for (
          const childId of
          selectedTransferChildIds
        ) {

          const targetAlreadyLinked =
            (
              assignmentsByChild[
                childId
              ] || []
            ).some(
              assignment =>
                assignment.role ===
                  "therapist" &&
                Number(
                  assignment.user_id
                ) ===
                  Number(
                    toTherapistId
                  )
            );


          if (
            !targetAlreadyLinked
          ) {

            await authRequest(
              "/users/assignments",
              {
                method:
                  "POST",

                body:
                  JSON.stringify({
                    child_id:
                      childId,

                    user_id:
                      Number(
                        toTherapistId
                      ),
                  }),
              }
            );

          }


          await authRequest(
            `/users/assignments/${childId}/${fromTherapistId}`,
            {
              method:
                "DELETE",
            }
          );


          transferred +=
            1;

        }


        setSuccess(
          `${transferred} child${
            transferred ===
            1
              ? ""
              : "ren"
          } transferred successfully.`
        );


        setFromTherapistId(
          ""
        );

        setTransferChildSelection(
          "all"
        );

        setToTherapistId(
          ""
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
            : "Unable to transfer therapist caseload."
        );

      } finally {

        setTransferSaving(
          false
        );

      }

    };


  const transferCaseload =
    () => {

      if (
        !fromTherapistId ||
        !toTherapistId
      ) {

        setError(
          "Select both therapists."
        );

        return;

      }


      if (
        Number(
          fromTherapistId
        ) ===
        Number(
          toTherapistId
        )
      ) {

        setError(
          "Choose two different therapists."
        );

        return;

      }


      if (
        selectedTransferChildIds.length ===
        0
      ) {

        setError(
          "Select at least one child to transfer."
        );

        return;

      }


      const fromTherapist =
        therapists.find(
          item =>
            Number(
              item.id
            ) ===
            Number(
              fromTherapistId
            )
        );


      const toTherapist =
        activeTherapists.find(
          item =>
            Number(
              item.id
            ) ===
            Number(
              toTherapistId
            )
        );


      Alert.alert(
        "Transfer Caseload",
        `Transfer ${selectedTransferChildIds.length} child${
          selectedTransferChildIds.length ===
          1
            ? ""
            : "ren"
        } from ${
          fromTherapist
            ?.full_name ||
          "this therapist"
        } to ${
          toTherapist
            ?.full_name ||
          "the selected therapist"
        }?`,
        [
          {
            text:
              "Cancel",
            style:
              "cancel",
          },

          {
            text:
              "Transfer",
            onPress:
              () => {

                void performTransfer();

              },
          },
        ]
      );

    };


  const bulkTherapistOptions:
    PickerOption[] =
      activeTherapists.map(
        therapist => ({
          value:
            String(
              therapist.id
            ),

          label:
            therapist.full_name,

          subtitle:
            therapist.email,
        })
      );


  const fromTherapistOptions:
    PickerOption[] =
      therapistCaseload.map(
        therapist => ({
          value:
            String(
              therapist.id
            ),

          label:
            therapist.full_name,

          subtitle:
            `${therapist.caseload} child${
              therapist.caseload ===
              1
                ? ""
                : "ren"
            }`,
        })
      );


  const transferChildOptions:
    PickerOption[] = [
      {
        value:
          "all",

        label:
          sourceChildren.length >
          0
            ? `All assigned children (${sourceChildren.length})`
            : "No assigned children",
      },

      ...sourceChildren.map(
        child => ({
          value:
            String(
              child.id
            ),

          label:
            child.full_name,
        })
      ),
    ];


  const destinationOptions:
    PickerOption[] =
      activeTherapists
        .filter(
          therapist =>
            Number(
              therapist.id
            ) !==
            Number(
              fromTherapistId
            )
        )
        .map(
          therapist => ({
            value:
              String(
                therapist.id
              ),

            label:
              therapist.full_name,

            subtitle:
              therapist.email,
          })
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
            CARE COORDINATION
          </Text>


          <Text
            style={
              styles.title
            }
          >
            Coverage & Caseload
          </Text>


          <Text
            style={
              styles.subtitle
            }
          >
            Monitor child coverage,
            identify gaps, balance
            therapist caseloads and
            transfer responsibility.
          </Text>

        </View>


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
                  size={17}
                  color="#7164D8"
                />

              )
          }

        </Pressable>

      </View>


      <View
        style={
          styles.statsGrid
        }
      >

        <StatCard
          icon={

            <CheckCircle2
              size={20}
              color="#7868E6"
            />

          }
          label="Coverage Rate"
          value={`${coverageRate}%`}
          tone="purple"
        />


        <StatCard
          icon={

            <UserRound
              size={20}
              color="#C85E9F"
            />

          }
          label="Missing Parent"
          value={
            String(
              missingParentCount
            )
          }
          tone="pink"
        />


        <StatCard
          icon={

            <UserRoundCog
              size={20}
              color="#4D8CCB"
            />

          }
          label="Missing Therapist"
          value={
            String(
              missingTherapistCount
            )
          }
          tone="blue"
        />


        <StatCard
          icon={

            <AlertTriangle
              size={20}
              color="#D78A43"
            />

          }
          label="Overloaded"
          value={
            String(
              overloadedTherapists.length
            )
          }
          tone="orange"
        />

      </View>


      {
        attentionCount >
          0 && (

          <View
            style={
              styles.attentionBanner
            }
          >

            <AlertTriangle
              size={18}
              color="#C07B37"
            />


            <View
              style={
                styles.attentionMain
              }
            >

              <Text
                style={
                  styles.attentionTitle
                }
              >
                {
                  attentionCount
                }{" "}
                child
                {
                  attentionCount ===
                  1
                    ? ""
                    : "ren"
                }{" "}
                need coordination attention
              </Text>


              <Text
                style={
                  styles.attentionText
                }
              >
                Use the filters below
                to find missing parent
                links, missing therapists
                or inactive assignments.
              </Text>

            </View>

          </View>

        )
      }


      {
        Boolean(
          error
        ) && (

          <MessageBox
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

          <MessageBox
            type="success"
            text={
              success
            }
          />

        )
      }


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

          <View
            style={
              styles.panelHeadingMain
            }
          >

            <Text
              style={
                styles.panelTitle
              }
            >
              Coverage Matrix
            </Text>


            <Text
              style={
                styles.panelSubtitle
              }
            >
              Every child, parent
              coverage, therapist
              coverage and current
              coordination status.
            </Text>

          </View>


          <View
            style={
              styles.summaryChips
            }
          >

            <View
              style={
                styles.summaryChip
              }
            >

              <Text
                style={
                  styles.summaryChipText
                }
              >
                {
                  completeCount
                } complete
              </Text>

            </View>


            <View
              style={
                styles.summaryChip
              }
            >

              <Text
                style={
                  styles.summaryChipText
                }
              >
                {
                  attentionCount
                } attention
              </Text>

            </View>

          </View>

        </View>


        <View
          style={
            styles.searchBox
          }
        >

          <Search
            size={17}
            color="#A0A2B2"
          />


          <TextInput
            value={
              search
            }
            onChangeText={
              setSearch
            }
            placeholder="Search child, parent, therapist or region..."
            placeholderTextColor="#A0A2B2"
            style={
              styles.searchInput
            }
          />

        </View>


        <View
          style={
            styles.filterArea
          }
        >

          <PickerField
            value={
              filter
            }
            placeholder="Filter children"
            options={
              filterOptions
            }
            onSelect={
              value =>
                setFilter(
                  value as FilterKey
                )
            }
          />


          <Pressable
            disabled={
              visibleIds.length ===
              0
            }
            style={[
              styles.selectVisibleButton,

              visibleIds.length ===
                0 &&
                styles.disabled,
            ]}
            onPress={
              toggleVisible
            }
          >

            {
              allVisibleSelected
                ? (

                  <Check
                    size={15}
                    color="#FFFFFF"
                  />

                )
                : (

                  <Baby
                    size={15}
                    color="#FFFFFF"
                  />

                )
            }


            <Text
              style={
                styles.selectVisibleText
              }
            >
              {
                allVisibleSelected
                  ? "Clear Visible"
                  : "Select Visible"
              }
            </Text>

          </Pressable>

        </View>


        {
          selectedChildIds.length >
            0 && (

            <View
              style={
                styles.selectedBanner
              }
            >

              <CheckCircle2
                size={15}
                color="#7668DD"
              />


              <Text
                style={
                  styles.selectedBannerText
                }
              >
                {
                  selectedChildIds.length
                }{" "}
                selected
              </Text>

            </View>

          )
        }


        {
          loading
            ? (

              <View
                style={
                  styles.loadingBox
                }
              >

                <ActivityIndicator
                  size="large"
                  color="#796AE7"
                />


                <Text
                  style={
                    styles.loadingText
                  }
                >
                  Loading coordination data...
                </Text>

              </View>

            )
            : filteredRows.length ===
              0
              ? (

                <View
                  style={
                    styles.loadingBox
                  }
                >

                  <Users
                    size={35}
                    color="#796AE7"
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
                      styles.loadingText
                    }
                  >
                    Try changing the
                    search or filter.
                  </Text>

                </View>

              )
              : (

                <View
                  style={
                    styles.coverageList
                  }
                >

                  {
                    filteredRows.map(
                      row => {

                        const status =
                          statusConfig[
                            row.status
                          ];


                        const selected =
                          selectedChildIds.includes(
                            Number(
                              row.child.id
                            )
                          );


                        return (

                          <View
                            key={
                              row.child.id
                            }
                            style={[
                              styles.coverageCard,

                              selected &&
                                styles.coverageCardSelected,
                            ]}
                          >

                            <View
                              style={
                                styles.coverageCardTop
                              }
                            >

                              <Pressable
                                style={[
                                  styles.checkbox,

                                  selected &&
                                    styles.checkboxSelected,
                                ]}
                                onPress={() =>
                                  toggleChild(
                                    row.child.id
                                  )
                                }
                              >

                                {
                                  selected && (

                                    <Check
                                      size={14}
                                      color="#FFFFFF"
                                    />

                                  )
                                }

                              </Pressable>


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
                                      row.child.full_name ||
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
                                  styles.childInfo
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
                                    row.child.full_name
                                  }
                                </Text>


                                <Text
                                  style={
                                    styles.childMeta
                                  }
                                >
                                  ID #
                                  {
                                    row.child.id
                                  }
                                  {
                                    row.child.region
                                      ? ` • ${row.child.region}`
                                      : ""
                                  }
                                </Text>

                              </View>


                              <StatusPill
                                label={
                                  status.label
                                }
                                type={
                                  status.type
                                }
                              />

                            </View>


                            <View
                              style={
                                styles.relationBlock
                              }
                            >

                              <Text
                                style={
                                  styles.relationLabel
                                }
                              >
                                Parent Coverage
                              </Text>


                              <View
                                style={
                                  styles.relationList
                                }
                              >

                                {
                                  row.parents.length >
                                  0
                                    ? row.parents.map(
                                        parent => (

                                          <View
                                            key={
                                              `${row.child.id}-p-${parent.user_id}`
                                            }
                                            style={[
                                              styles.relationChip,
                                              styles.parentChip,
                                            ]}
                                          >

                                            <UserRound
                                              size={12}
                                              color="#B95798"
                                            />


                                            <Text
                                              style={
                                                styles.parentChipText
                                              }
                                            >
                                              {
                                                parent.user_name ||
                                                parent.user_email ||
                                                `Parent #${parent.user_id}`
                                              }
                                            </Text>

                                          </View>

                                        )
                                      )
                                    : (

                                      <View
                                        style={
                                          styles.missingRelation
                                        }
                                      >

                                        <XCircle
                                          size={14}
                                          color="#B2606F"
                                        />


                                        <View
                                          style={
                                            styles.missingMain
                                          }
                                        >

                                          <Text
                                            style={
                                              styles.missingText
                                            }
                                          >
                                            No linked parent account
                                          </Text>


                                          {
                                            Boolean(
                                              row.child.parent_name
                                            ) && (

                                              <Text
                                                style={
                                                  styles.recordName
                                                }
                                              >
                                                Record name:{" "}
                                                {
                                                  row.child.parent_name
                                                }
                                              </Text>

                                            )
                                          }

                                        </View>

                                      </View>

                                    )
                                }

                              </View>

                            </View>


                            <View
                              style={
                                styles.relationBlock
                              }
                            >

                              <Text
                                style={
                                  styles.relationLabel
                                }
                              >
                                Therapist Coverage
                              </Text>


                              <View
                                style={
                                  styles.relationList
                                }
                              >

                                {
                                  row.therapists.length >
                                  0
                                    ? row.therapists.map(
                                        therapist => {

                                          const active =
                                            Number(
                                              therapist.is_active
                                            ) ===
                                            1;


                                          return (

                                            <View
                                              key={
                                                `${row.child.id}-t-${therapist.user_id}`
                                              }
                                              style={[
                                                styles.relationChip,

                                                active
                                                  ? styles.therapistChip
                                                  : styles.inactiveChip,
                                              ]}
                                            >

                                              <Stethoscope
                                                size={12}
                                                color={
                                                  active
                                                    ? "#4D87BE"
                                                    : "#B65A67"
                                                }
                                              />


                                              <Text
                                                style={
                                                  active
                                                    ? styles.therapistChipText
                                                    : styles.inactiveChipText
                                                }
                                              >
                                                {
                                                  therapist.user_name ||
                                                  therapist.user_email ||
                                                  `Therapist #${therapist.user_id}`
                                                }
                                                {
                                                  active
                                                    ? ""
                                                    : " • Inactive"
                                                }
                                              </Text>

                                            </View>

                                          );

                                        }
                                      )
                                    : (

                                      <View
                                        style={
                                          styles.missingRelation
                                        }
                                      >

                                        <XCircle
                                          size={14}
                                          color="#B2606F"
                                        />


                                        <Text
                                          style={
                                            styles.missingText
                                          }
                                        >
                                          No therapist assigned
                                        </Text>

                                      </View>

                                    )
                                }

                              </View>

                            </View>

                          </View>

                        );

                      }
                    )
                  }

                </View>

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
            styles.actionHeading
          }
        >

          <View
            style={
              styles.actionIcon
            }
          >

            <Link2
              size={20}
              color="#7868E6"
            />

          </View>


          <View
            style={
              styles.actionHeadingText
            }
          >

            <Text
              style={
                styles.panelTitle
              }
            >
              Bulk Therapist Assignment
            </Text>


            <Text
              style={
                styles.panelSubtitle
              }
            >
              Assign one therapist
              to multiple selected
              children at once.
            </Text>

          </View>

        </View>


        <View
          style={
            styles.selectionSummary
          }
        >

          <Baby
            size={17}
            color="#7768DF"
          />


          <Text
            style={
              styles.selectionNumber
            }
          >
            {
              selectedChildIds.length
            }
          </Text>


          <Text
            style={
              styles.selectionText
            }
          >
            selected child
            {
              selectedChildIds.length ===
              1
                ? ""
                : "ren"
            }
          </Text>

        </View>


        <Text
          style={
            styles.fieldLabel
          }
        >
          Active Therapist
        </Text>


        <PickerField
          value={
            bulkTherapistId
          }
          placeholder="Select therapist"
          options={
            bulkTherapistOptions
          }
          onSelect={
            setBulkTherapistId
          }
        />


        <Pressable
          disabled={
            bulkSaving ||
            selectedChildIds.length ===
              0 ||
            !bulkTherapistId
          }
          style={[
            styles.primaryButton,

            (
              bulkSaving ||
              selectedChildIds.length ===
                0 ||
              !bulkTherapistId
            ) &&
              styles.disabled,
          ]}
          onPress={
            bulkAssignTherapist
          }
        >

          {
            bulkSaving
              ? (

                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />

              )
              : (

                <Link2
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
              bulkSaving
                ? "Assigning..."
                : "Assign Selected"
            }
          </Text>

        </Pressable>


        <Text
          style={
            styles.note
          }
        >
          Existing links to the same
          therapist are skipped automatically.
        </Text>

      </View>


      <View
        style={
          styles.panel
        }
      >

        <View
          style={
            styles.actionHeading
          }
        >

          <View
            style={
              styles.actionIcon
            }
          >

            <ArrowRightLeft
              size={20}
              color="#7868E6"
            />

          </View>


          <View
            style={
              styles.actionHeadingText
            }
          >

            <Text
              style={
                styles.panelTitle
              }
            >
              Transfer Caseload
            </Text>


            <Text
              style={
                styles.panelSubtitle
              }
            >
              Move all or one assigned
              child from one therapist
              to another.
            </Text>

          </View>

        </View>


        <Text
          style={
            styles.fieldLabel
          }
        >
          From Therapist
        </Text>


        <PickerField
          value={
            fromTherapistId
          }
          placeholder="Select therapist"
          options={
            fromTherapistOptions
          }
          onSelect={
            value => {

              setFromTherapistId(
                value
              );

              setTransferChildSelection(
                "all"
              );

              setToTherapistId(
                ""
              );

            }
          }
        />


        <Text
          style={
            styles.fieldLabel
          }
        >
          Children to Transfer
        </Text>


        <PickerField
          value={
            transferChildSelection
          }
          placeholder="Select children"
          options={
            transferChildOptions
          }
          disabled={
            !fromTherapistId ||
            sourceChildren.length ===
              0
          }
          onSelect={
            setTransferChildSelection
          }
        />


        <View
          style={
            styles.transferIndicator
          }
        >

          <View
            style={
              styles.transferLine
            }
          />


          <View
            style={
              styles.transferCircle
            }
          >

            <ArrowRightLeft
              size={17}
              color="#8D90A2"
            />

          </View>


          <View
            style={
              styles.transferLine
            }
          />

        </View>


        <Text
          style={
            styles.fieldLabel
          }
        >
          To Active Therapist
        </Text>


        <PickerField
          value={
            toTherapistId
          }
          placeholder="Select destination"
          options={
            destinationOptions
          }
          disabled={
            !fromTherapistId
          }
          onSelect={
            setToTherapistId
          }
        />


        <Pressable
          disabled={
            transferSaving ||
            !fromTherapistId ||
            !toTherapistId ||
            selectedTransferChildIds.length ===
              0
          }
          style={[
            styles.primaryButton,

            (
              transferSaving ||
              !fromTherapistId ||
              !toTherapistId ||
              selectedTransferChildIds.length ===
                0
            ) &&
              styles.disabled,
          ]}
          onPress={
            transferCaseload
          }
        >

          {
            transferSaving
              ? (

                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />

              )
              : (

                <ArrowRightLeft
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
              transferSaving
                ? "Transferring..."
                : `Transfer ${
                    selectedTransferChildIds.length >
                    0
                      ? selectedTransferChildIds.length
                      : ""
                  }`
            }
          </Text>

        </Pressable>


        <Text
          style={
            styles.note
          }
        >
          The destination therapist
          must be active. Existing
          duplicate links are not recreated.
        </Text>

      </View>


      <View
        style={[
          styles.panel,
          styles.lastPanel,
        ]}
      >

        <View
          style={
            styles.actionHeading
          }
        >

          <View
            style={
              styles.actionIcon
            }
          >

            <UserRoundCog
              size={20}
              color="#7868E6"
            />

          </View>


          <View
            style={
              styles.actionHeadingText
            }
          >

            <Text
              style={
                styles.panelTitle
              }
            >
              Therapist Caseload
            </Text>


            <Text
              style={
                styles.panelSubtitle
              }
            >
              Compare workload across
              therapists and spot
              possible overloads.
            </Text>

          </View>

        </View>


        {
          therapistCaseload.length ===
          0
            ? (

              <View
                style={
                  styles.caseloadEmpty
                }
              >

                <Text
                  style={
                    styles.loadingText
                  }
                >
                  No therapist accounts yet.
                </Text>

              </View>

            )
            : (

              <View
                style={
                  styles.caseloadList
                }
              >

                {
                  therapistCaseload.map(
                    therapist => {

                      const overloaded =
                        therapist.caseload >=
                        CASELOAD_WARNING_THRESHOLD;


                      const active =
                        Number(
                          therapist.is_active
                        ) ===
                        1;


                      const width =
                        Math.max(
                          4,
                          Math.round(
                            (
                              therapist.caseload /
                              maxCaseload
                            ) *
                              100
                          )
                        );


                      return (

                        <View
                          key={
                            therapist.id
                          }
                          style={
                            styles.caseloadCard
                          }
                        >

                          <View
                            style={
                              styles.caseloadTop
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
                                    .charAt(
                                      0
                                    )
                                    .toUpperCase()
                                }
                              </Text>

                            </View>


                            <View
                              style={
                                styles.caseloadPerson
                              }
                            >

                              <Text
                                numberOfLines={
                                  1
                                }
                                style={
                                  styles.caseloadName
                                }
                              >
                                {
                                  therapist.full_name
                                }
                              </Text>


                              <Text
                                style={
                                  overloaded
                                    ? styles.caseloadMetaWarning
                                    : styles.caseloadMeta
                                }
                              >
                                {
                                  active
                                    ? "Active"
                                    : "Inactive"
                                }
                                {
                                  overloaded
                                    ? " • High caseload"
                                    : ""
                                }
                              </Text>

                            </View>


                            <View
                              style={[
                                styles.caseloadNumber,

                                overloaded &&
                                  styles.caseloadNumberWarning,
                              ]}
                            >

                              <Text
                                style={[
                                  styles.caseloadValue,

                                  overloaded &&
                                    styles.caseloadValueWarning,
                                ]}
                              >
                                {
                                  therapist.caseload
                                }
                              </Text>


                              <Text
                                style={
                                  styles.caseloadNumberLabel
                                }
                              >
                                children
                              </Text>

                            </View>

                          </View>


                          <View
                            style={
                              styles.meterTrack
                            }
                          >

                            <View
                              style={[
                                styles.meterFill,

                                overloaded &&
                                  styles.meterFillWarning,

                                {
                                  width:
                                    `${width}%`,
                                },
                              ]}
                            />

                          </View>

                        </View>

                      );

                    }
                  )
                }

              </View>

            )
        }


        <View
          style={
            styles.thresholdNote
          }
        >

          <AlertTriangle
            size={14}
            color="#C07B37"
          />


          <Text
            style={
              styles.thresholdText
            }
          >
            Caseload warning currently
            starts at{" "}
            {
              CASELOAD_WARNING_THRESHOLD
            }{" "}
            children.
          </Text>

        </View>

      </View>

    </View>

  );

}


function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon:
    ReactNode;
  label:
    string;
  value:
    string;
  tone:
    "purple" |
    "pink" |
    "blue" |
    "orange";
}) {

  return (

    <View
      style={
        styles.statCard
      }
    >

      <View
        style={[
          styles.statIcon,

          tone ===
            "purple" &&
            styles.statPurple,

          tone ===
            "pink" &&
            styles.statPink,

          tone ===
            "blue" &&
            styles.statBlue,

          tone ===
            "orange" &&
            styles.statOrange,
        ]}
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


function MessageBox({
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
        styles.message,

        type ===
          "error"
          ? styles.messageError
          : styles.messageSuccess,
      ]}
    >

      <Text
        style={
          type ===
          "error"
            ? styles.messageErrorText
            : styles.messageSuccessText
        }
      >
        {text}
      </Text>

    </View>

  );

}


function StatusPill({
  label,
  type,
}: {
  label:
    string;
  type:
    "success" |
    "warning" |
    "danger" |
    "info";
}) {

  return (

    <View
      style={[
        styles.statusPill,

        type ===
          "success" &&
          styles.statusSuccess,

        type ===
          "warning" &&
          styles.statusWarning,

        type ===
          "danger" &&
          styles.statusDanger,

        type ===
          "info" &&
          styles.statusInfo,
      ]}
    >

      <Text
        style={[
          styles.statusText,

          type ===
            "success" &&
            styles.statusSuccessText,

          type ===
            "warning" &&
            styles.statusWarningText,

          type ===
            "danger" &&
            styles.statusDangerText,

          type ===
            "info" &&
            styles.statusInfoText,
        ]}
      >
        {label}
      </Text>

    </View>

  );

}


function PickerField({
  value,
  placeholder,
  options,
  disabled = false,
  onSelect,
}: {
  value:
    string;
  placeholder:
    string;
  options:
    PickerOption[];
  disabled?:
    boolean;
  onSelect:
    (
      value:
        string
    ) => void;
}) {

  const [
    visible,
    setVisible,
  ] =
    useState(false);


  const selected =
    options.find(
      option =>
        option.value ===
        value
    );


  return (

    <>

      <Pressable
        disabled={
          disabled
        }
        style={[
          styles.pickerField,

          disabled &&
            styles.pickerDisabled,
        ]}
        onPress={() =>
          setVisible(
            true
          )
        }
      >

        <View
          style={
            styles.pickerFieldMain
          }
        >

          <Text
            numberOfLines={
              1
            }
            style={
              selected
                ? styles.pickerFieldText
                : styles.pickerPlaceholder
            }
          >
            {
              selected
                ?.label ||
              placeholder
            }
          </Text>


          {
            Boolean(
              selected?.subtitle
            ) && (

              <Text
                numberOfLines={
                  1
                }
                style={
                  styles.pickerFieldSubtitle
                }
              >
                {
                  selected
                    ?.subtitle
                }
              </Text>

            )
          }

        </View>


        <ChevronDown
          size={17}
          color="#8E91A2"
        />

      </Pressable>


      <Modal
        visible={
          visible
        }
        transparent
        animationType="fade"
        statusBarTranslucent
        hardwareAccelerated
        presentationStyle="overFullScreen"
        onRequestClose={() =>
          setVisible(
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
              setVisible(
                false
              )
            }
          />


          <View
            style={
              styles.pickerModal
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
                  SELECT OPTION
                </Text>


                <Text
                  style={
                    styles.pickerTitle
                  }
                >
                  {placeholder}
                </Text>

              </View>


              <Pressable
                style={
                  styles.pickerClose
                }
                onPress={() =>
                  setVisible(
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
                styles.pickerOptions
              }
            >

              {
                options.length ===
                0
                  ? (

                    <View
                      style={
                        styles.noOptions
                      }
                    >

                      <Text
                        style={
                          styles.loadingText
                        }
                      >
                        No options available.
                      </Text>

                    </View>

                  )
                  : options.map(
                      option => {

                        const active =
                          option.value ===
                          value;


                        return (

                          <Pressable
                            key={
                              option.value
                            }
                            style={[
                              styles.pickerOption,

                              active &&
                                styles.pickerOptionSelected,
                            ]}
                            onPress={() => {

                              onSelect(
                                option.value
                              );

                              setVisible(
                                false
                              );

                            }}
                          >

                            <View
                              style={
                                styles.pickerOptionMain
                              }
                            >

                              <Text
                                style={[
                                  styles.pickerOptionText,

                                  active &&
                                    styles.pickerOptionTextSelected,
                                ]}
                              >
                                {
                                  option.label
                                }
                              </Text>


                              {
                                Boolean(
                                  option.subtitle
                                ) && (

                                  <Text
                                    style={
                                      styles.pickerOptionSubtitle
                                    }
                                  >
                                    {
                                      option.subtitle
                                    }
                                  </Text>

                                )
                              }

                            </View>


                            {
                              active && (

                                <Check
                                  size={17}
                                  color="#7868E6"
                                />

                              )
                            }

                          </Pressable>

                        );

                      }
                    )
              }

            </ScrollView>

          </View>

        </View>

      </Modal>

    </>

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
      lineHeight:
        34,
      fontWeight:
        "800",
    },


    subtitle: {
      marginTop:
        6,
      color:
        "#9699AC",
      fontSize:
        13,
      lineHeight:
        19,
    },


    refreshButton: {
      width:
        42,
      height:
        42,
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


    disabled: {
      opacity:
        0.45,
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
        108,
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
        35,
      height:
        35,
      borderRadius:
        11,
      alignItems:
        "center",
      justifyContent:
        "center",
    },


    statPurple: {
      backgroundColor:
        "#F1EEFF",
    },


    statPink: {
      backgroundColor:
        "#FFF0FA",
    },


    statBlue: {
      backgroundColor:
        "#EDF6FF",
    },


    statOrange: {
      backgroundColor:
        "#FFF5E8",
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


    attentionBanner: {
      marginTop:
        16,
      padding:
        14,
      borderWidth:
        1,
      borderColor:
        "#F1DEBE",
      borderRadius:
        14,
      backgroundColor:
        "#FFF9EF",
      flexDirection:
        "row",
      alignItems:
        "flex-start",
      gap:
        10,
    },


    attentionMain: {
      flex:
        1,
    },


    attentionTitle: {
      color:
        "#84552B",
      fontSize:
        11,
      fontWeight:
        "800",
    },


    attentionText: {
      marginTop:
        4,
      color:
        "#A67950",
      fontSize:
        9.5,
      lineHeight:
        14,
    },


    message: {
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


    messageError: {
      borderColor:
        "#F3D3DA",
      backgroundColor:
        "#FFF1F4",
    },


    messageSuccess: {
      borderColor:
        "#CFEBDD",
      backgroundColor:
        "#F1FBF6",
    },


    messageErrorText: {
      color:
        "#B74860",
      fontSize:
        11,
    },


    messageSuccessText: {
      color:
        "#438965",
      fontSize:
        11,
    },


    panel: {
      marginTop:
        18,
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


    lastPanel: {
      marginBottom:
        10,
    },


    panelHeading: {
      flexDirection:
        "row",
      alignItems:
        "flex-start",
      justifyContent:
        "space-between",
      gap:
        10,
    },


    panelHeadingMain: {
      flex:
        1,
    },


    panelTitle: {
      color:
        "#3D3F5C",
      fontSize:
        15,
      fontWeight:
        "800",
    },


    panelSubtitle: {
      marginTop:
        4,
      color:
        "#A0A3B3",
      fontSize:
        10.5,
      lineHeight:
        15,
    },


    summaryChips: {
      alignItems:
        "flex-end",
      gap:
        5,
    },


    summaryChip: {
      paddingHorizontal:
        8,
      paddingVertical:
        5,
      borderRadius:
        999,
      backgroundColor:
        "#F5F3FF",
    },


    summaryChipText: {
      color:
        "#7567DB",
      fontSize:
        8,
      fontWeight:
        "700",
    },


    searchBox: {
      height:
        44,
      marginTop:
        16,
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
        11,
    },


    filterArea: {
      marginTop:
        10,
      gap:
        8,
    },


    selectVisibleButton: {
      height:
        41,
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
        7,
    },


    selectVisibleText: {
      color:
        "#FFFFFF",
      fontSize:
        10,
      fontWeight:
        "700",
    },


    selectedBanner: {
      marginTop:
        10,
      minHeight:
        37,
      paddingHorizontal:
        11,
      borderRadius:
        10,
      backgroundColor:
        "#F8F7FD",
      flexDirection:
        "row",
      alignItems:
        "center",
      gap:
        7,
    },


    selectedBannerText: {
      color:
        "#7768DF",
      fontSize:
        10,
      fontWeight:
        "700",
    },


    loadingBox: {
      minHeight:
        240,
      alignItems:
        "center",
      justifyContent:
        "center",
      gap:
        10,
    },


    loadingText: {
      color:
        "#999CAB",
      fontSize:
        11,
      lineHeight:
        16,
      textAlign:
        "center",
    },


    emptyTitle: {
      color:
        "#484A66",
      fontSize:
        15,
      fontWeight:
        "800",
    },


    coverageList: {
      marginTop:
        15,
      gap:
        11,
    },


    coverageCard: {
      padding:
        13,
      borderRadius:
        15,
      borderWidth:
        1,
      borderColor:
        "#EEEEF5",
      backgroundColor:
        "#FFFFFF",
    },


    coverageCardSelected: {
      borderColor:
        "#D9D3FB",
      backgroundColor:
        "#FBFAFF",
    },


    coverageCardTop: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap:
        8,
    },


    checkbox: {
      width:
        24,
      height:
        24,
      borderRadius:
        7,
      borderWidth:
        1,
      borderColor:
        "#D8D9E3",
      backgroundColor:
        "#FFFFFF",
      alignItems:
        "center",
      justifyContent:
        "center",
    },


    checkboxSelected: {
      borderColor:
        "#7868E6",
      backgroundColor:
        "#7868E6",
    },


    childAvatar: {
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


    childAvatarText: {
      color:
        "#7465E8",
      fontSize:
        12,
      fontWeight:
        "800",
    },


    childInfo: {
      flex:
        1,
      minWidth:
        0,
    },


    childName: {
      color:
        "#41435D",
      fontSize:
        11,
      fontWeight:
        "800",
    },


    childMeta: {
      marginTop:
        3,
      color:
        "#A1A4B4",
      fontSize:
        8.5,
    },


    statusPill: {
      paddingHorizontal:
        8,
      paddingVertical:
        6,
      borderRadius:
        999,
    },


    statusText: {
      fontSize:
        7.5,
      fontWeight:
        "800",
    },


    statusSuccess: {
      backgroundColor:
        "#EDF9F3",
    },


    statusSuccessText: {
      color:
        "#448868",
    },


    statusWarning: {
      backgroundColor:
        "#FFF7E9",
    },


    statusWarningText: {
      color:
        "#A87535",
    },


    statusDanger: {
      backgroundColor:
        "#FFF0F2",
    },


    statusDangerText: {
      color:
        "#B85667",
    },


    statusInfo: {
      backgroundColor:
        "#F1F2FF",
    },


    statusInfoText: {
      color:
        "#5F69B4",
    },


    relationBlock: {
      marginTop:
        13,
    },


    relationLabel: {
      color:
        "#85889D",
      fontSize:
        8.5,
      fontWeight:
        "700",
      marginBottom:
        6,
    },


    relationList: {
      flexDirection:
        "row",
      flexWrap:
        "wrap",
      gap:
        5,
    },


    relationChip: {
      minHeight:
        28,
      paddingHorizontal:
        8,
      paddingVertical:
        5,
      borderRadius:
        999,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap:
        5,
    },


    parentChip: {
      backgroundColor:
        "#FFF0FA",
    },


    therapistChip: {
      backgroundColor:
        "#EDF6FF",
    },


    inactiveChip: {
      backgroundColor:
        "#FFF0F2",
    },


    parentChipText: {
      color:
        "#B95798",
      fontSize:
        8.5,
      fontWeight:
        "700",
    },


    therapistChipText: {
      color:
        "#4D87BE",
      fontSize:
        8.5,
      fontWeight:
        "700",
    },


    inactiveChipText: {
      color:
        "#B65A67",
      fontSize:
        8.5,
      fontWeight:
        "700",
    },


    missingRelation: {
      flexDirection:
        "row",
      alignItems:
        "flex-start",
      gap:
        5,
    },


    missingMain: {
      flex:
        1,
    },


    missingText: {
      color:
        "#B2606F",
      fontSize:
        8.8,
    },


    recordName: {
      marginTop:
        3,
      color:
        "#A7A8B6",
      fontSize:
        7.8,
    },


    actionHeading: {
      flexDirection:
        "row",
      alignItems:
        "flex-start",
      gap:
        10,
    },


    actionIcon: {
      width:
        38,
      height:
        38,
      borderRadius:
        12,
      backgroundColor:
        "#F3F0FF",
      alignItems:
        "center",
      justifyContent:
        "center",
    },


    actionHeadingText: {
      flex:
        1,
    },


    selectionSummary: {
      marginTop:
        15,
      padding:
        11,
      borderRadius:
        12,
      backgroundColor:
        "#F8F7FD",
      flexDirection:
        "row",
      alignItems:
        "center",
      gap:
        7,
    },


    selectionNumber: {
      color:
        "#7768DF",
      fontSize:
        14,
      fontWeight:
        "800",
    },


    selectionText: {
      color:
        "#8F92A3",
      fontSize:
        9.5,
    },


    fieldLabel: {
      marginTop:
        14,
      marginBottom:
        6,
      color:
        "#66697F",
      fontSize:
        9.5,
      fontWeight:
        "700",
    },


    pickerField: {
      minHeight:
        47,
      paddingHorizontal:
        12,
      borderWidth:
        1,
      borderColor:
        "#E1E1EA",
      borderRadius:
        11,
      backgroundColor:
        "#FBFBFD",
      flexDirection:
        "row",
      alignItems:
        "center",
      gap:
        8,
    },


    pickerDisabled: {
      opacity:
        0.45,
    },


    pickerFieldMain: {
      flex:
        1,
      minWidth:
        0,
    },


    pickerFieldText: {
      color:
        "#57596E",
      fontSize:
        10,
      fontWeight:
        "600",
    },


    pickerPlaceholder: {
      color:
        "#A0A3B2",
      fontSize:
        10,
    },


    pickerFieldSubtitle: {
      marginTop:
        2,
      color:
        "#A1A4B4",
      fontSize:
        8.5,
    },


    primaryButton: {
      height:
        43,
      marginTop:
        12,
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
        7,
    },


    primaryButtonText: {
      color:
        "#FFFFFF",
      fontSize:
        10,
      fontWeight:
        "700",
    },


    note: {
      marginTop:
        10,
      color:
        "#A1A3B2",
      fontSize:
        8.5,
      lineHeight:
        13,
    },


    transferIndicator: {
      marginVertical:
        13,
      flexDirection:
        "row",
      alignItems:
        "center",
    },


    transferLine: {
      flex:
        1,
      height:
        1,
      backgroundColor:
        "#ECECF3",
    },


    transferCircle: {
      width:
        36,
      height:
        36,
      marginHorizontal:
        8,
      borderRadius:
        18,
      borderWidth:
        1,
      borderColor:
        "#E7E7EF",
      backgroundColor:
        "#FFFFFF",
      alignItems:
        "center",
      justifyContent:
        "center",
    },


    caseloadEmpty: {
      minHeight:
        120,
      alignItems:
        "center",
      justifyContent:
        "center",
    },


    caseloadList: {
      marginTop:
        15,
      gap:
        8,
    },


    caseloadCard: {
      padding:
        11,
      borderRadius:
        14,
      backgroundColor:
        "#FAFAFC",
    },


    caseloadTop: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap:
        9,
    },


    therapistAvatar: {
      width:
        39,
      height:
        39,
      borderRadius:
        12,
      backgroundColor:
        "#EDF6FF",
      alignItems:
        "center",
      justifyContent:
        "center",
    },


    therapistAvatarText: {
      color:
        "#4B89C5",
      fontSize:
        12,
      fontWeight:
        "800",
    },


    caseloadPerson: {
      flex:
        1,
      minWidth:
        0,
    },


    caseloadName: {
      color:
        "#4A4C66",
      fontSize:
        10.5,
      fontWeight:
        "800",
    },


    caseloadMeta: {
      marginTop:
        3,
      color:
        "#999CAC",
      fontSize:
        8.5,
    },


    caseloadMetaWarning: {
      marginTop:
        3,
      color:
        "#C07B37",
      fontSize:
        8.5,
    },


    caseloadNumber: {
      minWidth:
        51,
      paddingHorizontal:
        8,
      paddingVertical:
        6,
      borderRadius:
        10,
      backgroundColor:
        "#F1EEFF",
      alignItems:
        "center",
    },


    caseloadNumberWarning: {
      backgroundColor:
        "#FFF4E5",
    },


    caseloadValue: {
      color:
        "#7466DA",
      fontSize:
        15,
      fontWeight:
        "800",
    },


    caseloadValueWarning: {
      color:
        "#C97F35",
    },


    caseloadNumberLabel: {
      marginTop:
        1,
      color:
        "#999CAB",
      fontSize:
        7.5,
    },


    meterTrack: {
      height:
        6,
      marginTop:
        10,
      borderRadius:
        999,
      backgroundColor:
        "#ECECF3",
      overflow:
        "hidden",
    },


    meterFill: {
      height:
        "100%",
      borderRadius:
        999,
      backgroundColor:
        "#8272EA",
    },


    meterFillWarning: {
      backgroundColor:
        "#E4A15D",
    },


    thresholdNote: {
      marginTop:
        14,
      padding:
        10,
      borderRadius:
        11,
      backgroundColor:
        "#FFF9EF",
      flexDirection:
        "row",
      alignItems:
        "flex-start",
      gap:
        7,
    },


    thresholdText: {
      flex:
        1,
      color:
        "#A67950",
      fontSize:
        8.5,
      lineHeight:
        13,
    },


    pickerOverlay: {
      flex:
        1,
      padding:
        22,
      alignItems:
        "center",
      justifyContent:
        "center",
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


    pickerModal: {
      width:
        "100%",
      maxWidth:
        520,
      maxHeight:
        "70%",
      padding:
        18,
      borderRadius:
        21,
      backgroundColor:
        "#FFFFFF",
      elevation:
        15,
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


    pickerEyebrow: {
      color:
        "#7C6BE5",
      fontSize:
        8.5,
      fontWeight:
        "800",
      letterSpacing:
        1,
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


    pickerClose: {
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


    pickerOptions: {
      marginTop:
        10,
    },


    pickerOption: {
      minHeight:
        55,
      paddingHorizontal:
        12,
      paddingVertical:
        9,
      marginBottom:
        7,
      borderRadius:
        12,
      backgroundColor:
        "#F9F9FC",
      flexDirection:
        "row",
      alignItems:
        "center",
      gap:
        10,
    },


    pickerOptionSelected: {
      backgroundColor:
        "#F1EEFF",
    },


    pickerOptionMain: {
      flex:
        1,
    },


    pickerOptionText: {
      color:
        "#55576D",
      fontSize:
        10.5,
      fontWeight:
        "700",
    },


    pickerOptionTextSelected: {
      color:
        "#7465DE",
    },


    pickerOptionSubtitle: {
      marginTop:
        3,
      color:
        "#A0A2B2",
      fontSize:
        8.5,
    },


    noOptions: {
      minHeight:
        130,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

  });