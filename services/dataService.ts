import { getSupabaseClient } from '@/template';

const supabase = getSupabaseClient();

export const dataService = {
  // Institutes
  async getInstitutes() {
    const { data, error } = await supabase
      .from('institutes')
      .select('*')
      .eq('is_active', true)
      .order('name');
    return { data, error };
  },

  // Batches
  async getBatchesByInstitute(instituteId: string) {
    const { data, error } = await supabase
      .from('batches')
      .select('*')
      .eq('institute_id', instituteId)
      .eq('is_active', true)
      .order('name');
    return { data, error };
  },

  // User Profile
  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  },

  async updateUserProfile(userId: string, updates: any) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    return { data, error };
  },

  // XP and Progress
  async updateUserXP(userId: string, xpToAdd: number) {
    const { data: profile } = await this.getUserProfile(userId);
    if (!profile) return { error: 'Profile not found' };

    const newXP = (profile.total_xp || 0) + xpToAdd;
    return await this.updateUserProfile(userId, {
      total_xp: newXP,
      last_active_at: new Date().toISOString(),
    });
  },

  async getLeaderboard(limit: number = 50) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, username, email, total_xp')
      .order('total_xp', { ascending: false })
      .limit(limit);
    return { data, error };
  },

  // Study Materials
  async getMaterialsByBatch(batchId: string) {
    const { data, error } = await supabase
      .from('study_materials')
      .select('*')
      .eq('batch_id', batchId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  // Downloads
  async trackDownload(userId: string, materialId: string) {
    const { data, error } = await supabase
      .from('downloads')
      .insert({ user_id: userId, material_id: materialId })
      .select()
      .single();
    return { data, error };
  },

  async getUserDownloads(userId: string) {
    const { data, error } = await supabase
      .from('downloads')
      .select('*, study_materials(*)')
      .eq('user_id', userId)
      .order('downloaded_at', { ascending: false });
    return { data, error };
  },

  // Doubts
  async createDoubt(userId: string, subject: string, question: string, imageUrl?: string) {
    const { data, error } = await supabase
      .from('doubts')
      .insert({
        user_id: userId,
        subject,
        question,
        image_url: imageUrl,
      })
      .select()
      .single();
    return { data, error };
  },

  async getUserDoubts(userId: string) {
    const { data, error } = await supabase
      .from('doubts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  // Bookmarks
  async addBookmark(userId: string, materialId: string) {
    const { data, error } = await supabase
      .from('bookmarks')
      .insert({ user_id: userId, material_id: materialId })
      .select()
      .single();
    return { data, error };
  },

  async removeBookmark(userId: string, materialId: string) {
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('user_id', userId)
      .eq('material_id', materialId);
    return { error };
  },

  async getUserBookmarks(userId: string) {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*, study_materials(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  // Tests
  async getTestsByBatch(batchId: string) {
    const { data, error } = await supabase
      .from('tests')
      .select('*')
      .eq('batch_id', batchId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    return { data, error };
  },
};
