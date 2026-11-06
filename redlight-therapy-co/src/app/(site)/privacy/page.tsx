import type { Metadata } from "next";
import LegalPage from "@/components/layout/LegalPage";
import { BUSINESS_EMAIL } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy policy", alternates: { canonical: "/privacy" } };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy policy" updated="November 2026">
      <p><strong>Draft for review.</strong> Please have this policy checked against your business details (legal entity name, address and any ICO registration number) before the website goes live.</p>
      <h2>Who we are</h2>
      <p>This website is operated by Redlight Therapy Co. You can contact us about privacy at {BUSINESS_EMAIL}.</p>
      <h2>What we collect</h2>
      <ul>
        <li>Details you give us in enquiry, contact and wholesale application forms: name, business name, email, telephone, country, website, business type, products of interest, quantities and any notes.</li>
        <li>Account details for approved wholesale customers: email address, a securely hashed password and your business profile.</li>
        <li>A sign-in cookie for wholesale customers and administrators, which is strictly necessary for the account area to work.</li>
        <li>A keyed hash of your IP address, kept for a short period to prevent spam and abuse. We do not store raw IP addresses.</li>
        <li>Your enquiry list is kept in your own browser&apos;s local storage until you send it.</li>
      </ul>
      <h2>How we use it</h2>
      <ul>
        <li>To reply to your enquiries and prepare quotations (legitimate interests and steps before entering a contract).</li>
        <li>To review wholesale applications and run your trade account.</li>
        <li>To send transactional emails such as enquiry confirmations and password links. We do not send marketing emails from this website.</li>
      </ul>
      <h2>Who we share it with</h2>
      <p>We use a hosting provider, a database provider and a transactional email provider to run this website. They process data on our behalf. We do not sell your data.</p>
      <h2>How long we keep it</h2>
      <p>Enquiries and applications are kept for as long as needed to deal with them and for our business records. You can ask us to delete your data at any time.</p>
      <h2>Your rights</h2>
      <p>You can ask for a copy of your data, ask us to correct or delete it, or object to how we use it, by emailing {BUSINESS_EMAIL}. You can also complain to the Information Commissioner&apos;s Office (ico.org.uk).</p>
    </LegalPage>
  );
}
