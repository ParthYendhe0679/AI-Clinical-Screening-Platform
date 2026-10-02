"use client";
import { VoiceRecorder } from "@/components/features/care";
import { PageHead } from "@/components/ui";
import { useStore, getPatientForSession } from "@/store";
export default function Page() {
  const p = useStore(getPatientForSession);
  if (!p) return null;
  return <div><PageHead title="Doctor’s instructions" sub="Record the doctor’s advice (after asking permission) to get a care plan, reminders and the doctor’s voice at home." /><VoiceRecorder role="patient" patientIds={[{ id: p.id, name: p.name }]} /></div>;
}
