import { NextResponse } from "next/server";
import axios from "axios";

export const dynamic = 'force-dynamic'

export async function GET(request, context) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get("symbol") || "NIFTY";
    const url = `https://www.nseindia.com/api/option-chain-indices?symbol=${symbol}`;

    const res = await axios.get(url);
    const data = await res.data;

    return NextResponse.json({
      status: 200,
      message: "Success",
      isSuccess: 1,
      data: data || [],
    });
  } catch (err) {
    return NextResponse.json({ message: err, isSuccess: 0, data: [] });
  }
}
