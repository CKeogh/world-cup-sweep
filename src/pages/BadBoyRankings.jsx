import { Link } from 'react-router-dom'
import useTeams from '../hooks/useTeams'
import cardsData from '../data/cards.json'
import { getPersonName } from '../utils/nameMapping'
import LoadingSpinner from '../components/LoadingSpinner'

function BadBoyRankings() {
  const { teams, loading, error } = useTeams()

  const teamMap = {}
  for (const t of teams) {
    teamMap[t.name_en] = t
  }

  const entries = Object.entries(cardsData)
    .map(([team, cards]) => ({
      team,
      flag: teamMap[team]?.flag,
      personName: getPersonName(team),
      red: cards.red ?? 0,
      yellow: cards.yellow ?? 0,
      points: (cards.red ?? 0) * 4 + (cards.yellow ?? 0),
    }))
    .filter((e) => e.points > 0)
    .sort((a, b) => b.points - a.points || b.red - a.red)

  if (loading) return <LoadingSpinner />
  if (error) return <p>Error: {error}</p>

  return (
    <div>
      <Link to="/prizes" className="back-link">&larr; Back to Prizes</Link>
      <h1>Bad Boy Rankings</h1>
      {entries.length === 0 ? (
        <p>No teams have received any cards yet.</p>
      ) : (
        <div className="overall-standings">
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Team</th>
                <th>Reds</th>
                <th>Yellows</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e, i) => (
                <tr key={e.team}>
                  <td>{i + 1}</td>
                  <td>
                    <div className="team-cell">
                      {e.flag && <img src={e.flag} alt="" width={18} height={13} className="flag" />}
                      {e.personName}
                    </div>
                  </td>
                  <td>{e.red}</td>
                  <td>{e.yellow}</td>
                  <td>{e.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default BadBoyRankings
