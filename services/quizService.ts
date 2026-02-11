import { getSupabaseClient } from '@/template';

export interface Quiz {
  id: string;
  title: string;
  description: string | null;
  batch_id: string | null;
  subject: string | null;
  difficulty: 'easy' | 'medium' | 'hard';
  time_limit_minutes: number | null;
  total_marks: number;
  pass_marks: number;
  is_active: boolean;
  quiz_type: 'practice' | 'test' | 'battleground';
  created_at: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'A' | 'B' | 'C' | 'D';
  explanation: string | null;
  marks: number;
  order_number: number | null;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  user_id: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  time_taken_seconds: number | null;
  xp_earned: number;
  completed_at: string;
}

export interface BattlegroundMatch {
  id: string;
  quiz_id: string;
  player1_id: string;
  player2_id: string | null;
  player1_score: number;
  player2_score: number;
  winner_id: string | null;
  status: 'waiting' | 'active' | 'completed' | 'cancelled';
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export const quizService = {
  // Get all active quizzes
  async getQuizzes(type?: string, batchId?: string) {
    const supabase = getSupabaseClient();
    let query = supabase
      .from('quizzes')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('quiz_type', type);
    }
    if (batchId) {
      query = query.eq('batch_id', batchId);
    }

    return await query;
  },

  // Get quiz by ID with questions
  async getQuizById(quizId: string) {
    const supabase = getSupabaseClient();
    const [quizRes, questionsRes] = await Promise.all([
      supabase.from('quizzes').select('*').eq('id', quizId).single(),
      supabase
        .from('quiz_questions')
        .select('id, question_text, option_a, option_b, option_c, option_d, marks, order_number')
        .eq('quiz_id', quizId)
        .order('order_number', { ascending: true }),
    ]);

    return {
      quiz: quizRes.data,
      questions: questionsRes.data || [],
      error: quizRes.error || questionsRes.error,
    };
  },

  // Create quiz attempt
  async createAttempt(quizId: string, userId: string, totalQuestions: number) {
    const supabase = getSupabaseClient();
    return await supabase
      .from('quiz_attempts')
      .insert({
        quiz_id: quizId,
        user_id: userId,
        total_questions: totalQuestions,
      })
      .select()
      .single();
  },

  // Submit quiz answers
  async submitQuiz(attemptId: string, answers: any[]) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.rpc('submit_quiz_attempt', {
      p_attempt_id: attemptId,
      p_answers: answers,
    });

    return { data, error };
  },

  // Get user's quiz history
  async getUserAttempts(userId: string) {
    const supabase = getSupabaseClient();
    return await supabase
      .from('quiz_attempts')
      .select('*, quizzes(title, quiz_type, subject)')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });
  },

  // Create battleground match
  async createBattlegroundMatch(quizId: string, player1Id: string) {
    const supabase = getSupabaseClient();
    return await supabase
      .from('battleground_matches')
      .insert({
        quiz_id: quizId,
        player1_id: player1Id,
        status: 'waiting',
      })
      .select()
      .single();
  },

  // Join battleground match
  async joinBattlegroundMatch(matchId: string, player2Id: string) {
    const supabase = getSupabaseClient();
    return await supabase
      .from('battleground_matches')
      .update({
        player2_id: player2Id,
        status: 'active',
        started_at: new Date().toISOString(),
      })
      .eq('id', matchId)
      .eq('status', 'waiting')
      .select()
      .single();
  },

  // Get waiting battleground matches
  async getWaitingMatches(quizId?: string) {
    const supabase = getSupabaseClient();
    let query = supabase
      .from('battleground_matches')
      .select('*, quizzes(title, time_limit_minutes), user_profiles!battleground_matches_player1_id_fkey(username, email)')
      .eq('status', 'waiting')
      .order('created_at', { ascending: true });

    if (quizId) {
      query = query.eq('quiz_id', quizId);
    }

    return await query;
  },

  // Get user's battleground history
  async getUserBattles(userId: string) {
    const supabase = getSupabaseClient();
    return await supabase
      .from('battleground_matches')
      .select('*, quizzes(title)')
      .or(`player1_id.eq.${userId},player2_id.eq.${userId}`)
      .order('created_at', { ascending: false });
  },

  // Admin: Create quiz
  async createQuiz(quizData: Partial<Quiz>) {
    const supabase = getSupabaseClient();
    return await supabase.from('quizzes').insert(quizData).select().single();
  },

  // Admin: Add question to quiz
  async addQuestion(questionData: Partial<QuizQuestion>) {
    const supabase = getSupabaseClient();
    return await supabase.from('quiz_questions').insert(questionData).select().single();
  },

  // Admin: Delete quiz
  async deleteQuiz(quizId: string) {
    const supabase = getSupabaseClient();
    return await supabase.from('quizzes').delete().eq('id', quizId);
  },

  // Admin: Delete question
  async deleteQuestion(questionId: string) {
    const supabase = getSupabaseClient();
    return await supabase.from('quiz_questions').delete().eq('id', questionId);
  },

  // Admin: Get all quizzes (including inactive)
  async getAllQuizzes() {
    const supabase = getSupabaseClient();
    return await supabase
      .from('quizzes')
      .select('*, batches(name)')
      .order('created_at', { ascending: false });
  },

  // Admin: Get quiz with questions (for editing)
  async getQuizWithQuestions(quizId: string) {
    const supabase = getSupabaseClient();
    const [quizRes, questionsRes] = await Promise.all([
      supabase.from('quizzes').select('*').eq('id', quizId).single(),
      supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('order_number', { ascending: true }),
    ]);

    return {
      quiz: quizRes.data,
      questions: questionsRes.data || [],
      error: quizRes.error || questionsRes.error,
    };
  },
};
