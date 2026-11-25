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
  FolderOpen
} from 'lucide-react';
import SchoolCrest from '../components/SchoolCrest';
import { authFetch } from '../utils/api';

const CATEGORIES = ['All', 'Past Papers', 'Term Test Papers', 'Model Papers', 'Study Notes'];
const GRADES = [
  'All Grades',
  'Grade 6 – 9',
  'G.C.E. O/L (Grade 10-11)',
  'G.C.E. A/L (Grade 12-13)',
  'General'
];

export default function ELibrary({ settings, currentUser, isAdmin, isEditMode, showToast }) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const loadResources = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/resources');
      if (res.ok) {
        const data = await res.json();
        setResources(Array.isArray(data) ? data : []);
      }
    } catch {
      if (showToast) showToast('Failed to load E-Library resources.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
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
    try {
      const res = await authFetch('/api/resources', {
        method: 'POST',
        body: JSON.stringify(form)
      });
      if (res.ok) {
        const created = await res.json();
        setResources((prev) => [created, ...prev]);
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
        if (showToast) showToast('Resource published to Student E-Library!');
      } else {
        const err = await res.json().catch(() => ({}));
        if (showToast) showToast(err.error || 'Failed to upload resource.');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteResource = async (id) => {
    if (!window.confirm('Are you sure you want to remove this resource from the E-Library?')) return;
    const res = await authFetch(`/api/resources/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setResources((prev) => prev.filter((r) => r.id !== id));
      if (showToast) showToast('Resource removed from E-Library.');
    }
  };

  const handleDownload = async (resource) => {
    if (resource.externalUrl && !resource.storedFile) {
      window.open(resource.externalUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    try {
      const res = await authFetch(`/api/resources/${resource.id}/download`);
      if (!res.ok) {
        if (showToast) showToast('Unable to download file. Please verify your session.');
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = resource.fileName || `${resource.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setResources((prev) =>
        prev.map((r) => (r.id === resource.id ? { ...r, downloads: (r.downloads || 0) + 1 } : r))
      );
      if (showToast) showToast(`Downloading "${resource.fileName || resource.title}"...`);
    } catch {
      if (showToast) showToast('Error downloading resource.');
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
      (r.description || '').toLowerCase().includes(q);
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
              <p className="subpage-si-title">
                Official Past Papers, Term Test Papers, Model Papers & Study Guides • Signed in as{' '}
                <strong>{currentUser?.name || currentUser?.username}</strong>
              </p>
            </div>
          </div>

          {isAdmin && isEditMode && (
            <div className="subpage-admin-btn-box">
              <button
                type="button"
                onClick={() => setUploadModalOpen(true)}
                className="btn-banner-post"
              >
                <Plus size={16} />
                <span>Upload Past Paper / Resource</span>
              </button>
            </div>
          )}
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
                        title="Delete Resource"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn-elib-download"
                      onClick={() => handleDownload(item)}
                    >
                      <Download size={15} />
                      <span>Download</span>
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
