import { NextResponse } from "next/server";
import { SUPPORTED_CITIES } from "@/lib/constants";

export async function GET() {
  return NextResponse.json(SUPPORTED_CITIES);
}
