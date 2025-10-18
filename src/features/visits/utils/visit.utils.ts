export const getStatusColor = (status: string): 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'gray' => {
  switch (status) {
    case 'COMPLETED': return 'success';
    case 'IN_PROGRESS': return 'warning';
    case 'PLANNED': return 'gray';
    case 'SKIPPED': return 'danger';
    default: return 'gray';
  }
};

export const getStatusLabel = (status: string) => {
  switch (status) {
    case 'COMPLETED': return 'Terminée ✓';
    case 'IN_PROGRESS': return 'En cours';
    case 'PLANNED': return 'Planifiée';
    case 'SKIPPED': return 'Sautée';
    default: return status;
  }
};
