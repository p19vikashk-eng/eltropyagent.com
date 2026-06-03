import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Plus, FileText, Table, Globe, RefreshCw, AlertCircle, CheckCircle,
         Search, ExternalLink, Upload, Link, Plug, X, ArrowRight, Check, File, Trash2 } from 'lucide-react'
import { Card, Badge, Button, Section, colors } from './ui'

const INITIAL_SOURCES = [
  {
    id: 1, name: 'Member services policy guide', type: 'pdf',
    detail: 'PDF · 84 pages · 1,240 chunks', sync: 'last sync: 14 days ago',
    status: 'active', chunks: 1240
  },
  {
    id: 2, name: 'Product rate sheet Q2 2026', type: 'sheet',
    detail: 'Spreadsheet · 3 tabs · 220 chunks', sync: 'last sync: 14 days ago',
    status: 'outdated', chunks: 220
  },
  {
    id: 3, name: 'NCUA regulatory FAQs', type: 'url',
    detail: 'URL · auto-sync weekly · 380 chunks', sync: null,
    status: 'active', chunks: 380
  },
]

const TYPE_ICON = { pdf: FileText, sheet: Table, url: Globe, doc: FileText, docx: FileText }
const TYPE_ICON_COLOR = {
  url: '#6d28d9', sheet: colors.green, pdf: colors.brand, doc: colors.brand, docx: colors.brand
}
const TYPE_BG = {
  url: '#ede9fe', sheet: '#dcfce7', pdf: '#dbeafe', doc: '#dbeafe', docx: '#dbeafe'
}

export default function KnowledgeBase() {
  const [sources, setSources] = useState(INITIAL_SOURCES)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState(null) // source id
  const [query, setQuery] = useState('')
  const [testResult, setTestResult] = useState(null)
  const [testing, setTesting] = useState(false)

  const filtered = sources.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  )

  function addSource(src) {
    setSources(prev => [...prev, { ...src, id: Date.now() }])
    setShowAdd(false)
  }

  function removeSource(id) {
    setSources(prev => prev.filter(s => s.id !== id))
    setConfirmRemove(null)
  }

  function runTest() {
    if (!query.trim()) return
    setTesting(true)
    setTestResult(null)
    setTimeout(() => {
      setTesting(false)
      setTestResult({
        answer: query.toLowerCase().includes('rate')
          ? 'Current auto loan rates: 36-month: 6.49% APR, 48-month: 6.74% APR, 60-month: 7.24% APR. Rates effective Q2 2026.'
          : 'Based on the Member Services Policy Guide (Section 4.2), address updates require OTP verification and out-of-state changes are flagged for compliance review.',
        source: query.toLowerCase().includes('rate')
          ? 'Product rate sheet Q2 2026 · Tab "Auto Loans" · Row 14–18'
          : 'Member services policy guide · Page 34 · Section 4.2',
        confidence: query.toLowerCase().includes('rate') ? 0.94 : 0.88,
        chunk: query.toLowerCase().includes('rate') ? 'chunk_0412' : 'chunk_0089',
      })
    }, 900)
  }

  return (
    <Section>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700 }}>Knowledge base</h1>
          <p style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>
            {sources.length} sources · last synced 14 days ago
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)} style={{ gap: 6 }}>
          <Plus size={14} /> Add source
        </Button>
      </div>

      {/* Search bar */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <Search size={14} color={colors.textMuted} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search sources…"
          style={{
            width: '100%', padding: '9px 12px 9px 34px',
            border: `1px solid ${colors.border}`, borderRadius: 9,
            fontSize: 13, outline: 'none', background: '#fff',
            transition: 'border-color 0.15s',
          }}
          onFocus={e => e.target.style.borderColor = colors.brand}
          onBlur={e => e.target.style.borderColor = colors.border}
        />
        {search && (
          <button onClick={() => setSearch('')} style={{
            position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer', padding: 2,
            display: 'flex', alignItems: 'center'
          }}>
            <X size={13} color={colors.textMuted} />
          </button>
        )}
      </div>

      {/* Sources list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 0', color: colors.textMuted, fontSize: 13 }}>
            No sources match "{search}"
          </div>
        )}
        {filtered.map(src => {
          const Icon = TYPE_ICON[src.type] || FileText
          return (
            <Card key={src.id} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 9, flexShrink: 0,
                background: TYPE_BG[src.type] || '#dbeafe',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Icon size={18} color={TYPE_ICON_COLOR[src.type] || colors.brand} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{src.name}</div>
                <div style={{ fontSize: 11, color: colors.textMuted }}>
                  {src.detail}{src.sync ? ` · ${src.sync}` : ''}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <button style={{
                  padding: '5px 12px', borderRadius: 7, fontSize: 12, fontWeight: 600,
                  border: `1px solid ${colors.border}`, background: '#fff', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 4, color: colors.text
                }}>
                  <RefreshCw size={12} /> {src.status === 'outdated' ? 'Update' : 'Sync'}
                </button>
                <button style={{
                  padding: '5px 12px', borderRadius: 7, fontSize: 12,
                  border: `1px solid ${colors.border}`, background: '#fff', cursor: 'pointer',
                  color: colors.textMuted
                }}>Configure</button>
                <button onClick={() => setConfirmRemove(src.id)} style={{
                  padding: '5px 8px', borderRadius: 7, fontSize: 12,
                  border: `1px solid ${colors.border}`, background: '#fff', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', color: colors.red,
                  transition: 'background 0.15s'
                }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                  title="Remove source"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'Total chunks', value: sources.reduce((a, s) => a + (s.chunks || 0), 0).toLocaleString(), sub: `Across ${sources.length} sources` },
          { label: 'Avg retrieval time', value: '120ms', sub: 'p95: 340ms' },
          { label: 'Query success rate', value: '94.2%', sub: 'Last 7 days' },
        ].map(s => (
          <Card key={s.label}>
            <div style={{ fontSize: 11, color: colors.textMuted }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, margin: '4px 0 2px' }}>{s.value}</div>
            <div style={{ fontSize: 11, color: colors.textMuted }}>{s.sub}</div>
          </Card>
        ))}
      </div>


      {showAdd && createPortal(
        <AddSourceModal onClose={() => setShowAdd(false)} onAdd={addSource} />,
        document.body
      )}

      {confirmRemove && createPortal(
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div style={{ background: '#fff', borderRadius: 12, width: 400, padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.18)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Trash2 size={18} color={colors.red} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Remove source?</div>
                <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                  {sources.find(s => s.id === confirmRemove)?.name}
                </div>
              </div>
            </div>
            <p style={{ fontSize: 12, color: colors.textMuted, lineHeight: 1.6, marginBottom: 20 }}>
              This will remove the source and all its chunks from your knowledge base. Your agents will no longer be able to retrieve content from it. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={() => setConfirmRemove(null)}>Cancel</Button>
              <Button variant="danger" onClick={() => removeSource(confirmRemove)}>
                <Trash2 size={13} /> Remove source
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </Section>
  )
}

/* ─── Add Source Modal ─── */
function AddSourceModal({ onClose, onAdd }) {
  const [step, setStep] = useState('pick')   // pick | upload | url | integration | uploading | success
  const [file, setFile] = useState(null)
  const [urlValue, setUrlValue] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef()

  const SOURCE_TYPES = [
    {
      id: 'upload',
      icon: Upload,
      label: 'Upload document',
      desc: 'PDF, Word, or spreadsheet from your computer',
      bg: '#dbeafe', color: colors.brand,
    },
    {
      id: 'url',
      icon: Link,
      label: 'Add URL',
      desc: 'Web page or online resource, auto-synced weekly',
      bg: '#ede9fe', color: '#6d28d9',
    },
    {
      id: 'integration',
      icon: Plug,
      label: 'Connect integration',
      desc: 'SharePoint, Google Drive, Confluence, or Symitar',
      bg: '#dcfce7', color: colors.green,
    },
  ]

  function handleFile(f) {
    if (!f) return
    setFile(f)
    setStep('uploading')
    setTimeout(() => setStep('success'), 1600)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }

  function finishUpload() {
    const ext = file.name.split('.').pop().toLowerCase()
    const type = ['pdf'].includes(ext) ? 'pdf' : ['xlsx','csv','tsv'].includes(ext) ? 'sheet' : 'doc'
    const sizeKb = Math.round(file.size / 1024)
    const sizeStr = sizeKb > 1024 ? `${(sizeKb/1024).toFixed(1)} MB` : `${sizeKb} KB`
    onAdd({
      name: file.name.replace(/\.[^/.]+$/, ''),
      type,
      detail: `${ext.toUpperCase()} · ${sizeStr} · indexing complete`,
      sync: `added just now`,
      status: 'active',
      chunks: Math.floor(Math.random() * 400) + 80,
    })
  }

  function handleURLSubmit() {
    if (!urlValue.trim()) return
    setStep('uploading')
    setTimeout(() => setStep('success'), 1400)
  }

  function finishURL() {
    const name = urlValue.replace(/^https?:\/\//, '').replace(/\/$/, '').split('/').pop() || urlValue
    onAdd({
      name: name.length > 40 ? name.slice(0, 40) + '…' : name,
      type: 'url',
      detail: 'URL · auto-sync weekly · indexing in progress',
      sync: null,
      status: 'active',
      chunks: 0,
    })
  }

  const INTEGRATIONS = [
    { id: 'sharepoint', label: 'SharePoint', icon: '📁' },
    { id: 'gdrive', label: 'Google Drive', icon: '🗂' },
    { id: 'confluence', label: 'Confluence', icon: '📄' },
    { id: 'symitar', label: 'Symitar Docs', icon: '🏦' },
  ]

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
    }}>
      <div style={{ background: '#fff', borderRadius: 14, width: 500, boxShadow: '0 24px 60px rgba(0,0,0,0.18)', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '18px 22px 14px', borderBottom: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {step !== 'pick' && step !== 'success' && (
              <button onClick={() => setStep('pick')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 4, borderRadius: 5 }}>
                <ArrowRight size={15} color={colors.textMuted} style={{ transform: 'rotate(180deg)' }} />
              </button>
            )}
            <span style={{ fontWeight: 700, fontSize: 15 }}>
              {step === 'pick' && 'Add source'}
              {step === 'upload' && 'Upload document'}
              {step === 'url' && 'Add URL'}
              {step === 'integration' && 'Connect integration'}
              {step === 'uploading' && 'Processing…'}
              {step === 'success' && 'Source added'}
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X size={18} color={colors.textMuted} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 22px' }}>

          {/* Step: pick type */}
          {step === 'pick' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{ fontSize: 12, color: colors.textMuted, marginBottom: 4 }}>How do you want to add content to your knowledge base?</p>
              {SOURCE_TYPES.map(opt => {
                const Icon = opt.icon
                return (
                  <div key={opt.id} onClick={() => setStep(opt.id)} style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                    borderRadius: 10, border: `1.5px solid ${colors.border}`,
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = colors.brand; e.currentTarget.style.background = colors.brandLight }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.background = '#fff' }}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: opt.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={20} color={opt.color} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{opt.label}</div>
                      <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>{opt.desc}</div>
                    </div>
                    <ArrowRight size={15} color={colors.textMuted} />
                  </div>
                )
              })}
            </div>
          )}

          {/* Step: upload doc */}
          {step === 'upload' && (
            <div>
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${dragOver ? colors.brand : colors.border}`,
                  borderRadius: 12, padding: '36px 20px', textAlign: 'center',
                  cursor: 'pointer', background: dragOver ? colors.brandLight : '#fafafa',
                  transition: 'all 0.15s', marginBottom: 14
                }}
              >
                <Upload size={28} color={dragOver ? colors.brand : colors.textMuted} style={{ margin: '0 auto 12px' }} />
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>
                  {dragOver ? 'Drop to upload' : 'Drag & drop your file here'}
                </div>
                <div style={{ fontSize: 11, color: colors.textMuted, marginBottom: 12 }}>PDF, DOCX, XLSX, CSV — max 50 MB</div>
                <span style={{
                  padding: '7px 18px', borderRadius: 7, fontSize: 12, fontWeight: 600,
                  background: '#fff', border: `1px solid ${colors.border}`, color: colors.text
                }}>Browse files</span>
                <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.xlsx,.csv,.txt"
                  style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
              </div>
              <div style={{ fontSize: 11, color: colors.textMuted, textAlign: 'center' }}>
                Files are chunked and indexed into your RAG pipeline automatically
              </div>
            </div>
          )}

          {/* Step: URL */}
          {step === 'url' && (
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: colors.textMuted, display: 'block', marginBottom: 6 }}>URL</label>
              <input
                value={urlValue} onChange={e => setUrlValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleURLSubmit()}
                autoFocus
                placeholder="https://ncua.gov/regulation/..."
                style={{ width: '100%', padding: '10px 12px', border: `1px solid ${colors.border}`, borderRadius: 8, fontSize: 13, outline: 'none', marginBottom: 10 }}
                onFocus={e => e.target.style.borderColor = colors.brand}
                onBlur={e => e.target.style.borderColor = colors.border}
              />
              <div style={{ padding: '10px 12px', background: '#f9fafb', borderRadius: 8, fontSize: 11, color: colors.textMuted, marginBottom: 16 }}>
                The page will be fetched, chunked, and indexed. Auto-sync runs weekly to pick up changes.
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <Button variant="secondary" onClick={() => setStep('pick')}>Back</Button>
                <Button onClick={handleURLSubmit} disabled={!urlValue.trim()}>Add URL</Button>
              </div>
            </div>
          )}

          {/* Step: integration */}
          {step === 'integration' && (
            <div>
              <p style={{ fontSize: 12, color: colors.textMuted, marginBottom: 14 }}>Connect a cloud storage or documentation system.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {INTEGRATIONS.map(intg => (
                  <div key={intg.id} style={{
                    padding: '16px', borderRadius: 10, border: `1.5px solid ${colors.border}`,
                    cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s'
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = colors.brand; e.currentTarget.style.background = colors.brandLight }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.background = '#fff' }}
                  >
                    <div style={{ fontSize: 26, marginBottom: 8 }}>{intg.icon}</div>
                    <div style={{ fontWeight: 600, fontSize: 12 }}>{intg.label}</div>
                    <div style={{ fontSize: 10, color: colors.brand, marginTop: 4 }}>Connect →</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step: uploading / processing */}
          {step === 'uploading' && (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                border: `3px solid ${colors.brandLight}`, borderTopColor: colors.brand,
                animation: 'spin 0.9s linear infinite', margin: '0 auto 18px'
              }} />
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>
                {file ? `Processing ${file.name}` : 'Fetching URL…'}
              </div>
              <div style={{ fontSize: 12, color: colors.textMuted }}>Chunking and indexing into your RAG pipeline…</div>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {/* Step: success */}
          {step === 'success' && (
            <div style={{ textAlign: 'center', padding: '28px 0 20px' }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%', background: '#dcfce7',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
              }}>
                <Check size={28} color={colors.green} />
              </div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Source added successfully</div>
              <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 20, lineHeight: 1.6 }}>
                {file ? (
                  <><strong style={{ color: colors.text }}>{file.name}</strong> has been indexed and is now available in your knowledge base.</>
                ) : (
                  <><strong style={{ color: colors.text }}>{urlValue}</strong> has been fetched and indexed.</>
                )}
              </div>
              <div style={{ display: 'flex', padding: '12px 14px', background: '#f0fdf4', borderRadius: 9, border: '1px solid #bbf7d0', gap: 10, textAlign: 'left', marginBottom: 20 }}>
                <CheckCircle size={16} color={colors.green} style={{ flexShrink: 0, marginTop: 1 }} />
                <div style={{ fontSize: 12, color: '#166534', lineHeight: 1.6 }}>
                  Chunking complete · Embeddings generated · Ready for RAG queries
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                <Button variant="secondary" onClick={() => { setStep('pick'); setFile(null); setUrlValue('') }}>Add another</Button>
                <Button onClick={file ? finishUpload : finishURL}>
                  <Check size={14} /> Done
                </Button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
