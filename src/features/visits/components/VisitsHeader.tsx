import { Icon } from '../../../core/ui/Icon';

interface VisitsHeaderProps {
  completedCount: number;
  inProgressCount: number;
  plannedCount: number;
}

export default function VisitsHeader({ completedCount, inProgressCount, plannedCount }: VisitsHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
        Mes Visites
        <Icon name="locationMarker" size="lg" variant="primary" />
      </h1>
      <div className="flex items-center gap-4 text-lg">
        <span className="text-gray-600">
          <span className="font-semibold text-success">{completedCount}</span> terminées
        </span>
        <span className="text-gray-600">
          <span className="font-semibold text-warning">{inProgressCount}</span> en cours
        </span>
        <span className="text-gray-600">
          <span className="font-semibold text-gray-900">{plannedCount}</span> planifiées
        </span>
      </div>
    </div>
  );
}
