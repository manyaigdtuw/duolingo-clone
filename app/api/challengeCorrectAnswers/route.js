import { NextResponse } from "next/server";

import db from "@/db/index";
import { getIsAdmin } from "@/lib/admin";

export const GET = async () => {
    const isAdmin = await getIsAdmin();
    if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

    const { rows: data } = await db.query("SELECT * FROM challenge_correct_answers");

    return NextResponse.json(data);
};

export const POST = async (req) => {
    const isAdmin = await getIsAdmin();
    if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

    const body = await req.json();

    const { rows: data } = await db.query(
        "INSERT INTO challenge_correct_answers (challenge_id, answer, is_case_sensitive) VALUES ($1, $2, $3) RETURNING *",
        [body.challengeId, body.answer, body.isCaseSensitive || false]
    );

    return NextResponse.json(data[0]);
};
