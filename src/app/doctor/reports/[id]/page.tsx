"use client";
import { use } from "react";
import { DoctorReportPage } from "@/components/features/doctor-pages";
export default function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = use(params); return <DoctorReportPage id={id} />; }
