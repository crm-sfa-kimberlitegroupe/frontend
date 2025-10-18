import { Icon } from './icon';

/**
 * Test de compilation TypeScript pour le composant Icon
 * Ce fichier vérifie que toutes les props sont correctement typées
 */

// ✅ Test: Icône simple
const Test1 = () => <Icon name="home" />;

// ✅ Test: Avec variante et taille
const Test2 = () => <Icon name="settings" variant="primary" size="lg" />;

// ✅ Test: Icône interactive
const Test3 = () => <Icon name="user" onClick={() => console.log('clicked')} />;

// ✅ Test: Icône désactivée
const Test4 = () => <Icon name="warning" variant="red" disabled />;

// ✅ Test: Toutes les tailles
const Test5 = () => (
  <>
    <Icon name="home" size="xs" />
    <Icon name="home" size="sm" />
    <Icon name="home" size="md" />
    <Icon name="home" size="lg" />
    <Icon name="home" size="xl" />
    <Icon name="home" size="2xl" />
  </>
);

// ✅ Test: Toutes les variantes
const Test6 = () => (
  <>
    <Icon name="check" variant="primary" />
    <Icon name="check" variant="primaryLight" />
    <Icon name="check" variant="red" />
    <Icon name="check" variant="redLight" />
    <Icon name="check" variant="green" />
    <Icon name="check" variant="greenLight" />
    <Icon name="check" variant="yellow" />
    <Icon name="check" variant="black" />
    <Icon name="check" variant="white" />
    <Icon name="check" variant="grey" />
    <Icon name="check" variant="darkGrey" />
    <Icon name="check" variant="lightGrey" />
    <Icon name="check" variant="inherit" />
    <Icon name="check" variant="disabled" />
  </>
);

// ✅ Test: Avec classes personnalisées
const Test7 = () => <Icon name="refresh" className="animate-spin" />;

// ✅ Test: Avec accessibilité
const Test8 = () => (
  <Icon 
    name="settings"
    ariaLabel="Ouvrir les paramètres"
    title="Paramètres"
  />
);

// ❌ Test: Nom d'icône invalide (devrait échouer à la compilation)
// const TestError1 = () => <Icon name="invalid" />;

// ❌ Test: Variante invalide (devrait échouer à la compilation)
// const TestError2 = () => <Icon name="home" variant="invalid" />;

// ❌ Test: Taille invalide (devrait échouer à la compilation)
// const TestError3 = () => <Icon name="home" size="invalid" />;

export {
  Test1,
  Test2,
  Test3,
  Test4,
  Test5,
  Test6,
  Test7,
  Test8,
};
