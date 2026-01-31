import { NextResponse } from "next/server";

import db from "@/db/index";
import { getIsAdmin } from "@/lib/admin";

export const GET = async (_req, { params }) => {
    const isAdmin = await getIsAdmin();
    if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

    const { rows } = await db.query(
        "SELECT * FROM challenge_correct_answers WHERE id = $1",
        [params.challengeCorrectAnswerId]
    );
    const data = rows[0];

    return NextResponse.json(data);
};

export const PUT = async (req, { params }) => {
    const isAdmin = await getIsAdmin();
    if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

    const body = await req.json();
    const { rows } = await db.query(
        "UPDATE challenge_correct_answers SET challenge_id = $1, answer = $2, is_case_sensitive = $3 WHERE id = $4 RETURNING *",
        [
            body.challengeId,
            body.answer,
            body.isCaseSensitive || false,
            params.challengeCorrectAnswerId,
        ]
    );
    const data = rows[0];

    return NextResponse.json(data);
};

export const DELETE = async (_req, { params }) => {
    const isAdmin = await getIsAdmin();
    if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

    const { rows } = await db.query(
        "DELETE FROM challenge_correct_answers WHERE id = $1 RETURNING *",
        [params.challengeCorrectAnswerId]
    );
    const data = rows[0];

    return NextResponse.json(data);
};
