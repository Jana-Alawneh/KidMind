import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
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
} from "lucide-react";

import api from "../../services/api";



const normalizeGameName = (
  value
) =>
  String(value || "")
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


const getGameDate = (
  game,
  session
) => {

  const value =
    game?.ended_at ||
    game?.started_at ||
    game?.updated_at ||
    game?.created_at ||
    session?.ended_at ||
    session?.started_at ||
    session?.scheduled_at ||
    session?.created_at;


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


const calculateChildScore = (
  childId,
  sessions
) => {

  const latestByDomain = {};


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


            if (!domain) {
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
    scores.length === 0
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


const getChildAssessmentCount = (
  childId,
  sessions
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
    sessions,
    setSessions,
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
          sessionsResponse,
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

            api.get(
              "/sessions"
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


        setSessions(
          Array.isArray(
            sessionsResponse.data
          )
            ? sessionsResponse.data
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
            View every child,
            assessment results,
            parents, and assigned
            therapists.
          </p>

        </div>


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
                  Try another search.
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
                                      : score
                                  }
                                </strong>

                                <small>
                                  Score
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
                                  assessments
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


                          <div className="legacy-parent">

                            <span>
                              Parent name on child record
                            </span>

                            <strong>
                              {
                                child.parent_name ||
                                "—"
                              }
                            </strong>

                          </div>


                          <div className="relationship-section">

                            <div className="relationship-heading">

                              <UserRound
                                size={16}
                              />

                              <span>
                                Parents
                              </span>

                            </div>


                            <div className="relationship-items">

                              {
                                linkedParents.length >
                                0
                                  ? linkedParents.map(
                                      parent => (

                                        <span
                                          key={
                                            parent.user_id
                                          }
                                          className="relationship-chip parent-chip"
                                        >
                                          {
                                            parent.user_name
                                          }
                                        </span>

                                      )
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
                                Therapists
                              </span>

                            </div>


                            <div className="relationship-items">

                              {
                                linkedTherapists.length >
                                0
                                  ? linkedTherapists.map(
                                      therapist => (

                                        <span
                                          key={
                                            therapist.user_id
                                          }
                                          className="relationship-chip therapist-chip"
                                        >
                                          {
                                            therapist.user_name
                                          }
                                        </span>

                                      )
                                    )
                                  : (

                                    <span className="no-relation">

                                      No therapist assigned

                                    </span>

                                  )
                              }

                            </div>

                          </div>


                          <button
                            className="manage-assignments"
                            onClick={() =>
                              openAssignments(
                                child
                              )
                            }
                          >

                            <Link2
                              size={17}
                            />

                            Manage Assignments

                          </button>

                        </article>

                      );

                    }
                  )
                }

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
                      Parent Accounts
                    </strong>

                    <span>
                      Link parents to this child
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

                      </div>

                    )
                    : (

                      <div className="assignment-empty">
                        No parent account linked.
                      </div>

                    )
                }


                {
                  parentUsers.length >
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
                            parentUsers
                              .filter(
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
                              )
                              .map(
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

                        No parent accounts exist yet.
                        Create them from the Parents section first.

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
                      Therapists
                    </strong>

                    <span>
                      Assign therapists responsible for this child
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

                      </div>

                    )
                    : (

                      <div className="assignment-empty">
                        No therapist assigned.
                      </div>

                    )
                }


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
                      therapistUsers
                        .filter(
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

        .children-heading > div > span {
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

        .refresh-button {
          height: 40px;
          border: 1px solid #E8E7F2;
          border-radius: 13px;
          padding: 0 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          background: white;
          color: #7164D8;
          cursor: pointer;
        }

        .refresh-button:disabled {
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
          width: 52px;
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
          font-size: 17px;
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

        .legacy-parent {
          margin-top: 11px;
          padding: 11px;
          border: 1px solid #EFEDF6;
          border-radius: 12px;
          display: flex;
          justify-content: space-between;
          gap: 10px;
        }

        .legacy-parent span {
          color: #A1A3B3;
          font-size: 9.5px;
        }

        .legacy-parent strong {
          color: #686A80;
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

        .manage-assignments {
          width: 100%;
          height: 41px;
          margin-top: 15px;
          border: 1px solid #E5E0FF;
          border-radius: 13px;
          background: #F7F4FF;
          color: #7565E6;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          font-size: 11px;
          font-weight: 650;
        }

        .manage-assignments:hover {
          background: #F0EBFF;
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

        .assignment-modal {
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

        .assignment-empty {
          margin-top: 13px;
          padding: 11px;
          border-radius: 11px;
          color: #A4A6B5;
          background: #FAFAFC;
          font-size: 10.5px;
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

        }

        `}
      </style>

    </div>

  );

}