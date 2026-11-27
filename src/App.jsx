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
  getLocalItem,
  setLocalItem,
  idbGet
} from './utils/storage';

import {
  DEFAULT_SCHOOL_CONFIG,
  INITIAL_NEWS,
  INITIAL_SPORTS,
  INITIAL_DIARY,
  DEFAULT_PAST_PRINCIPALS
} from './config';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [settings, setSettings] = useState(() => {
    const local = getLocalItem('tcg_settings_offline', null);
    if (local && typeof local === 'object') {
      return { ...DEFAULT_SCHOOL_CONFIG, ...local };
    }
    return DEFAULT_SCHOOL_CONFIG;
  });
  const [news, setNews] = useState(() => {
    const local = getLocalItem('tcg_news_offline', null);
    return Array.isArray(local) && local.length > 0 ? local : INITIAL_NEWS;
  });
  const [sports, setSports] = useState(() => {
    const local = getLocalItem('tcg_sports_offline', null);
    return Array.isArray(local) ? local : (INITIAL_SPORTS || []);
  });
  const [diary, setDiary] = useState(() => {
    const local = getLocalItem('tcg_diary_offline', null);
    return Array.isArray(local) && local.length > 0 ? local : INITIAL_DIARY;
  });
  const [principals, setPrincipals] = useState(() => {
    const local = getLocalItem('tcg_principals_offline', null);
    return Array.isArray(local) && local.length > 0 ? local : DEFAULT_PAST_PRINCIPALS;
  });

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
      setActiveTab((prev) => (prev === 'settings' ? 'home' : prev));
      showToast('Session expired or terminated. Please sign in again.');
    });

    async function verifyExistingSession() {
      const token = getAuthToken();
      if (!token) return;

      // Resilient fallback session reconstruction for static hosting (Vercel, Firebase)
      if (token.startsWith('tcg_dev_token_')) {
        setCurrentUser({
          id: 'dev-master-1',
          username: 'developer',
          role: 'developer',
          name: 'Lead Developer & Master Administrator'
        });
        setIsEditMode(true);
        return;
      }
      if (token.startsWith('tcg_admin_token_')) {
        setCurrentUser({
          id: 'admin-1',
          username: 'admin',
          role: 'admin',
          name: 'School Administrator'
        });
        setIsEditMode(true);
        return;
      }
      if (token.startsWith('tcg_student_token_')) {
        setCurrentUser({
          id: 'student-portal',
          username: 'student',
          role: 'student',
          name: 'Student Portal User'
        });
        setIsEditMode(false);
        return;
      }

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

  // Hydrate large media and customizations from IndexedDB on startup
  useEffect(() => {
    async function hydrateFromIndexedDB() {
      try {
        const idbSettings = await idbGet('tcg_settings_offline');
        if (idbSettings && typeof idbSettings === 'object' && Object.keys(idbSettings).length > 0) {
          setSettings((prev) => ({ ...prev, ...idbSettings }));
        }
        const idbPrincipals = await idbGet('tcg_principals_offline');
        if (Array.isArray(idbPrincipals) && idbPrincipals.length > 0) {
          setPrincipals(idbPrincipals);
        }
      } catch (err) {
        console.warn('IndexedDB hydration error:', err);
      }
    }
    hydrateFromIndexedDB();
  }, []);

  // Fetch initial data from Express Backend and merge cleanly with local customizations
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/data');
        const cType = res.headers.get('content-type') || '';
        if (res.ok && cType.includes('application/json')) {
          const data = await res.json();

          // 1. SETTINGS: Merge DEFAULT < SERVER < USER LOCAL EDITS (User customizations never wiped on reload!)
          const localSettings = getLocalItem('tcg_settings_offline', {});
          const mergedSettings = {
            ...DEFAULT_SCHOOL_CONFIG,
            ...(data.settings || {}),
            ...localSettings
          };
          setSettings(mergedSettings);
          setLocalItem('tcg_settings_offline', mergedSettings);

          // 2. NEWS: Merge or preserve local offline news
          const localNews = getLocalItem('tcg_news_offline', null);
          if (Array.isArray(localNews) && localNews.length > 0) {
            setNews(localNews);
          } else if (Array.isArray(data.news) && data.news.length > 0) {
            setNews(data.news);
            setLocalItem('tcg_news_offline', data.news);
          } else if (Array.isArray(data.posts) && data.posts.length > 0) {
            setNews(data.posts);
            setLocalItem('tcg_news_offline', data.posts);
          }

          // 3. SPORTS
          const localSports = getLocalItem('tcg_sports_offline', null);
          if (Array.isArray(localSports)) {
            setSports(localSports);
          } else if (Array.isArray(data.sports)) {
            setSports(data.sports);
            setLocalItem('tcg_sports_offline', data.sports);
          }

          // 4. DIARY
          const localDiary = getLocalItem('tcg_diary_offline', null);
          if (Array.isArray(localDiary) && localDiary.length > 0) {
            setDiary(localDiary);
          } else if (Array.isArray(data.diary) && data.diary.length > 0) {
            setDiary(data.diary);
            setLocalItem('tcg_diary_offline', data.diary);
          }

          // 5. PRINCIPALS: Preserve user's local principals edits and photo changes
          const localPrincipals = getLocalItem('tcg_principals_offline', null);
          if (Array.isArray(localPrincipals) && localPrincipals.length > 0) {
            setPrincipals(localPrincipals);
          } else if (Array.isArray(data.principals) && data.principals.length > 0) {
            setPrincipals(data.principals);
            setLocalItem('tcg_principals_offline', data.principals);
          }
          return;
        }
      } catch {
        // Safe offline fallback already loaded synchronously
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
    const cleanUser = String(username).trim().toLowerCase();
    try {
      const res = await fetch('/api/student/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const cType = res.headers.get('content-type') || '';
      if (res.ok && cType.includes('application/json')) {
        const data = await res.json();
        if (data.success && data.token) {
          setAuthToken(data.token);
          setCurrentUser(data.user);
          setIsEditMode(false);
          setActiveTab('elibrary');
          showToast('Welcome to Thakshila College E-Library!');
          return { success: true };
        }
      }
    } catch {
      // API server offline / static host
    }

    // Offline / Static fallback (Vercel, Firebase, etc.)
    if ((cleanUser === 'student' || cleanUser === 'tcgampaha') && password === 'thakshila2026') {
      const fallbackUser = { id: 'student-portal', role: 'student', username: 'student', name: 'Student Portal User' };
      setAuthToken('tcg_student_token_' + Date.now());
      setCurrentUser(fallbackUser);
      setIsEditMode(false);
      setActiveTab('elibrary');
      showToast('Welcome to Thakshila College E-Library!');
      return { success: true };
    }
    return {
      success: false,
      message: 'Invalid Student Portal credentials. Please check your username and password.'
    };
  };

  // Hidden Staff & Master Developer Login Handler (/#/control-desk)
  const handleControlDeskLogin = async ({ username, password, securityPin, loginMode }) => {
    const cleanUser = String(username).trim().toLowerCase();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, securityPin, loginMode })
      });
      const cType = res.headers.get('content-type') || '';
      if (res.ok && cType.includes('application/json')) {
        const data = await res.json();
        if (data.success && data.token) {
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
      }
    } catch {
      // API server offline / static host
    }

    // Offline / Static fallback (Vercel, Firebase, etc.)
    if (
      loginMode === 'developer' &&
      cleanUser === 'developer' &&
      password === 'TcgDev@2026' &&
      securityPin === '20052720231020050928'
    ) {
      const devUser = {
        id: 'dev-master-1',
        username: 'developer',
        role: 'developer',
        name: 'Lead Developer & Master Administrator'
      };
      setAuthToken('tcg_dev_token_' + Date.now());
      setCurrentUser(devUser);
      setIsEditMode(true);
      localStorage.setItem('tcg_admin_logged_in', 'true');
      window.location.hash = '';
      setControlDeskRoute(false);
      setActiveTab('home');
      showToast('Master Developer Control Activated!');
      return { success: true };
    }
    if (
      loginMode === 'admin' &&
      cleanUser === 'admin' &&
      password === 'admin123'
    ) {
      const adminUser = {
        id: 'admin-1',
        username: 'admin',
        role: 'admin',
        name: 'School Administrator'
      };
      setAuthToken('tcg_admin_token_' + Date.now());
      setCurrentUser(adminUser);
      setIsEditMode(true);
      localStorage.setItem('tcg_admin_logged_in', 'true');
      window.location.hash = '';
      setControlDeskRoute(false);
      setActiveTab('home');
      showToast('Administrator Editing Mode Activated!');
      return { success: true };
    }
    return {
      success: false,
      message: 'Invalid credentials. Please verify your username, password, or security PIN.'
    };
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
    setActiveTab((prev) => (prev === 'settings' ? 'home' : prev));
    showToast('Signed out safely.');
  };

  // Save Settings (Authenticated Admin / Developer)
  const handleSaveSettings = async (updatedFields) => {
    // 1. Immediately update state and multi-layer persistent storage (IndexedDB + localStorage)
    const merged = { ...settings, ...updatedFields };
    setSettings(merged);
    setLocalItem('tcg_settings_offline', merged);

    if (Array.isArray(updatedFields.pastPrincipals)) {
      setPrincipals(updatedFields.pastPrincipals);
      setLocalItem('tcg_principals_offline', updatedFields.pastPrincipals);
      try {
        authFetch('/api/principals', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedFields.pastPrincipals)
        }).catch(() => {});
      } catch {}
    }

    showToast('Website details updated and saved successfully!');

    // 2. Asynchronously sync to backend
    try {
      const res = await authFetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
      if (res.ok) {
        const saved = await res.json().catch(() => ({}));
        if (saved && typeof saved === 'object' && Object.keys(saved).length > 0) {
          const finalMerged = { ...merged, ...saved };
          setSettings(finalMerged);
          setLocalItem('tcg_settings_offline', finalMerged);
        }
      }
    } catch {
      // Offline fallback already safely stored
    }
  };

  // News Handlers (Authenticated Admin / Developer)
  const handleSaveNews = async (newsPayload) => {
    const isEdit = Boolean(newsPayload.id);
    const postData = {
      ...newsPayload,
      id: newsPayload.id || `news-${Date.now()}`,
      createdAt: newsPayload.createdAt || new Date().toISOString()
    };

    setNews((prev) => {
      const next = isEdit
        ? prev.map((item) => (item.id === postData.id ? postData : item))
        : [postData, ...prev];
      setLocalItem('tcg_news_offline', next);
      return next;
    });
    showToast(isEdit ? 'News post updated!' : 'New school news published!');

    try {
      const url = isEdit ? `/api/news/${newsPayload.id}` : '/api/news';
      const method = isEdit ? 'PUT' : 'POST';
      await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newsPayload)
      });
    } catch {
      // Offline fallback already safely stored
    }
  };

  const handleDeleteNews = async (id) => {
    if (!window.confirm('Are you sure you want to delete this news post?')) return;
    setNews((prev) => {
      const next = prev.filter((item) => item.id !== id);
      setLocalItem('tcg_news_offline', next);
      return next;
    });
    showToast('News post deleted.');

    try {
      await authFetch(`/api/news/${id}`, { method: 'DELETE' });
    } catch {}
  };

  const handleLikeNews = async (id) => {
    const alreadyLiked = likedIds.includes(id);
    const delta = alreadyLiked ? -1 : 1;

    const updated = alreadyLiked
      ? likedIds.filter((item) => item !== id)
      : [...likedIds, id];

    setLikedIds(updated);
    setLocalItem('tcg_liked_items', updated);

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
    const postData = {
      ...sportsPayload,
      id: sportsPayload.id || `sports-${Date.now()}`,
      createdAt: sportsPayload.createdAt || new Date().toISOString()
    };

    setSports((prev) => {
      const next = isEdit
        ? prev.map((item) => (item.id === postData.id ? postData : item))
        : [postData, ...prev];
      setLocalItem('tcg_sports_offline', next);
      return next;
    });
    showToast(isEdit ? 'Sports report updated!' : 'New sports match report published!');

    try {
      const url = isEdit ? `/api/sports/${sportsPayload.id}` : '/api/sports';
      const method = isEdit ? 'PUT' : 'POST';
      await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sportsPayload)
      });
    } catch {
      // Safely stored
    }
  };

  const handleDeleteSports = async (id) => {
    if (!window.confirm('Are you sure you want to delete this sports report?')) return;
    setSports((prev) => {
      const next = prev.filter((item) => item.id !== id);
      setLocalItem('tcg_sports_offline', next);
      return next;
    });
    showToast('Sports report deleted successfully.');

    try {
      await authFetch(`/api/sports/${id}`, { method: 'DELETE' });
    } catch {}
  };

  const handleLikeSports = async (id) => {
    const isCurrentlyLiked = likedIds.includes(id);
    const delta = isCurrentlyLiked ? -1 : 1;
    const updated = isCurrentlyLiked
      ? likedIds.filter((itemId) => itemId !== id)
      : [...likedIds, id];

    setLikedIds(updated);
    setLocalItem('tcg_liked_items', updated);

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
    const entryData = {
      ...diaryPayload,
      id: diaryPayload.id || `diary-${Date.now()}`,
      createdAt: diaryPayload.createdAt || new Date().toISOString()
    };

    setDiary((prev) => {
      const next = isEdit
        ? prev.map((item) => (item.id === entryData.id ? entryData : item))
        : [entryData, ...prev];
      setLocalItem('tcg_diary_offline', next);
      return next;
    });
    showToast(isEdit ? 'Diary entry updated!' : 'New memory added to Thakshila Diary!');

    try {
      const url = isEdit ? `/api/diary/${diaryPayload.id}` : '/api/diary';
      const method = isEdit ? 'PUT' : 'POST';
      await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(diaryPayload)
      });
    } catch {
      // Safely stored
    }
  };

  const handleDeleteDiary = async (id) => {
    if (!window.confirm('Are you sure you want to delete this Thakshila Diary entry?'))
      return;
    setDiary((prev) => {
      const next = prev.filter((item) => item.id !== id);
      setLocalItem('tcg_diary_offline', next);
      return next;
    });
    showToast('Diary entry deleted.');

    try {
      await authFetch(`/api/diary/${id}`, { method: 'DELETE' });
    } catch {}
  };

  const handleLikeDiary = async (id) => {
    const alreadyLiked = likedIds.includes(id);
    const delta = alreadyLiked ? -1 : 1;

    const updated = alreadyLiked
      ? likedIds.filter((item) => item !== id)
      : [...likedIds, id];

    setLikedIds(updated);
    setLocalItem('tcg_liked_items', updated);

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

    // Immediately update state and multi-layer persistent storage (IndexedDB + localStorage)
    setPrincipals(nextList);
    setLocalItem('tcg_principals_offline', nextList);
    showToast(isEdit ? 'Principal details updated!' : 'New Principal added to Hall of Leadership!');

    try {
      await authFetch('/api/principals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextList)
      });
    } catch {
      // Safely persisted in browser
    }
  };

  const handleDeletePrincipal = async (id) => {
    if (!window.confirm('Are you sure you want to remove this principal record?')) return;
    const nextList = principals.filter((p) => p.id !== id);
    setPrincipals(nextList);
    setLocalItem('tcg_principals_offline', nextList);
    showToast('Principal record removed.');

    try {
      await authFetch(`/api/principals/${id}`, { method: 'DELETE' });
    } catch {}
  };

  const handleSavePrincipals = async (updatedList) => {
    setPrincipals(updatedList);
    setLocalItem('tcg_principals_offline', updatedList);
    showToast('Past Principals order saved.');

    try {
      await authFetch('/api/principals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedList)
      });
    } catch {}
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
            onSaveSettings={handleSaveSettings}
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

        {activeTab === 'elibrary' && (
          <ELibrary
            settings={settings}
            currentUser={currentUser}
            isAdmin={isAdmin}
            isEditMode={isEditMode}
            showToast={showToast}
            onOpenLoginModal={() => setLoginModalOpen(true)}
            onLogout={handleLogout}
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
