const ADMIN_PASS_FALLBACK = '@dm1n';

function getValidAdminPass(context) {
    return context.env.ADMIN_PASS || ADMIN_PASS_FALLBACK;
}

export async function onRequestGet(context) {
    try {
        const { results } = await context.env.DB.prepare(
            'SELECT * FROM events ORDER BY id ASC'
        ).all();

        return new Response(JSON.stringify(results), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function onRequestPost(context) {
    try {
        const body = await context.request.json().catch(() => ({}));
        const { date, title, location, link, adminPass } = body;

        if (adminPass !== getValidAdminPass(context)) {
            return new Response(JSON.stringify({ error: 'DENIED: รหัสผ่านไม่ถูกต้อง' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        await context.env.DB.prepare(
            'INSERT INTO events (date, title, location, link) VALUES (?, ?, ?, ?)'
        ).bind(date, title, location, link).run();

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
            return new Response(JSON.stringify({ error: 'DENIED: รหัสผ่านไม่ถูกต้อง' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        await context.env.DB.prepare('DELETE FROM events WHERE id = ?').bind(id).run();

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

export async function onRequestPut(context) {
    try {
        const body = await context.request.json().catch(() => ({}));
        const { id, date, title, location, link, adminPass } = body;

        if (adminPass !== getValidAdminPass(context)) {
            return new Response(JSON.stringify({ error: 'DENIED: รหัสผ่านไม่ถูกต้อง' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        await context.env.DB.prepare(
            'UPDATE events SET date = ?, title = ?, location = ?, link = ? WHERE id = ?'
        ).bind(date, title, location, link, id).run();

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