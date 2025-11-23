import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Card from '../../../core/ui/Card';
import Button from '../../../core/ui/Button';
import { Icon } from '../../../core/ui/Icon';
import api from '../../../core/api/api';

export default function MerchandisingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const outletId = searchParams.get('outletId');
  const visitId = searchParams.get('visitId');
  const pdvName = searchParams.get('pdvName') || 'Point de vente';
  
  const [photos] = useState<string[]>([]);
  const [checklist, setChecklist] = useState({
    produitsDisposes: false,
    prixAffiches: false,
    plvEnPlace: false,
    stockSuffisant: false,
    propreteRayon: false
  });
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleChecklistChange = (key: keyof typeof checklist) => {
    setChecklist(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSaveMerchandising = async () => {
    if (confirm('Enregistrer le merchandising pour ce point de vente ?')) {
      try {
        setIsSaving(true);
        
        const merchandisingData = {
          outletId,
          visitId,
          photos,
          checklist,
          notes,
          createdAt: new Date().toISOString()
        };
        
        // Appel API pour sauvegarder le merchandising
        const response = await api.post('/merchandising', merchandisingData);
        
        // Sauvegarder l'ID du merchandising dans localStorage pour la visite
        if (response.data?.data?.id && visitId) {
          localStorage.setItem(`visit_${visitId}_merchId`, response.data.data.id);
          console.log('💾 ID merchandising sauvegardé pour la visite:', response.data.data.id);
        }
        if (response.data?.data?.id && outletId) {
          localStorage.setItem(`merch_${outletId}`, response.data.data.id);
          console.log('💾 ID merchandising sauvegardé:', response.data.data.id);
        }
        
        alert('Merchandising enregistré avec succès!');
        navigate(-1); // Retour à la page précédente
      } catch (error) {
        console.error('Erreur lors de l\'enregistrement du merchandising:', error);
        alert('Erreur lors de l\'enregistrement. Veuillez réessayer.');
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-24">
      {/* Header */}
      <div className="mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-primary mb-4 text-lg"
        >
          <Icon name="arrowLeft" size="sm" /> Retour
        </button>
        
        <Card className="p-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Merchandising</h1>
          <div className="flex items-center gap-2">
            <Icon name="store" size="sm" variant="grey" />
            <p className="text-lg text-gray-600">{pdvName}</p>
          </div>
        </Card>
      </div>

      {/* Photos merchandising */}
      <Card className="p-4 mb-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Icon name="camera" size="md" variant="primary" />
          Photos merchandising
        </h3>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
              <Icon name="camera" size="2xl" variant="grey" />
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" fullWidth>
          <Icon name="plus" size="sm" className="mr-2" />
          Ajouter une photo
        </Button>
      </Card>

      {/* Checklist Perfect Store */}
      <Card className="p-4 mb-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Icon name="checkCircle" size="md" variant="green" />
          Checklist Perfect Store
        </h3>
        <div className="space-y-2">
          <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
            <input 
              type="checkbox" 
              className="w-5 h-5 text-primary rounded"
              checked={checklist.produitsDisposes}
              onChange={() => handleChecklistChange('produitsDisposes')}
            />
            <span className="text-lg text-gray-700">Produits bien disposés</span>
          </label>
          <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
            <input 
              type="checkbox" 
              className="w-5 h-5 text-primary rounded"
              checked={checklist.prixAffiches}
              onChange={() => handleChecklistChange('prixAffiches')}
            />
            <span className="text-lg text-gray-700">Prix affichés</span>
          </label>
          <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
            <input 
              type="checkbox" 
              className="w-5 h-5 text-primary rounded"
              checked={checklist.plvEnPlace}
              onChange={() => handleChecklistChange('plvEnPlace')}
            />
            <span className="text-lg text-gray-700">PLV en place</span>
          </label>
          <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
            <input 
              type="checkbox" 
              className="w-5 h-5 text-primary rounded"
              checked={checklist.stockSuffisant}
              onChange={() => handleChecklistChange('stockSuffisant')}
            />
            <span className="text-lg text-gray-700">Stock suffisant</span>
          </label>
          <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
            <input 
              type="checkbox" 
              className="w-5 h-5 text-primary rounded"
              checked={checklist.propreteRayon}
              onChange={() => handleChecklistChange('propreteRayon')}
            />
            <span className="text-lg text-gray-700">Propreté du rayon</span>
          </label>
        </div>
      </Card>

      {/* Gestion stock */}
      <Card className="p-4 mb-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Icon name="package" size="md" variant="primary" />
          Gestion stock
        </h3>
        <Button variant="outline" size="sm" fullWidth>
          <Icon name="warning" size="sm" className="mr-2" />
          Signaler une rupture
        </Button>
      </Card>

      {/* Notes */}
      <Card className="p-4 mb-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Icon name="note" size="md" variant="primary" />
          Notes sur le merchandising
        </h3>
        <textarea 
          className="w-full border border-gray-300 rounded-lg p-3 text-lg"
          rows={4}
          placeholder="Ajouter des notes sur le merchandising..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </Card>

      {/* Bouton de validation */}
      <Button 
        variant="success" 
        size="lg" 
        fullWidth
        disabled={isSaving}
        onClick={handleSaveMerchandising}
        className="bg-emerald-600 hover:bg-emerald-700"
      >
        {isSaving ? (
          <>
            <Icon name="refresh" size="md" className="mr-2 animate-spin" />
            Enregistrement...
          </>
        ) : (
          <>
            <Icon name="checkCircle" size="md" className="mr-2" />
            Valider le merchandising
          </>
        )}
      </Button>
    </div>
  );
}
