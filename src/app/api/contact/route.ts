import { getDb, type Contact } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const sql = getDb();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    let whereClause = sql``;
    if (type === 'company') {
      whereClause = sql`WHERE c.is_company = true`;
    }

    const contacts = await sql<Contact[]>`
      SELECT
        c.*,
        parent.name as parent_name,
        parent.email as parent_email
      FROM contacts c
      LEFT JOIN contacts parent ON c.parent_id = parent.id
      ${whereClause}
      ORDER BY c.name ASC
    `;

    return NextResponse.json(contacts);

  } catch (error) {
    console.error("error fetching contacts: ", error);
    return NextResponse.json(
      { error: "Failed to fetch contacts" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const sql = getDb();
    const body = await request.json();

    const { name, email, phone, address, nik, npwp, is_company, is_coordinator, parent_id } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO contacts (name, email, phone, address, nik, npwp, is_company, is_coordinator, parent_id)
      VALUES (
        ${name},
        ${email || null},
        ${phone || null},
        ${address || null},
        ${nik || null},
        ${npwp || null},
        ${is_company || false},
        ${is_coordinator || false},
        ${parent_id || null}
      )
      RETURNING *
    `;

    return NextResponse.json(result[0], { status: 201 });

  } catch (error) {
    console.error("error creating contact: ", error);
    return NextResponse.json(
      { error: "Failed to create contact" },
      { status: 500 }
    );
  }
}
