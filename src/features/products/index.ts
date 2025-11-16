// Pages
export { default as ProductsManagement } from './pages/ProductsManagement';
export { default as ProductsHub } from './pages/ProductsHub';
export { default as ProductHierarchy } from './pages/ProductHierarchy';
export { default as SKUManagement } from './pages/SKUManagement';

// Export components
export { default as SKUModal } from './components/SKUModal';
export { default as TreeView } from './components/TreeView';
export { default as Tabs } from './components/Tabs';

// Export dialogs
export { default as CategoryDialog } from './components/dialogs/CategoryDialog';
export { default as SubCategoryDialog } from './components/dialogs/SubCategoryDialog';
export { default as BrandDialog } from './components/dialogs/BrandDialog';
export { default as SKUDialog } from './components/dialogs/SKUDialog';

// Services
export { productHierarchyService } from './services/productHierarchy.service';

// Types
export type { 
  Category, 
  SubCategory, 
  Brand, 
  SubBrand, 
  PackFormat, 
  PackSize, 
  SKU,
  HierarchyTree,
  ProductStatistics 
} from './services/productHierarchy.service';
