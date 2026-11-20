import React, { useState, useEffect, useRef } from 'react';
import {
  Award,
  Image,
  Calendar,
  Tag,
  X,
  Upload,
  Link2,
  Sparkles,
  Save,
  CheckCircle2,
  User
} from 'lucide-react';
import { compressImageFile } from '../utils/imageHelpers';

export default function EditPrincipalModal({
  isOpen,
  onClose,
  onSave,
  editingPrincipal
}) {
  const [name, setName] = useState('');
  const [period, setPeriod] = useState('');
  const [tenure, setTenure] = useState('');
  const [designation, setDesignation] = useState('');
  const [image, setImage] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [showUrlField, setShowUrlField] = useState(false);
  const [contribution, setContribution] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef(null);

  const PRESET_IMAGES = [
    { label: 'Executive Office (Modern)', path: '/Pictures/principal-office-1.jpg' },
    { label: 'Classic Library (Vintage)', path: '/Pictures/principal-office-vintage.jpg' }
  ];

  useEffect(() => {
    if (editingPrincipal) {
      setName(editingPrincipal.name || '');
      setPeriod(editingPrincipal.period || '');
      setTenure(editingPrincipal.tenure || '');
      setDesignation(editingPrincipal.designation || 'Principal (SLPS Special Grade)');
      setImage(editingPrincipal.image || '/Pictures/principal-office-1.jpg');
      setContribution(editingPrincipal.contribution || '');
      setImageUrlInput('');
      setShowUrlField(false);
    } else {
      setName('');
      setPeriod('2026 – Present');
      setTenure('Leadership');
      setDesignation('Principal (SLPS Special Grade)');
      setImage('/Pictures/principal-office-1.jpg');
      setContribution('');
      setImageUrlInput('');
      setShowUrlField(false);
    }
  }, [editingPrincipal, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const compressed = await compressImageFile(file);
    if (compressed) {
      setImage(compressed);
    }
    e.target.value = '';
  };

  const handleApplyUrl = () => {
    if (imageUrlInput.trim()) {
      setImage(imageUrlInput.trim());
      setShowUrlField(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      await onSave({
        ...(editingPrincipal ? { id: editingPrincipal.id } : {}),
        name: name.trim(),
        period: period.trim() || 'Tenure',
        tenure: tenure.trim() || 'Distinguished Service',
        designation: designation.trim() || 'Principal (SLPS Special Grade)',
        image: image || '/Pictures/principal-office-1.jpg',
        contribution: contribution.trim()
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="fb-create-modal principal-edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="fb-modal-header">
          <div className="modal-title-with-icon">
            <Award size={20} className="sparkle-gold" />
            <h3>
              {editingPrincipal
                ? 'Edit Past Principal Details'
                : 'Add Distinguished Past Principal'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="modal-close-btn"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="fb-modal-form">
          {/* Principal Name */}
          <div className="form-group-card">
            <label>
              <User size={15} />
              <span>Principal Full Name *</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mr. K. K. P. Senarathna"
              required
              autoFocus
            />
          </div>

          {/* Period & Tenure Grid */}
          <div className="fb-form-row">
            <div className="form-group-card flex-1">
              <label>
                <Calendar size={15} />
                <span>Service Period (Years) *</span>
              </label>
              <input
                type="text"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                placeholder="e.g. 2020 – 2026"
                required
              />
            </div>

            <div className="form-group-card flex-1">
              <label>
                <Tag size={15} />
                <span>Tenure Badge / Duration</span>
              </label>
              <input
                type="text"
                value={tenure}
                onChange={(e) => setTenure(e.target.value)}
                placeholder="e.g. 6 Years of Leadership / Incumbent"
              />
            </div>
          </div>

          {/* Designation */}
          <div className="form-group-card">
            <label>
              <Award size={15} />
              <span>Official Designation</span>
            </label>
            <input
              type="text"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              placeholder="e.g. Principal (SLPS Special Grade) / Senior Principal (SLPS-I)"
            />
          </div>

          {/* Photo Selection */}
          <div className="form-group-card">
            <label>
              <Image size={15} />
              <span>Principal Official Portrait / Photo</span>
            </label>

            <div className="principal-photo-preview-box">
              <img
                src={image || '/Pictures/principal-office-1.jpg'}
                alt="Preview"
                className="principal-preview-thumb"
              />
              <div className="principal-photo-actions">
                <span className="photo-actions-title">Choose Portrait Preset:</span>
                <div className="preset-pill-row">
                  {PRESET_IMAGES.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`preset-pill ${image === preset.path ? 'active' : ''}`}
                      onClick={() => setImage(preset.path)}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <div className="custom-photo-buttons">
                  <button
                    type="button"
                    className="btn-upload-trigger"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={14} />
                    <span>Upload Custom Photo</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />

                  <button
                    type="button"
                    className="btn-link-trigger"
                    onClick={() => setShowUrlField(!showUrlField)}
                  >
                    <Link2 size={14} />
                    <span>Enter Image URL</span>
                  </button>
                </div>

                {showUrlField && (
                  <div className="url-input-popover">
                    <input
                      type="url"
                      placeholder="Paste image URL (https://... or /Pictures/...)"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn-apply-url"
                      onClick={handleApplyUrl}
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Key Contribution / Biography */}
          <div className="form-group-card">
            <label>
              <Sparkles size={15} />
              <span>Key Achievements & Institutional Contributions</span>
            </label>
            <textarea
              rows={3}
              value={contribution}
              onChange={(e) => setContribution(e.target.value)}
              placeholder="Highlight notable campus advancements, academic milestones, sports championships, or infrastructure projects..."
            />
          </div>

          {/* Action Buttons */}
          <div className="fb-modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn-modal-cancel"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !name.trim()}
              className="btn-fb-publish"
            >
              <Save size={16} />
              <span>
                {submitting
                  ? 'Saving Details...'
                  : editingPrincipal
                  ? 'Update Principal Record'
                  : 'Add Past Principal'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
