document.addEventListener('DOMContentLoaded', () => {
    // 1. Scroll Reveal Effect (스크롤 시 요소가 부드럽게 나타나는 효과)
    const revealElements = document.querySelectorAll('.scroll-reveal');

    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const revealPoint = 100;

        revealElements.forEach(el => {
            const revealTop = el.getBoundingClientRect().top;
            if (revealTop < windowHeight - revealPoint) {
                el.classList.add('visible');
            }
        });
    };

    // Initial check on load
    revealOnScroll();

    // Check on scroll
    window.addEventListener('scroll', revealOnScroll);

    // 2. Sidebar Parallax Effect (데스크톱 환경에서 마우스 움직임에 반응하는 효과)
    const sidebar = document.querySelector('.sidebar');
    const sidebarBg = document.querySelector('.sidebar-bg');

    if (window.innerWidth > 900) {
        sidebar.addEventListener('mousemove', (e) => {
            // Calculate mouse position relative to center of the sidebar
            const rect = sidebar.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width - 0.5) * 30; // Max movement 30px
            const y = ((e.clientY - rect.top) / rect.height - 0.5) * 30;

            sidebarBg.style.transform = `scale(1.15) translate(${-x}px, ${-y}px)`;
        });

        sidebar.addEventListener('mouseleave', () => {
            sidebarBg.style.transform = 'scale(1.05) translate(0, 0)';
        });
    }

    // 3. Comments System (LocalStorage 기반 실제 작동)
    const commentForm = document.getElementById('commentForm');
    const commentsList = document.getElementById('commentsList');

    // XSS 방지 처리
    const escapeHTML = (str) => {
        return str.replace(/[&<>'"]/g,
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag));
    };

    // DOM에 댓글 그리기
    const addCommentToDOM = (comment) => {
        const commentDiv = document.createElement('div');
        commentDiv.className = 'comment-item scroll-reveal visible';

        commentDiv.innerHTML = `
            <div class="comment-header">
                <span class="comment-author">${escapeHTML(comment.name)}</span>
                <span class="comment-date">${comment.date}</span>
            </div>
            <div class="comment-body">${escapeHTML(comment.text).replace(/\n/g, '<br>')}</div>
        `;

        // 최신 댓글이 위로 오도록 prepend
        commentsList.prepend(commentDiv);
    };

    // 로컬 스토리지에서 댓글 불러오기
    const loadComments = () => {
        const comments = JSON.parse(localStorage.getItem('blogComments')) || [];
        commentsList.innerHTML = '';
        comments.forEach(comment => addCommentToDOM(comment));
    };

    // 폼 제출 이벤트
    if (commentForm) {
        commentForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const nameInput = document.getElementById('commentName');
            const textInput = document.getElementById('commentText');

            const name = nameInput.value.trim();
            const text = textInput.value.trim();

            if (name && text) {
                const now = new Date();
                const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

                const newComment = {
                    name: name,
                    text: text,
                    date: dateStr
                };

                // 로컬 스토리지에 저장
                const comments = JSON.parse(localStorage.getItem('blogComments')) || [];
                comments.push(newComment);
                localStorage.setItem('blogComments', JSON.stringify(comments));

                // 화면에 즉시 추가
                addCommentToDOM(newComment);

                // 입력창 초기화
                nameInput.value = '';
                textInput.value = '';
            }
        });

        // 초기 로드
        loadComments();
    }

    // 4. Settings Menu (Dark Mode & Font Size)
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsMenu = document.getElementById('settingsMenu');
    const darkModeToggle = document.getElementById('darkModeToggle');
    const fontIncrease = document.getElementById('fontIncrease');
    const fontDecrease = document.getElementById('fontDecrease');

    if (settingsBtn && settingsMenu) {
        // 메뉴 토글
        settingsBtn.addEventListener('click', () => {
            settingsMenu.classList.toggle('hidden');
        });

        // 다크 모드 로드
        const isDarkMode = localStorage.getItem('blogDarkMode') === 'true';
        if (isDarkMode) {
            document.documentElement.classList.add('dark-mode');
            darkModeToggle.checked = true;
        }

        // 다크 모드 토글
        darkModeToggle.addEventListener('change', (e) => {
            if (e.target.checked) {
                document.documentElement.classList.add('dark-mode');
                localStorage.setItem('blogDarkMode', 'true');
            } else {
                document.documentElement.classList.remove('dark-mode');
                localStorage.setItem('blogDarkMode', 'false');
            }
        });

        // 폰트 사이즈 로드
        let currentFontSize = parseInt(localStorage.getItem('blogFontSize')) || 100;
        document.documentElement.style.fontSize = `${currentFontSize}%`;

        // 폰트 사이즈 조절
        const updateFontSize = (newSize) => {
            if (newSize >= 80 && newSize <= 130) {
                currentFontSize = newSize;
                document.documentElement.style.fontSize = `${currentFontSize}%`;
                localStorage.setItem('blogFontSize', currentFontSize);
            }
        };

        fontIncrease.addEventListener('click', () => updateFontSize(currentFontSize + 10));
        fontDecrease.addEventListener('click', () => updateFontSize(currentFontSize - 10));

        // 배경 클릭 시 메뉴 닫기
        document.addEventListener('click', (e) => {
            if (!settingsBtn.contains(e.target) && !settingsMenu.contains(e.target)) {
                settingsMenu.classList.add('hidden');
            }
        });
    }
});
