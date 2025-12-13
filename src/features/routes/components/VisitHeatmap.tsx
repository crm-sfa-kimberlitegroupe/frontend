import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface HeatmapData {
  name: string;
  visits: number;
  sales: number;
}

interface VisitHeatmapProps {
  data: HeatmapData[];
  isLoading?: boolean;
}

/**
 * Composant Heatmap pour visualiser les visites par zone
 * Utilise un graphique à barres horizontales avec des couleurs graduelles
 */
export default function VisitHeatmap({ data, isLoading = false }: VisitHeatmapProps) {
  // Couleurs du gradient (vert -> jaune -> rouge)
  const getBarColor = (value: number, maxValue: number): string => {
    if (maxValue === 0) return '#22c55e'; // green
    const ratio = value / maxValue;
    
    if (ratio < 0.33) return '#22c55e'; // green - faible activité
    if (ratio < 0.66) return '#eab308'; // yellow - activité moyenne
    return '#ef4444'; // red - forte activité
  };

  // Trouver la valeur max pour normaliser les couleurs
  const maxVisits = Math.max(...data.map(d => d.visits), 1);

  // Formatter pour le tooltip
  const formatTooltip = (value: number, name: string) => {
    if (name === 'visits') return [`${value} visites`, 'Visites'];
    return [value, name];
  };

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center text-gray-500">
          <div className="animate-spin w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full mx-auto mb-2" />
          <p className="text-sm">Chargement...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-500">Aucune donnée disponible</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Graphique à barres */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 80, bottom: 10 }}
          >
            <XAxis type="number" hide />
            <YAxis 
              type="category" 
              dataKey="name" 
              tick={{ fontSize: 12, fill: '#374151' }}
              width={70}
            />
            <Tooltip 
              formatter={formatTooltip}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '8px 12px',
              }}
            />
            <Bar dataKey="visits" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getBarColor(entry.visits, maxVisits)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Légende */}
      <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500" />
          <span className="text-xs text-gray-600">Faible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-500" />
          <span className="text-xs text-gray-600">Moyen</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500" />
          <span className="text-xs text-gray-600">Elevé</span>
        </div>
      </div>
    </div>
  );
}
