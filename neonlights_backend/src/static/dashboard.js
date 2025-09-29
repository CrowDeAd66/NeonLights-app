// Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const menuBtn = document.getElementById('menuBtn');
    const sideMenu = document.getElementById('sideMenu');
    const menuOverlay = document.getElementById('menuOverlay');
    const closeMenu = document.getElementById('closeMenu');
    const filterBtn = document.getElementById('filterBtn');
    const filterModal = document.getElementById('filterModal');
    const mapBtn = document.getElementById('mapBtn');
    const mapModal = document.getElementById('mapModal');
    const walletBtn = document.getElementById('walletBtn');
    const walletModal = document.getElementById('walletModal');
    const eventDetailsModal = document.getElementById('eventDetailsModal');
    const hotEventsCarousel = document.getElementById('hotEventsCarousel');
    const eventsGrid = document.getElementById('eventsGrid');
    const loadingMore = document.getElementById('loadingMore');

    // Variáveis globais
    let currentPage = 1;
    let isLoading = false;
    let map = null;
    let currentFilters = {};
    let allEvents = [];
    let hotEvents = [];

    // Dados fictícios dos eventos
    const eventImages = [
        '1000005503.jpg', // Orion Festival
        '1000005502.jpg', // Open da Cucko
        '1000005501.jpg'  // Baile Emo
    ];

    const musicStyles = ['eletronica', 'rock', 'funk', 'sertanejo', 'pop', 'reggae', 'hip-hop', 'emo', 'psytrance'];
    const venues = [
        'Opinião', 'Cucko', 'Plataforma', 'Ocidente', 'Dado Bier', 'Pepsi on Stage', 
        'Bar do Beto', 'Loft', 'Usina do Gasômetro', 'Auditório Araújo Vianna',
        'Casa de Cultura Mario Quintana', 'Theatro São Pedro', 'Anfiteatro Pôr do Sol',
        'Complexo Cultural do Porto Seco', 'Arena do Grêmio'
    ];

    const eventNames = [
        'Open da Cucko', 'Baile Emo', 'Orion Festival', 'Neon Night', 'Electric Dreams',
        'Rock Revolution', 'Funk Explosion', 'Sertanejo Roots', 'Pop Sensation', 
        'Reggae Vibes', 'Hip-Hop Underground', 'Emo Revival', 'Psytrance Journey',
        'Techno Madness', 'House Party', 'Trance Universe', 'Dubstep Attack',
        'Indie Rock Fest', 'Jazz Night', 'Blues Session', 'Country Roads',
        'Latin Beats', 'Afro Rhythms', 'Electronic Pulse', 'Alternative Scene',
        'Metal Storm', 'Punk Chaos', 'Disco Fever', 'Retro Wave', 'Future Bass'
    ];

    // Coordenadas de Porto Alegre
    const portoAlegreCoords = [-30.0346, -51.2177];
    const eventLocations = [
        { lat: -30.0346, lng: -51.2177, name: 'Centro' },
        { lat: -30.0277, lng: -51.2287, name: 'Cidade Baixa' },
        { lat: -30.0394, lng: -51.2094, name: 'Bom Fim' },
        { lat: -30.0498, lng: -51.1781, name: 'Moinhos de Vento' },
        { lat: -30.0568, lng: -51.1731, name: 'Auxiliadora' },
        { lat: -30.0123, lng: -51.2065, name: 'Floresta' },
        { lat: -30.0456, lng: -51.1956, name: 'Rio Branco' },
        { lat: -30.0789, lng: -51.1234, name: 'Zona Sul' },
        { lat: -29.9876, lng: -51.2543, name: 'Zona Norte' },
        { lat: -30.0612, lng: -51.1789, name: 'Petrópolis' }
    ];

    // Gerar eventos fictícios
    function generateEvents(count, isHot = false) {
        const events = [];
        for (let i = 0; i < count; i++) {
            const location = eventLocations[Math.floor(Math.random() * eventLocations.length)];
            const venue = venues[Math.floor(Math.random() * venues.length)];
            const musicStyle = musicStyles[Math.floor(Math.random() * musicStyles.length)];
            const eventName = eventNames[Math.floor(Math.random() * eventNames.length)];
            const imageIndex = Math.floor(Math.random() * eventImages.length);
            
            // Gerar data aleatória nos próximos 30 dias
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + Math.floor(Math.random() * 30));
            
            // Gerar horário aleatório entre 18h e 23h
            const hour = 18 + Math.floor(Math.random() * 6);
            futureDate.setHours(hour, 0, 0, 0);
            
            // Gerar preço aleatório
            const basePrice = isHot ? 80 + Math.floor(Math.random() * 200) : 30 + Math.floor(Math.random() * 150);
            
            const event = {
                id: `event_${Date.now()}_${i}`,
                title: `${eventName} ${i > 0 ? i + 1 : ''}`.trim(),
                description: `Uma noite incrível de ${musicStyle} no ${venue}. Prepare-se para uma experiência única com os melhores DJs e artistas da cena. Ambiente climatizado, bar completo e muito mais!`,
                date: futureDate,
                location: {
                    lat: location.lat + (Math.random() - 0.5) * 0.01,
                    lng: location.lng + (Math.random() - 0.5) * 0.01,
                    address: `${venue}, ${location.name}, Porto Alegre - RS`
                },
                venue: venue,
                price: basePrice,
                image: eventImages[imageIndex],
                musicStyle: musicStyle,
                ageRestriction: Math.random() > 0.5 ? '18+' : '16+',
                capacity: 200 + Math.floor(Math.random() * 800),
                isHot: isHot
            };
            
            events.push(event);
        }
        return events;
    }

    // Inicializar dados
    function initializeData() {
        hotEvents = generateEvents(5, true);
        allEvents = [...hotEvents, ...generateEvents(25, false)];
        
        displayHotEvents();
        displayEvents();
    }

    // Exibir eventos HOT
    function displayHotEvents() {
        hotEventsCarousel.innerHTML = '';
        
        // Criar eventos em loop infinito (duplicar para efeito de loop)
        const eventsToShow = [...hotEvents, ...hotEvents];
        
        eventsToShow.forEach((event, index) => {
            const eventCard = createHotEventCard(event, index);
            hotEventsCarousel.appendChild(eventCard);
        });
        
        // Configurar scroll infinito para eventos HOT
        setupHotEventsInfiniteScroll();
    }

    // Criar card de evento HOT
    function createHotEventCard(event, index) {
        const card = document.createElement('div');
        card.className = 'hot-event-card';
        card.onclick = () => showEventDetails(event);
        
        card.innerHTML = `
            <img src="${event.image}" alt="${event.title}" class="hot-event-image">
            <div class="hot-event-overlay"></div>
            <div class="hot-event-info">
                <div class="hot-event-title">${event.title}</div>
                <div class="hot-event-datetime">${formatDateTime(event.date)}</div>
            </div>
            <div class="hot-event-price">R$ ${event.price}</div>
        `;
        
        return card;
    }

    // Configurar scroll infinito para eventos HOT
    function setupHotEventsInfiniteScroll() {
        let scrollPosition = 0;
        const scrollSpeed = 1;
        const cardWidth = 320; // 300px + 20px gap
        const totalWidth = cardWidth * hotEvents.length;
        
        function autoScroll() {
            scrollPosition += scrollSpeed;
            
            if (scrollPosition >= totalWidth) {
                scrollPosition = 0;
            }
            
            hotEventsCarousel.scrollLeft = scrollPosition;
            requestAnimationFrame(autoScroll);
        }
        
        // Pausar auto-scroll quando o mouse estiver sobre o carrossel
        hotEventsCarousel.addEventListener('mouseenter', () => {
            hotEventsCarousel.style.animationPlayState = 'paused';
        });
        
        hotEventsCarousel.addEventListener('mouseleave', () => {
            hotEventsCarousel.style.animationPlayState = 'running';
        });
        
        // Iniciar auto-scroll
        setTimeout(() => autoScroll(), 3000);
    }

    // Exibir eventos do catálogo
    function displayEvents(reset = false) {
        if (reset) {
            eventsGrid.innerHTML = '';
            currentPage = 1;
        }
        
        const startIndex = (currentPage - 1) * 12;
        const endIndex = startIndex + 12;
        const eventsToShow = getFilteredEvents().slice(startIndex, endIndex);
        
        eventsToShow.forEach(event => {
            const eventCard = createEventCard(event);
            eventsGrid.appendChild(eventCard);
        });
        
        currentPage++;
    }

    // Criar card de evento
    function createEventCard(event) {
        const card = document.createElement('div');
        card.className = 'event-card';
        card.onclick = () => showEventDetails(event);
        
        card.innerHTML = `
            <img src="${event.image}" alt="${event.title}" class="event-image">
            <div class="event-content">
                <div class="event-title">${event.title}</div>
                <div class="event-datetime">${formatDateTime(event.date)}</div>
                <div class="event-location">${event.venue}, ${event.location.address.split(',')[1]}</div>
                <div class="event-price">R$ ${event.price}</div>
            </div>
        `;
        
        return card;
    }

    // Obter eventos filtrados
    function getFilteredEvents() {
        let filtered = [...allEvents];
        
        if (currentFilters.musicStyle && currentFilters.musicStyle.length > 0) {
            filtered = filtered.filter(event => 
                currentFilters.musicStyle.includes(event.musicStyle)
            );
        }
        
        if (currentFilters.maxPrice) {
            filtered = filtered.filter(event => event.price <= currentFilters.maxPrice);
        }
        
        if (currentFilters.date) {
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const weekEnd = new Date(today);
            weekEnd.setDate(weekEnd.getDate() + 7);
            const monthEnd = new Date(today);
            monthEnd.setMonth(monthEnd.getMonth() + 1);
            
            switch (currentFilters.date) {
                case 'hoje':
                    filtered = filtered.filter(event => 
                        event.date.toDateString() === today.toDateString()
                    );
                    break;
                case 'amanha':
                    filtered = filtered.filter(event => 
                        event.date.toDateString() === tomorrow.toDateString()
                    );
                    break;
                case 'semana':
                    filtered = filtered.filter(event => 
                        event.date >= today && event.date <= weekEnd
                    );
                    break;
                case 'mes':
                    filtered = filtered.filter(event => 
                        event.date >= today && event.date <= monthEnd
                    );
                    break;
            }
        }
        
        if (currentFilters.time) {
            filtered = filtered.filter(event => {
                const hour = event.date.getHours();
                switch (currentFilters.time) {
                    case 'tarde':
                        return hour >= 14 && hour < 18;
                    case 'noite':
                        return hour >= 18 && hour < 23;
                    case 'madrugada':
                        return hour >= 23 || hour < 6;
                    default:
                        return true;
                }
            });
        }
        
        if (currentFilters.ageRestriction) {
            filtered = filtered.filter(event => 
                event.ageRestriction === currentFilters.ageRestriction
            );
        }
        
        return filtered;
    }

    // Formatar data e hora
    function formatDateTime(date) {
        const options = {
            weekday: 'short',
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        };
        return date.toLocaleDateString('pt-BR', options);
    }

    // Mostrar detalhes do evento
    function showEventDetails(event) {
        const modalBody = document.querySelector('.event-details-body');
        modalBody.innerHTML = `
            <img src="${event.image}" alt="${event.title}" class="event-details-image">
            <div class="event-details-info">
                <h3>${event.title}</h3>
                <p><strong>Data:</strong> ${formatDateTime(event.date)}</p>
                <p><strong>Local:</strong> ${event.location.address}</p>
                <p><strong>Estilo Musical:</strong> ${event.musicStyle.charAt(0).toUpperCase() + event.musicStyle.slice(1)}</p>
                <p><strong>Restrição de Idade:</strong> ${event.ageRestriction}</p>
                <p><strong>Capacidade:</strong> ${event.capacity} pessoas</p>
                <p><strong>Descrição:</strong> ${event.description}</p>
            </div>
            <div class="event-details-price">R$ ${event.price}</div>
            <button class="btn btn-primary btn-full">Comprar Ingresso</button>
        `;
        eventDetailsModal.style.display = 'block';
    }

    // Configurar scroll infinito
    function setupInfiniteScroll() {
        window.addEventListener('scroll', () => {
            if (isLoading) return;
            
            const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
            
            if (scrollTop + clientHeight >= scrollHeight - 5) {
                loadMoreEvents();
            }
        });
    }

    // Carregar mais eventos
    function loadMoreEvents() {
        if (isLoading) return;
        
        const filteredEvents = getFilteredEvents();
        const startIndex = (currentPage - 1) * 12;
        
        if (startIndex >= filteredEvents.length) return;
        
        isLoading = true;
        loadingMore.style.display = 'block';
        
        setTimeout(() => {
            displayEvents();
            isLoading = false;
            loadingMore.style.display = 'none';
        }, 1000);
    }

    // Configurar mapa
    function initializeMap() {
        if (map) {
            map.remove();
        }
        
        map = L.map('map').setView(portoAlegreCoords, 12);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        
        // Adicionar pins dos eventos
        allEvents.forEach(event => {
            const marker = L.marker([event.location.lat, event.location.lng]).addTo(map);
            
            marker.bindPopup(`
                <div style="text-align: center; min-width: 200px;">
                    <img src="${event.image}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 5px; margin-bottom: 10px;">
                    <h4 style="margin: 0 0 5px 0; color: #333;">${event.title}</h4>
                    <p style="margin: 0 0 5px 0; font-size: 12px; color: #666;">${formatDateTime(event.date)}</p>
                    <p style="margin: 0 0 10px 0; font-size: 12px; color: #666;">${event.venue}</p>
                    <p style="margin: 0; font-weight: bold; color: #00ffff;">R$ ${event.price}</p>
                </div>
            `);
            
            marker.on('click', () => {
                showEventDetails(event);
                mapModal.style.display = 'none';
            });
        });
    }

    // Event Listeners

    // Menu lateral
    menuBtn.addEventListener('click', () => {
        sideMenu.classList.add('active');
        menuOverlay.classList.add('active');
    });

    closeMenu.addEventListener('click', () => {
        sideMenu.classList.remove('active');
        menuOverlay.classList.remove('active');
    });

    menuOverlay.addEventListener('click', () => {
        sideMenu.classList.remove('active');
        menuOverlay.classList.remove('active');
    });

    // Filtros
    filterBtn.addEventListener('click', () => {
        filterModal.style.display = 'block';
    });

    // Mapa
    mapBtn.addEventListener('click', () => {
        mapModal.style.display = 'block';
        setTimeout(() => {
            initializeMap();
        }, 100);
    });

    // Carteira
    walletBtn.addEventListener('click', () => {
        walletModal.style.display = 'block';
    });

    // Fechar modais
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', (e) => {
            e.target.closest('.modal').style.display = 'none';
        });
    });

    // Fechar modal clicando fora
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });

    // Formulário de filtros
    document.querySelector('.filter-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const musicStyleSelect = document.getElementById('musicStyle');
        const selectedStyles = Array.from(musicStyleSelect.selectedOptions).map(option => option.value);
        
        currentFilters = {
            musicStyle: selectedStyles,
            maxPrice: parseInt(document.getElementById('priceRange').value),
            date: document.getElementById('eventDate').value,
            time: document.getElementById('eventTime').value,
            ageRestriction: document.getElementById('ageRestriction').value
        };
        
        displayEvents(true);
        filterModal.style.display = 'none';
    });

    // Limpar filtros
    document.getElementById('clearFilters').addEventListener('click', () => {
        currentFilters = {};
        document.querySelector('.filter-form').reset();
        document.getElementById('priceValue').textContent = '150';
        displayEvents(true);
    });

    // Slider de preço
    document.getElementById('priceRange').addEventListener('input', (e) => {
        document.getElementById('priceValue').textContent = e.target.value;
    });

    // Botões de valor da carteira
    document.querySelectorAll('.amount-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.amount-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            document.getElementById('customAmount').value = btn.dataset.amount;
        });
    });

    // Adicionar saldo
    document.getElementById('addFundsBtn').addEventListener('click', () => {
        const amount = document.getElementById('customAmount').value || 
                     document.querySelector('.amount-btn.selected')?.dataset.amount;
        
        if (amount) {
            alert(`Funcionalidade de pagamento em desenvolvimento. Valor selecionado: R$ ${amount}`);
            walletModal.style.display = 'none';
        } else {
            alert('Por favor, selecione um valor para adicionar.');
        }
    });

    // Abas de usuário/produtor
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabType = btn.dataset.tab;
            
            // Atualizar abas ativas
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Mostrar/ocultar formulários
            document.getElementById('usuario-form').style.display = tabType === 'usuario' ? 'block' : 'none';
            document.getElementById('produtor-form').style.display = tabType === 'produtor' ? 'block' : 'none';
        });
    });

    // Inicializar aplicação
    initializeData();
    setupInfiniteScroll();
});
