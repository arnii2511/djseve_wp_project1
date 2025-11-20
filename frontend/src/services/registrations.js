import API from './api';

export async function registerForEvent(eventId) {
  return API.post('/registrations/register', { eventId });
}

export async function getMyRegistrations() {
  return API.get('/registrations/my');
}
