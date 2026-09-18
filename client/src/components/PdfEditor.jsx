import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import SignatureCanvas from 'react-signature-canvas';
import {
  Upload, FileEdit, Type, Highlighter, PenLine, FileSignature,
  Square, MousePointer2, Download, Trash2, RotateCcw, ZoomIn, ZoomOut,
  ChevronLeft, ChevronRight, X, Palette, LayoutGrid, Edit3, Plus,
  SlidersHorizontal,
} from 'lucide-react';

// CDN worker — avoids Vite bundling the large worker file
pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

// ── Modes ────────────────────────────────────────────────────────────────────
const MODES = [
  { id: 'editText',   label: 'Edit Text',  Icon: Edit3         },
  { id: 'addText',    label: 'Add Text',   Icon: Plus          },
  { id: 'highlight',  label: 'Highlight',  Icon: Highlighter   },
  { id: 'draw',       label: 'Draw',       Icon: PenLine       },
  { id: 'signature',  label: 'Signature',  Icon: FileSignature },
  { id: 'select',     label: 'Select',     Icon: MousePointer2 },
];

const INK_COLORS = [
  '#000000', '#1a1a1a', '#c0392b', '#1565c0', '#2e7d32',
  '#6366f1', '#f59e0b', '#a855f7', '#06b6d4', '#ffffff',
];

function uid() { return Math.random().toString(36).slice(2, 9); }

// Map raw PDF font names → readable CSS families
function parseFontFamily(raw = '') {
  const base = raw.split(',')[0].replace(/[-_+]/g, ' ').trim();
  const map = {
    'TimesNewRoman': 'Times New Roman', 'Times Roman': 'Times New Roman',
    'Times': 'Times New Roman', 'Helvetica': 'Arial', 'Arial': 'Arial',
    'Courier': 'Courier New', 'CourierNew': 'Courier New',
    'Calibri': 'Calibri', 'Georgia': 'Georgia',
  };
  for (const [k, v] of Object.entries(map)) {
    if (base.toLowerCase().includes(k.toLowerCase())) return v;
  }
  return base || 'sans-serif';
}

// ── Main Component ────────────────────────────────────────────────────────────
export function PdfEditor() {
  // PDF core
  const [pdfBytes, setPdfBytes]     = useState(null);
  const [pdfDoc, setPdfDoc]         = useState(null);
  const [fileName, setFileName]     = useState('');
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom]             = useState(1.3);
  const [thumbnails, setThumbnails] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dragging, setDragging]     = useState(false);

  // Text layer (Edit Text mode)
  const [textItems, setTextItems]   = useState([]);  // extracted from pdfjs
  const [textEdits, setTextEdits]   = useState({});  // {id: newText}
  const [hoveredId, setHoveredId]   = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [editingId, setEditingId]   = useState(null);

  // Add-text / annotation layer
  const [annotations, setAnnotations] = useState([]);
  const [selAnnotId, setSelAnnotId]   = useState(null);

  // Toolbar / mode
  const [mode, setMode]           = useState('editText');
  const [inkColor, setInkColor]   = useState('#000000');
  const [textBg, setTextBg]       = useState('#ffffff');
  const [fontSize, setFontSize]   = useState(12);
  const [formatOpen, setFormatOpen] = useState(true);

  // Drawing state
  const [drawState, setDrawState] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showSig, setShowSig]     = useState(false);

  // Refs
  const mainCanvasRef  = useRef(null);
  const drawCanvasRef  = useRef(null);
  const annotLayerRef  = useRef(null);
  const sigRef         = useRef(null);
  const fileInputRef   = useRef(null);
  const renderTaskRef  = useRef(null);

  const selectedItem = textItems.find(t => t.id === selectedId) || null;

  // ── Load PDF ──────────────────────────────────────────────────────────────
  const loadPdf = useCallback(async (bytes) => {
    try {
      const task = pdfjsLib.getDocument({ data: bytes.slice() });
      const doc  = await task.promise;
      setPdfDoc(doc);
      setTotalPages(doc.numPages);
      setCurrentPage(1);
      setAnnotations([]);
      setTextEdits({});
      setTextItems([]);
      setSelectedId(null);
      setEditingId(null);

      const thumbs = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const pg = await doc.getPage(i);
        const vp = pg.getViewport({ scale: 0.18 });
        const c  = document.createElement('canvas');
        c.width  = vp.width;
        c.height = vp.height;
        await pg.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise;
        thumbs.push(c.toDataURL());
      }
      setThumbnails(thumbs);
    } catch (e) { console.error('PDF load error:', e); }
  }, []);

  // ── Render page + extract text ─────────────────────────────────────────────
  useEffect(() => {
    if (!pdfDoc || !mainCanvasRef.current) return;

    const run = async () => {
      if (renderTaskRef.current) renderTaskRef.current.cancel();

      const page     = await pdfDoc.getPage(currentPage);
      const viewport = page.getViewport({ scale: zoom });
      const canvas   = mainCanvasRef.current;
      if (!canvas) return;

      canvas.width  = viewport.width;
      canvas.height = viewport.height;
      if (drawCanvasRef.current) {
        drawCanvasRef.current.width  = viewport.width;
        drawCanvasRef.current.height = viewport.height;
      }

      const task = page.render({ canvasContext: canvas.getContext('2d'), viewport });
      renderTaskRef.current = task;
      try {
        await task.promise;
        await extractTextLayer(page, viewport);
      } catch (e) {
        if (e?.name !== 'RenderingCancelledException') console.error(e);
      }
    };

    run();
    setEditingId(null);
    setSelectedId(null);
  }, [pdfDoc, currentPage, zoom]);

  // ── Extract text items via pdfjs getTextContent ───────────────────────────
  const extractTextLayer = async (page, viewport) => {
    try {
      const content = await page.getTextContent();
      const items = [];

      content.items.forEach((item, idx) => {
        if (!('str' in item) || !item.str) return;

        const [sx, kx, ky, sy, tx, ty] = item.transform;

        // Baseline position in canvas coordinates
        const [cx, cy] = viewport.convertToViewportPoint(tx, ty);

        // Font size: length of scale vector in PDF points, scaled to canvas px
        const fontSizePt = Math.sqrt(sx * sx + ky * ky);
        const fontSizePx = fontSizePt * viewport.scale;

        // Width in canvas px
        const wPx = (item.width || 0) * viewport.scale;
        // Height = font size * line height factor
        const hPx = Math.max(fontSizePx * 1.35, 8);

        const style  = content.styles?.[item.fontName] || {};
        const rawFam = style.fontFamily || '';
        const isBold   = rawFam.toLowerCase().includes('bold')   || !!style.bold;
        const isItalic = rawFam.toLowerCase().includes('italic') || !!style.italic;

        items.push({
          id:         `ti-${currentPage}-${idx}`,
          str:        item.str,
          // Canvas (screen) coordinates — for overlay positioning
          x:          cx,
          y:          cy - fontSizePx * 0.85,  // top-left of text box
          w:          Math.max(wPx, 6),
          h:          hPx,
          fontSizePx: Math.max(fontSizePx, 6),
          fontFamily: parseFontFamily(rawFam),
          bold:       isBold,
          italic:     isItalic,
          // PDF space — for saving
          pdfTx:      tx,
          pdfTy:      ty,
          pdfFontSize: fontSizePt,
          pdfW:       item.width || 0,
          page:       currentPage,
        });
      });

      setTextItems(items);
    } catch (e) { console.error('Text extract error:', e); }
  };

  // ── File handling ─────────────────────────────────────────────────────────
  const handleFile = useCallback((file) => {
    if (!file || file.type !== 'application/pdf') return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = e => {
      const bytes = new Uint8Array(e.target.result);
      setPdfBytes(bytes);
      loadPdf(bytes);
    };
    reader.readAsArrayBuffer(file);
  }, [loadPdf]);

  const onDrop = useCallback(e => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  // ── Canvas coord helper ────────────────────────────────────────────────────
  const layerCoords = e => {
    const r = annotLayerRef.current?.getBoundingClientRect();
    return r ? { x: e.clientX - r.left, y: e.clientY - r.top } : { x: 0, y: 0 };
  };

  // ── Annotation layer events (addText, highlight, draw, etc.) ──────────────
  const onLayerDown = e => {
    if (!pdfDoc) return;
    if (annotations.some(a => a.editing)) return;
    const { x, y } = layerCoords(e);

    if (mode === 'addText') {
      const a = { id: uid(), page: currentPage, type: 'text', x, y, text: '', color: inkColor, bgColor: textBg, fontSize, editing: true };
      setAnnotations(p => [...p, a]);
      setSelAnnotId(a.id);
    } else if (mode === 'highlight' || mode === 'rectangle') {
      setDrawState({ sx: x, sy: y, cx: x, cy: y });
    } else if (mode === 'draw') {
      setIsDrawing(true);
      const ctx = drawCanvasRef.current?.getContext('2d');
      if (ctx) { ctx.beginPath(); ctx.moveTo(x, y); ctx.strokeStyle = inkColor; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; }
    } else if (mode === 'signature') {
      setShowSig(true);
    } else if (mode === 'select') {
      setSelAnnotId(null); setSelectedId(null);
    }
  };

  const onLayerMove = e => {
    if (!pdfDoc) return;
    const { x, y } = layerCoords(e);
    if (drawState && (mode === 'highlight' || mode === 'rectangle'))
      setDrawState(p => ({ ...p, cx: x, cy: y }));
    if (isDrawing && mode === 'draw') {
      const ctx = drawCanvasRef.current?.getContext('2d');
      if (ctx) { ctx.lineTo(x, y); ctx.stroke(); }
    }
  };

  const onLayerUp = e => {
    if (!pdfDoc) return;
    const { x, y } = layerCoords(e);
    if (drawState && (mode === 'highlight' || mode === 'rectangle')) {
      const w = Math.abs(x - drawState.sx), h = Math.abs(y - drawState.sy);
      if (w > 5 && h > 5)
        setAnnotations(p => [...p, { id: uid(), page: currentPage, type: mode, x: Math.min(x, drawState.sx), y: Math.min(y, drawState.sy), width: w, height: h, color: inkColor }]);
      setDrawState(null);
    } else if (isDrawing) {
      const c = drawCanvasRef.current;
      const dataUrl = c?.toDataURL();
      if (dataUrl) {
        setAnnotations(p => [...p, { id: uid(), page: currentPage, type: 'drawing', x: 0, y: 0, width: c.width, height: c.height, dataUrl }]);
        c.getContext('2d').clearRect(0, 0, c.width, c.height);
      }
      setIsDrawing(false);
    }
  };

  // ── Text item interactions (Edit Text mode) ───────────────────────────────
  const onTextClick   = (e, item) => { if (mode !== 'editText') return; e.stopPropagation(); setSelectedId(item.id); };
  const onTextDblClick = (e, item) => { if (mode !== 'editText') return; e.stopPropagation(); setSelectedId(item.id); setEditingId(item.id); };

  const commitEdit = (id, val) => {
    const item = textItems.find(t => t.id === id);
    if (!item) { setEditingId(null); return; }
    if (val !== null && val !== item.str)      setTextEdits(p => ({ ...p, [id]: val }));
    else if (val === item.str)                 setTextEdits(p => { const n = {...p}; delete n[id]; return n; });
    setEditingId(null);
  };

  const revertEdit = id => setTextEdits(p => { const n = {...p}; delete n[id]; return n; });

  // ── Annotation helpers ────────────────────────────────────────────────────
  const updateAnnotText  = (id, text) => setAnnotations(p => p.map(a => a.id === id ? { ...a, text } : a));
  const finishAnnotEdit  = id => {
    setAnnotations(p => p.map(a => {
      if (a.id !== id) return a;
      return a.text?.trim() ? { ...a, editing: false } : null;
    }).filter(Boolean));
    setSelAnnotId(null);
  };
  const reEditAnnot = id => setAnnotations(p => p.map(a => a.id === id ? { ...a, editing: true } : a));
  const startDrag   = (e, id) => {
    if (mode !== 'select') return;
    e.stopPropagation();
    setSelAnnotId(id);
    const ox = e.clientX, oy = e.clientY;
    const orig = annotations.find(a => a.id === id);
    if (!orig) return;
    const mv = ev => setAnnotations(p => p.map(a => a.id === id ? { ...a, x: orig.x + ev.clientX - ox, y: orig.y + ev.clientY - oy } : a));
    const up = () => { window.removeEventListener('mousemove', mv); window.removeEventListener('mouseup', up); };
    window.addEventListener('mousemove', mv);
    window.addEventListener('mouseup', up);
  };

  const placeSig = () => {
    if (!sigRef.current || sigRef.current.isEmpty()) return;
    const dataUrl = sigRef.current.toDataURL();
    const c = mainCanvasRef.current;
    const w = Math.min(220, (c?.width || 400) * 0.35), h = w * 0.4;
    setAnnotations(p => [...p, { id: uid(), page: currentPage, type: 'signature', x: (c?.width || 400)/2 - w/2, y: (c?.height || 300)/2 - h/2, width: w, height: h, dataUrl }]);
    setShowSig(false);
  };

  const handleUndo = () => {
    if (editingId) { setEditingId(null); return; }
    if (annotations.length) setAnnotations(p => p.slice(0, -1));
  };

  // ── Save PDF ──────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!pdfBytes) return;
    try {
      const doc  = await PDFDocument.load(pdfBytes);
      const hv   = await doc.embedFont(StandardFonts.Helvetica);
      const hvB  = await doc.embedFont(StandardFonts.HelveticaBold);
      const pages = doc.getPages();

      for (let pi = 0; pi < pages.length; pi++) {
        const pg     = pages[pi];
        const pgNum  = pi + 1;
        const { height: pgH } = pg.getSize();

        const toX = cx => cx / zoom;
        const toY = cy => pgH - cy / zoom;

        // 1. Text edits (cover old + draw new)
        for (const [id, newText] of Object.entries(textEdits)) {
          const item = textItems.find(t => t.id === id && t.page === pgNum);
          if (!item) continue;

          const fs  = item.pdfFontSize;
          const pad = fs * 0.2;

          // White-out rectangle over old text
          pg.drawRectangle({
            x: item.pdfTx - pad,
            y: item.pdfTy - fs * 0.35,
            width:  Math.max(item.pdfW + pad * 2, newText.length * fs * 0.6 + pad * 2),
            height: fs * 1.3,
            color:  rgb(1, 1, 1),
            opacity: 1,
          });

          // Draw replacement text
          pg.drawText(newText, {
            x: item.pdfTx,
            y: item.pdfTy - fs * 0.05,
            font:  item.bold ? hvB : hv,
            size:  Math.max(fs, 4),
            color: rgb(0, 0, 0),
          });
        }

        // 2. Add-text annotations + other overlays
        const pageAnnots = annotations.filter(a => a.page === pgNum);
        for (const a of pageAnnots) {
          if (a.type === 'text' && a.text) {
            const ptSz  = a.fontSize / zoom;
            const lines = a.text.split('\n');
            const maxL  = Math.max(...lines.map(l => l.length));
            const rW    = maxL * ptSz * 0.55 + ptSz * 0.6;
            const rH    = lines.length * ptSz * 1.35 + ptSz * 0.4;

            if (a.bgColor && a.bgColor !== 'transparent') {
              pg.drawRectangle({ x: toX(a.x) - ptSz*0.15, y: toY(a.y) - rH + ptSz*0.3, width: rW, height: rH, color: hexToRgb(a.bgColor), opacity: 1 });
            }
            lines.forEach((line, i) => {
              if (!line) return;
              pg.drawText(line, { x: toX(a.x), y: toY(a.y) - (i+1)*ptSz*1.35 + ptSz*1.0, font: hv, size: ptSz, color: hexToRgb(a.color) });
            });
          }
          if (a.type === 'highlight')
            pg.drawRectangle({ x: toX(a.x), y: toY(a.y) - a.height/zoom, width: a.width/zoom, height: a.height/zoom, color: hexToRgb(a.color), opacity: 0.35 });
          if (a.type === 'rectangle')
            pg.drawRectangle({ x: toX(a.x), y: toY(a.y) - a.height/zoom, width: a.width/zoom, height: a.height/zoom, borderColor: hexToRgb(a.color), borderWidth: 2/zoom, opacity: 0 });
          if ((a.type === 'signature' || a.type === 'drawing') && a.dataUrl) {
            try {
              const img = await doc.embedPng(dataUrlBytes(a.dataUrl));
              pg.drawImage(img, { x: toX(a.x), y: toY(a.y) - a.height/zoom, width: a.width/zoom, height: a.height/zoom, opacity: 0.95 });
            } catch {}
          }
        }
      }

      dlBytes(await doc.save(), fileName.replace('.pdf', '') + '_edited.pdf');
    } catch (e) { console.error('Save error:', e); }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  function hexToRgb(hex) {
    if (!hex || hex === 'transparent') return rgb(0, 0, 0);
    return rgb(parseInt(hex.slice(1,3),16)/255, parseInt(hex.slice(3,5),16)/255, parseInt(hex.slice(5,7),16)/255);
  }
  function dataUrlBytes(dataUrl) {
    const b = atob(dataUrl.split(',')[1]);
    const a = new Uint8Array(b.length);
    for (let i = 0; i < b.length; i++) a[i] = b.charCodeAt(i);
    return a;
  }
  function dlBytes(bytes, name) {
    const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
    const a = document.createElement('a');
    a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
  }

  // Ghost rect for drag drawing
  const ghost = drawState ? {
    left:   Math.min(drawState.sx, drawState.cx),
    top:    Math.min(drawState.sy, drawState.cy),
    width:  Math.abs(drawState.cx - drawState.sx),
    height: Math.abs(drawState.cy - drawState.sy),
  } : null;

  const pageAnnots = annotations.filter(a => a.page === currentPage);
  const editCount  = Object.keys(textEdits).length;

  // ── Upload screen ─────────────────────────────────────────────────────────
  if (!pdfDoc) {
    return (
      <div className="pdf-editor-root">
        <div className="pdf-editor-header">
          <div className="pdf-editor-title"><FileEdit size={22}/><span>PDF Editor</span></div>
          <p className="pdf-editor-subtitle">
            Upload any PDF to edit existing text, add annotations, sign, and export — 100% client-side.
          </p>
        </div>

        <div
          className={`pdf-upload-zone ${dragging ? 'dragging' : ''}`}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button" tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && fileInputRef.current?.click()}
          id="pdf-upload-zone"
        >
          <input ref={fileInputRef} type="file" accept=".pdf,application/pdf"
            style={{ display: 'none' }}
            onChange={e => handleFile(e.target.files[0])}
            id="pdf-file-input" />
          <div className="pdf-upload-icon"><Upload size={44}/></div>
          <p className="pdf-upload-text">Drop a PDF here or click to browse</p>
          <p className="pdf-upload-hint">Offer letters · HR letters · Tax forms · Payslips · Any PDF</p>
        </div>

        <div className="pdf-features-grid">
          {[
            { icon: <Edit3 size={17}/>,         label: 'Edit Existing Text' },
            { icon: <Type size={17}/>,          label: 'Add New Text' },
            { icon: <Highlighter size={17}/>,   label: 'Highlight' },
            { icon: <PenLine size={17}/>,       label: 'Freehand Draw' },
            { icon: <FileSignature size={17}/>, label: 'Signature' },
            { icon: <Download size={17}/>,      label: 'Export PDF' },
          ].map(f => <div key={f.label} className="pdf-feature-chip">{f.icon}<span>{f.label}</span></div>)}
        </div>
      </div>
    );
  }

  // ── Editor screen ─────────────────────────────────────────────────────────
  return (
    <div className="pdf-editor-root">

      {/* ── Top Bar ── */}
      <div className="pdf-editor-topbar">
        <div className="pdf-editor-topbar-left">
          <FileEdit size={17}/>
          <span className="pdf-file-name" title={fileName}>{fileName}</span>
          <span className="pdf-page-badge">{totalPages} page{totalPages !== 1 ? 's' : ''}</span>
          {editCount > 0 && <span className="pdf-edit-count-badge">{editCount} edit{editCount !== 1 ? 's' : ''}</span>}
        </div>
        <div className="pdf-editor-topbar-right">
          <button className="pdf-action-btn secondary" onClick={handleUndo} id="pdf-undo-btn">
            <RotateCcw size={14}/> Undo
          </button>
          <button
            className={`pdf-action-btn secondary ${formatOpen ? 'active-btn' : ''}`}
            onClick={() => setFormatOpen(p => !p)} title="Toggle Format Panel"
          >
            <SlidersHorizontal size={14}/> Format
          </button>
          <button className="pdf-action-btn primary" onClick={handleSave} id="pdf-save-btn">
            <Download size={14}/> Save PDF
          </button>
          <button className="pdf-action-btn secondary" id="pdf-close-btn"
            onClick={() => { setPdfDoc(null); setPdfBytes(null); setFileName(''); setAnnotations([]); setTextItems([]); setTextEdits({}); setThumbnails([]); }}>
            <X size={14}/> Close
          </button>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="pdf-toolbar">
        {/* Mode buttons */}
        <div className="pdf-tool-group">
          {MODES.map(({ id, label, Icon }) => (
            <button key={id}
              className={`pdf-tool-btn ${mode === id ? 'active' : ''}`}
              onClick={() => { setMode(id); setEditingId(null); setSelectedId(null); }}
              title={label} id={`pdf-mode-${id}`}>
              <Icon size={14}/><span>{label}</span>
            </button>
          ))}
        </div>

        <div className="pdf-tool-divider"/>

        {/* Color */}
        <div className="pdf-tool-group">
          <Palette size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }}/>
          {INK_COLORS.map(c => (
            <button key={c}
              className={`pdf-color-dot ${inkColor === c ? 'selected' : ''}`}
              style={{ background: c, border: c === '#ffffff' ? '2px solid #666' : undefined }}
              onClick={() => setInkColor(c)} title={c}/>
          ))}
          <input type="color" value={inkColor} onChange={e => setInkColor(e.target.value)}
            className="pdf-color-custom" title="Custom color"/>
        </div>

        {/* BG color (only for addText) */}
        {mode === 'addText' && (<>
          <div className="pdf-tool-divider"/>
          <div className="pdf-tool-group">
            <span className="pdf-label">BG</span>
            {['#ffffff','#fffde7','#e8f5e9','#e3f2fd','transparent'].map(c => (
              <button key={c}
                className={`pdf-color-dot ${textBg === c ? 'selected' : ''}`}
                style={{ background: c === 'transparent' ? 'linear-gradient(135deg,#fff 50%,#f44 50%)' : c, border: '2px solid #555' }}
                onClick={() => setTextBg(c)} title={c === 'transparent' ? 'No background' : c}/>
            ))}
            <input type="color" value={textBg === 'transparent' ? '#ffffff' : textBg}
              onChange={e => setTextBg(e.target.value)} className="pdf-color-custom"/>
          </div>
          <div className="pdf-tool-divider"/>
          <div className="pdf-tool-group">
            <span className="pdf-label">Size</span>
            <input type="range" min={6} max={48} value={fontSize}
              onChange={e => setFontSize(Number(e.target.value))} className="pdf-font-slider"/>
            <span className="pdf-label">{fontSize}px</span>
          </div>
        </>)}

        <div className="pdf-tool-divider"/>

        {/* Zoom */}
        <div className="pdf-tool-group">
          <button className="pdf-tool-btn" onClick={() => setZoom(z => Math.min(3, +(z+0.2).toFixed(1)))} id="pdf-zoom-in"><ZoomIn size={14}/></button>
          <span className="pdf-label">{Math.round(zoom*100)}%</span>
          <button className="pdf-tool-btn" onClick={() => setZoom(z => Math.max(0.4, +(z-0.2).toFixed(1)))} id="pdf-zoom-out"><ZoomOut size={14}/></button>
        </div>

        <div className="pdf-tool-divider"/>

        <button className={`pdf-tool-btn ${sidebarOpen ? 'active' : ''}`}
          onClick={() => setSidebarOpen(o => !o)} title="Page thumbnails" id="pdf-sidebar-toggle">
          <LayoutGrid size={14}/>
        </button>

        {selAnnotId && (<>
          <div className="pdf-tool-divider"/>
          <button className="pdf-tool-btn danger"
            onClick={() => { setAnnotations(p => p.filter(a => a.id !== selAnnotId)); setSelAnnotId(null); }}>
            <Trash2 size={13}/> Delete
          </button>
        </>)}
      </div>

      {/* ── Main Layout ── */}
      <div className="pdf-editor-layout">

        {/* Sidebar thumbnails */}
        {sidebarOpen && (
          <aside className="pdf-sidebar">
            {thumbnails.map((src, i) => (
              <div key={i}
                className={`pdf-thumb-wrap ${currentPage === i+1 ? 'active' : ''}`}
                onClick={() => setCurrentPage(i+1)}>
                <img src={src} alt={`Page ${i+1}`} className="pdf-thumb-img"/>
                <span className="pdf-thumb-label">{i+1}</span>
              </div>
            ))}
          </aside>
        )}

        {/* Canvas area */}
        <div className="pdf-canvas-wrapper" id="pdf-canvas-wrapper">
          <div className="pdf-canvas-inner" style={{ position: 'relative', display: 'inline-block' }}>
            {/* PDF render */}
            <canvas ref={mainCanvasRef} className="pdf-main-canvas"/>

            {/* Freehand draw canvas */}
            <canvas ref={drawCanvasRef} className="pdf-draw-canvas"
              style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}/>

            {/* ── Text layer: clickable overlays for Edit Text mode ── */}
            {mode === 'editText' && (
              <div className="pdf-text-layer" style={{
                position: 'absolute', top: 0, left: 0,
                width:  mainCanvasRef.current?.width  || '100%',
                height: mainCanvasRef.current?.height || '100%',
                pointerEvents: 'none',
              }}>
                {textItems.map(item => {
                  const isEditing  = editingId  === item.id;
                  const isSelected = selectedId === item.id;
                  const isHovered  = hoveredId  === item.id;
                  const wasEdited  = item.id in textEdits;
                  const displayVal = textEdits[item.id] ?? item.str;

                  return (
                    <div key={item.id}
                      className={[
                        'pdf-text-item',
                        isSelected ? 'selected' : '',
                        isHovered  ? 'hovered'  : '',
                        wasEdited  ? 'edited'   : '',
                      ].join(' ')}
                      style={{
                        position:   'absolute',
                        left:       item.x,
                        top:        item.y,
                        width:      Math.max(item.w, 8),
                        height:     item.h,
                        pointerEvents: 'auto',
                        cursor:     'text',
                        fontSize:   item.fontSizePx,
                        fontFamily: item.fontFamily,
                        fontWeight: item.bold   ? 'bold'   : 'normal',
                        fontStyle:  item.italic ? 'italic' : 'normal',
                        lineHeight: 1.2,
                        boxSizing:  'border-box',
                      }}
                      onClick={e     => onTextClick(e, item)}
                      onDoubleClick={e => onTextDblClick(e, item)}
                      onMouseEnter={() => setHoveredId(item.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      title={isEditing ? undefined : `"${item.str}" — double-click to edit`}
                    >
                      {isEditing && (
                        <input
                          autoFocus
                          className="pdf-inline-input"
                          style={{
                            fontSize:   item.fontSizePx,
                            fontFamily: item.fontFamily,
                            fontWeight: item.bold   ? 'bold'   : 'normal',
                            fontStyle:  item.italic ? 'italic' : 'normal',
                            minWidth:   Math.max(item.w * 2.5, 100),
                            color:      '#000',
                          }}
                          defaultValue={displayVal}
                          onKeyDown={e => {
                            if (e.key === 'Escape') { e.preventDefault(); setEditingId(null); }
                            if (e.key === 'Enter')  { e.preventDefault(); commitEdit(item.id, e.target.value); }
                          }}
                          onBlur={e => commitEdit(item.id, e.target.value)}
                          onPointerDown={e => e.stopPropagation()}
                          onClick={e => e.stopPropagation()}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── Annotation layer: add-text, highlight, draw etc. ── */}
            <div
              ref={annotLayerRef}
              className={`pdf-annotation-layer pdf-cursor-${mode}`}
              onPointerDown={onLayerDown}
              onPointerMove={onLayerMove}
              onPointerUp={onLayerUp}
              style={{
                position: 'absolute', top: 0, left: 0,
                width:  mainCanvasRef.current?.width  || '100%',
                height: mainCanvasRef.current?.height || '100%',
                // Disable annot layer in editText mode so text items receive events
                pointerEvents: mode === 'editText' ? 'none' : 'auto',
              }}
            >
              {ghost && (
                <div className={`pdf-ghost-rect ${mode}`}
                  style={{ left: ghost.left, top: ghost.top, width: ghost.width, height: ghost.height, borderColor: inkColor, background: mode === 'highlight' ? inkColor : 'transparent' }}/>
              )}
              {pageAnnots.map(annot => (
                <AnnotView key={annot.id} annot={annot}
                  isSelected={selAnnotId === annot.id}
                  activeMode={mode}
                  onMouseDown={e => startDrag(e, annot.id)}
                  onClick={e => { e.stopPropagation(); if (mode === 'select') setSelAnnotId(annot.id); }}
                  onDoubleClick={() => reEditAnnot(annot.id)}
                  onTextChange={t => updateAnnotText(annot.id, t)}
                  onTextBlur={() => finishAnnotEdit(annot.id)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── Format Panel (right side) ── */}
        {formatOpen && (
          <aside className="pdf-format-panel">
            <div className="pdf-format-header">
              <SlidersHorizontal size={14}/>
              <span>Format</span>
            </div>

            {selectedItem ? (
              <div className="pdf-format-content">

                {/* Font info */}
                <div className="pdf-format-section">
                  <div className="pdf-format-section-label">Text Style</div>
                  <div className="pdf-format-font-name">{selectedItem.fontFamily}</div>
                  <div className="pdf-format-meta-row">
                    <span className="pdf-format-size-pill">
                      {(selectedItem.pdfFontSize * 0.75).toFixed(1)} pt
                    </span>
                    <span className="pdf-format-size-pill" style={{ opacity: 0.6 }}>
                      {Math.round(selectedItem.fontSizePx)}px @{Math.round(zoom*100)}%
                    </span>
                  </div>
                  <div className="pdf-format-badge-row">
                    {selectedItem.bold   && <span className="pdf-format-badge bold">B</span>}
                    {selectedItem.italic && <span className="pdf-format-badge italic">I</span>}
                    {!selectedItem.bold && !selectedItem.italic && <span className="pdf-format-badge">Regular</span>}
                  </div>
                </div>

                {/* Original text */}
                <div className="pdf-format-section">
                  <div className="pdf-format-section-label">Original Text</div>
                  <div className="pdf-format-text-preview">{selectedItem.str}</div>
                </div>

                {/* Edited value */}
                {textEdits[selectedItem.id] && (
                  <div className="pdf-format-section">
                    <div className="pdf-format-section-label" style={{ color: 'var(--accent-emerald)' }}>✎ Edited To</div>
                    <div className="pdf-format-text-preview" style={{ color: 'var(--accent-emerald)', borderColor: 'var(--accent-emerald-glow)' }}>
                      {textEdits[selectedItem.id]}
                    </div>
                    <button className="pdf-format-revert-btn" onClick={() => revertEdit(selectedItem.id)}>↩ Revert</button>
                  </div>
                )}

                {/* Edit button */}
                <div className="pdf-format-section">
                  <button
                    className="pdf-action-btn primary"
                    style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem' }}
                    onClick={() => setEditingId(selectedItem.id)}
                  >
                    <Edit3 size={13}/> Double-click or click here to edit
                  </button>
                  <p className="pdf-format-tip">
                    Press <kbd>Enter</kbd> to save · <kbd>Esc</kbd> to cancel
                  </p>
                </div>
              </div>
            ) : (
              <div className="pdf-format-empty">
                <Edit3 size={28} style={{ opacity: 0.22 }}/>
                <p>
                  {mode === 'editText'
                    ? 'Click any text in the PDF to see its font info, then double-click to edit it'
                    : 'Switch to "Edit Text" mode to select and edit existing PDF text'}
                </p>
              </div>
            )}

            {/* Edit summary */}
            {editCount > 0 && (
              <div className="pdf-format-edits-footer">
                <span>{editCount} pending edit{editCount !== 1 ? 's' : ''}</span>
                <button className="pdf-format-revert-btn" onClick={() => setTextEdits({})}>Clear all</button>
              </div>
            )}
          </aside>
        )}
      </div>

      {/* ── Page Navigation ── */}
      <div className="pdf-page-nav">
        <button className="pdf-nav-btn" onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage <= 1} id="pdf-prev-page">
          <ChevronLeft size={18}/>
        </button>
        <span className="pdf-page-info">Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong></span>
        <button className="pdf-nav-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage >= totalPages} id="pdf-next-page">
          <ChevronRight size={18}/>
        </button>
      </div>

      {/* ── Signature Modal ── */}
      {showSig && (
        <div className="pdf-modal-backdrop" onClick={() => setShowSig(false)}>
          <div className="pdf-modal glass-panel" onClick={e => e.stopPropagation()}>
            <div className="pdf-modal-header">
              <h3><FileSignature size={17}/> Draw Signature</h3>
              <button className="pdf-modal-close" onClick={() => setShowSig(false)}><X size={17}/></button>
            </div>
            <div className="pdf-sig-canvas-wrap">
              <SignatureCanvas ref={sigRef} penColor={inkColor}
                canvasProps={{ className: 'pdf-sig-canvas', id: 'pdf-signature-canvas' }}/>
            </div>
            <div className="pdf-modal-actions">
              <button className="pdf-action-btn secondary" onClick={() => sigRef.current?.clear()}>Clear</button>
              <button className="pdf-action-btn primary" onClick={placeSig}>Place Signature</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Annotation view sub-component ─────────────────────────────────────────────
function AnnotView({ annot, isSelected, activeMode, onMouseDown, onClick, onDoubleClick, onTextChange, onTextBlur }) {
  const base = {
    position: 'absolute', left: annot.x, top: annot.y,
    cursor:   activeMode === 'select' ? 'move' : 'default',
    outline:  isSelected ? '2px dashed #6366f1' : 'none',
    outlineOffset: 2,
  };

  if (annot.type === 'text') {
    const bgSty = annot.bgColor && annot.bgColor !== 'transparent'
      ? { background: annot.bgColor, padding: '2px 4px', borderRadius: 2 } : {};
    return (
      <div style={base}
        onPointerDown={e => e.stopPropagation()}
        onMouseDown={e => { e.stopPropagation(); if (!annot.editing) onMouseDown(e); }}
        onClick={e => { e.stopPropagation(); onClick(e); }}
        onDoubleClick={e => { e.stopPropagation(); onDoubleClick(); }}
      >
        {annot.editing ? (
          <textarea autoFocus className="pdf-text-box"
            style={{
              color: annot.color, fontSize: annot.fontSize,
              background: annot.bgColor && annot.bgColor !== 'transparent' ? annot.bgColor : 'rgba(10,15,30,0.55)',
              border: '1.5px dashed rgba(99,102,241,0.7)',
            }}
            value={annot.text}
            onChange={e => onTextChange(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Escape') onTextBlur();
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onTextBlur(); }
            }}
            onPointerDown={e => e.stopPropagation()}
            onClick={e => e.stopPropagation()}
            placeholder="Type here · Enter to place"/>
        ) : (
          <div className="pdf-text-label"
            style={{ color: annot.color, fontSize: annot.fontSize, fontFamily: 'inherit', whiteSpace: 'pre-wrap', ...bgSty }}
            title="Double-click to edit">
            {annot.text || <span style={{ opacity: 0.4 }}>Text…</span>}
          </div>
        )}
      </div>
    );
  }
  if (annot.type === 'highlight') return (
    <div style={{ ...base, width: annot.width, height: annot.height, background: annot.color, opacity: 0.35, borderRadius: 2 }}
      onMouseDown={onMouseDown} onClick={onClick}/>
  );
  if (annot.type === 'rectangle') return (
    <div style={{ ...base, width: annot.width, height: annot.height, border: `2.5px solid ${annot.color}`, borderRadius: 3, background: 'transparent' }}
      onMouseDown={onMouseDown} onClick={onClick}/>
  );
  if (annot.type === 'signature' || annot.type === 'drawing') return (
    <img src={annot.dataUrl} alt={annot.type} draggable={false}
      style={{ ...base, width: annot.width, height: annot.height, display: 'block', pointerEvents: 'auto' }}
      onMouseDown={onMouseDown} onClick={onClick}/>
  );
  return null;
}

export default PdfEditor;
