export const DIFFICULTY_LEVELS_KEYS = {
 EASY: 'EASY',
 MEDIUM: 'MEDIUM',
 HARD: 'HARD',
} as const;

export const DIFFICULTY_LEVELS = {
 EASY: { label: DIFFICULTY_LEVELS_KEYS.EASY, turnTimeSeconds: 60 },
 MEDIUM: { label: DIFFICULTY_LEVELS_KEYS.MEDIUM, turnTimeSeconds: 30 },
 HARD: { label: DIFFICULTY_LEVELS_KEYS.HARD, turnTimeSeconds: 15 },
} as const;

export type DifficultyLevel = keyof typeof DIFFICULTY_LEVELS_KEYS;


export const DEFAULT_BOARD_CONFIG = {
 rows: 6,
 columns: 7,
 connectCount: 4,
};

export const BOARD_LIMITS = {
 minRows: 4,
 maxRows: 20,
 minColumns: 4,
 maxColumns: 20,
 minConnect: 3,
 maxConnect: 10,
};
