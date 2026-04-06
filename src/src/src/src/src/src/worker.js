export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // Konfigurimi
    const ALLOWED_KEYS = env.ALLOWED_KEYS ? env.ALLOWED_KEYS.split(',') : [];
    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    
    // Endpoint: POST /upload/:key
    if (path.startsWith('/upload/') && request.method === 'POST') {
      const key = path.split('/')[2];
      
      // Kontrollo API key
      if (!ALLOWED_KEYS.includes(key)) {
        return new Response(JSON.stringify({ error: 'API key i pavlefshëm' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Kontrollo Content-Type
      const contentType = request.headers.get('Content-Type');
      if (!contentType || !contentType.startsWith('multipart/form-data')) {
        return new Response(JSON.stringify({ error: 'Duhet të dërgoni multipart/form-data' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Përpunimi i multipart form data
      const bodyText = await request.text();
      const boundary = contentType.split('boundary=')[1];
      const parts = bodyText.split(`--${boundary}`);
      
      let filename = 'upload';
      let fileData = null;
      
      for (const part of parts) {
        if (part.includes('Content-Disposition')) {
          const filenameMatch = part.match(/filename="([^"]+)"/);
          if (filenameMatch) {
            filename = filenameMatch[1];
          }
        }
        
        if (part.startsWith('Content-Type:')) {
          continue;
        }
        
        if (!part.startsWith('Content-')) {
          fileData = part.trim();
        }
      }
      
      if (!fileData) {
        return new Response(JSON.stringify({ error: 'Asnjë file nuk u gjet' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Upload në R2
      const objectKey = `events/${key}/${filename}`;
      await env.R2_BUCKET.put(objectKey, fileData, {
        httpMetadata: {
          contentType: contentType
        }
      });
      
      return new Response(JSON.stringify({
        success: true,
        key: objectKey,
        message: 'Upload u bë me sukses',
        downloadUrl: `https://${env.R2_PUBLIC_URL}/${objectKey}`
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Endpoint: GET /list/:key
    if (path.startsWith('/list/') && request.method === 'GET') {
      const key = path.split('/')[2];
      
      if (!ALLOWED_KEYS.includes(key)) {
        return new Response(JSON.stringify({ error: 'API key i pavlefshëm' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      const list = await env.R2_BUCKET.list({ prefix: `events/${key}/` });
      
      const files = list.objects.map(obj => ({
        key: obj.key,
        size: obj.size,
        uploaded: obj.uploaded,
        etag: obj.etag
      }));
      
      return new Response(JSON.stringify({
        success: true,
        key: key,
        count: files.length,
        files: files
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Endpoint: DELETE /delete/:key/:filename
    if (path.startsWith('/delete/') && request.method === 'DELETE') {
      const key = path.split('/')[2];
      const filename = path.split('/')[3];
      
      if (!ALLOWED_KEYS.includes(key)) {
        return new Response(JSON.stringify({ error: 'API key i pavlefshëm' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      const objectKey = `events/${key}/${filename}`;
      await env.R2_BUCKET.delete(objectKey);
      
      return new Response(JSON.stringify({
        success: true,
        message: 'File u fshi me sukses'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ error: 'Endpoint i pavlefshëm' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
