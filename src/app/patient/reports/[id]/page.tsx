"use client";
import { use } from "react";
import { PatientReportPage } from "@/components/features/patient-pages";
export default function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = use(params); return <PatientReportPage id={id} />; }
