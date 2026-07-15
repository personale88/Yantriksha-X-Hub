import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { verifyAuth } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save locally under public/uploads
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Ensure upload directory exists
    await mkdir(uploadDir, { recursive: true });

    // Generate clean unique filename
    const fileExtension = path.extname(file.name);
    const fileNameWithoutExt = path.basename(file.name, fileExtension).replace(/[^a-zA-Z0-9]/g, '_');
    const uniqueFileName = `${Date.now()}_${fileNameWithoutExt}${fileExtension}`;
    const filePath = path.join(uploadDir, uniqueFileName);

    await writeFile(filePath, buffer);
    console.log(`File uploaded successfully to: ${filePath}`);

    const fileUrl = `/uploads/${uniqueFileName}`;

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      fileUrl
    });
  } catch (err: any) {
    console.error('Error during file upload:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
