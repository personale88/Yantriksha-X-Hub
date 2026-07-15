import { query } from './db';

export interface TeamCompliance {
  teamId: number;
  teamName: string;
  sector: string;
  leaderId: number;
  currentStage: number;
  memberCount: number;
  hasEngineering: boolean;
  hasLaw: boolean;
  hasBusiness: boolean;
  hasFacultyAdvisor: boolean;
  compliancePercentage: number;
  errors: string[];
}

/**
 * Calculates compliance details and percentage for a given team.
 */
export async function getTeamCompliance(teamId: number): Promise<TeamCompliance | null> {
  const teams = await query(
    'SELECT id, team_name, sector, leader_id, current_stage FROM teams WHERE id = ?',
    [teamId]
  );

  if (!teams || teams.length === 0) {
    return null;
  }

  const team = teams[0];

  // Retrieve all members of the team, including the leader
  const members = await query(
    `SELECT id, name, role, discipline FROM users WHERE id = ?
     UNION
     SELECT u.id, u.name, u.role, u.discipline FROM team_members tm 
     JOIN users u ON tm.user_id = u.id 
     WHERE tm.team_id = ?`,
    [team.leader_id, teamId]
  );

  let hasEngineering = false;
  let hasLaw = false;
  let hasBusiness = false;
  let hasFacultyAdvisor = false;

  members.forEach((m: any) => {
    if (m.role === 'faculty') {
      hasFacultyAdvisor = true;
    }
    if (m.discipline === 'engineering') {
      hasEngineering = true;
    } else if (m.discipline === 'law') {
      hasLaw = true;
    } else if (m.discipline === 'business') {
      hasBusiness = true;
    }
  });

  const memberCount = members.length;
  const errors: string[] = [];

  if (!hasEngineering) {
    errors.push('Team must have at least one Engineering student.');
  }
  if (!hasLaw) {
    errors.push('Team must have at least one Law student.');
  }
  if (!hasBusiness) {
    errors.push('Team must have at least one Business (MBA) student.');
  }
  if (!hasFacultyAdvisor) {
    errors.push('Team must have at least one Faculty Advisor.');
  }
  if (memberCount !== 10) {
    errors.push(`Team must have exactly 10 members (currently has ${memberCount}).`);
  }

  // Each rule constitutes 20% of the compliance score
  let score = 0;
  if (hasEngineering) score += 20;
  if (hasLaw) score += 20;
  if (hasBusiness) score += 20;
  if (hasFacultyAdvisor) score += 20;
  if (memberCount === 10) score += 20;

  return {
    teamId: team.id,
    teamName: team.team_name,
    sector: team.sector,
    leaderId: team.leader_id,
    currentStage: team.current_stage,
    memberCount,
    hasEngineering,
    hasLaw,
    hasBusiness,
    hasFacultyAdvisor,
    compliancePercentage: score,
    errors
  };
}
