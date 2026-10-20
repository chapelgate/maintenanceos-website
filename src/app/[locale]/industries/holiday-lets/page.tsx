import { IndustryRolePage } from "@/components/IndustryRolePage";
import { getIndustryRole } from "@/config/industries";
import { industryRoleMetadata } from "@/lib/page-meta";
import { notFound } from "next/navigation";

const role = getIndustryRole("holiday-lets");

export const metadata = industryRoleMetadata(role);

export default function Page() {
  if (!role) notFound();
  return <IndustryRolePage role={role} />;
}
