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

    function parsePapersCsv(text) {
        const lines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
        if (lines.length < 2) return [];

        return lines.slice(1).map((line) => {
            const f = splitCsvLine(line);
            if (f.length < 6) return null;

            return {
                date: f[0],
                number: f[1],
                authors: f[2],
                paper_name: f[3],
                venue: f[4],
                doi: f[5] || '',
                source_code: f[6] || '',
                supplementary: f[7] || '',
                project: f[8] || '',
                demo: f[9] || ''
            };
        }).filter(Boolean);
    }

    function parseStudentsCsv(text) {
        const lines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
        if (lines.length < 2) return [];

        return lines.slice(1).map((line) => {
            const f = splitCsvLine(line);
            if (f.length < 6) return null;

            return {
                date: f[0],
                name: f[1],
                link: f[2] || '',
                degree: f[3],
                university: f[4],
                thesis: f[5] || ''
            };
        }).filter(Boolean);
    }

    function renderList(container, items, limit) {
        const maxItems = limit > 0 ? Math.min(limit, items.length) : items.length;
        const fragment = document.createDocumentFragment();

        const isCV = container.classList.contains('cv-list');
        const isPapers = container.classList.contains('papers-list');

        let itemClass, dateClass, contentClass;

        if (isPapers) {
            itemClass = 'papers-item';
            dateClass = 'papers-date';
            contentClass = 'papers-content';
        } else if (isCV) {
            itemClass = 'cv-item';
            dateClass = 'cv-date';
            contentClass = 'cv-content';
        } else {
            itemClass = 'news-item';
            dateClass = 'news-date';
            contentClass = 'news-content';
        }

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

    function renderPapersList(container, items, limit) {
        const maxItems = limit > 0 ? Math.min(limit, items.length) : items.length;
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < maxItems; i += 1) {
            const item = items[i];
            const row = document.createElement('div');
            row.className = 'papers-item';

            const date = document.createElement('div');
            date.className = 'papers-date';
            date.textContent = item.date;

            const content = document.createElement('div');
            content.className = 'papers-content';

            const p = document.createElement('p');
            let html = '[' + item.number + '] ' + item.authors + ' <i>' + item.paper_name + '.</i> ' + item.venue;

            const links = [];
            if (item.doi) links.push({ url: item.doi, label: 'DOI' });
            if (item.source_code) links.push({ url: item.source_code, label: 'Source Code' });
            if (item.supplementary) links.push({ url: item.supplementary, label: 'Supplementary Material' });
            if (item.project) links.push({ url: item.project, label: 'Project Webpage' });
            if (item.demo) links.push({ url: item.demo, label: 'Demo' });

            if (links.length > 0) {
                html += '<br>';
                links.forEach((link) => {
                    html += "<a href='" + link.url + "' style='font-weight: 600;'>[" + link.label + ']</a> ';
                });
            }

            p.innerHTML = html;
            content.appendChild(p);

            row.appendChild(date);
            row.appendChild(content);
            fragment.appendChild(row);
        }

        container.innerHTML = '';
        container.appendChild(fragment);
    }

    function renderStudentsList(container, items, limit) {
        const maxItems = limit > 0 ? Math.min(limit, items.length) : items.length;
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < maxItems; i += 1) {
            const item = items[i];
            const row = document.createElement('div');
            row.className = 'papers-item';

            const date = document.createElement('div');
            date.className = 'papers-date';
            date.textContent = item.date;

            const content = document.createElement('div');
            content.className = 'papers-content';

            const p = document.createElement('p');
            let html = "<span style='font-weight:600'>";
            if (item.link) {
                html += "<a href='" + item.link + "'>" + item.name + '</a>';
            } else {
                html += item.name;
            }
            html += '</span><br>' + item.degree + '<br><i>' + item.university + '</i>';

            if (item.thesis) {
                html += "<br><a href='" + item.thesis + "' style='font-weight: 600;'>[Thesis]</a>";
            }

            p.innerHTML = html;
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
                    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
                    if (lines.length >= 2) {
                        const header = lines[0].toLowerCase();
                        const firstDataFields = splitCsvLine(lines[1]);

                        if (header.indexOf('paper_name') !== -1 && firstDataFields.length >= 6) {
                            const items = parsePapersCsv(text);
                            renderPapersList(container, items, isNaN(limit) ? 0 : limit);
                        } else if (header.indexOf('thesis') !== -1 && firstDataFields.length >= 6) {
                            const items = parseStudentsCsv(text);
                            renderStudentsList(container, items, isNaN(limit) ? 0 : limit);
                        } else {
                            const items = parseCsv(text);
                            renderList(container, items, isNaN(limit) ? 0 : limit);
                        }
                    }
                })
                .catch(() => {
                    container.innerHTML = '<p>Unable to load list right now.</p>';
                });
        });
    }

    document.addEventListener('DOMContentLoaded', initLists);
})();
