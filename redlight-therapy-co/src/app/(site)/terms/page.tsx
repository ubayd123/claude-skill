import type { Metadata } from "next";
import LegalPage from "@/components/layout/LegalPage";
import { BUSINESS_EMAIL } from "@/lib/site";

export const metadata: Metadata = { title: "Terms", alternates: { canonical: "/terms" } };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of use" updated="November 2026">
      <p><strong>Draft for review.</strong> Please have these terms checked before the website goes live.</p>
      <h2>About this website</h2>
      <p>This website presents the Redlight Therapy Co. wholesale range to business customers. It does not sell products online and does not take payment. Submitting an enquiry does not create a contract. Any order is agreed separately with you by email.</p>
      <h2>Trade accounts</h2>
      <p>Wholesale accounts are for businesses only and are approved at our discretion. Trade prices and trade terms shown in the account area are confidential and must not be shared or published.</p>
      <h2>Product information</h2>
      <p>We take care to describe products accurately, using our own catalogue and the documentation behind it. Product images are for illustration. Documentation summaries describe the samples tested and do not make or support any medical or health claim.</p>
      <h2>Prices</h2>
      <p>Prices, minimum order quantities and delivery terms are those on our current trade price list or in the quotation we send you, and may change.</p>
      <h2>Contact</h2>
      <p>Questions about these terms: {BUSINESS_EMAIL}.</p>
    </LegalPage>
  );
}
