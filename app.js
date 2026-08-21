
    const API_URL = '/api';

    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function isValidLink(value) {
        return typeof value === 'string' && value.trim() !== '' && value.trim() !== '-';
    }

    function openModal(imgSrc) {
        const modal = document.getElementById('imageModal');
        const modalImg = document.getElementById('modalImg');

        if (!modal || !modalImg) return;

        modal.style.display = 'flex';
        modalImg.src = imgSrc;
        modalImg.alt = 'Expanded preview';
    }

    function closeModal() {
        const modal = document.getElementById('imageModal');
        if (modal) modal.style.display = 'none';
    }

    async function loadTour() {
        const container = document.getElementById('event-container');

        if (!container) return;

        try {
            const response = await fetch(`${API_URL}/events`);
            const data = await response.json();

            if (Array.isArray(data) && data.length > 0) {
                container.innerHTML = data.map(event => {
                    const linkBtn = isValidLink(event.link)
                        ? `<a href="${escapeHtml(event.link)}" target="_blank" rel="noopener noreferrer" class="cyber-btn">ACCESS</a>`
                        : `<button class="cyber-btn" disabled style="opacity: 0.3; cursor: not-allowed; border: 1px solid var(--cyber-red-dim); background: transparent; color: #888;">UNAVAILABLE</button>`;

                    return `
                        <div class="coord-item">
                            <div class="c-date">${escapeHtml(event.date)}</div>
                            <div class="c-details">
                                <h3 class="c-title">${escapeHtml(event.title)}</h3>
                                <div class="c-loc">${escapeHtml(event.location)}</div>
                            </div>
                            <div style="display:flex; align-items:center;">
                                ${linkBtn}
                            </div>
                        </div>
                    `;
                }).join('');
            } else {
                container.innerHTML = '<div class="coord-item">ERROR: NO TARGETS FOUND</div>';
            }
        } catch (error) {
            container.innerHTML = '<div class="coord-item">ERROR: SYSTEM OFFLINE</div>';
        }
    }

    async function loadNews() {
        const container = document.getElementById('news-container');

        if (!container) return;

        try {
            const response = await fetch(`${API_URL}/news`);
            const data = await response.json();

            if (Array.isArray(data) && data.length > 0) {
                container.innerHTML = data.slice(0, 6).map(news => {
                    const hasLink = isValidLink(news.link);
                    const tagName = hasLink ? 'a' : 'div';
                    const hrefAttr = hasLink ? `href="${escapeHtml(news.link)}" target="_blank" rel="noopener noreferrer"` : '';
                    const cursorStyle = hasLink ? 'cursor: pointer;' : 'cursor: default;';
                    const readMoreText = hasLink
                        ? '<span style="color: var(--cyber-red); font-size: 0.85rem; font-weight: bold; margin-top: 15px; display: block;">[ READ MORE >> ]</span>'
                        : '';

                    return `
                        <div style="display: flex; flex-direction: column;">
                            <${tagName} ${hrefAttr} class="log-card" style="text-decoration: none; ${cursorStyle}">
                                <img src="${escapeHtml(news.img_url)}" class="log-img" alt="News Image" onerror="this.src='assets/main_logo.png'">
                                <span class="log-id">LOG_ID: ${escapeHtml(news.log_id)}</span>
                                <h3 class="log-title">${escapeHtml(news.title)}</h3>
                                <p class="log-desc">${escapeHtml(news.description)}</p>
                                ${readMoreText}
                            </${tagName}>
                        </div>
                    `;
                }).join('');
            } else {
                container.innerHTML = '<div style="color:#888; font-family: monospace;">> NO LOGS FOUND.</div>';
            }
        } catch (error) {
            container.innerHTML = '<div style="color:var(--cyber-red); font-family: monospace;">> ERROR: DATABANK OFFLINE</div>';
        }
    }

    async function loadMessages() {
        const chatBox = document.getElementById('chatBox');

        if (!chatBox) return;

        try {
            const response = await fetch(`${API_URL}/chat`);
            const data = await response.json();

            if (!Array.isArray(data)) {
                return;
            }

            chatBox.innerHTML = data.map(message => {
                const date = new Date(message.timestamp);
                const dateStr = date.toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: '2-digit' });
                const timeStr = date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

                return `
                    <div style="margin-bottom:10px; font-size: 0.9rem;">
                        <span style="color:#888; font-family: monospace; font-size: 0.75rem;">[${dateStr} ${timeStr}]</span>
                        <span style="color:#FF003C; font-weight:bold;">${escapeHtml(message.name)}:</span>
                        <span>${escapeHtml(message.message)}</span>
                    </div>
                `;
            }).join('');
        } catch (error) {
            // silent fail: UI remains stable
        }
    }

    async function postMsg() {
        const nameInput = document.getElementById('chatName');
        const msgInput = document.getElementById('chatMsg');
        const adminPassInput = document.getElementById('adminPass');
        const adminPanel = document.getElementById('adminPanel');
        const postBtn = document.getElementById('postBtn');

        if (!nameInput || !msgInput || !postBtn) return;

        const name = nameInput.value.trim();
        const msg = msgInput.value.trim();
        const pass = adminPassInput ? adminPassInput.value.trim() : '';

        if (!name || !msg) {
            alert('> ERROR: FIELDS_REQUIRED');
            return;
        }

        if (name.toUpperCase() === 'PROMAXZ' || name.toUpperCase() === 'ADMIN') {
            if (adminPanel && adminPanel.style.display === 'none') {
                adminPanel.style.display = 'block';
                alert('กรุณาระบุรหัสยืนยันตัวตน ' + name);
                return;
            }

            if (!pass) {
                alert('กรุณาใส่รหัสผ่านก่อนโพสต์ครับ');
                return;
            }
        }

        postBtn.innerText = 'UPLOADING...';
        postBtn.disabled = true;

        try {
            const response = await fetch(`${API_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name,
                    message: msg,
                    adminPass: pass
                })
            });
            const result = await response.json();

            if (result.error) {
                alert('ACCESS DENIED: ' + result.error);
            } else {
                msgInput.value = '';
                if (adminPassInput) adminPassInput.value = '';
                if (adminPanel) adminPanel.style.display = 'none';
            }
        } catch (error) {
            alert('> ERROR: SYSTEM_ERROR');
        }

        postBtn.innerText = 'POST';
        postBtn.disabled = false;
        loadMessages();
    }

    document.addEventListener('DOMContentLoaded', () => {
        loadTour();
        loadNews();
        loadMessages();
        setInterval(loadMessages, 5000);

        const heroBanner = document.querySelector('.hero-banner-image');
        if (heroBanner) {
            heroBanner.addEventListener('click', () => openModal(heroBanner.dataset.image));
        }

        const postBtn = document.getElementById('postBtn');
        if (postBtn) {
            postBtn.addEventListener('click', postMsg);
        }

        const modal = document.getElementById('imageModal');
        if (modal) {
            modal.addEventListener('click', closeModal);
        }

        const modalImg = document.getElementById('modalImg');
        if (modalImg) {
            modalImg.addEventListener('click', event => event.stopPropagation());
        }
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') closeModal();
    });

