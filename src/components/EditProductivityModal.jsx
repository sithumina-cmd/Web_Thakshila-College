import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Trophy,
  Video,
  Upload,
  Plus,
  Trash2,
  Save,
  Image as ImageIcon,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Eye
} from 'lucide-react';
import { DEFAULT_SCHOOL_CONFIG } from '../config';
import { compressImageFile } from '../utils/imageHelpers';

export function getYouTubeEmbedUrl(url) {
  if (!url) return 'https://www.youtube.com/embed/r1cWbnvVHao';
  const str = String(url).trim();
  const shortMatch = str.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch && shortMatch[1]) {
    return `https://www.youtube.com/embed/${shortMatch[1]}`;
  }
  const watchMatch = str.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (watchMatch && watchMatch[1]) {
    return `https://www.youtube.com/embed/${watchMatch[1]}`;
  }
  if (str.includes('/embed/')) {
    return str.split('?')[0];
  }
  return 'https://www.youtube.com/embed/r1cWbnvVHao';
}

export default function EditProductivityModal({
  isOpen,
  onClose,
  settings,
  onSaveSettings
}) {
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const merged = { ...DEFAULT_SCHOOL_CONFIG, ...(settings || {}) };
      setFormData({
        productivityTitle:
          merged.productivityTitle ||
          'National Productivity Awards — 2nd Place in Sri Lanka',
        productivitySinhalaTitle:
          merged.productivitySinhalaTitle ||
          'ජාතික ඵලදායිතා සම්මාන — සමස්ත ලංකා දෙවන ස්ථානය',
        productivitySubtitle:
          merged.productivitySubtitle ||
          'Advanced Level Schools Category | National Productivity Secretariat',
        productivityVideoUrl:
          merged.productivityVideoUrl ||
          'https://youtu.be/r1cWbnvVHao?si=qMkAmTCHn8aDzW_H',
        productivityDesc:
          merged.productivityDesc ||
          DEFAULT_SCHOOL_CONFIG.productivityDesc ||
          '',
        productivityPhotos: Array.isArray(merged.productivityPhotos) && merged.productivityPhotos.length > 0
          ? merged.productivityPhotos.map((p) => ({ ...p }))
          : DEFAULT_SCHOOL_CONFIG.productivityPhotos || []
      });
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file, 1200, 0.85);
      if (compressed) {
        const newPhoto = {
          id: `prod-photo-${Date.now()}`,
          url: compressed,
          title: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
          caption: 'National Productivity Award Celebration moment.'
        };
        setFormData((prev) => ({
          ...prev,
          productivityPhotos: [newPhoto, ...(prev.productivityPhotos || [])]
        }));
      }
    } finally {
      e.target.value = '';
    }
  };

  const handleUpdatePhotoField = (idx, field, value) => {
    setFormData((prev) => {
      const copy = [...(prev.productivityPhotos || [])];
      copy[idx] = { ...copy[idx], [field]: value };
      return { ...prev, productivityPhotos: copy };
    });
  };

  const handleDeletePhoto = (idx) => {
    setFormData((prev) => ({
      ...prev,
      productivityPhotos: (prev.productivityPhotos || []).filter((_, i) => i !== idx)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSaveSettings(formData);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const currentEmbed = getYouTubeEmbedUrl(formData.productivityVideoUrl);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="fb-create-modal productivity-edit-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="fb-modal-header">
          <div className="modal-title-with-icon">
            <Trophy size={22} className="sparkle-gold" />
            <div>
              <h3>Manage Productivity Win (2nd Place in Sri Lanka)</h3>
              <p className="modal-subtitle-text">
                Update documentary video, celebration narrative, and upload victory gallery photos
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="fb-modal-body">
          {/* Section 1: Award Titles & YouTube Video */}
          <div className="settings-section-card">
            <h4>
              <Video size={16} /> 1. Award Video &amp; Official Headlines
            </h4>

            <div className="fb-meta-grid">
              <div className="meta-field">
                <label>Main Title (English)</label>
                <input
                  type="text"
                  value={formData.productivityTitle || ''}
                  onChange={(e) => handleChange('productivityTitle', e.target.value)}
                  placeholder="National Productivity Awards — 2nd Place in Sri Lanka"
                />
              </div>

              <div className="meta-field">
                <label>Sinhala Heading (විශේෂ සිරස්තලය)</label>
                <input
                  type="text"
                  value={formData.productivitySinhalaTitle || ''}
                  onChange={(e) => handleChange('productivitySinhalaTitle', e.target.value)}
                  placeholder="ජාතික ඵලදායිතා සම්මාන — සමස්ත ලංකා දෙවන ස්ථානය"
                />
              </div>
            </div>

            <div className="meta-field" style={{ marginTop: '10px' }}>
              <label>Subtitle &amp; Category Details</label>
              <input
                type="text"
                value={formData.productivitySubtitle || ''}
                onChange={(e) => handleChange('productivitySubtitle', e.target.value)}
                placeholder="Advanced Level Schools Category | National Productivity Secretariat 2025/2026"
              />
            </div>

            <div className="meta-field" style={{ marginTop: '10px' }}>
              <label>
                <Video size={13} /> YouTube Video Link (යූටියුබ් වීඩියෝ සබැඳිය)
              </label>
              <input
                type="text"
                value={formData.productivityVideoUrl || ''}
                onChange={(e) => handleChange('productivityVideoUrl', e.target.value)}
                placeholder="https://youtu.be/r1cWbnvVHao?si=... or https://www.youtube.com/watch?v=..."
              />
            </div>

            {/* Live Video Embed Preview */}
            <div className="modal-video-preview-wrap" style={{ marginTop: '12px' }}>
              <span className="preview-label">Live Video Player Preview:</span>
              <div className="video-responsive-embed">
                <iframe
                  src={currentEmbed}
                  title="YouTube video player preview"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>

            <div className="meta-field" style={{ marginTop: '12px' }}>
              <label>Achievement Narrative &amp; Story (ජයග්‍රහණය පිළිබඳ විස්තරය)</label>
              <textarea
                rows={4}
                value={formData.productivityDesc || ''}
                onChange={(e) => handleChange('productivityDesc', e.target.value)}
                placeholder="Details of the victory, 5S culture, and national distinction..."
              />
            </div>
          </div>

          {/* Section 2: Photo Gallery Manager (Upload & Manage) */}
          <div className="settings-section-card" style={{ marginTop: '16px' }}>
            <div className="card-header-with-add">
              <div>
                <h4>
                  <ImageIcon size={16} /> 2. Victory Celebration Photo Gallery
                </h4>
                <p className="card-header-sub">
                  Upload photos of the award ceremony, trophy presentation, and school 5S initiatives
                </p>
              </div>

              <button
                type="button"
                className="btn-inline-add"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={14} />
                <span>Upload New Photo</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                style={{ display: 'none' }}
              />
            </div>

            <div className="productivity-modal-photos-list">
              {(!formData.productivityPhotos || formData.productivityPhotos.length === 0) ? (
                <div className="empty-photos-notice">
                  <CameraPlaceholder />
                  <p>No custom photos added yet. Click <strong>Upload New Photo</strong> above to add award ceremony and celebration photos!</p>
                </div>
              ) : (
                formData.productivityPhotos.map((photo, idx) => (
                  <div key={photo.id || idx} className="repeater-row-card prod-photo-edit-card">
                    <div className="prod-edit-thumb-wrap">
                      <img src={photo.url} alt={photo.title || 'Productivity Photo'} />
                    </div>

                    <div className="prod-edit-fields-wrap">
                      <div className="meta-field">
                        <label>Photo Title / Moment</label>
                        <input
                          type="text"
                          value={photo.title || ''}
                          onChange={(e) => handleUpdatePhotoField(idx, 'title', e.target.value)}
                          placeholder="e.g. Award Ceremony at BMICH"
                        />
                      </div>
                      <div className="meta-field" style={{ marginTop: '6px' }}>
                        <label>Caption / Short Description</label>
                        <input
                          type="text"
                          value={photo.caption || ''}
                          onChange={(e) => handleUpdatePhotoField(idx, 'caption', e.target.value)}
                          placeholder="e.g. Principal and teachers receiving the All-Island 2nd Place award."
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn-inline-del"
                      onClick={() => handleDeletePhoto(idx)}
                      title="Delete this photo"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="fb-modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary-action"
              disabled={saving}
            >
              <Save size={15} />
              <span>{saving ? 'Saving...' : 'Save & Publish Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CameraPlaceholder() {
  return (
    <div style={{ textAlign: 'center', padding: '16px 0', color: '#94a3b8' }}>
      <ImageIcon size={32} style={{ margin: '0 auto 8px', opacity: 0.6 }} />
    </div>
  );
}
