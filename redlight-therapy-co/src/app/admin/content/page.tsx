import { requireAdmin } from "@/lib/auth";
import AdminForm from "@/components/admin/AdminForm";
import { Input, PageTitle, Panel } from "@/components/admin/ui";
import { saveContent } from "@/app/actions/admin";
import { getContent, getSocials } from "@/lib/settings";

export default async function ContentAdmin() {
  await requireAdmin();
  const [c, s] = await Promise.all([getContent(), getSocials()]);
  return (
    <>
      <PageTitle title="Website content" sub="Edit the main wording on the website. Changes go live when you save." />
      <AdminForm action={saveContent}>
        <Panel title="Homepage hero">
          <div className="space-y-4">
            <Input label="Small label above the headline" name="heroEyebrow" defaultValue={c.heroEyebrow} />
            <Input label="Headline" name="heroHeadline" defaultValue={c.heroHeadline} hint="Any word starting with “light” is shown in red." />
            <Input label="Supporting text" name="heroSubtext" defaultValue={c.heroSubtext} textarea rows={2} />
          </div>
        </Panel>
        <Panel title="Wholesale partnership section">
          <div className="space-y-4">
            <Input label="Headline" name="partnerHeadline" defaultValue={c.partnerHeadline} />
            <Input label="Text" name="partnerText" defaultValue={c.partnerText} textarea rows={3} />
          </div>
        </Panel>
        <Panel title="About us">
          <div className="space-y-4">
            <Input label="Introduction" name="aboutIntro" defaultValue={c.aboutIntro} textarea rows={3} />
            <Input label="Second paragraph" name="aboutBody" defaultValue={c.aboutBody} textarea rows={3} />
          </div>
        </Panel>
        <Panel title="Contact">
          <Input label="Contact introduction" name="contactIntro" defaultValue={c.contactIntro} textarea rows={2} />
          <input type="hidden" name="announcement" value={c.announcement} />
        </Panel>
        <Panel title="Social links (shown in the footer when filled in)">
          <div className="grid gap-4 sm:grid-cols-2">
            {(["instagram", "facebook", "tiktok", "linkedin", "youtube", "x"] as const).map((k) => (
              <Input key={k} label={k === "x" ? "X (Twitter)" : k[0].toUpperCase() + k.slice(1)} name={`social_${k}`} defaultValue={s[k]} hint="Full https:// address" />
            ))}
          </div>
        </Panel>
      </AdminForm>
    </>
  );
}
