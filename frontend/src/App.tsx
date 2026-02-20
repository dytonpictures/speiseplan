import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout, useSelectedWeek } from './components/Layout';
import { WeekPlanner } from './components/WeekPlanner';
import { ProductList } from './components/ProductList';
import { InfoPage } from './components/InfoPage';
import { useProducts } from './hooks/useProducts';
import './styles/globals.css';

// Home Page Component (Week Planner View)
function HomePage() {
  const selectedWeek = useSelectedWeek();
  
  return (
    <WeekPlanner 
      year={selectedWeek.year} 
      week={selectedWeek.week} 
    />
  );
}

// Products Page Component
function ProductsPage() {
  const {
    products,
    allergens,
    additives,
    createProduct,
    updateProduct,
    deleteProduct,
    loading,
    error
  } = useProducts();

  // Error display for products page
  if (error && products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.764 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h2 className="text-lg font-medium text-red-800">Fehler beim Laden</h2>
          <p className="mt-2 text-red-600">{error}</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="btn-primary"
        >
          Seite neu laden
        </button>
      </div>
    );
  }

  return (
    <ProductList
      products={products}
      allergens={allergens}
      additives={additives}
      onCreateProduct={createProduct}
      onUpdateProduct={updateProduct}
      onDeleteProduct={deleteProduct}
      loading={loading}
    />
  );
}

// Main App Component
function App() {
  return (
    <Router>
      <div className="App min-h-screen bg-gray-50 text-contrast-aa">
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Home Page - Week Planner */}
            <Route index element={<HomePage />} />
            
            {/* Products Management */}
            <Route path="/produkte" element={<ProductsPage />} />
            
            {/* Info/About Page */}
            <Route path="/info" element={<InfoPage />} />
            
            {/* 404 Not Found */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

// 404 Not Found Page
function NotFoundPage() {
  return (
    <div className="text-center py-12">
      <svg 
        className="mx-auto h-12 w-12 text-gray-400 mb-4" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Seite nicht gefunden
      </h1>
      
      <p className="text-gray-600 mb-6">
        Die angeforderte Seite konnte nicht gefunden werden.
      </p>
      
      <a href="/" className="btn-primary">
        Zurück zur Startseite
      </a>
    </div>
  );
}

export default App;