import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  ArrowRightLeft,
  Baby,
  CheckCircle2,
  Link2,
  RefreshCw,
  Search,
  Stethoscope,
  UserRound,
  UserRoundCog,
  Users,
  XCircle,
} from "lucide-react";

import api from "../../services/api";


const CASELOAD_WARNING_THRESHOLD = 5;


const statusConfig = {
  complete: {
    label: "Complete",
    className: "complete",
  },

  unassigned: {
    label: "No Coverage",
    className: "danger",
  },

  missing_parent: {
    label: "Missing Parent",
    className: "warning",
  },

  missing_therapist: {
    label: "Missing Therapist",
    className: "warning",
  },

  inactive_therapist: {
    label: "Inactive Therapist",
    className: "danger",
  },

  multiple_therapists: {
    label: "Multiple Therapists",
    className: "info",
  },
};


const isParentAssignment =
  assignment =>
    assignment.link_type ===
      "parent" ||
    assignment.role ===
      "parent";


const isTherapistAssignment =
  assignment =>
    assignment.link_type ===
      "therapist" ||
    assignment.role ===
      "therapist";


export default function AdminAssignments() {

  const [
    children,
    setChildren,
  ] = useState([]);


  const [
    users,
    setUsers,
  ] = useState([]);


  const [
    assignments,
    setAssignments,
  ] = useState([]);


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
    filter,
    setFilter,
  ] = useState("all");


  const [
    selectedChildIds,
    setSelectedChildIds,
  ] = useState([]);


  const [
    bulkTherapistId,
    setBulkTherapistId,
  ] = useState("");


  const [
    bulkSaving,
    setBulkSaving,
  ] = useState(false);


  const [
    fromTherapistId,
    setFromTherapistId,
  ] = useState("");


  const [
    transferChildSelection,
    setTransferChildSelection,
  ] = useState("all");


  const [
    toTherapistId,
    setToTherapistId,
  ] = useState("");


  const [
    transferSaving,
    setTransferSaving,
  ] = useState(false);


  const loadData =
    async (
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
          childrenResponse,
          usersResponse,
          assignmentsResponse,
        ] =
          await Promise.all([
            api.get(
              "/children"
            ),

            api.get(
              "/users"
            ),

            api.get(
              "/users/assignments"
            ),
          ]);


        setChildren(
          Array.isArray(
            childrenResponse.data
          )
            ? childrenResponse.data
            : []
        );


        setUsers(
          Array.isArray(
            usersResponse.data
          )
            ? usersResponse.data
            : []
        );


        setAssignments(
          Array.isArray(
            assignmentsResponse.data
          )
            ? assignmentsResponse.data
            : []
        );

      } catch (
        requestError
      ) {

        console.error(
          requestError
        );


        setError(
          requestError
            ?.response
            ?.data
            ?.message ||
          "Unable to load care coordination data."
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


  const activeParents =
    useMemo(
      () =>
        users.filter(
          user =>
            user.role ===
              "parent" &&
            Number(
              user.is_active
            ) === 1
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


  const activeTherapists =
    useMemo(
      () =>
        therapists.filter(
          therapist =>
            Number(
              therapist.is_active
            ) === 1
        ),
      [
        therapists,
      ]
    );


  const assignmentsByChild =
    useMemo(
      () => {

        const map = {};


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


  const getChildCoordination =
    child => {

      const childAssignments =
        assignmentsByChild[
          Number(
            child.id
          )
        ] || [];


      const parents =
        childAssignments.filter(
          isParentAssignment
        );


      const therapistLinks =
        childAssignments.filter(
          isTherapistAssignment
        );


      const inactiveTherapists =
        therapistLinks.filter(
          item =>
            Number(
              item.is_active
            ) !== 1
        );


      let status =
        "complete";


      if (
        parents.length === 0 &&
        therapistLinks.length === 0
      ) {

        status =
          "unassigned";

      } else if (
        inactiveTherapists.length > 0
      ) {

        status =
          "inactive_therapist";

      } else if (
        parents.length === 0
      ) {

        status =
          "missing_parent";

      } else if (
        therapistLinks.length === 0
      ) {

        status =
          "missing_therapist";

      } else if (
        therapistLinks.length > 1
      ) {

        status =
          "multiple_therapists";

      }


      return {
        parents,
        therapists:
          therapistLinks,
        inactiveTherapists,
        status,
      };

    };


  const coordinationRows =
    useMemo(
      () =>
        children.map(
          child => ({
            child,
            ...getChildCoordination(
              child
            ),
          })
        ),
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
    children.length > 0
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
                        isTherapistAssignment(
                          assignment
                        ) &&
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
                .length === 0
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


            if (!query) {
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
                row.child.full_name,
                row.child.region,
                row.child.parent_name,
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
    filteredRows
      .filter(
        row =>
          row.therapists.length ===
            0
      )
      .map(
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
    childId => {

      const numericId =
        Number(
          childId
        );


      const coordination =
        coordinationRows.find(
          row =>
            Number(
              row.child.id
            ) ===
            numericId
        );


      if (
        coordination &&
        coordination.therapists.length >
          0
      ) {

        setError(
          "This child already has a therapist. Use Transfer Caseload to move the child."
        );

        return;

      }


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
    async event => {

      event.preventDefault();


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

        setBulkSaving(true);
        setError("");
        setSuccess("");


        let created = 0;
        let skipped = 0;


        for (
          const childId of
          selectedChildIds
        ) {

          const alreadyHasTherapist =
            (
              assignmentsByChild[
                childId
              ] || []
            ).some(
              isTherapistAssignment
            );


          if (
            alreadyHasTherapist
          ) {

            skipped += 1;
            continue;

          }


          await api.post(
            "/users/assignments",
            {
              child_id:
                childId,

              user_id:
                Number(
                  bulkTherapistId
                ),
            }
          );


          created += 1;

        }


        setSuccess(
          `Bulk assignment complete: ${created} linked${
            skipped > 0
              ? `, ${skipped} skipped because they already have a therapist`
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
          requestError
            ?.response
            ?.data
            ?.message ||
          "Unable to complete bulk assignment."
        );

      } finally {

        setBulkSaving(false);

      }

    };


  const sourceCaseload =
    fromTherapistId
      ? assignments.filter(
          assignment =>
            isTherapistAssignment(
              assignment
            ) &&
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


  const transferCaseload =
    async event => {

      event.preventDefault();


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


      const confirmed =
        window.confirm(
          `Transfer ${selectedTransferChildIds.length} child${
            selectedTransferChildIds.length === 1
              ? ""
              : "ren"
          } from ${
            fromTherapist?.full_name ||
            "this therapist"
          } to ${
            toTherapist?.full_name ||
            "the selected therapist"
          }?`
        );


      if (!confirmed) {
        return;
      }


      try {

        setTransferSaving(true);
        setError("");
        setSuccess("");


        let transferred = 0;


        for (
          const childId of
          selectedTransferChildIds
        ) {

          await api.delete(
            `/users/assignments/${childId}/${fromTherapistId}`
          );


          try {

            await api.post(
              "/users/assignments",
              {
                child_id:
                  childId,

                user_id:
                  Number(
                    toTherapistId
                  ),
              }
            );


            transferred += 1;

          } catch (
            transferError
          ) {

            try {

              await api.post(
                "/users/assignments",
                {
                  child_id:
                    childId,

                  user_id:
                    Number(
                      fromTherapistId
                    ),
                }
              );

            } catch (
              rollbackError
            ) {

              console.error(
                rollbackError
              );

            }


            throw transferError;

          }

        }


        setSuccess(
          `${transferred} child${
            transferred === 1
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
          requestError
            ?.response
            ?.data
            ?.message ||
          "Unable to transfer therapist caseload."
        );

      } finally {

        setTransferSaving(false);

      }

    };


  return (

    <div className="care-coordination-page">

      <div className="care-heading">

        <div>

          <span>
            CARE COORDINATION
          </span>

          <h1>
            Coverage & Caseload
          </h1>

          <p>
            Monitor child coverage,
            identify gaps, balance
            therapist caseloads and
            transfer responsibility.
          </p>

        </div>


        <button
          className="care-refresh"
          onClick={() =>
            loadData(
              true
            )
          }
          disabled={
            refreshing
          }
        >

          <RefreshCw
            size={16}
            className={
              refreshing
                ? "care-spin"
                : ""
            }
          />

          Refresh

        </button>

      </div>


      <div className="care-stats">

        <div className="care-stat purple">

          <CheckCircle2
            size={21}
          />

          <span>
            Coverage Rate
          </span>

          <strong>
            {coverageRate}%
          </strong>

        </div>


        <div className="care-stat pink">

          <UserRound
            size={21}
          />

          <span>
            Missing Parent
          </span>

          <strong>
            {missingParentCount}
          </strong>

        </div>


        <div className="care-stat blue">

          <UserRoundCog
            size={21}
          />

          <span>
            Missing Therapist
          </span>

          <strong>
            {missingTherapistCount}
          </strong>

        </div>


        <div className="care-stat orange">

          <AlertTriangle
            size={21}
          />

          <span>
            Overloaded Therapists
          </span>

          <strong>
            {
              overloadedTherapists.length
            }
          </strong>

        </div>

      </div>


      {
        attentionCount >
          0 && (

          <div className="care-alert-banner">

            <AlertTriangle
              size={18}
            />

            <div>

              <strong>
                {
                  attentionCount
                }
                {" "}
                child
                {
                  attentionCount ===
                  1
                    ? ""
                    : "ren"
                }
                {" "}
                need coordination attention
              </strong>

              <span>
                Use the filters below
                to find missing parent
                links, missing therapists
                or inactive assignments.
              </span>

            </div>

          </div>

        )
      }


      {
        error && (

          <div className="care-message error">
            {error}
          </div>

        )
      }


      {
        success && (

          <div className="care-message success">
            {success}
          </div>

        )
      }


      <section className="care-panel">

        <div className="care-panel-heading">

          <div>

            <h2>
              Coverage Matrix
            </h2>

            <p>
              One view of every child,
              parent coverage,
              therapist coverage and
              current coordination status.
            </p>

          </div>


          <div className="coverage-summary">

            <span>
              {
                completeCount
              }
              {" "}
              complete
            </span>

            <span>
              {
                attentionCount
              }
              {" "}
              need attention
            </span>

          </div>

        </div>


        <div className="care-toolbar">

          <div className="care-search">

            <Search
              size={17}
            />

            <input
              value={
                search
              }
              onChange={
                event =>
                  setSearch(
                    event.target.value
                  )
              }
              placeholder="Search child, parent, therapist or region..."
            />

          </div>


          <select
            value={
              filter
            }
            onChange={
              event =>
                setFilter(
                  event.target.value
                )
            }
          >

            <option value="all">
              All Children
            </option>

            <option value="attention">
              Needs Attention
            </option>

            <option value="missing_parent">
              Missing Parent
            </option>

            <option value="missing_therapist">
              Missing Therapist
            </option>

            <option value="inactive_therapist">
              Inactive Therapist
            </option>

            <option value="multiple_therapists">
              Multiple Therapists
            </option>

            <option value="complete">
              Complete Coverage
            </option>

          </select>

        </div>


        {
          loading
            ? (

              <div className="care-loading">
                Loading coordination data...
              </div>

            )
            : filteredRows.length ===
              0
              ? (

                <div className="care-empty">

                  <Users
                    size={35}
                  />

                  <h3>
                    No children found
                  </h3>

                  <p>
                    Try changing the
                    search or filter.
                  </p>

                </div>

              )
              : (

                <div className="coverage-table-wrap">

                  <div className="coverage-table">

                    <div className="coverage-table-header">

                      <label className="care-check">

                        <input
                          type="checkbox"
                          checked={
                            allVisibleSelected
                          }
                          onChange={
                            toggleVisible
                          }
                        />

                      </label>

                      <span>
                        Child
                      </span>

                      <span>
                        Parent Coverage
                      </span>

                      <span>
                        Therapist Coverage
                      </span>

                      <span>
                        Status
                      </span>

                    </div>


                    {
                      filteredRows.map(
                        row => {

                          const status =
                            statusConfig[
                              row.status
                            ] ||
                            statusConfig.complete;


                          const selected =
                            selectedChildIds.includes(
                              Number(
                                row.child.id
                              )
                            );


                          return (

                            <div
                              className={
                                selected
                                  ? "coverage-row selected"
                                  : "coverage-row"
                              }
                              key={
                                row.child.id
                              }
                            >

                              <label className="care-check">

                                <input
                                  type="checkbox"
                                  checked={
                                    selected
                                  }
                                  disabled={
                                    row.therapists.length >
                                    0
                                  }
                                  title={
                                    row.therapists.length >
                                    0
                                      ? "This child already has a therapist. Use Transfer Caseload."
                                      : "Select child for therapist assignment"
                                  }
                                  onChange={() =>
                                    toggleChild(
                                      row.child.id
                                    )
                                  }
                                />

                              </label>


                              <div className="coverage-child">

                                <div className="coverage-avatar">

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

                                </div>


                                <div>

                                  <strong>
                                    {
                                      row.child.full_name
                                    }
                                  </strong>

                                  <span>

                                    ID #
                                    {
                                      row.child.id
                                    }

                                    {
                                      row.child.region
                                        ? ` • ${row.child.region}`
                                        : ""
                                    }

                                  </span>

                                </div>

                              </div>


                              <div className="coverage-relations">

                                {
                                  row.parents.length >
                                  0
                                    ? row.parents.map(
                                        parent => (

                                          <span
                                            className="relation-chip parent"
                                            key={
                                              parent.user_id
                                            }
                                          >

                                            <UserRound
                                              size={12}
                                            />

                                            {
                                              parent.user_name
                                            }

                                          </span>

                                        )
                                      )
                                    : (

                                      <div className="missing-relation">

                                        <XCircle
                                          size={14}
                                        />

                                        No linked parent account

                                        {
                                          row.child.parent_name
                                            ? (

                                              <small>
                                                Record name:
                                                {" "}
                                                {
                                                  row.child.parent_name
                                                }
                                              </small>

                                            )
                                            : null
                                        }

                                      </div>

                                    )
                                }

                              </div>


                              <div className="coverage-relations">

                                {
                                  row.therapists.length >
                                  0
                                    ? row.therapists.map(
                                        therapist => (

                                          <span
                                            className={
                                              Number(
                                                therapist.is_active
                                              ) === 1
                                                ? "relation-chip therapist"
                                                : "relation-chip inactive"
                                            }
                                            key={
                                              therapist.user_id
                                            }
                                          >

                                            <Stethoscope
                                              size={12}
                                            />

                                            {
                                              therapist.user_name
                                            }

                                            {
                                              Number(
                                                therapist.is_active
                                              ) !== 1
                                                ? " • Inactive"
                                                : ""
                                            }

                                          </span>

                                        )
                                      )
                                    : (

                                      <div className="missing-relation">

                                        <XCircle
                                          size={14}
                                        />

                                        No therapist assigned

                                      </div>

                                    )
                                }

                              </div>


                              <div>

                                <span
                                  className={
                                    `coordination-status ${status.className}`
                                  }
                                >
                                  {
                                    status.label
                                  }
                                </span>

                              </div>

                            </div>

                          );

                        }
                      )
                    }

                  </div>

                </div>

              )
        }

      </section>


      <div className="coordination-action-grid">

        <section className="care-panel action-panel">

          <div className="care-panel-heading">

            <div>

              <h2>
                Bulk Therapist Assignment
              </h2>

              <p>
                Assign one therapist
                to selected children
                who do not have a therapist yet.
              </p>

            </div>


            <Link2
              size={21}
            />

          </div>


          <div className="selection-summary">

            <Baby
              size={17}
            />

            <strong>
              {
                selectedChildIds.length
              }
            </strong>

            <span>
              selected child
              {
                selectedChildIds.length ===
                1
                  ? ""
                  : "ren"
              }
            </span>

          </div>


          <form
            className="bulk-form"
            onSubmit={
              bulkAssignTherapist
            }
          >

            <label>

              Active Therapist

              <select
                value={
                  bulkTherapistId
                }
                onChange={
                  event =>
                    setBulkTherapistId(
                      event.target.value
                    )
                }
              >

                <option value="">
                  Select therapist
                </option>

                {
                  activeTherapists.map(
                    therapist => (

                      <option
                        key={
                          therapist.id
                        }
                        value={
                          therapist.id
                        }
                      >
                        {
                          therapist.full_name
                        }
                        {" — "}
                        {
                          therapist.email
                        }
                      </option>

                    )
                  )
                }

              </select>

            </label>


            <button
              type="submit"
              disabled={
                bulkSaving ||
                selectedChildIds.length ===
                  0 ||
                !bulkTherapistId
              }
            >

              <Link2
                size={16}
              />

              {
                bulkSaving
                  ? "Assigning..."
                  : "Assign Selected"
              }

            </button>

          </form>


          <div className="action-note">

            Children who already have a therapist cannot be selected here.
            Use Transfer Caseload when changing a child's therapist.

          </div>

        </section>


        <section className="care-panel action-panel">

          <div className="care-panel-heading">

            <div>

              <h2>
                Transfer Caseload
              </h2>

              <p>
                Move all assigned
                children from one
                therapist to another.
              </p>

            </div>


            <ArrowRightLeft
              size={21}
            />

          </div>


          <form
            className="transfer-form"
            onSubmit={
              transferCaseload
            }
          >

            <label>

              From Therapist

              <select
                value={
                  fromTherapistId
                }
                onChange={
                  event => {

                    setFromTherapistId(
                      event.target.value
                    );

                    setTransferChildSelection(
                      "all"
                    );

                    setToTherapistId(
                      ""
                    );

                  }
                }
              >

                <option value="">
                  Select therapist
                </option>

                {
                  therapistCaseload.map(
                    therapist => (

                      <option
                        key={
                          therapist.id
                        }
                        value={
                          therapist.id
                        }
                      >
                        {
                          therapist.full_name
                        }
                        {" — "}
                        {
                          therapist.caseload
                        }
                        {" child"}
                        {
                          therapist.caseload ===
                          1
                            ? ""
                            : "ren"
                        }
                      </option>

                    )
                  )
                }

              </select>

            </label>


            <label>

              Children to Transfer

              <select
                value={
                  transferChildSelection
                }
                onChange={
                  event =>
                    setTransferChildSelection(
                      event.target.value
                    )
                }
                disabled={
                  !fromTherapistId ||
                  sourceChildren.length ===
                    0
                }
              >

                <option value="all">
                  {
                    sourceChildren.length >
                    0
                      ? `All assigned children (${sourceChildren.length})`
                      : "No assigned children"
                  }
                </option>

                {
                  sourceChildren.map(
                    child => (

                      <option
                        key={
                          child.id
                        }
                        value={
                          child.id
                        }
                      >
                        {
                          child.full_name
                        }
                      </option>

                    )
                  )
                }

              </select>

            </label>


            <div className="transfer-arrow">

              <ArrowRightLeft
                size={18}
              />

            </div>


            <label>

              To Active Therapist

              <select
                value={
                  toTherapistId
                }
                onChange={
                  event =>
                    setToTherapistId(
                      event.target.value
                    )
                }
                disabled={
                  !fromTherapistId
                }
              >

                <option value="">
                  Select destination
                </option>

                {
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
                      therapist => (

                        <option
                          key={
                            therapist.id
                          }
                          value={
                            therapist.id
                          }
                        >
                          {
                            therapist.full_name
                          }
                        </option>

                      )
                    )
                }

              </select>

            </label>


            <button
              type="submit"
              disabled={
                transferSaving ||
                !fromTherapistId ||
                !toTherapistId ||
                selectedTransferChildIds.length ===
                  0
              }
            >

              <ArrowRightLeft
                size={16}
              />

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

            </button>

          </form>


          <div className="action-note">

            The destination therapist must be active.
            The current therapist link is removed before the new therapist is assigned.

          </div>

        </section>

      </div>


      <section className="care-panel caseload-panel">

        <div className="care-panel-heading">

          <div>

            <h2>
              Therapist Caseload
            </h2>

            <p>
              Compare workload across
              therapists and spot possible
              overloads.
            </p>

          </div>


          <UserRoundCog
            size={21}
          />

        </div>


        {
          therapistCaseload.length ===
          0
            ? (

              <div className="caseload-empty">
                No therapist accounts yet.
              </div>

            )
            : (

              <div className="caseload-list">

                {
                  therapistCaseload.map(
                    therapist => {

                      const overloaded =
                        therapist.caseload >=
                        CASELOAD_WARNING_THRESHOLD;


                      const active =
                        Number(
                          therapist.is_active
                        ) === 1;


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

                        <div
                          className="caseload-row"
                          key={
                            therapist.id
                          }
                        >

                          <div className="caseload-person">

                            <div className="caseload-avatar">

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

                            </div>


                            <div>

                              <strong>
                                {
                                  therapist.full_name
                                }
                              </strong>

                              <span>

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

                              </span>

                            </div>

                          </div>


                          <div className="caseload-meter">

                            <div>

                              <span
                                style={{
                                  width:
                                    `${width}%`,
                                }}
                              />

                            </div>

                          </div>


                          <div
                            className={
                              overloaded
                                ? "caseload-number overloaded"
                                : "caseload-number"
                            }
                          >

                            <strong>
                              {
                                therapist.caseload
                              }
                            </strong>

                            <span>
                              children
                            </span>

                          </div>

                        </div>

                      );

                    }
                  )
                }

              </div>

            )
        }


        <div className="threshold-note">

          <AlertTriangle
            size={14}
          />

          Caseload warning currently
          starts at
          {" "}
          {
            CASELOAD_WARNING_THRESHOLD
          }
          {" "}
          children. We can make this
          configurable later from Settings.

        </div>

      </section>


      <style>
        {`

        .care-coordination-page {
          width: 100%;
        }

        .care-heading {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
        }

        .care-heading > div > span {
          color: #8172EA;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .1em;
        }

        .care-heading h1 {
          margin: 6px 0 5px;
          color: #303253;
          font-size: 28px;
        }

        .care-heading p {
          margin: 0;
          max-width: 610px;
          color: #9699AC;
          font-size: 13px;
          line-height: 1.55;
        }

        .care-refresh {
          height: 41px;
          padding: 0 14px;
          border: 1px solid #E7E6F0;
          border-radius: 13px;
          background: white;
          color: #7164D8;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 11px;
          font-weight: 650;
        }

        .care-refresh:disabled {
          opacity: .6;
        }

        .care-spin {
          animation: careSpin .8s linear infinite;
        }

        @keyframes careSpin {
          to {
            transform: rotate(360deg);
          }
        }

        .care-stats {
          display: grid;
          grid-template-columns:
            repeat(4, minmax(0, 1fr));
          gap: 14px;
          margin-top: 22px;
        }

        .care-stat {
          min-height: 88px;
          padding: 16px;
          border: 1px solid #ECECF4;
          border-radius: 18px;
          background: white;
          display: grid;
          grid-template-columns:
            34px 1fr auto;
          gap: 10px;
          align-items: center;
        }

        .care-stat span {
          color: #9194A6;
          font-size: 11px;
        }

        .care-stat strong {
          color: #383A57;
          font-size: 21px;
        }

        .care-stat.purple {
          color: #7868E6;
        }

        .care-stat.pink {
          color: #C85E9F;
        }

        .care-stat.blue {
          color: #4D8CCB;
        }

        .care-stat.orange {
          color: #D78A43;
        }

        .care-alert-banner {
          margin-top: 16px;
          padding: 13px 15px;
          border: 1px solid #F1DEBE;
          border-radius: 14px;
          background: #FFF9EF;
          color: #C07B37;
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }

        .care-alert-banner > div {
          display: flex;
          flex-direction: column;
        }

        .care-alert-banner strong {
          color: #84552B;
          font-size: 11px;
        }

        .care-alert-banner span {
          margin-top: 3px;
          color: #A67950;
          font-size: 9.5px;
        }

        .care-message {
          margin-top: 14px;
          padding: 11px 14px;
          border-radius: 12px;
          font-size: 11px;
        }

        .care-message.error {
          border: 1px solid #F3D3DA;
          background: #FFF1F4;
          color: #B74860;
        }

        .care-message.success {
          border: 1px solid #CFEBDD;
          background: #F1FBF6;
          color: #438965;
        }

        .care-panel {
          margin-top: 18px;
          padding: 19px;
          border: 1px solid #ECECF4;
          border-radius: 20px;
          background: white;
          box-shadow:
            0 7px 22px
            rgba(52,53,85,.025);
        }

        .care-panel-heading {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 14px;
          color: #7869E6;
        }

        .care-panel-heading h2 {
          margin: 0;
          color: #3D3F5C;
          font-size: 15px;
        }

        .care-panel-heading p {
          margin: 4px 0 0;
          max-width: 540px;
          color: #A0A3B3;
          font-size: 10.5px;
          line-height: 1.5;
        }

        .coverage-summary {
          display: flex;
          gap: 7px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .coverage-summary span {
          padding: 6px 9px;
          border-radius: 999px;
          background: #F5F3FF;
          color: #7567DB;
          font-size: 8.5px;
          font-weight: 650;
        }

        .care-toolbar {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr) 200px;
          gap: 10px;
          margin-top: 16px;
        }

        .care-search {
          height: 42px;
          padding: 0 13px;
          border: 1px solid #E7E7EF;
          border-radius: 12px;
          background: #FAFAFC;
          color: #A0A2B2;
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .care-search input {
          width: 100%;
          height: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          color: #42445E;
          font-size: 11px;
        }

        .care-toolbar select,
        .bulk-form select,
        .transfer-form select {
          width: 100%;
          height: 42px;
          padding: 0 10px;
          border: 1px solid #E1E1EA;
          border-radius: 11px;
          outline: 0;
          background: #FBFBFD;
          color: #57596E;
          font-size: 10px;
        }

        .care-loading,
        .care-empty {
          min-height: 290px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          color: #999CAB;
          font-size: 12px;
        }

        .care-empty svg {
          color: #796AE7;
        }

        .care-empty h3 {
          margin: 11px 0 4px;
          color: #484A66;
          font-size: 15px;
        }

        .care-empty p {
          margin: 0;
        }

        .coverage-table-wrap {
          margin-top: 15px;
          overflow-x: auto;
        }

        .coverage-table {
          min-width: 880px;
        }

        .coverage-table-header,
        .coverage-row {
          display: grid;
          grid-template-columns:
            38px
            1.15fr
            1.3fr
            1.3fr
            .85fr;
          gap: 12px;
          align-items: center;
        }

        .coverage-table-header {
          min-height: 39px;
          padding: 0 10px;
          border-radius: 11px;
          color: #8F92A5;
          background: #F8F8FB;
          font-size: 9px;
          font-weight: 700;
        }

        .coverage-row {
          min-height: 73px;
          padding: 10px;
          border-bottom: 1px solid #F0F0F5;
          transition: .15s ease;
        }

        .coverage-row:last-child {
          border-bottom: 0;
        }

        .coverage-row.selected {
          background: #FBFAFF;
        }

        .care-check {
          display: grid;
          place-items: center;
        }

        .care-check input {
          width: 15px;
          height: 15px;
          accent-color: #7868E6;
          cursor: pointer;
        }

        .care-check input:disabled {
          cursor: not-allowed;
          opacity: .35;
        }

        .coverage-child {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .coverage-avatar {
          width: 38px;
          height: 38px;
          flex: 0 0 auto;
          border-radius: 12px;
          display: grid;
          place-items: center;
          background: #F0EDFF;
          color: #7465E8;
          font-size: 12px;
          font-weight: 800;
        }

        .coverage-child > div:last-child {
          min-width: 0;
          display: flex;
          flex-direction: column;
        }

        .coverage-child strong {
          color: #41435D;
          font-size: 10.5px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .coverage-child span {
          margin-top: 3px;
          color: #A1A4B4;
          font-size: 8.5px;
        }

        .coverage-relations {
          display: flex;
          gap: 5px;
          flex-wrap: wrap;
        }

        .relation-chip {
          min-height: 28px;
          padding: 5px 8px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 8.5px;
          font-weight: 650;
        }

        .relation-chip.parent {
          color: #B95798;
          background: #FFF0FA;
        }

        .relation-chip.therapist {
          color: #4D87BE;
          background: #EDF6FF;
        }

        .relation-chip.inactive {
          color: #B65A67;
          background: #FFF0F2;
        }

        .missing-relation {
          color: #B2606F;
          font-size: 8.8px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 3px;
        }

        .missing-relation > svg {
          float: left;
        }

        .missing-relation small {
          color: #A7A8B6;
          font-size: 7.8px;
        }

        .coordination-status {
          display: inline-flex;
          padding: 6px 9px;
          border-radius: 999px;
          font-size: 8px;
          font-weight: 700;
          white-space: nowrap;
        }

        .coordination-status.complete {
          color: #448868;
          background: #EDF9F3;
        }

        .coordination-status.warning {
          color: #A87535;
          background: #FFF7E9;
        }

        .coordination-status.danger {
          color: #B85667;
          background: #FFF0F2;
        }

        .coordination-status.info {
          color: #5F69B4;
          background: #F1F2FF;
        }

        .coordination-action-grid {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .action-panel {
          min-width: 0;
        }

        .selection-summary {
          margin-top: 15px;
          padding: 11px 12px;
          border-radius: 12px;
          background: #F8F7FD;
          color: #7768DF;
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .selection-summary strong {
          font-size: 14px;
        }

        .selection-summary span {
          color: #8F92A3;
          font-size: 9.5px;
        }

        .bulk-form {
          display: grid;
          grid-template-columns:
            1fr auto;
          gap: 9px;
          margin-top: 14px;
          align-items: end;
        }

        .bulk-form label,
        .transfer-form label {
          color: #66697F;
          font-size: 9.5px;
          font-weight: 650;
        }

        .bulk-form label select,
        .transfer-form label select {
          margin-top: 6px;
        }

        .bulk-form button,
        .transfer-form button {
          height: 42px;
          padding: 0 13px;
          border: 0;
          border-radius: 11px;
          background: #7868E6;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          cursor: pointer;
          font-size: 9.5px;
          white-space: nowrap;
        }

        .bulk-form button:disabled,
        .transfer-form button:disabled {
          opacity: .45;
          cursor: not-allowed;
        }

        .transfer-form {
          display: grid;
          grid-template-columns:
            1fr 1fr 36px 1fr auto;
          gap: 8px;
          align-items: end;
          margin-top: 15px;
        }

        .transfer-arrow {
          height: 42px;
          display: grid;
          place-items: center;
          color: #9B9DAF;
        }

        .action-note {
          margin-top: 10px;
          color: #A1A3B2;
          font-size: 8.5px;
          line-height: 1.45;
        }

        .caseload-list {
          margin-top: 14px;
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .caseload-row {
          min-height: 60px;
          padding: 8px 10px;
          border: 1px solid #F0F0F5;
          border-radius: 13px;
          background: #FAFAFC;
          display: grid;
          grid-template-columns:
            minmax(180px, .9fr)
            1.5fr
            72px;
          gap: 15px;
          align-items: center;
        }

        .caseload-person {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .caseload-avatar {
          width: 35px;
          height: 35px;
          flex: 0 0 auto;
          border-radius: 11px;
          display: grid;
          place-items: center;
          color: #4F8BC8;
          background: #EDF6FF;
          font-size: 11px;
          font-weight: 800;
        }

        .caseload-person > div:last-child {
          min-width: 0;
          display: flex;
          flex-direction: column;
        }

        .caseload-person strong {
          color: #4C4E67;
          font-size: 10px;
        }

        .caseload-person span {
          margin-top: 3px;
          color: #A0A2B2;
          font-size: 8.3px;
        }

        .caseload-meter > div {
          height: 8px;
          overflow: hidden;
          border-radius: 999px;
          background: #ECECF4;
        }

        .caseload-meter span {
          display: block;
          height: 100%;
          border-radius: inherit;
          background:
            linear-gradient(
              90deg,
              #7B6CEC,
              #9B78E8
            );
        }

        .caseload-number {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .caseload-number strong {
          color: #41435E;
          font-size: 16px;
        }

        .caseload-number span {
          color: #A0A2B2;
          font-size: 8px;
        }

        .caseload-number.overloaded strong {
          color: #C57939;
        }

        .caseload-empty {
          min-height: 100px;
          display: grid;
          place-items: center;
          color: #A0A2B2;
          font-size: 10px;
        }

        .threshold-note {
          margin-top: 12px;
          padding: 9px 11px;
          border-radius: 10px;
          background: #FFF8EC;
          color: #A77542;
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 8.5px;
        }

        @media (max-width: 1100px) {

          .care-stats {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .coordination-action-grid {
            grid-template-columns:
              1fr;
          }

        }

        @media (max-width: 850px) {

          .care-toolbar {
            grid-template-columns:
              1fr;
          }

          .transfer-form {
            grid-template-columns:
              1fr;
          }

          .transfer-arrow {
            display: none;
          }

          .caseload-row {
            grid-template-columns:
              1fr;
          }

          .caseload-number {
            align-items: flex-start;
          }

        }

        `}
      </style>

    </div>

  );

}