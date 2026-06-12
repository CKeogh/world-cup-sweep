import { useState, useEffect } from 'react'

const API_BASE = 'https://worldcup26.ir'

function useGroups() {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function fetchGroups() {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`${API_BASE}/get/groups`)
        if (!res.ok) {
          throw new Error(`API error: ${res.status} ${res.statusText}`)
        }
        const data = await res.json()
        if (!cancelled) {
          const sorted = data.groups
            .map((g) => ({
              name: g.name,
              teams: [...g.teams].sort((a, b) => parseInt(b.pts, 10) - parseInt(a.pts, 10)),
            }))
            .sort((a, b) => a.name.localeCompare(b.name))
          setGroups(sorted)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchGroups()
    return () => { cancelled = true }
  }, [])

  return { groups, loading, error }
}

export default useGroups
