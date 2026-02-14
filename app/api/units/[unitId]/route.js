import { NextResponse } from "next/server";

import db from "@/db/index";
import { getIsAdmin } from "@/lib/admin";

export const GET = async (_req, { params }) => {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const { rows } = await db.query("SELECT * FROM units WHERE id = $1", [
    params.unitId,
  ]);
  const data = rows[0];

  return NextResponse.json(data);
};

export const PUT = async (req, { params }) => {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const body = await req.json();
  const { rows } = await db.query(
    'UPDATE units SET title = $1, description = $2, course_id = $3, "order" = $4 WHERE id = $5 RETURNING *',
    [body.title, body.description, body.courseId, body.order, params.unitId]
  );
  const data = rows[0];

  return NextResponse.json(data);
};

export const DELETE = async (_req, { params }) => {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const { rows } = await db.query(
    "DELETE FROM units WHERE id = $1 RETURNING *",
    [params.unitId]
  );
  const data = rows[0];

  return NextResponse.json(data);
};
