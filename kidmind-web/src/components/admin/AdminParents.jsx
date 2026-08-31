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
  MapPin,
  Phone,
  Plus,
  Power,
  RefreshCw,
  Search,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";

import api from "../../services/api";
import UserAvatar from "../common/UserAvatar";


const emptyForm = {
  full_name: "",
  email: "",
  phone: "",
  region: "",
  password: "",
};


export default function AdminParents() {

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
    selectedParent,
    setSelectedParent,
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
    availableChildren,
    setAvailableChildren,
  ] = useState([]);


  const [
    availableChildrenLoading,
    setAvailableChildrenLoading,
  ] = useState(false);


  const [
    deleteInfo,
    setDeleteInfo,
  ] = useState(null);


  const [
    deleteMode,
    setDeleteMode,
  ] = useState("none");


  const [
    selectedDeleteChildIds,
    setSelectedDeleteChildIds,
  ] = useState([]);


  const [
    deleteLoading,
    setDeleteLoading,
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
          "Unable to load parents."
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

  useEffect(
  () => {

    let active =
      true;


    const refreshPresence =
      async () => {

        try {

          const response =
            await api.get(
              "/users"
            );


          if (
            active
          ) {

            setUsers(
              Array.isArray(
                response.data
              )
                ? response.data
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
      window.setInterval(
        refreshPresence,
        30000
      );


    return () => {

      active =
        false;

      window.clearInterval(
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


  const assignmentsByParent =
    useMemo(
      () => {

        const map = {};


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


  const filteredParents =
    useMemo(
      () => {

        const query =
          search
            .trim()
            .toLowerCase();


        if (!query) {

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
                parent.region,
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
      parent.is_online === true ||
      Number(
        parent.is_online
      ) === 1
  ).length;


const inactiveParents =
  parents.length -
  activeParents;

  const openCreate =
    () => {

      setModalMode(
        "create"
      );

      setSelectedParent(
        null
      );

      setSelectedChildId(
        ""
      );


      setAvailableChildren(
        []
      );


      setDeleteInfo(
        null
      );


      setDeleteMode(
        "none"
      );


      setSelectedDeleteChildIds(
        []
      );


      setForm(
        emptyForm
      );

      setError("");
      setSuccess("");

    };


  const openEdit =
    parent => {

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

        region:
          parent.region ||
          "",

        password:
          "",
      });

      setError("");
      setSuccess("");

    };


  const loadAvailableChildren =
    async parentId => {

      if (!parentId) {

        setAvailableChildren(
          []
        );

        return;

      }


      try {

        setAvailableChildrenLoading(
          true
        );


        const response =
          await api.get(
            "/users/available-children",
            {
              params: {
                link_type:
                  "parent",

                user_id:
                  Number(
                    parentId
                  ),
              },
            }
          );


        setAvailableChildren(
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


        setAvailableChildren(
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

        setAvailableChildrenLoading(
          false
        );

      }

    };


  const openChildren =
    async parent => {

      setModalMode(
        "children"
      );

      setSelectedParent(
        parent
      );

      setSelectedChildId(
        ""
      );

      setError("");
      setSuccess("");


      await loadAvailableChildren(
        parent.id
      );

    };


  const closeModal =
    () => {

      if (saving) {
        return;
      }


      setModalMode(
        null
      );

      setSelectedParent(
        null
      );

      setSelectedChildId(
        ""
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


  const createParent =
    async event => {

      event.preventDefault();


      const fullName =
        form.full_name.trim();


      const email =
        form.email
          .trim()
          .toLowerCase();


      const region =
        form.region.trim();


      const password =
        form.password;


      if (
        !fullName ||
        !email ||
        !region ||
        !password
      ) {

        setError(
          "Name, email, region and password are required."
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
              "parent",

            phone:
              form.phone.trim() ||
              null,

            region,
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
          "Unable to create parent."
        );

      } finally {

        setSaving(false);

      }

    };


  const updateParent =
    async event => {

      event.preventDefault();


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


      const region =
        form.region.trim();


      if (
        !fullName ||
        !email ||
        !region
      ) {

        setError(
          "Name, email and region are required."
        );

        return;

      }


      try {

        setSaving(true);
        setError("");
        setSuccess("");


        await api.put(
          `/users/${selectedParent.id}`,
          {
            full_name:
              fullName,

            email,

            phone:
              form.phone.trim() ||
              null,

            region,
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
          "Unable to update parent."
        );

      } finally {

        setSaving(false);

      }

    };


  const toggleStatus =
    async parent => {

      const currentlyActive =
        Number(
          parent.is_active
        ) === 1;


      const action =
        currentlyActive
          ? "deactivate"
          : "activate";


      const confirmed =
        window.confirm(
          `${action === "deactivate"
            ? "Deactivate"
            : "Activate"} ${parent.full_name}?`
        );


      if (!confirmed) {
        return;
      }


      try {

        setError("");
        setSuccess("");


        await api.patch(
          `/users/${parent.id}/status`,
          {
            is_active:
              !currentlyActive,
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
          requestError
            ?.response
            ?.data
            ?.message ||
          "Unable to change account status."
        );

      }

    };


  const openDeleteParent =
    async parent => {

      try {

        setModalMode(
          "delete"
        );

        setSelectedParent(
          parent
        );

        setDeleteInfo(
          null
        );

        setDeleteMode(
          "none"
        );

        setSelectedDeleteChildIds(
          []
        );

        setDeleteLoading(
          true
        );

        setError("");
        setSuccess("");


        const response =
          await api.get(
            `/users/${parent.id}/delete-info`
          );


        setDeleteInfo(
          response.data ||
          null
        );

      } catch (
        requestError
      ) {

        console.error(
          requestError
        );


        setModalMode(
          null
        );

        setSelectedParent(
          null
        );


        setError(
          requestError
            ?.response
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


  const toggleDeleteChild =
    childId => {

      const numericId =
        Number(
          childId
        );


      setSelectedDeleteChildIds(
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


  const confirmDeleteParent =
    async () => {

      if (!selectedParent) {
        return;
      }


      if (
        deleteMode ===
          "selected" &&
        selectedDeleteChildIds.length ===
          0
      ) {

        setError(
          "Select at least one child to delete."
        );

        return;

      }


      try {

        setSaving(true);
        setError("");
        setSuccess("");


        await api.delete(
          `/users/${selectedParent.id}`,
          {
            data: {
              delete_mode:
                deleteMode,

              child_ids:
                deleteMode ===
                  "selected"
                  ? selectedDeleteChildIds
                  : [],
            },
          }
        );


        setModalMode(
          null
        );

        setSelectedParent(
          null
        );

        setDeleteInfo(
          null
        );

        setDeleteMode(
          "none"
        );

        setSelectedDeleteChildIds(
          []
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
          requestError
            ?.response
            ?.data
            ?.message ||
          "Unable to delete parent."
        );

      } finally {

        setSaving(false);

      }

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
                selectedParent.id
              ),
          }
        );


        setSuccess(
          "Child linked successfully."
        );


        setSelectedChildId(
          ""
        );


        await loadData(
          true
        );


        await loadAvailableChildren(
          selectedParent.id
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
          "Unable to link child."
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
        !selectedParent
      ) {
        return;
      }


      const confirmed =
        window.confirm(
          `Remove ${childName} from ${selectedParent.full_name}?`
        );


      if (!confirmed) {
        return;
      }


      try {

        setSaving(true);
        setError("");
        setSuccess("");


        await api.delete(
          `/users/assignments/${childId}/${selectedParent.id}`
        );


        setSuccess(
          "Child link removed."
        );


        await loadData(
          true
        );


        await loadAvailableChildren(
          selectedParent.id
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
          "Unable to remove child link."
        );

      } finally {

        setSaving(false);

      }

    };


  const selectedLinks =
    selectedParent
      ? assignmentsByParent[
          Number(
            selectedParent.id
          )
        ] || []
      : [];


  const linkableChildren =
    availableChildren.filter(
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

    <div className="admin-parents-page">

      <div className="parents-heading">

        <div>

          <span>
            USER MANAGEMENT
          </span>

          <h1>
            Parents
          </h1>

          <p>
            Create parent accounts,
            manage access and connect
            each parent to their children.
          </p>

        </div>


        <div className="parents-heading-actions">

          <button
            className="parents-refresh"
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
                  ? "parent-spin"
                  : ""
              }
            />

            Refresh

          </button>


          <button
            className="add-parent-button"
            onClick={
              openCreate
            }
          >

            <UserPlus
              size={17}
            />

            Add Parent

          </button>

        </div>

      </div>


      <div className="parents-stats">

        <div>

          <Users
            size={21}
          />

          <span>
            Total Parents
          </span>

          <strong>
            {parents.length}
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
            {activeParents}
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
            {inactiveParents}
          </strong>

        </div>


        <div>

          <Link2
            size={21}
          />

          <span>
            Child Links
          </span>

          <strong>
            {
              assignments.filter(
                item =>
                  item.link_type ===
                    "parent" ||
                  item.role ===
                    "parent"
              ).length
            }
          </strong>

        </div>

      </div>


      <div className="parents-toolbar">

        <div className="parents-search">

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
            placeholder="Search parent, email, phone, region or child..."
          />

        </div>


        <span>
          {
            filteredParents.length
          }
          {" "}
          {
            filteredParents.length ===
            1
              ? "parent"
              : "parents"
          }
        </span>

      </div>


      {
        error && (

          <div className="parents-alert error">
            {error}
          </div>

        )
      }


      {
        success && (

          <div className="parents-alert success">
            {success}
          </div>

        )
      }


      {
        loading
          ? (

            <div className="parents-loading">
              Loading parents...
            </div>

          )
          : filteredParents.length ===
            0
            ? (

              <div className="parents-empty">

                <Users
                  size={36}
                />

                <h3>
                  No parent accounts yet
                </h3>

                <p>
                  Create the first parent
                  account using Add Parent.
                </p>

                <button
                  onClick={
                    openCreate
                  }
                >

                  <Plus
                    size={16}
                  />

                  Add Parent

                </button>

              </div>

            )
            : (

              <div className="parents-grid">

                {
                  filteredParents.map(
                    parent => {

                      const links =
                        assignmentsByParent[
                          Number(
                            parent.id
                          )
                        ] || [];


                      const accountActive =
  Number(
    parent.is_active
  ) === 1;


const online =
  parent.is_online === true ||
  Number(
    parent.is_online
  ) === 1;


                      return (

                        <article
                          className="parent-card"
                          key={
                            parent.id
                          }
                        >

                          <div className="parent-card-top">
<UserAvatar
  user={
    parent
  }
  className="parent-avatar"
/>


                            <div className="parent-main-info">

                              <div className="parent-name-row">

                                <h2>
                                  {
                                    parent.full_name
                                  }
                                </h2>

                               <span
  className={
    online
      ? "parent-status active"
      : "parent-status inactive"
  }
>
  {
    online
      ? "Active"
      : "Inactive"
  }
</span>

                              </div>


                              <small>
                                Parent ID #
                                {
                                  parent.id
                                }
                              </small>

                            </div>

                          </div>


                          <div className="parent-contact">

                            <div>

                              <Mail
                                size={14}
                              />

                              <span>
                                {
                                  parent.email
                                }
                              </span>

                            </div>


                            <div>

                              <Phone
                                size={14}
                              />

                              <span>
                                {
                                  parent.phone ||
                                  "No phone number"
                                }
                              </span>

                            </div>


                            <div>

                              <MapPin
                                size={14}
                              />

                              <span>
                                {
                                  parent.region ||
                                  "No region"
                                }
                              </span>

                            </div>

                          </div>


                          <div className="parent-children-section">

                            <div className="parent-children-title">

                              <Baby
                                size={16}
                              />

                              <span>
                                Linked Children
                              </span>

                              <strong>
                                {
                                  links.length
                                }
                              </strong>

                            </div>


                            <div className="parent-child-list">

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
                                      No children linked
                                    </small>

                                  )
                              }

                            </div>

                          </div>


                          <div className="parent-actions">

                            <button
                              onClick={() =>
                                openChildren(
                                  parent
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
                                  parent
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
  accountActive
    ? "deactivate"
    : "activate"
}
                              onClick={() =>
                                toggleStatus(
                                  parent
                                )
                              }
                            >

                              <Power
                                size={15}
                              />

                              {
  accountActive
    ? "Disable"
    : "Enable"
}

                            </button>


                            <button
                              className="delete"
                              onClick={() =>
                                openDeleteParent(
                                  parent
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
            className="parents-modal-overlay"
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

            <div className="parents-modal">

              <div className="parents-modal-header">

                <div>

                  <span>
                    ADMINISTRATION
                  </span>

                  <h2>

                    {
                      modalMode ===
                      "create"
                        ? "Add Parent"
                        : modalMode ===
                          "edit"
                          ? "Edit Parent"
                          : modalMode ===
                            "delete"
                            ? "Delete Parent"
                            : "Manage Children"
                    }

                  </h2>

                  {
                    selectedParent && (

                      <p>
                        {
                          selectedParent.full_name
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

                  <div className="modal-message error">
                    {error}
                  </div>

                )
              }


              {
                success && (

                  <div className="modal-message success">
                    {success}
                  </div>

                )
              }


              {
                modalMode ===
                "create" && (

                  <form
                    className="parent-form"
                    onSubmit={
                      createParent
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
                        placeholder="Parent full name"
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
                        placeholder="parent@example.com"
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

                      Region

                      <input
                        name="region"
                        value={
                          form.region
                        }
                        onChange={
                          handleField
                        }
                        placeholder="Parent region"
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
                      className="modal-primary"
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
                          : "Create Parent Account"
                      }

                    </button>

                  </form>

                )
              }


              {
                modalMode ===
                "edit" && (

                  <form
                    className="parent-form"
                    onSubmit={
                      updateParent
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


                    <label>

                      Region

                      <input
                        name="region"
                        value={
                          form.region
                        }
                        onChange={
                          handleField
                        }
                        placeholder="Parent region"
                      />

                    </label>


                    <button
                      className="modal-primary"
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
                selectedParent && (

                  <div className="manage-parent-children">

                    <div className="linked-children-block">

                      <h3>
                        Linked Children
                      </h3>


                      {
                        selectedLinks.length >
                        0
                          ? (

                            <div className="linked-child-rows">

                              {
                                selectedLinks.map(
                                  link => (

                                    <div
                                      className="linked-child-row"
                                      key={
                                        link.child_id
                                      }
                                    >

                                      <div className="linked-child-icon">

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

                            <div className="no-linked-children">

                              This parent is not linked
                              to any child yet.

                            </div>

                          )
                      }

                    </div>


                    <div className="link-new-child">

                      <h3>
                        Link Another Child
                      </h3>


                      {
                        Number(
                          selectedParent.is_active
                        ) !== 1
                          ? (

                            <div className="inactive-warning">

                              Activate this parent account
                              before linking new children.

                            </div>

                          )
                          : availableChildrenLoading
                            ? (

                              <div className="no-linked-children">

                                Loading available children...

                              </div>

                            )
                            : linkableChildren.length ===
                              0
                              ? (

                                <div className="no-linked-children">

                                  No unassigned children are available.

                                </div>

                              )
                              : (

                                <div className="link-child-row">

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
                                      linkableChildren.map(
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

                                    Link Child

                                  </button>

                                </div>

                              )
                      }

                    </div>

                  </div>

                )
              }


              {
                modalMode ===
                "delete" &&
                selectedParent && (

                  <div className="delete-parent-content">

                    {
                      deleteLoading
                        ? (

                          <div className="delete-parent-loading">
                            Loading...
                          </div>

                        )
                        : (

                          <>

                            <div className="delete-parent-warning">

                              <Trash2
                                size={20}
                              />

                              <div>

                                <strong>
                                  Delete parent account?
                                </strong>

                                <span>
                                  Choose what should happen to the linked children before deleting the account.
                                </span>

                              </div>

                            </div>


                            {
                              Number(
                                deleteInfo
                                  ?.child_count ||
                                0
                              ) >
                              0
                                ? (

                                  <div className="delete-options">

                                    <label
                                      className={
                                        deleteMode ===
                                        "none"
                                          ? "delete-option selected"
                                          : "delete-option"
                                      }
                                    >

                                      <input
                                        type="radio"
                                        name="delete_mode"
                                        value="none"
                                        checked={
                                          deleteMode ===
                                          "none"
                                        }
                                        onChange={() => {
                                          setDeleteMode(
                                            "none"
                                          );

                                          setSelectedDeleteChildIds(
                                            []
                                          );
                                        }}
                                      />

                                      <div>

                                        <strong>
                                          Keep children
                                        </strong>

                                        <span>
                                          Delete only the parent account. The children will stay in KidMind and become unlinked from this parent.
                                        </span>

                                      </div>

                                    </label>


                                    {
                                      Number(
                                        deleteInfo
                                          ?.child_count ||
                                        0
                                      ) ===
                                      1
                                        ? (

                                          <label
                                            className={
                                              deleteMode ===
                                              "all"
                                                ? "delete-option selected"
                                                : "delete-option"
                                            }
                                          >

                                            <input
                                              type="radio"
                                              name="delete_mode"
                                              value="all"
                                              checked={
                                                deleteMode ===
                                                "all"
                                              }
                                              onChange={() => {
                                                setDeleteMode(
                                                  "all"
                                                );

                                                setSelectedDeleteChildIds(
                                                  []
                                                );
                                              }}
                                            />

                                            <div>

                                              <strong>
                                                Delete linked child too
                                              </strong>

                                              <span>
                                                Delete the parent and the linked child.
                                              </span>

                                            </div>

                                          </label>

                                        )
                                        : (

                                          <>

                                            <label
                                              className={
                                                deleteMode ===
                                                "selected"
                                                  ? "delete-option selected"
                                                  : "delete-option"
                                              }
                                            >

                                              <input
                                                type="radio"
                                                name="delete_mode"
                                                value="selected"
                                                checked={
                                                  deleteMode ===
                                                  "selected"
                                                }
                                                onChange={() =>
                                                  setDeleteMode(
                                                    "selected"
                                                  )
                                                }
                                              />

                                              <div>

                                                <strong>
                                                  Delete selected children
                                                </strong>

                                                <span>
                                                  Choose one or more children to delete with this parent.
                                                </span>

                                              </div>

                                            </label>


                                            {
                                              deleteMode ===
                                              "selected" && (

                                                <div className="delete-child-selection">

                                                  {
                                                    (
                                                      deleteInfo
                                                        ?.children ||
                                                      []
                                                    ).map(
                                                      child => {

                                                        const childId =
                                                          Number(
                                                            child.id
                                                          );

                                                        return (

                                                          <label
                                                            key={
                                                              childId
                                                            }
                                                          >

                                                            <input
                                                              type="checkbox"
                                                              checked={
                                                                selectedDeleteChildIds.includes(
                                                                  childId
                                                                )
                                                              }
                                                              onChange={() =>
                                                                toggleDeleteChild(
                                                                  childId
                                                                )
                                                              }
                                                            />

                                                            <div>

                                                              <strong>
                                                                {
                                                                  child.full_name
                                                                }
                                                              </strong>

                                                              <span>
                                                                ID #
                                                                {
                                                                  child.id
                                                                }
                                                                {
                                                                  child.region
                                                                    ? ` • ${child.region}`
                                                                    : ""
                                                                }
                                                              </span>

                                                            </div>

                                                          </label>

                                                        );

                                                      }
                                                    )
                                                  }

                                                </div>

                                              )
                                            }


                                            <label
                                              className={
                                                deleteMode ===
                                                "all"
                                                  ? "delete-option selected"
                                                  : "delete-option"
                                              }
                                            >

                                              <input
                                                type="radio"
                                                name="delete_mode"
                                                value="all"
                                                checked={
                                                  deleteMode ===
                                                  "all"
                                                }
                                                onChange={() => {
                                                  setDeleteMode(
                                                    "all"
                                                  );

                                                  setSelectedDeleteChildIds(
                                                    []
                                                  );
                                                }}
                                              />

                                              <div>

                                                <strong>
                                                  Delete all linked children
                                                </strong>

                                                <span>
                                                  Delete the parent and all {
                                                    deleteInfo
                                                      ?.child_count
                                                  } linked children.
                                                </span>

                                              </div>

                                            </label>

                                          </>

                                        )
                                    }

                                  </div>

                                )
                                : (

                                  <div className="no-linked-children">

                                    This parent has no linked children. Only the parent account will be deleted.

                                  </div>

                                )
                            }


                            <div className="delete-parent-actions">

                              <button
                                className="delete-cancel"
                                onClick={
                                  closeModal
                                }
                                disabled={
                                  saving
                                }
                              >
                                Cancel
                              </button>

                              <button
                                className="delete-confirm"
                                onClick={
                                  confirmDeleteParent
                                }
                                disabled={
                                  saving ||
                                  (
                                    deleteMode ===
                                      "selected" &&
                                    selectedDeleteChildIds.length ===
                                      0
                                  )
                                }
                              >

                                {
                                  saving
                                    ? "Deleting..."
                                    : "Delete Parent"
                                }

                              </button>

                            </div>

                          </>

                        )
                    }

                  </div>

                )
              }

            </div>

          </div>

        )
      }


      <style>
        {`

        .admin-parents-page {
          width: 100%;
        }

        .parents-heading {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
        }

        .parents-heading > div:first-child > span {
          color: #8172EA;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .1em;
        }

        .parents-heading h1 {
          margin: 6px 0 5px;
          color: #303253;
          font-size: 28px;
        }

        .parents-heading p {
          margin: 0;
          color: #9699AC;
          font-size: 13px;
        }

        .parents-heading-actions {
          display: flex;
          gap: 9px;
        }

        .parents-refresh,
        .add-parent-button {
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

        .parents-refresh {
          border: 1px solid #E7E6F0;
          background: white;
          color: #7164D8;
        }

        .add-parent-button {
          border: 0;
          background: #7868E8;
          color: white;
        }

        .parents-refresh:disabled {
          opacity: .6;
        }

        .parent-spin {
          animation: parentSpin .8s linear infinite;
        }

        @keyframes parentSpin {
          to {
            transform: rotate(360deg);
          }
        }

        .parents-stats {
          display: grid;
          grid-template-columns:
            repeat(4, minmax(0, 1fr));
          gap: 14px;
          margin-top: 22px;
        }

        .parents-stats > div {
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
          color: #7868E6;
        }

        .parents-stats span {
          color: #9194A6;
          font-size: 11px;
        }

        .parents-stats strong {
          color: #383A57;
          font-size: 21px;
        }

        .parents-toolbar {
          margin-top: 18px;
          padding: 14px;
          border: 1px solid #ECECF4;
          border-radius: 18px;
          background: white;
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .parents-search {
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

        .parents-search input {
          width: 100%;
          height: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          color: #42445E;
          font-size: 12px;
        }

        .parents-toolbar > span {
          color: #9699A9;
          font-size: 10px;
        }

        .parents-alert {
          margin-top: 14px;
          padding: 11px 14px;
          border-radius: 12px;
          font-size: 11px;
        }

        .parents-alert.error,
        .modal-message.error {
          border: 1px solid #F3D3DA;
          background: #FFF1F4;
          color: #B74860;
        }

        .parents-alert.success,
        .modal-message.success {
          border: 1px solid #CFEBDD;
          background: #F1FBF6;
          color: #438965;
        }

        .parents-loading,
        .parents-empty {
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

        .parents-empty svg {
          color: #7D6DE8;
        }

        .parents-empty h3 {
          margin: 12px 0 4px;
          color: #484A66;
          font-size: 16px;
        }

        .parents-empty p {
          margin: 0;
        }

        .parents-empty button {
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

        .parents-grid {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 16px;
          margin-top: 18px;
        }

        .parent-card {
          padding: 19px;
          border: 1px solid #ECECF4;
          border-radius: 20px;
          background: white;
          box-shadow:
            0 7px 22px
            rgba(52,53,85,.03);
        }

        .parent-card-top {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .parent-avatar {
          width: 47px;
          height: 47px;
          flex: 0 0 auto;
          display: grid;
          place-items: center;
          border-radius: 15px;
          background:
            linear-gradient(
              135deg,
              #FFEFFA,
              #F4EEFF
            );
          color: #B05D9A;
          font-size: 16px;
          font-weight: 800;
        }

        .parent-main-info {
          flex: 1;
          min-width: 0;
        }

        .parent-name-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .parent-name-row h2 {
          margin: 0;
          color: #3E405C;
          font-size: 15px;
        }

        .parent-main-info small {
          display: block;
          margin-top: 4px;
          color: #A0A3B2;
          font-size: 9px;
        }

        .parent-status {
          padding: 5px 8px;
          border-radius: 999px;
          font-size: 8px;
          font-weight: 700;
        }

        .parent-status.active {
          color: #438B69;
          background: #ECF9F2;
        }

        .parent-status.inactive {
          color: #B85A68;
          background: #FFF0F2;
        }

        .parent-contact {
          margin-top: 16px;
          padding: 11px;
          border-radius: 12px;
          background: #FAFAFC;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .parent-contact > div {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #85889B;
        }

        .parent-contact span {
          font-size: 10px;
        }

        .parent-children-section {
          margin-top: 14px;
        }

        .parent-children-title {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #7B6DE4;
        }

        .parent-children-title span {
          flex: 1;
          color: #74778D;
          font-size: 10px;
          font-weight: 700;
        }

        .parent-children-title strong {
          width: 24px;
          height: 24px;
          border-radius: 8px;
          display: grid;
          place-items: center;
          background: #F1EEFF;
          color: #7767E1;
          font-size: 9px;
        }

        .parent-child-list {
          min-height: 35px;
          margin-top: 8px;
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          align-items: center;
        }

        .parent-child-list > span {
          padding: 6px 9px;
          border-radius: 999px;
          background: #F1F7FF;
          color: #5680A8;
          font-size: 9px;
          font-weight: 600;
        }

        .parent-child-list small {
          color: #AAAEBB;
          font-size: 9px;
        }

        .parent-actions {
          display: grid;
          grid-template-columns:
            1.2fr .8fr .9fr 38px;
          gap: 7px;
          margin-top: 15px;
        }

        .parent-actions button {
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

        .parent-actions .deactivate {
          color: #B16A48;
          background: #FFF8EE;
        }

        .parent-actions .activate {
          color: #438866;
          background: #EFFAF4;
        }

        .parent-actions .delete {
          padding: 0;
          color: #C85669;
          background: #FFF1F3;
          border-color: #F8DDE2;
        }

        .parents-modal-overlay {
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

        .parents-modal {
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

        .parents-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 15px;
          padding-bottom: 16px;
          border-bottom: 1px solid #EFEFF5;
        }

        .parents-modal-header span {
          color: #7C6BE5;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: .1em;
        }

        .parents-modal-header h2 {
          margin: 6px 0 0;
          color: #3E405B;
          font-size: 20px;
        }

        .parents-modal-header p {
          margin: 4px 0 0;
          color: #989BAC;
          font-size: 10px;
        }

        .parents-modal-header > button {
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

        .modal-message {
          margin-top: 14px;
          padding: 10px 12px;
          border-radius: 11px;
          font-size: 10px;
        }

        .parent-form {
          margin-top: 18px;
          display: flex;
          flex-direction: column;
          gap: 13px;
        }

        .parent-form label {
          color: #66697F;
          font-size: 10px;
          font-weight: 650;
        }

        .parent-form input {
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

        .parent-form input:focus {
          border-color: #9D90EC;
          background: white;
        }

        .modal-primary {
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

        .modal-primary:disabled {
          opacity: .55;
          cursor: not-allowed;
        }

        .manage-parent-children {
          margin-top: 18px;
        }

        .linked-children-block,
        .link-new-child {
          padding: 16px;
          border: 1px solid #ECECF4;
          border-radius: 16px;
        }

        .link-new-child {
          margin-top: 14px;
        }

        .linked-children-block h3,
        .link-new-child h3 {
          margin: 0 0 12px;
          color: #53556D;
          font-size: 12px;
        }

        .linked-child-rows {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .linked-child-row {
          min-height: 54px;
          padding: 8px 9px;
          border-radius: 12px;
          background: #F9F9FC;
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .linked-child-icon {
          width: 34px;
          height: 34px;
          flex: 0 0 auto;
          display: grid;
          place-items: center;
          border-radius: 10px;
          color: #7365DD;
          background: #EFECFF;
        }

        .linked-child-row > div:nth-child(2) {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .linked-child-row strong {
          color: #55576D;
          font-size: 10px;
        }

        .linked-child-row span {
          margin-top: 3px;
          color: #A0A2B2;
          font-size: 8.5px;
        }

        .linked-child-row > button {
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

        .no-linked-children,
        .inactive-warning {
          padding: 11px;
          border-radius: 11px;
          background: #FAFAFC;
          color: #9EA1B0;
          font-size: 10px;
        }

        .inactive-warning {
          color: #AA6F4B;
          background: #FFF7EC;
        }

        .link-child-row {
          display: flex;
          gap: 8px;
        }

        .link-child-row select {
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

        .link-child-row button {
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

        .link-child-row button:disabled {
          opacity: .5;
          cursor: not-allowed;
        }

        .delete-parent-content {
          margin-top: 18px;
        }

        .delete-parent-loading {
          min-height: 160px;
          display: grid;
          place-items: center;
          color: #999CAB;
          font-size: 11px;
        }

        .delete-parent-warning {
          padding: 14px;
          border-radius: 14px;
          background: #FFF3F5;
          color: #C45468;
          display: flex;
          gap: 11px;
        }

        .delete-parent-warning > div {
          display: flex;
          flex-direction: column;
        }

        .delete-parent-warning strong {
          color: #8E4554;
          font-size: 12px;
        }

        .delete-parent-warning span {
          margin-top: 4px;
          color: #A37680;
          font-size: 9.5px;
          line-height: 1.5;
        }

        .delete-options {
          margin-top: 14px;
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .delete-option {
          padding: 12px;
          border: 1px solid #E9E9F1;
          border-radius: 13px;
          background: #FBFBFD;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          cursor: pointer;
        }

        .delete-option.selected {
          border-color: #D9CFF8;
          background: #F8F5FF;
        }

        .delete-option input {
          margin-top: 2px;
        }

        .delete-option > div {
          display: flex;
          flex-direction: column;
        }

        .delete-option strong {
          color: #55576D;
          font-size: 10.5px;
        }

        .delete-option span {
          margin-top: 3px;
          color: #979AAA;
          font-size: 9.5px;
          line-height: 1.5;
        }

        .delete-child-selection {
          padding: 10px;
          border-radius: 13px;
          background: #FAFAFC;
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .delete-child-selection > label {
          min-height: 45px;
          padding: 8px 10px;
          border-radius: 10px;
          background: white;
          display: flex;
          align-items: center;
          gap: 9px;
          cursor: pointer;
        }

        .delete-child-selection > label > div {
          display: flex;
          flex-direction: column;
        }

        .delete-child-selection strong {
          color: #5A5C70;
          font-size: 10px;
        }

        .delete-child-selection span {
          margin-top: 2px;
          color: #A0A2B1;
          font-size: 8.5px;
        }

        .delete-parent-actions {
          margin-top: 18px;
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }

        .delete-cancel,
        .delete-confirm {
          min-width: 110px;
          height: 40px;
          border-radius: 11px;
          cursor: pointer;
          font-size: 10px;
          font-weight: 700;
        }

        .delete-cancel {
          border: 1px solid #E4E4EC;
          background: white;
          color: #777A8D;
        }

        .delete-confirm {
          border: 0;
          background: #D9576C;
          color: white;
        }

        .delete-cancel:disabled,
        .delete-confirm:disabled {
          opacity: .55;
          cursor: not-allowed;
        }


        @media (max-width: 1050px) {

          .parents-stats {
            grid-template-columns:
              repeat(2, 1fr);
          }

        }

        @media (max-width: 850px) {

          .parents-grid {
            grid-template-columns:
              1fr;
          }

          .parents-heading {
            flex-direction: column;
          }

        }

        `}
      </style>

    </div>

  );

}