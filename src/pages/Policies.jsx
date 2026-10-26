import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, FileText, RotateCcw } from 'lucide-react';
import { SITE } from '../config/site';

const UPDATED = 'October 2026';

function Page({ icon: Icon, title, children }) {
  return (
    <div className="min-h-screen bg-cream-light dark:bg-temple-dark text-temple-900 pb-20">
      <div className="bg-temple-dark text-cream-light py-14 text-center border-b border-gold/20">
        <Icon size={34} className="mx-auto text-gold mb-3" />
        <h1 className="text-3xl md:text-4xl font-extrabold font-outfit text-white">{title}</h1>
        <p className="mt-2 text-xs font-semibold text-cream-light/70">Shree Jagannath Temple Sidheswar &middot; Last updated: {UPDATED}</p>
      </div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 mt-10">
        <div className="glass-card p-6 md:p-10 space-y-6 text-sm leading-relaxed font-medium text-temple-800">{children}</div>
        <div className="mt-6 flex flex-wrap gap-4 justify-center text-xs font-bold text-saffron">
          <Link to="/privacy-policy" className="hover:underline">Privacy Policy</Link>
          <Link to="/terms" className="hover:underline">Terms &amp; Conditions</Link>
          <Link to="/refund-policy" className="hover:underline">Refund &amp; Cancellation Policy</Link>
          <Link to="/contact" className="hover:underline">Contact us</Link>
        </div>
      </div>
    </div>
  );
}
const H = ({ children }) => <h2 className="text-lg font-extrabold font-outfit text-maroon pt-2">{children}</h2>;
const Contact = () => (
  <p>
    Shree Jagannath Temple Sidheswar, {SITE.address.replace('Shree Jagannath Temple Sidheswar, ', '')}.<br />
    Phone / WhatsApp: <a className="text-saffron font-bold" href={SITE.phoneTel}>{SITE.phoneDisplay}</a><br />
    Email: <a className="text-saffron font-bold break-all" href={SITE.emailLink}>{SITE.email}</a>
  </p>
);

export function PrivacyPolicy() {
  return (
    <Page icon={ShieldCheck} title="Privacy Policy">
      <p>This policy explains what information Shree Jagannath Temple Sidheswar (&ldquo;the temple&rdquo;, &ldquo;we&rdquo;) collects through this website, why, and how it is protected. By using the website you agree to this policy.</p>
      <H>1. Information we collect</H>
      <ul className="list-disc pl-5 space-y-1">
        <li><b>Account details:</b> name, email, mobile number and password (stored only in encrypted form), or your name, email and picture when you sign in with Google.</li>
        <li><b>Seva booking details:</b> devotee name, mobile, email, address, gotra, nakshatra, names of family members, sankalpa / special request, selected date and slot.</li>
        <li><b>Donation details:</b> donor name, mobile, email, PAN (only if you choose to enter it), amount and purpose.</li>
        <li><b>Alerts:</b> the mobile number or email you give to receive notices or live arati alerts.</li>
        <li><b>Messages and uploads:</b> grievance / contact messages and photos you upload to the gallery.</li>
      </ul>
      <H>2. Payments</H>
      <p>Online payments are processed by Razorpay. Your card, UPI or bank details are entered on Razorpay&rsquo;s secure window and are <b>never stored by the temple or this website</b>. We only receive the payment status, payment ID and amount.</p>
      <H>3. How we use your information</H>
      <ul className="list-disc pl-5 space-y-1">
        <li>To confirm and manage seva bookings and to issue donation receipts.</li>
        <li>To send booking updates, receipts, notices and live arati / pujan alerts by email, SMS or WhatsApp.</li>
        <li>To answer your queries and grievances, keep temple accounts, and prevent fraud or misuse.</li>
      </ul>
      <H>4. Who can see it</H>
      <p>Your details are visible only to the temple administrator and are not sold or rented to anyone. They are shared only with the service providers needed to run the website: Razorpay (payments), Google (sign-in, Maps, YouTube videos), our hosting and database providers, and the email / messaging providers used to send you messages. The public &ldquo;recent donations&rdquo; list shows only the donor name (or &ldquo;Anonymous Devotee&rdquo; if you choose anonymous), the amount and the purpose.</p>
      <H>5. Cookies</H>
      <p>We use one secure cookie to keep you logged in. Embedded Google Maps and YouTube players may set their own cookies under Google&rsquo;s policies.</p>
      <H>6. Keeping your data</H>
      <p>Records of bookings and donations are kept as long as needed for temple accounts and legal requirements. Passwords are never readable by anyone, including the temple staff.</p>
      <H>7. Your choices</H>
      <ul className="list-disc pl-5 space-y-1">
        <li>You can stop live arati alerts any time from the Live Darshan page or the unsubscribe link in any email.</li>
        <li>You can ask us to correct or delete your account details by writing to us (details below). Some payment records must be kept for accounting.</li>
      </ul>
      <H>8. Children</H>
      <p>The website is meant for devotees and families; we do not knowingly collect information from children without a parent or guardian.</p>
      <H>9. Changes</H>
      <p>We may update this policy; the date above shows the latest version.</p>
      <H>10. Contact</H>
      <Contact />
    </Page>
  );
}

export function TermsConditions() {
  return (
    <Page icon={FileText} title="Terms &amp; Conditions">
      <p>Welcome to the official website of Shree Jagannath Temple Sidheswar. By using this website you agree to the following terms.</p>
      <H>1. Purpose of the website</H>
      <p>This website gives information about the temple, its rituals and festivals, and lets devotees book sevas, make donations and receive notices. Timings, tithi, nakshatra and festival dates are shown in good faith; panchang values are calculated by astronomical formulas and festival dates are <b>subject to confirmation by the temple committee</b>. In case of any difference, the temple&rsquo;s own announcement is final.</p>
      <H>2. Seva bookings</H>
      <ul className="list-disc pl-5 space-y-1">
        <li>Please give correct name, gotra, nakshatra and contact details. The temple is not responsible for results of wrong details.</li>
        <li>A booking is registered after successful payment and is confirmed by the temple office. The temple may cancel or reschedule a seva for reasons such as festivals, rituals or unavoidable circumstances; in that case the refund policy applies.</li>
        <li>Sevas are performed on behalf of the devotee as an offering. The temple does not promise any particular worldly result.</li>
      </ul>
      <H>3. Donations</H>
      <p>Donations are voluntary offerings made with devotion and are used for the temple&rsquo;s purposes (general needs, Anna Daan, temple development, festivals). Please see the Refund &amp; Cancellation Policy for exceptional cases.</p>
      <H>4. Your account</H>
      <p>Keep your login private. You are responsible for activity under your account. Do not upload photos or messages that are unlawful, offensive or that you do not have the right to share; the temple may remove such content.</p>
      <H>5. Safety from fraud</H>
      <p>Pay only through the payment options and contact numbers shown on this website. The temple is not responsible for payments made to any other person, number or website.</p>
      <H>6. Content and use</H>
      <p>The text, photographs and design of this website belong to the temple or are used with permission. Please do not copy or use them commercially without written permission. Photographs shared by devotees remain the responsibility of the person who uploaded them.</p>
      <H>7. Limits of responsibility</H>
      <p>We try to keep the website available and accurate, but we do not promise that it will always be free of errors or interruptions (for example, in live video, which depends on internet and YouTube). The temple is not liable for losses caused by events outside its control.</p>
      <H>8. Governing law</H>
      <p>These terms are governed by the laws of India.</p>
      <H>9. Contact</H>
      <Contact />
    </Page>
  );
}

export function RefundPolicy() {
  return (
    <Page icon={RotateCcw} title="Refund &amp; Cancellation Policy">
      <p>This policy explains when money paid on this website can be returned. All payments are made through Razorpay.</p>
      <H>1. Donations</H>
      <ul className="list-disc pl-5 space-y-1">
        <li>Donations are voluntary and are <b>not refundable</b> once the payment is successful.</li>
        <li>If you paid twice by mistake or an amount was charged because of a technical error, write to us within <b>7 days</b> with the payment ID and we will review it and refund the extra amount.</li>
      </ul>
      <H>2. Seva bookings</H>
      <ul className="list-disc pl-5 space-y-1">
        <li>If the <b>temple</b> cancels or cannot perform your booked seva, you will get a <b>full refund</b>.</li>
        <li>If <b>you</b> wish to cancel, contact the temple office with your Booking ID at least <b>24 hours before</b> the booked date and slot. Eligibility for a refund is decided by the temple committee.</li>
        <li>A seva that has been performed (marked completed) is not refundable.</li>
      </ul>
      <H>3. Failed or incomplete payments</H>
      <p>If money was deducted but the booking or receipt was not created, it is normally returned automatically to the same account by your bank within about 5&ndash;7 working days. If it is not, write to us with the payment ID and we will help.</p>
      <H>4. How refunds are paid</H>
      <p>Approved refunds go back to the original payment method (UPI, card or bank account). It usually reaches you within 5&ndash;7 working days after the refund is started, depending on your bank.</p>
      <H>5. How to ask for a refund</H>
      <p>Call or WhatsApp the temple office, or send an email, mentioning your name, mobile number, Booking ID / Receipt number and the payment ID.</p>
      <Contact />
    </Page>
  );
}
