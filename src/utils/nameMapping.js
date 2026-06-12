import mapping from '../../nameMapping.json'

export function getPersonName(teamName) {
  return mapping[teamName]
}

export function getTeamNames() {
  return Object.keys(mapping)
}
