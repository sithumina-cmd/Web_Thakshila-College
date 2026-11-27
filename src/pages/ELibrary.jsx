import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  Download,
  FileText,
  Search,
  Plus,
  Trash2,
  X,
  Upload,
  Link2,
  GraduationCap,
  Calendar,
  Tag,
  CheckCircle2,
  FolderOpen,
  LogIn
} from 'lucide-react';
import SchoolCrest from '../components/SchoolCrest';
import { authFetch } from '../utils/api';
import { INITIAL_RESOURCES } from '../config';
import { generatePastPaperPdf } from '../utils/pdfGenerator';

const CATEGORIES = ['All', 'Past Papers', 'Term Test Papers', 'Model Papers', 'Study Notes'];
const GRADES = [
  'All Grades',
  'Grade 6 – 9',
  'G.C.E. O/L (Grade 10-11)',
  'G.C.E. A/L (Grade 12-13)',
  'General'
];

export default function ELibrary({
  settings,
  currentUser,
  isAdmin,
  isEditMode,
  showToast,
  onOpenLoginModal
}) {
  // Initialize immediately from localStorage or rich default resources
  const [resources, setResources] = useState(() => {
    try {
      const saved = localStorage.getItem('tcg_resources_offline');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_RESOURCES;
  });

  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedGrade, setSelectedGrade] = useState('All Grades');
  const [searchQuery, setSearchQuery] = useState('');

  // Admin Upload Modal State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    category: 'Past Papers',
    grade: 'G.C.E. O/L (Grade 10-11)',
    subject: '',
    year: String(new Date().getFullYear()),
    description: '',
    externalUrl: '',
    fileName: '',
    fileBase64: '',
    mimeType: 'application/pdf'
  });

  const fileInputRef = useRef(null);

  // Background fetch to sync with server when reachable
  useEffect(() => {
    let isMounted = true;
    async function syncResources() {
      try {
        const res = await authFetch('/api/resources');
        const cType = res.headers.get('content-type') || '';
        if (res.ok && cType.includes('application/json')) {
          const data = await res.json();
          if (isMounted && Array.isArray(data) && data.length > 0) {
            setResources(data);
            localStorage.setItem('tcg_resources_offline', JSON.stringify(data));
          }
        }
      } catch {
        // Keep persistent offline resources
      }
    }
    syncResources();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleFilePick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      if (showToast) showToast('Maximum file size is 15 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setForm((prev) => ({
          ...prev,
          fileName: file.name,
          mimeType: file.type || 'application/pdf',
          fileBase64: reader.result
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePublishResource = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (!form.fileBase64 && !form.externalUrl.trim()) {
      if (showToast) showToast('Please upload a PDF/file or paste a resource link.');
      return;
    }

    setUploading(true);
    let createdResource = null;

    try {
      const res = await authFetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const cType = res.headers.get('content-type') || '';
      if (res.ok && cType.includes('application/json')) {
        createdResource = await res.json();
      }
    } catch {
      // Server offline / static host fallback
    }

    if (!createdResource) {
      const id = `res-${Date.now()}`;
      const finalFileName = form.fileName
        ? form.fileName
        : `${form.title.trim().replace(/\s+/g, '_')}.pdf`;
      createdResource = {
        id,
        title: form.title.trim(),
        category: form.category || 'Past Papers',
        grade: form.grade || 'General',
        subject: form.subject.trim() || 'General',
        year: String(form.year || new Date().getFullYear()).trim(),
        description: form.description.trim(),
        fileName: finalFileName,
        fileBase64: form.fileBase64 || '',
        mimeType: form.mimeType || 'application/pdf',
        fileSize: form.fileBase64
          ? `${Math.max(1, Math.round((form.fileBase64.length * 0.75) / 1024))} KB`
          : 'External Link',
        externalUrl: form.externalUrl.trim(),
        uploadedBy: currentUser?.name || currentUser?.username || 'Administrator',
        downloads: 0,
        createdAt: new Date().toISOString()
      };
    }

    setResources((prev) => {
      const next = [createdResource, ...prev];
      localStorage.setItem('tcg_resources_offline', JSON.stringify(next));
      return next;
    });

    setUploadModalOpen(false);
    setForm({
      title: '',
      category: 'Past Papers',
      grade: 'G.C.E. O/L (Grade 10-11)',
      subject: '',
      year: String(new Date().getFullYear()),
      description: '',
      externalUrl: '',
      fileName: '',
      fileBase64: '',
      mimeType: 'application/pdf'
    });
    setUploading(false);
    if (showToast) showToast('Resource published to Student E-Library!');
  };

  const handleDeleteResource = async (id) => {
    if (!window.confirm('Are you sure you want to remove this resource from the E-Library?')) return;
    try {
      await authFetch(`/api/resources/${id}`, { method: 'DELETE' });
    } catch {}

    setResources((prev) => {
      const next = prev.filter((r) => r.id !== id);
      localStorage.setItem('tcg_resources_offline', JSON.stringify(next));
      return next;
    });
    if (showToast) showToast('Resource removed from E-Library.');
  };

  const handleDownload = async (resource) => {
    // If not signed in, prompt student login
    if (!currentUser) {
      if (onOpenLoginModal) {
        onOpenLoginModal();
        if (showToast) showToast('Please sign in to Student Portal to download academic resources.');
      }
      return;
    }

    if (resource.externalUrl && !resource.storedFile && !resource.fileBase64) {
      window.open(resource.externalUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    const triggerDownload = (blob, fileName) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);

      setResources((prev) => {
        const next = prev.map((r) =>
          r.id === resource.id ? { ...r, downloads: (r.downloads || 0) + 1 } : r
        );
        localStorage.setItem('tcg_resources_offline', JSON.stringify(next));
        return next;
      });
      if (showToast) showToast(`Downloading "${fileName}"...`);
    };

    // 1. If base64 file data exists in resource (uploaded via Admin)
    if (resource.fileBase64) {
      try {
        const base64Part = String(resource.fileBase64).includes(',')
          ? String(resource.fileBase64).split(',')[1]
          : String(resource.fileBase64);
        const byteChars = atob(base64Part);
        const byteNumbers = new Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) {
          byteNumbers[i] = byteChars.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: resource.mimeType || 'application/pdf' });
        triggerDownload(blob, resource.fileName || `${resource.title}.pdf`);
        return;
      } catch {}
    }

    // 2. Try server download endpoint
    try {
      const res = await authFetch(`/api/resources/${resource.id}/download`);
      const cType = res.headers.get('content-type') || '';
      if (res.ok && !cType.includes('text/html')) {
        const blob = await res.blob();
        triggerDownload(blob, resource.fileName || `${resource.title}.pdf`);
        return;
      }
    } catch {}

    // 3. Client-side PDF synthesis fallback (100% resilient on Vercel & static hosting)
    try {
      const pdfBlob = generatePastPaperPdf(resource);
      triggerDownload(pdfBlob, resource.fileName || `${resource.title}.pdf`);
    } catch {
      if (showToast) showToast('Could not generate PDF document.');
    }
  };

  const filteredResources = resources.filter((r) => {
    const matchCat = selectedCategory === 'All' || r.category === selectedCategory;
    const matchGrade = selectedGrade === 'All Grades' || r.grade === selectedGrade;
    const q = searchQuery.trim().toLowerCase();
    const matchSearch =
      !q ||
      (r.title || '').toLowerCase().includes(q) ||
      (r.subject || '').toLowerCase().includes(q) ||
      (r.description || '').toLowerCase().includes(q) ||
      (r.year || '').toLowerCase().includes(q);
    return matchCat && matchGrade && matchSearch;
  });

  return (
    <div className="page-elibrary">
      {/* Banner */}
      <section className="subpage-banner elibrary-banner">
        <div className="container subpage-banner-inner">
          <div className="subpage-title-with-logo">
            <SchoolCrest size={72} src={settings?.schoolLogo || '/Pictures/School Logo.png'} />
            <div>
              <span className="subpage-eyebrow">STUDENT ACADEMIC REPOSITORY</span>
              <h1>Thakshila E-Library</h1>
              {currentUser ? (
                <p className="subpage-si-title">
                  Official Past Papers, Term Test Papers, Model Papers & Study Guides • Signed in as{' '}
                  <strong>{currentUser?.name || currentUser?.username}</strong> ({currentUser?.role})
                </p>
              ) : (
                <p className="subpage-si-title">
                  Official Past Papers, Term Test Papers, Model Papers & Study Guides
                </p>
              )}
            </div>
          </div>

          <div className="subpage-admin-btn-box">
            {isAdmin && isEditMode && (
              <button
                type="button"
                onClick={() => setUploadModalOpen(true)}
                className="btn-banner-post"
              >
                <Plus size={16} />
                <span>Upload Past Paper / Resource</span>
              </button>
            )}

            {!currentUser && onOpenLoginModal && (
              <button
                type="button"
                onClick={onOpenLoginModal}
                className="btn-banner-post"
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
              >
                <LogIn size={16} />
                <span>Student Sign In</span>
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="container elibrary-wrapper">
        {/* Filter & Search Bar */}
        <div className="elibrary-filter-panel">
          <div className="elibrary-search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search past papers by subject, grade, year, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="elibrary-controls-row">
            <div className="elibrary-cat-pills">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`elib-cat-pill ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="elibrary-grade-select">
              <GraduationCap size={16} />
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                aria-label="Filter by Grade"
              >
                {GRADES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Resource Grid */}
        {loading ? (
          <div className="elibrary-empty-state">
            <BookOpen size={36} />
            <p>Loading official past papers & study resources...</p>
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="elibrary-empty-state">
            <FolderOpen size={42} />
            <h3>No Study Resources Found</h3>
            <p>Try adjusting your search keywords, category, or grade filter.</p>
          </div>
        ) : (
          <div className="elibrary-grid">
            {filteredResources.map((item) => (
              <article key={item.id} className="elibrary-card">
                <div className="elibrary-card-top">
                  <span className="elib-category-badge">
                    <Tag size={12} /> {item.category}
                  </span>
                  <span className="elib-year-badge">
                    <Calendar size={12} /> {item.year}
                  </span>
                </div>

                <div className="elibrary-card-body">
                  <div className="elib-icon-title">
                    <div className="elib-pdf-icon">
                      <FileText size={22} />
                    </div>
                    <div>
                      <span className="elib-meta-sub">
                        {item.grade} • <strong>{item.subject}</strong>
                      </span>
                      <h3>{item.title}</h3>
                    </div>
                  </div>
                  <p className="elib-desc">{item.description || 'Official college academic resource.'}</p>
                </div>

                <div className="elibrary-card-footer">
                  <div className="elib-file-meta">
                    <span>{item.fileSize || 'PDF Document'}</span>
                    <span>•</span>
                    <span>{item.downloads || 0} Downloads</span>
                  </div>

                  <div className="elib-card-actions">
                    {isAdmin && isEditMode && (
                      <button
                        type="button"
                        className="btn-elib-delete"
                        onClick={() => handleDeleteResource(item.id)}
                        title="Delete Resource from E-Library"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn-elib-download"
                      onClick={() => handleDownload(item)}
                      title={currentUser ? 'Download PDF Paper' : 'Sign In to Download'}
                    >
                      <Download size={15} />
                      <span>{currentUser ? 'Download' : 'Download'}</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Admin Upload Resource Modal */}
      {uploadModalOpen && (
        <div className="modal-backdrop" onClick={() => setUploadModalOpen(false)}>
          <div className="fb-create-modal" onClick={(e) => e.stopPropagation()}>
            <div className="fb-modal-header">
              <div className="modal-title-with-icon">
                <BookOpen size={20} className="sparkle-gold" />
                <h3>Upload Past Paper or Study Resource</h3>
              </div>
              <button
                type="button"
                onClick={() => setUploadModalOpen(false)}
                className="modal-close-btn"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handlePublishResource} className="fb-modal-form">
              <div className="form-group-card">
                <label>Resource Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Grade 11 Mathematics 2025 Term 3 Paper"
                  required
                  autoFocus
                />
              </div>

              <div className="fb-form-row">
                <div className="form-group-card flex-1">
                  <label>Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group-card flex-1">
                  <label>Grade / Level</label>
                  <select
                    value={form.grade}
                    onChange={(e) => setForm({ ...form, grade: e.target.value })}
                  >
                    {GRADES.filter((g) => g !== 'All Grades').map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="fb-form-row">
                <div className="form-group-card flex-1">
                  <label>Subject *</label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="e.g. Mathematics, Science, ICT"
                    required
                  />
                </div>
                <div className="form-group-card flex-1">
                  <label>Year</label>
                  <input
                    type="text"
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                    placeholder="2026"
                  />
                </div>
              </div>

              <div className="form-group-card">
                <label>Brief Description</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Optional details (marking scheme included, term, medium)..."
                />
              </div>

              <div className="form-group-card">
                <label>Attach PDF / Document File (Max 15 MB)</label>
                <div className="upload-file-row">
                  <button
                    type="button"
                    className="btn-upload-trigger"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={15} />
                    <span>{form.fileName ? `Selected: ${form.fileName}` : 'Choose PDF / Document'}</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                    onChange={handleFilePick}
                    style={{ display: 'none' }}
                  />
                  {form.fileBase64 && (
                    <span className="file-ready-badge">
                      <CheckCircle2 size={14} /> Ready to upload
                    </span>
                  )}
                </div>

                <label style={{ marginTop: '10px', display: 'block' }}>
                  <Link2 size={13} /> Or External Resource Link (Google Drive / PDF URL)
                </label>
                <input
                  type="url"
                  value={form.externalUrl}
                  onChange={(e) => setForm({ ...form, externalUrl: e.target.value })}
                  placeholder="https://drive.google.com/..."
                />
              </div>

              <div className="fb-modal-footer">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setUploadModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" disabled={uploading} className="btn-fb-publish">
                  <Plus size={16} />
                  <span>{uploading ? 'Publishing...' : 'Publish Resource'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
