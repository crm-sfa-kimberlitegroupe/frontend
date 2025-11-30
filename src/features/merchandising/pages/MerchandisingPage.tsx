import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageLayout, Card, Button } from '@/core/ui';
import api from '@/core/api/api';
import { useVisitsStore } from '@/features/visits/stores/visitsStore';
import { ArrowLeft, Camera, Star, FileText, AlertTriangle, Save, CheckCircle } from 'lucide-react';

// Interface pour une question avec note
interface MerchQuestion {
  questionId: string;
  question: string;
  rating: number; // 0-5
  comment: string;
}

// Liste des questions de merchandising
const MERCH_QUESTIONS: Omit<MerchQuestion, 'rating' | 'comment'>[] = [
  { questionId: 'visibilite', question: 'Visibilite des produits en rayon' },
  { questionId: 'disponibilite', question: 'Disponibilite des produits (pas de rupture)' },
  { questionId: 'facing', question: 'Qualite du facing (alignement, proprete)' },
  { questionId: 'prix', question: 'Affichage correct des prix' },
  { questionId: 'plv', question: 'Presence et etat de la PLV' },
  { questionId: 'proprete', question: 'Proprete generale du rayon' },
  { questionId: 'stock', question: 'Niveau de stock en rayon' },
];

export default function MerchandisingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const visitId = searchParams.get('visitId');
  const pdvName = searchParams.get('pdvName') || 'Point de vente';
  const fromVisit = searchParams.get('fromVisit') === 'true';
  
  // Store des visites
  const { updateVisitAddMerchId } = useVisitsStore();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [photos] = useState<string[]>([]);
  
  // Questions avec notes
  const [questions, setQuestions] = useState<MerchQuestion[]>(
    MERCH_QUESTIONS.map(q => ({ ...q, rating: 0, comment: '' }))
  );
  const [notes, setNotes] = useState('');

  // Changer la note d'une question
  const handleRatingChange = (questionId: string, rating: number) => {
    setQuestions(prev => prev.map(q => 
      q.questionId === questionId ? { ...q, rating } : q
    ));
  };

  // Changer le commentaire d'une question
  const handleCommentChange = (questionId: string, comment: string) => {
    setQuestions(prev => prev.map(q => 
      q.questionId === questionId ? { ...q, comment } : q
    ));
  };

  // Calculer le score base sur les notes (0-100%)
  const calculateScore = () => {
    const totalRating = questions.reduce((sum, q) => sum + q.rating, 0);
    const maxPossible = questions.length * 5;
    return Math.round((totalRating / maxPossible) * 100);
  };

  // Verifier si toutes les questions ont une note
  const allQuestionsRated = () => {
    return questions.every(q => q.rating > 0);
  };

  const handleSaveMerchandising = async () => {
    if (!visitId) {
      setError('Aucune visite en cours. Veuillez d\'abord faire un check-in.');
      return;
    }

    if (!allQuestionsRated()) {
      setError('Veuillez noter toutes les questions avant de valider.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const merchandisingData = {
        questions: questions.map(q => ({
          questionId: q.questionId,
          question: q.question,
          rating: q.rating,
          comment: q.comment || undefined,
        })),
        notes: notes || undefined,
        photos: photos.map(photo => ({
          fileKey: photo,
        })),
      };

      console.log('[MerchandisingPage] Envoi merchandising pour visite:', visitId);
      console.log('[MerchandisingPage] Donnees:', merchandisingData);

      // Appel API
      const response = await api.post(`/visits/${visitId}/merch-check`, merchandisingData);
      console.log('[MerchandisingPage] Reponse API:', response);

      // Extraire l'ID du merchandising
      const merchCheck = response?.data?.data || response?.data || response;
      const merchId = merchCheck?.id;

      if (merchId) {
        updateVisitAddMerchId(visitId, merchId);
        console.log('[MerchandisingPage] Merchandising cree:', merchId);
      }

      setSuccess(true);

      setTimeout(() => {
        if (fromVisit) {
          navigate(-1);
        } else {
          navigate('/dashboard/visits');
        }
      }, 1500);
    } catch (err: unknown) {
      console.error('[MerchandisingPage] Erreur:', err);
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as { response?: { data?: { message?: string } } }).response;
        setError(response?.data?.message || 'Erreur lors de l\'enregistrement');
      } else {
        setError('Erreur lors de l\'enregistrement du merchandising');
      }
    } finally {
      setLoading(false);
    }
  };

  const score = calculateScore();
  const ratedCount = questions.filter(q => q.rating > 0).length;

  // Composant pour afficher les etoiles de notation
  const StarRating = ({ rating, onRate }: { rating: number; onRate: (r: number) => void }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRate(star)}
          className="focus:outline-none transition-transform hover:scale-110"
        >
          <Star
            className={`w-7 h-7 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );

  return (
    <PageLayout>
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10 p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => fromVisit ? navigate(-1) : navigate('/dashboard/visits')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Merchandising</h1>
              <p className="text-sm text-gray-500">{pdvName}</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-800">Merchandising enregistre avec succes !</p>
            </div>
          )}

          {/* Score en temps reel */}
          <Card>
            <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-purple-900">Score Perfect Store</h3>
                  <p className="text-sm text-purple-700">{ratedCount}/{questions.length} questions notees</p>
                </div>
                <div className="text-4xl font-bold text-purple-600">{score}%</div>
              </div>
              <div className="mt-3 bg-purple-200 rounded-full h-3">
                <div 
                  className="bg-purple-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          </Card>

          {/* Questions avec notes */}
          <Card>
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Evaluation merchandising
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Notez chaque critere de 1 a 5 etoiles
              </p>
            </div>
            <div className="divide-y divide-gray-100">
              {questions.map((q) => (
                <div key={q.questionId} className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-base text-gray-900 font-medium flex-1">
                      {q.question}
                    </p>
                    {q.rating > 0 && (
                      <span className="text-sm font-bold text-purple-600">{q.rating}/5</span>
                    )}
                  </div>
                  <StarRating 
                    rating={q.rating} 
                    onRate={(r) => handleRatingChange(q.questionId, r)} 
                  />
                  {/* Commentaire optionnel */}
                  <input
                    type="text"
                    placeholder="Commentaire (optionnel)..."
                    value={q.comment}
                    onChange={(e) => handleCommentChange(q.questionId, e.target.value)}
                    className="mt-2 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              ))}
            </div>
          </Card>

          {/* Photos merchandising */}
          <Card>
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Camera className="w-5 h-5 text-purple-600" />
                Photos (optionnel)
              </h2>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-purple-400 transition-colors cursor-pointer">
                    <Camera className="w-8 h-8 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Notes generales */}
          <Card>
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-600" />
                Notes generales
              </h2>
            </div>
            <div className="p-4">
              <textarea 
                className="w-full border border-gray-300 rounded-lg p-3 text-base focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={3}
                placeholder="Observations, remarques..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={loading}
              fullWidth
            >
              Annuler
            </Button>
            <Button
              onClick={handleSaveMerchandising}
              disabled={loading || !visitId || !allQuestionsRated()}
              variant="primary"
              fullWidth
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Save className="w-4 h-4 mr-1" />
              {loading ? 'Enregistrement...' : 'Valider'}
            </Button>
          </div>

          {!allQuestionsRated() && (
            <p className="text-sm text-amber-600 text-center">
              Veuillez noter toutes les questions pour valider.
            </p>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
