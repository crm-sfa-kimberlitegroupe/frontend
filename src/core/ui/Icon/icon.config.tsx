import type { IconName } from './icon.types';
import {
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiChevronUp,
  FiEye,
  FiAlertTriangle,
  FiSearch,
  FiCamera,
  FiPackage,
  FiShoppingCart,
  FiEdit,
  FiFlag,
  FiClock,
  FiZap,
  FiBarChart2,
  FiCalendar,
  FiPhone,
  FiMail,
  FiTruck,
  FiStar,
  FiPlus,
  FiMinus,
  FiX,
  FiArrowLeft,
  FiArrowRight,
  FiTrash2,
} from 'react-icons/fi';
import { HiMap, HiLocationMarker } from 'react-icons/hi';
import { FaUserCircle } from 'react-icons/fa';
import { FaHardDrive } from 'react-icons/fa6';
import { RiFingerprintFill } from 'react-icons/ri';
import { IoFolderOpen } from 'react-icons/io5';
import { IoIosCheckmarkCircle } from 'react-icons/io';
import { FaArrowsRotate } from 'react-icons/fa6';
import { ImHome } from 'react-icons/im';
import { RiSettings3Fill } from 'react-icons/ri';
import { FaFileDownload } from 'react-icons/fa';
import { HiUser } from 'react-icons/hi2';
import { HiMiniBuildingStorefront } from 'react-icons/hi2';
import { HiBuildingOffice } from 'react-icons/hi2';
import { FaRegCircleCheck } from 'react-icons/fa6';
import { HiCubeTransparent } from 'react-icons/hi2';
import { IoIosMenu } from 'react-icons/io';


// Mapping des noms d'icônes aux composants React Icons
export const ICON_MAP: Record<IconName, React.ComponentType> = {
  user: HiUser,
  chevronDown: FiChevronDown,
  settings: RiSettings3Fill,
  userCircle: FaUserCircle,
  store: HiMiniBuildingStorefront,
  home: ImHome,
  eye: FiEye,
  building: HiBuildingOffice,
  refresh: FaArrowsRotate,
  check: IoIosCheckmarkCircle,
  checkCircle: FaRegCircleCheck,
  warning: FiAlertTriangle,
  search: FiSearch,
  disk: FaHardDrive,
  fingerprint: RiFingerprintFill,
  folder: IoFolderOpen,
  download: FaFileDownload,
  cube: HiCubeTransparent,
  sideMenuopen: IoIosMenu,
  map: HiMap,
  locationMarker: HiLocationMarker,
  camera: FiCamera,
  package: FiPackage,
  cart: FiShoppingCart,
  note: FiEdit,
  edit: FiEdit,
  flag: FiFlag,
  clock: FiClock,
  lightbulb: FiZap,
  chartBar: FiBarChart2,
  calendar: FiCalendar,
  phone: FiPhone,
  mail: FiMail,
  truck: FiTruck,
  star: FiStar,
  plus: FiPlus,
  minus: FiMinus,
  x: FiX,
  arrowLeft: FiArrowLeft,
  arrowRight: FiArrowRight,
  chevronLeft: FiChevronLeft,
  chevronRight: FiChevronRight,
  chevronUp: FiChevronUp,
  trash: FiTrash2,
} as const;
