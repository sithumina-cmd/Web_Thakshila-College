import React, { useState } from 'react';
import {
  Trophy,
  Calendar,
  MapPin,
  Heart,
  Share2,
  Edit3,
  Trash2,
  Pin,
  Check,
  Medal,
  Award,
  ChevronDown,
  ChevronUp,
  Eye,
  X,
  CheckCircle2,
  FileText
} from 'lucide-react';
import SchoolCrest from './SchoolCrest';

export default function SportsCard({
  post,
  isAdmin,
  isLiked,
  onLike,
  onEdit,
  onDelete,
  schoolLogo
}) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const handleShare = () => {
    const text = `[Thakshila College - Sports & Athletics]\n${post.title}\n\n${post.result ? `Match Result: ${post.result}\n` : ''}${post.tournament ? `Tournament: ${post.tournament}\n` : ''}${post.venue ? `Venue: ${post.venue}\n` : ''}${post.content}\n\nOfficial Sports Dispatch — Thakshila College, Gampaha`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    }
  };

  const getCategoryTheme = (cat) => {
    const c = (cat || '').toLowerCase();
    if (c.includes('cricket')) return { label: 'Cricket', color: '#b45309', bg: '#fef3c7', icon: Trophy };
    if (c.includes('athletic')) return { label: 'Athletics', color: '#15803d', bg: '#dcfce7', icon: Medal };
    if (c.includes('volley')) return { label: 'Volleyball', color: '#0369a1', bg: '#e0f2fe', icon: Award };
    if (c.includes('swim')) return { label: 'Swimming', color: '#0e7490', bg: '#cffafe', icon: Award };
    if (c.includes('badminton')) return { label: 'Badminton', color: '#7c3aed', bg: '#ede9fe', icon: Trophy };
    if (c.includes('chess')) return { label: 'Chess', color: '#334155', bg: '#f1f5f9', icon: Award };
    if (c.includes('cadet')) return { label: 'Cadet Corps', color: '#854d0e', bg: '#fef9c3', icon: Medal };
    if (c.includes('martial') || c.includes('karate')) return { label: 'Martial Arts', color: '#be123c', bg: '#ffe4e6', icon: Award };
    if (c.includes('house')) return { label: 'Inter-House', color: '#c2410c', bg: '#ffedd5', icon: Trophy };
    return { label: cat || 'Sports', color: '#690823', bg: '#fdf2f4', icon: Trophy };
  };

  const theme = getCategoryTheme(post.category);
  const CategoryIcon = theme.icon;

  const contentText = post.content || '';
  const isLong = contentText.length > 280;
  const displayContent = !isLong || expanded ? contentText : `${contentText.slice(0, 275)}...`;

  return (
    <>
      <article className={`sports-card-item ${post.pinned ? 'is-pinned-sports' : ''}`}>
        {/* 1. Top Ribbon */}
        <div className="sports-card-top-ribbon">
          <div className="sports-ribbon-left">
            <span
              className="sports-cat-badge"
              style={{ color: theme.color, backgroundColor: theme.bg, borderColor: theme.color }}
            >
              <CategoryIcon size={13} />
              <span>{post.category || 'Sports'}</span>
            </span>

            {post.pinned && (
              <span className="sports-pinned-pill" title="Pinned to top of sports feed">
                <Pin size={12} />
                <span>Featured Match</span>
              </span>
            )}
          </div>

          {/* Admin Controls */}
          {isAdmin && (
            <div className="sports-admin-actions">
              <button
                type="button"
                onClick={() => onEdit && onEdit(post)}
                className="btn-sports-admin edit"
                title="Edit Sports Post"
              >
                <Edit3 size={13} />
                <span>Edit</span>
              </button>
              <button
                type="button"
                onClick={() => onDelete && onDelete(post.id)}
                className="btn-sports-admin delete"
                title="Delete Sports Post"
              >
                <Trash2 size={13} />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>

        {/* 2. Official Issuing Bar */}
        <div className="sports-issuing-bar">
          <div className="sports-crest-frame">
            <SchoolCrest size={44} src={schoolLogo || '/Pictures/School Logo.png'} hasBorder={false} />
          </div>
          <div className="sports-issuing-details">
            <div className="sports-issuing-title-row">
              <h4 className="sports-issuing-institution">Thakshila College - Gampaha</h4>
              <span className="sports-verified-badge" title="Official Sports Bulletin">
                <CheckCircle2 size={13} className="verified-icon" />
                <span>Sports Council</span>
              </span>
            </div>
            <div className="sports-submeta">
              <span className="sports-author">{post.author || 'Athletic Department & Sports Council'}</span>
              <span className="meta-sep">•</span>
              <span className="sports-date">
                <Calendar size={12} /> {post.date || 'Recent Match'}
              </span>
              {post.venue && (
                <>
                  <span className="meta-sep">•</span>
                  <span className="sports-venue">
                    <MapPin size={12} /> {post.venue}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 3. Tournament & Result Highlight Banner */}
        {(post.tournament || post.result) && (
          <div className="sports-result-banner">
            {post.tournament && (
              <div className="sports-tournament-tag">
                <Medal size={15} />
                <span>{post.tournament}</span>
              </div>
            )}
            {post.result && (
              <div className="sports-result-badge">
                <Trophy size={14} />
                <strong>{post.result}</strong>
              </div>
            )}
          </div>
        )}

        {/* 4. Body Content */}
        <div className="sports-card-body">
          <h3 className="sports-card-title">{post.title}</h3>

          {/* Attached Photo Frame */}
          {post.image && (
            <div
              className="sports-card-image-wrap"
              onClick={() => setLightboxOpen(true)}
              role="button"
              tabIndex={0}
              title="Click to view full photo"
            >
              <img src={post.image} alt={post.title} loading="lazy" />
              <div className="sports-image-overlay">
                <Eye size={16} />
                <span>View Full Photo</span>
              </div>
            </div>
          )}

          {/* Match Report Prose */}
          <div className="sports-card-content">
            <p>{displayContent}</p>
            {isLong && (
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="btn-sports-expand"
              >
                {expanded ? (
                  <>
                    <span>Show Less</span> <ChevronUp size={14} />
                  </>
                ) : (
                  <>
                    <span>Read Full Match Report</span> <ChevronDown size={14} />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* 5. Footer Actions */}
        <div className="sports-card-footer">
          <div className="sports-footer-actions-left">
            <button
              type="button"
              onClick={() => onLike && onLike(post.id)}
              className={`btn-sports-footer-action like-btn ${isLiked ? 'liked' : ''}`}
              title={isLiked ? 'Cheered' : 'Cheer for Thakshila!'}
            >
              <Heart
                size={16}
                fill={isLiked ? '#dc2626' : 'none'}
                color={isLiked ? '#dc2626' : 'currentColor'}
              />
              <span>{post.likes || 0}</span>
              <span className="btn-label-suffix">Cheers</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="btn-sports-footer-action share-btn"
              title="Share match report"
            >
              {copied ? (
                <>
                  <Check size={15} color="#16a34a" />
                  <span style={{ color: '#16a34a', fontWeight: 600 }}>Copied!</span>
                </>
              ) : (
                <>
                  <Share2 size={15} />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>

          <div className="sports-footer-accreditation">
            <CheckCircle2 size={13} />
            <span>Official Collegiate Sports Bulletin</span>
          </div>
        </div>
      </article>

      {/* Photo Lightbox Modal */}
      {lightboxOpen && post.image && (
        <div className="sports-lightbox-backdrop" onClick={() => setLightboxOpen(false)}>
          <div className="sports-lightbox-box" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="sports-lightbox-close"
              title="Close photo"
            >
              <X size={20} />
            </button>
            <img src={post.image} alt={post.title} />
            <div className="sports-lightbox-caption">
              <h4>{post.title}</h4>
              <p>{post.tournament || post.venue || post.date}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
