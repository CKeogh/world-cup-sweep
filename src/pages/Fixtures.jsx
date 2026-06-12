import useMatches from '../hooks/useMatches'
import useTeams from '../hooks/useTeams'
import { getPersonName } from '../utils/nameMapping'
import { localToBST } from '../utils/dates'

function Fixtures() {
  const { matches, loading: matchLoading, error: matchError } = useMatches()
  const { teams, loading: teamLoading, error: teamError } = useTeams()

  if (matchLoading || teamLoading) return <p>Loading fixtures...</p>
  if (matchError || teamError) return <p>Error: {matchError || teamError}</p>

  const teamMap = {}
  for (const t of teams) {
    teamMap[t.id] = t
  }

  const finished = matches.filter((m) => m.finished === 'TRUE')
  const upcoming = matches.filter((m) => m.finished !== 'TRUE')

  function renderMatch(m) {
    const home = teamMap[m.home_team_id]
    const away = teamMap[m.away_team_id]

    return (
      <div key={m.id} className="match-card">
        <div className="match-teams">
          <div className="team">
            {home ? (
              <>
                <img src={home.flag} alt="" width={20} height={14} className="flag" />
                <span>{getPersonName(home.name_en)}</span>
              </>
            ) : (
              <span className="placeholder">{m.home_team_label || 'TBD'}</span>
            )}
          </div>
          <div className="score">
            {m.finished === 'TRUE'
              ? `${m.home_score ?? '-'} - ${m.away_score ?? '-'}`
              : 'vs'}
          </div>
          <div className="team">
            {away ? (
              <>
                <span>{getPersonName(away.name_en)}</span>
                <img src={away.flag} alt="" width={20} height={14} className="flag" />
              </>
            ) : (
              <span className="placeholder">{m.away_team_label || 'TBD'}</span>
            )}
          </div>
        </div>
        <div className="match-meta">
          <span>Group {m.group}</span>
          <span>{localToBST(m.local_date, m.stadium_id)}</span>
          {m.finished === 'TRUE' && <span className="badge">FT</span>}
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1>Fixtures</h1>

      {upcoming.length > 0 && (
        <section>
          <h2>Upcoming ({upcoming.length})</h2>
          <div className="match-list">
            {upcoming.map(renderMatch)}
          </div>
        </section>
      )}

      {finished.length > 0 && (
        <section>
          <h2>Results ({finished.length})</h2>
          <div className="match-list">
            {finished.map(renderMatch)}
          </div>
        </section>
      )}
    </div>
  )
}

export default Fixtures
