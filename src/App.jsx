import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoginModal from './components/LoginModal';
import EditSettingsModal from './components/EditSettingsModal';
import CreatePostModal from './components/CreatePostBox';
import CreateDiaryModal from './components/CreateDiaryModal';
import CreateSportsModal from './components/CreateSportsModal';

import Home from './pages/Home';
import News from './pages/News';
import Sports from './pages/Sports';
import ThakshilaDiary from './pages/ThakshilaDiary';
import About from './pages/About';
import Contact from './pages/Contact';
import ELibrary from './pages/ELibrary';
import ControlDeskLogin from './pages/ControlDeskLogin';
import Settings from './pages/Settings';

import {
  getAuthToken,
  setAuthToken,
  clearAuthToken,
  registerUnauthorizedHandler,
  authFetch
} from './utils/api';

import {
  DEFAULT_SCHOOL_CONFIG,
  INITIAL_NEWS,
  INITIAL_SPORTS,
  INITIAL_DIARY,
  DEFAULT_PAST_PRINCIPALS
} from './config';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [settings, setSettings] = useState(DEFAULT_SCHOOL_CONFIG);
  const [news, setNews] = useState(INITIAL_NEWS);
  const [sports, setSports] = useState(INITIAL_SPORTS || []);
  const [diary, setDiary] = useState(INITIAL_DIARY);
  const [principals, setPrincipals] = useState(DEFAULT_PAST_PRINCIPALS);

  // Cryptographic Server-Verified Authentication State
  const [currentUser, setCurrentUser] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [controlDeskRoute, setControlDeskRoute] = useState(() =>
    (window.location.hash || '').startsWith('#/control-desk')
  );

  const isDeveloper = currentUser?.role === 'developer';
  const isAdmin = currentUser?.role === 'admin' || isDeveloper;
  const isStudent = currentUser?.role === 'student';

  const [likedIds, setLikedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('tcg_liked_items') || '[]');
    } catch {
      return [];
    }
  });

  // Modal Dialogs
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [createNewsModalOpen, setCreateNewsModalOpen] = useState(false);
  const [editingNewsPost, setEditingNewsPost] = useState(null);
  const [createSportsModalOpen, setCreateSportsModalOpen] = useState(false);
  const [editingSportsPost, setEditingSportsPost] = useState(null);
  const [createDiaryModalOpen, setCreateDiaryModalOpen] = useState(false);
  const [editingDiaryEntry, setEditingDiaryEntry] = useState(null);

  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => {
      setToast((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // Watch hidden #/control-desk hash route and global 401 unauthorized events
  useEffect(() => {
    localStorage.removeItem('tcg_admin_logged_in');

    const handleHashChange = () => {
      setControlDeskRoute((window.location.hash || '').startsWith('#/control-desk'));
    };
    window.addEventListener('hashchange', handleHashChange);

    registerUnauthorizedHandler(() => {
      setCurrentUser(null);
      setIsEditMode(false);
      setActiveTab((prev) => (prev === 'settings' || prev === 'elibrary' ? 'home' : prev));
      showToast('Session expired or terminated. Please sign in again.');
    });

    async function verifyExistingSession() {
      if (!getAuthToken()) return;
      try {
        const res = await authFetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            setCurrentUser(data.user);
            if (data.user.role === 'admin' || data.user.role === 'developer') {
              setIsEditMode(true);
            }
          }
        } else {
          clearAuthToken();
        }
      } catch {
        // Keep token offline? Better to stay unauthenticated until verified
      }
    }
    verifyExistingSession();

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Fetch initial data from Express Backend
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/data');
        if (res.ok) {
          const data = await res.json();
          if (data.settings && Object.keys(data.settings).length > 0) {
            setSettings((prev) => ({ ...DEFAULT_SCHOOL_CONFIG, ...prev, ...data.settings }));
            localStorage.setItem('tcg_settings_offline', JSON.stringify({ ...DEFAULT_SCHOOL_CONFIG, ...data.settings }));
          }
          if (Array.isArray(data.news)) {
            setNews(data.news);
            localStorage.setItem('tcg_news_offline', JSON.stringify(data.news));
          } else if (Array.isArray(data.posts)) {
            setNews(data.posts);
            localStorage.setItem('tcg_news_offline', JSON.stringify(data.posts));
          }
          if (Array.isArray(data.sports)) {
            setSports(data.sports);
            localStorage.setItem('tcg_sports_offline', JSON.stringify(data.sports));
          }
          if (Array.isArray(data.diary)) {
            setDiary(data.diary);
            localStorage.setItem('tcg_diary_offline', JSON.stringify(data.diary));
          }
          if (Array.isArray(data.principals)) {
            setPrincipals(data.principals);
            localStorage.setItem('tcg_principals_offline', JSON.stringify(data.principals));
          }
          return;
        }
      } catch {
        // Fallback to localStorage if offline
        const savedSettings = localStorage.getItem('tcg_settings_offline');
        const savedNews = localStorage.getItem('tcg_news_offline');
        const savedSports = localStorage.getItem('tcg_sports_offline');
        const savedDiary = localStorage.getItem('tcg_diary_offline');
        const savedPrincipals = localStorage.getItem('tcg_principals_offline');
        if (savedSettings) {
          try {
            const parsed = JSON.parse(savedSettings);
            setSettings((prev) => ({ ...DEFAULT_SCHOOL_CONFIG, ...prev, ...parsed }));
          } catch {}
        }
        if (savedNews) setNews(JSON.parse(savedNews));
        if (savedSports) {
          try {
            const parsed = JSON.parse(savedSports);
            setSports(Array.isArray(parsed) ? parsed.filter((p) => !['sports-1', 'sports-2', 'sports-3'].includes(p.id)) : []);
          } catch {
            setSports([]);
          }
        }
        if (savedDiary) setDiary(JSON.parse(savedDiary));
        if (savedPrincipals) setPrincipals(JSON.parse(savedPrincipals));
      }
    }
    loadData();
  }, []);

  // Sort News: Pinned first, then newest
  const sortedNews = [...news].sort((a, b) => {
    if (Boolean(b.pinned) !== Boolean(a.pinned)) {
      return b.pinned ? 1 : -1;
    }
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  // Common Student Portal Login Handler (Public modal -> unlocks E-Library)
  const handleStudentLogin = async (username, password) => {
    try {
      const res = await fetch('/api/student/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok && data.success && data.token) {
        setAuthToken(data.token);
        setCurrentUser(data.user);
        setIsEditMode(false);
        setActiveTab('elibrary');
        showToast('Welcome to Thakshila College E-Library!');
        return { success: true };
      }
      return data;
    } catch {
      return {
        success: false,
        message: 'Unable to reach security authentication server.'
      };
    }
  };

  // Hidden Staff & Master Developer Login Handler (/#/control-desk)
  const handleControlDeskLogin = async ({ username, password, securityPin, loginMode }) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, securityPin, loginMode })
      });
      const data = await res.json();
      if (res.ok && data.success && data.token) {
        setAuthToken(data.token);
        setCurrentUser(data.user);
        setIsEditMode(true);
        window.location.hash = '';
        setControlDeskRoute(false);
        setActiveTab('home');
        showToast(
          data.user.role === 'developer'
            ? 'Master Developer Control Activated!'
            : 'Administrator Editing Mode Activated!'
        );
        return { success: true };
      }
      return data;
    } catch {
      return {
        success: false,
        message: 'Unable to reach security authentication server.'
      };
    }
  };

  const handleLogout = async () => {
    try {
      await authFetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Proceed with local cleanup even if network fails
    }
    clearAuthToken();
    localStorage.removeItem('tcg_admin_logged_in');
    setCurrentUser(null);
    setIsEditMode(false);
    setActiveTab((prev) => (prev === 'settings' || prev === 'elibrary' ? 'home' : prev));
    showToast('Signed out safely.');
  };

  // Save Settings (Authenticated Admin / Developer)
  const handleSaveSettings = async (updatedFields) => {
    try {
      const res = await authFetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showToast(err.message || 'Authorization required to update website settings.');
        return;
      }
      const saved = await res.json();
      const merged = { ...settings, ...saved };
      setSettings(merged);
      localStorage.setItem('tcg_settings_offline', JSON.stringify(merged));
      showToast('Website details updated successfully!');
    } catch {
      showToast('Server connection error while saving website settings.');
    }
  };

  // News Handlers (Authenticated Admin / Developer)
  const handleSaveNews = async (newsPayload) => {
    const isEdit = Boolean(newsPayload.id);
    try {
      const url = isEdit ? `/api/news/${newsPayload.id}` : '/api/news';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newsPayload)
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showToast(err.message || 'Authorization required to publish news.');
        return;
      }

      const saved = await res.json();
      setNews((prev) => {
        const next = isEdit
          ? prev.map((item) => (item.id === saved.id ? saved : item))
          : [saved, ...prev];
        localStorage.setItem('tcg_news_offline', JSON.stringify(next));
        return next;
      });
      showToast(isEdit ? 'News post updated!' : 'New school news published!');
    } catch {
      showToast('Server connection error while saving news post.');
    }
  };

  const handleDeleteNews = async (id) => {
    if (!window.confirm('Are you sure you want to delete this news post?')) return;
    try {
      const res = await authFetch(`/api/news/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showToast(err.message || 'Authorization required to delete news.');
        return;
      }
      setNews((prev) => {
        const next = prev.filter((item) => item.id !== id);
        localStorage.setItem('tcg_news_offline', JSON.stringify(next));
        return next;
      });
      showToast('News post deleted.');
    } catch {
      showToast('Server connection error while deleting news.');
    }
  };

  const handleLikeNews = async (id) => {
    const alreadyLiked = likedIds.includes(id);
    const delta = alreadyLiked ? -1 : 1;

    const updated = alreadyLiked
      ? likedIds.filter((item) => item !== id)
      : [...likedIds, id];

    setLikedIds(updated);
    localStorage.setItem('tcg_liked_items', JSON.stringify(updated));

    setNews((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, likes: Math.max(0, (item.likes || 0) + delta) }
          : item
      )
    );

    try {
      await fetch(`/api/news/${id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delta })
      });
    } catch {
      // Offline fallback
    }
  };

  // Sports & Athletics Handlers (Authenticated Admin / Developer)
  const handleSaveSports = async (sportsPayload) => {
    const isEdit = Boolean(sportsPayload.id);
    try {
      const url = isEdit ? `/api/sports/${sportsPayload.id}` : '/api/sports';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sportsPayload)
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showToast(err.message || 'Authorization required to publish sports bulletin.');
        return;
      }

      const saved = await res.json();
      setSports((prev) => {
        const next = isEdit
          ? prev.map((item) => (item.id === saved.id ? saved : item))
          : [saved, ...prev];
        localStorage.setItem('tcg_sports_offline', JSON.stringify(next));
        return next;
      });
      showToast(isEdit ? 'Sports report updated!' : 'New sports match report published!');
    } catch {
      showToast('Server connection error while saving sports report.');
    }
  };

  const handleDeleteSports = async (id) => {
    if (!window.confirm('Are you sure you want to delete this sports report?')) return;
    try {
      const res = await authFetch(`/api/sports/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showToast(err.message || 'Authorization required to delete sports report.');
        return;
      }
      setSports((prev) => {
        const next = prev.filter((item) => item.id !== id);
        localStorage.setItem('tcg_sports_offline', JSON.stringify(next));
        return next;
      });
      showToast('Sports report deleted successfully.');
    } catch {
      showToast('Server connection error while deleting sports report.');
    }
  };

  const handleLikeSports = async (id) => {
    const isCurrentlyLiked = likedIds.includes(id);
    const delta = isCurrentlyLiked ? -1 : 1;
    const updated = isCurrentlyLiked
      ? likedIds.filter((itemId) => itemId !== id)
      : [...likedIds, id];

    setLikedIds(updated);
    localStorage.setItem('tcg_liked_items', JSON.stringify(updated));

    setSports((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, likes: Math.max(0, (item.likes || 0) + delta) }
          : item
      )
    );

    try {
      await fetch(`/api/sports/${id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delta })
      });
    } catch {
      // Offline fallback
    }
  };

  // Thakshila Diary Handlers (Authenticated Admin / Developer)
  const handleSaveDiary = async (diaryPayload) => {
    const isEdit = Boolean(diaryPayload.id);
    try {
      const url = isEdit ? `/api/diary/${diaryPayload.id}` : '/api/diary';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(diaryPayload)
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showToast(err.message || 'Authorization required to save diary entry.');
        return;
      }

      const saved = await res.json();
      setDiary((prev) => {
        const next = isEdit
          ? prev.map((item) => (item.id === saved.id ? saved : item))
          : [saved, ...prev];
        localStorage.setItem('tcg_diary_offline', JSON.stringify(next));
        return next;
      });
      showToast(
        isEdit ? 'Diary entry updated!' : 'New memory added to Thakshila Diary!'
      );
    } catch {
      showToast('Server connection error while saving diary entry.');
    }
  };

  const handleDeleteDiary = async (id) => {
    if (!window.confirm('Are you sure you want to delete this Thakshila Diary entry?'))
      return;
    try {
      const res = await authFetch(`/api/diary/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showToast(err.message || 'Authorization required to delete diary entry.');
        return;
      }
      setDiary((prev) => {
        const next = prev.filter((item) => item.id !== id);
        localStorage.setItem('tcg_diary_offline', JSON.stringify(next));
        return next;
      });
      showToast('Diary entry deleted.');
    } catch {
      showToast('Server connection error while deleting diary entry.');
    }
  };

  const handleLikeDiary = async (id) => {
    const alreadyLiked = likedIds.includes(id);
    const delta = alreadyLiked ? -1 : 1;

    const updated = alreadyLiked
      ? likedIds.filter((item) => item !== id)
      : [...likedIds, id];

    setLikedIds(updated);
    localStorage.setItem('tcg_liked_items', JSON.stringify(updated));

    setDiary((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, likes: Math.max(0, (item.likes || 0) + delta) }
          : item
      )
    );

    try {
      await fetch(`/api/diary/${id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delta })
      });
    } catch {
      // Offline fallback
    }
  };

  // Past Principals Handlers (Authenticated Admin / Developer)
  const handleSavePrincipal = async (principalPayload) => {
    const isEdit = Boolean(principalPayload.id);
    let nextList;

    if (isEdit) {
      nextList = principals.map((p) =>
        p.id === principalPayload.id ? { ...p, ...principalPayload } : p
      );
    } else {
      const newPrincipal = {
        ...principalPayload,
        id: `principal-${Date.now()}`
      };
      // User wants latest first, so newly added goes to top
      nextList = [newPrincipal, ...principals];
    }

    try {
      const res = await authFetch('/api/principals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextList)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showToast(err.message || 'Authorization required to update principals.');
        return;
      }
      setPrincipals(nextList);
      localStorage.setItem('tcg_principals_offline', JSON.stringify(nextList));
      showToast(isEdit ? 'Principal details updated!' : 'New Principal added to Hall of Leadership!');
    } catch {
      showToast('Server connection error while saving principal.');
    }
  };

  const handleDeletePrincipal = async (id) => {
    if (!window.confirm('Are you sure you want to remove this principal record?')) return;
    try {
      const res = await authFetch(`/api/principals/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showToast(err.message || 'Authorization required to delete principal.');
        return;
      }
      const nextList = principals.filter((p) => p.id !== id);
      setPrincipals(nextList);
      localStorage.setItem('tcg_principals_offline', JSON.stringify(nextList));
      showToast('Principal record removed.');
    } catch {
      showToast('Server connection error while deleting principal.');
    }
  };

  const handleSavePrincipals = async (updatedList) => {
    try {
      const res = await authFetch('/api/principals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedList)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showToast(err.message || 'Authorization required to reorder principals.');
        return;
      }
      setPrincipals(updatedList);
      localStorage.setItem('tcg_principals_offline', JSON.stringify(updatedList));
      showToast('Past Principals order saved.');
    } catch {
      showToast('Server connection error while saving principals order.');
    }
  };

  const counts = {
    news: news.length,
    sports: sports.length,
    diary: diary.length
  };

  // Hidden Secret Control Desk View (Only reachable via /#/control-desk)
  if (controlDeskRoute && !isAdmin) {
    return (
      <div className="app-shell">
        <ControlDeskLogin
          settings={settings}
          onControlDeskLogin={handleControlDeskLogin}
          onReturnHome={() => {
            window.location.hash = '';
            setControlDeskRoute(false);
          }}
        />
        {toast && <div className="toast-notification">{toast}</div>}
      </div>
    );
  }

  return (
    <div className="app-shell">
      {/* 
        ============================================================
        TOP NAVIGATION:
        - Website Name: "Thakshila College - Gampaha"
        - Pages: Home, News, Thakshila Diary, (E-Library when logged in), About, Contact US
        - Two Buttons: LMS (https://tcg.bluesmartschool.com/) & Login
        ============================================================
      */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        settings={settings}
        currentUser={currentUser}
        isAdmin={isAdmin}
        isDeveloper={isDeveloper}
        isStudent={isStudent}
        isEditMode={isEditMode}
        setIsEditMode={setIsEditMode}
        onOpenLoginModal={() => setLoginModalOpen(true)}
        onOpenCreateNewsModal={(cat) => {
          setEditingNewsPost(typeof cat === 'string' ? { category: cat } : null);
          setCreateNewsModalOpen(true);
        }}
        onOpenCreateSportsModal={() => {
          setEditingSportsPost(null);
          setCreateSportsModalOpen(true);
        }}
        onOpenCreateDiaryModal={() => {
          setEditingDiaryEntry(null);
          setCreateDiaryModalOpen(true);
        }}
        onOpenEditSettingsModal={() => setSettingsModalOpen(true)}
        onLogout={handleLogout}
        counts={counts}
      />

      {/* Main Pages */}
      <main className="main-content">
        {activeTab === 'home' && (
          <Home
            settings={settings}
            news={sortedNews}
            sports={sports}
            diary={diary}
            isAdmin={isAdmin}
            isEditMode={isEditMode}
            likedIds={likedIds}
            onLikeNews={handleLikeNews}
            onEditNews={(post) => {
              setEditingNewsPost(post);
              setCreateNewsModalOpen(true);
            }}
            onDeleteNews={handleDeleteNews}
            onOpenCreateNewsModal={(cat) => {
              setEditingNewsPost(typeof cat === 'string' ? { category: cat } : null);
              setCreateNewsModalOpen(true);
            }}
            onLikeSports={handleLikeSports}
            onEditSports={(post) => {
              setEditingSportsPost(post);
              setCreateSportsModalOpen(true);
            }}
            onDeleteSports={handleDeleteSports}
            onOpenCreateSportsModal={() => {
              setEditingSportsPost(null);
              setCreateSportsModalOpen(true);
            }}
            onOpenCreateDiaryModal={() => {
              setEditingDiaryEntry(null);
              setCreateDiaryModalOpen(true);
            }}
            onOpenEditSettingsModal={() => setSettingsModalOpen(true)}
            onOpenLoginModal={() => setLoginModalOpen(true)}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'news' && (
          <News
            news={sortedNews}
            settings={settings}
            isAdmin={isAdmin}
            isEditMode={isEditMode}
            likedIds={likedIds}
            onLikeNews={handleLikeNews}
            onEditNews={(post) => {
              setEditingNewsPost(post);
              setCreateNewsModalOpen(true);
            }}
            onDeleteNews={handleDeleteNews}
            onOpenCreateNewsModal={(cat) => {
              setEditingNewsPost(typeof cat === 'string' ? { category: cat } : null);
              setCreateNewsModalOpen(true);
            }}
            onOpenLoginModal={() => setLoginModalOpen(true)}
          />
        )}

        {activeTab === 'sports' && (
          <Sports
            sports={sports}
            settings={settings}
            isAdmin={isAdmin}
            isEditMode={isEditMode}
            likedIds={likedIds}
            onLikeSports={handleLikeSports}
            onEditSports={(post) => {
              setEditingSportsPost(post);
              setCreateSportsModalOpen(true);
            }}
            onDeleteSports={handleDeleteSports}
            onOpenCreateSportsModal={() => {
              setEditingSportsPost(null);
              setCreateSportsModalOpen(true);
            }}
            onOpenLoginModal={() => setLoginModalOpen(true)}
          />
        )}

        {activeTab === 'diary' && (
          <ThakshilaDiary
            diary={diary}
            settings={settings}
            isAdmin={isAdmin}
            isEditMode={isEditMode}
            likedIds={likedIds}
            onLikeDiary={handleLikeDiary}
            onEditDiary={(entry) => {
              setEditingDiaryEntry(entry);
              setCreateDiaryModalOpen(true);
            }}
            onDeleteDiary={handleDeleteDiary}
            onOpenCreateDiaryModal={() => {
              setEditingDiaryEntry(null);
              setCreateDiaryModalOpen(true);
            }}
            onOpenLoginModal={() => setLoginModalOpen(true)}
          />
        )}

        {activeTab === 'about' && (
          <About
            settings={settings}
            principals={principals}
            isAdmin={isAdmin}
            isEditMode={isEditMode}
            onOpenEditSettingsModal={() => setSettingsModalOpen(true)}
            onSaveSettings={handleSaveSettings}
            onSavePrincipal={handleSavePrincipal}
            onDeletePrincipal={handleDeletePrincipal}
            onSavePrincipals={handleSavePrincipals}
          />
        )}

        {activeTab === 'contact' && (
          <Contact
            settings={settings}
            isAdmin={isAdmin}
            isEditMode={isEditMode}
            onOpenEditSettingsModal={() => setSettingsModalOpen(true)}
          />
        )}

        {activeTab === 'elibrary' && currentUser && (
          <ELibrary
            settings={settings}
            currentUser={currentUser}
            isAdmin={isAdmin}
            isEditMode={isEditMode}
            showToast={showToast}
          />
        )}

        {activeTab === 'settings' && isAdmin && (
          <Settings
            currentUser={currentUser}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        settings={settings}
        setActiveTab={setActiveTab}
        isAdmin={isAdmin}
        onOpenLoginModal={() => setLoginModalOpen(true)}
        onOpenEditSettingsModal={() => setSettingsModalOpen(true)}
      />

      {/* 
        ============================================================
        MODALS:
        1. Login Modal (Student E-Library & School Portal Login)
        2. Edit Settings Modal (Edit Hero, Motto, LMS Link, Contact)
        3. Create/Edit News Modal (Facebook style post)
        4. Create/Edit Diary Modal (Thakshila Diary stories)
        ============================================================
      */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onStudentLogin={handleStudentLogin}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenELibrary={() => {
          setLoginModalOpen(false);
          setActiveTab('elibrary');
        }}
        settings={settings}
      />

      <EditSettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
      />

      <CreatePostModal
        isOpen={createNewsModalOpen}
        onClose={() => {
          setCreateNewsModalOpen(false);
          setEditingNewsPost(null);
        }}
        onSave={handleSaveNews}
        editingPost={editingNewsPost}
        schoolLogo={settings.schoolLogo}
      />

      <CreateSportsModal
        isOpen={createSportsModalOpen}
        onClose={() => {
          setCreateSportsModalOpen(false);
          setEditingSportsPost(null);
        }}
        onSave={handleSaveSports}
        editingEntry={editingSportsPost}
        editingPost={editingSportsPost}
        schoolLogo={settings.schoolLogo}
      />

      <CreateDiaryModal
        isOpen={createDiaryModalOpen}
        onClose={() => {
          setCreateDiaryModalOpen(false);
          setEditingDiaryEntry(null);
        }}
        onSave={handleSaveDiary}
        editingEntry={editingDiaryEntry}
      />

      {/* Toast Notification */}
      {toast && <div className="toast-notification">{toast}</div>}
    </div>
  );
}
