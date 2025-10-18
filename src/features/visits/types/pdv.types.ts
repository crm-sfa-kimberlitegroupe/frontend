export interface PDVFormData {
  code: string;
  name: string;
  address: string;
  phone: string;
  channel: string;
  segment: string;
  territoryId: string;
  latitude: string;
  longitude: string;
  notes: string;
  contactPerson: string;
  contactPhone: string;
  ownerName: string;
  email: string;
  taxId: string;
  openDays: {
    lundi: boolean;
    mardi: boolean;
    mercredi: boolean;
    jeudi: boolean;
    vendredi: boolean;
    samedi: boolean;
    dimanche: boolean;
  };
  openingTime: string;
  closingTime: string;
  surfaceArea: string;
  employeeCount: string;
  hasParking: boolean;
  hasAC: boolean;
  hasRefrigeration: boolean;
  competitorPresence: string[];
  monthlyFootfall: string;
  paymentMethods: {
    cash: boolean;
    mobileMoney: boolean;
    card: boolean;
    credit: boolean;
  };
}

export interface Visit {
  id: string;
  pdvName: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PLANNED' | 'SKIPPED';
  scheduledTime: string;
  checkInTime?: string;
  checkOutTime?: string;
}

export interface Channel {
  value: string;
  label: string;
  icon: string;
}
