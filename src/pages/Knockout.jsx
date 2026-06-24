import useMatches from '../hooks/useMatches'
import useTeams from '../hooks/useTeams'
import { getPersonName } from '../utils/nameMapping'
import LoadingSpinner from '../components/LoadingSpinner'
import "./Knockout.css"

const TOTAL_SLOTS = 16

function gridPos(index, count) {
  const span = TOTAL_SLOTS / count
  return { gridRow: `${index * span + 1} / span ${span}` }
}

const BRACKET = [
  {
    title: "Top Half",
    rounds: [
      { name: "Round of 32", matchIds: [74, 77, 73, 75, 83, 84, 81, 82] },
      { name: "Round of 16", matchIds: [89, 90, 93, 94] },
      { name: "Quarter-finals", matchIds: [97, 98] },
      { name: "Semi-final", matchIds: [101] },
    ],
  },
  {
    title: "Bottom Half",
    rounds: [
      { name: "Round of 32", matchIds: [76, 78, 79, 80, 86, 88, 85, 87] },
      { name: "Round of 16", matchIds: [91, 92, 95, 96] },
      { name: "Quarter-finals", matchIds: [99, 100] },
      { name: "Semi-final", matchIds: [102] },
    ],
  },
]

const FINAL_MATCHES = [
  { matchId: 103, label: "Third Place Play-off", className: "" },
  { matchId: 104, label: "Final", className: "grand-final" },
]

function getTeamInfo(match, side, teamMap) {
  const id = side === 'home' ? match.home_team_id : match.away_team_id
  const label = side === 'home' ? match.home_team_label : match.away_team_label
  const name = side === 'home' ? match.home_team_name_en : match.away_team_name_en
  const score = side === 'home' ? match.home_score : match.away_score

  if (id && id !== '0' && teamMap[id]) {
    return { name: getPersonName(teamMap[id].name_en) || teamMap[id].name_en, flag: teamMap[id].flag, score, known: true }
  }
  return { name: name || label || '-', score, known: false }
}

function KnockoutMatch({ match, teamMap, isFinal }) {
  const home = getTeamInfo(match, 'home', teamMap)
  const away = getTeamInfo(match, 'away', teamMap)

  return (
    <>
      {home.known && <img src={home.flag} alt="" width={isFinal ? 20 : 18} height={isFinal ? 14 : 13} className="flag" />}
      <span className={`team-name${home.known ? '' : ' placeholder'}`}>{home.name}</span>
      <span className="match-vs">
        {match.finished === 'TRUE' ? `${home.score} - ${away.score}` : 'vs'}
      </span>
      <span className={`team-name${away.known ? '' : ' placeholder'}`}>{away.name}</span>
      {away.known && <img src={away.flag} alt="" width={isFinal ? 20 : 18} height={isFinal ? 14 : 13} className="flag" />}
    </>
  )
}

function HalfBracket({ half, matchMap, teamMap }) {
  return (
    <div className="bracket-half">
      <h2 className="bracket-half-title">{half.title}</h2>
      <div className="bracket-tree">
        {half.rounds.map((round, ri) => (
          <div key={ri} className="bracket-col">
            <span className="round-label">{round.name}</span>
            <div className="round-matches">
              {round.matchIds.map((id, mi) => (
                <div key={id} className="match" style={gridPos(mi, round.matchIds.length)}>
                  {matchMap[id]
                    ? <KnockoutMatch match={matchMap[id]} teamMap={teamMap} />
                    : (
                      <>
                        <span className="team-name placeholder">-</span>
                        <span className="match-vs">vs</span>
                        <span className="team-name placeholder">-</span>
                      </>
                    )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Knockout() {
  const { matches, loading, error } = useMatches()
  const { teams, loading: teamLoading, error: teamError } = useTeams()

  if (loading || teamLoading) return <LoadingSpinner />
  if (error || teamError) return <p>Error: {error || teamError}</p>

  const matchMap = {}
  for (const m of matches) {
    matchMap[m.id] = m
  }

  const teamMap = {}
  for (const t of teams) {
    teamMap[t.id] = t
  }

  return (
    <div className="knockout">
      <h1>Knockout Stage</h1>
      <div className="brackets">
        {BRACKET.map((half, i) => (
          <HalfBracket key={i} half={half} matchMap={matchMap} teamMap={teamMap} />
        ))}
      </div>
      <div className="finals">
        <h2>Finals</h2>
        <div className="finals-matches">
          {FINAL_MATCHES.map((fm) => {
            const match = matchMap[fm.matchId]
            const cls = `match final-match${fm.className ? ' ' + fm.className : ''}`
            return (
              <div key={fm.matchId} className={cls}>
                <span className={`round-label${fm.className ? ' final-label' : ''}`}>{fm.label}</span>
                <div className="final-teams">
                  {match
                    ? <KnockoutMatch match={match} teamMap={teamMap} isFinal />
                    : (
                      <>
                        <span className="team-name placeholder">-</span>
                        <span className="match-vs">vs</span>
                        <span className="team-name placeholder">-</span>
                      </>
                    )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Knockout
