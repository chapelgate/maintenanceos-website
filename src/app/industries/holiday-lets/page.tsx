import { IndustryRolePage } from "@/components/IndustryRolePage";
import { getIndustryRole } from "@/config/industries";
import { notFound } from "next/navigation";

const role = getIndustryRole("holiday-lets");

export const metadata = {
  title: role?.label ?? "Industries",
  description: role?.metaDescription,
};

export default function Page() {
  if (!role) notFound();
  return <IndustryRolePage role={role} />;
}
