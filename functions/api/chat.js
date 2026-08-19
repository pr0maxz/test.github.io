export async function onRequestGet(context) {
    try {
        const { results } = await context.env.DB.prepare(
            "SELECT * FROM messages ORDER BY timestamp DESC LIMIT 50"
        ).all();
        return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json" } });
    } catch (err) {
        return new Response(JSON.stringify({ error: "System Offline" }), { status: 500 });
    }
}

export async function onRequestPost(context) {
    try {
        const body = await context.request.json();
        const { name, message, adminPass } = body;

        // เช็ครหัสผ่านตอนพิมพ์แชทในชื่อ PROMAXZ
        if (name.toUpperCase() === "PROMAXZ" && adminPass !== "@dm1n") { 
            return new Response(JSON.stringify({ error: "DENIED: รหัสผ่านไม่ถูกต้อง" }), { status: 403 });
        }

        const stmt = context.env.DB.prepare(
            "INSERT INTO messages (name, message, timestamp) VALUES (?, ?, ?)"
        ).bind(name, message, new Date().toISOString());
        
        await stmt.run();

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}

// --------------------------------------------------
// ส่วนที่เพิ่มใหม่: ระบบรับคำสั่งลบข้อความ (DELETE)
// --------------------------------------------------
export async function onRequestDelete(context) {
    try {
        const body = await context.request.json();
        const { id, adminPass } = body;

        // เช็ครหัสผ่านแอดมินก่อนอนุญาตให้ลบ (เปลี่ยน "1234" เป็นรหัสของคุณ)
        if (adminPass !== "@dm1n") { 
            return new Response(JSON.stringify({ error: "DENIED: รหัสผ่านแอดมินลับไม่ถูกต้อง" }), { status: 403 });
        }

        const stmt = context.env.DB.prepare("DELETE FROM messages WHERE id = ?").bind(id);
        await stmt.run();

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}