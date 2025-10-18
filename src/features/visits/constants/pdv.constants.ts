import type { Channel } from '../types/pdv.types';

export const CHANNELS: Channel[] = [
  { value: 'GT', label: 'GT - Grande Distribution', icon: '🏬' },
  { value: 'MT', label: 'MT - Distribution Moyenne', icon: '🏪' },
  { value: 'HORECA', label: 'HORECA - Hôtels/Restaurants', icon: '🍽️' },
  { value: 'PROXI', label: 'PROXI - Proximité', icon: '🏘️' },
  { value: 'DISTRIB', label: 'DISTRIB - Distributeur', icon: '📦' }
];

export const COMPETITORS = ['Coca-Cola', 'Nestlé', 'Unilever', 'Dangote', 'Autres'];

export const INITIAL_PDV_FORM_DATA = {
  code: '',
  name: '',
  address: '',
  phone: '',
  channel: '',
  segment: '',
  territoryId: '',
  latitude: '',
  longitude: '',
  notes: '',
  contactPerson: '',
  contactPhone: '',
  ownerName: '',
  email: '',
  taxId: '',
  openDays: {
    lundi: false,
    mardi: false,
    mercredi: false,
    jeudi: false,
    vendredi: false,
    samedi: false,
    dimanche: false
  },
  openingTime: '08:00',
  closingTime: '18:00',
  surfaceArea: '',
  employeeCount: '',
  hasParking: false,
  hasAC: false,
  hasRefrigeration: false,
  competitorPresence: [] as string[],
  monthlyFootfall: '',
  paymentMethods: {
    cash: false,
    mobileMoney: false,
    card: false,
    credit: false
  }
};
