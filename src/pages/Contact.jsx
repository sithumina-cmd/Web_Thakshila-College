import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  ExternalLink,
  Edit,
  MessageSquare,
  Facebook,
  Youtube,
  Instagram,
  Share2
} from 'lucide-react';
import SchoolCrest from '../components/SchoolCrest';
import TikTokIcon from '../components/TikTokIcon';

export default function Contact({
  settings,
  isAdmin,
  isEditMode,
  onOpenEditSettingsModal
}) {
  const fbUrl = settings?.facebookUrl || 'https://www.facebook.com/share/1KBZT9itnN/';
  const ytUrl = settings?.youtubeUrl || 'https://youtube.com/@tcgampaha?si=94tvnmlmrcl787fN';
  const igUrl = settings?.instagramUrl || 'https://www.instagram.com/tcpas_2k26?vrfl=dzV2cTJyeTcwYnN6';
  const ttUrl = settings?.tiktokUrl || 'https://www.tiktok.com/@tcpas4?_r=1&_t=ZS-9BMgUcXCMxYn';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [lastSubmitted, setLastSubmitted] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSending(true);

    const schoolEmail = settings?.contactEmail || 'gmthakshilav@gmail.com';
    const subjectLine = `[Thakshila College Inquiry] ${formData.subject || 'General Inquiry'} - ${formData.name}`;
    const bodyContent =
      `Official Inquiry to Thakshila College - Gampaha\n\n` +
      `From: ${formData.name}\n` +
      `Contact Phone: ${formData.phone}\n` +
      `Email: ${formData.email || 'Not provided'}\n` +
      `Subject: ${formData.subject || 'General Inquiry'}\n\n` +
      `Message / Inquiry:\n${formData.message}\n\n` +
      `-----------------------------------------\n` +
      `Sent via Thakshila College Official Portal`;

    // Mailto for mail client / mobile Gmail app
    const mailtoLink = `mailto:${encodeURIComponent(schoolEmail)}?subject=${encodeURIComponent(subjectLine)}&body=${encodeURIComponent(bodyContent)}`;

    // Direct Gmail Web Compose link
    const gmailWebLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(schoolEmail)}&su=${encodeURIComponent(subjectLine)}&body=${encodeURIComponent(bodyContent)}`;

    setLastSubmitted({
      name: formData.name,
      schoolEmail,
      mailtoLink,
      gmailWebLink
    });

    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
    } catch {
      // offline fallback
    } finally {
      setSending(false);
      setSubmitted(true);

      // Automatically open in user's Gmail app / mail client
      const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        window.location.href = mailtoLink;
      } else {
        window.open(gmailWebLink, '_blank');
      }

      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    }
  };

  return (
    <div className="page-contact">
      {/* Banner with Logo before title */}
      <section className="subpage-banner contact-banner">
        <div className="container subpage-banner-inner">
          <div className="subpage-title-with-logo">
            <SchoolCrest size={72} src={settings.schoolLogo || '/Pictures/School Logo.png'} />
            <div>
              <span className="subpage-eyebrow">
                OFFICIAL INQUIRIES & COMMUNICATION
              </span>
              <h1>Contact Us</h1>
              <p className="subpage-si-title">
                Thakshila College - Gampaha | Sribhodi Road, Gampaha
              </p>
            </div>
          </div>

          {isAdmin && isEditMode && (
            <div className="subpage-admin-btn-box">
              <button
                type="button"
                onClick={onOpenEditSettingsModal}
                className="btn-banner-post"
              >
                <Edit size={16} />
                <span>Edit Contact Details</span>
              </button>
            </div>
          )}
        </div>
      </section>

      <div className="container contact-page-container">
        <div className="contact-layout-grid">
          {/* Form Column */}
          <div className="contact-form-card">
            <div className="card-heading-icon-row">
              <MessageSquare size={24} className="heading-icon" />
              <div>
                <h2>Send an Inquiry or Message</h2>
                <p>We welcome inquiries from students, parents, and alumni.</p>
              </div>
            </div>

            {submitted ? (
              <div className="contact-success-state">
                <CheckCircle2 size={54} className="success-icon" />
                <h3>Your Inquiry is Ready to Send!</h3>
                <p>
                  We have prepared your message to send directly to Thakshila College (<strong>{lastSubmitted?.schoolEmail || 'gmthakshilav@gmail.com'}</strong>). If your email application or Gmail did not open automatically, click a button below:
                </p>

                <div className="contact-success-email-actions">
                  <a
                    href={lastSubmitted?.gmailWebLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-email-action gmail"
                    title="Send via Gmail Web"
                  >
                    <Mail size={16} />
                    <span>Open in Gmail (Web)</span>
                  </a>

                  <a
                    href={lastSubmitted?.mailtoLink}
                    className="btn-email-action mailto"
                    title="Send via Default Email or Gmail App"
                  >
                    <ExternalLink size={16} />
                    <span>Open in Gmail / Email App</span>
                  </a>
                </div>

                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="btn-send-another"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-actual-form">
                {error && <div className="login-error-alert">{error}</div>}

                <div className="form-group">
                  <label className="input-label">Your Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className="fb-title-input"
                    required
                  />
                </div>

                <div className="fb-meta-grid">
                  <div className="meta-field">
                    <label>Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="yourname@gmail.com"
                    />
                  </div>
                  <div className="meta-field">
                    <label>Contact Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="07X-XXXXXXX"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="input-label">Subject / Topic</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="e.g. Student Admission / Academic Inquiry / General"
                    className="fb-title-input"
                  />
                </div>

                <div className="form-group">
                  <label className="input-label">Message / Inquiry *</label>
                  <textarea
                    rows={5}
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Type your message or inquiry here..."
                    className="fb-content-textarea"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="btn-send-contact"
                >
                  <Send size={18} />
                  <span>{sending ? 'Preparing Message...' : 'Send Message Now'}</span>
                </button>

                <p className="contact-form-note">
                  <Mail size={13} /> Your inquiry will automatically open in your Gmail / Email app addressed to <strong>{settings.contactEmail || 'gmthakshilav@gmail.com'}</strong>.
                </p>
              </form>
            )}
          </div>

          {/* Contact Details & Info Column */}
          <div className="contact-details-column">
            {/* Quick Details Card */}
            <div className="contact-info-card">
              <h3>College Administration Office</h3>
              <p className="contact-card-sub">
                Official contact details of Thakshila College - Gampaha.
              </p>

              <div className="contact-detail-row">
                <div className="contact-icon-circle">
                  <MapPin size={20} />
                </div>
                <div>
                  <strong>Address</strong>
                  <p>{settings.address || 'GM/ Thakshila College, Sribhodi Road, Gampaha.'}</p>
                  <a
                    href={settings.mapUrl || 'https://maps.app.goo.gl/atoGq8QgbxSFTxJz8'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-map-pin-link"
                    title="Open Thakshila College in Google Maps"
                  >
                    <ExternalLink size={12} />
                    <span>View on Google Maps</span>
                  </a>
                </div>
              </div>

              <div className="contact-detail-row">
                <div className="contact-icon-circle">
                  <Phone size={20} />
                </div>
                <div>
                  <strong>Phone Number</strong>
                  <p>{settings.contactPhone || '0332224752'}</p>
                </div>
              </div>

              <div className="contact-detail-row">
                <div className="contact-icon-circle">
                  <Mail size={20} />
                </div>
                <div>
                  <strong>Email Address</strong>
                  <p>{settings.contactEmail || 'gmthakshilav@gmail.com'}</p>
                </div>
              </div>

              <div className="contact-detail-row">
                <div className="contact-icon-circle">
                  <Clock size={20} />
                </div>
                <div>
                  <strong>Office Hours</strong>
                  <p>{settings.officeHours || 'Monday - Friday: 7:30 AM - 3:30 PM'}</p>
                </div>
              </div>

              {/* Quick Social Channels Row in Contact Info */}
              <div className="contact-detail-row social-row">
                <div className="contact-icon-circle social-icon-circle">
                  <Share2 size={20} />
                </div>
                <div>
                  <strong>Official Social Channels</strong>
                  <div className="contact-quick-social-pills">
                    <a
                      href={fbUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="quick-social-pill fb"
                      title="Facebook"
                      aria-label="Facebook"
                    >
                      <Facebook size={14} /> <span>Facebook</span>
                    </a>
                    <a
                      href={ytUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="quick-social-pill yt"
                      title="YouTube"
                      aria-label="YouTube"
                    >
                      <Youtube size={14} /> <span>YouTube</span>
                    </a>
                    <a
                      href={igUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="quick-social-pill ig"
                      title="Instagram"
                      aria-label="Instagram"
                    >
                      <Instagram size={14} /> <span>Instagram</span>
                    </a>
                    <a
                      href={ttUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="quick-social-pill tt"
                      title="TikTok (@tcpas4)"
                      aria-label="TikTok"
                    >
                      <TikTokIcon size={14} /> <span>TikTok</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* LMS Link Box */}
              <div className="contact-lms-card">
                <div className="lms-card-top">
                  <h4>LMS Online Portal</h4>
                  <a
                    href={settings.lmsUrl || 'https://tcg.bluesmartschool.com/'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-lms-chip"
                  >
                    <ExternalLink size={14} /> Open LMS
                  </a>
                </div>
                <p>
                  Visit <a href={settings.lmsUrl || 'https://tcg.bluesmartschool.com/'} target="_blank" rel="noopener noreferrer">tcg.bluesmartschool.com</a> for student marks and learning material.
                </p>
              </div>
            </div>

            {/* Official Social Media Channels Card */}
            <div className="contact-social-card">
              <div className="social-card-header">
                <Share2 size={18} className="social-card-icon" />
                <div>
                  <h4>Official Social & Media Channels</h4>
                  <p>Follow our verified school streams for live updates and media:</p>
                </div>
              </div>

              <div className="contact-social-grid">
                <a
                  href={fbUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-social-item facebook"
                  title="Official Facebook Page"
                >
                  <div className="social-item-icon-box">
                    <Facebook size={18} />
                  </div>
                  <div className="social-item-info">
                    <span className="social-network-name">Facebook</span>
                    <span className="social-handle-desc">Official College Page</span>
                  </div>
                  <ExternalLink size={13} className="social-ext-arrow" />
                </a>

                <a
                  href={ytUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-social-item youtube"
                  title="Official YouTube Channel"
                >
                  <div className="social-item-icon-box">
                    <Youtube size={18} />
                  </div>
                  <div className="social-item-info">
                    <span className="social-network-name">YouTube</span>
                    <span className="social-handle-desc">Official Media Broadcast</span>
                  </div>
                  <ExternalLink size={13} className="social-ext-arrow" />
                </a>

                <a
                  href={igUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-social-item instagram"
                  title="Official Instagram Profile"
                >
                  <div className="social-item-icon-box">
                    <Instagram size={18} />
                  </div>
                  <div className="social-item-info">
                    <span className="social-network-name">Instagram</span>
                    <span className="social-handle-desc">Photo Chronicles & Highlights</span>
                  </div>
                  <ExternalLink size={13} className="social-ext-arrow" />
                </a>

                <a
                  href={ttUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-social-item tiktok"
                  title="Official TikTok Page (@tcpas4)"
                >
                  <div className="social-item-icon-box">
                    <TikTokIcon size={18} />
                  </div>
                  <div className="social-item-info">
                    <span className="social-network-name">TikTok</span>
                    <span className="social-handle-desc">Shorts, Highlights & Student Creative Media (@tcpas4)</span>
                  </div>
                  <ExternalLink size={13} className="social-ext-arrow" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Embedded Google Map */}
        <section className="contact-map-section">
          <div className="map-heading">
            <div className="map-heading-title-box">
              <MapPin size={20} className="pin-icon" />
              <h3>Location Map — Thakshila College Gampaha</h3>
            </div>
            <a
              href={settings.mapUrl || 'https://maps.app.goo.gl/atoGq8QgbxSFTxJz8'}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-open-maps-action"
              title="Open location directly in Google Maps application or website"
            >
              <ExternalLink size={14} />
              <span>Open in Google Maps</span>
            </a>
          </div>
          <div className="map-frame-wrapper">
            <iframe
              title="Thakshila College Gampaha Google Maps Location"
              src={
                settings.mapEmbedUrl ||
                'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3959.8787723223024!2d80.01056977499879!3d7.088374692914777!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae2fc0be9724aa5%3A0x80b5b20f8d6fc5ee!2sThakshila%20College%20Gampaha!5e0!3m2!1sen!2slk!4v1731220000000!5m2!1sen!2slk'
              }
              width="100%"
              height="380"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </section>
      </div>
    </div>
  );
}
