import React from 'react';
import {
  BookMarked,
  Newspaper,
  Users,
  BookOpen,
  Trophy,
  Award,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Edit,
  Heart,
  Target,
  Compass,
  PlusCircle,
  Calendar,
  Medal
} from 'lucide-react';
import SchoolCrest from '../components/SchoolCrest';
import PostCard from '../components/PostCard';

export default function Home({
  settings,
  news,
  sports,
  diary,
  isAdmin,
  isEditMode,
  likedIds,
  onLikeNews,
  onEditNews,
  onDeleteNews,
  onOpenCreateNewsModal,
  onLikeSports,
  onEditSports,
  onDeleteSports,
  onOpenCreateSportsModal,
  onOpenCreateDiaryModal,
  onOpenEditSettingsModal,
  onOpenLoginModal,
  setActiveTab
}) {
  const latestNews = (news || []).slice(0, 3);
  const latestSports = (sports || []).slice(0, 3);
  const latestDiary = (diary || []).slice(0, 3);

  const heroBg = settings.heroImage || '/Pictures/Front of School.jpeg';

  return (
    <div className="page-home">
      {/* 
        ============================================================
        LANDING VIEWPORT (FULL-SCREEN FOLD)
        Ensures stats strip sits perfectly at the bottom of the screen
        when someone loads the site on any display
        ============================================================
      */}
      <div className="hero-landing-viewport">
        {/* 1. Clear Front View of the School */}
        <section className="hero-front-photo-section">
          <div className="hero-front-photo-wrapper">
            <img
              src={heroBg}
              alt="Thakshila College - Gampaha Front View"
              className="hero-front-photo"
            />
          </div>

          {/* Dual Crests at Top-Right Corner of Front Image: School Logo & National Productivity Award Logo */}
          <div className="hero-image-corner-cluster">
            <div className="hero-image-corner-logo" title={settings.schoolName || 'Thakshila College - Gampaha'}>
              <SchoolCrest
                size={180}
                src={settings.schoolLogo || '/Pictures/School Logo.png'}
                hasBorder={false}
                className="hero-corner-crest"
              />
            </div>
            <div className="hero-image-corner-logo hero-productivity-corner-logo" title="National Productivity Award Winner">
              <img
                src={settings.productivityLogo || '/Pictures/Productivity Logo.png'}
                alt="National Productivity Award Winner Logo"
                className="hero-corner-crest hero-corner-productivity"
                style={{
                  width: '180px',
                  height: '180px',
                  objectFit: 'contain',
                  borderRadius: '50%',
                  display: 'block'
                }}
              />
            </div>
          </div>
        </section>

        {/* 2. Hero Content & Title Banner */}
        <section className="hero-info-section">
          <div className="container hero-info-inner">
            <h1 className="hero-below-title">
              {settings.heroTitle || 'Thakshila College - Gampaha'}
            </h1>
            <h2 className="hero-below-subtitle">
              {settings.heroSubtitle || settings.tagline || 'A Renowned Buddhist Educational Heritage | Western Province'}
            </h2>

            {/* Admin Edit Trigger */}
            {isAdmin && isEditMode && (
              <div className="hero-admin-edit-strip">
                <button
                  type="button"
                  onClick={onOpenEditSettingsModal}
                  className="btn-hero-edit-trigger"
                >
                  <Edit size={15} />
                  <span>Edit Hero Content & Settings</span>
                </button>
              </div>
            )}
          </div>
        </section>

        {/* 3. Compact Stats Strip (Sitting at bottom of screen fold) */}
        <section className="hero-stats-strip">
          <div className="container hero-stats-grid">
            <div className="hero-stat-card">
              <Users size={19} className="stat-gold-icon" />
              <div>
                <div className="hero-stat-num">{settings.stat1Number || '2000+'}</div>
                <div className="hero-stat-lbl">{settings.stat1Label || 'Students Enrolled'}</div>
              </div>
            </div>
            <div className="hero-stat-card">
              <BookOpen size={19} className="stat-gold-icon" />
              <div>
                <div className="hero-stat-num">{settings.stat2Number || '95'}</div>
                <div className="hero-stat-lbl">{settings.stat2Label || 'Teachers'}</div>
              </div>
            </div>
            <div className="hero-stat-card">
              <Trophy size={19} className="stat-gold-icon" />
              <div>
                <div className="hero-stat-num">{settings.stat3Number || '4 Houses'}</div>
                <div className="hero-stat-lbl">{settings.stat3Label || 'Agra, Advi, Anupa, Anabi'}</div>
              </div>
            </div>
            <div className="hero-stat-card">
              <Award size={19} className="stat-gold-icon" />
              <div>
                <div className="hero-stat-num">{settings.stat4Number || '2 Place'}</div>
                <div className="hero-stat-lbl">{settings.stat4Label || 'Productivity in Sri Lanka'}</div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* 
        ============================================================
        4. COLLEGE FLAG SPOTLIGHT (Before Vision & Mission)
        ============================================================
      */}
      <section className="home-flag-section container">
        <div className="home-flag-card">
          <div className="home-flag-image-box">
            <img
              src={settings.flagImage || '/Pictures/School Flag.jpeg'}
              alt={settings.flagTitle || 'Thakshila College Flag'}
              className="home-flag-image"
              loading="lazy"
            />
            <div className="home-flag-image-badge">
              <Sparkles size={14} />
              <span>COLLEGE ENSIGN • MAROON & GOLD</span>
            </div>
          </div>

          <div className="home-flag-content-box">
            <span className="section-eyebrow">
              <Sparkles size={13} /> OFFICIAL EMBLEM & HERITAGE
            </span>
            <h2 className="home-flag-title">
              {settings.flagTitle || 'The College Flag — Symbol of Pride & Valour'}
            </h2>
            <p className="home-flag-caption">
              {settings.flagCaption ||
                'Fluttering proudly in maroon and gold, the Thakshila College flag embodies decades of academic excellence, discipline, and noble Buddhist traditions. It stands as a beacon of honor and wisdom for generations of Thakshilians.'}
            </p>

            <div className="home-flag-features-grid">
              <div className="flag-feature-item">
                <span className="flag-feature-bullet gold" />
                <div>
                  <strong>Gold & Maroon</strong>
                  <p>Wisdom, courage, and Buddhist heritage</p>
                </div>
              </div>
              <div className="flag-feature-item">
                <span className="flag-feature-bullet maroon" />
                <div>
                  <strong>Sacred Crest</strong>
                  <p>Light of knowledge radiating to the world</p>
                </div>
              </div>
            </div>

            {isAdmin && isEditMode && (
              <button
                type="button"
                onClick={onOpenEditSettingsModal}
                className="btn-flag-edit"
              >
                <Edit size={14} />
                <span>Edit Flag Details</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 
        ============================================================
        5. VISION & MISSION SECTION (Directly following Stats)
        ============================================================
      */}
      <section className="home-vision-mission-section container">
        <div className="section-heading-center">
          {/* Dual Crests: School Logo & National Productivity Award Logo */}
          <div className="vm-heading-logos">
            <img
              src="/Pictures/School Logo.png"
              alt="Thakshila College Crest"
              className="vm-header-logo school-crest"
              title="Thakshila College Crest"
            />
            <div className="vm-logos-divider" aria-hidden="true" />
            <img
              src="/Pictures/Productivity Logo.png"
              alt="National Productivity Award Winner Logo"
              className="vm-header-logo productivity-crest"
              title="National Productivity Award Winner"
            />
          </div>
          <h2 className="section-title">Our Vision & Mission</h2>
          <p className="section-subtext">
            Guiding Thakshila College towards academic supremacy, disciplined leadership, and moral integrity.
          </p>
        </div>

        <div className="vision-mission-grid">
          <div className="vm-card vision">
            <div className="vm-icon-box">
              <Target size={28} />
            </div>
            <h3>දැක්ම</h3>
            <p>
              {settings.vision ||
                'ද්වීතියික අධ්‍යාපනයේ අරමුණු හා පරමාර්ථ අංගසම්පූර්ණ ලෙස ඉටුකර ගන්නා විශිෂ්ට පාසලක්'}
            </p>
          </div>

          <div className="vm-card mission">
            <div className="vm-icon-box">
              <Compass size={28} />
            </div>
            <h3>මෙහෙවර</h3>
            <p>
              {settings.mission ||
                'ගුණාත්මක ඉගෙනුම් ඉගැන්වීම් ක්‍රියාවලියක් තුළ විෂය සමගාමී හා බාහිර ක්‍රියාකාරකම් සපුරාලමින් පරිසරය සුරකින අනාගත අභියෝග ජයගත හැකි, මනා පෞරුෂයකින් හෙබි, විනයගරුක, නීතිගරුක, අභිමානවත් සිසු පරපුරක් දේශයට දායාද කිරීම.'}
            </p>
          </div>
        </div>
      </section>

      {/* 
        ============================================================
        5. THAKSHILA DIARY HIGHLIGHTS PREVIEW
        ============================================================
      */}
      <section className="home-diary-section container">
        <div className="section-heading-row">
          <div>
            <span className="section-eyebrow">
              <BookMarked size={14} /> CHRONICLE OF STUDENT LIFE
            </span>
            <h2 className="section-title">Thakshila Diary</h2>
            <p className="section-subtext">
              Capturing student milestones, cultural celebrations, sports victories, and unforgettable memories.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setActiveTab('diary');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="btn-text-link"
          >
            <span>View All Diary Stories</span>
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="home-diary-cards-grid">
          {latestDiary.length === 0 ? (
            <div className="empty-feed-state" style={{ gridColumn: '1 / -1', background: '#fff', border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-lg)', padding: '36px 20px', textAlign: 'center' }}>
              <BookMarked size={40} style={{ color: 'var(--slate-400)', margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '1.15rem', color: 'var(--slate-800)', marginBottom: '6px' }}>No Diary Stories Published Yet</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--slate-500)', maxWidth: '440px', margin: '0 auto' }}>
                Chronicles of student milestones, cultural festivals, and memorable moments will appear here once published.
              </p>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => onOpenCreateDiaryModal()}
                  className="btn-create-post-nav"
                  style={{ marginTop: '16px' }}
                >
                  <PlusCircle size={15} />
                  <span>Add First Diary Story</span>
                </button>
              )}
            </div>
          ) : (
            latestDiary.map((item) => (
              <div
                key={item.id}
                className="home-diary-card"
                onClick={() => {
                  setActiveTab('diary');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                role="button"
                tabIndex={0}
              >
                <div className="home-diary-img-box">
                  <img
                    src={item.image || '/Pictures/Front of School.jpeg'}
                    alt={item.title}
                    loading="lazy"
                  />
                  <span className="diary-badge-cat">{item.category}</span>
                </div>
                <div className="home-diary-body">
                  <div className="home-diary-date">{item.date} • by {item.author}</div>
                  <h3>{item.title}</h3>
                  <p>{item.summary || item.content.slice(0, 110) + '...'}</p>
                  <div className="home-diary-footer">
                    <span className="read-story-text">
                      Read Story <ArrowRight size={13} />
                    </span>
                    <span className="diary-heart-count">
                      <Heart size={14} fill="#e11d48" color="#e11d48" /> {item.likes || 0}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 
        ============================================================
        5. LIVE NEWS & ANNOUNCEMENTS FEED
        ============================================================
      */}
      <section className="home-feed-section container">
        <div className="section-heading-row">
          <div>
            <span className="section-eyebrow">OFFICIAL UPDATES</span>
            <h2 className="section-title">Latest School News & Notices</h2>
          </div>
          <button
            type="button"
            onClick={() => {
              setActiveTab('news');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="btn-text-link"
          >
            All News <ArrowRight size={15} />
          </button>
        </div>

        {/* Formal News & Bulletin Feed Stack */}
        <div className="formal-bulletin-stack">
          {latestNews.length === 0 ? (
            <div className="empty-feed-state" style={{ background: '#fff', border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-lg)', padding: '36px 20px', textAlign: 'center' }}>
              <Newspaper size={40} style={{ color: 'var(--slate-400)', margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '1.15rem', color: 'var(--slate-800)', marginBottom: '6px' }}>No Official News Published Yet</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--slate-500)', maxWidth: '440px', margin: '0 auto' }}>
                Official announcements, academic circulars, and event updates will be broadcast here once published.
              </p>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => onOpenCreateNewsModal()}
                  className="btn-create-post-nav"
                  style={{ marginTop: '16px' }}
                >
                  <PlusCircle size={15} />
                  <span>Issue First Circular</span>
                </button>
              )}
            </div>
          ) : (
            latestNews.map((post) => (
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
            ))
          )}
        </div>
      </section>

      {/* 
        ============================================================
        6. SPORTS & ATHLETIC HIGHLIGHTS PREVIEW
        ============================================================
      */}
      <section className="home-sports-section container">
        <div className="section-heading-row">
          <div>
            <span className="section-eyebrow">
              <Trophy size={14} /> ATHLETIC EXCELLENCE & HONOURS
            </span>
            <h2 className="section-title">Sports & Athletic Highlights</h2>
            <p className="section-subtext">
              Celebrating championship victories, team spirit, and collegiate sporting brotherhood.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setActiveTab('sports');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="btn-text-link"
          >
            <span>All Sports & Match Reports</span>
            <ArrowRight size={15} />
          </button>
        </div>

        {/* Sports Cards Grid (Matching Diary Shape) */}
        <div className="home-diary-cards-grid">
          {latestSports.length === 0 ? (
            <div className="empty-feed-state" style={{ gridColumn: '1 / -1', background: '#fff', border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-lg)', padding: '36px 20px', textAlign: 'center' }}>
              <Trophy size={40} style={{ color: 'var(--slate-400)', margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '1.15rem', color: 'var(--slate-800)', marginBottom: '6px' }}>No Sports Stories Published Yet</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--slate-500)', maxWidth: '440px', margin: '0 auto' }}>
                Chronicles of sporting triumphs, match reports, and championship honours will appear here once published.
              </p>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => onOpenCreateSportsModal()}
                  className="btn-create-post-nav"
                  style={{ marginTop: '16px' }}
                >
                  <PlusCircle size={15} />
                  <span>Add First Sports Story</span>
                </button>
              )}
            </div>
          ) : (
            latestSports.map((item) => (
              <div
                key={item.id}
                className="home-diary-card"
                onClick={() => {
                  setActiveTab('sports');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                role="button"
                tabIndex={0}
              >
                <div className="home-diary-img-box">
                  <img
                    src={item.image || '/Pictures/Front of School.jpeg'}
                    alt={item.title}
                    loading="lazy"
                  />
                  <span className="diary-badge-cat">{item.category}</span>
                </div>
                <div className="home-diary-body">
                  <div className="home-diary-date">{item.date} • by {item.author || 'Thakshila College'}</div>
                  <h3>{item.title}</h3>
                  <p>{item.summary || (item.content ? item.content.slice(0, 110) + '...' : '')}</p>
                  <div className="home-diary-footer">
                    <span className="read-story-text">
                      Read Story <ArrowRight size={13} />
                    </span>
                    <span className="diary-heart-count">
                      <Heart size={14} fill="#e11d48" color="#e11d48" /> {item.likes || 0}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
