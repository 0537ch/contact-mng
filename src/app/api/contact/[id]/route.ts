import { getDb, type Contact } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sql = getDb();
    const { id } = await params;

    const contacts = await sql<Contact[]>`
      SELECT
        c.*,
        parent.name as parent_name,
        parent.email as parent_email
      FROM contacts c
      LEFT JOIN contacts parent ON c.parent_id = parent.id
      WHERE c.id = ${id}
    `;

    if (!contacts || contacts.length === 0) {
      return NextResponse.json(
        { error: "Contact not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(contacts[0]);

  } catch (error) {
    console.error("error fetching contact: ", error);
    return NextResponse.json(
      { error: "Failed to fetch contact" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sql = getDb();
    const { id } = await params;
    const body = await request.json();

    const { name, email, phone, address, nik, npwp, is_company, is_coordinator, parent_id } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const result = await sql`
      UPDATE contacts
      SET
        name = ${name},
        email = ${email || null},
        phone = ${phone || null},
        address = ${address || null},
        nik = ${nik || null},
        npwp = ${npwp || null},
        is_company = ${is_company || false},
        is_coordinator = ${is_coordinator || false},
        parent_id = ${parent_id || null}
      WHERE id = ${id}
      RETURNING *
    `;

    if (!result || result.length === 0) {
      return NextResponse.json(
        { error: "Contact not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);

  } catch (error) {
    console.error("error updating contact: ", error);
    return NextResponse.json(
      { error: "Failed to update contact" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sql = getDb();
    const { id } = await params;

    // Check if contact exists
    const existing = await sql`SELECT id FROM contacts WHERE id = ${id}`;

    if (!existing || existing.length === 0) {
      return NextResponse.json(
        { error: "Contact not found" },
        { status: 404 }
      );
    }

    // Check if this contact is a parent to other contacts
    const children = await sql`
      SELECT COUNT(*) as count FROM contacts WHERE parent_id = ${id}
    `;

    if (children[0].count > 0) {
      return NextResponse.json(
        { error: "Cannot delete contact that has child contacts. Please reassign or delete children first." },
        { status: 400 }
      );
    }

    await sql`DELETE FROM contacts WHERE id = ${id}`;

    return NextResponse.json(
      { message: "Contact deleted successfully" },
      { status: 200 }
    );

  } catch (error) {
    console.error("error deleting contact: ", error);
    return NextResponse.json(
      { error: "Failed to delete contact" },
      { status: 500 }
    );
  }
}
