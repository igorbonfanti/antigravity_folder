import React, { useState, useMemo } from 'react';
import { Search, Filter, Layers, FileText } from 'lucide-react';
import data from './data/products_kerakoll.json';
import { ProductCard } from './components/ProductCard';
import { ShareSheet } from './components/ShareSheet';

export default function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedLine, setSelectedLine] = useState('');

  // Extract unique lines for filter
  const lines = useMemo(() => {
    const l = new Set(data.products.map(p => p.linea).filter(Boolean));
    return Array.from(l).sort();
  }, []);

  const filteredProducts = useMemo(() => {
    return data.products.filter(p => {
      const matchesSearch = 
        p.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.cod.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.categoria.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesLine = selectedLine ? p.linea === selectedLine : true;

      return matchesSearch && matchesLine;
    });
  }, [searchTerm, selectedLine]);

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-top">
          <div className="logo-container">
            <h1 className="brand">Kerakoll</h1>
            <span className="subtitle">Listino Nov 2025</span>
          </div>
        </div>

        <div className="search-container">
          <Search className="search-icon" size={20} />
          <input 
            type="text" 
            className="search-input" 
            placeholder="Cerca prodotto o codice (es. Keracem)" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {lines.length > 0 && (
          <div className="filters-container">
            <button 
              className={`filter-chip ${selectedLine === '' ? 'active' : ''}`}
              onClick={() => setSelectedLine('')}
            >
              Tutti
            </button>
            {lines.map(line => (
              <button 
                key={line}
                className={`filter-chip ${selectedLine === line ? 'active' : ''}`}
                onClick={() => setSelectedLine(line)}
              >
                {line}
              </button>
            ))}
          </div>
        )}
      </header>

      <main className="main-content">
        <div className="results-count">
          {filteredProducts.length} {filteredProducts.length === 1 ? 'prodotto trovato' : 'prodotti trovati'}
        </div>

        <div className="product-list">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <ProductCard 
                key={product.cod} 
                product={product} 
                onShare={() => setSelectedProduct(product)} 
              />
            ))
          ) : (
            <div className="empty-state">
              <Layers size={48} className="empty-icon" />
              <h3>Nessun risultato</h3>
              <p>Prova a cercare un altro prodotto o codice.</p>
            </div>
          )}
        </div>
      </main>

      <ShareSheet 
        product={selectedProduct} 
        isOpen={!!selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
      />
    </div>
  );
}
