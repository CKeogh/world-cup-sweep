import { useState, useEffect } from 'react'

const API_BASE = 'https://worldcup26.ir'

function useMatches() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function fetchMatches() {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`${API_BASE}/get/games`)
        if (!res.ok) {
          throw new Error(`API error: ${res.status} ${res.statusText}`)
        }
        const data = await res.json()
        if (!cancelled) {
          setMatches(data.games)
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

    fetchMatches()

    return () => {
      cancelled = true
    }
  }, [])

  return { matches, loading, error }
}

export default useMatches
