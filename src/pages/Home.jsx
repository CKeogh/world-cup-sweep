import useGroups from '../hooks/useGroups'
import useTeams from '../hooks/useTeams'
import useMatches from '../hooks/useMatches'
import { getPersonName } from '../utils/nameMapping'

function Home() {
  const { groups, loading: gLoading, error: gError } = useGroups()
  const { teams, loading: tLoading, error: tError } = useTeams()
  const { matches, loading: mLoading, error: mError } = useMatches()

  if (gLoading || tLoading || mLoading) return <p>Loading...</p>
  if (gError || tError || mError) return <p>Error: {gError || tError || mError}</p>

  const teamMap = {}
  for (const t of teams) {
    teamMap[t.id] = t
  }

  const finished = matches.filter((m) => m.finished === 'TRUE')
  const upcoming = matches.filter((m) => m.finished !== 'TRUE')

  return (
    <div className="dashboard">
      <h1>World Cup 2026 Sweepstake</h1>

      <div className="cards">
        <div className="card">
          <h2>{teams.length}</h2>
          <p>Teams</p>
        </div>
        <div className="card">
          <h2>{matches.length}</h2>
          <p>Matches</p>
        </div>
        <div className="card">
          <h2>{finished.length}</h2>
          <p>Played</p>
        </div>
        <div className="card">
          <h2>{upcoming.length}</h2>
          <p>Upcoming</p>
        </div>
      </div>

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
                    const team = teamMap[row.team_id]
                    return (
                      <tr key={row.team_id}>
                        <td>{i + 1}</td>
                        <td>
                          <div className="team-cell">
                            {team ? (
                              <>
                                <img src={team.flag} alt="" width={18} height={13} className="flag" />
                                {getPersonName(team.name_en)}
                              </>
                            ) : (
                              `Team ${row.team_id}`
                            )}
                          </div>
                        </td>
                        <td className="pts">{row.pts}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Home
