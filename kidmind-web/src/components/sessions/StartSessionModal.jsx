import {
  useState,
} from "react";

import {
  Brain,
  Check,
  Play,
  X,
} from "lucide-react";

import {
  createSession,
} from "../../api/sessionsApi";


const availableGames = [
  {
    id: "memory-match",
    game_name: "Memory Match",
    description:
      "Working memory assessment",
  },

  {
    id: "focus-finder",
    game_name: "Focus Finder",
    description:
      "Attention and reaction assessment",
  },

  {
    id: "puzzle-path",
    game_name: "Puzzle Path",
    description:
      "Visual-spatial and problem-solving assessment",
  },

  {
    id: "reading-adventure",
    game_name: "Reading Adventure",
    description:
      "Reading comprehension and visual attention assessment",
  },

  {
    id: "quick-match",
    game_name: "Quick Match",
    description:
      "Processing speed and visual attention assessment",
  },
];


const StartSessionModal = ({
  child,
  close,
  onStarted,
}) => {

  const [
    selectedGames,
    setSelectedGames,
  ] = useState([
    {
      game_name:
        "Memory Match",

      difficulty:
        "Level 1",
    },
  ]);


  const [
    saving,
    setSaving,
  ] = useState(false);


  const isGameSelected = (
    gameName
  ) => {

    return selectedGames.some(
      (game) =>
        game.game_name ===
        gameName
    );

  };


  const toggleGame = (
    gameName
  ) => {

    setSelectedGames(
      (currentGames) => {

        const alreadySelected =
          currentGames.some(
            (game) =>
              game.game_name ===
              gameName
          );


        if (alreadySelected) {

          return currentGames.filter(
            (game) =>
              game.game_name !==
              gameName
          );

        }


        return [
          ...currentGames,
          {
            game_name:
              gameName,

            difficulty:
              "Level 1",
          },
        ];

      }
    );

  };


  const updateDifficulty = (
    gameName,
    difficulty
  ) => {

    setSelectedGames(
      (currentGames) =>
        currentGames.map(
          (game) =>
            game.game_name ===
            gameName
              ? {
                  ...game,
                  difficulty,
                }
              : game
        )
    );

  };


  const handleSubmit =
    async (
      event
    ) => {

      event.preventDefault();


      if (
        selectedGames.length ===
        0
      ) {

        window.alert(
          "Please select at least one game."
        );

        return;

      }


      try {

        setSaving(
          true
        );


        const result =
          await createSession({
            child_id:
              child.id,

            games:
              selectedGames,
          });


        close();


        onStarted(
          result.session
        );

      } catch (error) {

        console.error(
          "Failed to start session:",
          error
        );


        window.alert(
          error.message ||
          "Failed to start session"
        );

      } finally {

        setSaving(
          false
        );

      }

    };


  return (

    <div
      className="
        fixed
        inset-0
        z-50
        bg-black/30
        flex
        items-center
        justify-center
        p-4
      "
    >

      <div
        className="
          bg-white
          w-full
          max-w-[620px]
          max-h-[90vh]
          overflow-y-auto
          rounded-3xl
          p-8
          shadow-xl
        "
      >

        <div
          className="
            flex
            justify-between
            items-center
            mb-8
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
                w-12
                h-12
                rounded-2xl
                bg-[#EEE9FF]
                flex
                items-center
                justify-center
              "
            >

              <Brain
                className="
                  text-[#7B6EF6]
                "
              />

            </div>


            <div>

              <h2
                className="
                  text-2xl
                  font-bold
                "
              >
                Start Session
              </h2>


              <p
                className="
                  text-sm
                  text-slate-500
                "
              >
                Child:{" "}
                {child.full_name ||
                  child.name}
              </p>

            </div>

          </div>


          <button
            type="button"
            onClick={close}
            disabled={saving}
          >

            <X
              className="
                text-slate-400
              "
            />

          </button>

        </div>


        <form
          onSubmit={
            handleSubmit
          }
        >

          <div>

            <h3
              className="
                font-semibold
                text-lg
              "
            >
              Select Session Games
            </h3>


            <p
              className="
                text-sm
                text-slate-500
                mt-1
              "
            >
              You can select one or more games for this session.
            </p>

          </div>


          <div
            className="
              space-y-4
              mt-6
            "
          >

            {availableGames.map(
              (
                availableGame
              ) => {

                const selected =
                  isGameSelected(
                    availableGame
                      .game_name
                  );


                const selectedGame =
                  selectedGames.find(
                    (game) =>
                      game.game_name ===
                      availableGame
                        .game_name
                  );


                return (

                  <div
                    key={
                      availableGame.id
                    }
                    className={`
                      border
                      rounded-2xl
                      p-5
                      transition

                      ${
                        selected
                          ? "border-[#7B6EF6] bg-[#F8F6FF]"
                          : "border-slate-200 bg-white"
                      }
                    `}
                  >

                    <div
                      className="
                        flex
                        justify-between
                        items-start
                        gap-4
                      "
                    >

                      <button
                        type="button"
                        onClick={() => {

                          toggleGame(
                            availableGame
                              .game_name
                          );

                        }}
                        className="
                          flex
                          items-start
                          gap-4
                          text-left
                          flex-1
                        "
                      >

                        <div
                          className={`
                            w-7
                            h-7
                            rounded-lg
                            border
                            flex
                            items-center
                            justify-center
                            shrink-0

                            ${
                              selected
                                ? "bg-[#7B6EF6] border-[#7B6EF6] text-white"
                                : "border-slate-300 text-transparent"
                            }
                          `}
                        >

                          <Check
                            size={17}
                          />

                        </div>


                        <div>

                          <h4
                            className="
                              font-semibold
                            "
                          >
                            {
                              availableGame
                                .game_name
                            }
                          </h4>


                          <p
                            className="
                              text-sm
                              text-slate-500
                              mt-1
                            "
                          >
                            {
                              availableGame
                                .description
                            }
                          </p>

                        </div>

                      </button>

                    </div>


                    {selected && (

                      <div
                        className="
                          mt-5
                          pt-4
                          border-t
                          border-slate-200
                        "
                      >

                        <label
                          className="
                            text-sm
                            text-slate-500
                          "
                        >
                          Difficulty
                        </label>


                        <select
                          value={
                            selectedGame
                              ?.difficulty ||
                            "Level 1"
                          }
                          onChange={(
                            event
                          ) => {

                            updateDifficulty(
                              availableGame
                                .game_name,
                              event.target
                                .value
                            );

                          }}
                          className="
                            w-full
                            mt-2
                            h-12
                            rounded-xl
                            border
                            px-4
                            bg-white
                            outline-none
                            focus:border-[#7B6EF6]
                          "
                        >

                          <option
                            value="Level 1"
                          >
                            Level 1
                          </option>

                          <option
                            value="Level 2"
                          >
                            Level 2
                          </option>

                          <option
                            value="Level 3"
                          >
                            Level 3
                          </option>

                        </select>

                      </div>

                    )}

                  </div>

                );

              }
            )}

          </div>


          <div
            className="
              bg-[#F8FAFC]
              rounded-2xl
              p-5
              mt-6
            "
          >

            <p
              className="
                text-sm
                text-slate-500
              "
            >
              Selected games
            </p>


            <p
              className="
                font-bold
                text-lg
                mt-1
              "
            >
              {selectedGames.length}
            </p>


            {selectedGames.length >
              0 && (

              <div
                className="
                  flex
                  flex-wrap
                  gap-2
                  mt-3
                "
              >

                {selectedGames.map(
                  (game) => (

                    <span
                      key={
                        game.game_name
                      }
                      className="
                        bg-[#EEE9FF]
                        text-[#7B6EF6]
                        px-3
                        py-1
                        rounded-full
                        text-sm
                      "
                    >
                      {game.game_name}
                      {" - "}
                      {game.difficulty}
                    </span>

                  )
                )}

              </div>

            )}

          </div>


          <div
            className="
              flex
              gap-4
              pt-7
            "
          >

            <button
              type="button"
              onClick={close}
              disabled={saving}
              className="
                flex-1
                h-12
                rounded-xl
                border
                disabled:opacity-50
              "
            >
              Cancel
            </button>


            <button
              type="submit"
              disabled={
                saving ||
                selectedGames.length ===
                0
              }
              className="
                flex-1
                h-12
                rounded-xl
                bg-[#7B6EF6]
                text-white
                flex
                items-center
                justify-center
                gap-2
                hover:bg-[#6959F5]
                disabled:opacity-50
              "
            >

              <Play
                size={18}
              />

              {saving
                ? "Starting..."
                : "Start Session"
              }

            </button>

          </div>

        </form>

      </div>

    </div>

  );

};


export default StartSessionModal;