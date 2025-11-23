interface VisitInitializationModalProps {
  isOpen: boolean;
  pdvName: string;
}

export default function VisitInitializationModal({ 
  isOpen, 
  pdvName 
}: VisitInitializationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl">
        {/* Spinner */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
        
        {/* Content */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Initialisation de la visite
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            {pdvName}
          </p>
          <p className="text-gray-500 text-xs">
            Veuillez patienter...
          </p>
        </div>
      </div>
    </div>
  );
}
