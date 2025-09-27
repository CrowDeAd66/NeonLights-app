from flask import Blueprint, send_file, jsonify, abort
import os

download_bp = Blueprint('download', __name__)

@download_bp.route('/download/neonlights.apk', methods=['GET'])
def download_apk():
    """Simula o download do APK do NeonLights"""
    try:
        # Em uma implementação real, aqui seria o caminho para o APK compilado
        # Por enquanto, vamos criar um arquivo de demonstração
        
        apk_path = os.path.join(os.path.dirname(__file__), '..', 'static', 'neonlights-demo.apk')
        
        # Cria um arquivo de demonstração se não existir
        if not os.path.exists(apk_path):
            with open(apk_path, 'w') as f:
                f.write("""
# NeonLights APK Demo
# Este é um arquivo de demonstração
# Em uma implementação real, este seria o APK compilado do aplicativo NeonLights
# 
# Para instalar:
# 1. Baixe este arquivo
# 2. Ative "Fontes desconhecidas" nas configurações do Android
# 3. Instale o APK
#
# Funcionalidades incluídas:
# - Interface neon responsiva
# - Geolocalização real
# - Integração com Google Maps
# - Sistema de autenticação
# - Gerenciamento de eventos
# - Notificações push (simuladas)
#
# Powered by CrowDeAd
""")
        
        return send_file(
            apk_path,
            as_attachment=True,
            download_name='NeonLights.apk',
            mimetype='application/vnd.android.package-archive'
        )
        
    except Exception as e:
        return jsonify({'error': 'Erro ao baixar APK'}), 500

@download_bp.route('/download/info', methods=['GET'])
def download_info():
    """Informações sobre o download do aplicativo"""
    return jsonify({
        'app_name': 'NeonLights',
        'version': '1.0.0',
        'size': '15.2 MB',
        'min_android_version': '5.0 (API 21)',
        'permissions': [
            'Localização (GPS)',
            'Internet',
            'Armazenamento',
            'Câmera (para fotos de perfil)',
            'Notificações'
        ],
        'features': [
            'Descoberta de eventos próximos',
            'Mapa interativo com pontos de interesse',
            'Sistema de autenticação seguro',
            'Interface neon responsiva',
            'Filtros por categoria musical',
            'Compra de ingressos (simulada)',
            'Confirmação de presença',
            'Notificações de eventos'
        ],
        'installation_steps': [
            '1. Baixe o arquivo APK',
            '2. Vá em Configurações > Segurança',
            '3. Ative "Fontes desconhecidas"',
            '4. Abra o arquivo APK baixado',
            '5. Toque em "Instalar"',
            '6. Aguarde a instalação',
            '7. Abra o app NeonLights'
        ],
        'note': 'Esta é uma versão de demonstração. Funcionalidades de pagamento são simuladas.'
    }), 200
