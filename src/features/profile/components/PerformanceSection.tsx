import Card from '../../../core/ui/Card';
import type { UserPerformance } from '@/features/users/services';

interface PerformanceSectionProps {
  performance: UserPerformance;
}

export default function PerformanceSection({ performance }: PerformanceSectionProps) {
  return (
    <Card className="border border-slate-200">
      <div className="p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-6">Performances</h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <div className="text-2xl font-bold text-slate-900 mb-1">{performance.coverage}%</div>
            <p className="text-xs text-slate-600">Couverture</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <div className="text-2xl font-bold text-slate-900 mb-1">{performance.strikeRate}%</div>
            <p className="text-xs text-slate-600">Strike Rate</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <div className="text-2xl font-bold text-slate-900 mb-1">{performance.visitsThisMonth}</div>
            <p className="text-xs text-slate-600">Visites</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <div className="text-2xl font-bold text-slate-900 mb-1">
              {(performance.salesThisMonth / 1000000).toFixed(1)}M
            </div>
            <p className="text-xs text-slate-600">CA (FCFA)</p>
          </div>
        </div>

        <div className="p-4 bg-slate-900 text-white rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Perfect Store Score</span>
            <span className="text-xl font-bold">{performance.perfectStoreScore}%</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
