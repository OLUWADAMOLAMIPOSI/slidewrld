import SettingsForm from "@/components/SettingsForm";
import { readData } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  const data = await readData();

  return (
    <div>
      <h1 className="mb-8 text-2xl">Settings</h1>
      <SettingsForm settings={data.settings} />
    </div>
  );
}
