export function enrichTeam(team, personName) {
  return { ...team, personName }
}

export function groupTeamsByGroup(teams) {
  const groups = {}
  for (const team of teams) {
    const g = team.groups
    if (!groups[g]) groups[g] = []
    groups[g].push(team)
  }
  return Object.keys(groups).sort().map((key) => ({
    group: key,
    teams: groups[key],
  }))
}
