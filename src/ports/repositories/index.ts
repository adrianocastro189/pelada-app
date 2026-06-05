// Repository port interfaces — ProfileRepository, PlayerRepository, PeladaRepository, etc.
// These are the contracts that infrastructure adapters must implement.

export type { DrawAssignmentRepository, DrawAssignmentRecord } from './DrawAssignmentRepository';
export type { FinancialRecordRepository, FinancialRecordRecord, CreateFinancialRecordInput, UpdateFinancialRecordInput } from './FinancialRecordRepository';
export type { PeladaPlayerRepository, PeladaPlayerRecord } from './PeladaPlayerRepository';
export type { PeladaRepository, PeladaRecord, CreatePeladaInput, UpdatePeladaInput } from './PeladaRepository';
export type { PeladaTeamRepository, PeladaTeamRecord } from './PeladaTeamRepository';
export type { PlayerRepository, PlayerRecord, CreatePlayerInput, UpdatePlayerInput } from './PlayerRepository';
export type { ProfileRepository, ProfileRecord } from './ProfileRepository';
export type { SubcaixinhaRepository, SubcaixinhaRecord, CreateSubcaixinhaInput, UpdateSubcaixinhaInput } from './SubcaixinhaRepository';
