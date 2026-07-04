export const API_VERSION = '1.0' as const;

export const INFERENCE_SCOPES = ['day', 'week', 'year', 'lifetime'] as const;

export const BASIS_TYPES = [
  'classic',
  'chart_step',
  'fiction_mapping',
  'user_input',
] as const;

export const ERROR_CODES = {
  MISSING_BIRTH_HOUR: 'MISSING_BIRTH_HOUR',
  INVALID_SCOPE: 'INVALID_SCOPE',
  INSUFFICIENT_CREDITS: 'INSUFFICIENT_CREDITS',
  NOT_IMPLEMENTED: 'NOT_IMPLEMENTED',
  PROFILE_NOT_FOUND: 'PROFILE_NOT_FOUND',
  REPORT_NOT_FOUND: 'REPORT_NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const;
