# 🚀 Perplexica - Eine AI-powered Search Engine 🔎 <!-- omit in toc -->

[![Discord](https://dcbadge.limes.pink/api/server/26aArMy8tT?style=flat)](https://discord.gg/26aArMy8tT)

![preview](.assets/perplexica-screenshot.png?)

## Inhaltsverzeichnis <!-- omit in toc -->

- [Überblick](#überblick)
- [Preview](#preview)
- [Features](#features)
- [Installation](#installation)
  - [Erste Schritte mit Docker (Empfohlen)](#erste-schritte-mit-docker-empfohlen)
  - [Installation ohne Docker](#installation-ohne-docker)
  - [Ollama Connection Errors](#ollama-connection-errors)
- [Als Search Engine verwenden](#als-search-engine-verwenden)
- [Perplexica's API verwenden](#perplexicas-api-verwenden)
- [Perplexica im Netzwerk verfügbar machen](#perplexica-im-netzwerk-verfügbar-machen)
- [Kommende Features](#kommende-features)
- [Unterstütze uns](#unterstütze-uns)
  - [Spenden](#spenden)
- [Contribution](#contribution)
- [Hilfe und Support](#hilfe-und-support)

## Überblick

Perplexica ist ein open-source AI-powered Search Tool oder eine AI-powered Search Engine, die tief ins Internet eintaucht, um Antworten zu finden. Inspiriert von Perplexity AI ist es eine open-source Alternative, die nicht nur das Web durchsucht, sondern deine Fragen versteht. Es verwendet fortgeschrittene Machine Learning Algorithmen wie Similarity Searching und Embeddings, um Results zu verfeinern und liefert klare Antworten mit zitierten Sources.

Diese Version wurde vollständig ins Deutsche übersetzt und mit deutschen Lokalisierungsfeatures erweitert, während alle technischen Begriffe beibehalten wurden.

> **Hinweis**: Dieses Repository ist ein Fork des [originalen Perplexica Projekts](https://github.com/ItzCrazyKns/Perplexica) von ItzCrazyKns mit erweiterten deutschen Features und Performance-Optimierungen.

Durch die Verwendung von SearxNG bleibt es aktuell und vollständig open source. Perplexica stellt sicher, dass du immer die neuesten Informationen erhältst, ohne deine Privacy zu kompromittieren.

Willst du mehr über seine Architecture und Funktionsweise erfahren? Du kannst es [hier](https://github.com/ItzCrazyKns/Perplexica/tree/master/docs/architecture/README.md) nachlesen.

## Preview

![video-preview](.assets/perplexica-preview.gif)

## Features

- **Local LLMs**: Du kannst lokale LLMs wie Llama3 und Mixtral mit Ollama verwenden.
- **Zwei Hauptmodi:**
  - **Copilot Mode:** (In Entwicklung) Verbessert die Suche durch das Generieren verschiedener Queries, um relevantere Internet Sources zu finden. Wie eine normale Suche, aber anstatt nur den Context von SearxNG zu verwenden, besucht es die Top Matches und versucht, relevante Sources zur User Query direkt von der Page zu finden.
  - **Normal Mode:** Verarbeitet deine Query und führt eine Web Search durch.
- **Focus Modes:** Spezielle Modi für bessere Antworten auf bestimmte Fragentypen. Perplexica hat derzeit 6 Focus Modes:
  - **All Mode:** Durchsucht das gesamte Web, um die besten Results zu finden.
  - **Writing Assistant Mode:** Hilfreich für Writing Tasks, die keine Web Search erfordern.
  - **Academic Search Mode:** Findet Articles und Papers, ideal für Academic Research.
  - **YouTube Search Mode:** Findet YouTube Videos basierend auf der Search Query.
  - **Wolfram Alpha Search Mode:** Beantwortet Queries, die Berechnungen oder Data Analysis benötigen, mit Wolfram Alpha.
  - **Reddit Search Mode:** Durchsucht Reddit nach Discussions und Opinions zur Query.
- **Optimization Modes:** Verschiedene Performance Modi für unterschiedliche Anforderungen:
  - **Speed Mode:** Schnellste Antworten mit grundlegender Search Depth
  - **Balanced Mode:** Gutes Gleichgewicht zwischen Speed und Quality
  - **Quality Mode:** Umfassendste Analysis und beste Results
- **Deutsche Lokalisierung:** Vollständig übersetzte Benutzeroberfläche auf Deutsch mit intelligenter Region-basierter News Content Auswahl
- **Text-to-Speech Integration:** Hybrid TTS System mit Browser TTS und ElevenLabs Premium Support:
  - Dynamic Voice Selection aus verfügbaren ElevenLabs Voices
  - Model Selection (multilingual_v2, turbo_v2, etc.)
  - Automatic Fallback auf Browser TTS
- **Performance Optimierungen:**
  - Intelligent Caching System für News und Weather Data
  - Background Preloading für bessere User Experience
  - Request Throttling zur Vermeidung von API Limits
- **Security Features:** Input Masking für sensitive Daten (API Keys, URLs) in Settings
- **Enhanced Provider Support:**
  - Multiple Ollama Instances (Standard + Turbo)
  - Erweiterte API Key Management
  - Custom SearxNG Instance Support
- **Aktuelle Informationen:** Manche Search Tools könnten veraltete Infos liefern, weil sie Daten von Crawling Bots verwenden und sie in Embeddings konvertieren und in einem Index speichern. Im Gegensatz dazu verwendet Perplexica SearxNG, eine Metasearch Engine, um Results zu bekommen, sie zu reranken und die relevanteste Source herauszufinden, wodurch sichergestellt wird, dass du immer die neuesten Informationen ohne den Overhead täglicher Data Updates erhältst.
- **API**: Integriere Perplexica in deine bestehenden Applications und nutze seine Capabilities.

Es hat viele weitere Features wie Image und Video Search. Einige der geplanten Features sind in den [kommenden Features](#kommende-features) erwähnt.

## Installation

Es gibt hauptsächlich 2 Wege, Perplexica zu installieren - mit Docker, ohne Docker. Die Verwendung von Docker wird dringend empfohlen.

### Erste Schritte mit Docker (Empfohlen)

1. Stelle sicher, dass Docker auf deinem System installiert ist und läuft.
2. Clone das Perplexica Repository:

   ```bash
   git clone https://github.com/LL4nc33/OidaNice-Perplexica.git
   ```

3. Nach dem Clonen navigiere zum Directory mit den Project Files.

4. Benenne die `sample.config.toml` Datei in `config.toml` um. Für Docker Setups musst du nur folgende Fields ausfüllen:

   - `OPENAI`: Dein OpenAI API Key. **Du musst das nur ausfüllen, wenn du OpenAI's Models verwenden möchtest**.
   - `OLLAMA`: Deine Ollama API URL. Du solltest sie als `http://host.docker.internal:PORT_NUMBER` eingeben. Wenn du Ollama auf Port 11434 installiert hast, verwende `http://host.docker.internal:11434`. Für andere Ports passe entsprechend an. **Du musst das ausfüllen, wenn du Ollama's Models anstatt OpenAI's verwenden möchtest**.
   - `GROQ`: Dein Groq API Key. **Du musst das nur ausfüllen, wenn du Groq's hosted Models verwenden möchtest**.
   - `ANTHROPIC`: Dein Anthropic API Key. **Du musst das nur ausfüllen, wenn du Anthropic Models verwenden möchtest**.
   - `Gemini`: Dein Gemini API Key. **Du musst das nur ausfüllen, wenn du Google's Models verwenden möchtest**.
   - `DEEPSEEK`: Dein Deepseek API Key. **Nur nötig, wenn du Deepseek Models verwenden möchtest.**
   - `AIMLAPI`: Dein AI/ML API Key. **Nur nötig, wenn du AI/ML API Models und Embeddings verwenden möchtest.**
   - `ELEVENLABS`: Dein ElevenLabs API Key. **Nur nötig für Premium Text-to-Speech Features.**

     **Hinweis**: Du kannst diese nach dem Start von Perplexica über den Settings Dialog ändern. Zusätzliche Features wie TTS Provider, News Regions und SearxNG URLs können direkt in den Settings konfiguriert werden.

   - `SIMILARITY_MEASURE`: Das zu verwendende Similarity Measure (Das ist standardmäßig ausgefüllt; du kannst es so lassen, wenn du dir nicht sicher bist.)

5. Stelle sicher, dass du im Directory mit der `docker-compose.yaml` Datei bist und führe aus:

   ```bash
   docker compose up -d
   ```

6. Warte ein paar Minuten, bis das Setup abgeschlossen ist. Du kannst auf Perplexica unter http://localhost:3000 in deinem Web Browser zugreifen.

**Hinweis**: Nach dem Build der Container kannst du Perplexica direkt von Docker starten, ohne ein Terminal öffnen zu müssen.

### Installation ohne Docker

1. Installiere SearXNG und erlaube das `JSON` Format in den SearXNG Settings.
2. Clone das Repository und benenne die `sample.config.toml` Datei in `config.toml` im Root Directory um. Stelle sicher, dass du alle erforderlichen Fields in dieser Datei ausfüllst.
3. Nach dem Ausfüllen der Configuration führe `npm i` aus.
4. Installiere die Dependencies und führe dann `npm run build` aus.
5. Starte schließlich die App mit `npm run start`

**Hinweis**: Docker zu verwenden wird empfohlen, da es den Setup Process vereinfacht, besonders für das Management von Environment Variables und Dependencies.

Siehe die [Installation Documentation](https://github.com/ItzCrazyKns/Perplexica/tree/master/docs/installation) des Original-Projekts für weitere Informationen wie Updates, etc.

### Ollama Connection Errors

Wenn du einen Ollama Connection Error erhältst, liegt es wahrscheinlich daran, dass das Backend sich nicht mit Ollama's API verbinden kann. Um dieses Problem zu beheben, kannst du:

1. **Überprüfe deine Ollama API URL:** Stelle sicher, dass die API URL korrekt im Settings Menu eingestellt ist.
2. **Update API URL basierend auf OS:**

   - **Windows:** Verwende `http://host.docker.internal:11434`
   - **Mac:** Verwende `http://host.docker.internal:11434`
   - **Linux:** Verwende `http://<private_ip_of_host>:11434`

   Passe die Port Number an, wenn du eine andere verwendest.

3. **Linux Users - Ollama zum Network exportieren:**

   - In `/etc/systemd/system/ollama.service` musst du `Environment="OLLAMA_HOST=0.0.0.0:11434"` hinzufügen. (Ändere die Port Number, wenn du eine andere verwendest.) Dann lade die systemd Manager Configuration mit `systemctl daemon-reload` neu und starte Ollama mit `systemctl restart ollama` neu. Für weitere Informationen siehe [Ollama docs](https://github.com/ollama/ollama/blob/main/docs/faq.md#setting-environment-variables-on-linux)

   - Stelle sicher, dass der Port (Standard ist 11434) nicht von deiner Firewall blockiert wird.

## Als Search Engine verwenden

Wenn du Perplexica als Alternative zu traditionellen Search Engines wie Google oder Bing verwenden möchtest, oder wenn du einen Shortcut für schnellen Zugriff aus der Search Bar deines Browsers hinzufügen möchtest, befolge diese Schritte:

1. Öffne die Settings deines Browsers.
2. Navigiere zum 'Search Engines' Bereich.
3. Füge eine neue Site Search mit folgender URL hinzu: `http://localhost:3000/?q=%s`. Ersetze `localhost` mit deiner IP Address oder Domain Name, und `3000` mit der Port Number, falls Perplexica nicht lokal gehostet ist.
4. Klicke den Add Button. Jetzt kannst du Perplexica direkt aus der Search Bar deines Browsers verwenden.

## Perplexica's API verwenden

Perplexica bietet auch eine API für Developer, die seine mächtige Search Engine in ihre eigenen Applications integrieren möchten. Du kannst Searches durchführen, multiple Models verwenden und Antworten auf deine Queries bekommen.

Für weitere Details, schau dir die vollständige API Documentation des [Original-Projekts](https://github.com/ItzCrazyKns/Perplexica/tree/master/docs/API/SEARCH.md) an.

## Perplexica im Netzwerk verfügbar machen

Perplexica läuft auf Next.js und behandelt alle API Requests. Es funktioniert sofort im selben Network und bleibt auch mit Port Forwarding zugänglich.

## Kommende Features

- [x] Settings Page hinzufügen
- [x] Support für lokale LLMs hinzufügen
- [x] History Saving Features
- [x] Verschiedene Focus Modes einführen
- [x] API Support hinzufügen
- [x] Discover hinzufügen
- [x] Optimization Modes (Speed, Balanced, Quality)
- [x] Vollständige deutsche UI Übersetzung und Lokalisierung
- [x] Text-to-Speech Integration (Browser + ElevenLabs)
- [x] Performance Caching für News und Weather
- [x] Security Features (Input Masking)
- [x] Enhanced Provider Support (Ollama Turbo, Custom SearxNG)
- [ ] Copilot Mode finalisieren

## Unterstütze uns

Wenn du Perplexica nützlich findest, erwäge uns einen Star auf GitHub zu geben. Das hilft mehr Leuten, Perplexica zu entdecken und unterstützt die Entwicklung neuer Features. Deine Unterstützung wird sehr geschätzt.

### Spenden

Wir akzeptieren auch Spenden, um unser Projekt zu erhalten. Wenn du beitragen möchtest, kannst du die folgenden Optionen zum Spenden verwenden. Danke für deine Unterstützung!

| Ethereum                                              |
| ----------------------------------------------------- |
| Address: `0xB025a84b2F269570Eb8D4b05DEdaA41D8525B6DD` |

## Contribution

Für Contributions zu dieser deutschen Version verwende bitte dieses Repository. Für das Original-Projekt kannst du die [CONTRIBUTING.md](https://github.com/ItzCrazyKns/Perplexica/blob/master/CONTRIBUTING.md) des ursprünglichen Repositories einsehen.

## Hilfe und Support

Wenn du Fragen oder Feedback hast, zögere nicht, uns zu kontaktieren. Du kannst ein Issue auf GitHub erstellen oder unserem Discord Server beitreten. Dort kannst du dich mit anderen Usern vernetzen, deine Experiences und Reviews teilen und personalisiertere Hilfe erhalten. [Klicke hier](https://discord.gg/EFwsmQDgAu), um dem Discord Server beizutreten. Um Angelegenheiten außerhalb des regulären Supports zu besprechen, kontaktiere mich gerne auf Discord unter `itzcrazykns`.

Danke, dass du Perplexica erkundest, die AI-powered Search Engine, die darauf ausgelegt ist, deine Search Experience zu verbessern. Wir arbeiten ständig daran, Perplexica zu verbessern und seine Capabilities zu erweitern. Wir schätzen dein Feedback und deine Contributions, die uns helfen, Perplexica noch besser zu machen. Vergiss nicht, für Updates und neue Features vorbeizuschauen!
