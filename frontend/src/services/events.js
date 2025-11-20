import API from './api';

export async function createEvent(payload) {
  return API.post('/events', payload);
}

export async function requestEvent(payload) {
  return API.post('/events/request', payload);
}

export async function updateRequest(id, payload) {
  return API.put(`/events/request/${id}`, payload);
}

export async function getRequestById(id) {
  return API.get(`/events/request/${id}`);
}

export async function getAllEventsAdmin() {
  return API.get('/events/all');
}

export async function approveRequest(id, note) {
  return API.put(`/events/approve/${id}`, { note });
}

export async function rejectRequest(id, note) {
  return API.put(`/events/reject/${id}`, { note });
}

export async function getApprovedEvents() {
  return API.get('/events');
}

export async function getEventById(id) {
  console.log('[getEventById] Calling API with ID:', id);
  try {
    const response = await API.get(`/events/${id}`);
    console.log('[getEventById] API response:', response);
    return response;
  } catch (error) {
    console.error('[getEventById] API error:', error);
    throw error;
  }
}