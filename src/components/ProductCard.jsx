import React from 'react';
import { Share2, FileText, BookOpen, ChevronRight } from 'lucide-react';

export function ProductCard({ product, onShare }) {
  const { nome, cod, categoria, descrizione, varianti, pdf_scheda_tecnica, pdf_sistema, url_kerakoll } = product;

  // techSheet sul CDN Kerakoll richiede referrer da kerakoll.com — apertura diretta dà 403.
  // Per questi link apriamo la pagina prodotto, dove l'utente può scaricare la scheda in contesto corretto.
  const isRestrictedPdf = pdf_scheda_tecnica?.includes('/techSheet/');
  const pdfHref = isRestrictedPdf ? url_kerakoll : pdf_scheda_tecnica;
  const pdfTitle = isRestrictedPdf ? 'Scheda tecnica su kerakoll.com' : 'Apri Scheda Tecnica';

  const sistemaTitle = pdf_sistema?.includes('/brochures/') ? 'Brochure prodotto' : 'Guida di sistema';
  
  // Parsing robusto del prezzo
  const parsePrice = (priceVal) => {
    if (priceVal === null || priceVal === undefined || priceVal === '') return null;
    if (typeof priceVal === 'number') return priceVal;
    const cleaned = String(priceVal).replace(',', '.').trim();
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
  };

  const prices = varianti.map(v => parsePrice(v.prezzo)).filter(v => v !== null);
  const minPrice = prices.length > 0 ? Math.min(...prices) : null;
  const um = varianti.length > 0 ? varianti[0].um_conf : '';

  const formatPrice = (val) => {
    if (val === null || val === undefined) return 'N/D';
    return val.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 3 });
  };

  return (
    <div className="product-card">
      <div className="card-header">
        <div className="card-title-group">
          <span className="product-code">{cod}</span>
          <h3 className="product-name">{nome}</h3>
          <span className="product-category">{categoria}</span>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {pdf_scheda_tecnica && (
            <a
              href={pdfHref}
              target="_blank"
              rel="noreferrer"
              className="btn-pdf-icon"
              title={pdfTitle}
            >
              <FileText size={20} />
            </a>
          )}
          {pdf_sistema && (
            <a
              href={pdf_sistema}
              target="_blank"
              rel="noreferrer"
              className="btn-pdf-icon"
              title={sistemaTitle}
            >
              <BookOpen size={20} />
            </a>
          )}
        </div>
      </div>

      {descrizione && <p className="product-desc">{descrizione}</p>}

      <div className="card-footer">
        <div className="price-info">
          <span className="price-label">Prezzo listino da</span>
          <div className="price-value">
            {minPrice !== null ? `€ ${formatPrice(minPrice)}` : 'N/D'} <span className="price-um">{um ? `/${um}` : ''}</span>
          </div>
        </div>
        
        <button className="btn-share" onClick={() => onShare(product)}>
          <Share2 size={18} />
          <span>Condividi</span>
        </button>
      </div>
    </div>
  );
}
