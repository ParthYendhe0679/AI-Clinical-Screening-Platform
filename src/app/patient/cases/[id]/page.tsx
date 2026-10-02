"use client";
import { use } from "react";
import { PatientCaseDetail } from "@/components/features/patient-pages";
export default function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = use(params); return <PatientCaseDetail id={id} />; }
