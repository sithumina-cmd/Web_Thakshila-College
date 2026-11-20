import React, { useState, useEffect, useRef } from 'react';
import {
  BookMarked,
  Image,
  Calendar,
  Tag,
  X,
  Upload,
  Link2,
  Sparkles,
  Save
} from 'lucide-react';

export default function CreateDiaryModal({
  isOpen,
  onClose,
  onSave,
  editingEntry
}) {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [showUrlField, setShowUrlField] = useState(false);
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('School Life');
  const [author, setAuthor] = useState("Thakshila Prefects' Guild");
  const [tagsInput, setTagsInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (editingEntry) {
      setTitle(editingEntry.title || '');
      setSummary(editingEntry.summary || '');
      setContent(editingEntry.content || '');
      setImage(editingEntry.image || '');
      setDate(editingEntry.date || '');
      setCategory(editingEntry.category || 'School Life');
      setAuthor(editingEntry.author || 'Thakshila College');
      setTagsInput(
        Array.isArray(editingEntry.tags)
          ? editingEntry.tags.join(', ')
          : editingEntry.tags || ''
      );
    } else {
      setTitle('');
      setSummary('');
      setContent('');
      setImage('/Pictures/Front of School.jpeg');
      setImageUrlInput('');
      setDate(new Date().toISOString().split('T')[0]);
      setCategory('School Life');
      setAuthor('Thakshila College');
      setTagsInput('Thakshila Pride, Memories');
    }
  }, [editingEntry, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (imageUrlInput.trim()) {
      setImage(imageUrlInput.trim());
      setShowUrlField(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;

    setSubmitting(true);
    try {
      const parsedTags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await onSave({
        ...(editingEntry ? { id: editingEntry.id } : {}),
        title: title.trim(),
        summary: summary.trim(),
        content: content.trim(),
        image: image || '/Pictures/Front of School.jpeg',
        date: date || new Date().toISOString().split('T')[0],
        category,
        author: author.trim() || 'Thakshila College',
        tags: parsedTags
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="fb-create-modal" onClick={(e) => e.stopPropagation()}>
        <div className="fb-modal-header">
          <div className="modal-title-with-icon">
            <BookMarked size={20} className="sparkle-gold" />
            <h3>
              {editingEntry
                ? 'Edit Thakshila Diary Story'
                : 'Add Story to Thakshila Diary'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="modal-close-btn"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="fb-modal-form">
          <div className="form-group">
            <label className="input-label">Diary Title / Headline</label>
            <input
              type="text"
              className="fb-title-input"
              placeholder="e.g. Western Province Athletics Champions 2026..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="input-label">Short Summary (Preview quote)</label>
            <input
              type="text"
              className="fb-title-input"
              style={{ fontSize: '0.9rem', fontWeight: 500 }}
              placeholder="A brief 1-2 sentence memory summary..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="input-label">Full Story / Memory Reflection</label>
            <textarea
              rows={4}
              className="fb-content-textarea"
              placeholder="Write the full memory, reflection, or diary entry in English..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          {/* Photo Upload / Selection */}
          <div className="fb-photo-upload-box">
            <label className="input-label" style={{ marginBottom: '6px' }}>
              Diary Memory Photo / Certificate / Moment
            </label>
            {image ? (
              <div className="fb-image-preview-wrapper">
                <img src={image} alt="Diary preview" className="fb-image-preview" />
                <button
                  type="button"
                  onClick={() => setImage('')}
                  className="btn-remove-image"
                  title="Remove Photo"
                >
                  <X size={15} /> Change
                </button>
              </div>
            ) : (
              <div className="fb-upload-dropzone">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-upload-trigger"
                >
                  <Upload size={18} />
                  <span>Upload Photo from Computer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowUrlField(!showUrlField)}
                  className="btn-url-trigger"
                >
                  <Link2 size={15} />
                  <span>Use Photo URL</span>
                </button>
                <button
                  type="button"
                  onClick={() => setImage('/Pictures/Front of School.jpeg')}
                  className="btn-url-trigger"
                >
                  <span>Use School Front Photo</span>
                </button>
              </div>
            )}

            {showUrlField && !image && (
              <div className="fb-url-input-row">
                <input
                  type="url"
                  placeholder="https://example.com/photo.jpg"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="btn-apply-url"
                >
                  Apply
                </button>
              </div>
            )}
          </div>

          <div className="fb-meta-grid">
            <div className="meta-field">
              <label>
                <Calendar size={14} /> Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="meta-field">
              <label>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="School Life">School Life</option>
                <option value="Sports Diary">Sports Diary</option>
                <option value="Aesthetic & Culture">Aesthetic & Culture</option>
                <option value="Academic Milestones">Academic Milestones</option>
                <option value="Clubs & Societies">Clubs & Societies</option>
                <option value="Alumni">Alumni & Past Pupils</option>
              </select>
            </div>

            <div className="meta-field">
              <label>Author / Society</label>
              <input
                type="text"
                placeholder="e.g. Prefects' Guild, ICT Society"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </div>

            <div className="meta-field">
              <label>
                <Tag size={14} /> Tags (Comma separated)
              </label>
              <input
                type="text"
                placeholder="Sports, Champions, Grade 12"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-fb-publish"
          >
            <Save size={18} />
            <span>
              {submitting
                ? 'Saving Story...'
                : editingEntry
                ? 'Save Diary Changes'
                : 'Publish to Thakshila Diary'}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
