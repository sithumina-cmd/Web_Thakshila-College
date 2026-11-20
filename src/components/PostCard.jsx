import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Share2,
  Edit3,
  Trash2,
  Pin,
  CheckCircle2,
  Printer,
  FileText,
  Check,
  AlertCircle,
  Eye
} from 'lucide-react';
import SchoolCrest from './SchoolCrest';

export default function PostCard({
  post,
  isAdmin,
  onEdit,
  onDelete,
  schoolLogo
}) {
  const [copied, setCopied] = useState(false);
  const [imageExpanded, setImageExpanded] = useState(false);

  const formatDate = (iso) => {
    if (!iso) return 'Just now';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatEventDateParts = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      return { month: 'DATE', day: dateStr, full: dateStr };
    }
    return {
      month: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
      day: d.getDate(),
      full: d.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    };
  };

  const dateParts = formatEventDateParts(post.eventDate);

  const handleShare = () => {
    const shareText = `[Thakshila College - Official Dispatch]\n${post.title}\n\n${post.content}\n\nPublished by Thakshila College - Gampaha`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const categorySlug = (post.category || 'general').toLowerCase().replace(/\s+/g, '-');

  return (
    <article className={`formal-bulletin-card ${post.pinned ? 'is-pinned-bulletin' : ''} priority-${post.priority || 'normal'}`}>
      {/* 1. Official Header & Classification Ribbon */}
      <div className="bulletin-top-ribbon">
        <div className="bulletin-ribbon-left">
          <span className={`bulletin-category-tag cat-${categorySlug}`}>
            <FileText size={12} />
            <span>{post.category || 'Official Circular'}</span>
          </span>

          {post.priority === 'urgent' && (
            <span className="bulletin-badge urgent">
              <AlertCircle size={12} />
              <span>Urgent Circular</span>
            </span>
          )}

          {post.pinned && (
            <span className="bulletin-badge pinned">
              <Pin size={12} />
              <span>Official Pinned Notice</span>
            </span>
          )}
        </div>

        {/* Administration Actions (for logged-in faculty/admin) */}
        {isAdmin && (
          <div className="bulletin-admin-actions">
            <button
              type="button"
              onClick={() => onEdit(post)}
              className="btn-bulletin-admin edit"
              title="Edit Circular"
            >
              <Edit3 size={13} />
              <span>Edit</span>
            </button>
            <button
              type="button"
              onClick={() => onDelete(post.id)}
              className="btn-bulletin-admin delete"
              title="Delete Circular"
            >
              <Trash2 size={13} />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Official Issuing Bureau & Reference Strip */}
      <div className="bulletin-issuing-bar">
        <div className="issuing-crest-frame">
          <SchoolCrest size={46} src={schoolLogo || '/Pictures/School Logo.png'} hasBorder={false} />
        </div>
        <div className="issuing-details-box">
          <div className="issuing-title-row">
            <h4 className="issuing-institution">Thakshila College - Gampaha</h4>
            <span className="verified-seal-badge" title="Official Institutional Dispatch">
              <CheckCircle2 size={14} className="verified-icon" />
              <span>Official Broadcast</span>
            </span>
          </div>
          <div className="issuing-submeta">
            <span className="issuing-author">{post.author || 'Office of the Principal & Administration'}</span>
            <span className="meta-sep">•</span>
            <span className="issuing-date">{formatDate(post.createdAt)}</span>
            {post.audience && (
              <>
                <span className="meta-sep">•</span>
                <span className="issuing-audience">Audience: {post.audience}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 3. Headline & Official Announcement Content */}
      <div className="bulletin-content-section">
        {post.title && <h3 className="bulletin-title">{post.title}</h3>}
        {post.content && <div className="bulletin-prose">{post.content}</div>}

        {/* 4. Structured Itinerary / Schedule Dossier (if applicable) */}
        {(post.eventDate || post.eventTime || post.location) && (
          <div className="bulletin-itinerary-dossier">
            <div className="itinerary-dossier-header">
              <Calendar size={15} />
              <span>OFFICIAL ITINERARY & VENUE SPECIFICATIONS</span>
            </div>
            <div className="itinerary-dossier-grid">
              {dateParts && (
                <div className="itinerary-grid-item">
                  <div className="itinerary-label">Scheduled Date</div>
                  <div className="itinerary-value">{dateParts.full}</div>
                </div>
              )}
              {post.eventTime && (
                <div className="itinerary-grid-item">
                  <div className="itinerary-label">Convening Time</div>
                  <div className="itinerary-value">{post.eventTime}</div>
                </div>
              )}
              {post.location && (
                <div className="itinerary-grid-item">
                  <div className="itinerary-label">Designated Venue</div>
                  <div className="itinerary-value">{post.location}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5. Official Attached Media / Press Photograph Frame */}
        {post.image && (
          <div
            className="bulletin-media-frame"
            onClick={() => setImageExpanded(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setImageExpanded(true)}
          >
            <div className="media-frame-inner">
              <img
                src={post.image}
                alt={post.title || 'Official Thakshila College Bulletin Attachment'}
                className="bulletin-media-image"
                loading="lazy"
              />
              <div className="media-overlay-caption">
                <span className="media-caption-text">Official Photographic Dispatch Attachment</span>
                <span className="media-expand-pill">
                  <Eye size={13} /> Click to Inspect Full Resolution
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 6. Formal Institutional Document Footer */}
      <div className="bulletin-formal-footer">
        <div className="footer-accreditation">
          <CheckCircle2 size={13} className="accreditation-icon" />
          <span>Disseminated via Thakshila College Official Web Portal</span>
        </div>

        <div className="footer-document-actions">
          <button
            type="button"
            onClick={handleShare}
            className="btn-document-action share"
            title="Copy official announcement link to clipboard"
          >
            {copied ? <Check size={14} /> : <Share2 size={14} />}
            <span>{copied ? 'Link Copied!' : 'Share Circular'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="btn-document-action print"
            title="Print or export circular"
          >
            <Printer size={14} />
            <span>Print Notice</span>
          </button>
        </div>
      </div>

      {/* Lightbox Modal for Attachment Inspection */}
      {imageExpanded && (
        <div
          className="lightbox-backdrop"
          onClick={() => setImageExpanded(false)}
        >
          <div
            className="lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={post.image} alt={post.title} />
            <div className="lightbox-caption">
              <h4>{post.title}</h4>
              <button
                type="button"
                onClick={() => setImageExpanded(false)}
                className="btn-close-lightbox"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
