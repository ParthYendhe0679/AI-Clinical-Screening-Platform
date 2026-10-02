"use client";
import { use } from "react";
import { DoctorCasePage } from "@/components/features/doctor-pages";
export default function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = use(params); return <DoctorCasePage id={id} />; }
