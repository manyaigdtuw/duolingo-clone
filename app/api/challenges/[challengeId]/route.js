import { NextResponse } from "next/server";

import db from "@/db/index";
import { getIsAdmin } from "@/lib/admin";

export const GET = async (_req, { params }) => {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const { rows } = await db.query("SELECT * FROM challenges WHERE id = $1", [
    params.challengeId,
  ]);
  const data = rows[0];

  return NextResponse.json(data);
};

export const PUT = async (req, { params }) => {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const body = await req.json();
  const { rows } = await db.query(
    'UPDATE challenges SET lesson_id = $1, type = $2, question = $3, "order" = $4 WHERE id = $5 RETURNING *',
    [body.lessonId, body.type, body.question, body.order, params.challengeId]
  );
  const data = rows[0];

  return NextResponse.json(data);
};

export const DELETE = async (_req, { params }) => {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const { rows } = await db.query(
    "DELETE FROM challenges WHERE id = $1 RETURNING *",
    [params.challengeId]
  );
  const data = rows[0];

  return NextResponse.json(data);
};
