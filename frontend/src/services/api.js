import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/'

const api = axios.create({
  baseURL,
})

let authToken = localStorage.getItem('accessToken')

export const setAuthToken = (token) => {
  authToken = token
}

api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`
  }
  return config
})

export const loginRequest = async ({ username, password }) => {
  const { data } = await api.post('auth/token/', { username, password })
  return data
}

export const registerRequest = async (payload) => {
  const { data } = await api.post('auth/register/', payload)
  return data
}

export const fetchProfile = async () => {
  const { data } = await api.get('auth/profile/')
  return data
}

export const fetchSummary = async (params = {}) => {
  const { data } = await api.get('reports/summary/', { params })
  return data
}

export const fetchCategories = async () => {
  const { data } = await api.get('categories/')
  return data
}

export const createCategory = async (payload) => {
  const { data } = await api.post('categories/', payload)
  return data
}

export const fetchMovements = async (params = {}) => {
  const { data } = await api.get('movements/', { params })
  return data
}

export const createMovement = async (payload) => {
  const { data } = await api.post('movements/', payload)
  return data
}

export const deleteMovement = async (id) => {
  await api.delete(`movements/${id}/`)
}

export const fetchBudgets = async () => {
  const { data } = await api.get('budgets/')
  return data
}

export const createBudget = async (payload) => {
  const { data } = await api.post('budgets/', payload)
  return data
}

export default api
