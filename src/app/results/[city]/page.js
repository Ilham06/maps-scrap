import { getCityData } from "@/lib/constants";
import ResultsClient from "./results-client";

export async function generateMetadata({ params }) {
  const { city } = await params;
  const cityData = getCityData(city);

  return {
    title: `Cafe Unik di ${cityData.label} — WFC Cafe Finder`,
    description: `Temukan cafe unik dan hidden gem untuk WFC di ${cityData.label}`,
  };
}

export default async function ResultsPage({ params }) {
  const { city } = await params;
  const cityData = getCityData(city);

  return <ResultsClient city={city} cityData={cityData} />;
}
