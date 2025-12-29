import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type ChatbotFlow = Tables<'chatbot_flows'>;
export type FlowQuestion = Tables<'flow_questions'>;

export function useFlow() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const flowQuery = useQuery({
    queryKey: ['flow', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chatbot_flows')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const questionsQuery = useQuery({
    queryKey: ['flow-questions', flowQuery.data?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('flow_questions')
        .select('*')
        .eq('flow_id', flowQuery.data!.id)
        .order('order_index');

      if (error) throw error;
      return data;
    },
    enabled: !!flowQuery.data?.id,
  });

  const updateFlow = useMutation({
    mutationFn: async (updates: TablesUpdate<'chatbot_flows'>) => {
      const { data, error } = await supabase
        .from('chatbot_flows')
        .update(updates)
        .eq('id', flowQuery.data!.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flow'] });
      toast.success('Flow updated');
    },
    onError: (error) => {
      toast.error('Failed to update flow: ' + error.message);
    },
  });

  const addQuestion = useMutation({
    mutationFn: async (question: Omit<TablesInsert<'flow_questions'>, 'flow_id'>) => {
      const { data, error } = await supabase
        .from('flow_questions')
        .insert({ ...question, flow_id: flowQuery.data!.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flow-questions'] });
      toast.success('Question added');
    },
    onError: (error) => {
      toast.error('Failed to add question: ' + error.message);
    },
  });

  const updateQuestion = useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<'flow_questions'> & { id: string }) => {
      const { data, error } = await supabase
        .from('flow_questions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flow-questions'] });
      toast.success('Question updated');
    },
    onError: (error) => {
      toast.error('Failed to update question: ' + error.message);
    },
  });

  const deleteQuestion = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('flow_questions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flow-questions'] });
      toast.success('Question deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete question: ' + error.message);
    },
  });

  const reorderQuestions = useMutation({
    mutationFn: async (questions: { id: string; order_index: number }[]) => {
      const updates = questions.map(q => 
        supabase
          .from('flow_questions')
          .update({ order_index: q.order_index })
          .eq('id', q.id)
      );
      
      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flow-questions'] });
    },
  });

  return {
    flow: flowQuery.data,
    flowLoading: flowQuery.isLoading,
    questions: questionsQuery.data ?? [],
    questionsLoading: questionsQuery.isLoading,
    updateFlow,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    reorderQuestions,
  };
}