import React from 'react';
import {
  ExternalLink,
  LogIn,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Edit,
  Heart,
  Facebook,
  Youtube,
  Instagram
} from 'lucide-react';
import SchoolCrest from './SchoolCrest';
import TikTokIcon from './TikTokIcon';

export default function Footer({
  settings,
  setActiveTab,
  isAdmin,
  onOpenLoginModal,
  onOpenEditSettingsModal
}) {
  const fbUrl = settings?.facebookUrl || 'https://www.facebook.com/share/1KBZT9itnN/';
  const ytUrl = settings?.youtubeUrl || 'https://youtube.com/@tcgampaha?si=94tvnmlmrcl787fN';
  const igUrl = settings?.instagramUrl || 'https://www.instagram.com/tcpas_2k26?vrfl=dzV2cTJyeTcwYnN6';
  const ttUrl = settings?.tiktokUrl || 'https://www.tiktok.com/@tcpas4?_r=1&_t=ZS-9BMgUcXCMxYn';

  const goTab = (tab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        {/* Col 1: School Identity with Logo before Title */}
        <div className="footer-brand-col">
          <div className="footer-brand-row">
            <SchoolCrest size={60} src={settings?.schoolLogo || '/Pictures/School Logo.png'} />
            <div>
              <h3>{settings?.schoolName || 'Thakshila College - Gampaha'}</h3>
              <p className="footer-tagline">{settings?.tagline || 'Premier National School • Gampaha'}</p>
            </div>
          </div>

          {/* Official Social Media Channels moved to bottom of Col 1 */}
          <div className="footer-social-block">
            <span className="footer-social-title">Official Social Media</span>
            <div className="footer-social-icons">
              <a
                href={fbUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link facebook"
                title="Official Facebook Page"
                aria-label="Official Facebook Page"
              >
                <Facebook size={16} />
              </a>
              <a
                href={ytUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link youtube"
                title="Official YouTube Channel"
                aria-label="Official YouTube Channel"
              >
                <Youtube size={16} />
              </a>
              <a
                href={igUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link instagram"
                title="Official Instagram Profile"
                aria-label="Official Instagram Profile"
              >
                <Instagram size={16} />
              </a>
              <a
                href={ttUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link tiktok"
                title="Official TikTok Page (@tcpas4)"
                aria-label="Official TikTok Page"
              >
                <TikTokIcon size={16} />
              </a>
            </div>
          </div>
        </div>

        {/* Col 2: Navigation Links in English */}
        <div className="footer-links-col">
          <h4>Site Pages</h4>
          <ul>
            <li>
              <button type="button" onClick={() => goTab('home')}>
                Home
              </button>
            </li>
            <li>
              <button type="button" onClick={() => goTab('news')}>
                News & Circulars
              </button>
            </li>
            <li>
              <button type="button" onClick={() => goTab('sports')}>
                Sports & Athletics
              </button>
            </li>
            <li>
              <button type="button" onClick={() => goTab('diary')}>
                Thakshila Diary
              </button>
            </li>
            <li>
              <button type="button" onClick={() => goTab('about')}>
                About Thakshila
              </button>
            </li>
            <li>
              <button type="button" onClick={() => goTab('contact')}>
                Contact Us
              </button>
            </li>
          </ul>
        </div>

        {/* Col 3: Portals */}
        <div className="footer-portals-col">
          <h4>Digital Portals</h4>
          <p>Access the online learning management system and Student E-Library portal:</p>
          <div className="footer-portal-btns">
            <a
              href={settings.lmsUrl || 'https://tcg.bluesmartschool.com/'}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-btn-system"
            >
              <ExternalLink size={16} />
              <span>{settings.lmsLabel || 'LMS'}</span>
            </a>

            <button
              type="button"
              onClick={onOpenLoginModal}
              className="footer-btn-app"
            >
              <LogIn size={16} />
              <span>{isAdmin ? 'Editor Mode Active' : 'Login'}</span>
            </button>

            {isAdmin && (
              <button
                type="button"
                onClick={onOpenEditSettingsModal}
                className="footer-btn-admin"
              >
                <Edit size={15} />
                <span>Edit Website Details</span>
              </button>
            )}
          </div>
        </div>

        {/* Col 4: Contact Us */}
        <div className="footer-contact-col">
          <h4>Contact Information</h4>
          <div className="footer-contact-item">
            <MapPin size={16} />
            <a
              href={settings.mapUrl || 'https://maps.app.goo.gl/atoGq8QgbxSFTxJz8'}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-map-link"
              title="Open location in Google Maps"
            >
              {settings.address || 'GM/ Thakshila College, Sribhodi Road, Gampaha.'}
            </a>
          </div>
          <div className="footer-contact-item">
            <Phone size={16} />
            <span>{settings.contactPhone || '0332224752'}</span>
          </div>
          <div className="footer-contact-item">
            <Mail size={16} />
            <span>{settings.contactEmail || 'gmthakshilav@gmail.com'}</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <span>
            © {new Date().getFullYear()} Thakshila College - Gampaha. All Rights Reserved.
          </span>
          <span>
            Designed & Developed By MWKR SITHUMINA Volunteer, UOM | TRCSL / Thakshila IT Unit
          </span>
        </div>
      </div>
    </footer>
  );
}
