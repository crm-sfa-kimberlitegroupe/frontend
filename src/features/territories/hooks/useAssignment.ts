import { useState } from 'react';

const showSuccess = (message: string) => alert(message);
const showError = (message: string) => alert(`Erreur: ${message}`);

interface UseAssignmentOptions {
  onSuccess: () => void;
}

export function useAssignment({ onSuccess }: UseAssignmentOptions) {
  const [loading, setLoading] = useState(false);

  const executeAssignment = async <T>(
    assignmentFn: () => Promise<T>,
    successMessage: string,
    resetFn?: () => void
  ) => {
    try {
      setLoading(true);
      await assignmentFn();
      showSuccess(successMessage);
      if (resetFn) {
        resetFn();
      }
      onSuccess();
    } catch (error: unknown) {
      console.error('Erreur assignation:', error);
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        : 'Erreur lors de l\'assignation';
      showError(errorMessage || 'Erreur lors de l\'assignation');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    executeAssignment,
  };
}
