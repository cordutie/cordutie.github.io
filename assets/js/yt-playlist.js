(function () {
    const API_BASE = 'https://www.googleapis.com/youtube/v3/playlistItems';
    const PAGE_SIZE = 50; // YouTube max per page

    function fetchAll(playlistId, apiKey) {
        const url = new URL(API_BASE);
        url.searchParams.set('part', 'snippet');
        url.searchParams.set('playlistId', playlistId);
        url.searchParams.set('maxResults', PAGE_SIZE);
        url.searchParams.set('key', apiKey);

        let items = [];
        let pageToken = '';

        function nextPage() {
            const pageUrl = new URL(url);
            if (pageToken) pageUrl.searchParams.set('pageToken', pageToken);

            return fetch(pageUrl)
                .then(function (res) { return res.json(); })
                .then(function (data) {
                    if (data.error) {
                        throw new Error(data.error.message);
                    }

                    var filtered = data.items.filter(function (item) {
                        var title = item.snippet.title;
                        return title !== 'Deleted video' && title !== 'Private video';
                    });

                    items = items.concat(filtered);

                    if (data.nextPageToken) {
                        pageToken = data.nextPageToken;
                        return nextPage();
                    }

                    return items;
                });
        }

        return nextPage();
    }

    function buildPlayer(container, items, apiKey) {
        if (!items.length) {
            container.innerHTML = '<p>No videos found in this playlist.</p>';
            return;
        }

        container.classList.add('yt-playlist');
        container.innerHTML = '';

        var playerWrap = document.createElement('div');
        playerWrap.className = 'yt-player-wrap';

        var iframe = document.createElement('iframe');
        iframe.className = 'yt-player-iframe';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;
        iframe.src = 'https://www.youtube.com/embed/' + items[0].snippet.resourceId.videoId;
        playerWrap.appendChild(iframe);

        var titleBar = document.createElement('div');
        titleBar.className = 'yt-player-title';
        titleBar.textContent = items[0].snippet.title;
        playerWrap.appendChild(titleBar);

        var listWrap = document.createElement('div');
        listWrap.className = 'yt-list-wrap';

        var list = document.createElement('div');
        list.className = 'yt-list';

        items.forEach(function (item, i) {
            var entry = document.createElement('div');
            entry.className = 'yt-list-item' + (i === 0 ? ' active' : '');

            var thumb = document.createElement('img');
            thumb.className = 'yt-list-thumb';
            thumb.src = item.snippet.thumbnails.medium
                ? item.snippet.thumbnails.medium.url
                : (item.snippet.thumbnails.default
                    ? item.snippet.thumbnails.default.url
                    : '');
            thumb.alt = item.snippet.title;
            thumb.loading = 'lazy';

            var meta = document.createElement('div');
            meta.className = 'yt-list-meta';

            var num = document.createElement('span');
            num.className = 'yt-list-num';
            num.textContent = i + 1;

            var text = document.createElement('span');
            text.className = 'yt-list-text';
            text.textContent = item.snippet.title;

            meta.appendChild(num);
            meta.appendChild(text);

            entry.appendChild(thumb);
            entry.appendChild(meta);

            entry.addEventListener('click', function () {
                iframe.src = 'https://www.youtube.com/embed/' + item.snippet.resourceId.videoId;
                titleBar.textContent = item.snippet.title;

                list.querySelectorAll('.yt-list-item').forEach(function (el) {
                    el.classList.remove('active');
                });
                entry.classList.add('active');
            });

            list.appendChild(entry);
        });

        listWrap.appendChild(list);

        container.appendChild(playerWrap);
        container.appendChild(listWrap);
    }

    function init() {
        var containers = document.querySelectorAll('[data-playlist-id]');
        if (!containers.length) return;

        var apiKey = window.YT_API_KEY || '';
        if (!apiKey) {
            containers.forEach(function (c) {
                c.innerHTML = '<p>YouTube API key not configured.</p>';
            });
            return;
        }

        containers.forEach(function (container) {
            var playlistId = container.getAttribute('data-playlist-id');
            var maxAttr = container.getAttribute('data-playlist-max');
            var max = maxAttr ? parseInt(maxAttr, 10) : 0;

            container.innerHTML = '<p>Loading playlist&hellip;</p>';

            fetchAll(playlistId, apiKey)
                .then(function (items) {
                    if (max > 0) items = items.slice(0, max);
                    buildPlayer(container, items, apiKey);
                })
                .catch(function (err) {
                    container.innerHTML = '<p>Failed to load playlist: ' + err.message + '</p>';
                });
        });
    }

    document.addEventListener('DOMContentLoaded', init);
})();
