import React from "react";
import "../styles/LandingPage/PrivacyPolicy.css";

const PrivacyPolicy = () => {
  const lastUpdatedDate = "April 4, 2026";
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
          Welcome to Next Chapter! Your privacy is important to us. This Privacy
          Policy explains how we collect, use, and protect your information when
          you use our platform.
        </p>

        {/* Academic Project Disclaimer */}
        <div className="privacy-disclaimer">
          <p>
            <strong>Academic Project Disclosure:</strong> This application is a
            capstone project for {universityName}. Data collected is for
            educational and demonstration purposes. Please be aware of the
            project nature and its limitations compared to commercial platforms.
          </p>
        </div>

        {/* 1. Information We Collect */}
        <section className="privacy-section">
          <h2>1. Information We Collect</h2>
          <p>
            We collect information necessary to provide and improve our
            services. This includes:
            <div className="feature-descriptions">
              <ul>
                <li>
                  <strong>Account Information:</strong> email, username, and
                  encrypted password
                </li>
                <li>
                  <strong>Reading Data:</strong> books added to lists, reading
                  progress, ratings, and reviews
                </li>
                <li>
                  <strong>User-generated Content:</strong> reviews, book
                  recommendations to friends, and profile customizations
                </li>
                <li>
                  <strong>Technical Data:</strong> IP address, browser type,
                  device information, and cookies used for authentication
                </li>
              </ul>
            </div>
          </p>
        </section>

        {/* 2. How We Use Your Information */}
        <section className="privacy-section">
          <h2>2. How We Use Your Information</h2>
          <p>
            We use your data to provide and maintain Next Chapter's features.
            This includes:
          </p>
          <div className="feature-descriptions">
            <ul>
              <li>
                Personalizing book recommendations based on your reading history
              </li>
              <li>
                Enabling community features such as badges, friend connections,
                and sharing book recommendations
              </li>
              <li>Track your reading progress</li>
              <li>Improving the overall user experience</li>
            </ul>
          </div>
        </section>

        {/* 3. Third-Party Services */}
        <section className="privacy-section">
          <h2>3. Third-Party Services</h2>
          <p>
            Next Chapter integrates with third-party services to enhance
            functionality. For example:
          </p>
          <div className="feature-descriptions">
            <ul>
              <li>
                <strong>Google Books API:</strong> used to search for and
                display public book information. We do{" "}
                <strong>NOT share your personal data </strong>
                with this service beyond what is necessary for the feature to
                work.
              </li>
              <li>
                <strong>AWS Cognito:</strong> used for authentication and user
                account management. Cognito securly handles your account
                information (such as <strong>email</strong>,{" "}
                <strong>username</strong>, and{" "}
                <strong> encrypted password</strong>) to allow you to log in and
                access your data. We do{" "}
                <strong>NOT share your personal data</strong> with AWS beyond
                what is necessary for authentication.
              </li>
            </ul>
          </div>
        </section>

        {/* 4. Data Sharing and Disclosure */}
        <section className="privacy-section">
          <h2>4. Data Sharing and Disclosure</h2>
          <p>
            Next Chapter respects your privacy and controls how your information
            is shared:
          </p>
          <div className="feature-descriptions">
            <ul>
              <li>
                <strong>Public Information:</strong> your username, public
                profile, and book reviews are visible to other users
              </li>
              <li>
                <strong>Private Information:</strong> email, password, and lists
                marked as private remain confidential
              </li>
              <li>
                <strong>Friends-only Visibility:</strong> reading progress and
                reviews are visible to confirmed friends based on your privacy
                settings
              </li>
              <li>
                <strong>No selling of data:</strong> we do{" "}
                <strong>NOT sell your data</strong> to any third parties
              </li>
            </ul>
          </div>
        </section>

        {/* 5. Data Security */}
        <section className="privacy-section">
          <h2>5. Data Security</h2>
          <p>
            We take the security of your information seriously and use
            industry-standard measures to protect it, including:
          </p>
          <div className="feature-descriptions">
            <ul>
              <li>
                <strong>Encryption:</strong> all passwords are securely
                encrypted
              </li>
              <li>
                <strong>Secure Connections:</strong> all data is transmitted
                over HTTPS
              </li>
              <li>
                <strong>Access Controls:</strong> only the development team can
                access user data when necessary for maintenance
              </li>
              <li>
                <strong>Regular Audits:</strong> security is reviewed regularly
                during development
              </li>
            </ul>
          </div>
        </section>

        {/* 6. User Rights */}
        <section className="privacy-section">
          <h2>6. User Rights</h2>
          <p>
            You have full control over your personal data. This includes the
            ability to:
          </p>
          <div className="feature-descriptions">
            <ul>
              <li>
                <strong>View, edit, or delete your information</strong> through
                your profile settings
              </li>
              <li>
                <strong>Manage privacy settings</strong> for your reading lists
                and activity
              </li>
              <li>
                <strong>Choose your profile visibility</strong> by making your
                profile public or private
              </li>
            </ul>
          </div>
        </section>

        {/* 7. Data Retention */}
        <section className="privacy-section">
          <h2>7. Data Retention</h2>
          <p>We retain your account data as long as your account is active.</p>
          <div className="feature-descriptions">
            <ul>
              <li>
                <strong>Deleted Accounts:</strong> all personal data is
                permanently removed from our systems within 30 days
              </li>
              <li>
                <strong>Anonymized Data:</strong> some data may be retained in
                anonymized form for general platform analytics
              </li>
            </ul>
          </div>
        </section>

        {/* 8. Cookies and Tracking */}
        <section className="privacy-section">
          <h2>8. Cookies and Tracking</h2>
          <p>Next Chapter uses cookies to enhance your experience.</p>
          <div className="feature-descriptions">
            <ul>
              <li>
                <strong>Essential Cookies:</strong> required for authentication
                and session management
              </li>
              <li>
                <strong>Analytical Cookies:</strong> used to improve the
                platform and user experience; you can choose to opt out at any
                time
              </li>
            </ul>
          </div>
        </section>

        {/* 9. Children's Privacy */}
        <section className="privacy-section">
          <h2>9. Children's Privacy</h2>
          <p>Next Chapter is intended for users aged 13 and older.</p>
          <div className="feature-descriptions">
            <ul>
              <li>We recommend parental consent for users under 18</li>
              <li>
                If we learn that personal data from anyone under 13 has been
                collected without parental consent, we will{" "}
                <strong>promptly remove that information</strong>
              </li>
            </ul>
          </div>
        </section>

        {/* 10. Contact Information */}
        <section className="privacy-section contact-section">
          <h2>10. Contact Us</h2>
          <p>
            If you have any questions or concerns regarding this Privacy Policy,
            your data, or data requests, please reach out through your account
            settings or the support page within the application.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
