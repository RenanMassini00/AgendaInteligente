import { api } from './api'
import type { ProfessionalTeamEmployee } from '../types/professional-team.types'

export function getProfessionalTeamEmployees(ownerUserId: number) {
  return api.get<ProfessionalTeamEmployee[]>(
    `/api/professional-team/employees?ownerUserId=${ownerUserId}`
  )
}
