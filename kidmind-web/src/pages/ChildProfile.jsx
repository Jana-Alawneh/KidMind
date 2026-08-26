import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  Gamepad2,
  Link2,
  Mail,
  Phone,
  Play,
  RefreshCw,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

import ChildInfoCard from "../components/childProfile/ChildInfoCard";
import CognitiveScores from "../components/childProfile/CognitiveScores";
import ProgressChart from "../components/childProfile/ProgressChart";
import SessionsTimeline from "../components/childProfile/SessionsTimeline";
import ReportsTable from "../components/childProfile/ReportsTable";
import AIInsights from "../components/childProfile/AIInsights";

import EditChildModal from "../components/children/EditChildModal";
import StartSessionModal
  from "../components/sessions/StartSessionModal";

import {
  getChildById,
} from "../api/childrenApi";

import {
  getGameBuilderAssignments,
  getGameBuilderGames,
  removeGameBuilderAssignment,
} from "../api/gameBuilderApi";

import api from "../services/api";


const getStoredUser = () => {

  try {

    const rawUser =
      sessionStorage.getItem(
        "kidmind_user"
      );

    if (!rawUser) {
      return null;
    }

    return JSON.parse(
      rawUser
    );

  } catch {

    return null;

  }

};


const getErrorMessage = (
  error,
  fallback
) => {

  return (
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );

};


const ParentAssignmentCard = ({
  childId,
  childName,
  onChanged,
}) => {

  const [
    currentParent,
    setCurrentParent,
  ] = useState(null);

  const [
    parents,
    setParents,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    modalOpen,
    setModalOpen,
  ] = useState(false);

  const [
    selectedParentId,
    setSelectedParentId,
  ] = useState("");

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    removing,
    setRemoving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    message,
    setMessage,
  ] = useState("");


  const loadParentData =
    useCallback(
      async () => {

        try {

          setLoading(true);
          setError("");

          const [
            childUsersResponse,
            parentsResponse,
          ] =
            await Promise.all([
              api.get(
                `/users/children/${childId}/users`
              ),
              api.get(
                "/users/assignable-parents"
              ),
            ]);

          const childUsers =
            Array.isArray(
              childUsersResponse.data
            )
              ? childUsersResponse.data
              : [];

          const assignableParents =
            Array.isArray(
              parentsResponse.data
            )
              ? parentsResponse.data
              : [];

          const parent =
            childUsers.find(
              (user) =>
                user.role ===
                "parent"
            ) || null;

          setCurrentParent(
            parent
          );

          setParents(
            assignableParents
          );

          setSelectedParentId(
            parent
              ? String(
                  parent.id
                )
              : ""
          );

        } catch (loadError) {

          console.error(
            "Failed to load parent assignment:",
            loadError
          );

          setError(
            getErrorMessage(
              loadError,
              "Failed to load parent assignment"
            )
          );

        } finally {

          setLoading(false);

        }

      },
      [
        childId,
      ]
    );


  useEffect(() => {

    loadParentData();

  }, [loadParentData]);


  const openAssignmentModal =
    () => {

      setError("");
      setMessage("");

      setSelectedParentId(
        currentParent
          ? String(
              currentParent.id
            )
          : ""
      );

      setModalOpen(true);

    };


  const closeAssignmentModal =
    () => {

      if (saving) {
        return;
      }

      setModalOpen(false);

    };


  const handleAssignParent =
    async () => {

      const parentId =
        Number(
          selectedParentId
        );

      if (
        !Number.isInteger(
          parentId
        ) ||
        parentId <= 0
      ) {

        setError(
          "Please select a parent"
        );

        return;

      }


      if (
        currentParent &&
        Number(
          currentParent.id
        ) ===
          parentId
      ) {

        setModalOpen(false);

        return;

      }


      const previousParent =
        currentParent;


      try {

        setSaving(true);
        setError("");
        setMessage("");


        if (previousParent) {

          await api.delete(
            `/users/assignments/${childId}/${previousParent.id}`
          );

        }


        try {

          await api.post(
            "/users/assignments",
            {
              child_id:
                Number(
                  childId
                ),
              user_id:
                parentId,
            }
          );

        } catch (assignError) {

          if (previousParent) {

            try {

              await api.post(
                "/users/assignments",
                {
                  child_id:
                    Number(
                      childId
                    ),
                  user_id:
                    Number(
                      previousParent.id
                    ),
                }
              );

            } catch (restoreError) {

              console.error(
                "Failed to restore previous parent:",
                restoreError
              );

            }

          }

          throw assignError;

        }


        setMessage(
          previousParent
            ? "Parent changed successfully."
            : "Parent assigned successfully."
        );

        setModalOpen(false);

        await loadParentData();

        if (onChanged) {
          await onChanged();
        }

      } catch (saveError) {

        console.error(
          "Failed to assign parent:",
          saveError
        );

        setError(
          getErrorMessage(
            saveError,
            "Failed to assign parent"
          )
        );

        await loadParentData();

      } finally {

        setSaving(false);

      }

    };


  const handleRemoveParent =
    async () => {

      if (!currentParent) {
        return;
      }


      const confirmed =
        window.confirm(
          `Remove ${currentParent.full_name} from ${childName}?`
        );


      if (!confirmed) {
        return;
      }


      try {

        setRemoving(true);
        setError("");
        setMessage("");

        await api.delete(
          `/users/assignments/${childId}/${currentParent.id}`
        );

        setMessage(
          "Parent removed successfully."
        );

        await loadParentData();

        if (onChanged) {
          await onChanged();
        }

      } catch (removeError) {

        console.error(
          "Failed to remove parent:",
          removeError
        );

        setError(
          getErrorMessage(
            removeError,
            "Failed to remove parent"
          )
        );

      } finally {

        setRemoving(false);

      }

    };


  return (

    <>

      <div
        className="
          bg-white
          border
          border-[#ECECF3]
          rounded-2xl
          p-6
          shadow-sm
          min-h-[260px]
        "
      >

        <div
          className="
            flex
            items-start
            justify-between
            gap-4
          "
        >

          <div
            className="
              flex
              items-center
              gap-3
            "
          >

            <div
              className="
                w-11
                h-11
                rounded-xl
                bg-[#F1EDFF]
                text-[#7B6EF6]
                flex
                items-center
                justify-center
              "
            >
              <Link2 size={20} />
            </div>

            <div>

              <h2
                className="
                  font-bold
                  text-[#2F3047]
                  text-lg
                "
              >
                Parent Access
              </h2>

              <p
                className="
                  text-xs
                  text-[#9497A8]
                  mt-1
                "
              >
                Manage the parent linked to this child
              </p>

            </div>

          </div>

          <button
            type="button"
            onClick={
              loadParentData
            }
            disabled={
              loading
            }
            className="
              w-9
              h-9
              rounded-lg
              border
              border-[#E8E9F1]
              text-[#7B6EF6]
              flex
              items-center
              justify-center
              hover:bg-[#F7F5FF]
              disabled:opacity-50
            "
          >
            <RefreshCw
              size={16}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />
          </button>

        </div>


        {loading ? (

          <div
            className="
              min-h-[150px]
              flex
              items-center
              justify-center
              text-sm
              text-[#989BAC]
            "
          >
            Loading parent...
          </div>

        ) : (

          <>

            {currentParent ? (

              <div
                className="
                  mt-6
                  rounded-2xl
                  bg-[#F8F7FD]
                  border
                  border-[#ECE9FA]
                  p-4
                "
              >

                <div
                  className="
                    flex
                    items-center
                    gap-3
                  "
                >

                  <div
                    className="
                      w-11
                      h-11
                      rounded-full
                      bg-[#E8E2FF]
                      text-[#715FE2]
                      flex
                      items-center
                      justify-center
                      font-bold
                    "
                  >
                    {String(
                      currentParent.full_name ||
                      "P"
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="min-w-0">

                    <p
                      className="
                        font-bold
                        text-[#383A55]
                        truncate
                      "
                    >
                      {currentParent.full_name}
                    </p>

                    <p
                      className="
                        text-xs
                        text-[#9295A7]
                        mt-1
                      "
                    >
                      Linked Parent
                    </p>

                  </div>

                </div>


                {currentParent.email && (

                  <div
                    className="
                      flex
                      items-center
                      gap-2
                      text-xs
                      text-[#74778B]
                      mt-4
                    "
                  >
                    <Mail size={14} />
                    <span className="truncate">
                      {currentParent.email}
                    </span>
                  </div>

                )}


                {currentParent.phone && (

                  <div
                    className="
                      flex
                      items-center
                      gap-2
                      text-xs
                      text-[#74778B]
                      mt-2
                    "
                  >
                    <Phone size={14} />
                    <span>
                      {currentParent.phone}
                    </span>
                  </div>

                )}

              </div>

            ) : (

              <div
                className="
                  mt-6
                  min-h-[116px]
                  rounded-2xl
                  border
                  border-dashed
                  border-[#DCD8F4]
                  bg-[#FBFAFE]
                  flex
                  flex-col
                  items-center
                  justify-center
                  text-center
                  p-4
                "
              >

                <UserRound
                  size={27}
                  className="
                    text-[#AAA2E3]
                  "
                />

                <p
                  className="
                    text-sm
                    font-semibold
                    text-[#55586B]
                    mt-2
                  "
                >
                  No parent assigned
                </p>

                <p
                  className="
                    text-xs
                    text-[#999CAD]
                    mt-1
                  "
                >
                  Link an existing parent account to this child.
                </p>

              </div>

            )}


            {error && (

              <div
                className="
                  mt-4
                  px-4
                  py-3
                  rounded-xl
                  bg-red-50
                  border
                  border-red-100
                  text-red-600
                  text-xs
                "
              >
                {error}
              </div>

            )}


            {message && (

              <div
                className="
                  mt-4
                  px-4
                  py-3
                  rounded-xl
                  bg-green-50
                  border
                  border-green-100
                  text-green-700
                  text-xs
                "
              >
                {message}
              </div>

            )}


            <div
              className="
                grid
                grid-cols-2
                gap-3
                mt-5
              "
            >

              <button
                type="button"
                onClick={
                  openAssignmentModal
                }
                className="
                  bg-[#7B6EF6]
                  text-white
                  rounded-xl
                  px-4
                  py-3
                  text-sm
                  font-semibold
                  hover:bg-[#6959F5]
                  transition
                "
              >
                {currentParent
                  ? "Change Parent"
                  : "Assign Parent"}
              </button>


              <button
                type="button"
                onClick={
                  handleRemoveParent
                }
                disabled={
                  !currentParent ||
                  removing
                }
                className="
                  bg-white
                  border
                  border-[#E5E6EF]
                  text-[#777A8F]
                  rounded-xl
                  px-4
                  py-3
                  text-sm
                  font-semibold
                  hover:bg-[#F8F8FC]
                  transition
                  disabled:opacity-40
                  disabled:cursor-not-allowed
                "
              >
                {removing
                  ? "Removing..."
                  : "Remove"}
              </button>

            </div>

          </>

        )}

      </div>


      {modalOpen && (

        <div
          className="
            fixed
            inset-0
            z-[100]
            bg-black/30
            flex
            items-center
            justify-center
            p-5
          "
          onMouseDown={
            (event) => {

              if (
                event.target ===
                event.currentTarget
              ) {
                closeAssignmentModal();
              }

            }
          }
        >

          <div
            className="
              w-full
              max-w-lg
              bg-white
              rounded-3xl
              shadow-2xl
              border
              border-[#ECECF3]
              p-7
            "
          >

            <div
              className="
                flex
                items-start
                justify-between
                gap-4
              "
            >

              <div>

                <h2
                  className="
                    text-xl
                    font-bold
                    text-[#2F3047]
                  "
                >
                  {currentParent
                    ? "Change Parent"
                    : "Assign Parent"}
                </h2>

                <p
                  className="
                    text-sm
                    text-[#8E91A3]
                    mt-1
                  "
                >
                  Select the parent account for {childName}.
                </p>

              </div>

              <button
                type="button"
                onClick={
                  closeAssignmentModal
                }
                disabled={
                  saving
                }
                className="
                  w-9
                  h-9
                  rounded-xl
                  bg-[#F5F5F9]
                  text-[#777A8B]
                  flex
                  items-center
                  justify-center
                  hover:bg-[#ECECF3]
                  disabled:opacity-50
                "
              >
                <X size={18} />
              </button>

            </div>


            <label
              className="
                block
                mt-6
              "
            >

              <span
                className="
                  block
                  text-sm
                  font-semibold
                  text-[#55586B]
                  mb-2
                "
              >
                Parent
              </span>

              <select
                value={
                  selectedParentId
                }
                onChange={
                  (event) =>
                    setSelectedParentId(
                      event.target.value
                    )
                }
                disabled={
                  saving
                }
                className="
                  w-full
                  h-12
                  px-4
                  rounded-xl
                  border
                  border-[#DFE0E9]
                  bg-white
                  text-[#45475C]
                  outline-none
                  focus:border-[#7B6EF6]
                  focus:ring-2
                  focus:ring-[#7B6EF6]/10
                  disabled:opacity-60
                "
              >

                <option value="">
                  Select Parent
                </option>

                {parents.map(
                  (parent) => (

                    <option
                      key={
                        parent.id
                      }
                      value={
                        parent.id
                      }
                    >
                      {parent.full_name}
                      {parent.email
                        ? ` — ${parent.email}`
                        : ""}
                    </option>

                  )
                )}

              </select>

            </label>


            {parents.length === 0 && (

              <div
                className="
                  mt-4
                  rounded-xl
                  bg-amber-50
                  border
                  border-amber-100
                  px-4
                  py-3
                  text-sm
                  text-amber-700
                "
              >
                No active parent accounts are available.
              </div>

            )}


            {error && (

              <div
                className="
                  mt-4
                  rounded-xl
                  bg-red-50
                  border
                  border-red-100
                  px-4
                  py-3
                  text-sm
                  text-red-600
                "
              >
                {error}
              </div>

            )}


            <div
              className="
                flex
                justify-end
                gap-3
                mt-7
              "
            >

              <button
                type="button"
                onClick={
                  closeAssignmentModal
                }
                disabled={
                  saving
                }
                className="
                  px-5
                  py-3
                  rounded-xl
                  border
                  border-[#E2E3EA]
                  text-[#686B7D]
                  font-semibold
                  hover:bg-[#F8F8FB]
                  disabled:opacity-50
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleAssignParent
                }
                disabled={
                  saving ||
                  !selectedParentId
                }
                className="
                  px-5
                  py-3
                  rounded-xl
                  bg-[#7B6EF6]
                  text-white
                  font-semibold
                  hover:bg-[#6959F5]
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                "
              >
                {saving
                  ? "Saving..."
                  : currentParent
                    ? "Save Change"
                    : "Assign Parent"}
              </button>

            </div>

          </div>

        </div>

      )}

    </>

  );

};



const AssignedGamesCard = ({
  childId,
  navigate,
}) => {

  const [
    assignedGames,
    setAssignedGames,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    removingId,
    setRemovingId,
  ] = useState(null);

  const [
    startingGameId,
    setStartingGameId,
  ] = useState(null);

  const [
    error,
    setError,
  ] = useState("");


  const loadAssignedGames =
    useCallback(
      async () => {

        try {

          setLoading(true);
          setError("");

          const games =
            await getGameBuilderGames();

          const safeGames =
            Array.isArray(
              games
            )
              ? games
              : [];

          const assignmentGroups =
            await Promise.all(
              safeGames.map(
                async (game) => {

                  try {

                    const assignments =
                      await getGameBuilderAssignments(
                        game.id
                      );

                    return {
                      game,
                      assignments:
                        Array.isArray(
                          assignments
                        )
                          ? assignments
                          : [],
                    };

                  } catch (assignmentError) {

                    console.error(
                      `Failed to load assignments for game ${game.id}:`,
                      assignmentError
                    );

                    return {
                      game,
                      assignments: [],
                    };

                  }

                }
              )
            );

          const childGames =
            assignmentGroups.flatMap(
              ({
                game,
                assignments,
              }) => {

                return assignments
                  .filter(
                    (assignment) =>
                      assignment.assignment_type ===
                        "child" &&
                      Number(
                        assignment.child_id
                      ) ===
                        Number(
                          childId
                        )
                  )
                  .map(
                    (assignment) => ({
                      assignmentId:
                        assignment.id,
                      assignedAt:
                        assignment.created_at,
                      game,
                    })
                  );

              }
            );

          setAssignedGames(
            childGames
          );

        } catch (loadError) {

          console.error(
            "Failed to load assigned games:",
            loadError
          );

          setError(
            getErrorMessage(
              loadError,
              "Failed to load assigned games"
            )
          );

        } finally {

          setLoading(false);

        }

      },
      [
        childId,
      ]
    );


  useEffect(() => {

    loadAssignedGames();

  }, [
    loadAssignedGames,
  ]);


  const handlePlayGame =
    async (
      item
    ) => {

      if (
        startingGameId !==
        null
      ) {
        return;
      }

      try {

        setStartingGameId(
          item.game.id
        );

        setError("");

        const response =
          await api.post(
            "/sessions",
            {
              child_id:
                Number(
                  childId
                ),

              games: [
                {
                  game_name:
                    item.game.title,

                  difficulty:
                    item.game.difficulty ||
                    null,

                  custom_game_id:
                    Number(
                      item.game.id
                    ),
                },
              ],
            }
          );

        const session =
          response?.data
            ?.session;

        const sessionId =
          Number(
            session?.id
          );

        if (
          !Number.isInteger(
            sessionId
          ) ||
          sessionId <= 0
        ) {

          throw new Error(
            "Invalid session ID returned by the server"
          );

        }

        navigate(
          `/sessions/${sessionId}`
        );

      } catch (playError) {

        console.error(
          "Failed to start assigned game:",
          playError
        );

        setError(
          getErrorMessage(
            playError,
            "Failed to start assigned game"
          )
        );

      } finally {

        setStartingGameId(
          null
        );

      }

    };


  const handleRemove =
    async (
      item
    ) => {

      const confirmed =
        window.confirm(
          `Remove ${item.game.title} from this child?`
        );

      if (!confirmed) {
        return;
      }

      try {

        setRemovingId(
          item.assignmentId
        );

        setError("");

        await removeGameBuilderAssignment(
          item.game.id,
          item.assignmentId
        );

        setAssignedGames(
          (previous) =>
            previous.filter(
              (gameItem) =>
                gameItem.assignmentId !==
                item.assignmentId
            )
        );

      } catch (removeError) {

        console.error(
          "Failed to remove assigned game:",
          removeError
        );

        setError(
          getErrorMessage(
            removeError,
            "Failed to remove assigned game"
          )
        );

      } finally {

        setRemovingId(null);

      }

    };


  return (

    <div
      className="
        bg-white
        border
        border-[#ECECF3]
        rounded-2xl
        p-6
        shadow-sm
      "
    >

      <div
        className="
          flex
          items-start
          justify-between
          gap-4
        "
      >

        <div
          className="
            flex
            items-center
            gap-3
          "
        >

          <div
            className="
              w-11
              h-11
              rounded-xl
              bg-[#F1EDFF]
              text-[#7B6EF6]
              flex
              items-center
              justify-center
            "
          >
            <Gamepad2 size={20} />
          </div>

          <div>

            <h2
              className="
                font-bold
                text-[#2F3047]
                text-lg
              "
            >
              Assigned Games
            </h2>

            <p
              className="
                text-xs
                text-[#9497A8]
                mt-1
              "
            >
              Games assigned directly to this child
            </p>

          </div>

        </div>

        <button
          type="button"
          onClick={
            loadAssignedGames
          }
          disabled={
            loading
          }
          className="
            w-9
            h-9
            rounded-lg
            border
            border-[#E8E9F1]
            text-[#7B6EF6]
            flex
            items-center
            justify-center
            hover:bg-[#F7F5FF]
            disabled:opacity-50
          "
        >
          <RefreshCw
            size={16}
            className={
              loading
                ? "animate-spin"
                : ""
            }
          />
        </button>

      </div>


      {loading ? (

        <div
          className="
            min-h-[150px]
            flex
            items-center
            justify-center
            text-sm
            text-[#989BAC]
          "
        >
          Loading assigned games...
        </div>

      ) : assignedGames.length ===
        0 ? (

        <div
          className="
            mt-6
            min-h-[130px]
            rounded-2xl
            border
            border-dashed
            border-[#DCD8F4]
            bg-[#FBFAFE]
            flex
            flex-col
            items-center
            justify-center
            text-center
            p-5
          "
        >

          <Gamepad2
            size={30}
            className="
              text-[#AAA2E3]
            "
          />

          <p
            className="
              text-sm
              font-semibold
              text-[#55586B]
              mt-3
            "
          >
            No assigned games
          </p>

          <p
            className="
              text-xs
              text-[#999CAD]
              mt-1
            "
          >
            Assign a Game Builder game directly to this child.
          </p>

        </div>

      ) : (

        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-2
            xl:grid-cols-3
            gap-4
            mt-6
          "
        >

          {assignedGames.map(
            (item) => (

              <div
                key={
                  item.assignmentId
                }
                className="
                  rounded-2xl
                  border
                  border-[#E8E6F4]
                  bg-[#FBFAFE]
                  p-5
                "
              >

                <div
                  className="
                    flex
                    items-start
                    justify-between
                    gap-3
                  "
                >

                  <div
                    className="
                      min-w-0
                    "
                  >

                    <p
                      className="
                        font-bold
                        text-[#34364D]
                        truncate
                      "
                    >
                      {item.game.title}
                    </p>

                    <p
                      className="
                        text-xs
                        text-[#9295A7]
                        mt-1
                      "
                    >
                      {item.game.domain ||
                        "Custom Cognitive Assessment"}
                    </p>

                  </div>

                  <span
                    className="
                      shrink-0
                      px-3
                      py-1
                      rounded-full
                      bg-[#F1EDFF]
                      text-[#715FE2]
                      text-xs
                      font-semibold
                    "
                  >
                    {item.game.difficulty ||
                      "Easy"}
                  </span>

                </div>


                {item.game.description && (

                  <p
                    className="
                      text-sm
                      text-[#73768A]
                      mt-4
                      line-clamp-2
                    "
                  >
                    {item.game.description}
                  </p>

                )}


                <div
                  className="
                    grid
                    grid-cols-[1fr_auto]
                    gap-3
                    mt-5
                  "
                >

                  <button
                    type="button"
                    onClick={() =>
                      handlePlayGame(
                        item
                      )
                    }
                    disabled={
                      startingGameId !==
                      null
                    }
                    className="
                      h-10
                      rounded-xl
                      bg-[#7B6EF6]
                      text-white
                      text-sm
                      font-semibold
                      flex
                      items-center
                      justify-center
                      gap-2
                      hover:bg-[#6959F5]
                      transition
                      disabled:opacity-50
                      disabled:cursor-not-allowed
                    "
                  >
                    <Play size={16} />
                    {startingGameId ===
                    item.game.id
                      ? "Starting..."
                      : "Play Game"}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleRemove(
                        item
                      )
                    }
                    disabled={
                      removingId ===
                      item.assignmentId
                    }
                    title="Remove assignment"
                    className="
                      w-10
                      h-10
                      rounded-xl
                      bg-white
                      border
                      border-[#F0DADF]
                      text-[#D85C70]
                      flex
                      items-center
                      justify-center
                      hover:bg-[#FFF5F7]
                      disabled:opacity-50
                    "
                  >
                    <Trash2 size={16} />
                  </button>

                </div>

              </div>

            )
          )}

        </div>

      )}


      {error && (

        <div
          className="
            mt-4
            px-4
            py-3
            rounded-xl
            bg-red-50
            border
            border-red-100
            text-red-600
            text-xs
          "
        >
          {error}
        </div>

      )}

    </div>

  );

};


const ChildProfile = () => {

  const navigate =
    useNavigate();

  const { id } =
    useParams();

  const currentUser =
    useMemo(
      () =>
        getStoredUser(),
      []
    );

  const isTherapist =
    currentUser?.role ===
    "therapist";

  const [
    child,
    setChild,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    editModalOpen,
    setEditModalOpen,
  ] = useState(false);

  const [
    startSessionModalOpen,
    setStartSessionModalOpen,
  ] = useState(false);


  const loadChild =
    useCallback(
      async () => {

        try {

          setLoading(true);
          setError("");

          const childData =
            await getChildById(
              id
            );

          setChild(
            childData
          );

        } catch (loadError) {

          console.error(
            "Failed to load child:",
            loadError
          );

          setError(
            loadError.response
              ?.data
              ?.message ||
            "Failed to load child information"
          );

        } finally {

          setLoading(false);

        }

      },
      [
        id,
      ]
    );


  useEffect(() => {

    if (id) {
      loadChild();
    }

  }, [
    id,
    loadChild,
  ]);


  return (

    <div className="flex bg-[#F7F8FC] min-h-screen">

      <Sidebar />

      <main className="flex-1 p-10 overflow-y-auto">

        <Navbar />


        <button
          type="button"
          onClick={() =>
            navigate(
              "/children"
            )
          }
          className="
            flex
            items-center
            gap-2
            text-[#7B6EF6]
            font-medium
            mt-8
            hover:gap-3
            transition-all
          "
        >

          <ArrowLeft size={20} />

          Back to Children

        </button>


        {loading && (

          <div
            className="
              flex
              justify-center
              items-center
              min-h-[400px]
            "
          >

            <div className="text-center">

              <div
                className="
                  w-12
                  h-12
                  border-4
                  border-[#E9E5FF]
                  border-t-[#7B6EF6]
                  rounded-full
                  animate-spin
                  mx-auto
                "
              />

              <p className="text-slate-500 mt-4">
                Loading child information...
              </p>

            </div>

          </div>

        )}


        {!loading &&
          error && (

          <div
            className="
              bg-red-50
              border
              border-red-200
              text-red-700
              rounded-2xl
              p-6
              mt-8
            "
          >

            <h2 className="font-bold text-lg">
              Unable to load child
            </h2>

            <p className="mt-2">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/children"
                )
              }
              className="
                mt-5
                bg-red-600
                text-white
                px-5
                py-2
                rounded-xl
                hover:bg-red-700
                transition
              "
            >
              Return to Children
            </button>

          </div>

        )}


        {!loading &&
          !error &&
          child && (

          <>

            <div
              className="
                grid
                grid-cols-1
                xl:grid-cols-3
                gap-6
                mt-8
              "
            >

              <ChildInfoCard
                child={
                  child
                }
                onEdit={() => {
                  setEditModalOpen(
                    true
                  );
                }}
                onStartSession={() => {
                  setStartSessionModalOpen(
                    true
                  );
                }}
              />

              <CognitiveScores />

              {isTherapist && (

                <ParentAssignmentCard
                  childId={
                    child.id
                  }
                  childName={
                    child.full_name ||
                    "this child"
                  }
                  onChanged={
                    loadChild
                  }
                />

              )}

            </div>


            {isTherapist && (

              <div className="mt-8">

                <AssignedGamesCard
                  childId={
                    child.id
                  }
                  navigate={
                    navigate
                  }
                />

              </div>

            )}


            <div className="grid grid-cols-3 gap-6 mt-8">

              <div className="col-span-2">
                <ProgressChart />
              </div>

              <AIInsights />

            </div>


            <div className="grid grid-cols-3 gap-6 mt-8">

              <div className="col-span-2">
                <ReportsTable />
              </div>

              <SessionsTimeline />

            </div>

          </>

        )}


        {editModalOpen &&
          child && (

          <EditChildModal
            child={
              child
            }
            close={() => {
              setEditModalOpen(
                false
              );
            }}
            onSuccess={
              loadChild
            }
          />

        )}


        {startSessionModalOpen &&
          child && (

          <StartSessionModal
            child={
              child
            }
            close={() => {
              setStartSessionModalOpen(
                false
              );
            }}
            onStarted={
              (session) => {

                navigate(
                  `/sessions/${session.id}`
                );

              }
            }
          />

        )}

      </main>

    </div>

  );

};


export default ChildProfile;
