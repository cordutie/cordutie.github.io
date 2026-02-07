(function () {
    const root = document.documentElement;
    const button = document.getElementById('dev-toggle');

    if (!button) {
        return;
    }

    const stored = localStorage.getItem('dev-outlines');

    if (stored === 'on') {
        root.classList.add('dev-on');
        button.textContent = 'Dev: on';
    }

    button.addEventListener('click', () => {
        const isOn = root.classList.toggle('dev-on');
        button.textContent = isOn ? 'Dev: on' : 'Dev: off';
        localStorage.setItem('dev-outlines', isOn ? 'on' : 'off');
    });
})();
