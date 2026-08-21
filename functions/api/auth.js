export async function onRequestPost(context) {
    try {
        const request = await context.request.json().catch(() => ({}));
        const userPass = typeof request.pass === 'string' ? request.pass.trim() : '';
        const validPass = context.env.ADMIN_PASS || '@dm1n';

        if (userPass === validPass) {
            return Response.json({
                success: true,
                message: 'ACCESS GRANTED'
            });
        }

        return new Response(JSON.stringify({
            success: false,
            error: 'ACCESS DENIED'
        }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            error: 'SYSTEM ERROR'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}