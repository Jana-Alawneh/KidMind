import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

import {
  domainConfigs,
  normalizeGameName,
} from "./cognitiveScores";


const escapeHtml = (
  value: unknown
) => {

  return String(
    value ??
    ""
  )
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

};


const parseDate = (
  value: unknown
) => {

  if (!value) {
    return null;
  }


  const date =
    new Date(
      String(
        value
      ).replace(
        " ",
        "T"
      )
    );


  return Number.isNaN(
    date.getTime()
  )
    ? null
    : date;

};


const formatDate = (
  value: unknown
) => {

  const date =
    parseDate(
      value
    );


  if (!date) {
    return "—";
  }


  return date.toLocaleString(
    "en-US",
    {
      month:
        "short",
      day:
        "numeric",
      year:
        "numeric",
      hour:
        "numeric",
      minute:
        "2-digit",
    }
  );

};


const formatDateOnly = (
  value: unknown
) => {

  const date =
    parseDate(
      value
    );


  if (!date) {
    return "—";
  }


  return date.toLocaleDateString(
    "en-US",
    {
      month:
        "short",
      day:
        "numeric",
      year:
        "numeric",
    }
  );

};


const getDomainName = (
  game: any
) => {

  const gameName =
    normalizeGameName(
      game?.game_name ||
      game?.name
    );


  const domain =
    domainConfigs.find(
      item =>
        normalizeGameName(
          item.gameName
        ) ===
        gameName
    );


  return (
    domain?.label ||
    null
  );

};


const formatDuration = (
  totalSeconds: unknown
) => {

  const safeSeconds =
    Math.max(
      0,
      Math.floor(
        Number(
          totalSeconds
        ) || 0
      )
    );


  const minutes =
    Math.floor(
      safeSeconds / 60
    );


  const seconds =
    safeSeconds % 60;


  return `${String(
    minutes
  ).padStart(
    2,
    "0"
  )}:${String(
    seconds
  ).padStart(
    2,
    "0"
  )}`;

};


const formatPercent = (
  value: unknown
) => {

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }


  const numeric =
    Number(
      value
    );


  return Number.isFinite(
    numeric
  )
    ? `${Math.round(
        numeric
      )}%`
    : "—";

};


const formatNumber = (
  value: unknown
) => {

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }


  const numeric =
    Number(
      value
    );


  return Number.isFinite(
    numeric
  )
    ? String(
        Math.round(
          numeric
        )
      )
    : "—";

};


const formatReactionTime = (
  value: unknown
) => {

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }


  const numeric =
    Number(
      value
    );


  return Number.isFinite(
    numeric
  )
    ? `${numeric.toFixed(
        2
      )}s`
    : "—";

};


const getSessionScore = (
  session: any
) => {

  const rawScore =
    session?.score;


  if (
    rawScore !== null &&
    rawScore !== undefined &&
    rawScore !== ""
  ) {

    const numeric =
      Number(
        rawScore
      );


    if (
      Number.isFinite(
        numeric
      )
    ) {
      return Math.max(
        0,
        Math.min(
          100,
          Math.round(
            numeric
          )
        )
      );
    }

  }


  const games =
    Array.isArray(
      session?.games
    )
      ? session.games
      : [];


  const scores =
    games
      .filter(
        (game: any) =>
          game?.status ===
            "Completed" ||
          game?.status ===
            "Failed" ||
          game?.status ===
            "Ended"
      )
      .map(
        (game: any) =>
          Number(
            game?.score
          )
      )
      .filter(
        (score: number) =>
          Number.isFinite(
            score
          )
      );


  if (
    scores.length ===
    0
  ) {
    return null;
  }


  return Math.round(
    scores.reduce(
      (
        total: number,
        score: number
      ) =>
        total + score,
      0
    ) /
    scores.length
  );

};


const reportCss = `
  @page {
    size: A4;
    margin: 12mm;
  }

  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    background: #F7F8FC;
    color: #333554;
    font-family:
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      Arial,
      sans-serif;
  }

  .document {
    overflow: hidden;
    border: 1px solid #E8E7F0;
    border-radius: 18px;
    background: #FFFFFF;
  }

  .topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    padding: 18px 20px;
    border-bottom: 1px solid #ECECF4;
    background: linear-gradient(180deg, #FFFFFF, #FCFCFF);
  }

  .brand {
    color: #7465E8;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 1.2px;
  }

  .brand-subtitle {
    margin-top: 3px;
    color: #9699AA;
    font-size: 9px;
  }

  .status {
    padding: 7px 10px;
    border-radius: 999px;
    color: #4A8B71;
    background: #E9F8F1;
    font-size: 9px;
    font-weight: 800;
  }

  .hero {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 145px;
    gap: 18px;
    padding: 24px 20px;
    background:
      radial-gradient(
        circle at 90% 18%,
        rgba(116, 101, 232, .10),
        transparent 30%
      ),
      #FFFFFF;
  }

  .eyebrow {
    color: #8B7CE3;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 1px;
  }

  h1 {
    margin: 7px 0 5px;
    color: #292B52;
    font-size: 25px;
    line-height: 1.15;
  }

  .session {
    color: #989BAD;
    font-size: 10px;
  }

  .score {
    padding: 16px;
    border-radius: 16px;
    color: white;
    background: linear-gradient(145deg, #7566EA, #8C78F0);
  }

  .score span,
  .score small {
    display: block;
    color: rgba(255,255,255,.75);
    font-size: 8px;
  }

  .score strong {
    display: block;
    margin: 5px 0 7px;
    font-size: 29px;
  }

  .facts {
    margin: 0 20px 20px;
    overflow: hidden;
    border: 1px solid #E9E8F0;
    border-radius: 14px;
  }

  .fact {
    display: grid;
    grid-template-columns: 150px minmax(0, 1fr);
    gap: 12px;
    padding: 11px 14px;
    border-bottom: 1px solid #EFEFF4;
  }

  .fact:last-child {
    border-bottom: 0;
  }

  .fact span {
    color: #9699AA;
    font-size: 9px;
  }

  .fact strong {
    color: #454760;
    font-size: 10px;
  }

  .note {
    margin: 0 20px 20px;
    padding: 15px 16px;
    border: 1px solid #E9E5FA;
    border-radius: 14px;
    background: #FAF9FF;
  }

  .note strong {
    display: block;
    color: #3C3E5C;
    font-size: 11px;
  }

  .note p {
    margin: 7px 0 0;
    color: #74778C;
    font-size: 9.5px;
    line-height: 1.6;
  }

  .section {
    padding: 20px;
    border-top: 1px solid #EEEEF4;
  }

  .section-title {
    margin: 0;
    color: #343653;
    font-size: 17px;
  }

  .section-subtitle {
    margin: 4px 0 14px;
    color: #999CAD;
    font-size: 9px;
  }

  .game {
    margin-bottom: 11px;
    overflow: hidden;
    border: 1px solid #E8E8F0;
    border-radius: 13px;
    page-break-inside: avoid;
  }

  .game-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    padding: 12px 14px;
    border-bottom: 1px solid #EFEFF4;
    background: #FCFCFE;
  }

  .game-index {
    display: inline-block;
    min-width: 28px;
    margin-right: 9px;
    padding: 6px 7px;
    border-radius: 8px;
    color: #7465E8;
    background: #F0EDFF;
    font-size: 8px;
    font-weight: 800;
    text-align: center;
  }

  .game-name {
    color: #3F415C;
    font-size: 10.5px;
    font-weight: 800;
  }

  .game-meta {
    margin-top: 3px;
    color: #999CAD;
    font-size: 8px;
  }

  .game-status {
    color: #4A8B71;
    font-size: 8px;
    font-weight: 800;
  }

  .metrics {
    padding: 0 14px;
  }

  .metric {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 12px;
    padding: 9px 0;
    border-bottom: 1px solid #F0F0F4;
  }

  .metric:last-child {
    border-bottom: 0;
  }

  .metric span {
    color: #9699AA;
    font-size: 8.5px;
  }

  .metric strong {
    color: #44465F;
    font-size: 9px;
  }

  .footer {
    display: flex;
    justify-content: space-between;
    gap: 14px;
    padding: 13px 20px;
    color: #A0A3B4;
    background: #FAFAFC;
    border-top: 1px solid #EEEEF4;
    font-size: 8px;
  }
`;


const sharePdf = async (
  html: string
) => {

  const result =
    await Print.printToFileAsync({
      html,
    });


  const available =
    await Sharing
      .isAvailableAsync();


  if (!available) {
    throw new Error(
      "PDF sharing is not available on this device."
    );
  }


  await Sharing.shareAsync(
    result.uri,
    {
      mimeType:
        "application/pdf",
      dialogTitle:
        "Save KidMind Report",
      UTI:
        "com.adobe.pdf",
    }
  );

};


export const downloadParentReportPdf =
  async (
    session: any
  ) => {

    const games =
      Array.isArray(
        session?.games
      )
        ? session.games
        : [];


    const score =
      getSessionScore(
        session
      );


    const reportDate =
      session?.ended_at ||
      session?.started_at ||
      session?.created_at;


    const gamesHtml =
      games.length
        ? games
            .map(
              (
                game: any,
                index: number
              ) => `
                <div class="game">
                  <div class="game-head">
                    <div>
                      <span class="game-index">${String(
                        index + 1
                      ).padStart(
                        2,
                        "0"
                      )}</span>
                      <span class="game-name">${escapeHtml(
                        game?.game_name ||
                        "Assessment Game"
                      )}</span>
                      <div class="game-meta">${escapeHtml(
                        getDomainName(
                          game
                        ) ||
                        "Assessment Game"
                      )}</div>
                    </div>
                    <span class="game-status">${escapeHtml(
                      game?.status ||
                      "—"
                    )}</span>
                  </div>

                  <div class="metrics">
                    <div class="metric">
                      <span>Score</span>
                      <strong>${formatPercent(
                        game?.score
                      )}</strong>
                    </div>

                    <div class="metric">
                      <span>Accuracy</span>
                      <strong>${formatPercent(
                        game?.accuracy
                      )}</strong>
                    </div>

                    <div class="metric">
                      <span>Status</span>
                      <strong>${escapeHtml(
                        game?.status ||
                        "—"
                      )}</strong>
                    </div>
                  </div>
                </div>
              `
            )
            .join(
              ""
            )
        : `
            <div class="note">
              <p>No game results are available for this session.</p>
            </div>
          `;


    const html = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>${reportCss}</style>
        </head>

        <body>
          <div class="document">

            <div class="topbar">
              <div>
                <div class="brand">KIDMIND</div>
                <div class="brand-subtitle">Parent Assessment Report</div>
              </div>

              <div class="status">
                ${escapeHtml(
                  session?.status ||
                  "Unknown"
                )}
              </div>
            </div>

            <div class="hero">
              <div>
                <div class="eyebrow">ASSESSMENT REPORT</div>
                <h1>${escapeHtml(
                  session?.child_name ||
                  "Child"
                )}</h1>
                <div class="session">
                  Session #${escapeHtml(
                    session?.id
                  )}
                </div>
              </div>

              <div class="score">
                <span>Session Score</span>
                <strong>${
                  score !== null
                    ? `${score}%`
                    : "—"
                }</strong>
                <small>Recorded assessment result</small>
              </div>
            </div>

            <div class="facts">
              <div class="fact">
                <span>Child</span>
                <strong>${escapeHtml(
                  session?.child_name ||
                  "—"
                )}</strong>
              </div>

              <div class="fact">
                <span>Date</span>
                <strong>${escapeHtml(
                  formatDateOnly(
                    reportDate
                  )
                )}</strong>
              </div>

              <div class="fact">
                <span>Status</span>
                <strong>${escapeHtml(
                  session?.status ||
                  "—"
                )}</strong>
              </div>

              <div class="fact">
                <span>Session</span>
                <strong>#${escapeHtml(
                  session?.id
                )}</strong>
              </div>
            </div>

            <div class="section">
              <h2 class="section-title">Game Results</h2>
              <p class="section-subtitle">
                Recorded results for each assessment game.
              </p>

              ${gamesHtml}
            </div>

            <div class="footer">
              <span>KidMind Assessment Report</span>
              <span>Session #${escapeHtml(
                session?.id
              )}</span>
            </div>

          </div>
        </body>
      </html>
    `;


    await sharePdf(
      html
    );

  };


export const downloadTherapistReportPdf =
  async (
    session: any,
    elapsedSeconds?: number
  ) => {

    const games =
      Array.isArray(
        session?.games
      )
        ? session.games
        : [];


    const score =
      getSessionScore(
        session
      );


    const reportDate =
      session?.ended_at ||
      session?.started_at ||
      session?.scheduled_at ||
      session?.created_at;


    const completed =
      session?.status ===
      "Completed";


    const reportTitle =
      completed
        ? "Session Completed"
        : session?.status ===
            "Ended"
          ? "Session Ended"
          : "Session Cancelled";


    const reportText =
      completed
        ? "All selected games were completed and the results were saved."
        : session?.status ===
            "Ended"
          ? "This session was ended manually. Results completed before the session ended are shown below."
          : "This session was cancelled before completion. Any saved game results are shown below.";


    const duration =
      Number.isFinite(
        Number(
          session?.duration_seconds
        )
      )
        ? Number(
            session?.duration_seconds
          )
        : Number(
            elapsedSeconds ||
            0
          );


    const gamesHtml =
      games.length
        ? games
            .map(
              (
                game: any,
                index: number
              ) => `
                <div class="game">
                  <div class="game-head">
                    <div>
                      <span class="game-index">${String(
                        index + 1
                      ).padStart(
                        2,
                        "0"
                      )}</span>
                      <span class="game-name">${escapeHtml(
                        game?.game_name ||
                        "Assessment Game"
                      )}</span>
                      <div class="game-meta">${escapeHtml(
                        game?.difficulty ||
                        "No difficulty"
                      )}</div>
                    </div>

                    <span class="game-status">${escapeHtml(
                      game?.status ||
                      "—"
                    )}</span>
                  </div>

                  <div class="metrics">
                    <div class="metric">
                      <span>Score</span>
                      <strong>${formatPercent(
                        game?.score
                      )}</strong>
                    </div>

                    <div class="metric">
                      <span>Accuracy</span>
                      <strong>${formatPercent(
                        game?.accuracy
                      )}</strong>
                    </div>

                    <div class="metric">
                      <span>Mistakes</span>
                      <strong>${formatNumber(
                        game?.mistakes
                      )}</strong>
                    </div>

                    <div class="metric">
                      <span>Reaction Time</span>
                      <strong>${formatReactionTime(
                        game?.reaction_time
                      )}</strong>
                    </div>

                    <div class="metric">
                      <span>Game Time</span>
                      <strong>${formatDuration(
                        game?.duration_seconds
                      )}</strong>
                    </div>
                  </div>
                </div>
              `
            )
            .join(
              ""
            )
        : `
            <div class="note">
              <p>No game results are available for this session.</p>
            </div>
          `;


    const html = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>${reportCss}</style>
        </head>

        <body>
          <div class="document">

            <div class="topbar">
              <div>
                <div class="brand">KIDMIND</div>
                <div class="brand-subtitle">Therapist Assessment Report</div>
              </div>

              <div class="status">
                ${escapeHtml(
                  session?.status ||
                  "Unknown"
                )}
              </div>
            </div>

            <div class="hero">
              <div>
                <div class="eyebrow">THERAPIST ASSESSMENT REPORT</div>
                <h1>${escapeHtml(
                  session?.child_name ||
                  "Child"
                )}</h1>
                <div class="session">
                  Session #${escapeHtml(
                    session?.id
                  )}
                </div>
              </div>

              <div class="score">
                <span>Overall Score</span>
                <strong>${
                  score !== null
                    ? `${score}%`
                    : "—"
                }</strong>
                <small>Recorded session result</small>
              </div>
            </div>

            <div class="facts">
              <div class="fact">
                <span>Child</span>
                <strong>${escapeHtml(
                  session?.child_name ||
                  "—"
                )}</strong>
              </div>

              <div class="fact">
                <span>Session Duration</span>
                <strong>${formatDuration(
                  duration
                )}</strong>
              </div>

              <div class="fact">
                <span>Assessment Date</span>
                <strong>${escapeHtml(
                  formatDate(
                    reportDate
                  )
                )}</strong>
              </div>

              <div class="fact">
                <span>Status</span>
                <strong>${escapeHtml(
                  session?.status ||
                  "—"
                )}</strong>
              </div>
            </div>

            <div class="note">
              <strong>${escapeHtml(
                reportTitle
              )}</strong>
              <p>${escapeHtml(
                reportText
              )}</p>
            </div>

            <div class="section">
              <h2 class="section-title">Game Results</h2>
              <p class="section-subtitle">
                Detailed results saved for each selected game.
              </p>

              ${gamesHtml}
            </div>

            <div class="footer">
              <span>KidMind Therapist Assessment Report</span>
              <span>Session #${escapeHtml(
                session?.id
              )}</span>
            </div>

          </div>
        </body>
      </html>
    `;


    await sharePdf(
      html
    );

  };
