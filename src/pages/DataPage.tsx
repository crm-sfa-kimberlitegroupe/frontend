import type { UserRole } from '../types';
import DataREP from './data/DataREP';
import DataADMIN from './data/DataADMIN';
import DataSUP from './data/DataSUP';

interface DataPageProps {
  userRole: UserRole;
}

export default function DataPage({ userRole }: DataPageProps) {
  switch (userRole) {
    case 'REP':
      return <DataREP />;
    case 'ADMIN':
      return <DataADMIN />;
    case 'SUP':
      return <DataSUP />;
    default:
      return <DataREP />;
  }
}
