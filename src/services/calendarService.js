// Service pour l'intégration avec les calendriers (Google Calendar, Outlook, etc.)

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || ''
const GOOGLE_DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest']
const GOOGLE_SCOPES = 'https://www.googleapis.com/auth/calendar.events'

// Charger l'API Google
let gapiLoaded = false
let gisLoaded = false

export const loadGoogleAPI = () => {
  return new Promise((resolve, reject) => {
    if (gapiLoaded && gisLoaded) {
      resolve()
      return
    }

    // Charger gapi
    if (!window.gapi) {
      const script1 = document.createElement('script')
      script1.src = 'https://apis.google.com/js/api.js'
      script1.onload = () => {
        window.gapi.load('client', () => {
          gapiLoaded = true
          if (gisLoaded) resolve()
        })
      }
      script1.onerror = reject
      document.head.appendChild(script1)
    } else {
      gapiLoaded = true
    }

    // Charger gis
    if (!window.google?.accounts?.oauth2) {
      const script2 = document.createElement('script')
      script2.src = 'https://accounts.google.com/gsi/client'
      script2.onload = () => {
        gisLoaded = true
        if (gapiLoaded) resolve()
      }
      script2.onerror = reject
      document.head.appendChild(script2)
    } else {
      gisLoaded = true
    }
  })
}

// Initialiser Google Calendar API
export const initializeGoogleCalendar = async () => {
  try {
    await loadGoogleAPI()
    
    if (!GOOGLE_CLIENT_ID || !GOOGLE_API_KEY) {
      throw new Error('Google Calendar API credentials not configured')
    }

    await window.gapi.client.init({
      apiKey: GOOGLE_API_KEY,
      discoveryDocs: GOOGLE_DISCOVERY_DOCS,
    })

    return true
  } catch (error) {
    console.error('Error initializing Google Calendar:', error)
    throw error
  }
}

// Obtenir le token d'authentification
export const authenticateGoogle = () => {
  return new Promise((resolve, reject) => {
    if (!window.google?.accounts?.oauth2) {
      reject(new Error('Google API not loaded'))
      return
    }

    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: GOOGLE_SCOPES,
      callback: (response) => {
        if (response.error) {
          reject(new Error(response.error))
        } else {
          // Stocker le token
          localStorage.setItem('google_calendar_token', JSON.stringify({
            access_token: response.access_token,
            expires_at: Date.now() + (response.expires_in * 1000)
          }))
          resolve(response)
        }
      },
    })

    tokenClient.requestAccessToken({ prompt: 'consent' })
  })
}

// Vérifier si l'utilisateur est authentifié
export const isGoogleAuthenticated = () => {
  const tokenData = localStorage.getItem('google_calendar_token')
  if (!tokenData) return false

  try {
    const token = JSON.parse(tokenData)
    if (token.expires_at < Date.now()) {
      localStorage.removeItem('google_calendar_token')
      return false
    }
    return true
  } catch {
    return false
  }
}

// Obtenir le token d'accès
const getAccessToken = () => {
  const tokenData = localStorage.getItem('google_calendar_token')
  if (!tokenData) return null

  try {
    const token = JSON.parse(tokenData)
    if (token.expires_at < Date.now()) {
      localStorage.removeItem('google_calendar_token')
      return null
    }
    return token.access_token
  } catch {
    return null
  }
}

// Créer un événement dans Google Calendar
export const createCalendarEvent = async (relance) => {
  try {
    const token = getAccessToken()
    if (!token) {
      throw new Error('Not authenticated with Google Calendar')
    }

    const eventDate = new Date(relance.date)
    const eventEndDate = new Date(eventDate)
    eventEndDate.setHours(eventEndDate.getHours() + 1) // Durée de 1 heure

    const event = {
      summary: `Relance: ${relance.entreprise || 'Candidature'}`,
      description: `Relance pour le poste de ${relance.poste || 'N/A'}\n\nType: ${relance.type || 'Email'}\n${relance.note ? `Note: ${relance.note}` : ''}`,
      start: {
        dateTime: eventDate.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: eventEndDate.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 jour avant
          { method: 'popup', minutes: 60 }, // 1 heure avant
        ],
      },
      colorId: '11', // Orange
    }

    const response = await window.gapi.client.calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    })

    return response.result
  } catch (error) {
    console.error('Error creating calendar event:', error)
    throw error
  }
}

// Mettre à jour un événement
export const updateCalendarEvent = async (eventId, relance) => {
  try {
    const token = getAccessToken()
    if (!token) {
      throw new Error('Not authenticated with Google Calendar')
    }

    const eventDate = new Date(relance.date)
    const eventEndDate = new Date(eventDate)
    eventEndDate.setHours(eventEndDate.getHours() + 1)

    const event = {
      summary: `Relance: ${relance.entreprise || 'Candidature'}`,
      description: `Relance pour le poste de ${relance.poste || 'N/A'}\n\nType: ${relance.type || 'Email'}\n${relance.note ? `Note: ${relance.note}` : ''}`,
      start: {
        dateTime: eventDate.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: eventEndDate.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    }

    const response = await window.gapi.client.calendar.events.update({
      calendarId: 'primary',
      eventId: eventId,
      resource: event,
    })

    return response.result
  } catch (error) {
    console.error('Error updating calendar event:', error)
    throw error
  }
}

// Supprimer un événement
export const deleteCalendarEvent = async (eventId) => {
  try {
    const token = getAccessToken()
    if (!token) {
      throw new Error('Not authenticated with Google Calendar')
    }

    await window.gapi.client.calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId,
    })

    return true
  } catch (error) {
    console.error('Error deleting calendar event:', error)
    throw error
  }
}

// Déconnecter Google Calendar
export const disconnectGoogleCalendar = () => {
  localStorage.removeItem('google_calendar_token')
  if (window.google?.accounts?.oauth2) {
    window.google.accounts.oauth2.revoke(getAccessToken(), () => {})
  }
}

// Générer un lien iCal pour d'autres calendriers (Outlook, Apple Calendar, etc.)
export const generateICalLink = (relance) => {
  const eventDate = new Date(relance.date)
  const eventEndDate = new Date(eventDate)
  eventEndDate.setHours(eventEndDate.getHours() + 1)

  const formatDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }

  const ical = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BeCandidature//Relance//FR',
    'BEGIN:VEVENT',
    `UID:relance-${relance.id || Date.now()}@becandidature.com`,
    `DTSTART:${formatDate(eventDate)}`,
    `DTEND:${formatDate(eventEndDate)}`,
    `SUMMARY:Relance: ${relance.entreprise || 'Candidature'}`,
    `DESCRIPTION:Relance pour le poste de ${relance.poste || 'N/A'}\\n\\nType: ${relance.type || 'Email'}\\n${relance.note ? `Note: ${relance.note}` : ''}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n')

  const blob = new Blob([ical], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  
  return url
}


