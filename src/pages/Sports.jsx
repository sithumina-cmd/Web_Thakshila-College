import React, { useState } from 'react';
import {
  Trophy,
  Calendar,
  Tag,
  Heart,
  Share2,
  Edit3,
  Trash2,
  PlusCircle,
  Search,
  Filter,
  Check,
  UserCheck
} from 'lucide-react';
import SchoolCrest from '../components/SchoolCrest';

export default function Sports({
  sports,
  settings,
  isAdmin,
  isEditMode,
  likedIds,
  onLikeSports,
  onEditSports,
  onDeleteSports,
  onOpenCreateSportsModal,
  onOpenLoginModal
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [copiedId, setCopiedId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const categories = [
    'All',
    'Cricket',
    'Athletics',
    'Volleyball',
    'Swimming',
    'Badminton',
    'Chess',
    'Cadet Corps',
    'Martial Arts',
    'Inter-House Sports',
    'Special Achievements'
  ];

  const filteredSports = (sports || []).filter((item) => {
    if (selectedCategory !== 'All' && item.category !== selectedCategory) {
      return false;
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const tagMatch = Array.isArray(item.tags)
      ? item.tags.some((t) => t.toLowerCase().includes(q))
      : false;
    return (
      (item.title || '').toLowerCase().includes(q) ||
      (item.content || '').toLowerCase().includes(q) ||
      (item.summary || '').toLowerCase().includes(q) ||
      (item.author || '').toLowerCase().includes(q) ||
      tagMatch
    );
  });

  const handleShare = (entry) => {
    const text = `${entry.title}\n\n${entry.content}\n— Thakshila Sports`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(entry.id);
      setTimeout(() => setCopiedId(null), 2200);
    }
  };

  return (
    <div className="page-diary page-sports">
      {/* Banner with Logo before title */}
      <section className="subpage-banner diary-banner sports-banner">
        <div className="container subpage-banner-flex">
          <div className="subpage-title-with-logo">
            <SchoolCrest size={70} src={settings?.schoolLogo || '/Pictures/School logo.jpeg'} />
            <div>
              <span className="subpage-eyebrow">
                <Trophy size={14} /> OFFICIAL ATHLETIC &amp; SPORTS CHRONICLE
              </span>
              <h1>Thakshila Sports</h1>
              <p className="subpage-si-title">
                Chronicle of Sporting Triumphs, Match Memories, and Athletic Milestones
              </p>
            </div>
          </div>

          {isAdmin && (
            <div className="banner-action-box">
              <button
                type="button"
                onClick={onOpenCreateSportsModal}
                className="btn-banner-post"
              >
                <PlusCircle size={19} />
                <span>Add Sports Story</span>
              </button>
            </div>
          )}
        </div>
      </section>

      <div className="container feed-page-container">
        {/* Search & Filter Bar */}
        <div className="feed-filter-bar">
          <div className="search-input-box">
            <Search size={17} />
            <input
              type="text"
              placeholder="Search Thakshila Sports by story, tournament, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="category-pills">
            <Filter size={15} className="filter-icon" />
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`cat-pill ${selectedCategory === cat ? 'active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Sports Stories Grid (Matching Thakshila Diary shape) */}
        {filteredSports.length === 0 ? (
          <div className="empty-feed-state">
            <Trophy size={48} />
            <h3>No Sports Entries Found</h3>
            <p>
              {searchQuery || selectedCategory !== 'All'
                ? 'Try adjusting your search query or selecting another category.'
                : 'No sports entries have been published yet.'}
            </p>
            {isAdmin && (
              <button
                type="button"
                onClick={onOpenCreateSportsModal}
                className="btn-create-post-nav"
              >
                <PlusCircle size={17} />
                <span>Add First Sports Story</span>
              </button>
            )}
          </div>
        ) : (
          <div className="diary-chronicle-grid">
            {filteredSports.map((item) => {
              const isLiked = likedIds.includes(item.id);
              return (
                <article key={item.id} className="diary-story-card">
                  {/* Photo Container */}
                  <div
                    className="diary-card-photo-box"
                    onClick={() => setSelectedImage(item.image)}
                    role="button"
                    tabIndex={0}
                  >
                    <img
                      src={item.image || '/Pictures/Front of School.jpeg'}
                      alt={item.title}
                      loading="lazy"
                    />
                    <span className="diary-card-cat-badge">{item.category}</span>
                  </div>

                  {/* Body Content */}
                  <div className="diary-card-body">
                    <div className="diary-card-meta-row">
                      <span className="diary-card-date">
                        <Calendar size={13} /> {item.date}
                      </span>
                      <span className="diary-card-author">
                        <UserCheck size={13} /> {item.author || 'Thakshila College'}
                      </span>
                    </div>

                    <h3 className="diary-card-title">{item.title}</h3>

                    {item.summary && (
                      <p className="diary-card-summary">{item.summary}</p>
                    )}

                    <p className="diary-card-content">{item.content}</p>

                    {/* Tags */}
                    {Array.isArray(item.tags) && item.tags.length > 0 && (
                      <div className="diary-tags-row">
                        {item.tags.map((tag, idx) => (
                          <span key={idx} className="diary-tag-pill">
                            <Tag size={11} /> {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer & Actions */}
                  <div className="diary-card-footer">
                    <div className="diary-actions-left">
                      <button
                        type="button"
                        onClick={() => onLikeSports(item.id)}
                        className={`btn-diary-like ${isLiked ? 'liked' : ''}`}
                      >
                        <Heart
                          size={16}
                          fill={isLiked ? '#e11d48' : 'none'}
                          color={isLiked ? '#e11d48' : 'currentColor'}
                        />
                        <span>{item.likes || 0}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleShare(item)}
                        className="btn-diary-share"
                        title="Share this story"
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check size={15} /> Copied!
                          </>
                        ) : (
                          <>
                            <Share2 size={15} /> Share
                          </>
                        )}
                      </button>
                    </div>

                    {/* Admin Edit & Delete buttons */}
                    {isAdmin && isEditMode && (
                      <div className="diary-admin-actions">
                        <button
                          type="button"
                          onClick={() => onEditSports(item)}
                          className="fb-admin-btn edit"
                          title="Edit this sports entry"
                        >
                          <Edit3 size={14} />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteSports(item.id)}
                          className="fb-admin-btn delete"
                          title="Delete this sports entry"
                        >
                          <Trash2 size={14} />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox for viewing sports image */}
      {selectedImage && (
        <div
          className="lightbox-backdrop"
          onClick={() => setSelectedImage(null)}
        >
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={selectedImage} alt="Thakshila Sports Photograph" />
            <div className="lightbox-caption">
              <span>Thakshila Sports Photograph</span>
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="btn-close-lightbox"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
