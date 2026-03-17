import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { studentAPI } from '@/services/api';
import { useAuthStore } from '@/lib/store/auth-store';
import { useRouter } from 'next/navigation';

export function useStudent() {
  const { token, isAuthenticated, _hasHydrated } = useAuthStore();
  const router = useRouter();

  // Wait for store to hydrate before making API calls
  const isReady = _hasHydrated && isAuthenticated && !!token;

  const studentData = useQuery({
    queryKey: ['student', 'me'],
    queryFn: async () => {
      console.log('Fetching student data...');
      try {
        const data = await studentAPI.getStudentData();
        console.log('Student data fetched successfully');
        return data;
      } catch (error: any) {
        console.error('Error fetching student data:', error);
        console.error('Error status:', error.response?.status);
        console.error('Error data:', error.response?.data);
        throw error;
      }
    },
    enabled: isReady,
    retry: false,
  });

  const interviewStatus = useQuery({
    queryKey: ['student', 'interview-status'],
    queryFn: async () => {
      console.log('Fetching interview status...');
      try {
        const data = await studentAPI.getInterviewStatus();
        console.log('Interview status fetched successfully');
        return data;
      } catch (error: any) {
        console.error('Error fetching interview status:', error);
        console.error('Error status:', error.response?.status);
        console.error('Error data:', error.response?.data);
        throw error;
      }
    },
    enabled: isReady,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: ({ applicationId, password }: { applicationId: string; password?: string }) =>
      studentAPI.login(applicationId, password),
    onSuccess: (data) => {
      console.log('Login successful:', data);
      // Store in Zustand
      useAuthStore.getState().setAuth(data.token, data.student);
      // Also store in localStorage for compatibility
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.token);
        localStorage.setItem('student', JSON.stringify(data.student));
      }
      // Use window.location for more reliable redirect
      if (typeof window !== 'undefined') {
        console.log('Redirecting to dashboard...');
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 100);
      } else {
        router.push('/dashboard');
      }
    },
    onError: (error) => {
      console.error('Login error:', error);
    },
  });

  const logout = () => {
    useAuthStore.getState().clearAuth();
    router.push('/login');
  };

  return {
    studentData: studentData.data,
    interviewStatus: interviewStatus.data,
    isLoading: studentData.isLoading || interviewStatus.isLoading,
    isError: studentData.isError || interviewStatus.isError,
    error: studentData.error || interviewStatus.error,
    login: loginMutation.mutate,
    loginLoading: loginMutation.isPending,
    loginError: loginMutation.error,
    logout,
    refetch: () => {
      studentData.refetch();
      interviewStatus.refetch();
    },
  };
}

