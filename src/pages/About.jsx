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
    Array.isArray(principals) && principals.length > 0
      ? principals
      : Array.isArray(s.pastPrincipals) && s.pastPrincipals.length > 0
      ? s.pastPrincipals
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

          {/* Section Hero Lead Banner */}
          <div className="history-hero-lead-card">
            <div className="history-lead-icon-bubble">
              <Landmark size={28} />
            </div>
            <div className="history-lead-text-box">
              <span className="history-lead-badge">
                <Sparkles size={14} /> 35 YEARS OF EDUCATIONAL GLORY • 1992 – 2026/2027
              </span>
              <p className="history-lead-paragraph">
                {s.historyIntro ||
                  'Gampaha Thakshila Vidyalaya, a proud mixed school situated in the heart of Gampaha, has been enlightening the children of the nation and nurturing citizens with personality for over three decades.'}
              </p>
            </div>
          </div>

          {/* ============================================================
              SUBSECTION A: OUR BEGINNING (අපගේ ආරම්භය)
             ============================================================ */}
          <div className="history-subsection-card beginning-subsection-card">
            <div className="history-subsection-header">
              <div className="subsection-icon-badge beginning">
                <Calendar size={22} />
              </div>
              <div className="subsection-header-info">
                <span className="history-eyebrow-mini">THE AUSPICIOUS DAWN</span>
                <h3 className="history-subsection-title">Our Beginning (අපගේ ආරම්භය)</h3>
                <p className="history-subsection-desc">
                  {s.historyBeginningText ||
                    'Gampaha Thakshila Maha Vidyalaya was inaugurated on Monday, 15th July 1992 at 10.14 am at an auspicious moment. By the year 2026, Thakshila Vidyalaya celebrates 35 years of proud history.'}
                </p>
              </div>
            </div>

            <div className="beginning-content-grid">
              {/* Left Column: Founding Milestone Credentials (Unique formal bullet method) */}
              <div className="beginning-credentials-col">
                <h4 className="credentials-block-title">
                  <Award size={18} /> Pioneering Foundation Credentials (1992)
                </h4>
                <div className="formal-credentials-grid">
                  <div className="formal-cred-card cred-date">
                    <div className="cred-icon-box">
                      <Clock size={20} />
                    </div>
                    <div className="cred-details">
                      <span className="cred-label">Inauguration Moment</span>
                      <strong className="cred-value">{s.historyBeginningDate || 'Monday, 15th July 1992 at 10.14 am'}</strong>
                      <span className="cred-sub">Auspicious Beginning of Thakshila Vidyalaya</span>
                    </div>
                  </div>

                  <div className="formal-cred-card cred-principal">
                    <div className="cred-icon-box">
                      <GraduationCap size={20} />
                    </div>
                    <div className="cred-details">
                      <span className="cred-label">Founding Principal</span>
                      <strong className="cred-value">{s.firstPrincipalName || 'Mrs. Yapa Dissanayake'}</strong>
                      <span className="cred-sub">Pioneering Head of Institution (1992.06.15 – 2002.03.14)</span>
                    </div>
                  </div>

                  <div className="formal-cred-card cred-staff">
                    <div className="cred-icon-box">
                      <Users size={20} />
                    </div>
                    <div className="cred-details">
                      <span className="cred-label">Starting Staff</span>
                      <strong className="cred-value">{s.startingStaff || '6 Teachers'}</strong>
                      <span className="cred-sub">Dedicated Founding Faculty of Educators</span>
                    </div>
                  </div>

                  <div className="formal-cred-card cred-students">
                    <div className="cred-icon-box">
                      <BookOpen size={20} />
                    </div>
                    <div className="cred-details">
                      <span className="cred-label">Starting Students</span>
                      <strong className="cred-value">{s.startingStudents || 'Nearly 60 students in three Grade 6 classes'}</strong>
                      <span className="cred-sub">First Student Cohort to Enter Thakshila</span>
                    </div>
                  </div>

                  <div className="formal-cred-card cred-heritage">
                    <div className="cred-icon-box">
                      <Sparkles size={20} />
                    </div>
                    <div className="cred-details">
                      <span className="cred-label">Collegiate Milestone</span>
                      <strong className="cred-value">35 Years of Proud History (1992 – 2026/2027)</strong>
                      <span className="cred-sub">Nurturing Generations of Virtuous Citizens</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Dedicated First Principal Portrait Card */}
              <div className="first-principal-portrait-card">
                <div className="first-principal-photo-frame">
                  <img
                    src={s.firstPrincipalImage || '/Pictures/principal-office-vintage.jpg'}
                    alt={s.firstPrincipalName || 'Mrs. Yapa Dissanayake - Founding Principal'}
                    className="first-principal-photo"
                  />
                  <div className="first-principal-gold-ribbon">
                    <Award size={14} /> FOUNDING PRINCIPAL
                  </div>
                </div>
                <div className="first-principal-caption-box">
                  <h4>{s.firstPrincipalName || 'Mrs. Yapa Dissanayake'}</h4>
                  <span className="first-principal-tenure">
                    {s.firstPrincipalTitle || 'Founding Principal (1992 – 2002)'}
                  </span>
                  <p className="first-principal-sinhala-tag">
                    ප්‍රථම විදුහල්පතිනිය — තක්ෂිලා මාතාවගේ ආරම්භක යුගය මෙහෙයවූ පුරෝගාමී නායිකාව
                  </p>
                  <div className="first-principal-tenure-badge">
                    <Calendar size={13} /> {s.firstPrincipalTenure || '1992.06.15 – 2002.03.14'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================
              SUBSECTION B: THAKSHILA TODAY (අද තක්ෂිලාව)
             ============================================================ */}
          <div className="history-subsection-card today-subsection-card">
            <div className="history-subsection-header">
              <div className="subsection-icon-badge today">
                <Building2 size={22} />
              </div>
              <div className="subsection-header-info">
                <span className="history-eyebrow-mini">CONTEMPORARY EXCELLENCE</span>
                <h3 className="history-subsection-title">Thakshila Today (අද තක්ෂිලාව)</h3>
              </div>
            </div>

            <div className="today-narrative-container">
              <div className="today-paragraphs">
                {(s.historyTodayText || '').split(/\r?\n\s*\r?\n/).map((para, idx) => (
                  <p key={idx} className="today-narrative-para">
                    {para}
                  </p>
                ))}
              </div>

              {/* Today's Institutional Matrix Chips */}
              <div className="today-matrix-chips">
                <div className="today-stat-pill">
                  <GraduationCap size={16} />
                  <span>Category: <strong>1AB Mixed School</strong></span>
                </div>
                <div className="today-stat-pill">
                  <Users size={16} />
                  <span>Student Body: <strong>2,000+ Students</strong></span>
                </div>
                <div className="today-stat-pill">
                  <BookOpen size={16} />
                  <span>Academic Levels: <strong>Grade 6 to Grade 11 &amp; A/L</strong></span>
                </div>
                <div className="today-stat-pill">
                  <Award size={16} />
                  <span>A/L Streams: <strong>Science, Maths, Commerce &amp; Arts</strong></span>
                </div>
                <div className="today-stat-pill">
                  <Globe size={16} />
                  <span>Language Mediums: <strong>Sinhala &amp; Bilingual</strong></span>
                </div>
                <div className="today-stat-pill highlight">
                  <UserCheck size={16} />
                  <span>Leadership: <strong>Mr. T. M. Premavansha &amp; 94 Teachers</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================
              SUBSECTION C: ACADEMIC EXCELLENCE (ශාස්ත්‍රීය විශිෂ්ටත්වය)
             ============================================================ */}
          <div className="history-subsection-card academic-subsection-card">
            <div className="history-subsection-header">
              <div className="subsection-icon-badge academic">
                <GraduationCap size={22} />
              </div>
              <div className="subsection-header-info">
                <span className="history-eyebrow-mini">SCHOLASTIC DISTINCTION</span>
                <h3 className="history-subsection-title">Academic Excellence (ශාස්ත්‍රීය විශිෂ්ටත්වය)</h3>
              </div>
            </div>

            <div className="academic-narrative-box">
              <div className="academic-quote-icon">
                <Quote size={24} />
              </div>
              <div className="academic-text-flow">
                {(s.historyAcademicText || '').split(/\r?\n\s*\r?\n/).map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
            </div>
          </div>

          {/* ============================================================
              SUBSECTION D: BEYOND THE CLASSROOM (පන්ති කාමරයෙන් ඔබ්බට)
              Unique Formal Method for Extracurricular Bullet Points
             ============================================================ */}
          <div className="history-subsection-card beyond-subsection-card">
            <div className="history-subsection-header">
              <div className="subsection-icon-badge beyond">
                <Trophy size={22} />
              </div>
              <div className="subsection-header-info">
                <span className="history-eyebrow-mini">HOLISTIC STUDENT DEVELOPMENT</span>
                <h3 className="history-subsection-title">Beyond the Classroom (පන්ති කාමරයෙන් ඔබ්බට)</h3>
                <p className="history-subsection-desc">
                  Our students have continuously achieved national and international victories across diverse co-curricular and extracurricular spheres:
                </p>
              </div>
            </div>

            {/* Formal Collegiate Activity Discipline Cards (Unique formal method) */}
            <div className="formal-disciplines-grid">
              <div className="formal-discipline-card disc-sports">
                <div className="disc-header">
                  <div className="disc-icon-box">
                    <Trophy size={22} />
                  </div>
                  <div>
                    <span className="disc-subtag">AESTHETICS &amp; ATHLETICS</span>
                    <h4 className="disc-title">Sports, Aesthetics and Literature</h4>
                    <span className="disc-sinhala">ක්‍රීඩා, සෞන්දර්ය හා සාහිත්‍ය</span>
                  </div>
                </div>
                <div className="disc-badge-cluster">
                  <span className="disc-pill">Track &amp; Field Athletics</span>
                  <span className="disc-pill">Stage Drama</span>
                  <span className="disc-pill">Classical &amp; Western Music</span>
                  <span className="disc-pill">Traditional Dance</span>
                  <span className="disc-pill">Literary &amp; Essay Championships</span>
                </div>
              </div>

              <div className="formal-discipline-card disc-stem">
                <div className="disc-header">
                  <div className="disc-icon-box">
                    <Cpu size={22} />
                  </div>
                  <div>
                    <span className="disc-subtag">STEM &amp; INNOVATION</span>
                    <h4 className="disc-title">Science, Technology &amp; Mathematics</h4>
                    <span className="disc-sinhala">විද්‍යා, තාක්ෂණ හා ගණිත</span>
                  </div>
                </div>
                <div className="disc-badge-cluster">
                  <span className="disc-pill">Science Olympiads</span>
                  <span className="disc-pill">Mathematics Competitions</span>
                  <span className="disc-pill">Robotics &amp; IT Exhibitions</span>
                  <span className="disc-pill">Invention &amp; Research Conventions</span>
                </div>
              </div>

              <div className="formal-discipline-card disc-social">
                <div className="disc-header">
                  <div className="disc-icon-box">
                    <Globe size={22} />
                  </div>
                  <div>
                    <span className="disc-subtag">HUMANITIES &amp; GLOBAL PERSPECTIVES</span>
                    <h4 className="disc-title">Social Sciences</h4>
                    <span className="disc-sinhala">සමාජයීය විද්‍යා</span>
                  </div>
                </div>
                <div className="disc-badge-cluster">
                  <span className="disc-pill">Parliamentary Debating</span>
                  <span className="disc-pill">Commerce Society Expositions</span>
                  <span className="disc-pill">Geographical &amp; Historical Research</span>
                  <span className="disc-pill">United Nations Student Assemblies</span>
                </div>
              </div>

              <div className="formal-discipline-card disc-cadetting">
                <div className="disc-header">
                  <div className="disc-icon-box">
                    <Shield size={22} />
                  </div>
                  <div>
                    <span className="disc-subtag">LEADERSHIP &amp; SERVICE CORPS</span>
                    <h4 className="disc-title">Cadetting, Astronomy, Chess, Karate, Scouting &amp; Pioneers</h4>
                    <span className="disc-sinhala">ශිෂ්‍යභට, තාරකා විද්‍යා, චෙස්, කරාතේ, බාලදක්ෂ හා පරිසර නියමුවෝ</span>
                  </div>
                </div>
                <div className="disc-badge-cluster">
                  <span className="disc-pill">National Cadet Corps (NCC)</span>
                  <span className="disc-pill">Astronomy &amp; Space Club</span>
                  <span className="disc-pill">All-Island Chess Champions</span>
                  <span className="disc-pill">Karate &amp; Martial Arts</span>
                  <span className="disc-pill">Scouts &amp; Girl Guides</span>
                  <span className="disc-pill">Environmental Pioneers</span>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================
              SUBSECTION E: A PROUD ACHIEVEMENT (අභිමානවත් ජයග්‍රහණය)
              National Productivity Awards Islandwide
             ============================================================ */}
          <div className="history-subsection-card achievement-subsection-card">
            <div className="achievement-honor-banner">
              <div className="achievement-trophy-cluster">
                <div className="trophy-halo-ring">
                  <Award size={36} />
                </div>
                <span className="national-honor-seal">ISLAND-WIDE EXCELLENCE</span>
              </div>
              <div className="achievement-citation-body">
                <span className="achievement-laurel-tag">
                  <Sparkles size={14} /> A PROUD NATIONAL RECOGNITION • අභිමානවත් ජයග්‍රහණය
                </span>
                <h3 className="achievement-main-title">
                  National Productivity Awards Competition 2025/26
                </h3>
                <h4 className="achievement-sub-title">
                  Second Place — Advanced Level Schools Category in Sri Lanka
                </h4>
                <p className="achievement-details-para">
                  {s.historyAchievementText ||
                    'Second Place in the Advanced Level Schools category at the National Productivity Awards Competition 2025/26, organized by the National Productivity Secretariat, for building a productivity culture within the school.'}
                </p>
                <div className="achievement-meta-row">
                  <span className="achieve-pill"><Landmark size={14} /> National Productivity Secretariat</span>
                  <span className="achieve-pill highlight"><Trophy size={14} /> 2nd Place Island-Wide</span>
                  <span className="achieve-pill"><CheckCircle2 size={14} /> Exemplary Institutional Productivity Culture</span>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================
              SUBSECTION F: OUR SCHOOL ENVIRONMENT (අපගේ පාසල් පරිසරය)
             ============================================================ */}
          <div className="history-subsection-card environment-subsection-card">
            <div className="history-subsection-header">
              <div className="subsection-icon-badge environment">
                <Leaf size={22} />
              </div>
              <div className="subsection-header-info">
                <span className="history-eyebrow-mini">CAMPUS INFRASTRUCTURE &amp; GREEN ECO-CULTURE</span>
                <h3 className="history-subsection-title">Our School Environment (අපගේ පාසල් පරිසරය)</h3>
              </div>
            </div>

            <div className="environment-content-flow">
              <div className="environment-narrative">
                {(s.historyEnvironmentText || '').split(/\r?\n\s*\r?\n/).map((para, idx) => (
                  <p key={idx} className="env-para">{para}</p>
                ))}
              </div>

              {/* Modern Campus Facilities Matrix */}
              <div className="campus-facilities-matrix">
                <div className="facility-card">
                  <div className="facility-icon"><Microscope size={18} /></div>
                  <div className="facility-info">
                    <strong>Science Laboratories</strong>
                    <span>Fully equipped Physics, Chemistry &amp; Biology labs</span>
                  </div>
                </div>
                <div className="facility-card">
                  <div className="facility-icon"><Cpu size={18} /></div>
                  <div className="facility-info">
                    <strong>Computer Units &amp; IT Labs</strong>
                    <span>Modern digital workstations &amp; high-speed connectivity</span>
                  </div>
                </div>
                <div className="facility-card">
                  <div className="facility-icon"><Sparkles size={18} /></div>
                  <div className="facility-info">
                    <strong>Smart Classrooms</strong>
                    <span>Interactive displays, smart projectors &amp; LMS integration</span>
                  </div>
                </div>
                <div className="facility-card">
                  <div className="facility-icon"><Music size={18} /></div>
                  <div className="facility-info">
                    <strong>Media Unit &amp; Aesthetics</strong>
                    <span>Broadcasting audio/video console, music &amp; art studios</span>
                  </div>
                </div>
                <div className="facility-card">
                  <div className="facility-icon"><Trophy size={18} /></div>
                  <div className="facility-info">
                    <strong>Sports Facilities</strong>
                    <span>Athletic grounds, indoor sports arenas &amp; equipment</span>
                  </div>
                </div>
                <div className="facility-card">
                  <div className="facility-icon"><Leaf size={18} /></div>
                  <div className="facility-info">
                    <strong>Waste Management &amp; Green Campus</strong>
                    <span>Pioneering eco-friendly recycling &amp; landscaped premises</span>
                  </div>
                </div>
              </div>

              <div className="heritage-concluding-banner">
                <Award size={20} />
                <span>
                  <strong>Gampaha Thakshila Vidyalaya</strong>, with a heritage of 35 years, shines as a proud school.
                </span>
              </div>
            </div>
          </div>

          {/* ============================================================
              4. LEADERSHIP LINEAGE: ROLL OF PAST PRINCIPALS (1992 – 2024)
              Replaces legacy milestone cards with official archival lineage
             ============================================================ */}
          <div className="about-subsection-box principals-lineage-subsection">
            <div className="principals-section-header-cluster">
              <div className="principals-title-group">
                <div className="principals-badge-icon">
                  <Award size={24} />
                </div>
                <div>
                  <div className="principals-eyebrow-tag">OFFICIAL ARCHIVAL RECORDS • 1992 – 2024</div>
                  <h3 className="subsection-heading-prominent">
                    Distinguished Roll of Past Principals
                  </h3>
                  <p className="principals-sinhala-subtitle">
                    විදුහල්පති නාමාවලිය — තක්ෂිලා විදුහල් මාතාව මෙහෙයවූ අභිමානවත් විදුහල්පති පරපුර
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Summary Strip */}
            <div className="principals-metric-strip">
              <div className="metric-chip">
                <span className="metric-num">8</span>
                <span className="metric-txt">Documented Tenures</span>
              </div>
              <div className="metric-chip divider-chip" />
              <div className="metric-chip">
                <span className="metric-num">32+</span>
                <span className="metric-txt">Years of Leadership (1992 – 2024)</span>
              </div>
              <div className="metric-chip divider-chip" />
              <div className="metric-chip">
                <span className="metric-num">100%</span>
                <span className="metric-txt">Verified Archival Lineage</span>
              </div>
            </div>

            {/* CHRONOLOGICAL TIMELINE JOURNEY */}
            <div className="principals-timeline-flow">
              <div className="timeline-vertical-spine" aria-hidden="true" />
              <div className="principals-timeline-items">
                {sortedPrincipals.map((p, idx) => (
                  <div
                    key={p.id || idx}
                    className={`principal-timeline-node ${idx % 2 === 0 ? 'node-left' : 'node-right'}`}
                  >
                    <div className="timeline-node-medallion" title={`Official Record #${p.order || idx + 1}`}>
                      <span className="medallion-hash">#</span>
                      <span className="medallion-number">{String(p.order || idx + 1).padStart(2, '0')}</span>
                    </div>

                    <div className="principal-chronicle-card">
                      <div className="chronicle-card-top">
                        <div className="chronicle-era-badge">
                          <Calendar size={13} />
                          <span>{p.period}</span>
                        </div>
                        {p.duration && (
                          <div className="chronicle-duration-pill">
                            <Clock size={12} />
                            <span>{p.duration}</span>
                          </div>
                        )}
                      </div>

                      <h4 className="chronicle-principal-name">{p.name}</h4>
                      <div className="chronicle-designation-line">
                        <span className="principal-role-tag">{p.designation || 'Principal'}</span>
                        <span className="dot-sep">•</span>
                        <span className="school-affil">Thakshila College</span>
                      </div>

                      <div className="chronicle-tenure-banner">
                        <span className="tenure-label">Official Service Tenure:</span>
                        <strong className="tenure-exact-dates">{p.tenure}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Incumbent Transition Footer Note */}
            <div className="principals-incumbent-footer">
              <div className="incumbent-footer-icon">
                <CheckCircle2 size={18} />
              </div>
              <div className="incumbent-footer-text">
                <strong>Continuing the Legacy:</strong> Following this illustrious lineage, Thakshila College is guided today by <strong>{s.principalName || 'Mr. T. M. Premawansa'}</strong> (Incumbent Principal).
              </div>
              <a href="#sec-principal" className="btn-jump-principal">
                <span>View Principal's Message</span>
                <ChevronRight size={14} />
              </a>
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

        {/* Contact Strip */}
        <section className="about-contact-banner">
          <div>
            <h3>Contact {s.schoolName || 'Thakshila College - Gampaha'}</h3>
            <p>Reach out to the college administration office during school hours.</p>
          </div>
          <div className="contact-chips">
            <div className="contact-chip">
              <MapPin size={17} />
              <span>{s.address || s.locationDetails || 'Sribhodi Road, Gampaha.'}</span>
            </div>
            <div className="contact-chip">
              <Phone size={17} />
              <span>{s.contactPhone || '0332224752'}</span>
            </div>
            <div className="contact-chip">
              <Mail size={17} />
              <span>{s.contactEmail || 'gmthakshilav@gmail.com'}</span>
            </div>
          </div>
        </section>
      </div>

      {/* Edit About Page Content & Images Modal */}
      <EditAboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
        settings={s}
        onSaveSettings={onSaveSettings}
        initialSection={aboutModalInitialTab}
      />
    </div>
  );
}
