export async function onRequestGet(context) {
    try {
        const { results } = await context.env.DB.prepare("SELECT * FROM events ORDER BY id ASC").all();
        return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json" } });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}

// ระบบสำหรับ "เพิ่ม" ตารางทัวร์
export async function onRequestPost(context) {
    try {
        const body = await context.request.json();
        const { date, title, location, link, adminPass } = body;

        if (adminPass !== "@dm1n") { // เปลี่ยน "1234" เป็นรหัสผ่านของคุณ
            return new Response(JSON.stringify({ error: "DENIED: รหัสผ่านไม่ถูกต้อง" }), { status: 403 });
        }

        const stmt = context.env.DB.prepare(
            "INSERT INTO events (date, title, location, link) VALUES (?, ?, ?, ?)"
        ).bind(date, title, location, link);
        await stmt.run();

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}

// ระบบสำหรับ "ลบ" ตารางทัวร์
export async function onRequestDelete(context) {
    try {
        const body = await context.request.json();
        const { id, adminPass } = body;

        if (adminPass !== "@dm1n") { // เปลี่ยน "1234" เป็นรหัสผ่านของคุณ
            return new Response(JSON.stringify({ error: "DENIED: รหัสผ่านไม่ถูกต้อง" }), { status: 403 });
        }

        const stmt = context.env.DB.prepare("DELETE FROM events WHERE id = ?").bind(id);
        await stmt.run();

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
// ระบบสำหรับ "แก้ไข" ตารางทัวร์
export async function onRequestPut(context) {
    try {
        const body = await context.request.json();
        const { id, date, title, location, link, adminPass } = body;

        if (adminPass !== "@dm1n") { // เปลี่ยนเป็นรหัสแอดมินของคุณ
            return new Response(JSON.stringify({ error: "DENIED: รหัสผ่านไม่ถูกต้อง" }), { status: 403 });
        }

        const stmt = context.env.DB.prepare(
            "UPDATE events SET date = ?, title = ?, location = ?, link = ? WHERE id = ?"
        ).bind(date, title, location, link, id);
        
        await stmt.run();

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}