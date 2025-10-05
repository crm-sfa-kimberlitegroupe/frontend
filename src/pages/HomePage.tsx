import type { UserRole } from '../types';
import HomeREP from './home/HomeREP';
import HomeADMIN from './home/HomeADMIN';
import HomeSUP from './home/HomeSUP';

interface HomePageProps {
  userRole: UserRole;
}

export default function HomePage({ userRole }: HomePageProps) {
  switch (userRole) {
    case 'REP':
      return <HomeREP />;
    case 'ADMIN':
      return <HomeADMIN />;
    case 'SUP':
      return <HomeSUP />;
    default:
      return <HomeREP />;
  }
}
