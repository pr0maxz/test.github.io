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
// ==========================================
    // ฟังก์ชันเชื่อมต่อฐานข้อมูล D1
    // ==========================================
    
    // 1. ระบบเพิ่มตารางทัวร์
    async function addTour() {
        const date = document.getElementById('evDate').value;
        const title = document.getElementById('evTitle').value;
        const loc = document.getElementById('evLoc').value;
        const link = document.getElementById('evLink').value;

        if(!date || !title || !loc) return alert("> ERROR: กรุณากรอกข้อมูลให้ครบถ้วน");

        try {
            // ส่งข้อมูลไปที่ API เดิมของคุณ พร้อมแนบรหัสผ่านแอดมินไปด้วย
            const res = await fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    date: date, 
                    title: title, 
                    location: loc, 
                    link: link, 
                    adminPass: currentAdminPass 
                })
            });
            const result = await res.json();
            
            if(result.error) {
                alert("> ERROR: " + result.error);
            } else {
                alert("> SUCCESS: อัปเดตคิวงานขึ้นหน้าเว็บเรียบร้อย!");
                // เคลียร์ช่องพิมพ์ให้ว่าง
                document.getElementById('evDate').value = '';
                document.getElementById('evTitle').value = '';
                document.getElementById('evLoc').value = '';
                document.getElementById('evLink').value = '';
            }
        } catch (e) {
            alert("> ERROR: SYSTEM_ERROR ไม่สามารถเชื่อมต่อฐานข้อมูลได้");
        }
    }

    // 2. ระบบเพิ่มข่าวสาร
    async function addNews() {
        const logId = document.getElementById('nLogId').value;
        const title = document.getElementById('nTitle').value;
        const desc = document.getElementById('nDesc').value;
        const img = document.getElementById('nImg').value;

        if(!logId || !title) return alert("> ERROR: กรุณากรอกหัวข้อข่าว");

        try {
            const res = await fetch('/api/news', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    log_id: logId, 
                    title: title, 
                    description: desc, 
                    img_url: img, 
                    adminPass: currentAdminPass 
                })
            });
            const result = await res.json();
            
            if(result.error) {
                alert("> ERROR: " + result.error);
            } else {
                alert("> SUCCESS: เผยแพร่ข่าวสารเรียบร้อย!");
                document.getElementById('nLogId').value = '';
                document.getElementById('nTitle').value = '';
                document.getElementById('nDesc').value = '';
                document.getElementById('nImg').value = '';
            }
        } catch (e) {
            alert("> ERROR: SYSTEM_ERROR ไม่สามารถเชื่อมต่อฐานข้อมูลได้");
        }
    }
    // ==========================================
    // 3. ระบบจัดการห้องแชท (โหลด & ลบ)
    // ==========================================
    
    // โหลดข้อความแชททั้งหมดมาแสดง
    async function loadAdminChat() {
        const container = document.getElementById('admin-chat-container');
        container.innerHTML = "> FETCHING CHAT LOGS...";
        try {
            const res = await fetch('/api/chat');
            const data = await res.json();
            
            if (data && data.length > 0) {
                container.innerHTML = data.map(msg => {
                    const date = new Date(msg.timestamp);
                    const timeStr = date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
                    
                    return `
                    <div style="margin-bottom: 10px; border-bottom: 1px dashed #333; padding-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
                        <div style="flex: 1; padding-right: 15px; word-break: break-word;">
                            <span style="color:#888; font-size: 0.75rem;">[${timeStr}]</span> 
                            <strong style="color: #FF003C;">${msg.name}:</strong> 
                            <span>${msg.message}</span>
                        </div>
                        <button onclick="deleteAdminMsg(${msg.id})" style="background: #8b0000; color: #fff; border: 1px solid #FF003C; padding: 5px 10px; cursor: pointer; font-weight: bold; font-family: monospace; transition: 0.3s;" onmouseover="this.style.background='#FF003C'" onmouseout="this.style.background='#8b0000'">DEL</button>
                    </div>
                    `;
                }).join('');
            } else {
                container.innerHTML = "> NO MESSAGES FOUND IN DATABANK.";
            }
        } catch (e) {
            container.innerHTML = "> ERROR: DATABANK OFFLINE";
        }
    }

    // สั่งลบข้อความ
    async function deleteAdminMsg(id) {
        if (!confirm("> WARNING: CONFIRM DELETE THIS MESSAGE?")) return;
        
        try {
            const res = await fetch('/api/chat', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: id, adminPass: currentAdminPass })
            });
            const result = await res.json();
            
            if (result.error) {
                alert("> ERROR: " + result.error);
            } else {
                loadAdminChat(); // รีเฟรชแชทใหม่ทันทีหลังลบเสร็จ
            }
        } catch (e) {
            alert("> ERROR: SYSTEM_ERROR");
        }
    }