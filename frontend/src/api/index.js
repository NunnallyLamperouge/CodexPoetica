import axios from 'axios'
import { getVisitorId } from '../utils/visitor.js'

const http = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
})

http.interceptors.request.use(config => {
  config.headers['X-Visitor-Id'] = getVisitorId()
  return config
})

export const api = {
  health: () => http.get('/health'),

  createWork: (data) => http.post('/works', data),
  updateWork: (workId, data) => http.put(`/works/${workId}`, data),
  getWork: (workId) => http.get(`/works/${workId}`),
  listWorks: () => http.get('/works'),
  deleteWork: (workId) => http.delete(`/works/${workId}`),

  shareWork: (workId, data = {}) => http.post(`/works/${workId}/share`, data),
  getShare: (shareCode) => http.get(`/shares/${shareCode}`),

  getMappingProfiles: () => http.get('/mapping-profiles'),

  recordExport: (data) => http.post('/exports', data),

  parseCode: (language, sourceCode) => http.post('/parse', { language, sourceCode }),
}
