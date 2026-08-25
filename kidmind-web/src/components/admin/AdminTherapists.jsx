import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Baby,
  Check,
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
  Users,
  X,
} from "lucide-react";

import api from "../../services/api";


const emptyForm = {
  full_name: "",
  email: "",
  phone: "",
  password: "",
};


export default function AdminTherapists() {

  const [
    users,
    setUsers,
  ] = useState([]);


  const [
    children,
    setChildren,
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
    modalMode,
    setModalMode,
  ] = useState(null);


  const [
    selectedTherapist,
    setSelectedTherapist,
  ] = useState(null);


  const [
    form,
    setForm,
  ] = useState(
    emptyForm
  );


  const [
    saving,
    setSaving,
  ] = useState(false);


  const [
    selectedChildId,
    setSelectedChildId,
  ] = useState("");


  const [
    availableChildOptions,
    setAvailableChildOptions,
  ] = useState([]);


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

        const response =
          await api.get(
            "/users/available-children?link_type=therapist"
          );

        setAvailableChildOptions(
          Array.isArray(
            response.data
          )
            ? response.data
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
          requestError
            ?.response
            ?.data
            ?.message ||
          "Unable to load available children."
        );

      } finally {

        setLoadingAvailableChildren(
          false
        );

      }

    };


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
          usersResponse,
          childrenResponse,
          assignmentsResponse,
        ] =
          await Promise.all([
            api.get(
              "/users"
            ),

            api.get(
              "/children"
            ),

            api.get(
              "/users/assignments"
            ),
          ]);


        setUsers(
          Array.isArray(
            usersResponse.data
          )
            ? usersResponse.data
            : []
        );


        setChildren(
          Array.isArray(
            childrenResponse.data
          )
            ? childrenResponse.data
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
          "Unable to load therapists."
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
      [
        users,
      ]
    );


  const assignmentsByTherapist =
    useMemo(
      () => {

        const map = {};


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


              if (
                !map[userId]
              ) {

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
                .join(
                  " "
                );


            const searchable =
              [
                therapist.full_name,
                therapist.email,
                therapist.phone,
                therapist.id,
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
        therapists,
        search,
        assignmentsByTherapist,
      ]
    );


  const activeTherapists =
    therapists.filter(
      therapist =>
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


  const openCreate =
    () => {

      setModalMode(
        "create"
      );

      setSelectedTherapist(
        null
      );

      setSelectedChildId(
        ""
      );

      setForm(
        emptyForm
      );

      setError("");
      setSuccess("");

    };


  const openEdit =
    therapist => {

      setModalMode(
        "edit"
      );

      setSelectedTherapist(
        therapist
      );

      setForm({
        full_name:
          therapist.full_name ||
          "",

        email:
          therapist.email ||
          "",

        phone:
          therapist.phone ||
          "",

        password:
          "",
      });

      setError("");
      setSuccess("");

    };


  const openChildren =
    async therapist => {

      setModalMode(
        "children"
      );

      setSelectedTherapist(
        therapist
      );

      setSelectedChildId(
        ""
      );

      setAvailableChildOptions(
        []
      );

      setError("");
      setSuccess("");

      await loadAvailableChildren();

    };


  const closeModal =
    () => {

      if (saving) {
        return;
      }


      setModalMode(
        null
      );

      setSelectedTherapist(
        null
      );

      setSelectedChildId(
        ""
      );

      setAvailableChildOptions(
        []
      );

      setForm(
        emptyForm
      );

    };


  const handleField =
    event => {

      const {
        name,
        value,
      } =
        event.target;


      setForm(
        previous => ({
          ...previous,
          [name]:
            value,
        })
      );

    };


  const createTherapist =
    async event => {

      event.preventDefault();


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


        await api.post(
          "/users/register",
          {
            full_name:
              fullName,

            email,

            password,

            role:
              "therapist",

            phone:
              form.phone.trim() ||
              null,
          }
        );


        setSuccess(
          "Therapist account created successfully."
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

            setSuccess("");

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
          requestError
            ?.response
            ?.data
            ?.message ||
          "Unable to create therapist."
        );

      } finally {

        setSaving(false);

      }

    };


  const updateTherapist =
    async event => {

      event.preventDefault();


      if (
        !selectedTherapist
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

        setSaving(true);
        setError("");
        setSuccess("");


        await api.put(
          `/users/${selectedTherapist.id}`,
          {
            full_name:
              fullName,

            email,

            phone:
              form.phone.trim() ||
              null,
          }
        );


        setSuccess(
          "Therapist updated successfully."
        );


        await loadData(
          true
        );


        setTimeout(
          () => {

            setModalMode(
              null
            );

            setSelectedTherapist(
              null
            );

            setSuccess("");

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
          requestError
            ?.response
            ?.data
            ?.message ||
          "Unable to update therapist."
        );

      } finally {

        setSaving(false);

      }

    };


  const toggleStatus =
    async therapist => {

      const currentlyActive =
        Number(
          therapist.is_active
        ) === 1;


      const confirmed =
        window.confirm(
          `${
            currentlyActive
              ? "Deactivate"
              : "Activate"
          } ${therapist.full_name}?`
        );


      if (!confirmed) {
        return;
      }


      try {

        setError("");
        setSuccess("");


        await api.patch(
          `/users/${therapist.id}/status`,
          {
            is_active:
              !currentlyActive,
          }
        );


        setSuccess(
          currentlyActive
            ? "Therapist account deactivated."
            : "Therapist account activated."
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
          "Unable to change account status."
        );

      }

    };


  const deleteTherapist =
    async therapist => {

      const confirmed =
        window.confirm(
          `Delete ${therapist.full_name} permanently?\n\nTheir child assignments will also be removed.`
        );


      if (!confirmed) {
        return;
      }


      try {

        setError("");
        setSuccess("");


        await api.delete(
          `/users/${therapist.id}`
        );


        setSuccess(
          "Therapist account deleted."
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
          "Unable to delete therapist."
        );

      }

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


        await api.post(
          "/users/assignments",
          {
            child_id:
              Number(
                selectedChildId
              ),

            user_id:
              Number(
                selectedTherapist.id
              ),
          }
        );


        setSuccess(
          "Child assigned successfully."
        );


        setSelectedChildId(
          ""
        );


        await loadData(
          true
        );

        await loadAvailableChildren();

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
          "Unable to assign child."
        );

      } finally {

        setSaving(false);

      }

    };


  const unlinkChild =
    async (
      childId,
      childName
    ) => {

      if (
        !selectedTherapist
      ) {
        return;
      }


      const confirmed =
        window.confirm(
          `Remove ${childName} from ${selectedTherapist.full_name}?`
        );


      if (!confirmed) {
        return;
      }


      try {

        setSaving(true);
        setError("");
        setSuccess("");


        await api.delete(
          `/users/assignments/${childId}/${selectedTherapist.id}`
        );


        setSuccess(
          "Child assignment removed."
        );


        await loadData(
          true
        );

        await loadAvailableChildren();

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
          "Unable to remove child assignment."
        );

      } finally {

        setSaving(false);

      }

    };


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


  return (

    <div className="admin-therapists-page">

      <div className="therapists-heading">

        <div>

          <span>
            USER MANAGEMENT
          </span>

          <h1>
            Therapists
          </h1>

          <p>
            Manage therapist accounts,
            account access and each
            therapist's assigned children.
          </p>

        </div>


        <div className="therapists-heading-actions">

          <button
            className="therapists-refresh"
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
                  ? "therapist-spin"
                  : ""
              }
            />

            Refresh

          </button>


          <button
            className="add-therapist-button"
            onClick={
              openCreate
            }
          >

            <UserPlus
              size={17}
            />

            Add Therapist

          </button>

        </div>

      </div>


      <div className="therapists-stats">

        <div>

          <Stethoscope
            size={21}
          />

          <span>
            Total Therapists
          </span>

          <strong>
            {therapists.length}
          </strong>

        </div>


        <div>

          <Check
            size={21}
          />

          <span>
            Active
          </span>

          <strong>
            {activeTherapists}
          </strong>

        </div>


        <div>

          <Power
            size={21}
          />

          <span>
            Inactive
          </span>

          <strong>
            {inactiveTherapists}
          </strong>

        </div>


        <div>

          <Link2
            size={21}
          />

          <span>
            Child Assignments
          </span>

          <strong>
            {therapistLinks}
          </strong>

        </div>

      </div>


      <div className="therapists-toolbar">

        <div className="therapists-search">

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
            placeholder="Search therapist, email, phone or child..."
          />

        </div>


        <span>
          {
            filteredTherapists.length
          }
          {" "}
          {
            filteredTherapists.length ===
            1
              ? "therapist"
              : "therapists"
          }
        </span>

      </div>


      {
        error && (

          <div className="therapists-alert error">
            {error}
          </div>

        )
      }


      {
        success && (

          <div className="therapists-alert success">
            {success}
          </div>

        )
      }


      {
        loading
          ? (

            <div className="therapists-loading">
              Loading therapists...
            </div>

          )
          : filteredTherapists.length ===
            0
            ? (

              <div className="therapists-empty">

                <Stethoscope
                  size={36}
                />

                <h3>
                  No therapist accounts yet
                </h3>

                <p>
                  Create the first therapist
                  account using Add Therapist.
                </p>

                <button
                  onClick={
                    openCreate
                  }
                >

                  <Plus
                    size={16}
                  />

                  Add Therapist

                </button>

              </div>

            )
            : (

              <div className="therapists-grid">

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

                        <article
                          className="therapist-card"
                          key={
                            therapist.id
                          }
                        >

                          <div className="therapist-card-top">

                            <div className="therapist-avatar">

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


                            <div className="therapist-main-info">

                              <div className="therapist-name-row">

                                <h2>
                                  {
                                    therapist.full_name
                                  }
                                </h2>

                                <span
                                  className={
                                    active
                                      ? "therapist-status active"
                                      : "therapist-status inactive"
                                  }
                                >
                                  {
                                    active
                                      ? "Active"
                                      : "Inactive"
                                  }
                                </span>

                              </div>


                              <small>
                                Therapist ID #
                                {
                                  therapist.id
                                }
                              </small>

                            </div>

                          </div>


                          <div className="therapist-contact">

                            <div>

                              <Mail
                                size={14}
                              />

                              <span>
                                {
                                  therapist.email
                                }
                              </span>

                            </div>


                            <div>

                              <Phone
                                size={14}
                              />

                              <span>
                                {
                                  therapist.phone ||
                                  "No phone number"
                                }
                              </span>

                            </div>

                          </div>


                          <div className="therapist-children-section">

                            <div className="therapist-children-title">

                              <Baby
                                size={16}
                              />

                              <span>
                                Assigned Children
                              </span>

                              <strong>
                                {
                                  links.length
                                }
                              </strong>

                            </div>


                            <div className="therapist-child-list">

                              {
                                links.length >
                                0
                                  ? links.map(
                                      link => (

                                        <span
                                          key={
                                            link.child_id
                                          }
                                        >
                                          {
                                            link.child
                                              ?.full_name ||
                                            `Child #${link.child_id}`
                                          }
                                        </span>

                                      )
                                    )
                                  : (

                                    <small>
                                      No children assigned
                                    </small>

                                  )
                              }

                            </div>

                          </div>


                          <div className="therapist-actions">

                            <button
                              onClick={() =>
                                openChildren(
                                  therapist
                                )
                              }
                            >

                              <Link2
                                size={15}
                              />

                              Children

                            </button>


                            <button
                              onClick={() =>
                                openEdit(
                                  therapist
                                )
                              }
                            >

                              <Edit3
                                size={15}
                              />

                              Edit

                            </button>


                            <button
                              className={
                                active
                                  ? "deactivate"
                                  : "activate"
                              }
                              onClick={() =>
                                toggleStatus(
                                  therapist
                                )
                              }
                            >

                              <Power
                                size={15}
                              />

                              {
                                active
                                  ? "Disable"
                                  : "Enable"
                              }

                            </button>


                            <button
                              className="delete"
                              onClick={() =>
                                deleteTherapist(
                                  therapist
                                )
                              }
                            >

                              <Trash2
                                size={15}
                              />

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
        modalMode && (

          <div
            className="therapists-modal-overlay"
            onMouseDown={
              event => {

                if (
                  event.target ===
                  event.currentTarget
                ) {

                  closeModal();

                }

              }
            }
          >

            <div className="therapists-modal">

              <div className="therapists-modal-header">

                <div>

                  <span>
                    ADMINISTRATION
                  </span>

                  <h2>

                    {
                      modalMode ===
                      "create"
                        ? "Add Therapist"
                        : modalMode ===
                          "edit"
                          ? "Edit Therapist"
                          : "Manage Children"
                    }

                  </h2>

                  {
                    selectedTherapist && (

                      <p>
                        {
                          selectedTherapist.full_name
                        }
                      </p>

                    )
                  }

                </div>


                <button
                  onClick={
                    closeModal
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


              {
                error && (

                  <div className="therapist-modal-message error">
                    {error}
                  </div>

                )
              }


              {
                success && (

                  <div className="therapist-modal-message success">
                    {success}
                  </div>

                )
              }


              {
                modalMode ===
                "create" && (

                  <form
                    className="therapist-form"
                    onSubmit={
                      createTherapist
                    }
                  >

                    <label>

                      Full Name

                      <input
                        name="full_name"
                        value={
                          form.full_name
                        }
                        onChange={
                          handleField
                        }
                        placeholder="Therapist full name"
                        autoFocus
                      />

                    </label>


                    <label>

                      Email Address

                      <input
                        name="email"
                        type="email"
                        value={
                          form.email
                        }
                        onChange={
                          handleField
                        }
                        placeholder="therapist@example.com"
                      />

                    </label>


                    <label>

                      Phone Number

                      <input
                        name="phone"
                        value={
                          form.phone
                        }
                        onChange={
                          handleField
                        }
                        placeholder="Optional"
                      />

                    </label>


                    <label>

                      Temporary Password

                      <input
                        name="password"
                        type="password"
                        value={
                          form.password
                        }
                        onChange={
                          handleField
                        }
                        placeholder="Minimum 6 characters"
                      />

                    </label>


                    <button
                      className="therapist-modal-primary"
                      type="submit"
                      disabled={
                        saving
                      }
                    >

                      <UserPlus
                        size={16}
                      />

                      {
                        saving
                          ? "Creating..."
                          : "Create Therapist Account"
                      }

                    </button>

                  </form>

                )
              }


              {
                modalMode ===
                "edit" && (

                  <form
                    className="therapist-form"
                    onSubmit={
                      updateTherapist
                    }
                  >

                    <label>

                      Full Name

                      <input
                        name="full_name"
                        value={
                          form.full_name
                        }
                        onChange={
                          handleField
                        }
                      />

                    </label>


                    <label>

                      Email Address

                      <input
                        name="email"
                        type="email"
                        value={
                          form.email
                        }
                        onChange={
                          handleField
                        }
                      />

                    </label>


                    <label>

                      Phone Number

                      <input
                        name="phone"
                        value={
                          form.phone
                        }
                        onChange={
                          handleField
                        }
                        placeholder="Optional"
                      />

                    </label>


                    <button
                      className="therapist-modal-primary"
                      type="submit"
                      disabled={
                        saving
                      }
                    >

                      <Check
                        size={16}
                      />

                      {
                        saving
                          ? "Saving..."
                          : "Save Changes"
                      }

                    </button>

                  </form>

                )
              }


              {
                modalMode ===
                "children" &&
                selectedTherapist && (

                  <div className="manage-therapist-children">

                    <div className="therapist-linked-block">

                      <h3>
                        Assigned Children
                      </h3>


                      {
                        selectedLinks.length >
                        0
                          ? (

                            <div className="therapist-linked-rows">

                              {
                                selectedLinks.map(
                                  link => (

                                    <div
                                      className="therapist-linked-row"
                                      key={
                                        link.child_id
                                      }
                                    >

                                      <div className="therapist-linked-icon">

                                        <Baby
                                          size={17}
                                        />

                                      </div>


                                      <div>

                                        <strong>
                                          {
                                            link.child
                                              ?.full_name ||
                                            `Child #${link.child_id}`
                                          }
                                        </strong>

                                        <span>
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
                                        </span>

                                      </div>


                                      <button
                                        onClick={() =>
                                          unlinkChild(
                                            link.child_id,
                                            link.child
                                              ?.full_name ||
                                            `Child #${link.child_id}`
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

                            </div>

                          )
                          : (

                            <div className="therapist-no-children">

                              This therapist has no
                              assigned children yet.

                            </div>

                          )
                      }

                    </div>


                    <div className="therapist-link-new">

                      <h3>
                        Assign Another Child
                      </h3>


                      {
                        Number(
                          selectedTherapist.is_active
                        ) !== 1
                          ? (

                            <div className="therapist-inactive-warning">

                              Activate this therapist
                              account before assigning
                              new children.

                            </div>

                          )
                          : loadingAvailableChildren
                            ? (

                              <div className="therapist-no-children">

                                Loading available children...

                              </div>

                            )
                            : availableChildren.length ===
                              0
                            ? (

                              <div className="therapist-no-children">

                                No unassigned children
                                are available.

                              </div>

                            )
                            : (

                              <div className="therapist-link-row">

                                <select
                                  value={
                                    selectedChildId
                                  }
                                  onChange={
                                    event =>
                                      setSelectedChildId(
                                        event.target.value
                                      )
                                  }
                                >

                                  <option value="">
                                    Select child
                                  </option>


                                  {
                                    availableChildren.map(
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
                                          {" — "}
                                          ID #
                                          {
                                            child.id
                                          }

                                        </option>

                                      )
                                    )
                                  }

                                </select>


                                <button
                                  onClick={
                                    linkChild
                                  }
                                  disabled={
                                    !selectedChildId ||
                                    saving
                                  }
                                >

                                  <Plus
                                    size={16}
                                  />

                                  Assign Child

                                </button>

                              </div>

                            )
                      }

                    </div>

                  </div>

                )
              }

            </div>

          </div>

        )
      }


      <style>
        {`

        .admin-therapists-page {
          width: 100%;
        }

        .therapists-heading {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
        }

        .therapists-heading > div:first-child > span {
          color: #8172EA;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .1em;
        }

        .therapists-heading h1 {
          margin: 6px 0 5px;
          color: #303253;
          font-size: 28px;
        }

        .therapists-heading p {
          margin: 0;
          color: #9699AC;
          font-size: 13px;
        }

        .therapists-heading-actions {
          display: flex;
          gap: 9px;
        }

        .therapists-refresh,
        .add-therapist-button {
          height: 41px;
          padding: 0 14px;
          border-radius: 13px;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 11px;
          font-weight: 650;
        }

        .therapists-refresh {
          border: 1px solid #E7E6F0;
          background: white;
          color: #7164D8;
        }

        .add-therapist-button {
          border: 0;
          background: #7868E8;
          color: white;
        }

        .therapists-refresh:disabled {
          opacity: .6;
        }

        .therapist-spin {
          animation: therapistSpin .8s linear infinite;
        }

        @keyframes therapistSpin {
          to {
            transform: rotate(360deg);
          }
        }

        .therapists-stats {
          display: grid;
          grid-template-columns:
            repeat(4, minmax(0, 1fr));
          gap: 14px;
          margin-top: 22px;
        }

        .therapists-stats > div {
          min-height: 87px;
          padding: 16px;
          border-radius: 18px;
          border: 1px solid #ECECF4;
          background: white;
          display: grid;
          grid-template-columns:
            34px 1fr auto;
          gap: 10px;
          align-items: center;
          color: #5595DD;
        }

        .therapists-stats span {
          color: #9194A6;
          font-size: 11px;
        }

        .therapists-stats strong {
          color: #383A57;
          font-size: 21px;
        }

        .therapists-toolbar {
          margin-top: 18px;
          padding: 14px;
          border: 1px solid #ECECF4;
          border-radius: 18px;
          background: white;
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .therapists-search {
          flex: 1;
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

        .therapists-search input {
          width: 100%;
          height: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          color: #42445E;
          font-size: 12px;
        }

        .therapists-toolbar > span {
          color: #9699A9;
          font-size: 10px;
        }

        .therapists-alert {
          margin-top: 14px;
          padding: 11px 14px;
          border-radius: 12px;
          font-size: 11px;
        }

        .therapists-alert.error,
        .therapist-modal-message.error {
          border: 1px solid #F3D3DA;
          background: #FFF1F4;
          color: #B74860;
        }

        .therapists-alert.success,
        .therapist-modal-message.success {
          border: 1px solid #CFEBDD;
          background: #F1FBF6;
          color: #438965;
        }

        .therapists-loading,
        .therapists-empty {
          min-height: 330px;
          margin-top: 18px;
          border: 1px solid #ECECF4;
          border-radius: 21px;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          color: #999CAB;
          font-size: 12px;
        }

        .therapists-empty svg {
          color: #5595DD;
        }

        .therapists-empty h3 {
          margin: 12px 0 4px;
          color: #484A66;
          font-size: 16px;
        }

        .therapists-empty p {
          margin: 0;
        }

        .therapists-empty button {
          margin-top: 15px;
          height: 38px;
          padding: 0 13px;
          border: 0;
          border-radius: 11px;
          background: #7969E8;
          color: white;
          display: flex;
          align-items: center;
          gap: 7px;
          cursor: pointer;
        }

        .therapists-grid {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 16px;
          margin-top: 18px;
        }

        .therapist-card {
          padding: 19px;
          border: 1px solid #ECECF4;
          border-radius: 20px;
          background: white;
          box-shadow:
            0 7px 22px
            rgba(52,53,85,.03);
        }

        .therapist-card-top {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .therapist-avatar {
          width: 47px;
          height: 47px;
          flex: 0 0 auto;
          display: grid;
          place-items: center;
          border-radius: 15px;
          background:
            linear-gradient(
              135deg,
              #EDF6FF,
              #F1EEFF
            );
          color: #4B8BC8;
          font-size: 16px;
          font-weight: 800;
        }

        .therapist-main-info {
          flex: 1;
          min-width: 0;
        }

        .therapist-name-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .therapist-name-row h2 {
          margin: 0;
          color: #3E405C;
          font-size: 15px;
        }

        .therapist-main-info small {
          display: block;
          margin-top: 4px;
          color: #A0A3B2;
          font-size: 9px;
        }

        .therapist-status {
          padding: 5px 8px;
          border-radius: 999px;
          font-size: 8px;
          font-weight: 700;
        }

        .therapist-status.active {
          color: #438B69;
          background: #ECF9F2;
        }

        .therapist-status.inactive {
          color: #B85A68;
          background: #FFF0F2;
        }

        .therapist-contact {
          margin-top: 16px;
          padding: 11px;
          border-radius: 12px;
          background: #FAFAFC;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .therapist-contact > div {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #85889B;
        }

        .therapist-contact span {
          font-size: 10px;
        }

        .therapist-children-section {
          margin-top: 14px;
        }

        .therapist-children-title {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #5595DD;
        }

        .therapist-children-title span {
          flex: 1;
          color: #74778D;
          font-size: 10px;
          font-weight: 700;
        }

        .therapist-children-title strong {
          width: 24px;
          height: 24px;
          border-radius: 8px;
          display: grid;
          place-items: center;
          background: #EDF6FF;
          color: #4B89C5;
          font-size: 9px;
        }

        .therapist-child-list {
          min-height: 35px;
          margin-top: 8px;
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          align-items: center;
        }

        .therapist-child-list > span {
          padding: 6px 9px;
          border-radius: 999px;
          background: #EDF6FF;
          color: #5680A8;
          font-size: 9px;
          font-weight: 600;
        }

        .therapist-child-list small {
          color: #AAAEBB;
          font-size: 9px;
        }

        .therapist-actions {
          display: grid;
          grid-template-columns:
            1.2fr .8fr .9fr 38px;
          gap: 7px;
          margin-top: 15px;
        }

        .therapist-actions button {
          height: 37px;
          border: 1px solid #E9E8F2;
          border-radius: 11px;
          background: #FAFAFC;
          color: #7063D4;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 5px;
          cursor: pointer;
          font-size: 9px;
        }

        .therapist-actions .deactivate {
          color: #B16A48;
          background: #FFF8EE;
        }

        .therapist-actions .activate {
          color: #438866;
          background: #EFFAF4;
        }

        .therapist-actions .delete {
          padding: 0;
          color: #C85669;
          background: #FFF1F3;
          border-color: #F8DDE2;
        }

        .therapists-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          padding: 25px;
          display: flex;
          justify-content: center;
          align-items: center;
          background: rgba(37,35,64,.38);
          backdrop-filter: blur(5px);
        }

        .therapists-modal {
          width: min(620px, 100%);
          max-height: 90vh;
          overflow-y: auto;
          padding: 23px;
          border-radius: 22px;
          background: white;
          box-shadow:
            0 28px 80px
            rgba(35,33,72,.22);
        }

        .therapists-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 15px;
          padding-bottom: 16px;
          border-bottom: 1px solid #EFEFF5;
        }

        .therapists-modal-header span {
          color: #7C6BE5;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: .1em;
        }

        .therapists-modal-header h2 {
          margin: 6px 0 0;
          color: #3E405B;
          font-size: 20px;
        }

        .therapists-modal-header p {
          margin: 4px 0 0;
          color: #989BAC;
          font-size: 10px;
        }

        .therapists-modal-header > button {
          width: 36px;
          height: 36px;
          border: 0;
          border-radius: 11px;
          background: #F5F5F9;
          color: #818497;
          display: grid;
          place-items: center;
          cursor: pointer;
        }

        .therapist-modal-message {
          margin-top: 14px;
          padding: 10px 12px;
          border-radius: 11px;
          font-size: 10px;
        }

        .therapist-form {
          margin-top: 18px;
          display: flex;
          flex-direction: column;
          gap: 13px;
        }

        .therapist-form label {
          color: #66697F;
          font-size: 10px;
          font-weight: 650;
        }

        .therapist-form input {
          width: 100%;
          height: 42px;
          margin-top: 6px;
          padding: 0 12px;
          border: 1px solid #E2E2EB;
          border-radius: 11px;
          outline: 0;
          background: #FBFBFD;
          color: #43455D;
          font-size: 11px;
        }

        .therapist-form input:focus {
          border-color: #9D90EC;
          background: white;
        }

        .therapist-modal-primary {
          height: 43px;
          margin-top: 4px;
          border: 0;
          border-radius: 12px;
          background: #7969E7;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          cursor: pointer;
          font-size: 10.5px;
          font-weight: 700;
        }

        .therapist-modal-primary:disabled {
          opacity: .55;
          cursor: not-allowed;
        }

        .manage-therapist-children {
          margin-top: 18px;
        }

        .therapist-linked-block,
        .therapist-link-new {
          padding: 16px;
          border: 1px solid #ECECF4;
          border-radius: 16px;
        }

        .therapist-link-new {
          margin-top: 14px;
        }

        .therapist-linked-block h3,
        .therapist-link-new h3 {
          margin: 0 0 12px;
          color: #53556D;
          font-size: 12px;
        }

        .therapist-linked-rows {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .therapist-linked-row {
          min-height: 54px;
          padding: 8px 9px;
          border-radius: 12px;
          background: #F9F9FC;
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .therapist-linked-icon {
          width: 34px;
          height: 34px;
          flex: 0 0 auto;
          display: grid;
          place-items: center;
          border-radius: 10px;
          color: #4F8BC8;
          background: #EDF6FF;
        }

        .therapist-linked-row > div:nth-child(2) {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .therapist-linked-row strong {
          color: #55576D;
          font-size: 10px;
        }

        .therapist-linked-row span {
          margin-top: 3px;
          color: #A0A2B2;
          font-size: 8.5px;
        }

        .therapist-linked-row > button {
          width: 33px;
          height: 33px;
          border: 0;
          border-radius: 9px;
          display: grid;
          place-items: center;
          color: #C85869;
          background: #FFF0F2;
          cursor: pointer;
        }

        .therapist-no-children,
        .therapist-inactive-warning {
          padding: 11px;
          border-radius: 11px;
          background: #FAFAFC;
          color: #9EA1B0;
          font-size: 10px;
        }

        .therapist-inactive-warning {
          color: #AA6F4B;
          background: #FFF7EC;
        }

        .therapist-link-row {
          display: flex;
          gap: 8px;
        }

        .therapist-link-row select {
          flex: 1;
          min-width: 0;
          height: 41px;
          padding: 0 10px;
          border: 1px solid #E1E1EA;
          border-radius: 11px;
          outline: 0;
          background: white;
          color: #57596E;
          font-size: 10px;
        }

        .therapist-link-row button {
          height: 41px;
          padding: 0 13px;
          border: 0;
          border-radius: 11px;
          background: #7868E6;
          color: white;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          font-size: 10px;
        }

        .therapist-link-row button:disabled {
          opacity: .5;
          cursor: not-allowed;
        }

        @media (max-width: 1050px) {

          .therapists-stats {
            grid-template-columns:
              repeat(2, 1fr);
          }

        }

        @media (max-width: 850px) {

          .therapists-grid {
            grid-template-columns:
              1fr;
          }

          .therapists-heading {
            flex-direction: column;
          }

        }

        `}
      </style>

    </div>

  );

}