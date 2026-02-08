import { getSupabaseClient } from '@/template';

export interface VideoXPTracker {
  startTracking: (userId: string, materialId: string) => void;
  stopTracking: () => Promise<void>;
  getCurrentWatchTime: () => number;
}

class VideoService {
  private trackingInterval: NodeJS.Timeout | null = null;
  private startTime: number = 0;
  private accumulatedSeconds: number = 0;
  private currentUserId: string | null = null;
  private currentMaterialId: string | null = null;
  private isTracking: boolean = false;

  /**
   * Start tracking video watch time for XP
   * Awards 1 XP every 2 minutes (120 seconds) of active watching
   */
  startTracking(userId: string, materialId: string): void {
    if (this.isTracking) {
      console.warn('Already tracking, stopping previous session');
      this.stopTracking();
    }

    this.currentUserId = userId;
    this.currentMaterialId = materialId;
    this.startTime = Date.now();
    this.accumulatedSeconds = 0;
    this.isTracking = true;

    // Track every 30 seconds to ensure accurate XP calculation
    this.trackingInterval = setInterval(() => {
      this.updateWatchTime();
    }, 30000); // 30 seconds

    console.log(`Started XP tracking for material ${materialId}`);
  }

  /**
   * Stop tracking and save final watch time
   */
  async stopTracking(): Promise<void> {
    if (!this.isTracking) return;

    // Clear interval
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
      this.trackingInterval = null;
    }

    // Calculate final watch time
    const currentSeconds = Math.floor((Date.now() - this.startTime) / 1000);
    this.accumulatedSeconds += currentSeconds;

    // Award XP if we have accumulated watch time
    if (this.accumulatedSeconds > 0 && this.currentUserId && this.currentMaterialId) {
      await this.awardXP(this.currentUserId, this.currentMaterialId, this.accumulatedSeconds);
    }

    // Reset state
    this.isTracking = false;
    this.startTime = 0;
    this.accumulatedSeconds = 0;
    this.currentUserId = null;
    this.currentMaterialId = null;

    console.log('Stopped XP tracking');
  }

  /**
   * Update watch time and award XP
   */
  private async updateWatchTime(): Promise<void> {
    if (!this.isTracking || !this.currentUserId || !this.currentMaterialId) return;

    const currentSeconds = Math.floor((Date.now() - this.startTime) / 1000);
    this.accumulatedSeconds += currentSeconds;
    this.startTime = Date.now(); // Reset start time for next interval

    // Award XP every 120 seconds
    if (this.accumulatedSeconds >= 120) {
      await this.awardXP(this.currentUserId, this.currentMaterialId, this.accumulatedSeconds);
      this.accumulatedSeconds = 0; // Reset after awarding
    }
  }

  /**
   * Award XP to user via backend function
   */
  private async awardXP(userId: string, materialId: string, watchSeconds: number): Promise<void> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.rpc('award_video_xp', {
        p_user_id: userId,
        p_material_id: materialId,
        p_watch_seconds: watchSeconds,
      });

      if (error) {
        console.error('Error awarding XP:', error);
        return;
      }

      if (data && data.xp_awarded > 0) {
        console.log(`Awarded ${data.xp_awarded} XP! Total XP: ${data.total_xp}`);
      }
    } catch (error) {
      console.error('Failed to award XP:', error);
    }
  }

  /**
   * Get current accumulated watch time (for debugging)
   */
  getCurrentWatchTime(): number {
    if (!this.isTracking) return 0;
    const currentSeconds = Math.floor((Date.now() - this.startTime) / 1000);
    return this.accumulatedSeconds + currentSeconds;
  }

  /**
   * Pause tracking (when video is paused)
   */
  pauseTracking(): void {
    if (!this.isTracking) return;

    const currentSeconds = Math.floor((Date.now() - this.startTime) / 1000);
    this.accumulatedSeconds += currentSeconds;
    this.isTracking = false;

    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
      this.trackingInterval = null;
    }

    console.log('Paused XP tracking');
  }

  /**
   * Resume tracking (when video plays again)
   */
  resumeTracking(): void {
    if (this.isTracking || !this.currentUserId || !this.currentMaterialId) return;

    this.startTime = Date.now();
    this.isTracking = true;

    this.trackingInterval = setInterval(() => {
      this.updateWatchTime();
    }, 30000);

    console.log('Resumed XP tracking');
  }
}

export const videoService = new VideoService();
