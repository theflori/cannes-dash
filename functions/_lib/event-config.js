// deploy-marker event-config-v1
// Single source of truth for event details. Hardcoded for the May 2026 Cannes event.
// When we move to multi-event later, this becomes a lookup table or Airtable read.

export const EVENT = {
  name: 'Château Privé',
  dateLabel: 'Friday, 15 May 2026',
  dateIso: '2026-05-15',
  doorsOpen: '16:00',
  mainWave: '17:00',
  closing: '04:00',
  timezone: 'Europe/Paris',

  // Location revealed in confirmation email — keep precise
  location: {
    name: 'Cannes Californie',
    addressLine1: '[Address revealed in confirmation email]',
    city: 'Cannes',
    country: 'France',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Cannes+Californie'
  },

  dressCode: 'Refined evening — elegance over formality. No logos, no streetwear.',

  // Used as fallback if env.PUBLIC_SITE_URL is missing
  dashboardUrl: 'https://cannes-dash.pages.dev'
};

// Helper to get the dashboard URL with fallback chain
export function getDashboardUrl(env) {
  return (env.PUBLIC_SITE_URL || env.DASHBOARD_PUBLIC_URL || EVENT.dashboardUrl).replace(/\/$/, '');
}
