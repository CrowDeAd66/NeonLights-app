# 🎵 NeonLights - Aplicativo de Eventos Noturnos

![NeonLights Logo](https://via.placeholder.com/400x200/00FFFF/000000?text=NeonLights)

**NeonLights** é um aplicativo web moderno para descoberta de eventos noturnos, festas e shows. Com uma interface neon vibrante e funcionalidades avançadas, conecta pessoas aos melhores eventos da cidade.

## ✨ Funcionalidades

### 🔐 **Autenticação**
- Sistema completo de registro e login
- Suporte para login social (Google, Instagram, Spotify)
- Gerenciamento de sessões seguras

### 🎉 **Eventos**
- Catálogo de eventos com filtros por categoria
- Geolocalização real com Google Maps
- Eventos próximos baseados na sua localização
- Categorias: Eletrônica, Rock, Funk, Pop, Reggae, Hip-Hop

### 🗺️ **Mapa Interativo**
- Google Maps integrado com tema neon
- Marcadores de eventos e pontos de interesse
- Busca de estabelecimentos próximos (bares, casas noturnas)
- Cálculo de distâncias em tempo real

### 📱 **Design Responsivo**
- Interface moderna com estética neon
- Animações suaves e micro-interações
- Totalmente responsivo para mobile e desktop
- PWA (Progressive Web App) ready

## 🛠️ Tecnologias Utilizadas

### **Backend**
- **Flask** - Framework web Python
- **SQLite** - Banco de dados (temporário)
- **Supabase** - Backend-as-a-Service (planejado)
- **Flask-CORS** - Suporte a requisições cross-origin

### **Frontend**
- **HTML5/CSS3** - Estrutura e estilização
- **JavaScript ES6+** - Interatividade e funcionalidades
- **Google Maps API** - Mapas e geolocalização
- **Font Awesome** - Ícones

### **Infraestrutura**
- **Git** - Controle de versão
- **GitHub** - Repositório e colaboração
- **Manus Deploy** - Deploy e hospedagem

## 🚀 Como Executar

### **Pré-requisitos**
- Python 3.11+
- pip (gerenciador de pacotes Python)
- Git

### **Instalação**

1. **Clone o repositório:**
```bash
git clone https://github.com/seu-usuario/neonlights-app.git
cd neonlights-app
```

2. **Instale as dependências:**
```bash
cd neonlights_backend
pip install -r requirements.txt
```

3. **Execute o aplicativo:**
```bash
python src/main.py
```

4. **Acesse no navegador:**
```
http://localhost:5000
```

## 🎯 Eventos Disponíveis

### 🎵 **Open da Cucko**
- **Categoria:** Funk
- **Descrição:** A festa mais insana de Porto Alegre com muito funk e open bar a noite toda!
- **Preço:** A partir de R$ 35,00
- **Local:** Porto Alegre, RS

### 🖤 **Baile Emo**  
- **Categoria:** Rock
- **Descrição:** Reviva a era emo com os maiores hits do rock alternativo e punk rock
- **Preço:** A partir de R$ 25,00
- **Local:** São Paulo, SP

### ⚡ **Orion Festival**
- **Categoria:** Eletrônica
- **Descrição:** O maior festival de música eletrônica da região com DJs renomados
- **Preço:** A partir de R$ 120,00
- **Local:** Rio de Janeiro, RJ

## 🔧 Configuração

### **Google Maps API**
Para usar o mapa, você precisa de uma chave da Google Maps API:

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um projeto e ative a Maps JavaScript API
3. Gere uma chave de API
4. Substitua a chave no arquivo `script.js`

### **Supabase (Futuro)**
Para integração completa com Supabase:

1. Crie uma conta no [Supabase](https://supabase.com/)
2. Crie um novo projeto
3. Configure as variáveis de ambiente com as credenciais

## 📁 Estrutura do Projeto

```
neonlights-app/
├── neonlights_backend/
│   ├── src/
│   │   ├── static/
│   │   │   ├── images/events/
│   │   │   ├── index.html
│   │   │   ├── styles.css
│   │   │   └── script.js
│   │   ├── templates/
│   │   ├── models/
│   │   ├── routes/
│   │   └── main.py
│   └── requirements.txt
├── neonlights-mobile/ (Cordova)
├── .gitignore
└── README.md
```

## 🎨 Design System

### **Cores**
- **Primária:** `#00FFFF` (Ciano Neon)
- **Secundária:** `#FF1493` (Magenta Neon)
- **Fundo:** `#0a0a0a` (Preto)
- **Texto:** `#ffffff` (Branco)

### **Tipografia**
- **Títulos:** Orbitron (Futurista)
- **Corpo:** Inter (Legibilidade)

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Equipe

- **Desenvolvedor Principal:** CrowDeAd
- **Design:** Equipe NeonLights
- **Backend:** Flask + Supabase
- **Frontend:** HTML/CSS/JavaScript

## 🔗 Links

- **Demo:** [https://0vhlizcgwwlj.manus.space](https://0vhlizcgwwlj.manus.space)
- **Repositório:** [GitHub](https://github.com/seu-usuario/neonlights-app)
- **Documentação:** [Wiki](https://github.com/seu-usuario/neonlights-app/wiki)

---

**Powered by CrowDeAd** ⚡

*Conectando pessoas aos melhores eventos noturnos desde 2024*
