import useGroups from '../hooks/useGroups'
import useTeams from '../hooks/useTeams'
import useMatches from '../hooks/useMatches'
import { getPersonName } from '../utils/nameMapping'
import cardsData from '../data/cards.json'

const ROUND_ORDER = ['group', 'r32', 'r16', 'qf', 'sf', 'final']
const ROUND_LABELS = { group: 'Group Stage', r32: 'Round of 32', r16: 'Round of 16', qf: 'Quarter-finals', sf: 'Semi-finals', final: 'Final' }

function computeEliminated(groups, matches) {
  const eliminated = new Set()

  const groupMatches = matches.filter((m) => m.type === 'group')
  const groupStageDone = groupMatches.length > 0 && groupMatches.every((m) => m.finished === 'TRUE')

  if (groupStageDone) {
    const qualified = new Set()
    const groupStandings = {}
    for (const g of groups) {
      const sorted = [...g.teams].sort((a, b) =>
        parseInt(b.pts, 10) - parseInt(a.pts, 10) ||
        parseInt(b.gd, 10) - parseInt(a.gd, 10) ||
        parseInt(b.gf, 10) - parseInt(a.gf, 10)
      )
      groupStandings[g.name] = sorted
      if (sorted[0]) qualified.add(sorted[0].team_id)
      if (sorted[1]) qualified.add(sorted[1].team_id)
    }

    const thirds = []
    for (const [name, standings] of Object.entries(groupStandings)) {
      if (standings[2]) {
        thirds.push({ ...standings[2], group: name, pts: parseInt(standings[2].pts, 10), gd: parseInt(standings[2].gd, 10), gf: parseInt(standings[2].gf, 10) })
      }
    }
    thirds.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf)
    for (let i = 0; i < Math.min(8, thirds.length); i++) {
      qualified.add(thirds[i].team_id)
    }

    for (const g of groups) {
      for (const t of g.teams) {
        if (!qualified.has(t.team_id)) {
          eliminated.add(t.team_id)
        }
      }
    }
  }

  const koMatches = matches.filter((m) => m.type !== 'group')

  const koById = {}
  for (const m of koMatches) {
    koById[m.id] = m
  }

  const matchWinners = {}
  for (const m of koMatches) {
    if (m.finished === 'TRUE' && m.home_team_id !== '0' && m.away_team_id !== '0') {
      const h = parseInt(m.home_score, 10)
      const a = parseInt(m.away_score, 10)
      if (h > a) matchWinners[m.id] = m.home_team_id
      else if (a > h) matchWinners[m.id] = m.away_team_id
    }
  }

  for (const m of koMatches) {
    if (m.finished === 'TRUE' && m.home_team_id !== '0' && m.away_team_id !== '0' && matchWinners[m.id]) {
      if (m.type === 'final') continue
      const loser = matchWinners[m.id] === m.home_team_id ? m.away_team_id : m.home_team_id
      eliminated.add(loser)
    }
  }

  return eliminated
}

function roundReached(teamId, matches, matchWinners) {
  const ko = matches.filter((m) => m.type !== 'group')
    .sort((a, b) => ROUND_ORDER.indexOf(a.type) - ROUND_ORDER.indexOf(b.type))

  let highest = 'group'
  for (const m of ko) {
    if (matchWinners[m.id] === teamId) {
      highest = m.type
    }
  }

  for (const m of ko) {
    if (m.finished === 'TRUE' && m.home_team_id === teamId && m.away_team_id !== '0') {
      if (ROUND_ORDER.indexOf(m.type) > ROUND_ORDER.indexOf(highest)) {
        highest = m.type
      }
    }
    if (m.finished === 'TRUE' && m.away_team_id === teamId && m.home_team_id !== '0') {
      if (ROUND_ORDER.indexOf(m.type) > ROUND_ORDER.indexOf(highest)) {
        highest = m.type
      }
    }
  }

  return highest
}

function Prizes() {
  const { groups, loading: gLoading, error: gError } = useGroups()
  const { teams, loading: tLoading, error: tError } = useTeams()
  const { matches, loading: mLoading, error: mError } = useMatches()

  if (gLoading || tLoading || mLoading) return <p>Loading prizes...</p>
  if (gError || tError || mError) return <p>Error: {gError || tError || mError}</p>

  const teamMap = {}
  for (const t of teams) {
    teamMap[t.id] = t
  }

  const allTeams = []
  for (const g of groups) {
    for (const row of g.teams) {
      const team = teamMap[row.team_id]
      allTeams.push({
        team,
        personName: team ? getPersonName(team.name_en) : `Team ${row.team_id}`,
        ...row,
        pts: parseInt(row.pts, 10),
        gd: parseInt(row.gd, 10),
        gf: parseInt(row.gf, 10),
        mp: parseInt(row.mp, 10),
        group: g.name,
        team_id: row.team_id,
      })
    }
  }

  const eliminated = computeEliminated(groups, matches)

  const koMatches = matches.filter((m) => m.type !== 'group')
  const matchWinners = {}
  for (const m of koMatches) {
    if (m.finished === 'TRUE' && m.home_team_id !== '0' && m.away_team_id !== '0') {
      const h = parseInt(m.home_score, 10)
      const a = parseInt(m.away_score, 10)
      if (h > a) matchWinners[m.id] = m.home_team_id
      else if (a > h) matchWinners[m.id] = m.away_team_id
    }
  }

  for (const t of allTeams) {
    t.round = roundReached(t.team_id, matches, matchWinners)
    t.eliminated = eliminated.has(t.team_id)
  }

  const sorted = [...allTeams].sort((a, b) =>
    ROUND_ORDER.indexOf(b.round) - ROUND_ORDER.indexOf(a.round) ||
    b.pts - a.pts ||
    b.gd - a.gd ||
    b.gf - a.gf
  )

  const inContention = sorted.filter((t) => !t.eliminated)

  const finalMatch = koMatches.find((m) => m.type === 'final')
  const finalPlayed = finalMatch && finalMatch.finished === 'TRUE' && matchWinners[finalMatch.id]

  let first, second, wooden
  if (finalPlayed) {
    first = allTeams.find((t) => t.team_id === matchWinners[finalMatch.id])
    second = allTeams.find((t) => t.team_id === (matchWinners[finalMatch.id] === finalMatch.home_team_id ? finalMatch.away_team_id : finalMatch.home_team_id))
  } else {
    first = inContention[0] || null
    second = inContention[1] || null
  }
  wooden = sorted[sorted.length - 1]

  let badBoyLeader = null
  for (const t of allTeams) {
    const cards = cardsData[t.team?.name_en]
    if (!cards || cards.rank == null) continue
    if (!badBoyLeader || cards.rank < cardsData[badBoyLeader.team?.name_en].rank) {
      badBoyLeader = t
    }
  }

  const played = matches.filter((m) => m.finished === 'TRUE').length
  const total = matches.length

  return (
    <div>
      <h1>Prizes</h1>
      <p className="prizes-subtitle">
        {played} of {total} matches played
      </p>

      <div className="prize-grid">
        <div className="prize-card prize-gold">
          <div className="prize-icon">&#9733;</div>
          <h2>1st Place</h2>
          <div className="prize-amount">&pound;140</div>
          {first && first.team && !first.eliminated ? (
            <div className="prize-leader">
              <img src={first.team.flag} alt="" width={24} height={16} className="flag" />
              <span className="prize-name">{first.personName}</span>
            </div>
          ) : first && first.team ? (
            <div className="prize-leader">
              <img src={first.team.flag} alt="" width={24} height={16} className="flag" />
              <span className="prize-name">{first.personName}</span>
              <span className="prize-badge">&#10003;</span>
            </div>
          ) : (
            <div className="prize-leader prize-tbd">TBD</div>
          )}
          {first && (
            <div className="prize-stat">
              {finalPlayed ? 'World Champion' : `${first.pts} pts \u00b7 ${ROUND_LABELS[first.round]}`}
            </div>
          )}
        </div>

        <div className="prize-card prize-silver">
          <div className="prize-icon">&#9733;</div>
          <h2>2nd Place</h2>
          <div className="prize-amount">&pound;60</div>
          {second && second.team && !second.eliminated ? (
            <div className="prize-leader">
              <img src={second.team.flag} alt="" width={24} height={16} className="flag" />
              <span className="prize-name">{second.personName}</span>
            </div>
          ) : second && second.team ? (
            <div className="prize-leader">
              <img src={second.team.flag} alt="" width={24} height={16} className="flag" />
              <span className="prize-name">{second.personName}</span>
              <span className="prize-badge">&#10003;</span>
            </div>
          ) : (
            <div className="prize-leader prize-tbd">TBD</div>
          )}
          {second && (
            <div className="prize-stat">
              {finalPlayed ? 'Runner-up' : `${second.pts} pts \u00b7 ${ROUND_LABELS[second.round]}`}
            </div>
          )}
        </div>

        <div className="prize-card prize-bronze">
          <div className="prize-icon">🥄</div>
          <h2>Wooden Spoon</h2>
          <div className="prize-amount">&pound;20</div>
          {wooden && wooden.team ? (
            <div className="prize-leader">
              <img src={wooden.team.flag} alt="" width={24} height={16} className="flag" />
              <span className="prize-name">{wooden.personName}</span>
            </div>
          ) : (
            <div className="prize-leader prize-tbd">TBD</div>
          )}
          {wooden && (
            <div className="prize-stat">{wooden.pts} pts &middot; {wooden.gd} GD</div>
          )}
        </div>

        <div className="prize-card prize-badboys">
          <div className="prize-icon">&#9888;</div>
          <h2>Bad Boys</h2>
          <div className="prize-amount">&pound;20</div>
          {badBoyLeader && badBoyLeader.team ? (
            <div className="prize-leader">
              <img src={badBoyLeader.team.flag} alt="" width={24} height={16} className="flag" />
              <span className="prize-name">{badBoyLeader.personName}</span>
            </div>
          ) : (
            <div className="prize-leader prize-tbd">TBD</div>
          )}
          {badBoyLeader && (
            <div className="prize-stat">
              {cardsData[badBoyLeader.team?.name_en]?.red ?? 0}R &middot; {cardsData[badBoyLeader.team?.name_en]?.yellow ?? 0}Y
            </div>
          )}
        </div>
      </div>

      <section>
        <h2>Overall Standings</h2>
        <div className="overall-standings">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Team</th>
                <th>Group</th>
                <th>MP</th>
                <th>W</th>
                <th>D</th>
                <th>L</th>
                <th>GF</th>
                <th>GA</th>
                <th>GD</th>
                <th>Pts</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((row, i) => {
                let cls = ''
                if (i === 0 && !row.eliminated) cls = 'row-gold'
                else if (i === 1 && !row.eliminated) cls = 'row-silver'
                else if (i === sorted.length - 1) cls = 'row-bronze'
                else if (row.eliminated) cls = 'row-eliminated'
                return (
                  <tr key={row.team_id} className={cls}>
                    <td>{i + 1}</td>
                    <td>
                      <div className="team-cell">
                        {row.team ? (
                          <>
                            <img src={row.team.flag} alt="" width={18} height={13} className="flag" />
                            {row.personName}
                          </>
                        ) : (
                          `Team ${row.team_id}`
                        )}
                      </div>
                    </td>
                    <td>{row.group}</td>
                    <td>{row.mp}</td>
                    <td>{row.w}</td>
                    <td>{row.d}</td>
                    <td>{row.l}</td>
                    <td>{row.gf}</td>
                    <td>{row.ga}</td>
                    <td>{row.gd}</td>
                    <td className="pts">{row.pts}</td>
                    <td>
                      <span className={`status-badge ${row.eliminated ? 'status-out' : 'status-in'}`}>
                        {row.eliminated ? 'Eliminated' : ROUND_LABELS[row.round]}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default Prizes
