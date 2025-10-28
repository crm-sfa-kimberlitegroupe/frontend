import { useState, useEffect } from 'react';
import Modal from '../../../core/ui/feedback/Modal';
import Button from '../../../core/ui/Button';
import type { User } from '../services/territoriesService';

interface AssignAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (adminId: string) => void;
  availableAdmins: User[];
  currentAdmin?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  territoryName: string;
  loading?: boolean;
}

export default function AssignAdminModal({
  isOpen,
  onClose,
  onConfirm,
  availableAdmins,
  currentAdmin,
  territoryName,
  loading = false,
}: AssignAdminModalProps) {
  const [selectedAdminId, setSelectedAdminId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen && currentAdmin) {
      setSelectedAdminId(currentAdmin.id);
    } else if (isOpen) {
      setSelectedAdminId('');
    }
  }, [isOpen, currentAdmin]);

  const filteredAdmins = availableAdmins.filter((admin) => {
    const fullName = `${admin.firstName} ${admin.lastName}`.toLowerCase();
    const email = admin.email.toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || email.includes(search);
  });

  const handleSubmit = () => {
    if (selectedAdminId) {
      onConfirm(selectedAdminId);
    }
  };

  const title = currentAdmin 
    ? `Changer l'administrateur - ${territoryName}`
    : `Assigner un administrateur - ${territoryName}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
      <div className="space-y-4">
        {currentAdmin && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Administrateur actuel:</span>{' '}
              {currentAdmin.firstName} {currentAdmin.lastName}
            </p>
          </div>
        )}

        {/* Search */}
        <div>
          <input
            type="text"
            placeholder="🔍 Rechercher un administrateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>

        {/* Liste des admins */}
        <div className="max-h-96 overflow-y-auto space-y-2">
          {filteredAdmins.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Aucun administrateur disponible</p>
              {searchTerm && (
                <p className="text-sm mt-1">Essayez une autre recherche</p>
              )}
            </div>
          ) : (
            filteredAdmins.map((admin) => (
              <label
                key={admin.id}
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedAdminId === admin.id
                    ? 'border-primary bg-primary/5 ring-2 ring-primary'
                    : 'border-gray-200 hover:border-primary hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="admin"
                  value={admin.id}
                  checked={selectedAdminId === admin.id}
                  onChange={(e) => setSelectedAdminId(e.target.value)}
                  className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                />
                <div className="ml-3 flex-1">
                  <p className="font-semibold text-gray-900">
                    {admin.firstName} {admin.lastName}
                  </p>
                  <p className="text-sm text-gray-600">{admin.email}</p>
                  {admin.role && (
                    <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {admin.role}
                    </span>
                  )}
                </div>
              </label>
            ))
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" size="md" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleSubmit}
            disabled={!selectedAdminId || loading}
          >
            {loading ? 'Assignation...' : currentAdmin ? 'Changer' : 'Assigner'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
