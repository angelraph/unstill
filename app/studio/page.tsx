import type { Metadata } from "next";

import { ClientStudio } from "@/components/studio/ClientStudio";

export const metadata: Metadata = {
  title: "Studio",
};

export default function StudioPage() {
  return <ClientStudio />;
}
