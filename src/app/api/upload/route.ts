import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No se envió ningún archivo de imagen' }, { status: 400 });
    }

    const imgbbKey = process.env.IMGBB_API_KEY;

    if (imgbbKey) {
      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = buffer.toString('base64');

        const uploadFormData = new FormData();
        uploadFormData.append('image', base64);
        uploadFormData.append('name', file.name.replace(/\.[^/.]+$/, ''));

        const imgbbRes = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, {
          method: 'POST',
          body: uploadFormData,
        });

        if (imgbbRes.ok) {
          const imgbbData = await imgbbRes.json();
          if (imgbbData.success && imgbbData.data?.url) {
            return NextResponse.json({
              success: true,
              url: imgbbData.data.url,
              display_url: imgbbData.data.display_url,
              thumb_url: imgbbData.data.thumb?.url || imgbbData.data.url,
              delete_url: imgbbData.data.delete_url,
              provider: 'ImgBB Cloud CDN',
            });
          }
        } else {
          console.warn('[ImgBB Upload API] Respuesta fallida de ImgBB:', await imgbbRes.text());
        }
      } catch (imgbbErr) {
        console.warn('[ImgBB Upload API] Error al conectar con ImgBB:', imgbbErr);
      }
    }

    // Fallback: Si no hay API key o falló ImgBB, devolver como base64 data url para no romper el flujo
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = file.type || 'image/jpeg';
    const dataUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;

    return NextResponse.json({
      success: true,
      url: dataUrl,
      provider: 'Local Memory DataURL',
    });
  } catch (error: any) {
    console.error('Error en /api/upload:', error);
    return NextResponse.json({ error: error.message || 'Error al procesar subida de imagen' }, { status: 500 });
  }
}
