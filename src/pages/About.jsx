import React, { useState } from 'react';
import {
  Target,
  Compass,
  BookOpen,
  Users,
  Shield,
  MapPin,
  Phone,
  Mail,
  Edit,
  Sparkles,
  Calendar,
  Flag,
  Music,
  Trophy,
  Quote,
  History,
  GraduationCap,
  CheckCircle2,
  UserCheck,
  Award,
  Clock,
  ChevronRight,
  Landmark,
  CreditCard,
  Building2,
  Maximize2,
  Leaf,
  Microscope,
  Cpu,
  Globe,
  Circle
} from 'lucide-react';
import SchoolCrest from '../components/SchoolCrest';
import EditAboutModal from '../components/EditAboutModal';
import { DEFAULT_SCHOOL_CONFIG } from '../config';

export default function About({
  settings,
  principals,
  isAdmin,
  isEditMode,
  onOpenEditSettingsModal,
  onSaveSettings
}) {
  // Merge live settings with defaults so all 6 sections always have rich values
  const s = { ...DEFAULT_SCHOOL_CONFIG, ...(settings || {}) };

  const academicSections =
    Array.isArray(s.academicSections) && s.academicSections.length > 0
      ? s.academicSections
      : DEFAULT_SCHOOL_CONFIG.academicSections;

  const pastPrincipals =
    Array.isArray(s.pastPrincipals) && s.pastPrincipals.length > 0
      ? s.pastPrincipals
      : Array.isArray(principals) && principals.length > 0
      ? principals
      : Array.isArray(s.principals) && s.principals.length > 0
      ? s.principals
      : DEFAULT_SCHOOL_CONFIG.pastPrincipals || [];

  const notableAccomplishments =
    Array.isArray(s.notableAccomplishments) && s.notableAccomplishments.length > 0
      ? s.notableAccomplishments
      : DEFAULT_SCHOOL_CONFIG.notableAccomplishments;

  // Modals State
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [aboutModalInitialTab, setAboutModalInitialTab] = useState('intro');

  // Past Principals sorted chronologically (1992 – 2024)
  const sortedPrincipals = [...pastPrincipals].sort((a, b) => (a.order || 0) - (b.order || 0));

  const openSectionEditor = (tabId) => {
    setAboutModalInitialTab(tabId);
    setIsAboutModalOpen(true);
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const renderEditSectionBtn = (tabId, label = 'Edit Section') => {
    if (!isAdmin || !isEditMode) return null;
    return (
      <button
        type="button"
        className="btn-section-admin-edit"
        onClick={() => openSectionEditor(tabId)}
      >
        <Edit size={14} />
        <span>{label}</span>
      </button>
    );
  };

  const renderPrincipalMessage = (rawText) => {
    if (!rawText) return null;
    const paragraphs = String(rawText)
      .split(/\r?\n\s*\r?\n/)
      .map((p) => p.replace(/\r/g, ''))
      .filter((p) => p.trim().length > 0);

    return paragraphs.map((para, idx) => {
      const lines = para.split('\n');
      return (
        <p key={idx} className="principal-msg-paragraph">
          {lines.map((line, lIdx) => {
            const leadingMatch = line.match(/^[ \t]+/);
            let formattedLine = line;

            if (leadingMatch) {
              const spaceCount = leadingMatch[0].length;
              formattedLine = '\u00A0'.repeat(spaceCount) + line.slice(spaceCount);
            } else if (lIdx === 0) {
              // Ensure 6-space paragraph indentation
              formattedLine = '\u00A0'.repeat(6) + line;
            }

            return (
              <React.Fragment key={lIdx}>
                {lIdx > 0 && <br />}
                {formattedLine}
              </React.Fragment>
            );
          })}
        </p>
      );
    });
  };

  return (
    <div className="page-about">
      {/* Page Banner with Logo before title */}
      <section className="subpage-banner about-banner">
        <div className="container subpage-banner-inner">
          <div className="subpage-title-with-logo">
            <SchoolCrest size={76} src={s.schoolLogo || '/Pictures/School Logo.png'} />
            <div>
              <span className="subpage-eyebrow">EST. {s.foundedYear || '1938'} • OUR HERITAGE & IDENTITY</span>
              <h1>About {s.schoolName || 'Thakshila College - Gampaha'}</h1>
              <p className="subpage-si-title">
                {s.motto || 'Knowledge Gives Discipline'} • {s.locationDetails || s.address}
              </p>
            </div>
          </div>

          {isAdmin && isEditMode && (
            <div className="subpage-admin-btn-box">
              <button
                type="button"
                onClick={() => openSectionEditor('intro')}
                className="btn-banner-post"
              >
                <Edit size={16} />
                <span>Edit About Page Content</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Quick Section Navigation Strip */}
      <nav className="about-quick-nav-bar" aria-label="About Page Sections">
        <div className="container about-quick-nav-inner">
          <button type="button" onClick={() => scrollToSection('sec-intro')}>
            1. Introduction
          </button>
          <button type="button" onClick={() => scrollToSection('sec-vision')}>
            2. Vision & Mission
          </button>
          <button type="button" onClick={() => scrollToSection('sec-principal')}>
            3. Principal's Message
          </button>
          <button type="button" onClick={() => scrollToSection('sec-history')}>
            4. History &amp; Present
          </button>
          <button type="button" onClick={() => scrollToSection('sec-identity')}>
            5. School Identity
          </button>
          <button type="button" onClick={() => scrollToSection('sec-achievements')}>
            6. Achievements
          </button>
        </div>
      </nav>

      <div className="container about-content-wrapper">
        {/* ============================================================
            1. INTRODUCTION
           ============================================================ */}
        <section id="sec-intro" className="about-structured-section">
          <div className="about-section-top-bar">
            <div className="section-title-cluster">
              <span className="section-number-pill">01</span>
              <div>
                <span className="section-eyebrow">COLLEGE OVERVIEW</span>
                <h2>Introduction</h2>
              </div>
            </div>
            {renderEditSectionBtn('intro', 'Edit Introduction')}
          </div>

          <div className="about-overview-card">
            <div className="about-overview-text">
              <div className="intro-fact-chips">
                <span className="intro-fact-chip">
                  <Calendar size={14} /> Founded: <strong>{s.foundedYear || '1938'}</strong>
                </span>
                <span className="intro-fact-chip">
                  <GraduationCap size={14} /> School Type: <strong>{s.schoolType || '1AB'}</strong>
                </span>
                <span className="intro-fact-chip">
                  <Maximize2 size={14} /> Land: <strong>{s.landArea || '1 acre, 26.65 perches'}</strong>
                </span>
                <span className="intro-fact-chip">
                  <MapPin size={14} /> {s.locationDetails || s.address || 'Gampaha, Sri Lanka'}
                </span>
                <span className="intro-fact-chip">
                  <Users size={14} /> {s.stat1Number || '2,000+'} Students
                </span>
              </div>

              <h3>{s.introTitle}</h3>
              <p className="lead-quote-box">{s.introLead}</p>
              <p className="intro-body-para">{s.introBody}</p>
            </div>

            <div className="about-overview-image">
              <img
                src={s.aboutIntroImage || '/Pictures/Front of School.jpeg'}
                alt={s.aboutIntroImageCaption || 'Thakshila College Gampaha'}
              />
              <span className="overview-img-caption">
                {s.aboutIntroImageCaption || 'Thakshila College Gampaha Main Entrance'}
              </span>
            </div>
          </div>

          {/* Academic Sections & Faculties integrated into Overview */}
          <div className="about-subsection-box">
            <h3 className="subsection-heading">
              <BookOpen size={18} /> Academic Sections & Study Streams
            </h3>
            <div className="academic-grid">
              {academicSections.map((sec, i) => (
                <div key={i} className="academic-card">
                  <GraduationCap size={22} className="academic-card-icon" />
                  <h4>{sec.title}</h4>
                  <p>{sec.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Institutional Specifications & Administrative Profile */}
          <div className="about-subsection-box institutional-specs-box">
            <div className="institutional-specs-header">
              <div className="specs-header-icon">
                <Landmark size={22} />
              </div>
              <div>
                <span className="subsection-eyebrow">OFFICIAL INSTITUTIONAL &amp; ADMINISTRATIVE PROFILE</span>
                <h3 className="subsection-heading">School Details &amp; Governance Boundaries</h3>
                <p className="subsection-subtext">
                  Official Ministry of Education classification, administrative boundaries, land records, and development accounts.
                </p>
              </div>
            </div>

            <div className="institutional-specs-grid">
              <div className="spec-card">
                <div className="spec-icon-box type">
                  <GraduationCap size={20} />
                </div>
                <div className="spec-content">
                  <span className="spec-label">Type of School</span>
                  <strong className="spec-value">{s.schoolType || '1AB'}</strong>
                  <span className="spec-note">Senior Secondary Collegiate School</span>
                </div>
              </div>

              <div className="spec-card account-spec-card">
                <div className="spec-icon-box account">
                  <CreditCard size={20} />
                </div>
                <div className="spec-content">
                  <span className="spec-label">School Development Account Number</span>
                  <strong className="spec-value account-number">{s.schoolDevelopmentAccount || '026100150031366'}</strong>
                  <span className="spec-note">Official School Development Committee (SDC) Account</span>
                </div>
              </div>

              <div className="spec-card">
                <div className="spec-icon-box land">
                  <Maximize2 size={20} />
                </div>
                <div className="spec-content">
                  <span className="spec-label">Land Area</span>
                  <strong className="spec-value">{s.landArea || '1 acre, 26.65 perches'}</strong>
                  <span className="spec-note">Official Campus &amp; Grounds</span>
                </div>
              </div>

              <div className="spec-card">
                <div className="spec-icon-box zone">
                  <Compass size={20} />
                </div>
                <div className="spec-content">
                  <span className="spec-label">Education Zone</span>
                  <strong className="spec-value">{s.educationZone || 'Gampaha'}</strong>
                  <span className="spec-note">Western Provincial Department of Education</span>
                </div>
              </div>

              <div className="spec-card">
                <div className="spec-icon-box division">
                  <BookOpen size={20} />
                </div>
                <div className="spec-content">
                  <span className="spec-label">Education Division</span>
                  <strong className="spec-value">{s.educationDivision || 'Gampaha'}</strong>
                  <span className="spec-note">Zonal Education Office</span>
                </div>
              </div>

              <div className="spec-card">
                <div className="spec-icon-box secretariat">
                  <Building2 size={20} />
                </div>
                <div className="spec-content">
                  <span className="spec-label">Divisional Secretariat Office</span>
                  <strong className="spec-value">{s.divisionalSecretariat || 'Gampaha'}</strong>
                  <span className="spec-note">Public Administration &amp; Divisional Secretariat</span>
                </div>
              </div>

              <div className="spec-card">
                <div className="spec-icon-box gn">
                  <MapPin size={20} />
                </div>
                <div className="spec-content">
                  <span className="spec-label">Grama Niladhari Division</span>
                  <strong className="spec-value">{s.gramaNiladhariDivision || 'Bandiyamulla'}</strong>
                  <span className="spec-note">Local Grama Niladhari Administrative Area</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            2. VISION & MISSION
           ============================================================ */}
        <section id="sec-vision" className="about-structured-section">
          <div className="about-section-top-bar">
            <div className="section-title-cluster">
              <span className="section-number-pill">02</span>
              <div>
                <span className="section-eyebrow">GUIDING PURPOSE & DIRECTION</span>
                <h2>Vision & Mission</h2>
              </div>
            </div>
            {renderEditSectionBtn('vision', 'Edit Vision & Mission')}
          </div>

          <div className="vision-mission-grid">
            <div className="vm-card vision">
              <h3 className="vm-card-title">
                <Circle size={10} fill="currentColor" strokeWidth={0} className="vm-bullet-icon" />
                <span>දැක්ම</span>
              </h3>
              <p>{s.vision}</p>
            </div>

            <div className="vm-card mission">
              <h3 className="vm-card-title">
                <Circle size={10} fill="currentColor" strokeWidth={0} className="vm-bullet-icon" />
                <span>මෙහෙවර</span>
              </h3>
              <p>{s.mission}</p>
            </div>
          </div>
        </section>

        {/* ============================================================
            3. PRINCIPAL'S MESSAGE
           ============================================================ */}
        <section id="sec-principal" className="about-structured-section">
          <div className="about-section-top-bar">
            <div className="section-title-cluster">
              <span className="section-number-pill">03</span>
              <div>
                <span className="section-eyebrow">LEADERSHIP GREETING</span>
                <h2>Principal's Message</h2>
              </div>
            </div>
            {renderEditSectionBtn('principal', "Edit Principal's Message")}
          </div>

          <div className="principal-message-card">
            <div className="principal-msg-portrait-col">
              <div className="principal-msg-photo-frame">
                <img
                  src={s.principalMessageImage || '/Pictures/principal-office-1.jpg'}
                  alt={s.principalName || 'College Principal'}
                  className="principal-msg-photo"
                />
              </div>
              <div className="principal-msg-nameplate">
                <h4>{s.principalName}</h4>
                <span>{s.principalDesignation}</span>
              </div>
            </div>

            <div className="principal-msg-content-col">
              <div className="msg-quote-badge">
                <Quote size={20} />
              </div>
              <h3>{s.principalMessageTitle}</h3>
              <div className="principal-msg-paragraphs">
                {renderPrincipalMessage(s.principalMessage)}
              </div>
              <div className="principal-msg-signature">
                <UserCheck size={16} />
                <div>
                  <strong>{s.principalName}</strong>
                  <span>{s.principalDesignation}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            4. OUR HISTORY AND PRESENT (අපගේ ඉතිහාසය සහ වර්තමානය)
           ============================================================ */}
        <section id="sec-history" className="about-structured-section history-present-section">
          <div className="about-section-top-bar">
            <div className="section-title-cluster">
              <span className="section-number-pill">04</span>
              <div>
                <span className="section-eyebrow">FOUNDING HERITAGE, EVOLUTION &amp; PRESENT EXCELLENCE</span>
                <h2>Our History and Present</h2>
                <span className="section-sinhala-eyebrow">අපගේ ඉතිහාසය සහ වර්තමානය</span>
              </div>
            </div>
            {renderEditSectionBtn('history', 'Edit History & Present')}
          </div>

          {/* Simplified History & Present Article: Clean Text Paragraphs with Headers & Founding Principal Photo */}
          <div className="history-simple-article-card">
            {/* Lead Overview Paragraph */}
            {s.historyIntro && (
              <p className="history-simple-lead">
                {s.historyIntro}
              </p>
            )}

            {/* Subsection 1: Our Beginning with Mr./Mrs. Yapa Dissanayake's Picture */}
            <div className="history-simple-block">
              <h3 className="history-simple-heading">
                <span className="heading-bullet" /> Our Beginning (අපගේ ආරම්භය)
              </h3>

              <div className="history-beginning-simple-layout">
                {/* Founding Principal Photo Box */}
                <div className="founding-principal-simple-card">
                  <div className="founding-principal-photo-wrap">
                    <img
                      src={s.firstPrincipalImage || '/Pictures/principal-office-vintage.jpg'}
                      alt={s.firstPrincipalName || 'Founding Principal'}
                      className="founding-principal-img"
                    />
                  </div>
                  <div className="founding-principal-info">
                    <h4>{s.firstPrincipalName || 'Mrs. Yapa Dissanayake'}</h4>
                    <span className="founding-principal-title">
                      {s.firstPrincipalTitle || 'Founding Principal (1992 – 2002)'}
                    </span>
                    <span className="founding-principal-tenure">
                      {s.firstPrincipalTenure || '1992.06.15 – 2002.03.14'}
                    </span>
                  </div>
                </div>

                {/* Beginning Narrative Paragraphs */}
                <div className="history-beginning-text-flow">
                  <p>
                    {s.historyBeginningText ||
                      'Gampaha Thakshila Maha Vidyalaya was inaugurated on Monday, 15th July 1992 at 10.14 am at an auspicious moment. By the year 2026, Thakshila Vidyalaya celebrates 35 years of proud history.'}
                  </p>
                  <p>
                    The school commenced under the dedicated leadership of Founding Principal{' '}
                    <strong>{s.firstPrincipalName || 'Mrs. Yapa Dissanayake'}</strong>, with a pioneering staff of{' '}
                    <strong>{s.startingStaff || '6 Teachers'}</strong> and{' '}
                    <strong>{s.startingStudents || 'nearly 60 students in three Grade 6 classes'}</strong>.
                    Through unwavering commitment, discipline, and community support, the foundation was laid for what has become one of Gampaha's most distinguished educational institutions.
                  </p>
                </div>
              </div>
            </div>

            {/* Subsection 2: Thakshila Today */}
            <div className="history-simple-block">
              <h3 className="history-simple-heading">
                <span className="heading-bullet" /> Thakshila Today (අද තක්ෂිලාව)
              </h3>
              <div className="history-simple-paragraphs">
                {(s.historyTodayText ||
                  'Today, Thakshila is a leading 1AB mixed school in the region, where over 2,000 students study from Grade 6 to Grade 11 and in the Advanced Level streams of Science, Mathematics, Commerce and Arts, in both Sinhala and Bilingual mediums.\n\nUnder the leadership of the present Principal, Mr. T. M. Premavansha, and with the guidance of 94 teachers, the school is committed to creating a perfect generation of students, rich in virtues and excellent personality, through a quality teaching-learning process.'
                )
                  .split(/\r?\n\s*\r?\n/)
                  .map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))}
              </div>
            </div>

            {/* Subsection 3: Academic Excellence */}
            <div className="history-simple-block">
              <h3 className="history-simple-heading">
                <span className="heading-bullet" /> Academic Excellence (ශාස්ත්‍රීය විශිෂ්ටත්වය)
              </h3>
              <div className="history-simple-paragraphs">
                {(s.historyAcademicText ||
                  'For several years, the school has earned a reputation among the leading schools in the Gampaha Zone through the results of the G.C.E. (Ordinary Level) and G.C.E. (Advanced Level) examinations.\n\nOur aim is to produce disciplined, law-abiding citizens who can fearlessly face future challenges through co-curricular and extracurricular activities.'
                )
                  .split(/\r?\n\s*\r?\n/)
                  .map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))}
              </div>
            </div>

            {/* Subsection 4: Beyond the Classroom */}
            <div className="history-simple-block">
              <h3 className="history-simple-heading">
                <span className="heading-bullet" /> Beyond the Classroom (පන්ති කාමරයෙන් ඔබ්බට)
              </h3>
              <div className="history-simple-paragraphs">
                {(s.historyBeyondText ||
                  'Our students continuously achieve national and regional victories across diverse co-curricular and extracurricular fields, building leadership, character, and team spirit.\n\nKey activity spheres include Sports, Athletics and Aesthetics (Track & Field, Stage Drama, Music, Traditional Dance, and Literary Competitions), Science, Technology & Mathematics (STEM innovations, Science Olympiads, and IT exhibitions), Social Sciences (Parliamentary Debating, Commerce Society, and United Nations Assemblies), as well as Cadetting, Astronomy, Chess, Karate, Scouting, and Environmental Pioneers.'
                )
                  .split(/\r?\n\s*\r?\n/)
                  .map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))}
              </div>
            </div>

            {/* Subsection 5: A Proud Achievement — National Productivity Awards */}
            <div className="history-simple-block">
              <h3 className="history-simple-heading">
                <span className="heading-bullet" /> A Proud Achievement — National Productivity Awards (අභිමානවත් ජයග්‍රහණය)
              </h3>
              <div className="history-simple-paragraphs">
                <p>
                  {s.historyAchievementText ||
                    'Second Place in the Advanced Level Schools category at the National Productivity Awards Competition 2025/26, organized by the National Productivity Secretariat, for building an exemplary productivity culture within the school.'}
                </p>
              </div>
            </div>

            {/* Subsection 6: Our School Environment */}
            <div className="history-simple-block">
              <h3 className="history-simple-heading">
                <span className="heading-bullet" /> Our School Environment (අපගේ පාසල් පරිසරය)
              </h3>
              <div className="history-simple-paragraphs">
                {(s.historyEnvironmentText ||
                  'Though situated on a limited land close to the main city, the school provides excellent facilities including laboratories, computer units, smart classrooms, media unit, sports, aesthetics, home science and subject units.\n\nWith proper waste management and a beautifully maintained premises, Thakshila has become a pleasant place for all, supported by its teachers, parents, old students and well-wishers.\n\nGampaha Thakshila Vidyalaya, with a heritage of 35 years, shines as a proud school.'
                )
                  .split(/\r?\n\s*\r?\n/)
                  .map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))}
              </div>
            </div>
          </div>

          {/* ============================================================
              4. PAST PRINCIPALS (ආදි විදුහල්පතිවරුන්) - Clean, Compact Grid
             ============================================================ */}
          <div className="about-subsection-box past-principals-subsection">
            <div className="past-principals-header">
              <h3 className="past-principals-title">
                <span className="heading-bullet" /> Past Principals
              </h3>
              <span className="past-principals-subtitle">
                ආදි විදුහල්පති පරපුර (1992 – වර්තමානය)
              </span>
            </div>

            {/* Compact Principals Grid */}
            <div className="past-principals-compact-grid">
              {sortedPrincipals.map((p, idx) => (
                <div key={p.id || idx} className="past-principal-compact-card">
                  <div className="past-principal-card-head">
                    <span className="past-principal-order">#{String(p.order || idx + 1).padStart(2, '0')}</span>
                    <span className="past-principal-period">{p.period}</span>
                  </div>
                  <h4 className="past-principal-name">{p.name}</h4>
                  <div className="past-principal-meta">
                    <span className="past-principal-role">{p.designation || 'Principal'}</span>
                    <span className="past-principal-tenure">{p.tenure}</span>
                    {p.duration && <span className="past-principal-duration">({p.duration})</span>}
                  </div>
                </div>
              ))}

              {/* Current / Incumbent Principal - styled same as other parts */}
              {!sortedPrincipals.some(
                (p) =>
                  (p.name || '').toLowerCase().includes('premawansa') ||
                  (p.name || '').toLowerCase().includes('premavansha')
              ) && (
                <div className="past-principal-compact-card current-principal-compact-card">
                  <div className="past-principal-card-head">
                    <span className="past-principal-order">
                      #{String(sortedPrincipals.length + 1).padStart(2, '0')}
                    </span>
                    <span className="past-principal-period">2024 – Present</span>
                  </div>
                  <h4 className="past-principal-name">{s.principalName || 'Mr. T. M. Premawansa'}</h4>
                  <div className="past-principal-meta">
                    <span className="past-principal-role current-role">Incumbent Principal (වත්මන් විදුහල්පති)</span>
                    <span className="past-principal-tenure">2024.01.08 – Present</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ============================================================
            5. SCHOOL IDENTITY (EMBLEM, MOTTO, FLAG & COLORS, ANTHEM)
           ============================================================ */}
        <section id="sec-identity" className="about-structured-section">
          <div className="about-section-top-bar">
            <div className="section-title-cluster">
              <span className="section-number-pill">05</span>
              <div>
                <span className="section-eyebrow">EMBLEM, MOTTO, FLAG & ANTHEM</span>
                <h2>School Identity</h2>
              </div>
            </div>
            {renderEditSectionBtn('identity', 'Edit School Identity')}
          </div>

          {/* Flag Spotlight & Colors Meaning */}
          <div className="about-flag-card">
            <div className="about-flag-img-box">
              <img
                src={s.flagImage || '/Pictures/School Flag.jpeg'}
                alt={s.flagTitle || 'Thakshila College Flag'}
                className="about-flag-img"
                loading="lazy"
              />
              <div className="home-flag-image-badge">
                <Flag size={14} />
                <span>OFFICIAL COLLEGE FLAG</span>
              </div>
            </div>
            <div className="about-flag-content">
              <span className="section-eyebrow">
                <Sparkles size={13} /> COLLEGE FLAG & COLORS
              </span>
              <h3>{s.flagTitle}</h3>
              <p className="about-flag-caption">{s.flagCaption}</p>

              <div className="flag-colors-meaning-box">
                <div className="color-swatches-pair">
                  <span className="color-dot maroon" title="Maroon" />
                  <span className="color-dot gold" title="Gold" />
                  <strong>{s.flagColorsTitle}</strong>
                </div>
                <p>{s.flagColorsMeaning}</p>
              </div>
            </div>
          </div>

          {/* Emblem Meaning + School Motto Two-Column Grid */}
          <div className="identity-dual-grid">
            <div className="identity-detail-card">
              <div className="emblem-display-row">
                <SchoolCrest size={82} src={s.schoolLogo || '/Pictures/School Logo.png'} />
                <div>
                  <span className="identity-mini-tag">COLLEGE CREST</span>
                  <h3>{s.emblemMeaningTitle}</h3>
                </div>
              </div>
              <p>{s.emblemMeaning}</p>
            </div>

            <div className="identity-detail-card motto-card-accent">
              <div className="motto-crest-header">
                <Shield size={28} className="motto-shield-icon" />
                <div>
                  <span className="identity-mini-tag">SCHOOL MOTTO</span>
                  <h3>&ldquo;{s.motto}&rdquo;</h3>
                </div>
              </div>
              <p>{s.mottoMeaning}</p>
              <div className="motto-pill-footer">
                <Sparkles size={14} />
                <span>Atta Deepa Viharatha — Be a Lamp Unto the World</span>
              </div>
            </div>
          </div>

          {/* School Anthem Box */}
          <div className="school-anthem-card">
            <div className="anthem-header">
              <div className="anthem-icon-circle">
                <Music size={24} />
              </div>
              <div>
                <span className="identity-mini-tag">OFFICIAL COLLEGE SONG</span>
                <h3>{s.anthemTitle}</h3>
              </div>
            </div>
            <div className="anthem-lyrics-box">
              {(s.anthemLyrics || '').split('\n\n').map((stanza, idx) => (
                <p key={idx} className="anthem-stanza">
                  {stanza.split('\n').map((line, lIdx) => (
                    <React.Fragment key={lIdx}>
                      {line}
                      {lIdx < stanza.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </p>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================
            6. ACHIEVEMENTS (O/L, A/L, ALL-ISLAND SPORTS, HOUSES)
           ============================================================ */}
        <section id="sec-achievements" className="about-structured-section">
          <div className="about-section-top-bar">
            <div className="section-title-cluster">
              <span className="section-number-pill">06</span>
              <div>
                <span className="section-eyebrow">NATIONAL PRODUCTIVITY & HONORS</span>
                <h2>Achievements</h2>
              </div>
            </div>
            {renderEditSectionBtn('achievements', 'Edit Achievements')}
          </div>

          {/* Award Emblem Showcase + Notable Accomplishments */}
          <div className="accomplishments-showcase-grid">
            <div className="accomplishments-photo-card">
              <div className="accomplishments-img-wrap">
                <img
                  src={s.achievementsImage || '/Pictures/Productivity Logo.png'}
                  alt={s.achievementsImageCaption || 'National Productivity Honor'}
                />
              </div>
              <p className="accomplishments-img-caption">{s.achievementsImageCaption}</p>
            </div>

            <div className="notable-accomplishments-list">
              {notableAccomplishments.map((item, idx) => (
                <div key={idx} className="accomplishment-item-card">
                  <div className="accomplishment-head">
                    <span className="accomplishment-badge">
                      <Trophy size={12} /> {item.badge}
                    </span>
                    <h4>{item.title}</h4>
                  </div>
                  <p>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Edit About Page Content & Images Modal */}
      <EditAboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
        settings={{
          ...s,
          pastPrincipals
        }}
        onSaveSettings={onSaveSettings}
        initialSection={aboutModalInitialTab}
      />
    </div>
  );
}
