import React, { useState, useEffect, useRef } from 'react';
import {
  Save,
  X,
  Info,
  Target,
  UserCheck,
  History,
  Shield,
  Trophy,
  Upload,
  Plus,
  Trash2,
  Image as ImageIcon,
  Sparkles,
  Flag,
  Music,
  BookOpen,
  Award
} from 'lucide-react';
import { DEFAULT_SCHOOL_CONFIG } from '../config';
import { compressImageFile } from '../utils/imageHelpers';

function ImageFieldControl({ label, value, onChange, presets = [] }) {
  const fileRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImageFile(file);
    if (compressed) onChange(compressed);
    e.target.value = '';
  };

  return (
    <div className="about-image-editor-box">
      <div className="about-image-preview-wrap">
        <img
          src={value || '/Pictures/Front of School.jpeg'}
          alt={label}
          className="about-editor-thumb"
        />
      </div>
      <div className="about-image-controls">
        <label className="image-field-label">
          <ImageIcon size={13} /> {label}
        </label>
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/Pictures/... or https://..."
        />
        <div className="about-image-btn-row">
          <button
            type="button"
            className="btn-upload-trigger"
            onClick={() => fileRef.current?.click()}
          >
            <Upload size={13} />
            <span>Upload Photo</span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            style={{ display: 'none' }}
          />
          {presets.map((p, idx) => (
            <button
              key={idx}
              type="button"
              className={`preset-pill ${value === p.path ? 'active' : ''}`}
              onClick={() => onChange(p.path)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const SECTION_TABS = [
  { id: 'intro', num: '1', label: 'Introduction', icon: Info },
  { id: 'vision', num: '2', label: 'Vision & Mission', icon: Target },
  { id: 'principal', num: '3', label: "Principal's Msg", icon: UserCheck },
  { id: 'history', num: '4', label: 'History', icon: History },
  { id: 'identity', num: '5', label: 'School Identity', icon: Shield },
  { id: 'achievements', num: '6', label: 'Achievements', icon: Trophy }
];

export default function EditAboutModal({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  initialSection = 'intro'
}) {
  const [activeTab, setActiveTab] = useState(initialSection);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});
  const prevOpenRef = useRef(false);

  useEffect(() => {
    if (isOpen && !prevOpenRef.current) {
      setActiveTab(initialSection || 'intro');
      const merged = { ...DEFAULT_SCHOOL_CONFIG, ...(settings || {}) };
      setFormData({
        // 1. Intro
        foundedYear: merged.foundedYear,
        schoolType: merged.schoolType || '1AB',
        schoolDevelopmentAccount: merged.schoolDevelopmentAccount || '026100150031366',
        landArea: merged.landArea || '1 acre, 26.65 perches',
        divisionalSecretariat: merged.divisionalSecretariat || 'Gampaha',
        gramaNiladhariDivision: merged.gramaNiladhariDivision || 'Bandiyamulla',
        educationDivision: merged.educationDivision || 'Gampaha',
        educationZone: merged.educationZone || 'Gampaha',
        locationDetails: merged.locationDetails,
        introTitle: merged.introTitle,
        introLead: merged.introLead,
        introBody: merged.introBody,
        aboutIntroImage: merged.aboutIntroImage,
        aboutIntroImageCaption: merged.aboutIntroImageCaption,
        academicSections: Array.isArray(merged.academicSections)
          ? merged.academicSections.map((s) => ({ ...s }))
          : DEFAULT_SCHOOL_CONFIG.academicSections,

        // 2. Vision & Mission
        vision: merged.vision,
        mission: merged.mission,

        // 3. Principal Message
        principalName: merged.principalName,
        principalDesignation: merged.principalDesignation,
        principalMessageImage: merged.principalMessageImage,
        principalMessageTitle: merged.principalMessageTitle,
        principalMessage: merged.principalMessage,

        // 4. History & Present
        historyIntro: merged.historyIntro,
        historyBeginningDate: merged.historyBeginningDate,
        historyBeginningText: merged.historyBeginningText,
        firstPrincipalName: merged.firstPrincipalName,
        firstPrincipalTitle: merged.firstPrincipalTitle,
        firstPrincipalTenure: merged.firstPrincipalTenure,
        firstPrincipalImage: merged.firstPrincipalImage,
        firstPrincipalImageCaption: merged.firstPrincipalImageCaption,
        startingStaff: merged.startingStaff,
        startingStudents: merged.startingStudents,
        historyTodayText: merged.historyTodayText,
        historyAcademicText: merged.historyAcademicText,
        historyBeyondText: merged.historyBeyondText,
        historyAchievementTitle: merged.historyAchievementTitle,
        historyAchievementText: merged.historyAchievementText,
        historyEnvironmentText: merged.historyEnvironmentText,
        historyFounders: merged.historyFounders,
        historyInitialStudents: merged.historyInitialStudents,
        historyOverview: merged.historyOverview,
        historyImage: merged.historyImage,
        historyImageCaption: merged.historyImageCaption,
        pastPrincipals: Array.isArray(merged.pastPrincipals) && merged.pastPrincipals.length > 0
          ? merged.pastPrincipals.map((p) => ({ ...p }))
          : Array.isArray(merged.principals) && merged.principals.length > 0
          ? merged.principals.map((p) => ({ ...p }))
          : DEFAULT_SCHOOL_CONFIG.pastPrincipals || [],

        // 5. School Identity
        schoolLogo: merged.schoolLogo,
        emblemMeaningTitle: merged.emblemMeaningTitle,
        emblemMeaning: merged.emblemMeaning,
        motto: merged.motto,
        mottoMeaning: merged.mottoMeaning,
        flagImage: merged.flagImage,
        flagTitle: merged.flagTitle,
        flagCaption: merged.flagCaption,
        flagColorsTitle: merged.flagColorsTitle,
        flagColorsMeaning: merged.flagColorsMeaning,
        anthemTitle: merged.anthemTitle,
        anthemLyrics: merged.anthemLyrics,

        // 6. Achievements & Houses
        achievementsImage: merged.achievementsImage,
        achievementsImageCaption: merged.achievementsImageCaption,
        olHighlightStat: merged.olHighlightStat,
        olHighlightTitle: merged.olHighlightTitle,
        olDescription: merged.olDescription,
        alHighlightStat: merged.alHighlightStat,
        alHighlightTitle: merged.alHighlightTitle,
        alDescription: merged.alDescription,
        sportsHighlightStat: merged.sportsHighlightStat,
        sportsHighlightTitle: merged.sportsHighlightTitle,
        sportsDescription: merged.sportsDescription,
        notableAccomplishments: Array.isArray(merged.notableAccomplishments)
          ? merged.notableAccomplishments.map((a) => ({ ...a }))
          : DEFAULT_SCHOOL_CONFIG.notableAccomplishments,
        houses: Array.isArray(merged.houses)
          ? merged.houses.map((h) => ({ ...h }))
          : DEFAULT_SCHOOL_CONFIG.houses
      });
    }
    prevOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && initialSection) {
      setActiveTab(initialSection);
    }
  }, [initialSection]);

  if (!isOpen) return null;

  const updateField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const updateArrayItem = (arrayKey, index, field, value) => {
    setFormData((prev) => {
      const copy = [...(prev[arrayKey] || [])];
      copy[index] = { ...copy[index], [field]: value };
      return { ...prev, [arrayKey]: copy };
    });
  };

  const addArrayItem = (arrayKey, template) => {
    setFormData((prev) => ({
      ...prev,
      [arrayKey]: [...(prev[arrayKey] || []), template]
    }));
  };

  const removeArrayItem = (arrayKey, index) => {
    setFormData((prev) => ({
      ...prev,
      [arrayKey]: (prev[arrayKey] || []).filter((_, idx) => idx !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSaveSettings(formData);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="fb-create-modal about-edit-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="fb-modal-header">
          <div className="modal-title-with-icon">
            <Sparkles size={20} className="sparkle-gold" />
            <h3>Edit About Page Content & Images</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="modal-close-btn"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* 6 Section Tabs */}
        <div className="about-editor-tabs-bar">
          {SECTION_TABS.map((tab) => {
            const IconComp = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                className={`about-editor-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <IconComp size={14} />
                <span>
                  {tab.num}. {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="fb-modal-form about-editor-form">
          {/* TAB 1: INTRODUCTION */}
          {activeTab === 'intro' && (
            <div className="about-editor-panel">
              <div className="settings-section-card">
                <h4>
                  <Info size={16} /> 1. School Introduction & Location
                </h4>
                <div className="fb-meta-grid">
                  <div className="meta-field">
                    <label>Year Founded</label>
                    <input
                      type="text"
                      value={formData.foundedYear || ''}
                      onChange={(e) => updateField('foundedYear', e.target.value)}
                      placeholder="1938"
                    />
                  </div>
                  <div className="meta-field">
                    <label>Location / Address</label>
                    <input
                      type="text"
                      value={formData.locationDetails || ''}
                      onChange={(e) => updateField('locationDetails', e.target.value)}
                      placeholder="Sribhodi Road, Gampaha, Western Province"
                    />
                  </div>
                </div>

                {/* Official School Specifications & Administrative Divisions */}
                <div style={{ marginTop: '14px', padding: '12px', background: 'var(--slate-50, #f8fafc)', borderRadius: '10px', border: '1px solid var(--slate-200, #e2e8f0)' }}>
                  <h5 style={{ margin: '0 0 10px 0', fontSize: '0.86rem', color: 'var(--maroon-900, #7f1d1d)', fontWeight: 700 }}>
                    Official School Details & Administrative Boundaries
                  </h5>
                  <div className="fb-meta-grid">
                    <div className="meta-field">
                      <label>Type of School</label>
                      <input
                        type="text"
                        value={formData.schoolType || ''}
                        onChange={(e) => updateField('schoolType', e.target.value)}
                        placeholder="1AB"
                      />
                    </div>
                    <div className="meta-field">
                      <label>School Development Account Number</label>
                      <input
                        type="text"
                        value={formData.schoolDevelopmentAccount || ''}
                        onChange={(e) => updateField('schoolDevelopmentAccount', e.target.value)}
                        placeholder="026100150031366"
                      />
                    </div>
                  </div>

                  <div className="fb-meta-grid" style={{ marginTop: '8px' }}>
                    <div className="meta-field">
                      <label>Land Area</label>
                      <input
                        type="text"
                        value={formData.landArea || ''}
                        onChange={(e) => updateField('landArea', e.target.value)}
                        placeholder="1 acre, 26.65 perches"
                      />
                    </div>
                    <div className="meta-field">
                      <label>Divisional Secretariat Office</label>
                      <input
                        type="text"
                        value={formData.divisionalSecretariat || ''}
                        onChange={(e) => updateField('divisionalSecretariat', e.target.value)}
                        placeholder="Gampaha"
                      />
                    </div>
                  </div>

                  <div className="fb-meta-grid" style={{ marginTop: '8px' }}>
                    <div className="meta-field">
                      <label>Grama Niladhari Division</label>
                      <input
                        type="text"
                        value={formData.gramaNiladhariDivision || ''}
                        onChange={(e) => updateField('gramaNiladhariDivision', e.target.value)}
                        placeholder="Bandiyamulla"
                      />
                    </div>
                    <div className="meta-field">
                      <label>Education Division</label>
                      <input
                        type="text"
                        value={formData.educationDivision || ''}
                        onChange={(e) => updateField('educationDivision', e.target.value)}
                        placeholder="Gampaha"
                      />
                    </div>
                  </div>

                  <div className="meta-field" style={{ marginTop: '8px' }}>
                    <label>Education Zone</label>
                    <input
                      type="text"
                      value={formData.educationZone || ''}
                      onChange={(e) => updateField('educationZone', e.target.value)}
                      placeholder="Gampaha"
                    />
                  </div>
                </div>
                <div className="meta-field" style={{ marginTop: '10px' }}>
                  <label>Introduction Headline</label>
                  <input
                    type="text"
                    value={formData.introTitle || ''}
                    onChange={(e) => updateField('introTitle', e.target.value)}
                  />
                </div>
                <div className="meta-field" style={{ marginTop: '10px' }}>
                  <label>Lead Highlight Statement</label>
                  <textarea
                    rows={2}
                    value={formData.introLead || ''}
                    onChange={(e) => updateField('introLead', e.target.value)}
                  />
                </div>
                <div className="meta-field" style={{ marginTop: '10px' }}>
                  <label>Overview Description</label>
                  <textarea
                    rows={3}
                    value={formData.introBody || ''}
                    onChange={(e) => updateField('introBody', e.target.value)}
                  />
                </div>
                <div style={{ marginTop: '12px' }}>
                  <ImageFieldControl
                    label="Introduction Campus Photo"
                    value={formData.aboutIntroImage}
                    onChange={(val) => updateField('aboutIntroImage', val)}
                    presets={[
                      { label: 'Front Entrance', path: '/Pictures/Front of School.jpeg' },
                      { label: 'School Flag', path: '/Pictures/School Flag.jpeg' }
                    ]}
                  />
                </div>
                <div className="meta-field" style={{ marginTop: '8px' }}>
                  <label>Photo Caption</label>
                  <input
                    type="text"
                    value={formData.aboutIntroImageCaption || ''}
                    onChange={(e) => updateField('aboutIntroImageCaption', e.target.value)}
                  />
                </div>
              </div>

              {/* Academic Sections */}
              <div className="settings-section-card">
                <div className="card-header-with-add">
                  <h4>
                    <BookOpen size={16} /> Academic Sections & Faculties
                  </h4>
                  <button
                    type="button"
                    className="btn-inline-add"
                    onClick={() =>
                      addArrayItem('academicSections', {
                        title: 'New Academic Section',
                        desc: 'Section curriculum description...'
                      })
                    }
                  >
                    <Plus size={14} /> Add Section
                  </button>
                </div>
                {(formData.academicSections || []).map((sec, idx) => (
                  <div key={idx} className="repeater-row-card">
                    <div className="repeater-row-head">
                      <strong>Section #{idx + 1}</strong>
                      <button
                        type="button"
                        className="btn-inline-del"
                        onClick={() => removeArrayItem('academicSections', idx)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={sec.title}
                      onChange={(e) =>
                        updateArrayItem('academicSections', idx, 'title', e.target.value)
                      }
                      placeholder="Section Title"
                    />
                    <textarea
                      rows={2}
                      value={sec.desc}
                      onChange={(e) =>
                        updateArrayItem('academicSections', idx, 'desc', e.target.value)
                      }
                      placeholder="Description"
                      style={{ marginTop: '6px' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: VISION & MISSION */}
          {activeTab === 'vision' && (
            <div className="about-editor-panel">
              <div className="settings-section-card">
                <h4>
                  <Target size={16} /> 2. School Vision & Mission
                </h4>
                <div className="meta-field">
                  <label>Our Vision (Future Goal)</label>
                  <textarea
                    rows={4}
                    value={formData.vision || ''}
                    onChange={(e) => updateField('vision', e.target.value)}
                  />
                </div>
                <div className="meta-field" style={{ marginTop: '12px' }}>
                  <label>Our Mission (Approach to Achieve It)</label>
                  <textarea
                    rows={5}
                    value={formData.mission || ''}
                    onChange={(e) => updateField('mission', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRINCIPAL'S MESSAGE */}
          {activeTab === 'principal' && (
            <div className="about-editor-panel">
              <div className="settings-section-card">
                <h4>
                  <UserCheck size={16} /> 3. Principal's Message & Photograph
                </h4>
                <div className="fb-meta-grid">
                  <div className="meta-field">
                    <label>Principal Full Name</label>
                    <input
                      type="text"
                      value={formData.principalName || ''}
                      onChange={(e) => updateField('principalName', e.target.value)}
                    />
                  </div>
                  <div className="meta-field">
                    <label>Official Title / Designation</label>
                    <input
                      type="text"
                      value={formData.principalDesignation || ''}
                      onChange={(e) => updateField('principalDesignation', e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '12px' }}>
                  <ImageFieldControl
                    label="Principal Portrait Photograph"
                    value={formData.principalMessageImage}
                    onChange={(val) => updateField('principalMessageImage', val)}
                    presets={[
                      { label: 'Modern Office', path: '/Pictures/principal-office-1.jpg' },
                      { label: 'Classic Office', path: '/Pictures/principal-office-vintage.jpg' }
                    ]}
                  />
                </div>

                <div className="meta-field" style={{ marginTop: '10px' }}>
                  <label>Welcome Heading</label>
                  <input
                    type="text"
                    value={formData.principalMessageTitle || ''}
                    onChange={(e) => updateField('principalMessageTitle', e.target.value)}
                  />
                </div>

                <div className="meta-field" style={{ marginTop: '10px' }}>
                  <label>Principal's Welcome Message (Separate paragraphs with blank lines. Indents like 6 spaces are preserved and text is fully justified)</label>
                  <textarea
                    rows={9}
                    value={formData.principalMessage || ''}
                    onChange={(e) => updateField('principalMessage', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: HISTORY & PRESENT */}
          {activeTab === 'history' && (
            <div className="about-editor-panel">
              {/* Founding Principal Photo & Profile */}
              <div className="settings-section-card">
                <h4>
                  <Award size={16} /> Founding Principal Photograph &amp; Profile (Mrs. Yapa Dissanayake)
                </h4>
                <div>
                  <ImageFieldControl
                    label="Founding Principal Photo (Mrs. Yapa Dissanayake)"
                    value={formData.firstPrincipalImage}
                    onChange={(val) => updateField('firstPrincipalImage', val)}
                    presets={[
                      { label: 'Vintage Heritage Office', path: '/Pictures/principal-office-vintage.jpg' },
                      { label: 'Classic Office', path: '/Pictures/principal-office-1.jpg' }
                    ]}
                  />
                </div>
                <div className="meta-field-grid" style={{ marginTop: '10px' }}>
                  <div className="meta-field">
                    <label>Founding Principal Name</label>
                    <input
                      type="text"
                      value={formData.firstPrincipalName || ''}
                      onChange={(e) => updateField('firstPrincipalName', e.target.value)}
                      placeholder="Mrs. Yapa Dissanayake"
                    />
                  </div>
                  <div className="meta-field">
                    <label>Title / Designation</label>
                    <input
                      type="text"
                      value={formData.firstPrincipalTitle || ''}
                      onChange={(e) => updateField('firstPrincipalTitle', e.target.value)}
                      placeholder="Founding Principal (1992 – 2002)"
                    />
                  </div>
                </div>
                <div className="meta-field" style={{ marginTop: '8px' }}>
                  <label>Tenure Period</label>
                  <input
                    type="text"
                    value={formData.firstPrincipalTenure || ''}
                    onChange={(e) => updateField('firstPrincipalTenure', e.target.value)}
                    placeholder="1992.06.15 – 2002.03.14"
                  />
                </div>
              </div>

              {/* History & Present Narrative */}
              <div className="settings-section-card" style={{ marginTop: '16px' }}>
                <h4>
                  <History size={16} /> History &amp; Present Narratives
                </h4>
                <div className="meta-field">
                  <label>Section Overview (Our History and Present)</label>
                  <textarea
                    rows={2}
                    value={formData.historyIntro || ''}
                    onChange={(e) => updateField('historyIntro', e.target.value)}
                  />
                </div>
                <div className="meta-field" style={{ marginTop: '10px' }}>
                  <label>Our Beginning (Inauguration Details)</label>
                  <textarea
                    rows={3}
                    value={formData.historyBeginningText || ''}
                    onChange={(e) => updateField('historyBeginningText', e.target.value)}
                  />
                </div>
                <div className="meta-field-grid" style={{ marginTop: '10px' }}>
                  <div className="meta-field">
                    <label>Starting Staff</label>
                    <input
                      type="text"
                      value={formData.startingStaff || ''}
                      onChange={(e) => updateField('startingStaff', e.target.value)}
                      placeholder="6 Teachers"
                    />
                  </div>
                  <div className="meta-field">
                    <label>Starting Students</label>
                    <input
                      type="text"
                      value={formData.startingStudents || ''}
                      onChange={(e) => updateField('startingStudents', e.target.value)}
                      placeholder="Nearly 60 students in three Grade 6 classes"
                    />
                  </div>
                </div>
                <div className="meta-field" style={{ marginTop: '10px' }}>
                  <label>Thakshila Today</label>
                  <textarea
                    rows={4}
                    value={formData.historyTodayText || ''}
                    onChange={(e) => updateField('historyTodayText', e.target.value)}
                  />
                </div>
                <div className="meta-field" style={{ marginTop: '10px' }}>
                  <label>Academic Excellence</label>
                  <textarea
                    rows={3}
                    value={formData.historyAcademicText || ''}
                    onChange={(e) => updateField('historyAcademicText', e.target.value)}
                  />
                </div>
                <div className="meta-field" style={{ marginTop: '10px' }}>
                  <label>Beyond the Classroom (Co-curricular &amp; Extracurricular)</label>
                  <textarea
                    rows={4}
                    value={formData.historyBeyondText || ''}
                    onChange={(e) => updateField('historyBeyondText', e.target.value)}
                  />
                </div>
                <div className="meta-field" style={{ marginTop: '10px' }}>
                  <label>A Proud Achievement (National Productivity Awards)</label>
                  <textarea
                    rows={3}
                    value={formData.historyAchievementText || ''}
                    onChange={(e) => updateField('historyAchievementText', e.target.value)}
                  />
                </div>
                <div className="meta-field" style={{ marginTop: '10px' }}>
                  <label>Our School Environment &amp; Facilities</label>
                  <textarea
                    rows={4}
                    value={formData.historyEnvironmentText || ''}
                    onChange={(e) => updateField('historyEnvironmentText', e.target.value)}
                  />
                </div>
              </div>

              {/* Roll of Past Principals */}
              <div className="settings-section-card">
                <div className="card-header-with-add">
                  <h4>Roll of Past Principals (විදුහල්පති නාමාවලිය)</h4>
                  <button
                    type="button"
                    className="btn-inline-add"
                    onClick={() =>
                      addArrayItem('pastPrincipals', {
                        id: `p_${Date.now()}`,
                        order: (formData.pastPrincipals?.length || 0) + 1,
                        name: '',
                        tenure: '',
                        period: '',
                        duration: '',
                        designation: 'Principal'
                      })
                    }
                  >
                    <Plus size={14} /> Add Principal
                  </button>
                </div>
                {(formData.pastPrincipals || []).map((p, idx) => (
                  <div key={p.id || idx} className="repeater-row-card">
                    <div className="repeater-row-head">
                      <strong>Principal #{p.order || idx + 1}: {p.name || 'Unnamed'}</strong>
                      <button
                        type="button"
                        className="btn-inline-del"
                        onClick={() => removeArrayItem('pastPrincipals', idx)}
                        title="Delete principal entry"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <div className="fb-meta-grid">
                      <div className="form-group-custom">
                        <label>Order (#)</label>
                        <input
                          type="number"
                          value={p.order ?? idx + 1}
                          onChange={(e) =>
                            updateArrayItem('pastPrincipals', idx, 'order', parseInt(e.target.value, 10) || idx + 1)
                          }
                          placeholder="Order #"
                        />
                      </div>
                      <div className="form-group-custom">
                        <label>Principal Full Name</label>
                        <input
                          type="text"
                          value={p.name || ''}
                          onChange={(e) =>
                            updateArrayItem('pastPrincipals', idx, 'name', e.target.value)
                          }
                          placeholder="e.g. Mrs. Y. A. D. S. Dissanayake"
                        />
                      </div>
                    </div>
                    <div className="fb-meta-grid" style={{ marginTop: '8px' }}>
                      <div className="form-group-custom">
                        <label>Exact Service Dates (Tenure)</label>
                        <input
                          type="text"
                          value={p.tenure || ''}
                          onChange={(e) =>
                            updateArrayItem('pastPrincipals', idx, 'tenure', e.target.value)
                          }
                          placeholder="e.g. 1992.06.15 – 2002.03.14"
                        />
                      </div>
                      <div className="form-group-custom">
                        <label>Period (Years)</label>
                        <input
                          type="text"
                          value={p.period || ''}
                          onChange={(e) =>
                            updateArrayItem('pastPrincipals', idx, 'period', e.target.value)
                          }
                          placeholder="e.g. 1992 – 2002"
                        />
                      </div>
                    </div>
                    <div className="fb-meta-grid" style={{ marginTop: '8px' }}>
                      <div className="form-group-custom">
                        <label>Duration</label>
                        <input
                          type="text"
                          value={p.duration || ''}
                          onChange={(e) =>
                            updateArrayItem('pastPrincipals', idx, 'duration', e.target.value)
                          }
                          placeholder="e.g. 9 Years, 9 Months"
                        />
                      </div>
                      <div className="form-group-custom">
                        <label>Designation</label>
                        <input
                          type="text"
                          value={p.designation || ''}
                          onChange={(e) =>
                            updateArrayItem('pastPrincipals', idx, 'designation', e.target.value)
                          }
                          placeholder="e.g. Principal"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: SCHOOL IDENTITY */}
          {activeTab === 'identity' && (
            <div className="about-editor-panel">
              {/* Emblem & Motto */}
              <div className="settings-section-card">
                <h4>
                  <Shield size={16} /> 5. School Emblem & Motto
                </h4>
                <ImageFieldControl
                  label="School Emblem / Crest Image"
                  value={formData.schoolLogo}
                  onChange={(val) => updateField('schoolLogo', val)}
                  presets={[
                    { label: 'Official Crest (High-Res)', path: '/Pictures/School Logo.png' },
                    { label: 'Master Crest (8K Transparent)', path: '/Pictures/Thakshila Logo Transparent BG.png' },
                    { label: 'Master Crest (8K Solid)', path: '/Pictures/Thakshila Logo.png' }
                  ]}
                />
                <div className="meta-field" style={{ marginTop: '10px' }}>
                  <label>Emblem Heading</label>
                  <input
                    type="text"
                    value={formData.emblemMeaningTitle || ''}
                    onChange={(e) => updateField('emblemMeaningTitle', e.target.value)}
                  />
                </div>
                <div className="meta-field" style={{ marginTop: '8px' }}>
                  <label>Meaning of the School Emblem</label>
                  <textarea
                    rows={3}
                    value={formData.emblemMeaning || ''}
                    onChange={(e) => updateField('emblemMeaning', e.target.value)}
                  />
                </div>
                <div className="meta-field" style={{ marginTop: '10px' }}>
                  <label>School Motto</label>
                  <input
                    type="text"
                    value={formData.motto || ''}
                    onChange={(e) => updateField('motto', e.target.value)}
                  />
                </div>
                <div className="meta-field" style={{ marginTop: '8px' }}>
                  <label>Significance of the Motto</label>
                  <textarea
                    rows={2}
                    value={formData.mottoMeaning || ''}
                    onChange={(e) => updateField('mottoMeaning', e.target.value)}
                  />
                </div>
              </div>

              {/* School Flag & Colors */}
              <div className="settings-section-card">
                <h4>
                  <Flag size={16} /> College Flag & Flag Colors
                </h4>
                <ImageFieldControl
                  label="College Flag Image"
                  value={formData.flagImage}
                  onChange={(val) => updateField('flagImage', val)}
                  presets={[
                    { label: 'Default Flag', path: '/Pictures/School Flag.jpeg' }
                  ]}
                />
                <div className="meta-field" style={{ marginTop: '10px' }}>
                  <label>Flag Spotlight Title</label>
                  <input
                    type="text"
                    value={formData.flagTitle || ''}
                    onChange={(e) => updateField('flagTitle', e.target.value)}
                  />
                </div>
                <div className="meta-field" style={{ marginTop: '8px' }}>
                  <label>Flag Description</label>
                  <textarea
                    rows={3}
                    value={formData.flagCaption || ''}
                    onChange={(e) => updateField('flagCaption', e.target.value)}
                  />
                </div>
                <div className="meta-field" style={{ marginTop: '8px' }}>
                  <label>Flag Colors Heading</label>
                  <input
                    type="text"
                    value={formData.flagColorsTitle || ''}
                    onChange={(e) => updateField('flagColorsTitle', e.target.value)}
                  />
                </div>
                <div className="meta-field" style={{ marginTop: '8px' }}>
                  <label>Meaning of Flag Colors (Maroon & Gold)</label>
                  <textarea
                    rows={2}
                    value={formData.flagColorsMeaning || ''}
                    onChange={(e) => updateField('flagColorsMeaning', e.target.value)}
                  />
                </div>
              </div>

              {/* School Anthem */}
              <div className="settings-section-card">
                <h4>
                  <Music size={16} /> School Anthem
                </h4>
                <div className="meta-field">
                  <label>Anthem Title</label>
                  <input
                    type="text"
                    value={formData.anthemTitle || ''}
                    onChange={(e) => updateField('anthemTitle', e.target.value)}
                  />
                </div>
                <div className="meta-field" style={{ marginTop: '8px' }}>
                  <label>School Anthem Lyrics</label>
                  <textarea
                    rows={6}
                    value={formData.anthemLyrics || ''}
                    onChange={(e) => updateField('anthemLyrics', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: ACHIEVEMENTS */}
          {activeTab === 'achievements' && (
            <div className="about-editor-panel">
              <div className="settings-section-card">
                <h4>
                  <Trophy size={16} /> 6. G.C.E. O/L, A/L & All-Island Sports
                </h4>
                <ImageFieldControl
                  label="Achievements / Award Emblem or Photo"
                  value={formData.achievementsImage}
                  onChange={(val) => updateField('achievementsImage', val)}
                  presets={[
                    { label: 'Beyond The Best (High-Res)', path: '/Pictures/Productivity Logo.png' },
                    { label: 'Beyond The Best (Master)', path: '/Pictures/beyond the best transparent background.png' },
                    { label: 'School Campus', path: '/Pictures/Front of School.jpeg' }
                  ]}
                />
                <div className="meta-field" style={{ marginTop: '8px' }}>
                  <label>Achievements Photo Caption</label>
                  <input
                    type="text"
                    value={formData.achievementsImageCaption || ''}
                    onChange={(e) => updateField('achievementsImageCaption', e.target.value)}
                  />
                </div>
              </div>

              {/* Notable Accomplishments */}
              <div className="settings-section-card">
                <div className="card-header-with-add">
                  <h4>Notable Institutional Accomplishments</h4>
                  <button
                    type="button"
                    className="btn-inline-add"
                    onClick={() =>
                      addArrayItem('notableAccomplishments', {
                        badge: 'All-Island',
                        title: 'New Accomplishment',
                        desc: 'Achievement details...'
                      })
                    }
                  >
                    <Plus size={14} /> Add Accomplishment
                  </button>
                </div>
                {(formData.notableAccomplishments || []).map((item, idx) => (
                  <div key={idx} className="repeater-row-card">
                    <div className="repeater-row-head">
                      <strong>Accomplishment #{idx + 1}</strong>
                      <button
                        type="button"
                        className="btn-inline-del"
                        onClick={() => removeArrayItem('notableAccomplishments', idx)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <div className="fb-meta-grid">
                      <input
                        type="text"
                        value={item.badge}
                        onChange={(e) =>
                          updateArrayItem('notableAccomplishments', idx, 'badge', e.target.value)
                        }
                        placeholder="Category Badge"
                      />
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) =>
                          updateArrayItem('notableAccomplishments', idx, 'title', e.target.value)
                        }
                        placeholder="Accomplishment Title"
                      />
                    </div>
                    <textarea
                      rows={2}
                      value={item.desc}
                      onChange={(e) =>
                        updateArrayItem('notableAccomplishments', idx, 'desc', e.target.value)
                      }
                      placeholder="Description"
                      style={{ marginTop: '6px' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Save Button Footer */}
          <div className="fb-modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn-modal-cancel"
              disabled={saving}
            >
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-fb-publish">
              <Save size={18} />
              <span>{saving ? 'Saving About Page...' : 'Save All About Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
