import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const filename = formData.get('filename') as string || file.name;
        const folderType = formData.get('folderType') as string || 'photo'; // 'photo' or 'copy'

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Cloudinary handles buffer uploads via stream or base64. 
        // We'll use a Promise wrapper around upload_stream for cleaner async/await.

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Determine Folder
        let folder = 'passports/photos';
        if (folderType === 'copy') folder = 'passports/copies';
        else if (folderType === 'adhar') folder = 'passports/adhar';
        else if (folderType === 'pancard') folder = 'passports/pancard';
        else if (folderType === 'passbook') folder = 'passports/passbook';
        else if (folderType === 'medical') folder = 'passports/medical';

        // Check if PDF
        const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';

        // Public ID handling:
        // For PDFs, we generally want to treat them as 'raw' or keep the extension so they are served correctly.
        // For Images, Cloudinary manages extension, so we strip it from public_id.
        const publicId = isPdf ? filename : filename.replace(/\.[^/.]+$/, "");

        const result: any = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: folder,
                    public_id: publicId,
                    resource_type: 'auto', // Auto allows PDF to be detected as raw/image
                    overwrite: true,
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(buffer);
        });

        return NextResponse.json({
            success: true,
            fileId: result.public_id,
            webViewLink: result.secure_url, // Keep key 'webViewLink' for frontend compatibility
        });

    } catch (error: any) {
        console.error('Upload Error:', error);
        return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const body = await request.json();
        const { url, publicId } = body;

        if (!url && !publicId) {
            return NextResponse.json({ error: 'URL or Public ID is required' }, { status: 400 });
        }

        let idToDelete = publicId;

        // Extract Public ID from URL if not provided directly
        if (!idToDelete && url) {
            // Regex to extract path after upload/(v...)/
            const regex = /\/upload\/(?:v\d+\/)?(.+)$/;
            const match = url.match(regex);

            if (match && match[1]) {
                const captured = match[1]; // e.g., "folder/file.jpg" or "folder/file.pdf"

                // If PDF, we likely kept the extension in public_id (from POST change above).
                // If Image, we likely stripped it.
                if (captured.toLowerCase().endsWith('.pdf')) {
                    idToDelete = captured;
                } else {
                    // Strip extension for images
                    idToDelete = captured.replace(/\.[^/.]+$/, "");
                }
            } else {
                return NextResponse.json({ error: 'Invalid Cloudinary URL' }, { status: 400 });
            }
        }

        const result = await cloudinary.uploader.destroy(idToDelete);

        return NextResponse.json({ success: true, result });
    } catch (error: any) {
        console.error('Delete Error:', error);
        return NextResponse.json({ error: error.message || 'Delete failed' }, { status: 500 });
    }
}
