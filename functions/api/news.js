export async function onRequestGet(context) {
    try {
        const { results } = await context.env.DB.prepare("SELECT * FROM news ORDER BY id DESC").all();
        return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json" } });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}

export async function onRequestPost(context) {
    try {
        const body = await context.request.json();
        const { log_id, title, description, img_url, adminPass } = body;

        if (adminPass !== "@dm1n") { // อย่าลืมเปลี่ยน "1234" เป็นรหัสผ่านแอดมินของคุณ
            return new Response(JSON.stringify({ error: "DENIED: รหัสผ่านไม่ถูกต้อง" }), { status: 403 });
        }

        const stmt = context.env.DB.prepare(
            "INSERT INTO news (log_id, title, description, img_url) VALUES (?, ?, ?, ?)"
        ).bind(log_id, title, description, img_url);
        
        await stmt.run();

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}

export async function onRequestPut(context) {
    try {
        const body = await context.request.json();
        const { id, log_id, title, description, img_url, adminPass } = body;

        if (adminPass !== "@dm1n") { // อย่าลืมเปลี่ยน "1234" เป็นรหัสผ่านแอดมินของคุณ
            return new Response(JSON.stringify({ error: "DENIED: รหัสผ่านไม่ถูกต้อง" }), { status: 403 });
        }

        const stmt = context.env.DB.prepare(
            "UPDATE news SET log_id = ?, title = ?, description = ?, img_url = ? WHERE id = ?"
        ).bind(log_id, title, description, img_url, id);
        
        await stmt.run();

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}

export async function onRequestDelete(context) {
    try {
        const body = await context.request.json();
        const { id, adminPass } = body;

        if (adminPass !== "@dm1n") { 
            return new Response(JSON.stringify({ error: "DENIED: รหัสผ่านไม่ถูกต้อง" }), { status: 403 });
        }

        const stmt = context.env.DB.prepare("DELETE FROM news WHERE id = ?").bind(id);
        await stmt.run();

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}