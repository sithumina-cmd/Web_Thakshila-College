import React, { useState, useEffect } from 'react';
import {
  Save,
  X,
  ExternalLink,
  Phone,
  Mail,
  MapPin,
  Image,
  Globe,
  Clock,
  Sparkles,
  BarChart2,
  Target,
  Compass,
  Facebook,
  Youtube,
  Instagram,
  Share2,
  Flag
} from 'lucide-react';
import TikTokIcon from './TikTokIcon';

export default function EditSettingsModal({
  isOpen,
  onClose,
  settings,
  onSaveSettings
}) {
  const [formData, setFormData] = useState({
    schoolName: '',
    motto: '',
    tagline: '',
    lmsUrl: '',
    lmsLabel: '',
    loginLabel: '',
    heroTitle: '',
    heroSubtitle: '',
    heroDesc: '',
    heroImage: '',
    schoolLogo: '',
    stat1Number: '',
    stat1Label: '',
    stat2Number: '',
    stat2Label: '',
    stat3Number: '',
    stat3Label: '',
    stat4Number: '',
    stat4Label: '',
    vision: '',
    mission: '',
    contactPhone: '',
    contactEmail: '',
    address: '',
    officeHours: '',
    mapUrl: '',
    mapEmbedUrl: '',
    facebookUrl: '',
    youtubeUrl: '',
    instagramUrl: '',
    tiktokUrl: '',
    flagImage: '',
    flagTitle: '',
    flagCaption: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings && isOpen) {
      setFormData({
        schoolName: settings.schoolName || 'Thakshila College - Gampaha',
        motto: settings.motto || 'Knowledge Gives Discipline',
        tagline: settings.tagline || 'A Renowned Buddhist Educational Heritage | Western Province',
        lmsUrl: settings.lmsUrl || 'https://tcg.bluesmartschool.com/',
        lmsLabel: settings.lmsLabel || 'LMS',
        loginLabel: settings.loginLabel || 'Login',
        heroTitle: settings.heroTitle || 'Thakshila College - Gampaha',
        heroSubtitle:
          settings.heroSubtitle ||
          settings.tagline ||
          'A Renowned Buddhist Educational Heritage | Western Province',
        heroDesc:
          settings.heroDesc ||
          'Empowering generations of disciplined, innovative, and visionary leaders. Welcome to the official web portal of Thakshila College - Gampaha.',
        heroImage: settings.heroImage || '/Pictures/Front of School.jpeg',
        schoolLogo: settings.schoolLogo || '/Pictures/School Logo.png',
        stat1Number: settings.stat1Number || '2000+',
        stat1Label: settings.stat1Label || 'Students Enrolled',
        stat2Number: settings.stat2Number || '95',
        stat2Label: settings.stat2Label || 'Teachers',
        stat3Number: settings.stat3Number || '4 Houses',
        stat3Label: settings.stat3Label || 'Agra, Advi, Anupa, Anabi',
        stat4Number: settings.stat4Number || '2 Place',
        stat4Label: settings.stat4Label || 'Productivity in Sri Lanka',
        vision:
          settings.vision ||
          'ද්වීතියික අධ්‍යාපනයේ අරමුණු හා පරමාර්ථ අංගසම්පූර්ණ ලෙස ඉටුකර ගන්නා විශිෂ්ට පාසලක්',
        mission:
          settings.mission ||
          'ගුණාත්මක ඉගෙනුම් ඉගැන්වීම් ක්‍රියාවලියක් තුළ විෂය සමගාමී හා බාහිර ක්‍රියාකාරකම් සපුරාලමින් පරිසරය සුරකින අනාගත අභියෝග ජයගත හැකි, මනා පෞරුෂයකින් හෙබි, විනයගරුක, නීතිගරුක, අභිමානවත් සිසු පරපුරක් දේශයට දායාද කිරීම.',
        contactPhone: settings.contactPhone || '0332224752',
        contactEmail: settings.contactEmail || 'gmthakshilav@gmail.com',
        address: settings.address || 'GM/ Thakshila College, Sribhodi Road, Gampaha.',
        officeHours: settings.officeHours || 'Monday - Friday: 7:30 AM - 3:30 PM',
        mapUrl: settings.mapUrl || 'https://maps.app.goo.gl/atoGq8QgbxSFTxJz8',
        mapEmbedUrl:
          settings.mapEmbedUrl ||
          'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3959.8787723223024!2d80.01056977499879!3d7.088374692914777!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae2fc0be9724aa5%3A0x80b5b20f8d6fc5ee!2sThakshila%20College%20Gampaha!5e0!3m2!1sen!2slk!4v1731220000000!5m2!1sen!2slk',
        facebookUrl: settings.facebookUrl || 'https://www.facebook.com/share/1KBZT9itnN/',
        youtubeUrl: settings.youtubeUrl || 'https://youtube.com/@tcgampaha?si=94tvnmlmrcl787fN',
        instagramUrl: settings.instagramUrl || 'https://www.instagram.com/tcpas_2k26?vrfl=dzV2cTJyeTcwYnN6',
        tiktokUrl: settings.tiktokUrl || 'https://www.tiktok.com/@tcpas4?_r=1&_t=ZS-9BMgUcXCMxYn',
        flagImage: settings.flagImage || '/Pictures/School Flag.jpeg',
        flagTitle: settings.flagTitle || 'The College Flag — Symbol of Pride & Valour',
        flagCaption:
          settings.flagCaption ||
          'Fluttering proudly in maroon and gold, the Thakshila College flag embodies decades of academic excellence, discipline, and noble Buddhist traditions. It stands as a beacon of honor and wisdom for generations of Thakshilians.'
      });
    }
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'tagline') {
        next.heroSubtitle = value;
      } else if (name === 'heroSubtitle') {
        next.tagline = value;
      }
      return next;
    });
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
      <div className="fb-create-modal" onClick={(e) => e.stopPropagation()}>
        <div className="fb-modal-header">
          <div className="modal-title-with-icon">
            <Sparkles size={20} className="sparkle-gold" />
            <h3>Edit Website Details & Settings</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="modal-close-btn"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="fb-modal-form">
          <p className="settings-helper-note">
            Modify school name, motto, LMS portal URL, hero background banner, and administrative contact information.
          </p>

          {/* 1. Brand & Header Identity */}
          <div className="settings-section-card">
            <h4>
              <Globe size={16} /> 1. School Identity & Header
            </h4>
            <div className="meta-field">
              <label>School Name</label>
              <input
                type="text"
                name="schoolName"
                value={formData.schoolName}
                onChange={handleChange}
                placeholder="Thakshila College - Gampaha"
                required
              />
            </div>
            <div className="meta-field" style={{ marginTop: '8px' }}>
              <label>School Subtitle / Tagline (Under School Name)</label>
              <input
                type="text"
                name="heroSubtitle"
                value={formData.heroSubtitle}
                onChange={handleChange}
                placeholder="A Renowned Buddhist Educational Heritage | Western Province"
              />
            </div>
            <div className="meta-field" style={{ marginTop: '8px' }}>
              <label>School Motto</label>
              <input
                type="text"
                name="motto"
                value={formData.motto}
                onChange={handleChange}
                placeholder="Knowledge Gives Discipline"
              />
            </div>
          </div>

          {/* 2. Top Portal Buttons (LMS & Login) */}
          <div className="settings-section-card">
            <h4>
              <ExternalLink size={16} /> 2. Top Header Buttons
            </h4>
            <div className="fb-meta-grid">
              <div className="meta-field">
                <label>LMS Button Label</label>
                <input
                  type="text"
                  name="lmsLabel"
                  value={formData.lmsLabel}
                  onChange={handleChange}
                  placeholder="LMS"
                />
              </div>
              <div className="meta-field">
                <label>LMS Portal URL</label>
                <input
                  type="url"
                  name="lmsUrl"
                  value={formData.lmsUrl}
                  onChange={handleChange}
                  placeholder="https://tcg.bluesmartschool.com/"
                  required
                />
              </div>
            </div>
            <div className="meta-field" style={{ marginTop: '8px' }}>
              <label>Login Button Label</label>
              <input
                type="text"
                name="loginLabel"
                value={formData.loginLabel}
                onChange={handleChange}
                placeholder="Login"
              />
            </div>
          </div>

          {/* 3. Home Full Screen Width Front Picture & Hero Details */}
          <div className="settings-section-card">
            <h4>
              <Image size={16} /> 3. Home Full Screen Hero & Front Photo
            </h4>
            <div className="meta-field">
              <label>Front School Photo Path / URL</label>
              <input
                type="text"
                name="heroImage"
                value={formData.heroImage}
                onChange={handleChange}
                placeholder="/Pictures/Front of School.jpeg"
                required
              />
            </div>
            <div className="meta-field" style={{ marginTop: '8px' }}>
              <label>Hero Welcome Title</label>
              <input
                type="text"
                name="heroTitle"
                value={formData.heroTitle}
                onChange={handleChange}
                placeholder="Thakshila College - Gampaha"
              />
            </div>
            <div className="meta-field" style={{ marginTop: '8px' }}>
              <label>Home Subtitle (Under School Name)</label>
              <input
                type="text"
                name="heroSubtitle"
                value={formData.heroSubtitle}
                onChange={handleChange}
                placeholder="A Renowned Buddhist Educational Heritage | Western Province"
              />
            </div>
            <div className="meta-field" style={{ marginTop: '8px' }}>
              <label>Hero Description</label>
              <textarea
                name="heroDesc"
                rows={3}
                value={formData.heroDesc}
                onChange={handleChange}
                placeholder="Welcome description on home hero..."
              />
            </div>
          </div>

          {/* 4. Key Highlights & Statistics Strip */}
          <div className="settings-section-card">
            <h4>
              <BarChart2 size={16} /> 4. Key Highlights & Statistics Strip
            </h4>
            <div className="fb-meta-grid">
              <div className="meta-field">
                <label>Stat 1 Number / Value</label>
                <input
                  type="text"
                  name="stat1Number"
                  value={formData.stat1Number}
                  onChange={handleChange}
                  placeholder="2000+"
                />
              </div>
              <div className="meta-field">
                <label>Stat 1 Label / Text</label>
                <input
                  type="text"
                  name="stat1Label"
                  value={formData.stat1Label}
                  onChange={handleChange}
                  placeholder="Students Enrolled"
                />
              </div>

              <div className="meta-field">
                <label>Stat 2 Number / Value</label>
                <input
                  type="text"
                  name="stat2Number"
                  value={formData.stat2Number}
                  onChange={handleChange}
                  placeholder="95"
                />
              </div>
              <div className="meta-field">
                <label>Stat 2 Label / Text</label>
                <input
                  type="text"
                  name="stat2Label"
                  value={formData.stat2Label}
                  onChange={handleChange}
                  placeholder="Teachers"
                />
              </div>

              <div className="meta-field">
                <label>Stat 3 Number / Value</label>
                <input
                  type="text"
                  name="stat3Number"
                  value={formData.stat3Number}
                  onChange={handleChange}
                  placeholder="4 Houses"
                />
              </div>
              <div className="meta-field">
                <label>Stat 3 Label / Text</label>
                <input
                  type="text"
                  name="stat3Label"
                  value={formData.stat3Label}
                  onChange={handleChange}
                  placeholder="Agra, Advi, Anupa, Anabi"
                />
              </div>

              <div className="meta-field">
                <label>Stat 4 Number / Value</label>
                <input
                  type="text"
                  name="stat4Number"
                  value={formData.stat4Number}
                  onChange={handleChange}
                  placeholder="2 Place"
                />
              </div>
              <div className="meta-field">
                <label>Stat 4 Label / Text</label>
                <input
                  type="text"
                  name="stat4Label"
                  value={formData.stat4Label}
                  onChange={handleChange}
                  placeholder="Productivity in Sri Lanka"
                />
              </div>
            </div>
          </div>

          {/* 5. School Vision & Mission */}
          <div className="settings-section-card">
            <h4>
              <Target size={16} /> 5. School Vision & Mission
            </h4>
            <div className="meta-field">
              <label>College Vision</label>
              <textarea
                name="vision"
                rows={3}
                value={formData.vision}
                onChange={handleChange}
                placeholder="ද්වීතියික අධ්‍යාපනයේ අරමුණු හා පරමාර්ථ අංගසම්පූර්ණ ලෙස ඉටුකර ගන්නා විශිෂ්ට පාසලක්"
              />
            </div>
            <div className="meta-field" style={{ marginTop: '10px' }}>
              <label>පාසලේ මෙහෙවර (Mission)</label>
              <textarea
                name="mission"
                rows={4}
                value={formData.mission}
                onChange={handleChange}
                placeholder="ගුණාත්මක ඉගෙනුම් ඉගැන්වීම් ක්‍රියාවලියක් තුළ විෂය සමගාමී හා බාහිර ක්‍රියාකාරකම් සපුරාලමින් පරිසරය සුරකින අනාගත අභියෝග ජයගත හැකි, මනා පෞරුෂයකින් හෙබි, විනයගරුක, නීතිගරුක, අභිමානවත් සිසු පරපුරක් දේශයට දායාද කිරීම."
              />
            </div>
          </div>

          {/* 6. Contact Information */}
          <div className="settings-section-card">
            <h4>
              <Phone size={16} /> 6. Contact Information
            </h4>
            <div className="fb-meta-grid">
              <div className="meta-field">
                <label>
                  <Phone size={13} /> Phone Number
                </label>
                <input
                  type="text"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  placeholder="0332224752"
                />
              </div>
              <div className="meta-field">
                <label>
                  <Mail size={13} /> Email Address
                </label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  placeholder="gmthakshilav@gmail.com"
                />
              </div>
            </div>
            <div className="meta-field" style={{ marginTop: '8px' }}>
              <label>
                <MapPin size={13} /> Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="GM/ Thakshila College, Sribhodi Road, Gampaha."
              />
            </div>
            <div className="meta-field" style={{ marginTop: '8px' }}>
              <label>
                <Clock size={13} /> Office Hours
              </label>
              <input
                type="text"
                name="officeHours"
                value={formData.officeHours}
                onChange={handleChange}
                placeholder="Monday - Friday: 7:30 AM - 3:30 PM"
              />
            </div>
            <div className="meta-field" style={{ marginTop: '8px' }}>
              <label>
                <Globe size={13} /> Google Maps Link (Share URL)
              </label>
              <input
                type="url"
                name="mapUrl"
                value={formData.mapUrl}
                onChange={handleChange}
                placeholder="https://maps.app.goo.gl/atoGq8QgbxSFTxJz8"
              />
            </div>
            <div className="meta-field" style={{ marginTop: '8px' }}>
              <label>
                <MapPin size={13} /> Google Maps Embed Iframe URL
              </label>
              <input
                type="text"
                name="mapEmbedUrl"
                value={formData.mapEmbedUrl}
                onChange={handleChange}
                placeholder="https://www.google.com/maps/embed?pb=..."
              />
            </div>
          </div>

          {/* 7. Official Social Media Channels */}
          <div className="settings-section-card">
            <h4>
              <Share2 size={16} /> 7. Official Social Media Channels
            </h4>
            <p className="settings-section-help" style={{ fontSize: '0.8rem', color: 'var(--slate-500)', margin: '4px 0 12px' }}>
              Configure official URLs for Facebook, YouTube, and Instagram displayed in the footer and contact pages.
            </p>
            <div className="meta-field">
              <label>
                <Facebook size={13} style={{ color: '#1877f2' }} /> Facebook Page URL
              </label>
              <input
                type="url"
                name="facebookUrl"
                value={formData.facebookUrl}
                onChange={handleChange}
                placeholder="https://www.facebook.com/thakshilacollegegampaha/"
              />
            </div>
            <div className="meta-field" style={{ marginTop: '10px' }}>
              <label>
                <Youtube size={13} style={{ color: '#ff0000' }} /> YouTube Channel URL
              </label>
              <input
                type="url"
                name="youtubeUrl"
                value={formData.youtubeUrl}
                onChange={handleChange}
                placeholder="https://www.youtube.com/@thakshilacollegegampaha"
              />
            </div>
            <div className="meta-field" style={{ marginTop: '10px' }}>
              <label>
                <Instagram size={13} style={{ color: '#e1306c' }} /> Instagram Profile URL
              </label>
              <input
                type="url"
                name="instagramUrl"
                value={formData.instagramUrl}
                onChange={handleChange}
                placeholder="https://www.instagram.com/thakshilacollegegampaha/"
              />
            </div>
            <div className="meta-field" style={{ marginTop: '10px' }}>
              <label>
                <TikTokIcon size={13} style={{ color: '#000000' }} /> TikTok Page URL
              </label>
              <input
                type="url"
                name="tiktokUrl"
                value={formData.tiktokUrl}
                onChange={handleChange}
                placeholder="https://www.tiktok.com/@tcpas4"
              />
            </div>
          </div>

          {/* 8. College Flag & Identity Spotlight */}
          <div className="settings-section-card">
            <h4>
              <Flag size={16} /> 8. College Flag & Identity Spotlight
            </h4>
            <p className="settings-section-help" style={{ fontSize: '0.8rem', color: 'var(--slate-500)', margin: '4px 0 12px' }}>
              Displayed prominently on the Home page (before Vision & Mission) and the About page.
            </p>
            <div className="meta-field">
              <label>
                <Image size={13} /> College Flag Image Path or URL
              </label>
              <input
                type="text"
                name="flagImage"
                value={formData.flagImage}
                onChange={handleChange}
                placeholder="/Pictures/School Flag.jpeg"
                required
              />
            </div>
            <div className="meta-field" style={{ marginTop: '10px' }}>
              <label>
                <Sparkles size={13} /> Flag Section Title
              </label>
              <input
                type="text"
                name="flagTitle"
                value={formData.flagTitle}
                onChange={handleChange}
                placeholder="The College Flag — Symbol of Pride & Valour"
                required
              />
            </div>
            <div className="meta-field" style={{ marginTop: '10px' }}>
              <label>
                <Compass size={13} /> Flag Caption / Description
              </label>
              <textarea
                name="flagCaption"
                rows={3}
                value={formData.flagCaption}
                onChange={handleChange}
                placeholder="Write the historical significance or caption for the college flag..."
                required
              />
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-fb-publish">
            <Save size={18} />
            <span>{saving ? 'Saving Changes...' : 'Save Website Details'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
