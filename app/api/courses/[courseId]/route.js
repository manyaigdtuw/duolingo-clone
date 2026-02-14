import { NextResponse } from "next/server";

import db from "@/db/index";
import { getIsAdmin } from "@/lib/admin";

export const GET = async (_req, { params }) => {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const { rows } = await db.query("SELECT * FROM courses WHERE id = $1", [
    params.courseId,
  ]);
  const data = rows[0];

  return NextResponse.json(data);
};

export const PUT = async (req, { params }) => {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const body = await req.json();
  const { rows } = await db.query(
    "UPDATE courses SET title = $1, image_src = $2 WHERE id = $3 RETURNING *",
    [body.title, body.imageSrc, params.courseId]
  );
  const data = rows[0];

  return NextResponse.json(data);
};

export const DELETE = async (_req, { params }) => {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const { rows } = await db.query(
    "DELETE FROM courses WHERE id = $1 RETURNING *",
    [params.courseId]
  );
  const data = rows[0];

  return NextResponse.json(data);
};
