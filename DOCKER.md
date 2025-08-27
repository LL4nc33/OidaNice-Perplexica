# Docker Setup

## Einfache Installation

```bash
# Repository klonen
git clone https://github.com/LL4nc33/OidaNice-Perplexica.git
cd OidaNice-Perplexica

# Konfiguration erstellen
cp sample.config.toml config.toml
# config.toml mit deinen API Keys ausfüllen

# Starten (verwendet automatisch vorgefertigtes Image)
docker compose up -d
```

Fertig! Perplexica läuft unter http://localhost:3000

## Alternative: Selbst bauen

Falls du das Image selbst bauen möchtest, ändere in `docker-compose.yaml`:

```yaml
# Statt image: verwende:
build:
  context: .
  dockerfile: app.dockerfile
```

## Nützliche Befehle

```bash
# Container stoppen
docker compose down

# Logs anzeigen
docker compose logs -f app

# Neustart
docker compose restart
```