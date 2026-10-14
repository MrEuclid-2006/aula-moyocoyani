// ============================================
// AULA MOYOCOYANI — Interactividad global
// ============================================

document.addEventListener('DOMContentLoaded', () => {

  // Animación de entrada de las tarjetas (portada)
  const tarjetas = document.querySelectorAll('.tarjeta-materia');
  tarjetas.forEach((tarjeta, index) => {
    tarjeta.style.opacity = '0';
    tarjeta.style.transform = 'translateY(30px)';
    setTimeout(() => {
      tarjeta.style.transition = 'all 0.6s ease';
      tarjeta.style.opacity = '1';
      tarjeta.style.transform = 'translateY(0)';
    }, 200 * (index + 1));
  });

  // Efecto de rotación en el logo
  const logo = document.querySelector('.logo-bauhaus');
  if (logo) {
    logo.addEventListener('click', () => {
      logo.style.transition = 'transform 0.5s ease';
      logo.style.transform = 'rotate(360deg)';
      setTimeout(() => { logo.style.transform = 'rotate(0deg)'; }, 500);
    });
  }

});

console.log('🎨 Aula Moyocoyani — Cargada correctamente');
