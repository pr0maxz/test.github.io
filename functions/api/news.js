const ADMIN_PASS_FALLBACK = '@dm1n';

function getValidAdminPass(context) {
    return context.env.ADMIN_PASS || ADMIN_PASS_FALLBACK;
}

export async function onRequest(context) {
    const db = context.env.DB;
    const method = context.request.method;

    try {
        if (method === 'GET') {
            const { results } = await db.prepare('SELECT * FROM news ORDER BY id DESC').all();
            return Response.json(results);
        }

        const data = await context.request.json().catch(() => ({}));

        if (data.adminPass !== getValidAdminPass(context)) {
            return Response.json({ error: 'DENIED: รหัสผ่านไม่ถูกต้อง' }, { status: 403 });
        }

        if (method === 'POST') {
            await db.prepare(
                'INSERT INTO news (log_id, title, description, img_url, link) VALUES (?, ?, ?, ?, ?)'
            ).bind(data.log_id, data.title, data.description, data.img_url, data.link || '').run();

            return Response.json({ success: true });
        }

        if (method === 'PUT') {
            await db.prepare(
                'UPDATE news SET log_id=?, title=?, description=?, img_url=?, link=? WHERE id=?'
            ).bind(data.log_id, data.title, data.description, data.img_url, data.link || '', data.id).run();

            return Response.json({ success: true });
        }

        if (method === 'DELETE') {
            await db.prepare('DELETE FROM news WHERE id=?').bind(data.id).run();
            return Response.json({ success: true });
        }

        return Response.json({ error: 'Method not allowed' }, { status: 405 });
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}