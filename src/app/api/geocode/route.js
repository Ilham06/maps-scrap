import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json({ error: "lat and lng required" }, { status: 400 });
  }

  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
    { headers: { "User-Agent": "WFC-Cafe-Finder/1.0" } }
  );

  if (!res.ok) {
    return NextResponse.json({ error: "Geocoding failed" }, { status: 500 });
  }

  const data = await res.json();
  const addr = data.address || {};

  let cityName =
    addr.city ||
    addr.town ||
    addr.municipality ||
    addr.county ||
    addr.state ||
    null;

  if (!cityName) {
    return NextResponse.json({ error: "City not found" }, { status: 404 });
  }

  // Strip Indonesian admin prefixes (Kota, Kabupaten, Daerah Istimewa)
  cityName = cityName.replace(/^(Kota|Kabupaten|Daerah Istimewa)\s+/i, "").trim();

  const slug = cityName.toLowerCase().replace(/\s+/g, "-");

  return NextResponse.json({ city: cityName, slug });
}
