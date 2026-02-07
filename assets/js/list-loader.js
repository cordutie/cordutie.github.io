(function () {
    function splitCsvLine(line) {
        const fields = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i += 1) {
            const char = line[i];
            const next = line[i + 1];

            if (char === '"') {
                if (inQuotes && next === '"') {
                    current += '"';
                    i += 1;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                fields.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }

        fields.push(current.trim());
        return fields;
    }

    function parseCsv(text) {
        return text
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter((line) => line.length > 0)
            .map((line, index) => {
                const fields = splitCsvLine(line);
                if (fields.length < 2) {
                    return null;
                }

                const date = fields[0];
                const content = fields.slice(1).join(',').trim();

                if (index === 0 && date.toLowerCase() === 'date') {
                    return null;
                }

                return { date, content };
            })
            .filter(Boolean);
    }

    function renderList(container, items, limit) {
        const maxItems = limit > 0 ? Math.min(limit, items.length) : items.length;
        const fragment = document.createDocumentFragment();
        
        /* Detect type from container class */
        const isCV = container.classList.contains('cv-list');
        const itemClass = isCV ? 'cv-item' : 'news-item';
        const dateClass = isCV ? 'cv-date' : 'news-date';
        const contentClass = isCV ? 'cv-content' : 'news-content';

        for (let i = 0; i < maxItems; i += 1) {
            const item = items[i];
            const row = document.createElement('div');
            row.className = itemClass;

            const date = document.createElement('div');
            date.className = dateClass;
            date.textContent = item.date;

            const content = document.createElement('div');
            content.className = contentClass;

            const p = document.createElement('p');
            p.innerHTML = item.content;
            content.appendChild(p);

            row.appendChild(date);
            row.appendChild(content);
            fragment.appendChild(row);
        }

        container.innerHTML = '';
        container.appendChild(fragment);
    }

    function initLists() {
        const containers = document.querySelectorAll('[data-news-src]');
        if (!containers.length) return;

        containers.forEach((container) => {
            const src = container.getAttribute('data-news-src');
            const limitAttr = container.getAttribute('data-news-limit');
            const limit = limitAttr ? parseInt(limitAttr, 10) : 0;

            fetch(src)
                .then((res) => res.text())
                .then((text) => {
                    const items = parseCsv(text);
                    renderList(container, items, isNaN(limit) ? 0 : limit);
                })
                .catch(() => {
                    container.innerHTML = '<p>Unable to load list right now.</p>';
                });
        });
    }

    document.addEventListener('DOMContentLoaded', initLists);
})();
