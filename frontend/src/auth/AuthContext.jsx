import { createContext, useContext, useEffect, useState } from 'react'
import { loginRequest, registerRequest, fetchProfile, setAuthToken } from '../services/api'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('accessToken'))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(!!token)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (token) {
      setAuthToken(token)
      fetchProfile()
        .then((data) => setUser(data))
        .catch(() => {
          setToken(null)
          localStorage.removeItem('accessToken')
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [token])

  const login = async (credentials) => {
    setError(null)
    const { access } = await loginRequest(credentials)
    localStorage.setItem('accessToken', access)
    setToken(access)
    setAuthToken(access)
    const profile = await fetchProfile()
    setUser(profile)
  }

  const register = async (payload) => {
    setError(null)
    await registerRequest(payload)
    return login({ username: payload.username, password: payload.password })
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('accessToken')
    setAuthToken(null)
  }

  return (
    <AuthContext.Provider value={{ token, user, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
