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
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

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
        const response = await apiRequest('/api/auth/check-auth');
        if (response.authenticated) {
            currentUser = response.user;
            updateUIForLoggedUser();
        }
    } catch (error) {
        console.log('Usuário não autenticado');
    }
}

// Atualizar UI para usuário logado
function updateUIForLoggedUser() {
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn && currentUser) {
        loginBtn.innerHTML = `<i class="fas fa-user"></i> ${currentUser.username}`;
    }
}

// Handle Login
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await apiRequest('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        currentUser = response.user;
        updateUIForLoggedUser();
        
        const modal = document.getElementById('loginModal');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        showNotification('Login realizado com sucesso!', 'success');
        
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
        
        const loginBtn = document.querySelector('.login-btn');
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Entrar';
        
        showNotification('Logout realizado com sucesso!', 'success');
        
        // Fecha qualquer modal aberto
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => modal.remove());
        document.body.style.overflow = 'auto';
        
    } catch (error) {
        showNotification('Erro ao fazer logout', 'error');
    }
}

// Carregar eventos
async function loadEvents(category = 'all') {
    try {
        let endpoint = '/api/events';
        if (category !== 'all') {
            endpoint += `?category=${category}`;
        }
        
        // Se temos localização, incluir nas consultas
        if (userLocation) {
            const separator = endpoint.includes('?') ? '&' : '?';
            endpoint += `${separator}lat=${userLocation.latitude}&lng=${userLocation.longitude}`;
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
    
    events.forEach(event => {
        const eventElement = document.createElement('div');
        eventElement.className = 'event-item';
        eventElement.setAttribute('data-category', event.category);
        
        const distanceText = event.distance ? `<p class="event-distance"><i class="fas fa-route"></i> ${event.distance} km</p>` : '';
        
        eventElement.innerHTML = `
            <div class="event-image">
                <img src="${event.image_url || 'https://via.placeholder.com/300x200/00FFFF/000000?text=' + encodeURIComponent(event.title)}" alt="${event.title}">
                <div class="event-overlay">
                    <button class="btn btn-small" onclick="showEventDetails(${event.id})">Ver Detalhes</button>
                </div>
            </div>
            <div class="event-content">
                <h3>${event.title}</h3>
                <p class="event-location"><i class="fas fa-map-marker-alt"></i> ${event.location}</p>
                <p class="event-time"><i class="fas fa-clock"></i> ${event.date} às ${event.time}</p>
                ${distanceText}
                <p class="event-price">R$ ${event.price ? event.price.toFixed(2) : 'Gratuito'}</p>
                <div class="event-tags">
                    <span class="tag">${event.age_restriction || '18+'}</span>
                    <span class="tag">${event.category}</span>
                </div>
            </div>
        `;
        
        eventsGrid.appendChild(eventElement);
    });
    
    // Atualizar mapa se disponível
    if (map && events.length > 0) {
        updateMapMarkers(events);
    }
}

// Mostrar detalhes do evento
async function showEventDetails(eventId) {
    try {
        const event = await apiRequest(`/api/events/${eventId}`);
        
        const eventModal = document.createElement('div');
        eventModal.className = 'modal';
        eventModal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <span class="close">&times;</span>
                <h2>${event.title}</h2>
                <div class="event-details-modal">
                    <div class="event-image-modal">
                        <img src="${event.image_url || 'https://via.placeholder.com/500x300/00FFFF/000000?text=' + encodeURIComponent(event.title)}" alt="${event.title}">
                    </div>
                    <div class="event-info-modal">
                        <p><i class="fas fa-map-marker-alt"></i> <strong>Local:</strong> ${event.location}</p>
                        <p><i class="fas fa-clock"></i> <strong>Data/Hora:</strong> ${event.date} às ${event.time}</p>
                        <p><i class="fas fa-music"></i> <strong>Categoria:</strong> ${event.category}</p>
                        <p><i class="fas fa-users"></i> <strong>Idade:</strong> ${event.age_restriction || '18+'}</p>
                        <p><i class="fas fa-tag"></i> <strong>Preço:</strong> R$ ${event.price ? event.price.toFixed(2) : 'Gratuito'}</p>
                        <p><i class="fas fa-user"></i> <strong>Criado por:</strong> ${event.creator}</p>
                        ${event.distance ? `<p><i class="fas fa-route"></i> <strong>Distância:</strong> ${event.distance} km</p>` : ''}
                        <div class="event-description">
                            <h4>Descrição</h4>
                            <p>${event.description || 'Sem descrição disponível.'}</p>
                        </div>
                        <div class="event-actions">
                            <button class="btn btn-primary" onclick="showPaymentModal('${event.title}', ${event.price || 0})">Comprar Ingresso</button>
                            <button class="btn btn-secondary" onclick="confirmPresence(${event.id})">Confirmar Presença</button>
                            ${event.latitude && event.longitude ? `<button class="btn btn-secondary" onclick="showOnMap(${event.latitude}, ${event.longitude})">Ver no Mapa</button>` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(eventModal);
        eventModal.style.display = 'block';
        document.body.style.overflow = 'hidden';

        const closeBtn = eventModal.querySelector('.close');
        closeBtn.addEventListener('click', () => {
            eventModal.remove();
            document.body.style.overflow = 'auto';
        });

        eventModal.addEventListener('click', (e) => {
            if (e.target === eventModal) {
                eventModal.remove();
                document.body.style.overflow = 'auto';
            }
        });
        
    } catch (error) {
        showNotification('Erro ao carregar detalhes do evento', 'error');
    }
}

// Inicializar geolocalização
function initializeGeolocation() {
    if ('geolocation' in navigator) {
        showNotification('Clique em "Ativar Localização" para ver eventos próximos', 'info');
    } else {
        showNotification('Geolocalização não suportada neste navegador', 'warning');
    }
}

// Ativar localização
function activateLocation() {
    const mapOverlay = document.querySelector('.map-overlay');
    const btn = mapOverlay.querySelector('.btn');
    
    if (!('geolocation' in navigator)) {
        showNotification('Geolocalização não suportada neste navegador', 'error');
        return;
    }
    
    btn.textContent = 'Obtendo localização...';
    btn.disabled = true;
    
    navigator.geolocation.getCurrentPosition(
        async function(position) {
            userLocation = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };
            
            showNotification('Localização obtida com sucesso!', 'success');
            
            // Inicializar mapa
            await initializeMap();
            
            // Recarregar eventos com localização
            const activeFilter = document.querySelector('.filter-btn.active');
            const category = activeFilter ? activeFilter.getAttribute('data-filter') : 'all';
            loadEvents(category);
            
        },
        function(error) {
            btn.textContent = 'Ativar Localização';
            btn.disabled = false;
            
            let errorMessage = 'Erro ao obter localização';
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = 'Permissão de localização negada';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = 'Localização indisponível';
                    break;
                case error.TIMEOUT:
                    errorMessage = 'Timeout ao obter localização';
                    break;
            }
            
            showNotification(errorMessage, 'error');
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
        }
    );
}

// Inicializar Google Maps
async function initializeMap() {
    if (!userLocation) return;
    
    const mapContainer = document.querySelector('.map-placeholder');
    if (!mapContainer) return;
    
    // Criar elemento do mapa
    mapContainer.innerHTML = '<div id="google-map" style="width: 100%; height: 100%; border-radius: 15px;"></div>';
    
    // Carregar Google Maps API
    if (!window.google) {
        await loadGoogleMapsAPI();
    }
    
    // Inicializar mapa
    map = new google.maps.Map(document.getElementById('google-map'), {
        center: { lat: userLocation.latitude, lng: userLocation.longitude },
        zoom: 14,
        styles: [
            {
                "featureType": "all",
                "elementType": "geometry",
                "stylers": [{"color": "#1a1a1a"}]
            },
            {
                "featureType": "all",
                "elementType": "labels.text.fill",
                "stylers": [{"color": "#00ffff"}]
            },
            {
                "featureType": "water",
                "elementType": "geometry",
                "stylers": [{"color": "#0a0a0a"}]
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
                <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="15" cy="15" r="10" fill="#00ffff" stroke="#ffffff" stroke-width="2"/>
                    <circle cx="15" cy="15" r="3" fill="#ffffff"/>
                </svg>
            `),
            scaledSize: new google.maps.Size(30, 30)
        }
    });
    
    // Buscar pontos de interesse próximos
    searchNearbyPlaces();
}

// Carregar Google Maps API
function loadGoogleMapsAPI() {
    return new Promise((resolve, reject) => {
        if (window.google) {
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBOti4mM-6x9WDnZIjIeyEU21OpBXqWBgw&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Buscar pontos de interesse próximos
function searchNearbyPlaces() {
    if (!map || !userLocation) return;
    
    const service = new google.maps.places.PlacesService(map);
    
    const request = {
        location: new google.maps.LatLng(userLocation.latitude, userLocation.longitude),
        radius: 5000,
        type: ['night_club', 'bar', 'restaurant', 'entertainment']
    };
    
    service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            results.slice(0, 10).forEach(place => {
                const marker = new google.maps.Marker({
                    position: place.geometry.location,
                    map: map,
                    title: place.name,
                    icon: {
                        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                            <svg width="25" height="25" viewBox="0 0 25 25" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12.5" cy="12.5" r="8" fill="#ff1493" stroke="#ffffff" stroke-width="2"/>
                                <text x="12.5" y="16" text-anchor="middle" fill="white" font-size="10">🎵</text>
                            </svg>
                        `),
                        scaledSize: new google.maps.Size(25, 25)
                    }
                });
                
                const infoWindow = new google.maps.InfoWindow({
                    content: `
                        <div style="color: #333;">
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

// Atualizar marcadores do mapa
function updateMapMarkers(events) {
    if (!map) return;
    
    // Limpar marcadores existentes
    markers.forEach(marker => marker.setMap(null));
    markers = [];
    
    // Adicionar marcadores dos eventos
    events.forEach(event => {
        if (event.latitude && event.longitude) {
            const marker = new google.maps.Marker({
                position: { lat: event.latitude, lng: event.longitude },
                map: map,
                title: event.title,
                icon: {
                    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                        <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="15" cy="15" r="12" fill="#32cd32" stroke="#ffffff" stroke-width="2"/>
                            <text x="15" y="19" text-anchor="middle" fill="white" font-size="12">🎉</text>
                        </svg>
                    `),
                    scaledSize: new google.maps.Size(30, 30)
                }
            });
            
            const infoWindow = new google.maps.InfoWindow({
                content: `
                    <div style="color: #333; max-width: 200px;">
                        <h4>${event.title}</h4>
                        <p><strong>Data:</strong> ${event.date} às ${event.time}</p>
                        <p><strong>Local:</strong> ${event.location}</p>
                        <p><strong>Preço:</strong> R$ ${event.price ? event.price.toFixed(2) : 'Gratuito'}</p>
                        <button onclick="showEventDetails(${event.id})" style="background: #00ffff; color: #000; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">Ver Detalhes</button>
                    </div>
                `
            });
            
            marker.addListener('click', () => {
                infoWindow.open(map, marker);
            });
            
            markers.push(marker);
        }
    });
}

// Mostrar evento no mapa
function showOnMap(lat, lng) {
    if (map) {
        map.setCenter({ lat, lng });
        map.setZoom(16);
        
        // Scroll para a seção do mapa
        const mapSection = document.getElementById('map');
        if (mapSection) {
            mapSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

// Download do app
function downloadApp() {
    const downloadModal = document.createElement('div');
    downloadModal.className = 'modal';
    downloadModal.innerHTML = `
        <div class="modal-content" style="max-width: 500px; text-align: center;">
            <span class="close">&times;</span>
            <h2>Baixar NeonLights</h2>
            <div class="download-options">
                <p>Escolha sua plataforma:</p>
                <div style="display: flex; gap: 1rem; justify-content: center; margin: 2rem 0;">
                    <button class="btn btn-primary" onclick="downloadAPK()">
                        <i class="fab fa-android"></i>
                        Baixar APK (Android)
                    </button>
                    <button class="btn btn-secondary" onclick="showNotification('Em breve na App Store!', 'info')">
                        <i class="fab fa-apple"></i>
                        iOS (Em breve)
                    </button>
                </div>
                <p style="color: var(--text-secondary); font-size: 0.9rem;">
                    O APK Android permite instalar o app diretamente no seu celular.
                    Certifique-se de permitir instalação de fontes desconhecidas.
                </p>
            </div>
        </div>
    `;

    document.body.appendChild(downloadModal);
    downloadModal.style.display = 'block';
    document.body.style.overflow = 'hidden';

    const closeBtn = downloadModal.querySelector('.close');
    closeBtn.addEventListener('click', () => {
        downloadModal.remove();
        document.body.style.overflow = 'auto';
    });

    downloadModal.addEventListener('click', (e) => {
        if (e.target === downloadModal) {
            downloadModal.remove();
            document.body.style.overflow = 'auto';
        }
    });
}

// Download do APK
function downloadAPK() {
    showNotification('Preparando download do APK...', 'info');
    
    // Simular download (em uma implementação real, isso seria um link para o APK)
    setTimeout(() => {
        const link = document.createElement('a');
        link.href = '/api/download/neonlights.apk';
        link.download = 'NeonLights.apk';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification('Download iniciado! Verifique sua pasta de downloads.', 'success');
    }, 2000);
}

// Mostrar demo
function showDemo() {
    const demoModal = document.createElement('div');
    demoModal.className = 'modal';
    demoModal.innerHTML = `
        <div class="modal-content" style="max-width: 800px;">
            <span class="close">&times;</span>
            <h2>Demo do NeonLights</h2>
            <div class="demo-container">
                <div style="position: relative; width: 100%; height: 450px; background: #000; border-radius: 10px; overflow: hidden;">
                    <iframe 
                        width="100%" 
                        height="100%" 
                        src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen>
                    </iframe>
                </div>
                <p style="margin-top: 1rem; color: var(--text-secondary); text-align: center;">
                    Veja como o NeonLights funciona no seu celular!
                </p>
            </div>
        </div>
    `;

    document.body.appendChild(demoModal);
    demoModal.style.display = 'block';
    document.body.style.overflow = 'hidden';

    const closeBtn = demoModal.querySelector('.close');
    closeBtn.addEventListener('click', () => {
        demoModal.remove();
        document.body.style.overflow = 'auto';
    });

    demoModal.addEventListener('click', (e) => {
        if (e.target === demoModal) {
            demoModal.remove();
            document.body.style.overflow = 'auto';
        }
    });
}

// Modal de pagamento
function showPaymentModal(eventTitle, price) {
    const paymentModal = document.createElement('div');
    paymentModal.className = 'modal';
    paymentModal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <span class="close">&times;</span>
            <h2>Finalizar Compra</h2>
            <div class="payment-form">
                <div class="payment-summary">
                    <h3>Resumo do Pedido</h3>
                    <div class="summary-item">
                        <span>${eventTitle}</span>
                        <span>R$ ${price.toFixed(2)}</span>
                    </div>
                    <div class="summary-item">
                        <span>Taxa de serviço</span>
                        <span>R$ ${(price * 0.1).toFixed(2)}</span>
                    </div>
                    <div class="summary-total">
                        <span>Total</span>
                        <span>R$ ${(price * 1.1).toFixed(2)}</span>
                    </div>
                </div>
                <div class="payment-methods">
                    <h3>Forma de Pagamento</h3>
                    <div class="payment-options">
                        <label class="payment-option">
                            <input type="radio" name="payment" value="pix" checked>
                            <span class="payment-label">
                                <i class="fas fa-qrcode"></i>
                                PIX
                            </span>
                        </label>
                        <label class="payment-option">
                            <input type="radio" name="payment" value="credit">
                            <span class="payment-label">
                                <i class="fas fa-credit-card"></i>
                                Cartão de Crédito
                            </span>
                        </label>
                        <label class="payment-option">
                            <input type="radio" name="payment" value="debit">
                            <span class="payment-label">
                                <i class="fas fa-credit-card"></i>
                                Cartão de Débito
                            </span>
                        </label>
                    </div>
                </div>
                <button class="btn btn-primary btn-full" onclick="processPayment()">Finalizar Pagamento</button>
                <p style="color: var(--text-secondary); font-size: 0.8rem; text-align: center; margin-top: 1rem;">
                    * Esta é uma simulação. Nenhum pagamento real será processado.
                </p>
            </div>
        </div>
    `;

    document.body.appendChild(paymentModal);
    paymentModal.style.display = 'block';
    document.body.style.overflow = 'hidden';

    const closeBtn = paymentModal.querySelector('.close');
    closeBtn.addEventListener('click', () => {
        paymentModal.remove();
        document.body.style.overflow = 'auto';
    });

    paymentModal.addEventListener('click', (e) => {
        if (e.target === paymentModal) {
            paymentModal.remove();
            document.body.style.overflow = 'auto';
        }
    });
}

// Processar pagamento
function processPayment() {
    const selectedPayment = document.querySelector('input[name="payment"]:checked').value;
    
    showNotification('Processando pagamento...', 'info');
    
    setTimeout(() => {
        showNotification(`Pagamento via ${selectedPayment.toUpperCase()} processado com sucesso! (Simulação)`, 'success');
        
        const paymentModal = document.querySelector('.modal');
        if (paymentModal) {
            paymentModal.remove();
            document.body.style.overflow = 'auto';
        }
    }, 2000);
}

// Confirmar presença
function confirmPresence(eventId) {
    if (!currentUser) {
        showNotification('Faça login para confirmar presença', 'warning');
        return;
    }
    
    showNotification('Presença confirmada!', 'success');
}

// Função para mostrar notificações
function showNotification(message, type = 'info') {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;

    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        z-index: 3000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 350px;
        border: 1px solid rgba(255, 255, 255, 0.2);
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => notification.remove(), 300);
    });

    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

function getNotificationIcon(type) {
    switch(type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-circle';
        case 'warning': return 'exclamation-triangle';
        default: return 'info-circle';
    }
}

function getNotificationColor(type) {
    switch(type) {
        case 'success': return 'linear-gradient(45deg, #32cd32, #228b22)';
        case 'error': return 'linear-gradient(45deg, #ff1493, #dc143c)';
        case 'warning': return 'linear-gradient(45deg, #ffd700, #ffa500)';
        default: return 'linear-gradient(45deg, #00ffff, #0080ff)';
    }
}

// Funções globais para serem chamadas pelos botões
window.showEventDetails = showEventDetails;
window.showOnMap = showOnMap;
window.downloadAPK = downloadAPK;
window.processPayment = processPayment;
window.confirmPresence = confirmPresence;
window.logout = logout;
window.showCreateEventModal = function() {
    showNotification('Funcionalidade de criar eventos em desenvolvimento', 'info');
};
window.showMyEvents = function() {
    showNotification('Funcionalidade de meus eventos em desenvolvimento', 'info');
};

// Funcionalidades do formulário de cadastro
document.addEventListener('DOMContentLoaded', function() {
    const registerBtn = document.querySelector('.register-btn');
    const registerModal = document.getElementById('registerModal');
    const loginModal = document.getElementById('loginModal');
    const registerLink = document.querySelector('.register-link');
    const loginLink = document.querySelector('.login-link');
    const registerForm = document.querySelector('.register-form');
    
    // Abrir modal de cadastro pelo botão do menu
    if (registerBtn && registerModal) {
        registerBtn.addEventListener('click', function(e) {
            e.preventDefault();
            openModal(registerModal);
        });
    }
    
    // Navegação entre modais
    if (registerLink && registerModal && loginModal) {
        registerLink.addEventListener('click', function(e) {
            e.preventDefault();
            closeModal(loginModal);
            setTimeout(() => openModal(registerModal), 300);
        });
    }
    
    if (loginLink && loginModal && registerModal) {
        loginLink.addEventListener('click', function(e) {
            e.preventDefault();
            closeModal(registerModal);
            setTimeout(() => openModal(loginModal), 300);
        });
    }
    
    // Fechar modais
    const closeButtons = document.querySelectorAll('.modal .close');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal);
        });
    });
    
    // Fechar modal ao clicar fora
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
    });
    
    // Formulário de cadastro
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Máscaras para campos
    setupInputMasks();
    
    // Validação em tempo real
    setupFormValidation();
});

// Funções auxiliares para modais
function openModal(modal) {
    if (modal) {
        modal.style.display = 'block';
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modal) {
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 300);
    }
}

// Handle do formulário de cadastro
async function handleRegister(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {};
    
    // Coletar dados do formulário
    data.firstName = document.getElementById('firstName').value;
    data.lastName = document.getElementById('lastName').value;
    data.email = document.getElementById('registerEmail').value;
    data.phone = document.getElementById('phone').value;
    data.cpf = document.getElementById('cpf').value;
    data.birthDate = document.getElementById('birthDate').value;
    data.gender = document.getElementById('gender').value;
    data.username = document.getElementById('username').value;
    data.password = document.getElementById('registerPassword').value;
    data.confirmPassword = document.getElementById('confirmPassword').value;
    data.terms = document.getElementById('terms').checked;
    data.newsletter = document.getElementById('newsletter').checked;
    
    // Coletar preferências musicais
    const musicPreferences = [];
    document.querySelectorAll('.checkbox-group input[type="checkbox"]:checked').forEach(checkbox => {
        musicPreferences.push(checkbox.value);
    });
    data.musicPreferences = musicPreferences;
    
    // Validações
    if (!validateRegisterForm(data)) {
        return;
    }
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    try {
        // Simular cadastro (por enquanto fictício)
        await simulateRegister(data);
        
        showNotification('Cadastro realizado com sucesso! Bem-vindo ao NeonLights!', 'success');
        closeModal(document.getElementById('registerModal'));
        
        // Simular login automático
        currentUser = {
            id: 'demo-' + Date.now(),
            username: data.username,
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName
        };
        updateUIForLoggedUser();
        
    } catch (error) {
        showNotification(error.message, 'error');
    } finally {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
}

// Simulação de cadastro (fictício)
async function simulateRegister(data) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simular validação de email único
            if (data.email === 'teste@teste.com') {
                reject(new Error('Este e-mail já está cadastrado'));
                return;
            }
            
            // Simular sucesso
            resolve({
                message: 'Usuário cadastrado com sucesso',
                user: {
                    id: 'demo-' + Date.now(),
                    username: data.username,
                    email: data.email
                }
            });
        }, 2000); // Simular delay de rede
    });
}

// Validação do formulário de cadastro
function validateRegisterForm(data) {
    // Validar campos obrigatórios
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'cpf', 'birthDate', 'gender', 'username', 'password', 'confirmPassword'];
    
    for (const field of requiredFields) {
        if (!data[field] || data[field].trim() === '') {
            showNotification(`O campo ${getFieldLabel(field)} é obrigatório`, 'error');
            return false;
        }
    }
    
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        showNotification('Por favor, insira um e-mail válido', 'error');
        return false;
    }
    
    // Validar CPF (formato básico)
    const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
    if (!cpfRegex.test(data.cpf)) {
        showNotification('Por favor, insira um CPF válido (000.000.000-00)', 'error');
        return false;
    }
    
    // Validar telefone
    const phoneRegex = /^\(\d{2}\) \d{4,5}-\d{4}$/;
    if (!phoneRegex.test(data.phone)) {
        showNotification('Por favor, insira um telefone válido ((11) 99999-9999)', 'error');
        return false;
    }
    
    // Validar idade mínima (16 anos)
    const birthDate = new Date(data.birthDate);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    if (age < 16) {
        showNotification('Você deve ter pelo menos 16 anos para se cadastrar', 'error');
        return false;
    }
    
    // Validar senha
    if (data.password.length < 6) {
        showNotification('A senha deve ter pelo menos 6 caracteres', 'error');
        return false;
    }
    
    // Validar confirmação de senha
    if (data.password !== data.confirmPassword) {
        showNotification('As senhas não coincidem', 'error');
        return false;
    }
    
    // Validar termos
    if (!data.terms) {
        showNotification('Você deve aceitar os Termos de Uso e Política de Privacidade', 'error');
        return false;
    }
    
    return true;
}

// Obter label do campo para mensagens de erro
function getFieldLabel(field) {
    const labels = {
        firstName: 'Nome',
        lastName: 'Sobrenome',
        email: 'E-mail',
        phone: 'Telefone',
        cpf: 'CPF',
        birthDate: 'Data de Nascimento',
        gender: 'Gênero',
        username: 'Nome de Usuário',
        password: 'Senha',
        confirmPassword: 'Confirmação de Senha'
    };
    return labels[field] || field;
}

// Configurar máscaras de entrada
function setupInputMasks() {
    const phoneInput = document.getElementById('phone');
    const cpfInput = document.getElementById('cpf');
    
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length <= 11) {
                value = value.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
                e.target.value = value;
            }
        });
    }
    
    if (cpfInput) {
        cpfInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length <= 11) {
                value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
                e.target.value = value;
            }
        });
    }
}

// Configurar validação em tempo real
function setupFormValidation() {
    const inputs = document.querySelectorAll('.register-form input');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            // Remover classe de erro quando o usuário começar a digitar
            this.classList.remove('error');
        });
    });
}

// Validar campo individual
function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    
    // Validações específicas por campo
    switch (field.id) {
        case 'registerEmail':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            isValid = emailRegex.test(value);
            break;
        case 'cpf':
            const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
            isValid = cpfRegex.test(value);
            break;
        case 'phone':
            const phoneRegex = /^\(\d{2}\) \d{4,5}-\d{4}$/;
            isValid = phoneRegex.test(value);
            break;
        case 'registerPassword':
            isValid = value.length >= 6;
            break;
        case 'confirmPassword':
            const password = document.getElementById('registerPassword').value;
            isValid = value === password;
            break;
    }
    
    // Aplicar classe de erro se inválido
    if (!isValid && value !== '') {
        field.classList.add('error');
    } else {
        field.classList.remove('error');
    }
    
    return isValid;
}

// Função de notificação melhorada
function showNotification(message, type = 'info') {
    // Remover notificação existente
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Adicionar estilos inline para a notificação
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 3000;
        background: ${type === 'success' ? 'var(--neon-green)' : type === 'error' ? '#ff4444' : 'var(--neon-cyan)'};
        color: #000;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        animation: slideInRight 0.3s ease;
        max-width: 400px;
        font-weight: 500;
    `;
    
    document.body.appendChild(notification);
    
    // Fechar notificação
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.remove();
    });
    
    // Auto-remover após 5 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Adicionar animação CSS para notificação
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
    }
    
    .notification-close {
        background: none;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        color: inherit;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .form-group input.error {
        border-color: #ff4444 !important;
        box-shadow: 0 0 10px rgba(255, 68, 68, 0.3) !important;
    }
`;
document.head.appendChild(notificationStyles);
