export async function onRequest(context) {
    const db = context.env.DB;
    const method = context.request.method;

    try {
        // [GET] ดึงข้อมูลข่าวไปโชว์หน้าเว็บ
        if (method === 'GET') {
            const { results } = await db.prepare("SELECT * FROM news ORDER BY id DESC").all();
            return Response.json(results);
        }

        // [POST, PUT, DELETE] ต้องใช้รหัสผ่าน
        const data = await context.request.json();
        const validPass = context.env.ADMIN_PASS || "@dm1n";

        if (data.adminPass !== validPass) {
            return Response.json({ error: 'DENIED: รหัสผ่านไม่ถูกต้อง' });
        }

        // [POST] สร้างข่าวใหม่ (เพิ่ม link ลงไป)
        if (method === 'POST') {
            await db.prepare("INSERT INTO news (log_id, title, description, img_url, link) VALUES (?, ?, ?, ?, ?)")
                .bind(data.log_id, data.title, data.description, data.img_url, data.link || "")
                .run();
            return Response.json({ success: true });
        }

        // [PUT] แก้ไขข่าวเดิม (อัปเดต link ด้วย)
        if (method === 'PUT') {
            await db.prepare("UPDATE news SET log_id=?, title=?, description=?, img_url=?, link=? WHERE id=?")
                .bind(data.log_id, data.title, data.description, data.img_url, data.link || "", data.id)
                .run();
            return Response.json({ success: true });
        }

        // [DELETE] ลบข่าว
        if (method === 'DELETE') {
            await db.prepare("DELETE FROM news WHERE id=?").bind(data.id).run();
            return Response.json({ success: true });
        }

    } catch (e) {
        return Response.json({ error: e.message });
    }
}