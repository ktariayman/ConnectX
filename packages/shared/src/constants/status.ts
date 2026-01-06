// Game Status
export const GAME_STATUS = {
 WAITING: 'WAITING',
 IN_PROGRESS: 'IN_PROGRESS',
 FINISHED: 'FINISHED',
} as const;

export type GameStatus = keyof typeof GAME_STATUS;

// Cell State
export const CELL_STATE = {
 EMPTY: 'EMPTY',
 PLAYER_1: 'PLAYER_1',
 PLAYER_2: 'PLAYER_2',
} as const;

export type CellState = keyof typeof CELL_STATE;

// Player Type
export const PLAYER_TYPE = {
 PLAYER_1: 'PLAYER_1',
 PLAYER_2: 'PLAYER_2',
} as const;

export type PlayerType = keyof typeof PLAYER_TYPE;

// Game Result
export const GAME_RESULT = {
 PLAYER_1: 'PLAYER_1',
 PLAYER_2: 'PLAYER_2',
 DRAW: 'DRAW',
} as const;

export type GameResult = keyof typeof GAME_RESULT;

// Player Color
export const PLAYER_COLOR = {
 RED: 'RED',
 BLUE: 'BLUE',
} as const;

export type PlayerColor = keyof typeof PLAYER_COLOR;

