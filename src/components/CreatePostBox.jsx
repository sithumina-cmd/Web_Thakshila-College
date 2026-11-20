import React, { useState, useEffect, useRef } from 'react';
import {
  Image,
  Calendar,
  Newspaper,
  MapPin,
  Clock,
  X,
  Upload,
  Sparkles,
  Pin,
  CheckCircle2,
  Link2,
  Save,
  PenTool,
  Feather,
  GraduationCap,
  Trophy,
  FileText,
  Bell,
  ShieldCheck,
  Send
} from 'lucide-react';
import SchoolCrest from './SchoolCrest';

export function QuickPostTrigger({
  isAdmin,
  onOpenModal,
  onOpenAdminLogin,
  schoolLogo
}) {
  return (
    <div className="formal-dispatch-console">
      <div className="dispatch-console-main">
        <div className="dispatch-crest-badge">
          <SchoolCrest size={56} src={schoolLogo || '/Pictures/School Logo.png'} hasBorder={false} />
          <span className="dispatch-verified-indicator" title="Authorized Publishing Bureau" />
        </div>

        <div className="dispatch-header-info">
          <div className="dispatch-eyebrow">
            <Feather size={13} className="eyebrow-gold-icon" />
            <span>OFFICIAL EDITORIAL & DISPATCH BUREAU</span>
          </div>
          <h3 className="dispatch-heading">College Gazette & News Dispatch Desk</h3>
          <p className="dispatch-subtext">
            Authorized administrative desk to draft, verify, and broadcast institutional circulars, academic bulletins, sports honors, and official event itineraries.
          </p>
        </div>

        <div className="dispatch-header-action">
          {isAdmin ? (
            <button
              type="button"
              className="btn-formal-dispatch-primary"
              onClick={() => onOpenModal('Academic')}
            >
              <PenTool size={16} />
              <span>Issue Official Dispatch</span>
            </button>
          ) : (
            <button
              type="button"
              className="btn-formal-dispatch-auth"
              onClick={onOpenAdminLogin}
            >
              <ShieldCheck size={16} />
              <span>Faculty Sign-in to Dispatch</span>
            </button>
          )}
        </div>
      </div>

      {isAdmin && (
        <div className="dispatch-channels-row">
          <span className="channels-label">Dispatch Presets:</span>
          <div className="dispatch-quick-channels">
            <button
              type="button"
              className="channel-chip academic"
              onClick={() => onOpenModal('Academic')}
            >
              <GraduationCap size={13} />
              <span>Academic Circular</span>
            </button>
            <button
              type="button"
              className="channel-chip sports"
              onClick={() => onOpenModal('Sports')}
            >
              <Trophy size={13} />
              <span>Sports Achievement</span>
            </button>
            <button
              type="button"
              className="channel-chip cultural"
              onClick={() => onOpenModal('Cultural')}
            >
              <Sparkles size={13} />
              <span>Cultural & Aesthetic</span>
            </button>
            <button
              type="button"
              className="channel-chip exam"
              onClick={() => onOpenModal('Examinations')}
            >
              <FileText size={13} />
              <span>Examination Notice</span>
            </button>
            <button
              type="button"
              className="channel-chip circular"
              onClick={() => onOpenModal('Special Circular')}
            >
              <Bell size={13} />
              <span>Special Circular</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CreatePostModal({
  isOpen,
  onClose,
  onSave,
  editingPost,
  schoolLogo
}) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [showUrlField, setShowUrlField] = useState(false);
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('Academic');
  const [priority, setPriority] = useState('normal');
  const [audience, setAudience] = useState('All Students & Parents');
  const [pinned, setPinned] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (editingPost) {
      setTitle(editingPost.title || '');
      setContent(editingPost.content || '');
      setImage(editingPost.image || '');
      setEventDate(editingPost.eventDate || '');
      setEventTime(editingPost.eventTime || '');
      setLocation(editingPost.location || '');
      setCategory(editingPost.category || 'General');
      setPriority(editingPost.priority || 'normal');
      setAudience(editingPost.audience || 'All Students & Parents');
      setPinned(Boolean(editingPost.pinned));
    } else {
      setTitle('');
      setContent('');
      setImage('/Pictures/Front of School.jpeg');
      setImageUrlInput('');
      setEventDate('');
      setEventTime('');
      setLocation('');
      setCategory('Academic');
      setPriority('normal');
      setAudience('All Students & Parents');
      setPinned(false);
    }
  }, [editingPost, isOpen]);

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
      await onSave({
        ...(editingPost ? { id: editingPost.id } : {}),
        type: 'news',
        title: title.trim(),
        content: content.trim(),
        image: image || '',
        eventDate,
        eventTime,
        location,
        category,
        priority,
        audience,
        pinned
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="fb-create-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="fb-modal-header">
          <div className="modal-title-with-icon">
            <PenTool size={20} className="sparkle-gold" />
            <div>
              <h3>
                {editingPost?.id
                  ? 'Edit Official College Dispatch'
                  : 'Issue Official Announcement / Circular'}
              </h3>
            </div>
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
          {/* Author Strip */}
          <div className="fb-modal-author-bar">
            <SchoolCrest size={46} src={schoolLogo || '/Pictures/School Logo.png'} hasBorder={false} />
            <div>
              <div className="fb-modal-author-name">
                Thakshila College - Gampaha
                <CheckCircle2 size={15} className="fb-verified-icon" />
              </div>
              <span className="author-role-sub">Office of Editorial Affairs & Media Bureau</span>
            </div>
          </div>

          {/* Post Title */}
          <div className="form-group">
            <label className="input-label">Headline / Title</label>
            <input
              type="text"
              className="fb-title-input"
              placeholder="e.g. Annual Inter-House Sports Meet 2026..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Post Description */}
          <div className="form-group">
            <label className="input-label">Full Circular / Bulletin Content</label>
            <textarea
              rows={5}
              className="fb-content-textarea"
              placeholder="Enter official announcement details, circular statements, or event itinerary in formal English..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          {/* Photo Upload / Selection */}
          <div className="fb-photo-upload-box">
            <label className="input-label" style={{ marginBottom: '6px' }}>
              Photo / Poster / Certificate
            </label>
            {image ? (
              <div className="fb-image-preview-wrapper">
                <img src={image} alt="Post preview" className="fb-image-preview" />
                <button
                  type="button"
                  onClick={() => setImage('')}
                  className="btn-remove-image"
                  title="Remove Photo"
                >
                  <X size={15} /> Change Photo
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
                  <span>Paste Image URL</span>
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
                  Add Photo
                </button>
              </div>
            )}
          </div>

          {/* Metadata Grid */}
          <div className="fb-meta-grid">
            <div className="meta-field">
              <label>
                <Calendar size={14} /> Date
              </label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
            </div>

            <div className="meta-field">
              <label>
                <Clock size={14} /> Time
              </label>
              <input
                type="text"
                placeholder="e.g. 08:30 AM - 04:30 PM"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
              />
            </div>

            <div className="meta-field">
              <label>
                <MapPin size={14} /> Venue / Location
              </label>
              <input
                type="text"
                placeholder="e.g. College Main Grounds"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="meta-field">
              <label>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Academic">Academic</option>
                <option value="Sports">Sports</option>
                <option value="Cultural">Cultural & Aesthetic</option>
                <option value="Technology">Technology & ICT</option>
                <option value="Examinations">Examinations</option>
                <option value="Special Circular">Special Circular</option>
              </select>
            </div>
          </div>

          {/* Extra Options */}
          <div className="fb-extra-options">
            <label className="pin-checkbox-label">
              <input
                type="checkbox"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
              />
              <Pin size={14} />
              <span>Pin this post to top</span>
            </label>

            <div className="priority-select-inline">
              <span>Priority:</span>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="normal">Normal</option>
                <option value="important">Important</option>
                <option value="urgent">Urgent Circular</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-fb-publish"
          >
            <Send size={17} />
            <span>
              {submitting
                ? 'Authorizing & Publishing...'
                : editingPost?.id
                ? 'Save Changes to Dispatch'
                : 'Authorize & Disseminate Bulletin'}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
