import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const { userId, location } = await request.json()

    if (!userId || !location) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Update location in Supabase
    const { error } = await supabase
      .from("user_location")
      .upsert({
        user_id: userId,
        state: location.state,
        district: location.district,
        mp_constituency: location.mp_constituency,
        assembly_constituency: location.assembly_constituency,
        mandal: location.mandal,
        village: location.village,
        ward: location.ward,
        pincode: location.pincode,
        latitude: location.latitude,
        longitude: location.longitude,
        last_updated: new Date().toISOString()
      })

    if (error) {
      console.error("Error updating location:", error)
      return NextResponse.json(
        { error: "Failed to update location" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in location update:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 