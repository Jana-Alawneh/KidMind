const domainConfigs = [
  {
    key: "focus",
    label: "Focus",
    gameName: "focus finder",
  },
  {
    key: "memory",
    label: "Memory",
    gameName: "memory match",
  },
  {
    key: "problemSolving",
    label: "Problem Solving",
    gameName: "puzzle path",
  },
  {
    key: "reading",
    label: "Reading",
    gameName: "reading adventure",
  },
  {
    key: "processingSpeed",
    label: "Processing Speed",
    gameName: "quick match",
  },
];


export const normalizeGameName = (
  value
) => {

  return String(
    value || ""
  )
    .trim()
    .toLowerCase();

};


const getTimestamp = (
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
    session?.updated_at ||
    session?.created_at;


  if (!value) {
    return 0;
  }


  const timestamp =
    new Date(
      String(value).replace(
        " ",
        "T"
      )
    ).getTime();


  return Number.isFinite(
    timestamp
  )
    ? timestamp
    : 0;

};


export const getLatestGameScore = (
  sessions,
  gameName
) => {

  const matches = [];


  sessions.forEach(
    session => {

      if (
        !Array.isArray(
          session.games
        )
      ) {
        return;
      }


      session.games.forEach(
        game => {

          const isFinished =
            game.status ===
              "Completed" ||
            game.status ===
              "Failed";


          const score =
            Number(
              game.score
            );


          if (
            !isFinished ||
            normalizeGameName(
              game.game_name
            ) !==
              normalizeGameName(
                gameName
              ) ||
            !Number.isFinite(
              score
            )
          ) {
            return;
          }


          matches.push({
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

            timestamp:
              getTimestamp(
                game,
                session
              ),
          });

        }
      );

    }
  );


  if (
    matches.length === 0
  ) {
    return null;
  }


  matches.sort(
    (
      first,
      second
    ) =>
      second.timestamp -
      first.timestamp
  );


  return matches[0].score;

};


export const getCognitiveDomains = (
  sessions
) => {

  return domainConfigs.map(
    domain => {

      return {
        ...domain,

        score:
          getLatestGameScore(
            sessions,
            domain.gameName
          ),
      };

    }
  );

};


export const calculateCognitiveScore = (
  sessions
) => {

  const domainScores =
    getCognitiveDomains(
      sessions
    );


  const availableValues =
    domainScores
      .map(
        domain =>
          domain.score
      )
      .filter(
        value =>
          typeof value ===
            "number" &&
          Number.isFinite(
            value
          )
      );


  if (
    availableValues.length ===
      0
  ) {
    return null;
  }


  return Math.round(
    availableValues.reduce(
      (
        total,
        value
      ) =>
        total + value,
      0
    ) /
      availableValues.length
  );

};


export const getLatestCompletedAssessment =
  sessions => {

    const completedSessions =
      sessions.filter(
        session =>
          session.status ===
          "Completed"
      );


    if (
      completedSessions.length ===
      0
    ) {
      return null;
    }


    return [
      ...completedSessions,
    ].sort(
      (
        first,
        second
      ) => {

        const firstTime =
          getTimestamp(
            null,
            first
          );


        const secondTime =
          getTimestamp(
            null,
            second
          );


        return (
          secondTime -
          firstTime
        );

      }
    )[0];

  };


export const getAverageSessionScore = (
  sessions
) => {

  const scores =
    sessions
      .filter(
        session =>
          session.status ===
            "Completed" ||
          session.status ===
            "Ended"
      )
      .map(
        session => {

          if (
            session.score === null ||
            session.score ===
              undefined ||
            session.score === ""
          ) {
            return null;
          }


          const score =
            Number(
              session.score
            );


          return Number.isFinite(
            score
          )
            ? Math.max(
                0,
                Math.min(
                  100,
                  Math.round(
                    score
                  )
                )
              )
            : null;

        }
      )
      .filter(
        score =>
          score !== null
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
        total + score,
      0
    ) /
      scores.length
  );

};


export {
  domainConfigs,
};