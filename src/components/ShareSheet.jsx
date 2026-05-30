import React, { useEffect, useState } from 'react';
import { MessageCircle, Mail, X, FileText, Check, Loader } from 'lucide-react';

// Shortens a URL using is.gd via JSONP (no CORS issues, no backend needed)
function shortenUrl(longUrl) {
  return new Promise((resolve) => {
    const callbackName = `isgd_cb_${Date.now()}`;
    const script = document.createElement('script');
    const timeout = setTimeout(() => {
      // On timeout, fall back to the original URL
      cleanup();
      resolve(longUrl);
    }, 5000);

    function cleanup() {
      clearTimeout(timeout);
      delete window[callbackName];
      if (script.parentNode) script.parentNode.removeChild(script);
    }

    window[callbackName] = (data) => {
      cleanup();
      resolve(data.shorturl || longUrl);
    };

    const encoded = encodeURIComponent(longUrl);
    script.src = `https://is.gd/create.php?format=json&callback=${callbackName}&url=${encoded}`;
    script.onerror = () => { cleanup(); resolve(longUrl); };
    document.head.appendChild(script);
  });
}

export function ShareSheet({ product, isOpen, onClose }) {
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(isOpen);
  const [copied, setCopied] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setIsVisible(true);
      setCopied(false);
    }
  }

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible && !isOpen) return null;

  const generateShareText = (platform = 'whatsapp', shortLink = null) => {
    if (!product) return '';

    const isEmail = platform === 'email';

    let text = isEmail
      ? `📋 Scheda Prodotto: Kerakoll ${product.nome}\n`
      : `📋 *Scheda Prodotto: Kerakoll ${product.nome}*\n`;

    text += `Codice: ${product.cod}\n\n`;

    if (product.descrizione) {
      text += `📝 ${product.descrizione}\n\n`;
    }

    if (product.resa) {
      text += `📊 ${product.resa}\n\n`;
    }

    text += isEmail
      ? `📦 Varianti e Prezzi (Listino Nov 2025):\n`
      : `📦 *Varianti e Prezzi (Listino Nov 2025):*\n`;

    product.varianti.forEach(v => {
      const conf = v.tipo_conf
        ? `${v.tipo_conf} ${v.vol_conf || ''}${v.um_conf || ''}`.trim()
        : 'Confezione';

      let prezzoStr = 'N/D';
      if (v.prezzo !== null && v.prezzo !== undefined && v.prezzo !== '') {
        const parsed = typeof v.prezzo === 'number'
          ? v.prezzo
          : parseFloat(String(v.prezzo).replace(',', '.').trim());
        if (!isNaN(parsed)) {
          prezzoStr = parsed.toLocaleString('it-IT', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 3,
          });
        }
      }

      text += `• ${conf} — ${prezzoStr} ${v.euro_um || '€'}\n`;
    });

    // Le techSheet Kerakoll richiedono referrer da kerakoll.com — non apribili da link diretto.
    // In questi casi condividiamo la pagina prodotto, da cui la scheda è scaricabile.
    const isRestrictedPdf = product.pdf_scheda_tecnica?.includes('/techSheet/');
    const rawLink = (isRestrictedPdf ? product.url_kerakoll : product.pdf_scheda_tecnica) || product.url_kerakoll || '';
    const isPdf = !!product.pdf_scheda_tecnica && !isRestrictedPdf;
    const label = isPdf ? 'Scheda Tecnica (PDF)' : 'Scheda Tecnica su kerakoll.com';
    const icon = isPdf ? '📄' : '🔗';

    // For email: use shortened link (if available) directly — no angle brackets needed
    // for very short URLs. For WhatsApp: use the raw URL as-is.
    const displayLink = isEmail ? (shortLink || rawLink) : rawLink;

    if (isEmail) {
      text += `\n${icon} ${label}:\n${displayLink}`;
    } else {
      text += `\n${icon} *${label}:*\n${displayLink}`;
    }

    return text;
  };

  const handleShareWhatsApp = () => {
    const text = generateShareText('whatsapp');
    const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(text)}`;
    window.location.href = whatsappUrl;
  };

  const handleShareEmail = async () => {
    if (!product) return;
    setEmailLoading(true);

    const isRestrictedPdf = product.pdf_scheda_tecnica?.includes('/techSheet/');
    const rawLink = (isRestrictedPdf ? product.url_kerakoll : product.pdf_scheda_tecnica) || product.url_kerakoll || '';
    let shortLink = rawLink;

    if (rawLink) {
      shortLink = await shortenUrl(rawLink);
    }

    const subject = `Kerakoll ${product.nome} - Dati e Prezzi`;
    const body = generateShareText('email', shortLink);
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    setEmailLoading(false);
    window.location.href = mailtoUrl;
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(generateShareText('whatsapp'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div
        className={`overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />
      <div className={`bottom-sheet ${isOpen ? 'open' : ''}`}>
        <div className="sheet-handle" />

        {product && (
          <div className="sheet-content">
            <div className="sheet-header">
              <div>
                <h2 className="sheet-title">{product.nome}</h2>
                <span className="product-category">{product.cod} • {product.categoria}</span>
              </div>
              <button className="btn-close-icon" onClick={onClose}>
                <X size={24} />
              </button>
            </div>

            <div className="sheet-preview-box">
              <div className="preview-label">Anteprima messaggio:</div>
              <pre className="preview-text">{generateShareText('whatsapp')}</pre>
            </div>

            <div className="action-buttons">
              <button className="btn btn-whatsapp" onClick={handleShareWhatsApp}>
                <MessageCircle size={20} />
                Invia con WhatsApp
              </button>

              <button
                className="btn btn-email"
                onClick={handleShareEmail}
                disabled={emailLoading}
              >
                {emailLoading ? <Loader size={20} className="spin" /> : <Mail size={20} />}
                {emailLoading ? 'Preparando email...' : 'Invia via Email'}
              </button>

              <button className="btn btn-outline" onClick={handleCopyText}>
                {copied ? <Check size={20} /> : <FileText size={20} />}
                {copied ? 'Copiato!' : 'Copia Testo'}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
