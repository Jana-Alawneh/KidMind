import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
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
} from "lucide-react";

import api from "../../services/api";


const emptyChildForm = {
  full_name: "",
  age: "",
  gender: "",
  region: "",
  notes: "",
  parent_id: "",
  therapist_id: "",
};


export default function AdminChildren() {

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
    search,
    setSearch,
  ] = useState("");

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
    selectedChild,
    setSelectedChild,
  ] = useState(null);

  const [
    selectedParentId,
    setSelectedParentId,
  ] = useState("");

  const [
    selectedTherapistId,
    setSelectedTherapistId,
  ] = useState("");

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    childModal,
    setChildModal,
  ] = useState(null);

  const [
    childForm,
    setChildForm,
  ] = useState(
    emptyChildForm
  );

  const [
    childSaving,
    setChildSaving,
  ] = useState(false);

  const [
    deleteTarget,
    setDeleteTarget,
  ] = useState(null);

  const [
    deleteInfo,
    setDeleteInfo,
  ] = useState(null);

  const [
    deleteLoading,
    setDeleteLoading,
  ] = useState(false);

  const [
    deleteParent,
    setDeleteParent,
  ] = useState(false);

  const [
    deleteSaving,
    setDeleteSaving,
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

      } catch (requestError) {

        console.error(
          requestError
        );

        setError(
          requestError.response
            ?.data
            ?.message ||
          "Unable to load children."
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


  const parentUsers =
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


  const therapistUsers =
    useMemo(
      () =>
        users.filter(
          user =>
            user.role ===
              "therapist" &&
            Number(
              user.is_active
            ) === 1
        ),
      [
        users,
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


  const filteredChildren =
    useMemo(
      () => {

        const query =
          search
            .trim()
            .toLowerCase();

        if (!query) {
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
                child.region,
                child.gender,
                child.id,
                assignmentText,
              ]
                .filter(
                  value =>
                    value !== null &&
                    value !== undefined
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


  const openAssignments = (
    child
  ) => {

    setSelectedChild(
      child
    );

    setSelectedParentId(
      ""
    );

    setSelectedTherapistId(
      ""
    );

    setError("");

  };


  const closeAssignments =
    () => {

      if (saving) {
        return;
      }

      setSelectedChild(
        null
      );

      setSelectedParentId(
        ""
      );

      setSelectedTherapistId(
        ""
      );

    };


  const assignUser =
    async (
      userId
    ) => {

      if (
        !selectedChild ||
        !userId
      ) {
        return;
      }

      try {

        setSaving(true);
        setError("");

        await api.post(
          "/users/assignments",
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
        );

        await loadData(
          true
        );

        setSelectedParentId(
          ""
        );

        setSelectedTherapistId(
          ""
        );

      } catch (requestError) {

        console.error(
          requestError
        );

        setError(
          requestError.response
            ?.data
            ?.message ||
          "Unable to create assignment."
        );

      } finally {

        setSaving(false);

      }

    };


  const removeAssignment =
    async (
      childId,
      userId,
      userName
    ) => {

      const confirmed =
        window.confirm(
          `Remove ${userName} from this child?`
        );

      if (!confirmed) {
        return;
      }

      try {

        setSaving(true);
        setError("");

        await api.delete(
          `/users/assignments/${childId}/${userId}`
        );

        await loadData(
          true
        );

      } catch (requestError) {

        console.error(
          requestError
        );

        setError(
          requestError.response
            ?.data
            ?.message ||
          "Unable to remove assignment."
        );

      } finally {

        setSaving(false);

      }

    };


  const openAddChild =
    () => {

      setChildForm({
        ...emptyChildForm,
      });

      setChildModal({
        mode:
          "add",
        child:
          null,
      });

      setError("");

    };


  const openEditChild =
    child => {

      setChildForm({
        full_name:
          child.full_name ||
          "",
        age:
          child.age ??
          "",
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
          "",
        therapist_id:
          "",
      });

      setChildModal({
        mode:
          "edit",
        child,
      });

      setError("");

    };


  const closeChildModal =
    () => {

      if (childSaving) {
        return;
      }

      setChildModal(
        null
      );

      setChildForm({
        ...emptyChildForm,
      });

    };


  const updateChildForm =
    event => {

      const {
        name,
        value,
      } =
        event.target;

      setChildForm(
        previous => ({
          ...previous,
          [name]:
            value,
        })
      );

    };


  const saveChild =
    async event => {

      event.preventDefault();

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

        setChildSaving(true);
        setError("");

        if (
          childModal?.mode ===
          "add"
        ) {

          await api.post(
            "/children",
            {
              full_name:
                fullName,
              age,
              gender,
              region,
              notes:
                childForm.notes
                  .trim(),
              parent_id:
                childForm.parent_id
                  ? Number(
                      childForm.parent_id
                    )
                  : null,
              therapist_id:
                childForm.therapist_id
                  ? Number(
                      childForm.therapist_id
                    )
                  : null,
            }
          );

        } else {

          await api.put(
            `/children/${childModal.child.id}`,
            {
              full_name:
                fullName,
              age,
              gender,
              region,
              notes:
                childForm.notes
                  .trim(),
            }
          );

        }

        closeChildModal();

        await loadData(
          true
        );

      } catch (requestError) {

        console.error(
          requestError
        );

        setError(
          requestError.response
            ?.data
            ?.message ||
          (
            childModal?.mode ===
            "add"
              ? "Unable to add child."
              : "Unable to update child."
          )
        );

      } finally {

        setChildSaving(false);

      }

    };


  const openDeleteChild =
    async child => {

      try {

        setDeleteTarget(
          child
        );

        setDeleteInfo(
          null
        );

        setDeleteParent(
          false
        );

        setDeleteLoading(
          true
        );

        setError("");

        const response =
          await api.get(
            `/children/${child.id}/delete-info`
          );

        setDeleteInfo(
          response.data ||
          null
        );

      } catch (requestError) {

        console.error(
          requestError
        );

        setDeleteTarget(
          null
        );

        setError(
          requestError.response
            ?.data
            ?.message ||
          "Unable to load deletion information."
        );

      } finally {

        setDeleteLoading(
          false
        );

      }

    };


  const closeDeleteModal =
    () => {

      if (deleteSaving) {
        return;
      }

      setDeleteTarget(
        null
      );

      setDeleteInfo(
        null
      );

      setDeleteParent(
        false
      );

    };


  const confirmDeleteChild =
    async () => {

      if (!deleteTarget) {
        return;
      }

      try {

        setDeleteSaving(
          true
        );

        setError("");

        await api.delete(
          `/children/${deleteTarget.id}`,
          {
            data: {
              delete_parent:
                deleteParent,
            },
          }
        );

        closeDeleteModal();

        await loadData(
          true
        );

      } catch (requestError) {

        console.error(
          requestError
        );

        setError(
          requestError.response
            ?.data
            ?.message ||
          "Unable to delete child."
        );

      } finally {

        setDeleteSaving(
          false
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


  return (

    <div className="admin-children-page">

      <div className="children-heading">

        <div>

          <span>
            CHILD MANAGEMENT
          </span>

          <h1>
            Children
          </h1>

          <p>
            Add, edit and manage children,
            assessments, parents and therapists.
          </p>

        </div>

        <div className="heading-actions">

          <button
            className="add-child-button"
            onClick={
              openAddChild
            }
          >

            <Plus
              size={17}
            />

            Add Child

          </button>

          <button
            className="refresh-button"
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
              size={17}
              className={
                refreshing
                  ? "spinning"
                  : ""
              }
            />

            Refresh

          </button>

        </div>

      </div>


      <div className="children-summary">

        <div>

          <Users
            size={21}
          />

          <span>
            Total Children
          </span>

          <strong>
            {children.length}
          </strong>

        </div>

        <div>

          <UserRound
            size={21}
          />

          <span>
            Parent Accounts
          </span>

          <strong>
            {parentUsers.length}
          </strong>

        </div>

        <div>

          <UserRoundCog
            size={21}
          />

          <span>
            Therapists
          </span>

          <strong>
            {therapistUsers.length}
          </strong>

        </div>

        <div>

          <Link2
            size={21}
          />

          <span>
            Active Links
          </span>

          <strong>
            {assignments.length}
          </strong>

        </div>

      </div>


      <div className="children-toolbar">

        <div className="admin-search">

          <Search
            size={18}
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
            placeholder="Search by child, parent, therapist, region or ID..."
          />

        </div>

        <span className="result-count">

          {
            filteredChildren.length
          }
          {" "}
          {
            filteredChildren.length ===
            1
              ? "child"
              : "children"
          }

        </span>

      </div>


      {
        error && (

          <div className="children-error">
            {error}
          </div>

        )
      }


      {
        loading
          ? (

            <div className="children-loading">
              Loading children...
            </div>

          )
          : filteredChildren.length ===
            0
            ? (

              <div className="children-empty">

                <Users
                  size={34}
                />

                <h3>
                  No children found
                </h3>

                <p>
                  Try another search or add a child.
                </p>

              </div>

            )
            : (

              <div className="children-grid">

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
                        rawScore === null ||
                        rawScore === undefined ||
                        rawScore === ""
                          ? null
                          : Number(
                              rawScore
                            );

                      const score =
                        numericScore !== null &&
                        Number.isFinite(
                          numericScore
                        )
                          ? Math.round(
                              numericScore
                            )
                          : null;

                      const assessments =
                        Number(
                          child.assessment_count ??
                          0
                        );

                      return (

                        <article
                          key={
                            child.id
                          }
                          className="child-card"
                        >

                          <div className="child-card-top">

                            <div className="child-avatar-admin">

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

                            </div>

                            <div className="child-title">

                              <div>

                                <h2>
                                  {
                                    child.full_name
                                  }
                                </h2>

                                <span>
                                  ID #
                                  {
                                    child.id
                                  }
                                </span>

                              </div>

                              <div className="score-circle">

                                <strong>
                                  {
                                    score ===
                                    null
                                      ? "—"
                                      : `${score}%`
                                  }
                                </strong>

                                <small>
                                  Cognitive
                                </small>

                              </div>

                            </div>

                          </div>


                          <div className="child-info-grid">

                            <div>

                              <span>
                                Age
                              </span>

                              <strong>
                                {
                                  child.age ??
                                  "—"
                                }
                              </strong>

                            </div>

                            <div>

                              <span>
                                Gender
                              </span>

                              <strong>
                                {
                                  child.gender ||
                                  "—"
                                }
                              </strong>

                            </div>

                            <div>

                              <span>
                                Assessments
                              </span>

                              <strong>
                                {
                                  Number.isFinite(
                                    assessments
                                  )
                                    ? assessments
                                    : 0
                                }
                              </strong>

                            </div>

                          </div>


                          <div className="child-location">

                            <MapPin
                              size={15}
                            />

                            {
                              child.region ||
                              "No region"
                            }

                          </div>


                          <div className="relationship-section">

                            <div className="relationship-heading">

                              <UserRound
                                size={16}
                              />

                              <span>
                                Parent
                              </span>

                            </div>

                            <div className="relationship-items">

                              {
                                linkedParents.length >
                                0
                                  ? (

                                    <span className="relationship-chip parent-chip">
                                      {
                                        linkedParents[0]
                                          .user_name
                                      }
                                    </span>

                                  )
                                  : (

                                    <span className="no-relation">
                                      No parent account linked
                                    </span>

                                  )
                              }

                            </div>

                          </div>


                          <div className="relationship-section">

                            <div className="relationship-heading">

                              <UserRoundCog
                                size={16}
                              />

                              <span>
                                Therapist
                              </span>

                            </div>

                            <div className="relationship-items">

                              {
                                linkedTherapists.length >
                                0
                                  ? (

                                    <span className="relationship-chip therapist-chip">
                                      {
                                        linkedTherapists[0]
                                          .user_name
                                      }
                                    </span>

                                  )
                                  : (

                                    <span className="no-relation">
                                      No therapist assigned
                                    </span>

                                  )
                              }

                            </div>

                          </div>


                          <div className="child-actions">

                            <button
                              className="manage-assignments"
                              onClick={() =>
                                openAssignments(
                                  child
                                )
                              }
                            >

                              <Link2
                                size={16}
                              />

                              Assignments

                            </button>

                            <button
                              className="edit-child-button"
                              onClick={() =>
                                openEditChild(
                                  child
                                )
                              }
                            >

                              <Pencil
                                size={15}
                              />

                              Edit

                            </button>

                            <button
                              className="delete-child-button"
                              onClick={() =>
                                openDeleteChild(
                                  child
                                )
                              }
                            >

                              <Trash2
                                size={15}
                              />

                              Delete

                            </button>

                          </div>

                        </article>

                      );

                    }
                  )
                }

              </div>

            )
      }


      {
        childModal && (

          <div
            className="assignment-overlay"
            onMouseDown={
              event => {

                if (
                  event.target ===
                  event.currentTarget
                ) {
                  closeChildModal();
                }

              }
            }
          >

            <form
              className="child-form-modal"
              onSubmit={
                saveChild
              }
            >

              <div className="assignment-modal-header">

                <div>

                  <span>
                    {
                      childModal.mode ===
                      "add"
                        ? "ADD CHILD"
                        : "EDIT CHILD"
                    }
                  </span>

                  <h2>
                    {
                      childModal.mode ===
                      "add"
                        ? "New Child"
                        : childModal.child
                            .full_name
                    }
                  </h2>

                </div>

                <button
                  type="button"
                  onClick={
                    closeChildModal
                  }
                  disabled={
                    childSaving
                  }
                >

                  <X
                    size={20}
                  />

                </button>

              </div>


              <div className="child-form-grid">

                <label>

                  <span>
                    Full Name
                  </span>

                  <input
                    name="full_name"
                    value={
                      childForm.full_name
                    }
                    onChange={
                      updateChildForm
                    }
                    placeholder="Child full name"
                    required
                  />

                </label>

                <label>

                  <span>
                    Age
                  </span>

                  <input
                    name="age"
                    type="number"
                    min="1"
                    value={
                      childForm.age
                    }
                    onChange={
                      updateChildForm
                    }
                    placeholder="Age"
                    required
                  />

                </label>

                <label>

                  <span>
                    Gender
                  </span>

                  <select
                    name="gender"
                    value={
                      childForm.gender
                    }
                    onChange={
                      updateChildForm
                    }
                    required
                  >

                    <option value="">
                      Select gender
                    </option>

                    <option value="Male">
                      Male
                    </option>

                    <option value="Female">
                      Female
                    </option>

                  </select>

                </label>

                <label>

                  <span>
                    Region
                  </span>

                  <input
                    name="region"
                    value={
                      childForm.region
                    }
                    onChange={
                      updateChildForm
                    }
                    placeholder="Region"
                    required
                  />

                </label>

              </div>


              <label className="notes-field">

                <span>
                  Notes
                </span>

                <textarea
                  name="notes"
                  value={
                    childForm.notes
                  }
                  onChange={
                    updateChildForm
                  }
                  placeholder="Therapist or admin notes"
                  rows={4}
                />

              </label>


              {
                childModal.mode ===
                "add" && (

                  <div className="new-child-links">

                    <label>

                      <span>
                        Parent
                      </span>

                      <select
                        name="parent_id"
                        value={
                          childForm.parent_id
                        }
                        onChange={
                          updateChildForm
                        }
                      >

                        <option value="">
                          No parent yet
                        </option>

                        {
                          parentUsers.map(
                            parent => (

                              <option
                                key={
                                  parent.id
                                }
                                value={
                                  parent.id
                                }
                              >
                                {
                                  parent.full_name
                                }
                                {" — "}
                                {
                                  parent.email
                                }
                              </option>

                            )
                          )
                        }

                      </select>

                    </label>

                    <label>

                      <span>
                        Therapist
                      </span>

                      <select
                        name="therapist_id"
                        value={
                          childForm.therapist_id
                        }
                        onChange={
                          updateChildForm
                        }
                      >

                        <option value="">
                          No therapist yet
                        </option>

                        {
                          therapistUsers.map(
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

                  </div>

                )
              }


              <div className="form-actions">

                <button
                  type="button"
                  className="secondary-action"
                  onClick={
                    closeChildModal
                  }
                  disabled={
                    childSaving
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-action"
                  disabled={
                    childSaving
                  }
                >

                  {
                    childSaving
                      ? "Saving..."
                      : childModal.mode ===
                        "add"
                        ? "Add Child"
                        : "Save Changes"
                  }

                </button>

              </div>

            </form>

          </div>

        )
      }


      {
        deleteTarget && (

          <div
            className="assignment-overlay"
            onMouseDown={
              event => {

                if (
                  event.target ===
                  event.currentTarget
                ) {
                  closeDeleteModal();
                }

              }
            }
          >

            <div className="delete-child-modal">

              <div className="assignment-modal-header">

                <div>

                  <span>
                    DELETE CHILD
                  </span>

                  <h2>
                    {
                      deleteTarget.full_name
                    }
                  </h2>

                </div>

                <button
                  onClick={
                    closeDeleteModal
                  }
                  disabled={
                    deleteSaving
                  }
                >

                  <X
                    size={20}
                  />

                </button>

              </div>


              {
                deleteLoading
                  ? (

                    <div className="delete-loading">
                      Loading...
                    </div>

                  )
                  : (

                    <>

                      <div className="delete-warning">

                        <Trash2
                          size={20}
                        />

                        <div>

                          <strong>
                            Delete this child?
                          </strong>

                          <span>
                            Child sessions and related records may also be removed according to the database relationships.
                          </span>

                        </div>

                      </div>


                      {
                        deleteInfo
                          ?.parent && (

                          <div className="delete-parent-option">

                            <div>

                              <strong>
                                Linked parent
                              </strong>

                              <span>
                                {
                                  deleteInfo
                                    .parent
                                    .full_name
                                }
                                {
                                  deleteInfo
                                    .parent
                                    .email
                                    ? ` — ${deleteInfo.parent.email}`
                                    : ""
                                }
                              </span>

                            </div>

                            <label>

                              <input
                                type="checkbox"
                                checked={
                                  deleteParent
                                }
                                onChange={
                                  event =>
                                    setDeleteParent(
                                      event.target.checked
                                    )
                                }
                              />

                              Delete parent account too

                            </label>

                          </div>

                        )
                      }


                      {
                        deleteParent &&
                        deleteInfo
                          ?.parent_has_other_children && (

                          <div className="delete-parent-warning">

                            This parent has other children.
                            Deleting the parent account will remove the parent's links to those children too,
                            but the other children themselves will remain.

                          </div>

                        )
                      }


                      {
                        deleteInfo
                          ?.parent_children
                          ?.filter(
                            child =>
                              Number(
                                child.id
                              ) !==
                              Number(
                                deleteTarget.id
                              )
                          )
                          .length >
                        0 && (

                          <div className="other-children">

                            <span>
                              Other children linked to this parent
                            </span>

                            <div>

                              {
                                deleteInfo
                                  .parent_children
                                  .filter(
                                    child =>
                                      Number(
                                        child.id
                                      ) !==
                                      Number(
                                        deleteTarget.id
                                      )
                                  )
                                  .map(
                                    child => (

                                      <strong
                                        key={
                                          child.id
                                        }
                                      >
                                        {
                                          child.full_name
                                        }
                                      </strong>

                                    )
                                  )
                              }

                            </div>

                          </div>

                        )
                      }


                      <div className="form-actions">

                        <button
                          className="secondary-action"
                          onClick={
                            closeDeleteModal
                          }
                          disabled={
                            deleteSaving
                          }
                        >
                          Cancel
                        </button>

                        <button
                          className="danger-action"
                          onClick={
                            confirmDeleteChild
                          }
                          disabled={
                            deleteSaving
                          }
                        >

                          {
                            deleteSaving
                              ? "Deleting..."
                              : deleteParent
                                ? "Delete Child & Parent"
                                : "Delete Child"
                          }

                        </button>

                      </div>

                    </>

                  )
              }

            </div>

          </div>

        )
      }


      {
        selectedChild && (

          <div
            className="assignment-overlay"
            onMouseDown={
              event => {

                if (
                  event.target ===
                  event.currentTarget
                ) {
                  closeAssignments();
                }

              }
            }
          >

            <div className="assignment-modal">

              <div className="assignment-modal-header">

                <div>

                  <span>
                    MANAGE ASSIGNMENTS
                  </span>

                  <h2>
                    {
                      selectedChild.full_name
                    }
                  </h2>

                </div>

                <button
                  onClick={
                    closeAssignments
                  }
                  disabled={
                    saving
                  }
                >

                  <X
                    size={20}
                  />

                </button>

              </div>


              <div className="assignment-block">

                <div className="assignment-title">

                  <UserRound
                    size={18}
                  />

                  <div>

                    <strong>
                      Parent
                    </strong>

                    <span>
                      Each child can have one parent account
                    </span>

                  </div>

                </div>


                {
                  selectedParents.length >
                  0
                    ? (

                      <div className="assigned-users">

                        {
                          selectedParents.map(
                            parent => (

                              <div
                                key={
                                  parent.user_id
                                }
                                className="assigned-user"
                              >

                                <div>

                                  <strong>
                                    {
                                      parent.user_name
                                    }
                                  </strong>

                                  <span>
                                    {
                                      parent.user_email
                                    }
                                  </span>

                                </div>

                                <button
                                  onClick={() =>
                                    removeAssignment(
                                      selectedChild.id,
                                      parent.user_id,
                                      parent.user_name
                                    )
                                  }
                                  disabled={
                                    saving
                                  }
                                >

                                  <Trash2
                                    size={15}
                                  />

                                </button>

                              </div>

                            )
                          )
                        }

                        <div className="assignment-limit-note">
                          Remove the current parent before linking another parent.
                        </div>

                      </div>

                    )
                    : parentUsers.length >
                      0
                      ? (

                        <div className="assignment-add-row">

                          <select
                            value={
                              selectedParentId
                            }
                            onChange={
                              event =>
                                setSelectedParentId(
                                  event.target.value
                                )
                            }
                          >

                            <option value="">
                              Select parent
                            </option>

                            {
                              parentUsers.map(
                                parent => (

                                  <option
                                    key={
                                      parent.id
                                    }
                                    value={
                                      parent.id
                                    }
                                  >
                                    {
                                      parent.full_name
                                    }
                                    {" — "}
                                    {
                                      parent.email
                                    }
                                  </option>

                                )
                              )
                            }

                          </select>

                          <button
                            onClick={() =>
                              assignUser(
                                selectedParentId
                              )
                            }
                            disabled={
                              !selectedParentId ||
                              saving
                            }
                          >

                            <Plus
                              size={16}
                            />

                            Link Parent

                          </button>

                        </div>

                      )
                      : (

                        <div className="no-accounts-message">
                          No active parent accounts exist yet.
                        </div>

                      )
                }

              </div>


              <div className="assignment-block">

                <div className="assignment-title">

                  <UserRoundCog
                    size={18}
                  />

                  <div>

                    <strong>
                      Therapist
                    </strong>

                    <span>
                      Each child can have one therapist
                    </span>

                  </div>

                </div>


                {
                  selectedTherapists.length >
                  0
                    ? (

                      <div className="assigned-users">

                        {
                          selectedTherapists.map(
                            therapist => (

                              <div
                                key={
                                  therapist.user_id
                                }
                                className="assigned-user"
                              >

                                <div>

                                  <strong>
                                    {
                                      therapist.user_name
                                    }
                                  </strong>

                                  <span>
                                    {
                                      therapist.user_email
                                    }
                                  </span>

                                </div>

                                <button
                                  onClick={() =>
                                    removeAssignment(
                                      selectedChild.id,
                                      therapist.user_id,
                                      therapist.user_name
                                    )
                                  }
                                  disabled={
                                    saving
                                  }
                                >

                                  <Trash2
                                    size={15}
                                  />

                                </button>

                              </div>

                            )
                          )
                        }

                        <div className="assignment-limit-note">
                          Remove the current therapist before assigning another therapist.
                        </div>

                      </div>

                    )
                    : therapistUsers.length >
                      0
                      ? (

                        <div className="assignment-add-row">

                          <select
                            value={
                              selectedTherapistId
                            }
                            onChange={
                              event =>
                                setSelectedTherapistId(
                                  event.target.value
                                )
                            }
                          >

                            <option value="">
                              Select therapist
                            </option>

                            {
                              therapistUsers.map(
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

                          <button
                            onClick={() =>
                              assignUser(
                                selectedTherapistId
                              )
                            }
                            disabled={
                              !selectedTherapistId ||
                              saving
                            }
                          >

                            <Plus
                              size={16}
                            />

                            Assign Therapist

                          </button>

                        </div>

                      )
                      : (

                        <div className="no-accounts-message">
                          No active therapist accounts exist yet.
                        </div>

                      )
                }

              </div>


              {
                saving && (

                  <div className="saving-message">

                    <Activity
                      size={16}
                    />

                    Updating assignments...

                  </div>

                )
              }

            </div>

          </div>

        )
      }


      <style>
        {`
          .admin-children-page {
            width: 100%;
          }

          .children-heading {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 24px;
          }

          .children-heading > div:first-child > span {
            color: #8172EA;
            font-size: 10px;
            font-weight: 800;
            letter-spacing: .1em;
          }

          .children-heading h1 {
            margin: 6px 0 5px;
            color: #303253;
            font-size: 28px;
          }

          .children-heading p {
            margin: 0;
            color: #9699AC;
            font-size: 13px;
          }

          .heading-actions {
            display: flex;
            align-items: center;
            gap: 9px;
          }

          .refresh-button,
          .add-child-button {
            height: 40px;
            border-radius: 13px;
            padding: 0 14px;
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            font-size: 11px;
            font-weight: 650;
          }

          .refresh-button {
            border: 1px solid #E8E7F2;
            background: white;
            color: #7164D8;
          }

          .add-child-button {
            border: 0;
            background: #7969EA;
            color: white;
          }

          .refresh-button:disabled,
          .add-child-button:disabled {
            opacity: .6;
            cursor: not-allowed;
          }

          .spinning {
            animation: adminSpin .8s linear infinite;
          }

          @keyframes adminSpin {
            to {
              transform: rotate(360deg);
            }
          }

          .children-summary {
            display: grid;
            grid-template-columns:
              repeat(4, minmax(0, 1fr));
            gap: 14px;
            margin-top: 22px;
          }

          .children-summary > div {
            min-height: 86px;
            padding: 16px;
            border-radius: 18px;
            border: 1px solid #ECECF4;
            background: white;
            display: grid;
            grid-template-columns:
              34px 1fr auto;
            align-items: center;
            gap: 10px;
            color: #7566E8;
          }

          .children-summary span {
            color: #8D90A5;
            font-size: 11.5px;
          }

          .children-summary strong {
            color: #333553;
            font-size: 21px;
          }

          .children-toolbar {
            margin-top: 18px;
            padding: 14px;
            border-radius: 18px;
            border: 1px solid #ECECF4;
            background: white;
            display: flex;
            align-items: center;
            gap: 15px;
          }

          .admin-search {
            flex: 1;
            height: 43px;
            border: 1px solid #E7E7F0;
            border-radius: 13px;
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 0 14px;
            color: #A0A3B6;
            background: #FBFBFD;
          }

          .admin-search input {
            width: 100%;
            height: 100%;
            border: 0;
            outline: 0;
            background: transparent;
            color: #343654;
            font-size: 12.5px;
          }

          .result-count {
            min-width: 80px;
            color: #9699AC;
            font-size: 11px;
            text-align: right;
          }

          .children-error {
            margin-top: 15px;
            padding: 12px 15px;
            border-radius: 13px;
            border: 1px solid #F5D5DD;
            background: #FFF1F4;
            color: #B8445D;
            font-size: 12px;
          }

          .children-loading,
          .children-empty {
            min-height: 330px;
            margin-top: 18px;
            border: 1px solid #ECECF4;
            border-radius: 22px;
            background: white;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: #9A9DAE;
            font-size: 13px;
          }

          .children-empty svg {
            color: #8879EE;
          }

          .children-empty h3 {
            margin: 12px 0 4px;
            color: #484A68;
          }

          .children-empty p {
            margin: 0;
          }

          .children-grid {
            display: grid;
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
            gap: 17px;
            margin-top: 18px;
          }

          .child-card {
            padding: 20px;
            border: 1px solid #ECECF4;
            border-radius: 21px;
            background: white;
            box-shadow:
              0 7px 23px
              rgba(61,62,94,.035);
          }

          .child-card-top {
            display: flex;
            gap: 13px;
            align-items: center;
          }

          .child-avatar-admin {
            width: 48px;
            height: 48px;
            flex: 0 0 auto;
            display: grid;
            place-items: center;
            border-radius: 15px;
            background:
              linear-gradient(
                135deg,
                #F0EDFF,
                #FCEEFF
              );
            color: #7968E9;
            font-size: 17px;
            font-weight: 800;
          }

          .child-title {
            flex: 1;
            min-width: 0;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
          }

          .child-title h2 {
            margin: 0;
            color: #373957;
            font-size: 16px;
          }

          .child-title > div:first-child span {
            display: block;
            margin-top: 3px;
            color: #A2A5B5;
            font-size: 10px;
          }

          .score-circle {
            width: 62px;
            height: 52px;
            flex: 0 0 auto;
            border-radius: 16px;
            background: #F5F2FF;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          }

          .score-circle strong {
            color: #7666E6;
            font-size: 15px;
          }

          .score-circle small {
            color: #999BAC;
            font-size: 8px;
          }

          .child-info-grid {
            display: grid;
            grid-template-columns:
              repeat(3, 1fr);
            gap: 8px;
            margin-top: 17px;
          }

          .child-info-grid > div {
            padding: 10px;
            border-radius: 12px;
            background: #F9F9FC;
            display: flex;
            flex-direction: column;
          }

          .child-info-grid span {
            color: #A1A4B4;
            font-size: 9px;
          }

          .child-info-grid strong {
            margin-top: 3px;
            color: #5A5C72;
            font-size: 11px;
          }

          .child-location {
            min-height: 34px;
            margin-top: 10px;
            padding: 0 10px;
            border-radius: 11px;
            display: flex;
            align-items: center;
            gap: 7px;
            color: #85899D;
            background: #FAFAFC;
            font-size: 10.5px;
          }

          .relationship-section {
            margin-top: 13px;
          }

          .relationship-heading {
            display: flex;
            align-items: center;
            gap: 7px;
            color: #777A90;
          }

          .relationship-heading span {
            font-size: 10.5px;
            font-weight: 700;
          }

          .relationship-items {
            min-height: 30px;
            margin-top: 7px;
            display: flex;
            gap: 6px;
            flex-wrap: wrap;
          }

          .relationship-chip {
            padding: 6px 9px;
            border-radius: 999px;
            font-size: 9.5px;
            font-weight: 600;
          }

          .parent-chip {
            color: #BF599F;
            background: #FFF0FA;
          }

          .therapist-chip {
            color: #4387C4;
            background: #EDF6FF;
          }

          .no-relation {
            color: #B0B2BF;
            font-size: 9.5px;
            align-self: center;
          }

          .child-actions {
            margin-top: 15px;
            display: grid;
            grid-template-columns:
              1.4fr .8fr .8fr;
            gap: 7px;
          }

          .manage-assignments,
          .edit-child-button,
          .delete-child-button {
            height: 41px;
            border-radius: 13px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 7px;
            cursor: pointer;
            font-size: 10.5px;
            font-weight: 650;
          }

          .manage-assignments {
            border: 1px solid #E5E0FF;
            background: #F7F4FF;
            color: #7565E6;
          }

          .edit-child-button {
            border: 1px solid #DCEBF7;
            background: #F2F8FD;
            color: #4D87B5;
          }

          .delete-child-button {
            border: 1px solid #F6DDE2;
            background: #FFF4F6;
            color: #C95166;
          }

          .assignment-overlay {
            position: fixed;
            z-index: 1000;
            inset: 0;
            padding: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(37,35,64,.36);
            backdrop-filter: blur(5px);
          }

          .assignment-modal,
          .child-form-modal,
          .delete-child-modal {
            width: min(650px, 100%);
            max-height: 90vh;
            overflow-y: auto;
            padding: 24px;
            border-radius: 23px;
            background: white;
            box-shadow:
              0 25px 80px
              rgba(38,35,75,.2);
          }

          .child-form-modal {
            width: min(720px, 100%);
          }

          .delete-child-modal {
            width: min(580px, 100%);
          }

          .assignment-modal-header {
            display: flex;
            justify-content: space-between;
            gap: 20px;
            align-items: flex-start;
            padding-bottom: 17px;
            border-bottom: 1px solid #EFEFF5;
          }

          .assignment-modal-header span {
            color: #8070EA;
            font-size: 9.5px;
            font-weight: 800;
            letter-spacing: .09em;
          }

          .assignment-modal-header h2 {
            margin: 5px 0 0;
            color: #353754;
            font-size: 21px;
          }

          .assignment-modal-header > button {
            width: 37px;
            height: 37px;
            border: 0;
            border-radius: 11px;
            display: grid;
            place-items: center;
            color: #85889B;
            background: #F5F5F9;
            cursor: pointer;
          }

          .assignment-block {
            margin-top: 20px;
            padding: 17px;
            border-radius: 17px;
            border: 1px solid #ECECF4;
          }

          .assignment-title {
            display: flex;
            gap: 10px;
            color: #7869E5;
          }

          .assignment-title div {
            display: flex;
            flex-direction: column;
          }

          .assignment-title strong {
            color: #484A66;
            font-size: 12.5px;
          }

          .assignment-title span {
            margin-top: 2px;
            color: #A0A2B2;
            font-size: 9.5px;
          }

          .assigned-users {
            margin-top: 14px;
            display: flex;
            flex-direction: column;
            gap: 7px;
          }

          .assigned-user {
            min-height: 50px;
            padding: 8px 10px 8px 12px;
            border-radius: 12px;
            background: #F9F9FC;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
          }

          .assigned-user > div {
            min-width: 0;
            display: flex;
            flex-direction: column;
          }

          .assigned-user strong {
            color: #505269;
            font-size: 11px;
          }

          .assigned-user span {
            margin-top: 2px;
            color: #A2A4B3;
            font-size: 9.5px;
          }

          .assigned-user button {
            width: 33px;
            height: 33px;
            flex: 0 0 auto;
            border: 0;
            border-radius: 9px;
            display: grid;
            place-items: center;
            background: #FFF0F2;
            color: #D65768;
            cursor: pointer;
          }

          .assignment-limit-note {
            padding: 9px 11px;
            border-radius: 10px;
            background: #FAFAFC;
            color: #9B9EAF;
            font-size: 9.5px;
            line-height: 1.45;
          }

          .assignment-add-row {
            margin-top: 13px;
            display: flex;
            gap: 9px;
          }

          .assignment-add-row select {
            flex: 1;
            min-width: 0;
            height: 41px;
            padding: 0 10px;
            border: 1px solid #E1E1EC;
            border-radius: 11px;
            outline: none;
            color: #585A70;
            background: white;
            font-size: 10.5px;
          }

          .assignment-add-row button {
            height: 41px;
            padding: 0 13px;
            border: 0;
            border-radius: 11px;
            display: flex;
            align-items: center;
            gap: 6px;
            color: white;
            background: #7969EA;
            cursor: pointer;
            font-size: 10.5px;
            white-space: nowrap;
          }

          .assignment-add-row button:disabled {
            cursor: not-allowed;
            opacity: .45;
          }

          .no-accounts-message {
            margin-top: 13px;
            padding: 11px;
            border-radius: 11px;
            color: #A06B81;
            background: #FFF5F8;
            font-size: 10.5px;
            line-height: 1.5;
          }

          .saving-message {
            margin-top: 15px;
            color: #7566DF;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 7px;
            font-size: 10.5px;
          }

          .child-form-grid,
          .new-child-links {
            display: grid;
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
            gap: 13px;
            margin-top: 20px;
          }

          .new-child-links {
            padding-top: 16px;
            border-top: 1px solid #EFEFF5;
          }

          .child-form-grid label,
          .new-child-links label,
          .notes-field {
            display: flex;
            flex-direction: column;
            gap: 7px;
          }

          .child-form-grid label span,
          .new-child-links label span,
          .notes-field span {
            color: #6B6E83;
            font-size: 10.5px;
            font-weight: 700;
          }

          .child-form-grid input,
          .child-form-grid select,
          .new-child-links select,
          .notes-field textarea {
            width: 100%;
            box-sizing: border-box;
            border: 1px solid #E2E2EB;
            border-radius: 12px;
            outline: none;
            background: #FBFBFD;
            color: #45475F;
            font-family: inherit;
            font-size: 11.5px;
          }

          .child-form-grid input,
          .child-form-grid select,
          .new-child-links select {
            height: 43px;
            padding: 0 12px;
          }

          .notes-field {
            margin-top: 13px;
          }

          .notes-field textarea {
            padding: 11px 12px;
            resize: vertical;
          }

          .form-actions {
            margin-top: 20px;
            display: flex;
            justify-content: flex-end;
            gap: 9px;
          }

          .secondary-action,
          .primary-action,
          .danger-action {
            min-width: 110px;
            height: 41px;
            border-radius: 12px;
            cursor: pointer;
            font-size: 10.5px;
            font-weight: 700;
          }

          .secondary-action {
            border: 1px solid #E4E4EC;
            background: white;
            color: #777A8D;
          }

          .primary-action {
            border: 0;
            background: #7969EA;
            color: white;
          }

          .danger-action {
            border: 0;
            background: #D9576C;
            color: white;
          }

          .secondary-action:disabled,
          .primary-action:disabled,
          .danger-action:disabled {
            opacity: .55;
            cursor: not-allowed;
          }

          .delete-loading {
            min-height: 160px;
            display: grid;
            place-items: center;
            color: #979AAB;
            font-size: 11px;
          }

          .delete-warning {
            margin-top: 18px;
            padding: 14px;
            display: flex;
            gap: 11px;
            border-radius: 14px;
            background: #FFF5F6;
            color: #C95769;
          }

          .delete-warning > div {
            display: flex;
            flex-direction: column;
          }

          .delete-warning strong {
            color: #934355;
            font-size: 12px;
          }

          .delete-warning span {
            margin-top: 4px;
            color: #A87781;
            font-size: 9.5px;
            line-height: 1.5;
          }

          .delete-parent-option {
            margin-top: 14px;
            padding: 14px;
            border: 1px solid #ECECF4;
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
          }

          .delete-parent-option > div {
            min-width: 0;
            display: flex;
            flex-direction: column;
          }

          .delete-parent-option strong {
            color: #55576D;
            font-size: 10.5px;
          }

          .delete-parent-option span {
            margin-top: 3px;
            color: #9699AA;
            font-size: 9.5px;
          }

          .delete-parent-option label {
            display: flex;
            align-items: center;
            gap: 7px;
            color: #A64D60;
            font-size: 10px;
            white-space: nowrap;
          }

          .delete-parent-warning {
            margin-top: 10px;
            padding: 11px 13px;
            border-radius: 12px;
            background: #FFF4E8;
            color: #A47035;
            font-size: 9.5px;
            line-height: 1.55;
          }

          .other-children {
            margin-top: 12px;
            padding: 12px;
            border-radius: 12px;
            background: #FAFAFC;
          }

          .other-children > span {
            color: #9295A7;
            font-size: 9.5px;
          }

          .other-children > div {
            margin-top: 7px;
            display: flex;
            gap: 6px;
            flex-wrap: wrap;
          }

          .other-children strong {
            padding: 5px 8px;
            border-radius: 999px;
            background: white;
            color: #65687D;
            font-size: 9px;
          }

          @media (max-width: 1100px) {
            .children-summary {
              grid-template-columns:
                repeat(2, 1fr);
            }
          }

          @media (max-width: 850px) {
            .children-grid {
              grid-template-columns:
                1fr;
            }

            .children-heading {
              flex-direction: column;
            }

            .heading-actions {
              width: 100%;
            }

            .add-child-button,
            .refresh-button {
              flex: 1;
              justify-content: center;
            }
          }

          @media (max-width: 650px) {
            .children-summary {
              grid-template-columns:
                1fr;
            }

            .child-actions {
              grid-template-columns:
                1fr;
            }

            .child-form-grid,
            .new-child-links {
              grid-template-columns:
                1fr;
            }

            .assignment-overlay {
              padding: 14px;
            }

            .assignment-add-row {
              flex-direction: column;
            }

            .delete-parent-option {
              align-items: flex-start;
              flex-direction: column;
            }
          }
        `}
      </style>

    </div>

  );

}