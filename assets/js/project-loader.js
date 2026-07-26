(function () {
    function renderCard(project) {
        const a = document.createElement('a');
        a.className = 'project-card';
        a.href = './projects/' + project.slug + '.html';
        if (project.image) {
            a.style.backgroundImage = "url('" + project.image + "')";
        }

        const overlay = document.createElement('div');
        overlay.className = 'project-card-overlay';

        const h3 = document.createElement('h3');
        h3.style.marginBottom = '0rem';
        h3.textContent = project.title;

        const p = document.createElement('p');
        p.textContent = project.description;

        overlay.appendChild(h3);
        overlay.appendChild(p);
        a.appendChild(overlay);
        return a;
    }

    function initProjectLists() {
        const containers = document.querySelectorAll('[data-projects-src]');
        if (!containers.length) return;

        containers.forEach(function (container) {
            var src = container.getAttribute('data-projects-src');
            var limitAttr = container.getAttribute('data-projects-limit');
            var filterHome = container.hasAttribute('data-projects-home');
            var limit = limitAttr ? parseInt(limitAttr, 10) : 0;

            fetch(src)
                .then(function (res) { return res.json(); })
                .then(function (projects) {
                    if (filterHome) {
                        projects = projects.filter(function (p) { return p.home; });
                    }
                    projects.sort(function (a, b) { return a.order - b.order; });
                    if (limit > 0) {
                        projects = projects.slice(0, limit);
                    }

                    var fragment = document.createDocumentFragment();
                    projects.forEach(function (project) {
                        fragment.appendChild(renderCard(project));
                    });

                    container.innerHTML = '';
                    container.appendChild(fragment);
                })
                .catch(function () {
                    container.innerHTML = '<p>Unable to load projects right now.</p>';
                });
        });
    }

    document.addEventListener('DOMContentLoaded', initProjectLists);
})();
