export async function onRequestPost(context) {
    try {
        // รับรหัสผ่านที่หน้าเว็บส่งมา
        const request = await context.request.json();
        const userPass = request.pass;

        // ดึงรหัสผ่านลับสุดยอดที่ตั้งไว้ในระบบ Cloudflare (ดึงจากตัวแปรแวดล้อม)
        // 💡 ชั่วคราว: ถ้ายังไม่ได้ตั้งค่าตัวแปรในระบบ ให้ใช้ 'promaxz2026' ไปก่อนครับ
        const validPass = context.env.ADMIN_PASS || "promaxz2026"; 

        if (userPass === validPass) {
            // ถ้ารหัสถูก ส่งกุญแจอนุญาตกลับไป (Status 200)
            return new Response(JSON.stringify({ success: true, message: "ACCESS GRANTED" }), {
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
            // ถ้ารหัสผิด ดีดกลับไปเลย (Status 401)
            return new Response(JSON.stringify({ success: false, error: "ACCESS DENIED" }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    } catch (error) {
        return new Response(JSON.stringify({ success: false, error: 'SYSTEM ERROR' }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}