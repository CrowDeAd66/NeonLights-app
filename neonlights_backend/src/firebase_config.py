type\": \"service_account\", \"project_id\": \"neonlights-demo\", \"private_key_id\": \"dummy\", \"private_key\": \"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n\", \"client_email\": \"dummy@neonlights-demo.iam.gserviceaccount.com\", \"client_id\": \"dummy\", \"auth_uri\": \"https://accounts.google.com/o/oauth2/auth\", \"token_uri\": \"https://oauth2.googleapis.com/token\", \"auth_provider_x509_cert_url\": \"https://www.googleapis.com/oauth2/v1/certs\", \"client_x509_cert_url\": \"https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-dummy.iam.gserviceaccount.com\", \"universe_domain\": \"googleapis.com\"}')

        cred = credentials.Certificate(SERVICE_ACCOUNT_KEY_PATH)
        firebase_admin.initialize_app(cred)
        print("[Firebase] Firebase Admin SDK inicializado com sucesso.")
    except Exception as e:
        print(f"[Firebase] Erro ao inicializar Firebase Admin SDK: {e}")

db = firestore.client()

