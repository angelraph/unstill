import type { Metadata } from "next";

import { ClientStudio } from "@/components/studio/ClientStudio";

export const metadata: Metadata = {
  title: "Studio · UNSTILL",
};

export default function StudioPage() {
  return <ClientStudio />;
}
