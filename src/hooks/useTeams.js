import { useState, useEffect } from 'react'

const API_BASE = 'https://worldcup26.ir'

function useTeams() {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function fetchTeams() {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`${API_BASE}/get/teams`)
        if (!res.ok) {
          throw new Error(`API error: ${res.status} ${res.statusText}`)
        }
        const data = await res.json()
        if (!cancelled) {
          setTeams(data.teams)
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

    fetchTeams()

    return () => {
      cancelled = true
    }
  }, [])

  return { teams, loading, error }
}

export default useTeams
