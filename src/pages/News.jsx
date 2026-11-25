import React, { useState } from 'react';
import {
  Newspaper,
  Search,
  PlusCircle,
  Filter,
  Sparkles,
  PenTool
} from 'lucide-react';
import SchoolCrest from '../components/SchoolCrest';
import PostCard from '../components/PostCard';

export default function News({
  news,
  settings,
  isAdmin,
  isEditMode,
  likedIds,
  onLikeNews,
  onEditNews,
  onDeleteNews,
  onOpenCreateNewsModal,
  onOpenLoginModal
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = [
    'All',
    'Academic',
    'Sports',
    'Cultural',
    'Technology',
    'Examinations',
    'Special Circular'
  ];

  const filteredNews = (news || []).filter((item) => {
    if (selectedCategory !== 'All' && item.category !== selectedCategory) {
      return false;
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (item.title || '').toLowerCase().includes(q) ||
      (item.content || '').toLowerCase().includes(q) ||
      (item.location || '').toLowerCase().includes(q) ||
      (item.category || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="page-news">
      {/* Subpage Banner with Logo before title */}
      <section className="subpage-banner news-banner">
        <div className="container subpage-banner-flex">
          <div className="subpage-title-with-logo">
            <SchoolCrest size={70} src={settings.schoolLogo || '/Pictures/School Logo.png'} />
            <div>
              <span className="subpage-eyebrow">
                <Sparkles size={14} /> OFFICIAL SCHOOL NEWSFEED
              </span>
              <h1>Thakshila College News</h1>
              <p className="subpage-si-title">
                Official Announcements, Circulars, and Academic Bulletins
              </p>
            </div>
          </div>

          {isAdmin && (
            <div className="banner-action-box">
              <button
                type="button"
                onClick={() => onOpenCreateNewsModal()}
                className="btn-banner-post"
              >
                <PenTool size={18} />
                <span>Issue Official Circular</span>
              </button>
            </div>
          )}
        </div>
      </section>

      <div className="container feed-page-container">
        <div className="feed-page-main">
          {/* Search & Category Filter Bar with Integrated Formal Dispatch */}
          <div className="feed-filter-bar">
            <div className="feed-filter-top-row">
              <div className="search-input-box">
                <Search size={17} />
                <input
                  type="text"
                  placeholder="Search news, events, circulars by keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => onOpenCreateNewsModal()}
                  className="btn-feed-bar-dispatch"
                  title="Issue Official Announcement or Circular"
                >
                  <PenTool size={15} />
                  <span>Issue Dispatch</span>
                </button>
              )}
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

          {/* News Feed Cards Stack */}
          {filteredNews.length === 0 ? (
            <div className="empty-feed-state">
              <Newspaper size={44} />
              <h3>No Official Circulars Found</h3>
              <p>
                {searchQuery || selectedCategory !== 'All'
                  ? 'Try clearing your search keyword or selected category filter.'
                  : 'No official announcements have been dispatched yet.'}
              </p>
              {isAdmin && (
                <button
                  type="button"
                  onClick={onOpenCreateNewsModal}
                  className="btn-create-post-nav"
                >
                  <PenTool size={16} />
                  <span>Issue First Circular</span>
                </button>
              )}
            </div>
          ) : (
            <div className="formal-bulletin-stack">
              {filteredNews.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  isAdmin={isAdmin && isEditMode}
                  isLiked={likedIds.includes(post.id)}
                  onLike={onLikeNews}
                  onEdit={onEditNews}
                  onDelete={onDeleteNews}
                  schoolLogo={settings.schoolLogo}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Formal Dispatch Action (Omnipresent launch method when scrolling feed) */}
      {isAdmin && (
        <button
          type="button"
          onClick={() => onOpenCreateNewsModal()}
          className="floating-formal-dispatch-btn"
          title="Issue Official College Announcement or Circular"
        >
          <PenTool size={18} />
          <span>Dispatch Bulletin</span>
        </button>
      )}
    </div>
  );
}
