import { useState, useEffect } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import Card from '../../../core/ui/Card';
import Button from '../../../core/ui/Button';
import type { PDVFormData } from '../types/pdv.types';
import { INITIAL_PDV_FORM_DATA } from '../constants/pdv.constants';
import PDVFormStep1 from './PDVFormStep1';
import PDVFormStep2 from './PDVFormStep2';
import PDVFormStep3 from './PDVFormStep3';
import PDVFormStep4 from './PDVFormStep4';
import type { UserRole } from '../../../core/types';
import { outletsService, OutletStatusEnum } from '@/features/pdv/services';
import { useAuthStore } from '../../../core/auth';

interface PDVFormWizardProps {
  onClose: () => void;
  userRole?: UserRole;
}

export default function PDVFormWizard({ onClose, userRole = 'REP' }: PDVFormWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<PDVFormData>(INITIAL_PDV_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useAuthStore((state) => state.user);

  // Initialiser le territoryId avec celui de l'utilisateur connecté
  useEffect(() => {
    if (user?.territory) {
      setFormData(prev => ({ ...prev, territoryId: user.territory || '' }));
    }
  }, [user]);

  const handleChange = (data: Partial<PDVFormData>) => {
    setFormData({ ...formData, ...data });
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.name; // Seul le nom est obligatoire dans Step 1
      case 2:
        return formData.address && formData.latitude && formData.longitude;
      case 3:
        return true; // Optionnel
      case 4:
        return true; // Optionnel
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!isStepValid(1) || !isStepValid(2)) {
      alert('Veuillez remplir tous les champs obligatoires des étapes 1 et 2');
      return;
    }
    
    // Convertir les jours d'ouverture en tableau de strings
    const openDaysArray = formData.openDays 
      ? Object.entries(formData.openDays)
          .filter(([, isOpen]) => isOpen)
          .map(([day]) => day)
      : [];

    // Convertir paymentMethods en tableau
    const paymentMethodsArray = formData.paymentMethods
      ? Object.entries(formData.paymentMethods)
          .filter(([, isEnabled]) => isEnabled)
          .map(([method]) => method)
      : [];

    // Convertir competitorPresence en tableau
    const competitorPresenceArray = formData.competitorPresence
      ? Object.entries(formData.competitorPresence)
          .filter(([, isPresent]) => isPresent)
          .map(([competitor]) => competitor)
      : [];

    // Validation finale avant envoi
    if (!formData.name) {
      alert('❌ Erreur: Le nom du PDV est obligatoire');
      return;
    }
    
    if (!formData.territoryId) {
      alert('❌ Erreur: Le territoire est requis. Veuillez vous reconnecter.');
      return;
    }

    const outletData = {
      code: formData.code || 'AUTO-GEN',
      name: formData.name,
      channel: formData.channel || 'PROXI', // Valeur par défaut si non renseigné
      segment: formData.segment || undefined,
      address: formData.address || undefined,
      lat: formData.latitude ? parseFloat(formData.latitude) : undefined,
      lng: formData.longitude ? parseFloat(formData.longitude) : undefined,
      openHours: {
        days: openDaysArray,
        opening: formData.openingTime,
        closing: formData.closingTime
      },
      status: OutletStatusEnum.PENDING,
      territoryId: formData.territoryId, // Récupéré automatiquement de l'utilisateur
      osmMetadata: {
        phone: formData.phone,
        contactPerson: formData.contactPerson,
        contactPhone: formData.contactPhone,
        ownerName: formData.ownerName,
        email: formData.email,
        taxId: formData.taxId,
        surfaceArea: formData.surfaceArea ? parseFloat(formData.surfaceArea) : undefined,
        employeeCount: formData.employeeCount ? parseInt(formData.employeeCount) : undefined,
        monthlyFootfall: formData.monthlyFootfall ? parseInt(formData.monthlyFootfall) : undefined,
        hasParking: formData.hasParking,
        hasAC: formData.hasAC,
        hasRefrigeration: formData.hasRefrigeration,
        paymentMethods: paymentMethodsArray,
        competitorPresence: competitorPresenceArray,
        notes: formData.notes
      }
    };
    
    try {
      setIsSubmitting(true);
      console.log('📤 Envoi du PDV au backend:', outletData);
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const createdOutlet = await outletsService.create(outletData as any);
      
      console.log('✅ PDV créé avec succès:', createdOutlet);
      alert(`✅ PDV enregistré avec succès!\n\nCode: ${createdOutlet.code}\nStatut: En attente de validation\n\nUn superviseur validera ce point de vente prochainement.`);
      onClose();
    } catch (error) {
      console.error('❌ Erreur lors de la création du PDV:', error);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorMessage = (error as any).response?.data?.message || (error as Error).message || 'Une erreur est survenue';
      alert(`❌ Erreur lors de l'enregistrement du PDV:\n\n${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div>
      <button 
        onClick={onClose}
        className="flex items-center gap-2 text-primary mb-4 hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour
      </button>

      {/* Indicateur de progression */}
      <div className="flex items-center justify-between mb-6 px-2">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
              currentStep >= step ? 'bg-sky-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {step}
            </div>
            {step < 4 && (
              <div className={`flex-1 h-1 mx-1 ${
                currentStep > step ? 'bg-sky-600' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      <Card className="p-4 mb-4">
        {currentStep === 1 && <PDVFormStep1 formData={formData} onChange={handleChange} />}
        {currentStep === 2 && <PDVFormStep2 formData={formData} onChange={handleChange} userRole={userRole} />}
        {currentStep === 3 && <PDVFormStep3 formData={formData} onChange={handleChange} />}
        {currentStep === 4 && <PDVFormStep4 formData={formData} onChange={handleChange} />}

        {/* Navigation entre les étapes */}
        <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200">
          {currentStep > 1 && (
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep(currentStep - 1)}
              className="flex-1"
            >
              ← Précédent
            </Button>
          )}
          
          {currentStep < 4 ? (
            <Button 
              variant="primary" 
              onClick={() => {
                if (!isStepValid(currentStep)) {
                  alert('Veuillez remplir tous les champs obligatoires (*)');
                  return;
                }
                setCurrentStep(currentStep + 1);
              }}
              className="flex-1"
            >
              Suivant →
            </Button>
          ) : (
            <Button 
              variant="success" 
              onClick={handleSubmit}
              className="flex-1"
              disabled={isSubmitting}
            >
              <Check className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer le PDV'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
