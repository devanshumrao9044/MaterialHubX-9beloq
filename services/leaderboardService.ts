import { getSupabaseClient } from '@/template';

export interface LeaderboardEntry {
  user_id: string;
  username: string;
  email: string;
  total_xp: number;
  rank: number;
}

class LeaderboardService {
  /**
   * Get global leaderboard with all users
   */
  async getGlobalLeaderboard(limit: number = 100) {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase.rpc('get_global_leaderboard', {
      limit_count: limit,
    });

    return { 
      data: data as LeaderboardEntry[] | null, 
      error 
    };
  }

  /**
   * Get user's rank and position
   */
  async getUserRank(userId: string) {
    const { data: leaderboard, error } = await this.getGlobalLeaderboard(1000);
    
    if (error || !leaderboard) {
      return { rank: null, total: 0, error };
    }

    const userEntry = leaderboard.find(entry => entry.user_id === userId);
    
    return {
      rank: userEntry?.rank || null,
      total: leaderboard.length,
      xp: userEntry?.total_xp || 0,
      error: null,
    };
  }

  /**
   * Get top N users
   */
  async getTopUsers(count: number = 10) {
    return this.getGlobalLeaderboard(count);
  }
}

export const leaderboardService = new LeaderboardService();
