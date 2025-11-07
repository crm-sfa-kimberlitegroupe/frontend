import Card from '@/core/ui/Card';
import { Icon } from '@/core/ui/Icon';
import type { LowStockItem } from '../services/vendorStockService';

interface LowStockAlertsProps {
  items: LowStockItem[];
  className?: string;
}

export default function LowStockAlerts({ items, className = '' }: LowStockAlertsProps) {
  if (items.length === 0) return null;

  return (
    <Card className={`p-4 bg-yellow-50 border border-yellow-200 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <Icon name="warning" size="xl" variant="yellow" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-yellow-900 mb-2">
            ⚠️ Stock Faible ({items.length})
          </h3>
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-2 border-t border-yellow-200 first:border-t-0"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-white rounded-lg flex-shrink-0 overflow-hidden">
                    {item.sku.photo ? (
                      <img
                        src={item.sku.photo}
                        alt={item.sku.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon name="package" size="md" variant="grey" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-yellow-900 truncate">
                      {item.sku.name}
                    </p>
                    <p className="text-xs text-yellow-700">{item.sku.brand}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-3">
                  <span className="text-lg font-bold text-yellow-900">
                    {item.quantity}
                  </span>
                  <span className="text-xs text-yellow-700">restant</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-yellow-700 mt-3">
            💡 Pensez à recharger votre stock pour ces produits
          </p>
        </div>
      </div>
    </Card>
  );
}
