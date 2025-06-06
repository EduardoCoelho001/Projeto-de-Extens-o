document.addEventListener('DOMContentLoaded', () => {
    // Back to Top Button
    const backToTopButton = document.getElementById('backToTop');
    if (backToTopButton) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTopButton.classList.remove('hidden');
            } else {
                backToTopButton.classList.add('hidden');
            }
        });

        backToTopButton.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Adoption Modal
    const adoptButtons = document.querySelectorAll('.adopt-btn');
    const adoptionModal = document.getElementById('adoptionModal');
    const closeModal = document.getElementById('closeModal');

    if (adoptionModal && closeModal && adoptButtons.length > 0) {
        adoptButtons.forEach(button => {
            button.addEventListener('click', () => {
                adoptionModal.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
            });
        });

        closeModal.addEventListener('click', () => {
            adoptionModal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        });

        // Fechar modal ao clicar fora
        adoptionModal.addEventListener('click', (e) => {
            if (e.target === adoptionModal) {
                adoptionModal.classList.add('hidden');
                document.body.style.overflow = 'auto';
            }
        });
    }

    // Coração toggle
    const heartIcons = document.querySelectorAll('.heart-icon');
    heartIcons.forEach(icon => {
        icon.addEventListener('click', (e) => {
            e.stopPropagation();
            icon.classList.toggle('text-gray-400');
            icon.classList.toggle('text-rose-500');
        });
    });

    // Menu mobile
    const mobileMenuButton = document.querySelector('button.md\\:hidden');
    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', () => {
            alert('Menu mobile seria exibido aqui.');
        });
    }
});
