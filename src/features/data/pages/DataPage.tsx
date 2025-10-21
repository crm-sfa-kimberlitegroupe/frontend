import type { UserRole } from '../../../core/types';
import DataREP from './DataREP';
import DataADMIN from './DataADMIN';
import DataSUP from './DataSUP';

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
