import React, { useState } from 'react';
import {
  Home,
  Newspaper,
  BookMarked,
  BookOpen,
  Info,
  PhoneCall,
  ExternalLink,
  LogIn,
  GraduationCap,
  LogOut,
  Edit,
  PlusCircle,
  Settings,
  Menu,
  X,
  Sparkles,
  Trophy
} from 'lucide-react';
import SchoolCrest from './SchoolCrest';

export default function Navbar({
  activeTab,
  setActiveTab,
  settings,
  currentUser,
  isAdmin,
  isDeveloper,
  isStudent,
  isEditMode,
  setIsEditMode,
  onOpenLoginModal,
  onOpenCreateNewsModal,
  onOpenCreateSportsModal,
  onOpenCreateDiaryModal,
  onOpenEditSettingsModal,
  onLogout,
  counts
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'news', label: 'News', icon: Newspaper },
    { id: 'sports', label: 'Sports', icon: Trophy },
    { id: 'diary', label: 'Thakshila Diary', icon: BookMarked },
    { id: 'elibrary', label: 'E-Library', icon: BookOpen },
    { id: 'about', label: 'About', icon: Info },
    { id: 'contact', label: 'Contact US', icon: PhoneCall }
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="site-header">
      {/* 
        First utility row has been removed as requested.
        Main Navbar: Sleek, compact height with reduced font size.
      */}
      <div className="main-navbar">
        <div className="container main-navbar-inner">
          {/* Brand Identity: School Logo before Title */}
          <div
            className="brand-identity"
            onClick={() => handleNavClick('home')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleNavClick('home')}
            title="Thakshila College - Gampaha"
          >
            <SchoolCrest
              size={44}
              src={settings.schoolLogo || '/Pictures/School Logo.png'}
              className="brand-crest"
              hasBorder={false}
            />
            <h1 className="brand-title">
              {settings.schoolName || 'Thakshila College - Gampaha'}
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="desktop-nav" aria-label="Main Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`nav-tab-btn ${isActive ? 'active' : ''}`}
                >
                  <Icon size={16} className="nav-tab-icon" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Top Action Buttons: LMS & Login */}
          <div className="navbar-actions">
            <a
              href={settings.lmsUrl || 'https://tcg.bluesmartschool.com/'}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-header-lms"
              title="Open Thakshila College LMS Portal"
            >
              <ExternalLink size={15} />
              <span>{settings.lmsLabel || 'LMS'}</span>
            </a>

            <button
              type="button"
              onClick={currentUser ? () => setActiveTab('elibrary') : onOpenLoginModal}
              className={`btn-header-login ${currentUser ? 'portal-active' : ''}`}
              title={currentUser ? 'Open Student E-Library' : 'Student E-Library & School Portal Login'}
            >
              {currentUser ? <BookOpen size={15} /> : <LogIn size={15} />}
              <span>{currentUser ? 'E-Library' : settings.loginLabel || 'Login'}</span>
            </button>

            <button
              type="button"
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="mobile-nav-drawer">
            <div className="mobile-nav-links">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    className={`mobile-nav-item ${isActive ? 'active' : ''}`}
                  >
                    <div className="mobile-nav-item-left">
                      <Icon size={17} />
                      <span className="mobile-nav-label">{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mobile-portal-actions">
              <a
                href={settings.lmsUrl || 'https://tcg.bluesmartschool.com/'}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-header-lms full-width"
              >
                <ExternalLink size={15} />
                <span>Open {settings.lmsLabel || 'LMS'} (tcg.bluesmartschool.com)</span>
              </a>

              {currentUser ? (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setActiveTab('elibrary');
                  }}
                  className="btn-header-login full-width portal-active"
                >
                  <BookOpen size={15} />
                  <span>Open E-Library</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenLoginModal();
                  }}
                  className="btn-header-login full-width"
                >
                  <LogIn size={15} />
                  <span>{settings.loginLabel || 'Login'}</span>
                </button>
              )}

              {isStudent && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="btn-header-login full-width"
                >
                  <LogOut size={15} />
                  <span>Logout Student Portal</span>
                </button>
              )}

              {isAdmin && (
                <div className="mobile-admin-panel">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setActiveTab('settings');
                    }}
                    className="btn-create-news full-width"
                  >
                    <Settings size={15} />
                    <span>Website Settings</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenCreateNewsModal();
                    }}
                    className="btn-create-news full-width"
                  >
                    <PlusCircle size={15} />
                    <span>Post News Update</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenCreateSportsModal();
                    }}
                    className="btn-create-news full-width"
                  >
                    <Trophy size={15} />
                    <span>Publish Sports Report</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenCreateDiaryModal();
                    }}
                    className="btn-create-diary full-width"
                  >
                    <BookMarked size={15} />
                    <span>Add to Thakshila Diary</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onLogout();
                    }}
                    className="btn-create-diary full-width"
                  >
                    <LogOut size={15} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Student Portal Active Bar (Visible when logged in as Student) */}
      {isStudent && (
        <div className="student-notification-bar">
          <div className="container editor-bar-inner">
            <div className="editor-bar-text">
              <GraduationCap size={16} className="sparkle-icon" />
              <span>
                <strong>Student E-Library Active:</strong> You can browse and download Past Papers &amp; Study Resources.
              </span>
            </div>
            <div className="editor-bar-actions">
              <button
                type="button"
                onClick={() => setActiveTab('elibrary')}
                className={`btn-mini-action ${activeTab === 'elibrary' ? 'active' : ''}`}
              >
                <BookOpen size={13} />
                <span>E-Library</span>
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="btn-mini-action logout"
                title="Sign out of Student E-Library"
              >
                <LogOut size={13} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor Active Notice Bar (Visible only when logged in as Admin or Master Developer) */}
      {isAdmin && (
        <div className="editor-notification-bar">
          <div className="container editor-bar-inner">
            <div className="editor-bar-text">
              <Sparkles size={15} className="sparkle-icon" />
              <span>
                <strong>{isDeveloper ? 'Master Developer' : 'Administrator'} ({currentUser?.username}):</strong> Website editing &amp; security controls active.
              </span>
            </div>
            <div className="editor-bar-actions">
              <button
                type="button"
                onClick={() => setIsEditMode(!isEditMode)}
                className={`btn-mini-action ${isEditMode ? 'active' : ''}`}
              >
                <Edit size={13} />
                <span>{isEditMode ? 'Edit Mode ON' : 'Edit Mode'}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('elibrary')}
                className={`btn-mini-action ${activeTab === 'elibrary' ? 'active' : ''}`}
              >
                <BookOpen size={13} />
                <span>E-Library</span>
              </button>
              <button
                type="button"
                onClick={onOpenCreateNewsModal}
                className="btn-mini-action"
              >
                <PlusCircle size={13} />
                <span>Add News</span>
              </button>
              <button
                type="button"
                onClick={onOpenCreateSportsModal}
                className="btn-mini-action"
              >
                <Trophy size={13} />
                <span>Add Sports</span>
              </button>
              <button
                type="button"
                onClick={onOpenCreateDiaryModal}
                className="btn-mini-action"
              >
                <BookMarked size={13} />
                <span>Add Diary</span>
              </button>
              <button
                type="button"
                onClick={onOpenEditSettingsModal}
                className="btn-mini-action"
              >
                <Edit size={13} />
                <span>Site Info</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`btn-mini-action ${activeTab === 'settings' ? 'active' : ''}`}
                title="Security Settings, Password & Admin Management"
              >
                <Settings size={13} />
                <span>Settings</span>
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="btn-mini-action logout"
                title="Log out securely"
              >
                <LogOut size={13} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
