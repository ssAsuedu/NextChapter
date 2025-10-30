// src/pages/PrivacyPolicy.jsx (or similar)
import React from 'react';
import '../styles/LandingPage/PrivacyPolicy.css'; // Make sure the path is correct

const PrivacyPolicy = () => {
    // Academic Project Specifics (Update these fields!)
    const lastUpdatedDate = "October 28, 2025";
    const universityName = "Arizona State University";

    return (
        <div className="policy-container">
            <header className="policy-header">
                <h1 className="h1-policy-title">Privacy Policy for Next Chapter</h1>
                <p className="policy-paragraph last-updated">
                    Last Updated: {lastUpdatedDate}
                </p>
                <p className="policy-paragraph">
                    Welcome to Next Chapter! Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information when you use our platform. Next Chapter is a capstone project developed by our student team at {universityName} to create a community-driven reading platform. By using Next Chapter, you agree to the terms outlined in this policy.
                </p>
            </header>

            {/* Academic Project Disclaimer */}
            <div className="disclaimer-box">
                <strong> Academic Project Disclosure:</strong> This application is a capstone project for {universityName}. Data collected is for educational and demonstration purposes. Please be aware of the project nature and its limitations compared to commercial platforms.
            </div>

            {/* 1. Information We Collect */}
            <section className="policy-section">
                <h2 className="h2-policy-heading">1. Information We Collect</h2>
                <p className="policy-paragraph">
                    We collect different types of information necessary to provide and improve our service:
                </p>
                <ul className="policy-list">
                    <li>Account Information: Email address, username, and password (stored using industry-standard encryption).</li>
                    <li>Reading Data: Books added to lists, reading progress, completed books, ratings, and reviews.</li>
                    <li>User-Generated Content: Forum posts, comments, mood boards, and profile customizations.</li>
                    <li>Technical Data: IP address, browser type, device information, and cookies for authentication and session management.</li>
                </ul>
            </section>

            {/* 2. How We Use Your Information */}
            <section className="policy-section">
                <h2 className="h2-policy-heading">2. How We Use Your Information</h2>
                <p className="policy-paragraph">
                    We use the collected data for the following primary purposes:
                </p>
                <ul className="policy-list">
                    <li>To provide and maintain the Next Chapter service and its features.</li>
                    <li>To personalize book recommendations based on your reading history and preferences.</li>
                    <li>To enable community functions (forums, friend connections, sharing).</li>
                    <li>To track reading progress and send optional milestone reminders.</li>
                    <li>To improve the functionality, user interface, and overall user experience of the platform.</li>
                </ul>
            </section>

            {/* 3. Third-Party Services */}
            <section className="policy-section">
                <h2 className="h2-policy-heading">3. Third-Party Services</h2>
                <p className="policy-paragraph">
                    Next Chapter integrates with external APIs to enhance functionality:
                </p>
                <ul className="policy-list">
                    <li>Google Books API: Used solely to search for and display public book information.</li>
                    <li>Pinterest API (Optional): Used only if you opt in to create and browse mood boards.</li>
                </ul>
                <p className="policy-paragraph">
                    Note: We do not share your personal data with these third-party services beyond the minimum necessary for the feature to function (e.g., sending a book title to Google Books API for a search).
                </p>
            </section>
            
            {/* 4. Data Sharing and Disclosure */}
            <section className="policy-section">
                <h2 className="h2-policy-heading">4. Data Sharing and Disclosure</h2>
                <ul className="policy-list">
                    <li>What's Public: Your username, public profile, book reviews, forum posts, and mood boards (if marked public) are visible to other users.</li>
                    <li>What's Private: Your email, password, private reading lists, and lists marked as private are kept confidential.</li>
                    <li>Friend Visibility: Your reading progress and reviews are visible to your confirmed friends, subject to your current privacy settings.</li>
                </ul>
                <p className="policy-paragraph">
                    We do NOT sell user data to any third parties.
                </p>
            </section>
            
            {/* 5. Data Security */}
            <section className="policy-section">
                <h2 className="h2-policy-heading">5. Data Security</h2>
                <p className="policy-paragraph">
                    We are committed to protecting your information through several measures:
                </p>
                <ul className="policy-list">
                    <li>Passwords are encrypted using industry-standard hashing before storage.</li>
                    <li>All data transmissions use secure HTTPS connections.</li>
                    <li>Regular (internal) security audits are performed as part of the project development process.</li>
                    <li>Access to user data is limited to the development team only when necessary for maintenance.</li>
                </ul>
            </section>
            
            {/* 6. User Rights */}
            <section className="policy-section">
                <h2 className="h2-policy-heading">6. User Rights</h2>
                <p className="policy-paragraph">
                    You maintain full control over your personal data:
                </p>
                <ul className="policy-list">
                    <li>Access & Edit: You can view, edit, or delete your personal data at any time through your profile settings.</li>
                    <li>Control: You can control privacy settings for your reading lists and activity.</li>
                    <li>Opt-Out: You can opt out of email notifications and reminders.</li>
                </ul>
            </section>

            {/* 7. Data Retention */}
            <section className="policy-section">
                <h2 className="h2-policy-heading">7. Data Retention</h2>
                <p className="policy-paragraph">
                    Account data is retained while your account remains active. Deleted accounts and associated personal data are permanently removed from our systems within 30 days. Some anonymized data may be retained for general platform analytics.
                </p>
            </section>
            
            {/* 8. Cookies and Tracking */}
            <section className="policy-section">
                <h2 className="h2-policy-heading">8. Cookies and Tracking</h2>
                <p className="policy-paragraph">
                    We use cookies for essential functions:
                </p>
                <ul className="policy-list">
                    <li>Cookies are used for authentication and session management (essential).</li>
                    <li>We may use optional analytics cookies to improve the user experience, and you will have an option to opt-out.</li>
                </ul>
            </section>

            {/* 9. Children's Privacy */}
            <section className="policy-section">
                <h2 className="h2-policy-heading">9. Children's Privacy</h2>
                <p className="policy-paragraph">
                    Our service is intended for users 13 and older. We recommend parental consent for users under 18. If we learn we have collected personal data from anyone under 13 without verification of parental consent, we will take steps to remove that information promptly.
                </p>
            </section>

            {/* 10. Contact Information */}
            <section className="policy-section">
                <h2 className="h2-policy-heading">10. Contact Information</h2>
                <p className="policy-paragraph contact-info">
                    If you have any questions or concerns regarding this Privacy Policy, your data, or data requests, please reach out through your account settings or the support page within the application.
                </p>
            </section>
        </div>
    );
};

export default PrivacyPolicy;