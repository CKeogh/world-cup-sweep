import useGroups from '../hooks/useGroups'
import useTeams from '../hooks/useTeams'
import useMatches from '../hooks/useMatches'
import { getPersonName } from '../utils/nameMapping'
import LoadingSpinner from '../components/LoadingSpinner'

function Groups() {
  const { groups, loading: gLoading, error: gError } = useGroups()
  const { teams, loading: tLoading, error: tError } = useTeams()
  const { matches, loading: mLoading, error: mError } = useMatches()

  if (gLoading || tLoading || mLoading) return <LoadingSpinner />
  if (gError || tError || mError) return <p>Error: {gError || tError || mError}</p>

  const groupMatches = matches.filter(m => m.type === 'group')
  const allGroupFinished = groupMatches.every(m => m.finished === 'TRUE')

  if (allGroupFinished) {
    return (
      <div>
        <h1>Standings</h1>
        <p>The group stage has concluded. View the knockout stage progress on the <a href="/prizes">Prizes</a> page.</p>
      </div>
    )
  }

  const teamMap = {}
  for (const t of teams) {
    teamMap[t.id] = t
  }

  return (
    <div>
      <h1>Standings</h1>
      <div className="standings-grid">
        {groups.map((g) => (
          <div key={g.name} className="standings-card">
            <h3>Group {g.name}</h3>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Team</th>
                  <th>MP</th>
                  <th>W</th>
                  <th>D</th>
                  <th>L</th>
                  <th>GF</th>
                  <th>GA</th>
                  <th>GD</th>
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
                              <img src={team.flag} alt="" width={20} height={14} className="flag" />
                              {getPersonName(team.name_en)}
                            </>
                          ) : (
                            `Team ${row.team_id}`
                          )}
                        </div>
                      </td>
                      <td>{row.mp}</td>
                      <td>{row.w}</td>
                      <td>{row.d}</td>
                      <td>{row.l}</td>
                      <td>{row.gf}</td>
                      <td>{row.ga}</td>
                      <td>{row.gd}</td>
                      <td className="pts">{row.pts}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Groups
