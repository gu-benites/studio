/**
 * Storage bucket names
 */
export const STORAGE_BUCKETS = {
  ESSENTIAL_OILS: 'essential-oils',
  USER_AVATARS: 'user-avatars',
  RECIPE_IMAGES: 'recipe-images',
} as const;

/**
 * Database table names
 */
export const TABLES = {
  ESSENTIAL_OILS: 'essential_oils',
  USERS: 'users',
  RECIPES: 'recipes',
  THERAPEUTIC_PROPERTIES: 'therapeutic_properties',
  ESSENTIAL_OIL_THERAPEUTIC_PROPERTIES: 'essential_oil_therapeutic_properties',
} as const;

/**
 * RLS (Row Level Security) policies
 */
export const RLS_POLICIES = {
  // Public read access to essential oils
  ENABLE_ESSENTIAL_OILS_READ_ACCESS: 'Enable read access for essential oils',
  
  // User-specific policies
  ENABLE_USER_OWNERSHIP: 'Enable users to manage their own data',
  
  // Admin policies
  ENABLE_ADMIN_ACCESS: 'Enable admin access to all data',
} as const;

/**
 * Authentication events
 */
export const AUTH_EVENTS = {
  SIGNED_IN: 'SIGNED_IN',
  USER_UPDATED: 'USER_UPDATED',
  SIGNED_OUT: 'SIGNED_OUT',
  TOKEN_REFRESHED: 'TOKEN_REFRESHED',
  USER_DELETED: 'USER_DELETED',
} as const;
