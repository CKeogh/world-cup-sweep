import useGroups from "../hooks/useGroups";
import useTeams from "../hooks/useTeams";
import useMatches from "../hooks/useMatches";
import { getPersonName } from "../utils/nameMapping";
import { localToBST } from "../utils/dates";
import LoadingSpinner from "../components/LoadingSpinner";

function Home() {
  const { groups, loading: gLoading, error: gError } = useGroups();
  const { teams, loading: tLoading, error: tError } = useTeams();
  const { matches, loading: mLoading, error: mError } = useMatches();

  if (gLoading || tLoading || mLoading) return <LoadingSpinner />;
  if (gError || tError || mError)
    return <p>Error: {gError || tError || mError}</p>;

  const teamMap = {};
  for (const t of teams) {
    teamMap[t.id] = t;
  }

  const upcoming = matches.filter((m) => m.finished !== "TRUE");

  function toDate(str) {
    const [datePart, timePart] = str.split(" ");
    const [month, day, year] = datePart.split("/");
    return new Date(`${year}-${month}-${day}T${timePart}`);
  }

  const nextGame = [...upcoming].sort(
    (a, b) => toDate(a.local_date) - toDate(b.local_date),
  )[0];

  function renderNextGame() {
    if (!nextGame) return null;
    const home = teamMap[nextGame.home_team_id];
    const away = teamMap[nextGame.away_team_id];

    return (
      <div className="card card-next-game">
        <h3 className="next-game-title">Next Game</h3>
        <div className="next-game-teams">
          <span className="next-game-team">
            {home ? (
              <>
                <img
                  src={home.flag}
                  alt=""
                  width={28}
                  height={20}
                  className="flag"
                />
                {getPersonName(home.name_en)}
              </>
            ) : (
              nextGame.home_team_label || "TBD"
            )}
          </span>
          <span className="next-game-vs">vs</span>
          <span className="next-game-team">
            {away ? (
              <>
                <img
                  src={away.flag}
                  alt=""
                  width={28}
                  height={20}
                  className="flag"
                />
                {getPersonName(away.name_en)}
              </>
            ) : (
              nextGame.away_team_label || "TBD"
            )}
          </span>
        </div>
        <p className="next-game-meta">
          Group {nextGame.group} &middot;{" "}
          {localToBST(nextGame.local_date, nextGame.stadium_id)}
        </p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="cards">{renderNextGame()}</div>

      <section>
        <h2>Standings</h2>
        <div className="standings-grid">
          {groups.map((g) => (
            <div key={g.name} className="standings-card">
              <h3>Group {g.name}</h3>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Team</th>
                    <th>Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {g.teams.map((row, i) => {
                    const team = teamMap[row.team_id];
                    return (
                      <tr key={row.team_id}>
                        <td>{i + 1}</td>
                        <td>
                          <div className="team-cell">
                            {team ? (
                              <>
                                <img
                                  src={team.flag}
                                  alt=""
                                  width={18}
                                  height={13}
                                  className="flag"
                                />
                                {getPersonName(team.name_en)}
                              </>
                            ) : (
                              `Team ${row.team_id}`
                            )}
                          </div>
                        </td>
                        <td className="pts">{row.pts}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
