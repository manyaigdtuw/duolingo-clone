import { NextResponse } from "next/server";

import db from "@/db/index";
import { getIsAdmin } from "@/lib/admin";

export const GET = async (_req, { params }) => {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const { rows } = await db.query("SELECT * FROM lessons WHERE id = $1", [
    params.lessonId,
  ]);
  const data = rows[0];

  return NextResponse.json(data);
};

export const PUT = async (req, { params }) => {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const body = await req.json();
  const { rows } = await db.query(
    "UPDATE lessons SET title = $1, unit_id = $2, order = $3 WHERE id = $4 RETURNING *",
    [body.title, body.unitId, body.order, params.lessonId]
  );
  const data = rows[0];

  return NextResponse.json(data);
};

export const DELETE = async (_req, { params }) => {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const { rows } = await db.query(
    "DELETE FROM lessons WHERE id = $1 RETURNING *",
    [params.lessonId]
  );
  const data = rows[0];

  return NextResponse.json(data);
};
