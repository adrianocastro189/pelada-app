import { NeonSqlExecutor } from '@infrastructure/db/NeonSqlExecutor'
import { PostgresDrawAssignmentRepository } from '@infrastructure/db/repositories/PostgresDrawAssignmentRepository'
import { PostgresFinancialRecordRepository } from '@infrastructure/db/repositories/PostgresFinancialRecordRepository'
import { PostgresPeladaPlayerRepository } from '@infrastructure/db/repositories/PostgresPeladaPlayerRepository'
import { PostgresPeladaRepository } from '@infrastructure/db/repositories/PostgresPeladaRepository'
import { PostgresPeladaTeamRepository } from '@infrastructure/db/repositories/PostgresPeladaTeamRepository'
import { PostgresPlayerRepository } from '@infrastructure/db/repositories/PostgresPlayerRepository'
import { PostgresProfileRepository } from '@infrastructure/db/repositories/PostgresProfileRepository'
import { PostgresSubcaixinhaRepository } from '@infrastructure/db/repositories/PostgresSubcaixinhaRepository'

import { BalanceCalculator } from '@domain/services/BalanceCalculator'
import { SubcaixinhaBalancer } from '@domain/services/SubcaixinhaBalancer'
import { TeamDrawService } from '@domain/services/TeamDrawService'
import { TotalStarsStrategy } from '@domain/services/BalancingStrategy'

import { SystemRandomSource } from '@infrastructure/random/SystemRandomSource'

import { CreateProfileUseCase } from '@application/use-cases/profile/CreateProfileUseCase'
import { DeleteProfileUseCase } from '@application/use-cases/profile/DeleteProfileUseCase'
import { GetProfileUseCase } from '@application/use-cases/profile/GetProfileUseCase'
import { ListProfilesUseCase } from '@application/use-cases/profile/ListProfilesUseCase'
import { UpdateProfileUseCase } from '@application/use-cases/profile/UpdateProfileUseCase'

import { CreatePlayerUseCase } from '@application/use-cases/player/CreatePlayerUseCase'
import { DeactivatePlayerUseCase } from '@application/use-cases/player/DeactivatePlayerUseCase'
import { GetPlayerUseCase } from '@application/use-cases/player/GetPlayerUseCase'
import { ListPlayersUseCase } from '@application/use-cases/player/ListPlayersUseCase'
import { ReactivatePlayerUseCase } from '@application/use-cases/player/ReactivatePlayerUseCase'
import { SearchPlayersUseCase } from '@application/use-cases/player/SearchPlayersUseCase'
import { UpdatePlayerUseCase } from '@application/use-cases/player/UpdatePlayerUseCase'

import { ClonePeladaUseCase } from '@application/use-cases/pelada/ClonePeladaUseCase'
import { CreatePeladaUseCase } from '@application/use-cases/pelada/CreatePeladaUseCase'
import { DeletePeladaUseCase } from '@application/use-cases/pelada/DeletePeladaUseCase'
import { GetPeladaUseCase } from '@application/use-cases/pelada/GetPeladaUseCase'
import { ListPeladasUseCase } from '@application/use-cases/pelada/ListPeladasUseCase'
import { UpdatePeladaUseCase } from '@application/use-cases/pelada/UpdatePeladaUseCase'

import { AddToRosterUseCase } from '@application/use-cases/roster/AddToRosterUseCase'
import { GetRosterUseCase } from '@application/use-cases/roster/GetRosterUseCase'
import { RemoveFromRosterUseCase } from '@application/use-cases/roster/RemoveFromRosterUseCase'
import { SetPlayerPaidUseCase } from '@application/use-cases/roster/SetPlayerPaidUseCase'

import { DrawTeamsUseCase } from '@application/use-cases/draw/DrawTeamsUseCase'
import { GetDrawUseCase } from '@application/use-cases/draw/GetDrawUseCase'

import { CreateFinancialRecordUseCase } from '@application/use-cases/financial/CreateFinancialRecordUseCase'
import { DeleteFinancialRecordUseCase } from '@application/use-cases/financial/DeleteFinancialRecordUseCase'
import { GetBalancesUseCase } from '@application/use-cases/financial/GetBalancesUseCase'
import { GetDescriptionSuggestionsUseCase } from '@application/use-cases/financial/GetDescriptionSuggestionsUseCase'
import { ListFinancialRecordsUseCase } from '@application/use-cases/financial/ListFinancialRecordsUseCase'
import { UpdateFinancialRecordUseCase } from '@application/use-cases/financial/UpdateFinancialRecordUseCase'

import { AllocateDeltaUseCase } from '@application/use-cases/subcaixinha/AllocateDeltaUseCase'
import { CreateSubcaixinhaUseCase } from '@application/use-cases/subcaixinha/CreateSubcaixinhaUseCase'
import { DeleteSubcaixinhaUseCase } from '@application/use-cases/subcaixinha/DeleteSubcaixinhaUseCase'
import { ListSubcaixinhasUseCase } from '@application/use-cases/subcaixinha/ListSubcaixinhasUseCase'
import { UpdateSubcaixinhaUseCase } from '@application/use-cases/subcaixinha/UpdateSubcaixinhaUseCase'

import { SessionManager } from '@infrastructure/session'
import type { AppContextValue } from '@ui/AppContext'

/**
 * Wires all concrete adapters to ports and instantiates the full use-case graph.
 * This is the ONLY module that imports from @infrastructure/*.
 *
 * @param connectionString  Neon connection string built from user password.
 * @returns AppContextValue ready to be passed to AppContext.Provider.
 */
export function createCompositionRoot(connectionString: string): AppContextValue & {
  dispose: () => Promise<void>
} {
  // 1. SQL executor
  const executor = new NeonSqlExecutor(connectionString)

  // 2. Repositories (alphabetical)
  const drawAssignmentRepo = new PostgresDrawAssignmentRepository(executor)
  const financialRecordRepo = new PostgresFinancialRecordRepository(executor)
  const peladaPlayerRepo = new PostgresPeladaPlayerRepository(executor)
  const peladaRepo = new PostgresPeladaRepository(executor)
  const peladaTeamRepo = new PostgresPeladaTeamRepository(executor)
  const playerRepo = new PostgresPlayerRepository(executor)
  const profileRepo = new PostgresProfileRepository(executor)
  const subcaixinhaRepo = new PostgresSubcaixinhaRepository(executor)

  // 3. Domain services
  const balanceCalculator = new BalanceCalculator()
  const drawService = new TeamDrawService()
  const randomSource = new SystemRandomSource()
  const subcaixinhaBalancer = new SubcaixinhaBalancer()
  const balancingStrategy = new TotalStarsStrategy()

  // 4. Use cases (alphabetical by group)

  // Profile
  const createProfile = new CreateProfileUseCase(profileRepo)
  const deleteProfile = new DeleteProfileUseCase(profileRepo)
  const getProfile = new GetProfileUseCase(profileRepo)
  const listProfiles = new ListProfilesUseCase(profileRepo)
  const updateProfile = new UpdateProfileUseCase(profileRepo)

  // Player
  const createPlayer = new CreatePlayerUseCase(playerRepo)
  const deactivatePlayer = new DeactivatePlayerUseCase(playerRepo)
  const getPlayer = new GetPlayerUseCase(playerRepo)
  const listPlayers = new ListPlayersUseCase(playerRepo)
  const reactivatePlayer = new ReactivatePlayerUseCase(playerRepo)
  const searchPlayers = new SearchPlayersUseCase(playerRepo)
  const updatePlayer = new UpdatePlayerUseCase(playerRepo)

  // Pelada
  const clonePelada = new ClonePeladaUseCase(peladaRepo, peladaTeamRepo)
  const createPelada = new CreatePeladaUseCase(peladaRepo, peladaTeamRepo)
  const deletePelada = new DeletePeladaUseCase(peladaRepo)
  const getPelada = new GetPeladaUseCase(peladaRepo)
  const listPeladas = new ListPeladasUseCase(peladaRepo)
  const updatePelada = new UpdatePeladaUseCase(peladaRepo)

  // Roster
  const addToRoster = new AddToRosterUseCase(peladaRepo, peladaPlayerRepo)
  const getRoster = new GetRosterUseCase(peladaPlayerRepo)
  const removeFromRoster = new RemoveFromRosterUseCase(peladaPlayerRepo)
  const setPlayerPaid = new SetPlayerPaidUseCase(peladaPlayerRepo)

  // Draw
  const drawTeams = new DrawTeamsUseCase(
    peladaRepo,
    peladaTeamRepo,
    peladaPlayerRepo,
    playerRepo,
    drawAssignmentRepo,
    drawService,
    randomSource,
    balancingStrategy,
  )
  const getDraw = new GetDrawUseCase(peladaTeamRepo, drawAssignmentRepo)

  // Financial
  const createFinancialRecord = new CreateFinancialRecordUseCase(financialRecordRepo)
  const deleteFinancialRecord = new DeleteFinancialRecordUseCase(financialRecordRepo)
  const getBalances = new GetBalancesUseCase(financialRecordRepo, balanceCalculator)
  const getDescriptionSuggestions = new GetDescriptionSuggestionsUseCase(financialRecordRepo)
  const listFinancialRecords = new ListFinancialRecordsUseCase(financialRecordRepo)
  const updateFinancialRecord = new UpdateFinancialRecordUseCase(financialRecordRepo)

  // Subcaixinha
  const allocateDelta = new AllocateDeltaUseCase(
    subcaixinhaRepo,
    financialRecordRepo,
    balanceCalculator,
    subcaixinhaBalancer,
  )
  const createSubcaixinha = new CreateSubcaixinhaUseCase(subcaixinhaRepo)
  const deleteSubcaixinha = new DeleteSubcaixinhaUseCase(subcaixinhaRepo)
  const listSubcaixinhas = new ListSubcaixinhasUseCase(subcaixinhaRepo)
  const updateSubcaixinha = new UpdateSubcaixinhaUseCase(subcaixinhaRepo)

  // 5. logout helper
  const logout = () => {
    SessionManager.clear()
    window.location.reload()
  }

  return {
    // Profile
    createProfile,
    deleteProfile,
    getProfile,
    listProfiles,
    updateProfile,

    // Player
    createPlayer,
    deactivatePlayer,
    getPlayer,
    listPlayers,
    reactivatePlayer,
    searchPlayers,
    updatePlayer,

    // Pelada
    clonePelada,
    createPelada,
    deletePelada,
    getPelada,
    listPeladas,
    updatePelada,

    // Roster
    addToRoster,
    getRoster,
    removeFromRoster,
    setPlayerPaid,

    // Draw
    drawTeams,
    getDraw,

    // Financial
    createFinancialRecord,
    deleteFinancialRecord,
    getBalances,
    getDescriptionSuggestions,
    listFinancialRecords,
    updateFinancialRecord,

    // Subcaixinha
    allocateDelta,
    createSubcaixinha,
    deleteSubcaixinha,
    listSubcaixinhas,
    updateSubcaixinha,

    // Session
    logout,

    // Cleanup
    dispose: () => Promise.resolve(),
  }
}
