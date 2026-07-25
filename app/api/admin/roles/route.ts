import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { logActivity } from '@/lib/logger';

async function checkAdmin(req: Request) {
  const session = await verifyAuth(req);
  if (!session || (session.role !== 'admin' && session.role !== 'superadmin')) {
    return null;
  }
  return session;
}

// GET /api/admin/roles - Fetch all roles
export async function GET(req: Request) {
  try {
    const session = await checkAdmin(req);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const roles = await query('SELECT id, name, description, permissions, created_at FROM core_roles ORDER BY name ASC');
    
    // Parse JSON permissions if returned as string
    const formattedRoles = roles.map((r: any) => {
      let permissions = r.permissions;
      if (typeof permissions === 'string') {
        try {
          permissions = JSON.parse(permissions);
        } catch (_) {}
      }
      return { ...r, permissions };
    });

    return NextResponse.json({ success: true, roles: formattedRoles });
  } catch (err: any) {
    console.error('[ROLES GET] Error:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/admin/roles - Create role
export async function POST(req: Request) {
  try {
    const session = await checkAdmin(req);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, permissions } = body;

    if (!name || !permissions) {
      return NextResponse.json({ success: false, error: 'Name and permissions are required' }, { status: 400 });
    }

    const nameClean = name.trim();
    const permissionsStr = typeof permissions === 'string' ? permissions : JSON.stringify(permissions);

    // Insert role
    await query(
      'INSERT INTO core_roles (name, description, permissions) VALUES (?, ?, ?)',
      [nameClean, description || '', permissionsStr]
    );

    const newRoles = await query('SELECT id FROM core_roles WHERE name = ?', [nameClean]);
    const roleId = newRoles[0]?.id;

    await logActivity(session.userId, session.email, session.role, session.email, `Created new core team role: ${nameClean}`, 'RBAC', 'Success');

    return NextResponse.json({
      success: true,
      message: `Role "${nameClean}" created successfully!`,
      roleId
    });
  } catch (err: any) {
    console.error('[ROLES POST] Error:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ success: false, error: 'A role with this name already exists.' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/admin/roles - Update role
export async function PUT(req: Request) {
  try {
    const session = await checkAdmin(req);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { id, name, description, permissions } = body;

    if (!id || !name || !permissions) {
      return NextResponse.json({ success: false, error: 'ID, name, and permissions are required' }, { status: 400 });
    }

    const nameClean = name.trim();
    const permissionsStr = typeof permissions === 'string' ? permissions : JSON.stringify(permissions);

    await query(
      'UPDATE core_roles SET name = ?, description = ?, permissions = ? WHERE id = ?',
      [nameClean, description || '', permissionsStr, id]
    );

    await logActivity(session.userId, session.email, session.role, session.email, `Updated core team role: ${nameClean}`, 'RBAC', 'Success');

    return NextResponse.json({
      success: true,
      message: `Role "${nameClean}" updated successfully!`
    });
  } catch (err: any) {
    console.error('[ROLES PUT] Error:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/admin/roles - Delete role
export async function DELETE(req: Request) {
  try {
    const session = await checkAdmin(req);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Role ID is required' }, { status: 400 });
    }

    const roles = await query('SELECT name FROM core_roles WHERE id = ?', [id]);
    if (!roles || roles.length === 0) {
      return NextResponse.json({ success: false, error: 'Role not found' }, { status: 404 });
    }

    const roleName = roles[0].name;

    await query('DELETE FROM core_roles WHERE id = ?', [id]);

    await logActivity(session.userId, session.email, session.role, session.email, `Deleted core team role: ${roleName}`, 'RBAC', 'Success');

    return NextResponse.json({
      success: true,
      message: `Role "${roleName}" has been successfully deleted.`
    });
  } catch (err: any) {
    console.error('[ROLES DELETE] Error:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
