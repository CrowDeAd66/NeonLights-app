// Configuração da API
const API_BASE = window.location.origin;

let currentUser = null;
let userLocation = null;
let map = null;
let markers = [];

// Aguarda o carregamento completo do DOM
document.addEventListener('DOMContentLoaded', function() {
    
    // Elementos do DOM
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const loginBtn = document.querySelector('.login-btn');
    const modal = document.getElementById('loginModal');
    const closeModal = document.querySelector('.close');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const navLinks = document.querySelectorAll('.nav-link');
    const loginForm = document.querySelector('.login-form');
    const registerForm = document.querySelector('.register-form');

    // Inicialização
    checkAuthStatus();
    loadEvents();
    initializeGeolocation();

    // Menu Mobile
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });
    }

    // Modal de Login/Registro
    if (loginBtn && modal) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (currentUser) {
                // Se logado, mostrar menu de usuário
                showUserMenu();
            } else {
                // Se não logado, mostrar modal de login
                modal.style.display = 'block';
                document.body.style.overflow = 'hidden';
            }
        });
    }

    if (closeModal && modal) {
        closeModal.addEventListener('click', function() {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }

    // Fecha modal ao clicar fora dele
    if (modal) {
        window.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }

    // Filtros de Eventos
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const filter = this.getAttribute('data-filter');
            loadEvents(filter);
        });
    });

    // Formulário de Login
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Formulário de Registro
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // Aguardar um pouco para garantir que o DOM esteja totalmente carregado
    setTimeout(() => {
        // Alternar entre formulários de login e registro
        const showRegisterBtn = document.getElementById('showRegister');
        const showLoginBtn = document.getElementById('showLogin');
        const loginFormEl = document.querySelector('.login-form');
        const registerFormEl = document.querySelector('.register-form');

        console.log('Elementos encontrados:', {
            showRegisterBtn: !!showRegisterBtn,
            showLoginBtn: !!showLoginBtn,
            loginFormEl: !!loginFormEl,
            registerFormEl: !!registerFormEl
        });

        if (showRegisterBtn && loginFormEl && registerFormEl) {
            showRegisterBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Clicou em Cadastre-se');
                loginFormEl.style.display = 'none';
                registerFormEl.style.display = 'block';
            });
        }

        if (showLoginBtn && loginFormEl && registerFormEl) {
            showLoginBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Clicou em Entrar');
                registerFormEl.style.display = 'none';
                loginFormEl.style.display = 'block';
            });
        }
    }, 500);

    // Também adicionar event delegation para garantir que funcione
    document.addEventListener('click', function(e) {
        if (e.target && e.target.id === 'showRegister') {
            e.preventDefault();
            const loginFormEl = document.querySelector('.login-form');
            const registerFormEl = document.querySelector('.register-form');
            if (loginFormEl && registerFormEl) {
                loginFormEl.style.display = 'none';
                registerFormEl.style.display = 'block';
            }
        }
        
        if (e.target && e.target.id === 'showLogin') {
            e.preventDefault();
            const loginFormEl = document.querySelector('.login-form');
            const registerFormEl = document.querySelector('.register-form');
            if (loginFormEl && registerFormEl) {
                registerFormEl.style.display = 'none';
                loginFormEl.style.display = 'block';
            }
        }
    });

    // Navegação suave
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const offsetTop = target.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Efeito de scroll no header
    const header = document.querySelector('.header');
    let lastScrollTop = 0;

    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });

    // Botão de ativar localização
    const locationBtn = document.querySelector('.map-overlay .btn');
    if (locationBtn) {
        locationBtn.addEventListener('click', function() {
            activateLocation();
        });
    }

    // Botões de download do app
    const downloadBtns = document.querySelectorAll('.hero-buttons .btn, .cta-buttons .btn');
    downloadBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            if (this.textContent.includes('Baixar') || this.textContent.includes('Google Play') || this.textContent.includes('App Store')) {
                e.preventDefault();
                downloadApp();
            } else if (this.textContent.includes('Demo')) {
                e.preventDefault();
                showDemo();
            }
        });
    });

    // Animação de entrada dos elementos
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.event-item, .feature-item, .section-title');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    console.log('🎉 NeonLights carregado com sucesso!');
});

// Funções de API
async function apiRequest(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erro na requisição');
        }

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Verificar status de autenticação
async function checkAuthStatus() {
    try {
        // Para SQLite, verificamos se há uma sessão ativa
        const response = await fetch(`${API_BASE}/api/auth/status`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.user) {
                currentUser = data.user;
                updateUIForLoggedUser();
            } else {
                currentUser = null;
                updateUIForLoggedOutUser();
            }
        } else {
            currentUser = null;
            updateUIForLoggedOutUser();
        }
    } catch (error) {
        console.log('Erro ao verificar autenticação:', error);
        currentUser = null;
        updateUIForLoggedOutUser();
    }
}

// Atualizar UI para usuário logado
function updateUIForLoggedUser() {
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn && currentUser) {
        loginBtn.innerHTML = `<i class="fas fa-user"></i> ${currentUser.username}`;
    }
}

// Atualizar UI para usuário deslogado
function updateUIForLoggedOutUser() {
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn) {
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Entrar';
    }
}

// Handle Login
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const data = await apiRequest('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        currentUser = data.user;
        updateUIForLoggedUser();
        
        const modal = document.getElementById('loginModal');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        showNotification('Login realizado com sucesso!', 'success');
        
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// Handle Register
async function handleRegister(e) {
    e.preventDefault();

    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    try {
        const data = await apiRequest('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, email, password })
        });

        currentUser = data.user;
        updateUIForLoggedUser();

        const modal = document.getElementById('loginModal');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';

        showNotification('Registro realizado com sucesso!', 'success');

    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// Mostrar menu do usuário
function showUserMenu() {
    const userModal = document.createElement('div');
    userModal.className = 'modal';
    userModal.innerHTML = `
        <div class="modal-content" style="max-width: 400px;">
            <span class="close">&times;</span>
            <h2>Meu Perfil</h2>
            <div class="user-info">
                <p><strong>Usuário:</strong> ${currentUser.username}</p>
                <p><strong>Email:</strong> ${currentUser.email}</p>
            </div>
            <div class="user-actions">
                <button class="btn btn-primary" onclick="showCreateEventModal()">Criar Evento</button>
                <button class="btn btn-secondary" onclick="showMyEvents()">Meus Eventos</button>
                <button class="btn btn-secondary" onclick="logout()">Sair</button>
            </div>
        </div>
    `;

    document.body.appendChild(userModal);
    userModal.style.display = 'block';
    document.body.style.overflow = 'hidden';

    const closeBtn = userModal.querySelector('.close');
    closeBtn.addEventListener('click', () => {
        userModal.remove();
        document.body.style.overflow = 'auto';
    });

    userModal.addEventListener('click', (e) => {
        if (e.target === userModal) {
            userModal.remove();
            document.body.style.overflow = 'auto';
        }
    });
}

// Logout
async function logout() {
    try {
        await apiRequest('/api/auth/logout', { method: 'POST' });

        currentUser = null;
        updateUIForLoggedOutUser();
        
        showNotification('Logout realizado com sucesso!', 'success');
        
        // Fecha qualquer modal aberto
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => modal.remove());
        document.body.style.overflow = 'auto';
        
    } catch (error) {
        showNotification('Erro ao fazer logout: ' + error.message, 'error');
    }
}

// Carregar eventos
async function loadEvents(category = 'all') {
    try {
        let endpoint = '/api/events';
        if (category !== 'all') {
            endpoint += `?category=${category}`;
        }
        
        const events = await apiRequest(endpoint);
        displayEvents(events);
        
    } catch (error) {
        console.error('Erro ao carregar eventos:', error);
        showNotification('Erro ao carregar eventos', 'error');
    }
}

// Exibir eventos
function displayEvents(events) {
    const eventsGrid = document.querySelector('.events-grid');
    if (!eventsGrid) return;
    
    eventsGrid.innerHTML = '';
    
    if (events.length === 0) {
        eventsGrid.innerHTML = '<p class="no-events">Nenhum evento encontrado.</p>';
        return;
    }
    
    events.forEach(event => {
        const eventElement = document.createElement('div');
        eventElement.className = 'event-item';
        eventElement.setAttribute('data-category', event.category);
        
        eventElement.innerHTML = `
            <div class="event-image">
                <img src="${event.image_url || 'https://via.placeholder.com/300x200/00FFFF/000000?text=' + encodeURIComponent(event.title)}" alt="${event.title}">
                <div class="event-overlay">
                    <button class="btn btn-small" onclick="showEventDetails('${event.id}')">Ver Detalhes</button>
                </div>
            </div>
            <div class="event-content">
                <h3>${event.title}</h3>
                <p class="event-location"><i class="fas fa-map-marker-alt"></i> ${event.location}</p>
                <p class="event-time"><i class="fas fa-clock"></i> ${event.date} às ${event.time}</p>
                <p class="event-price">R$ ${event.price ? event.price.toFixed(2) : 'Gratuito'}</p>
                <div class="event-tags">
                    <span class="tag">${event.age_restriction || '18+'}</span>
                    <span class="tag">${event.category}</span>
                </div>
            </div>
        `;
        
        eventsGrid.appendChild(eventElement);
    });
}

// Inicializar geolocalização
function initializeGeolocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                userLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };
                console.log('Localização obtida:', userLocation);
                initializeMap(); // Inicializar mapa após obter localização
            },
            function(error) {
                console.log('Erro ao obter localização:', error);
                // Usar localização padrão (São Paulo) se não conseguir obter
                userLocation = {
                    latitude: -23.5505,
                    longitude: -46.6333
                };
                initializeMap();
            }
        );
    } else {
        // Usar localização padrão se geolocalização não for suportada
        userLocation = {
            latitude: -23.5505,
            longitude: -46.6333
        };
        initializeMap();
    }
}

// Inicializar mapa do Google
function initializeMap() {
    // Carregar Google Maps API dinamicamente
    if (!window.google) {
        const script = document.createElement('script');
        script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dOWTgaN2KKd8PI&libraries=places&callback=createMap';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
    } else {
        createMap();
    }
}

// Criar mapa
function createMap() {
    const mapElement = document.getElementById('map-canvas');
    if (!mapElement || !userLocation) return;

    // Remover overlay se existir
    const overlay = document.querySelector('.map-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }

    map = new google.maps.Map(mapElement, {
        center: { lat: userLocation.latitude, lng: userLocation.longitude },
        zoom: 14,
        styles: [
            {
                "elementType": "geometry",
                "stylers": [{"color": "#1d2c4d"}]
            },
            {
                "elementType": "labels.text.fill",
                "stylers": [{"color": "#8ec3b9"}]
            },
            {
                "elementType": "labels.text.stroke",
                "stylers": [{"color": "#1a3646"}]
            },
            {
                "featureType": "administrative.country",
                "elementType": "geometry.stroke",
                "stylers": [{"color": "#4b6878"}]
            },
            {
                "featureType": "administrative.land_parcel",
                "elementType": "labels.text.fill",
                "stylers": [{"color": "#64779e"}]
            },
            {
                "featureType": "administrative.province",
                "elementType": "geometry.stroke",
                "stylers": [{"color": "#4b6878"}]
            },
            {
                "featureType": "landscape.man_made",
                "elementType": "geometry.stroke",
                "stylers": [{"color": "#334e87"}]
            },
            {
                "featureType": "landscape.natural",
                "elementType": "geometry",
                "stylers": [{"color": "#023e58"}]
            },
            {
                "featureType": "poi",
                "elementType": "geometry",
                "stylers": [{"color": "#283d6a"}]
            },
            {
                "featureType": "poi",
                "elementType": "labels.text.fill",
                "stylers": [{"color": "#6f9ba5"}]
            },
            {
                "featureType": "poi",
                "elementType": "labels.text.stroke",
                "stylers": [{"color": "#1d2c4d"}]
            },
            {
                "featureType": "poi.park",
                "elementType": "geometry.fill",
                "stylers": [{"color": "#023e58"}]
            },
            {
                "featureType": "poi.park",
                "elementType": "labels.text.fill",
                "stylers": [{"color": "#3C7680"}]
            },
            {
                "featureType": "road",
                "elementType": "geometry",
                "stylers": [{"color": "#304a7d"}]
            },
            {
                "featureType": "road",
                "elementType": "labels.text.fill",
                "stylers": [{"color": "#98a5be"}]
            },
            {
                "featureType": "road",
                "elementType": "labels.text.stroke",
                "stylers": [{"color": "#1d2c4d"}]
            },
            {
                "featureType": "road.highway",
                "elementType": "geometry",
                "stylers": [{"color": "#2c6675"}]
            },
            {
                "featureType": "road.highway",
                "elementType": "geometry.stroke",
                "stylers": [{"color": "#255763"}]
            },
            {
                "featureType": "road.highway",
                "elementType": "labels.text.fill",
                "stylers": [{"color": "#b0d5ce"}]
            },
            {
                "featureType": "road.highway",
                "elementType": "labels.text.stroke",
                "stylers": [{"color": "#023e58"}]
            },
            {
                "featureType": "transit",
                "elementType": "labels.text.fill",
                "stylers": [{"color": "#98a5be"}]
            },
            {
                "featureType": "transit",
                "elementType": "labels.text.stroke",
                "stylers": [{"color": "#1d2c4d"}]
            },
            {
                "featureType": "transit.line",
                "elementType": "geometry.fill",
                "stylers": [{"color": "#283d6a"}]
            },
            {
                "featureType": "transit.station",
                "elementType": "geometry",
                "stylers": [{"color": "#3a4762"}]
            },
            {
                "featureType": "water",
                "elementType": "geometry",
                "stylers": [{"color": "#0e1626"}]
            },
            {
                "featureType": "water",
                "elementType": "labels.text.fill",
                "stylers": [{"color": "#4e6d70"}]
            }
        ]
    });

    // Adicionar marcador da localização do usuário
    new google.maps.Marker({
        position: { lat: userLocation.latitude, lng: userLocation.longitude },
        map: map,
        title: 'Sua localização',
        icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="8" fill="#00FFFF" stroke="#000" stroke-width="2"/>
                    <circle cx="12" cy="12" r="3" fill="#000"/>
                </svg>
            `),
            scaledSize: new google.maps.Size(24, 24)
        }
    });

    // Buscar pontos de interesse próximos
    searchNearbyPlaces();
}

// Buscar pontos de interesse próximos
function searchNearbyPlaces() {
    if (!map || !userLocation) return;

    const service = new google.maps.places.PlacesService(map);
    const request = {
        location: { lat: userLocation.latitude, lng: userLocation.longitude },
        radius: 5000, // 5km
        types: ['night_club', 'bar', 'restaurant']
    };

    service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            results.slice(0, 10).forEach((place, index) => {
                const marker = new google.maps.Marker({
                    position: place.geometry.location,
                    map: map,
                    title: place.name,
                    icon: {
                        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="16" cy="16" r="12" fill="#FF1493" stroke="#000" stroke-width="2"/>
                                <text x="16" y="20" text-anchor="middle" fill="#FFF" font-size="12" font-weight="bold">🎵</text>
                            </svg>
                        `),
                        scaledSize: new google.maps.Size(32, 32)
                    }
                });

                const infoWindow = new google.maps.InfoWindow({
                    content: `
                        <div style="color: #000;">
                            <h4>${place.name}</h4>
                            <p>Rating: ${place.rating || 'N/A'} ⭐</p>
                            <p>${place.vicinity}</p>
                        </div>
                    `
                });

                marker.addListener('click', () => {
                    infoWindow.open(map, marker);
                });
            });
        }
    });
}

// Ativar localização
function activateLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                userLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };
                showNotification('Localização ativada com sucesso!', 'success');
                loadEvents(); // Recarregar eventos com localização
            },
            function(error) {
                showNotification('Erro ao obter localização: ' + error.message, 'error');
            }
        );
    } else {
        showNotification('Geolocalização não é suportada neste navegador', 'error');
    }
}

// Download do app
function downloadApp() {
    showNotification('Redirecionando para download...', 'info');
    setTimeout(() => {
        window.open('/api/download/neonlights.apk', '_blank');
    }, 1000);
}

// Mostrar demo
function showDemo() {
    showNotification('Demo em desenvolvimento...', 'info');
}

// Sistema de notificações
function showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container') || createNotificationContainer();
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    container.appendChild(notification);
    
    // Auto remove após 5 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
    
    // Botão de fechar
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
}

function createNotificationContainer() {
    const container = document.createElement('div');
    container.id = 'notification-container';
    container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
    `;
    document.body.appendChild(container);
    return container;
}

// Adicionar estilos para notificações
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification {
        background: #1a1a1a;
        color: #fff;
        padding: 15px 20px;
        margin-bottom: 10px;
        border-radius: 8px;
        border-left: 4px solid #00ffff;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        display: flex;
        justify-content: space-between;
        align-items: center;
        min-width: 300px;
        animation: slideIn 0.3s ease;
    }
    
    .notification-success {
        border-left-color: #00ff00;
    }
    
    .notification-error {
        border-left-color: #ff1493;
    }
    
    .notification-info {
        border-left-color: #00ffff;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: #fff;
        font-size: 18px;
        cursor: pointer;
        margin-left: 15px;
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(notificationStyles);
