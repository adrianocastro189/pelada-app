import type { CreateProfileUseCase } from '@application/use-cases/profile/CreateProfileUseCase'
import type { DeleteProfileUseCase } from '@application/use-cases/profile/DeleteProfileUseCase'
import type { GetProfileUseCase } from '@application/use-cases/profile/GetProfileUseCase'
import type { ListProfilesUseCase } from '@application/use-cases/profile/ListProfilesUseCase'
import type { UpdateProfileUseCase } from '@application/use-cases/profile/UpdateProfileUseCase'
import type { CreatePlayerUseCase } from '@application/use-cases/player/CreatePlayerUseCase'
import type { DeactivatePlayerUseCase } from '@application/use-cases/player/DeactivatePlayerUseCase'
import type { GetPlayerUseCase } from '@application/use-cases/player/GetPlayerUseCase'
import type { ListPlayersUseCase } from '@application/use-cases/player/ListPlayersUseCase'
import type { ReactivatePlayerUseCase } from '@application/use-cases/player/ReactivatePlayerUseCase'
import type { SearchPlayersUseCase } from '@application/use-cases/player/SearchPlayersUseCase'
import type { UpdatePlayerUseCase } from '@application/use-cases/player/UpdatePlayerUseCase'
import type { ClonePeladaUseCase } from '@application/use-cases/pelada/ClonePeladaUseCase'
import type { CreatePeladaUseCase } from '@application/use-cases/pelada/CreatePeladaUseCase'
import type { DeletePeladaUseCase } from '@application/use-cases/pelada/DeletePeladaUseCase'
import type { GetPeladaUseCase } from '@application/use-cases/pelada/GetPeladaUseCase'
import type { ListPeladasUseCase } from '@application/use-cases/pelada/ListPeladasUseCase'
import type { UpdatePeladaUseCase } from '@application/use-cases/pelada/UpdatePeladaUseCase'
import type { AddToRosterUseCase } from '@application/use-cases/roster/AddToRosterUseCase'
import type { GetRosterUseCase } from '@application/use-cases/roster/GetRosterUseCase'
import type { RemoveFromRosterUseCase } from '@application/use-cases/roster/RemoveFromRosterUseCase'
import type { SetPlayerPaidUseCase } from '@application/use-cases/roster/SetPlayerPaidUseCase'
import type { DrawTeamsUseCase } from '@application/use-cases/draw/DrawTeamsUseCase'
import type { GetDrawUseCase } from '@application/use-cases/draw/GetDrawUseCase'
import type { CreateFinancialRecordUseCase } from '@application/use-cases/financial/CreateFinancialRecordUseCase'
import type { DeleteFinancialRecordUseCase } from '@application/use-cases/financial/DeleteFinancialRecordUseCase'
import type { GetBalancesUseCase } from '@application/use-cases/financial/GetBalancesUseCase'
import type { GetDescriptionSuggestionsUseCase } from '@application/use-cases/financial/GetDescriptionSuggestionsUseCase'
import type { ListFinancialRecordsUseCase } from '@application/use-cases/financial/ListFinancialRecordsUseCase'
import type { UpdateFinancialRecordUseCase } from '@application/use-cases/financial/UpdateFinancialRecordUseCase'
import type { AllocateDeltaUseCase } from '@application/use-cases/subcaixinha/AllocateDeltaUseCase'
import type { CreateSubcaixinhaUseCase } from '@application/use-cases/subcaixinha/CreateSubcaixinhaUseCase'
import type { DeleteSubcaixinhaUseCase } from '@application/use-cases/subcaixinha/DeleteSubcaixinhaUseCase'
import type { ListSubcaixinhasUseCase } from '@application/use-cases/subcaixinha/ListSubcaixinhasUseCase'
import type { UpdateSubcaixinhaUseCase } from '@application/use-cases/subcaixinha/UpdateSubcaixinhaUseCase'

/** All use cases exposed to the React tree. */
export interface AppContextValue {
  // Profile
  createProfile: CreateProfileUseCase
  deleteProfile: DeleteProfileUseCase
  getProfile: GetProfileUseCase
  listProfiles: ListProfilesUseCase
  updateProfile: UpdateProfileUseCase

  // Player
  createPlayer: CreatePlayerUseCase
  deactivatePlayer: DeactivatePlayerUseCase
  getPlayer: GetPlayerUseCase
  listPlayers: ListPlayersUseCase
  reactivatePlayer: ReactivatePlayerUseCase
  searchPlayers: SearchPlayersUseCase
  updatePlayer: UpdatePlayerUseCase

  // Pelada
  clonePelada: ClonePeladaUseCase
  createPelada: CreatePeladaUseCase
  deletePelada: DeletePeladaUseCase
  getPelada: GetPeladaUseCase
  listPeladas: ListPeladasUseCase
  updatePelada: UpdatePeladaUseCase

  // Roster
  addToRoster: AddToRosterUseCase
  getRoster: GetRosterUseCase
  removeFromRoster: RemoveFromRosterUseCase
  setPlayerPaid: SetPlayerPaidUseCase

  // Draw
  drawTeams: DrawTeamsUseCase
  getDraw: GetDrawUseCase

  // Financial
  createFinancialRecord: CreateFinancialRecordUseCase
  deleteFinancialRecord: DeleteFinancialRecordUseCase
  getBalances: GetBalancesUseCase
  getDescriptionSuggestions: GetDescriptionSuggestionsUseCase
  listFinancialRecords: ListFinancialRecordsUseCase
  updateFinancialRecord: UpdateFinancialRecordUseCase

  // Subcaixinha
  allocateDelta: AllocateDeltaUseCase
  createSubcaixinha: CreateSubcaixinhaUseCase
  deleteSubcaixinha: DeleteSubcaixinhaUseCase
  listSubcaixinhas: ListSubcaixinhasUseCase
  updateSubcaixinha: UpdateSubcaixinhaUseCase

  // Session
  logout: () => void
}

// eslint-disable-next-line react-refresh/only-export-components
export { useApp, AppProvider, AppContext } from './AppContext.internal'
