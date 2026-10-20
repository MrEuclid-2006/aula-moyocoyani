// ============================================
// AULA MOYOCOYANI — Interactividad Global
// ============================================

document.addEventListener('DOMContentLoaded', () => {

  // 1. Animación de entrada de las tarjetas (portada)
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

  // 2. Efecto de rotación en el logo
  const logo = document.querySelector('.logo-bauhaus');
  if (logo) {
    logo.addEventListener('click', () => {
      logo.style.transition = 'transform 0.5s ease';
      logo.style.transform = 'rotate(360deg)';
      setTimeout(() => { logo.style.transform = 'rotate(0deg)'; }, 500);
    });
  }

  // 3. Lector de voz flotante (solo en cursos)
  crearLectorVoz();

});

// ============================================
// LECTOR DE VOZ FLOTANTE Y ARRASTRABLE
// ============================================
function crearLectorVoz() {
  // Solo crear el botón si estamos en una página de curso interactivo
  if (!document.querySelector('.pantalla')) return;
  if (document.getElementById('btnFlotanteVoz')) return; // Evitar duplicados

  // Variables de estado
  let estaLeyendo = false;
  let vocesDisponibles = [];
  let isDragging = false;
  let offsetX, offsetY;

  // Cargar voces del sistema
  function cargarVoces() {
    vocesDisponibles = window.speechSynthesis.getVoices();
  }
  if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = cargarVoces;
  }

  // Crear el botón en el DOM
  const btnVoz = document.createElement('div');
  btnVoz.id = 'btnFlotanteVoz';
  btnVoz.innerHTML = '🔊';
  btnVoz.title = 'Leer en voz alta (Arrastra para mover)';
  
  // Estilos del botón flotante
  btnVoz.style.position = 'fixed';
  btnVoz.style.bottom = '20px';
  btnVoz.style.right = '20px';
  btnVoz.style.width = '60px';
  btnVoz.style.height = '60px';
  btnVoz.style.borderRadius = '50%';
  btnVoz.style.background = '#1B3A6B'; // Azul Bauhaus
  btnVoz.style.color = 'white';
  btnVoz.style.display = 'flex';
  btnVoz.style.alignItems = 'center';
  btnVoz.style.justifyContent = 'center';
  btnVoz.style.fontSize = '24px';
  btnVoz.style.cursor = 'grab';
  btnVoz.style.zIndex = '9999';
  btnVoz.style.boxShadow = '4px 4px 0 #1A1A1A';
  btnVoz.style.border = '3px solid #1A1A1A';
  btnVoz.style.transition = 'background 0.2s, transform 0.1s';
  btnVoz.style.userSelect = 'none'; // Evitar seleccionar texto al arrastrar

  document.body.appendChild(btnVoz);

  // --- LÓGICA DE ARRASTRE ---
  btnVoz.addEventListener('mousedown', iniciarArrastre);
  btnVoz.addEventListener('touchstart', iniciarArrastre, {passive: true});

  function iniciarArrastre(e) {
    isDragging = false; // Se activará si se mueve
    const rect = btnVoz.getBoundingClientRect();
    
    // Calcular desplazamiento
    if (e.type === 'mousedown') {
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
    } else {
      offsetX = e.touches[0].clientX - rect.left;
      offsetY = e.touches[0].clientY - rect.top;
    }

    document.addEventListener('mousemove', mover);
    document.addEventListener('mouseup', soltar);
    document.addEventListener('touchmove', mover, {passive: false});
    document.addEventListener('touchend', soltar);
    
    btnVoz.style.cursor = 'grabbing';
  }

  function mover(e) {
    isDragging = true;
    let clientX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
    let clientY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;

    // Calcular nuevas posiciones y evitar que se salga de la pantalla
    let newLeft = clientX - offsetX;
    let newTop = clientY - offsetY;

    const maxLeft = window.innerWidth - btnVoz.offsetWidth;
    const maxTop = window.innerHeight - btnVoz.offsetHeight;

    if (newLeft < 0) newLeft = 0;
    if (newTop < 0) newTop = 0;
    if (newLeft > maxLeft) newLeft = maxLeft;
    if (newTop > maxTop) newTop = maxTop;

    btnVoz.style.left = newLeft + 'px';
    btnVoz.style.top = newTop + 'px';
    btnVoz.style.bottom = 'auto';
    btnVoz.style.right = 'auto';
  }

  function soltar() {
    document.removeEventListener('mousemove', mover);
    document.removeEventListener('mouseup', soltar);
    document.removeEventListener('touchmove', mover);
    document.removeEventListener('touchend', soltar);
    btnVoz.style.cursor = 'grab';
  }

  // --- LÓGICA DE LECTURA ---
  btnVoz.addEventListener('click', () => {
    // Si el usuario estaba arrastrando, no hacer clic
    if (isDragging) return;

    if (estaLeyendo) {
      detenerLectura();
      return;
    }

    const pantallaActiva = document.querySelector('.pantalla.activa');
    if (!pantallaActiva) return;

    // Extraer texto
    let textoALeer = "";
    const elementos = pantallaActiva.querySelectorAll('h1, h2, h3, p, li');
    elementos.forEach(el => {
      // Ignorar si está oculto o es una caja de placeholder
      if (el.offsetParent !== null && !el.closest('.video-placeholder') && !el.closest('.imagen-placeholder')) {
        textoALeer += el.innerText + ". ";
      }
    });

    if (!textoALeer.trim()) return;

    window.speechSynthesis.cancel();
    const mensaje = new SpeechSynthesisUtterance(textoALeer);
    
    const vozEspanol = vocesDisponibles.find(v => v.lang.includes('es-MX')) || 
                       vocesDisponibles.find(v => v.lang.includes('es')) || 
                       vocesDisponibles[0];
    
    if (vozEspanol) mensaje.voice = vozEspanol;
    mensaje.lang = 'es-MX';
    mensaje.rate = 1.0;

    mensaje.onstart = () => {
      estaLeyendo = true;
      btnVoz.innerHTML = '⏹'; // Cuadrado de stop
      btnVoz.style.background = '#C1440E'; // Rojo
    };

    mensaje.onend = () => {
      detenerLectura();
    };

    mensaje.onerror = () => {
      detenerLectura();
    };

    window.speechSynthesis.speak(mensaje);
  });

  function detenerLectura() {
    window.speechSynthesis.cancel();
    estaLeyendo = false;
    btnVoz.innerHTML = '🔊';
    btnVoz.style.background = '#1B3A6B'; // Azul
  }

  // Detener lectura automáticamente al cambiar de pantalla
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'class' && mutation.target.classList.contains('pantalla')) {
        if (mutation.target.classList.contains('activa')) {
           detenerLectura();
        }
      }
    });
  });
  
  document.querySelectorAll('.pantalla').forEach(p => {
    observer.observe(p, { attributes: true });
  });
}
