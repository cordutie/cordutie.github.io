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
                const news = fields.slice(1).join(',').trim();

                if (index === 0 && date.toLowerCase() === 'date') {
                    return null;
                }

                return { date, news };
            })
            .filter(Boolean);
    }

    function renderNews(container, items, limit) {
        const maxItems = limit > 0 ? Math.min(limit, items.length) : items.length;
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < maxItems; i += 1) {
            const item = items[i];
            const row = document.createElement('div');
            row.className = 'news-item';

            const date = document.createElement('div');
            date.className = 'news-date';
            date.textContent = item.date;

            const content = document.createElement('div');
            content.className = 'news-content';

            const p = document.createElement('p');
            p.innerHTML = item.news;
            content.appendChild(p);

            row.appendChild(date);
            row.appendChild(content);
            fragment.appendChild(row);
        }

        container.innerHTML = '';
        container.appendChild(fragment);
    }

    function initNews() {
        const containers = document.querySelectorAll('[data-news-src]');
        if (!containers.length) return;

        const src = containers[0].getAttribute('data-news-src');

        fetch(src)
            .then((res) => res.text())
            .then((text) => {
                const items = parseCsv(text);
                containers.forEach((container) => {
                    const limitAttr = container.getAttribute('data-news-limit');
                    const limit = limitAttr ? parseInt(limitAttr, 10) : 0;
                    renderNews(container, items, isNaN(limit) ? 0 : limit);
                });
            })
            .catch(() => {
                containers.forEach((container) => {
                    container.innerHTML = '<p>Unable to load news right now.</p>';
                });
            });
    }

    document.addEventListener('DOMContentLoaded', initNews);
})();
