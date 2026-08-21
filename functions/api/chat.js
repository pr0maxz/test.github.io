const ADMIN_PASS_FALLBACK = '@dm1n';

function getValidAdminPass(context) {
    return context.env.ADMIN_PASS || ADMIN_PASS_FALLBACK;
}

export async function onRequestGet(context) {
    try {
        const { results } = await context.env.DB.prepare(
            'SELECT * FROM messages ORDER BY timestamp DESC LIMIT 50'
        ).all();

        return new Response(JSON.stringify(results), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: 'System Offline' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function onRequestPost(context) {
    try {
        const body = await context.request.json().catch(() => ({}));
        const name = typeof body.name === 'string' ? body.name.trim() : '';
        const message = typeof body.message === 'string' ? body.message.trim() : '';
        const adminPass = body.adminPass;

        if (name.toUpperCase() === 'PROMAXZ' && adminPass !== getValidAdminPass(context)) {
            return new Response(JSON.stringify({ error: 'DENIED: รหัสผ่านไม่ถูกต้อง' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (!name || !message) {
            return new Response(JSON.stringify({ error: 'DENIED: ข้อมูลไม่ครบ' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        await context.env.DB.prepare(
            'INSERT INTO messages (name, message, timestamp) VALUES (?, ?, ?)'
        ).bind(name, message, new Date().toISOString()).run();

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function onRequestDelete(context) {
    try {
        const body = await context.request.json().catch(() => ({}));
        const { id, adminPass } = body;

        if (adminPass !== getValidAdminPass(context)) {
            return new Response(JSON.stringify({ error: 'DENIED: รหัสผ่านแอดมินลับไม่ถูกต้อง' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        await context.env.DB.prepare('DELETE FROM messages WHERE id = ?').bind(id).run();

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}