import React from 'react';
import '../styles/LandingPage/PrivacyPolicy.css';

const PrivacyPolicy = () => {
  const lastUpdatedDate = "October 28, 2025";
  const universityName = "Arizona State University";

  return (
    <div className="privacy-page">
      {/* Hero Section */}
      <section className="privacy-hero">
        <h1>Privacy Policy</h1>
        <p className="last-updated">Last Updated: {lastUpdatedDate}</p>
      </section>

      {/* Content */}
      <div className="privacy-content">
        <p className="privacy-intro">
          Welcome to Next Chapter! Your privacy is important to us. This Privacy Policy 
          explains how we collect, use, and protect your information when you use our platform.
        </p>

        {/* Academic Project Disclaimer */}
        <div className="privacy-disclaimer">
          <p>
            <strong>Academic Project Disclosure:</strong> This application is a capstone 
            project for {universityName}. Data collected is for educational and demonstration 
            purposes. Please be aware of the project nature and its limitations compared to 
            commercial platforms.
          </p>
        </div>

        {/* 1. Information We Collect */}
        <section className="privacy-section">
          <h2>1. Information We Collect</h2>
          <p>
            We collect information necessary to provide and improve our service. This includes 
            <strong> account information</strong> (email, username, and encrypted password), 
            <strong> reading data</strong> (books added to lists, progress, ratings, and reviews), 
            <strong> user-generated content</strong> (forum posts, comments, mood boards, and profile customizations), 
            and <strong> technical data</strong> (IP address, browser type, device information, and cookies for authentication).
          </p>
        </section>

        {/* 2. How We Use Your Information */}
        <section className="privacy-section">
          <h2>2. How We Use Your Information</h2>
          <p>
            We use your data to provide and maintain Next Chapter's features, personalize book 
            recommendations based on your reading history, enable community functions like forums 
            and friend connections, track your reading progress, and improve the overall user experience. 
            We may also send optional milestone reminders to help you achieve your reading goals.
          </p>
        </section>

        {/* 3. Third-Party Services */}
        <section className="privacy-section">
          <h2>3. Third-Party Services</h2>
          <p>
            Next Chapter integrates with the <strong>Google Books API</strong> to search for and display 
            public book information, and optionally with the <strong>Pinterest API</strong> if you choose 
            to create and browse mood boards. We do not share your personal data with these services 
            beyond the minimum necessary for functionality.
          </p>
        </section>

        {/* 4. Data Sharing and Disclosure */}
        <section className="privacy-section">
          <h2>4. Data Sharing and Disclosure</h2>
          <p>
            Your username, public profile, book reviews, forum posts, and public mood boards are visible 
            to other users. Your email, password, and lists marked as private remain confidential. 
            Reading progress and reviews are visible to confirmed friends based on your privacy settings. 
            <strong> We do NOT sell user data to any third parties.</strong>
          </p>
        </section>

        {/* 5. Data Security */}
        <section className="privacy-section">
          <h2>5. Data Security</h2>
          <p>
            We protect your information using industry-standard encryption for passwords, secure HTTPS 
            connections for all data transmissions, and regular security audits during development. 
            Access to user data is limited to the development team only when necessary for maintenance.
          </p>
        </section>

        {/* 6. User Rights */}
        <section className="privacy-section">
          <h2>6. User Rights</h2>
          <p>
            You maintain full control over your personal data. You can view, edit, or delete your 
            information at any time through your profile settings. You can also control privacy 
            settings for your reading lists and activity, and opt out of email notifications and reminders.
          </p>
        </section>

        {/* 7. Data Retention */}
        <section className="privacy-section">
          <h2>7. Data Retention</h2>
          <p>
            Account data is retained while your account remains active. Deleted accounts and associated 
            personal data are permanently removed from our systems within 30 days. Some anonymized data 
            may be retained for general platform analytics.
          </p>
        </section>

        {/* 8. Cookies and Tracking */}
        <section className="privacy-section">
          <h2>8. Cookies and Tracking</h2>
          <p>
            We use essential cookies for authentication and session management. We may also use optional 
            analytics cookies to improve the user experience, with an option to opt-out available to you.
          </p>
        </section>

        {/* 9. Children's Privacy */}
        <section className="privacy-section">
          <h2>9. Children's Privacy</h2>
          <p>
            Our service is intended for users 13 and older. We recommend parental consent for users 
            under 18. If we learn we have collected personal data from anyone under 13 without 
            verification of parental consent, we will take steps to remove that information promptly.
          </p>
        </section>

        {/* 10. Contact Information */}
        <section className="privacy-section contact-section">
          <h2>10. Contact Us</h2>
          <p>
            If you have any questions or concerns regarding this Privacy Policy, your data, or data 
            requests, please reach out through your account settings or the support page within the application.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;