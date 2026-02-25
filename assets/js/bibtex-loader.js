// Load BibTeX from text file and enable click-to-copy functionality
document.addEventListener('DOMContentLoaded', function() {
    const bibtexBoxes = document.querySelectorAll('.bibtex-box');
    
    bibtexBoxes.forEach(box => {
        const src = box.getAttribute('data-bibtex-src');
        if (!src) return;
        
        // Load the BibTeX file
        fetch(src)
            .then(response => {
                if (!response.ok) throw new Error('Failed to load BibTeX');
                return response.text();
            })
            .then(bibtexText => {
                // Create pre element with BibTeX content
                const pre = document.createElement('pre');
                pre.textContent = bibtexText.trim();
                box.appendChild(pre);
                
                // Add click-to-copy functionality
                box.addEventListener('click', function() {
                    navigator.clipboard.writeText(bibtexText.trim())
                        .then(() => {
                            // Visual feedback
                            const originalBg = box.style.backgroundColor;
                            box.style.backgroundColor = '#90b890';
                            setTimeout(() => {
                                box.style.backgroundColor = originalBg;
                            }, 300);
                        })
                        .catch(err => {
                            console.error('Failed to copy to clipboard:', err);
                        });
                });
            })
            .catch(error => {
                console.error('Error loading BibTeX:', error);
                box.textContent = 'Error loading citation';
            });
    });
});
