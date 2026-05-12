import { SUPPORTED_CITIES } from "@/lib/constants";
import { notFound } from "next/navigation";
import ResultsClient from "./results-client";

export async function generateMetadata({ params }) {
  const { city } = await params;
  const cityData = SUPPORTED_CITIES.find((c) => c.id === city);
  if (!cityData) return { title: "Not Found" };

  return {
    title: `Cafe Unik di ${cityData.label} — WFC Cafe Finder`,
    description: `Temukan cafe unik dan hidden gem untuk WFC di ${cityData.label}`,
  };
}

export default async function ResultsPage({ params }) {
  const { city } = await params;
  const cityData = SUPPORTED_CITIES.find((c) => c.id === city);

  if (!cityData) {
    notFound();
  }

  return <ResultsClient city={city} cityData={cityData} />;
}
