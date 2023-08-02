import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(request, context) {
    try {
        const body = await request.json();
        const url = `https://tradingtick.com/api/options`;

        const res = await axios.post(url, body);
        console.log("checking at line 7 ", res);
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
