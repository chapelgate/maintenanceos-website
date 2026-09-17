import { IndustryStubPage } from "@/components/IndustryStubPage";

export const metadata = { title: "Holiday lets" };

export default function Page() {
  return (
    <IndustryStubPage
      title="Holiday lets"
      audience="For holiday-let operators coordinating turnaround and reactive maintenance."
      focus={[
    "Fast intake when guests or cleaners report issues",
    "Clear contractor handoff",
    "AI receptionist capability under testing for high-volume messaging — no capacity claims"
  ]}
    />
  );
}
