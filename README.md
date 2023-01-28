# NextJS Customer Manager

## 0. Tech Stack

- NextJS v13
- TypeScript
- Chakra UI
- React Hook Form
- SWR (stale-while-revalidate)
- Prisma ORM
- [Sentry](https://sentry.io/) error tracking
- React Table v7
- Pino logger (with [pino-pretty](https://github.com/pinojs/pino-pretty))

## 1. Descrizione del progetto

### 1.1. Introduzione

Questo progetto è stato basato sul risultato del progetto scorso [NextJS JWT authentication boilerplate](https://github.com/lucadibello/nextjs-jwt-auth-boilerplate), il quale ha riscontrato un interesse da parte di molti utenti utilizzatori di NextJS, React e tecnologie correlate (quasi 50 star su GitHub).

Ho dovuto modificare l'AuthContext e l'API di login in quanto la consegna del progetto richiedeva di utilizzare il database Chinook, un database di esempio per il software di gestione del database Microsoft SQL Server. Il database Chinook contiene informazioni su un negozio di musica, come ad esempio i clienti, gli album, i brani, i generi musicali, i fatturati, ecc...

Ho dovuto eseguire queste modifiche al database Chinook per renderlo compatibile con il boilerplate:

1. Ho aggiunto una colonna "password" alla tabella "Customer" per salvare la password dell'utente.
2. Aggiunto campo "role" alla tabella "Customer" per salvare il ruolo dell'utente (manager, normale).
3. Aggiunto il campo "refresh_token" alla tabella "Customer" per salvare il refresh token dell'utente ed evitare attacchi di tipo [CSRF](https://it.wikipedia.org/wiki/Cross-site_request_forgery).
4. Aggiunto *unique contraint* alla colonna "email" della tabella "Customer" per evitare che un utente possa registrarsi con lo stesso indirizzo email.

Nota: tutte le feature legate alla "two-factor authetication", le quali erano già presenti all'interno del boilerplate, sono state rimosse in quanto non richieste dalla consegna del progetto.

### 1.2. Implementazione tracciabilità errori ed operazioni

Per implementare la tracciabilità necessarie, ho utilizzato una soluzione SaaS chiamata [Sentry](http://sentry.io), uno strumento di tracciamento degli errori in tempo reale che aiuta gli sviluppatori a monitorare e risolvere i crash in tempo reale. Attraverso la dashboard di Sentry, è possibile sia visualizzare tutti gli errori che si verificano nel server (con la possibilità di filtrare gli errori per tipo, data, stack trace, ecc...) sia visualizzare le operazioni svolte dal server (es: login, logout, registrazione, ecc...) e le chiamate API effettuate dal client, mostrando anche informazioni come la frequenza con cui vengono effettuate le chiamate, il tempo di risposta, chi ha effettuato la chiamata, ecc...

Per esempio, questo screenshot mostra le informazioni relative all'API per il fetch dei customers:

![Sentry Customers API](./docs/images/sentry_customers_api.png)

Ho anche aggiunto un logger personalizzato per loggare le operazioni svolte nel server, utilizzando il modulo [pino](https://github.com/pinojs/pino) e il suo plugin [pino-pretty](https://github.com/pinojs/pino-pretty) per renderlo più leggibile (di default Pino logga in formato JSON).

### 1.3. Fix problema di sicurezza

Ho aggiunto alcune funzionalità al sistema per migliorare la sicurezza, salvando i token JWT in due posti diversi: il **refresh token** all'interno del localStorage (accessibile solo dal client) e l'altro all'interno di un cookie chiamato "*token*" (accessibile sia dal client che dal server in quanto inviato insieme ad ogni richiesta).

Inizialmente il refresh token era salvato all'interno di un cookie chiamato "*refresh-token*", ma ha portato ad alcuni problemi di sicurezza, come ad esempio il fatto che il refresh token è accessibile sia dal client che dal server, quindi se un attaccante fosse riuscito ad accedere al cookie, avrebbe potuto utilizzare il refresh token per ottenere un nuovo access token e accedere alle risorse protette.

### 1.4. Implementazione Progressive Web App

Infine, per dare all'utente un *look and feel* simile a quello che l'utente avrebbe utilizzando una vera applicazione, ho deciso di convertire il progetto in una PWA ([Progressive Web App](https://web.dev/progressive-web-apps/)) per renderlo più simile a un'applicazione nativa rendendola installabile su vari dispositivi del client (Laptop, PC, Table, Smartphone) e, per la maggior parte delle funzionalità, funzionante offline con l'utilizzo di un [service worker](https://web.dev/learn/pwa/service-workers/).
Per farlo, ho utilizzato il modulo next-pwa, un plugin di NextJS che consente di aggiungere facilmente funzionalità PWA alla propria applicazione NextJS. Ho anche generato tutte le icone mascherabili necessarie usando [maskable.app](https://maskable.app/) e ho aggiunto il file manifest.json alla cartella public, sistemando anche il file middleware.ts per consentire all'utente di accedere ai file richiesti anche quando non è loggato (per impostazione predefinita, ogni pagina ha accesso protetto).

Per evitare problemi (ex: richieste HTTP che rispondono con chiamate salvate in cache), il service worker viene disabilitato in modalità sviluppo (quando si utilizza `yarn dev`, controllo eseguito con questa logica: `process.env.NODE_ENV === 'development'`).

L'applicazione è installabile cliccando sul pulsante "Install" presente nella barra di navigazione, come mostrato nella seguente immagine:

![Install button](./docs/images/pwa_install.png)

Così è come appare l'applicazione installata sul mio PC:

![PWA installed on Desktop](./docs/images/pwa_desktop.png)

E così è come appare l'applicazione installata su uno smartphone:

![PWA installed on Mobile](./docs/images/pwa_mobile.png)

Si può vedere che l'applicazione PWA all'utente appare come un'applicazione nativa, con un'icona e un nome personalizzati. Infatti, persino nel app switcher l'applicazione appare come un'applicazione nativa:

![PWA installed on Mobile](./docs/images/pwa_mobile_app_switcher.png)

**Problema encoding caratteri speciali**: Il problema di codifica è dovuto dal fatto che sto utilizzando una versione di React-Tables che non supporta la codifica UTF-8, quindi non è possibile visualizzare correttamente i caratteri speciali. Al momento sto utilizzando una versione di NextJS ancora in beta (NextJS v.13) che supporta React-Tables v.7, ma non è ancora disponibile una versione stabile di NextJS che supporti React-Tables v.8, che supporta la codifica UTF-8.

### 1.5 Validazione dati lato server

Per la validazione dei dati lato server, ho utilizzato il modulo [yup](https://github.com/jquense/yup), la libreria di validazione di dati più popolare per JavaScript. Ho utilizzato questo modulo per validare sia i dati inviati dal client al server, sia i dati che vengono salvati nel database.

### 1.6. Performance

Ho eseguito un assessment della performance della webapp utilizzando il tool [Lighthouse](https://developers.google.com/web/tools/lighthouse) di Google, che fornisce un report sulle prestazioni, l'accessibilità, la SEO e la migliore pratica per le Progressive Web App.

Questo è il risultato:

![Lighthouse report](./docs/images/lighthouse_result.png)

Come si può vedere, la webapp ha un ottimo score per quanto riguarda l'accessibilità e le best pratices, mentre per quanto riguarda le prestazioni (ovvero il tempo di caricamento della pagina) e la SEO, il punteggio è un po' più basso, ma comunque accettabile. Questo è dovuto al fatto che lo scopo di questo progetto non è quello di creare una webapp con un ottimo score per quanto riguarda le prestazioni, ma di creare una webapp che rispetti i requisiti richiesti dal progetto utilizzando tecniche state-of-the-art, utilizzate a livello professionale.

## 1.7. Footprint webapp

Questa webapp ha un footprint veramente minimo, questo grazie a tutte le ottimizzazioni eseguite durante il build del progetto (es: code splitting, tree shaking, minificazione, etc...). Questo è il risultato del comando 'yarn build`:

```sh
Route (pages)                              Size     First Load JS
┌ λ /                                      34.9 kB         289 kB
├   /_app                                  0 B             223 kB
├ λ /404                                   6.78 kB         229 kB
├ λ /api/challenge/start                   0 B             223 kB
├ λ /api/change-password                   0 B             223 kB
├ λ /api/customers                         0 B             223 kB
├ λ /api/login                             0 B             223 kB
├ λ /api/me                                0 B             223 kB
├ λ /api/refresh                           0 B             223 kB
├ ○ /login                                 1.4 kB          232 kB
└ ○ /profile                               4.31 kB         259 kB
+ First Load JS shared by all              223 kB
  ├ chunks/framework-ffee79c6390da51e.js   45.7 kB
  ├ chunks/main-972b3d2d3e6e8a7c.js        34.3 kB
  ├ chunks/pages/_app-005bf9e1593bc12d.js  141 kB
  ├ chunks/webpack-f4e692136d6f1094.js     1.48 kB
  └ css/ab44ce7add5c3d11.css               247 B

ƒ Middleware                               29.6 kB

λ  (Server)  server-side renders at runtime (uses getInitialProps or getServerSideProps)
○  (Static)  automatically rendered as static HTML (uses no initial props)
```

NextJS offre molte funzionalità *enterprise level*, infatti è un Framework utilizzato da molti grandi player del settore, come ad esempio: Netflix, Uber, Twitch, etc...

Per avere ulteriori informazioni, questa è la documentazione ufficiale di NextJS, dove spiega del compiler e del build process: <https://nextjs.org/docs/advanced-features/compiler>

### 1.8. Error handling

Oltre ad aver aggiunto Sentry per il tracking degli errori, ho anche aggiunto una pagina di errore personalizzata, che viene mostrata quando si verifica un errore non gestito. Essa viene mostrata in automatico da NextJS quando viene lanciato un errore che non è stato gestito.

Per ulteriori informazioni: <https://nextjs.org/docs/advanced-features/custom-error-page>

### 1.9. Code analysis

Durante tutto il processo di sviluppo della webapp è stato utilizzato [**ESLint**](https://eslint.org) per analizzare ed aiutare a identificare e correggere gli errori di codifica e i problemi di qualità del codice. È altamente personalizzabile e supporta una vasta gamma di plugin per adattarsi a diverse esigenze.

Siccome ESLint non controlla possibili vulnerabilità di sicurezza, ho dovuto utilizzare un tool aggiuntivo per questo scopo. Ne esistono diversi, ma ho scelto [**Snyk**](https://snyk.io) perché è gratuito per progetti open source e perché è molto semplice da utilizzare.

### 1.10. Risk assessment

#### 1.10.1. Rischi principali

Il sistema è stato progettato per essere sicuro, affidabile e scalabile. In quanto il numero di API è molto limitato e tutte le richieste inoltrate al server vengono dapprima autenticate, autorizzate ed infine validate, la superficie di attacco è molto limitata.
Inoltre, NextJS non ha il concetto di REST API, ma di [Serverless functions](https://vercel.com/docs/concepts/functions/serverless-functions), ovvero funzioni che vengono eseguite in un ambiente isolato e che non hanno accesso al filesystem, quindi non possono essere utilizzate per eseguire attacchi di tipo [Server-Side Request Forgery](https://owasp.org/www-community/attacks/Server_Side_Request_Forgery) oppure di tipo [Code Injection](https://owasp.org/www-community/attacks/Code_Injection).

Attacchi di tipo [SQL Injection](https://www.prisma.io/docs/concepts/components/prisma-client/raw-database-access#sql-injection) non sono possibili, in quanto non vengono utilizzate query SQL direttamente, ma vengono utilizzate le funzionalità di [Prisma ORM](https://www.prisma.io/), che permette di utilizzare query SQL in modo sicuro.

Non sono stati identificati rischi significativi ma possono essere identificati i seguenti rischi che, sebbene in parte non siano direttamente correlati dall'applicazione, possono essere utilizzati per compromettere la sicurezza della webapp:

- **Rischio 1 (ALTO)**: I progetti basati su pacchetti open source sono soggetti a vulnerabilità di sicurezza, che possono essere utilizzate per compromettere la sicurezza dell'applicazione. Per ovviare a questo rischio, ho utilizzato il comando `yarn audit` per verificare se ci sono vulnerabilità di sicurezza nei pacchetti utilizzati. Inoltre, ho aggiunto un GitHub Action che esegue questo comando ad ogni push, in modo da essere sicuri che non ci siano vulnerabilità di sicurezza nei pacchetti utilizzati e, se ci fossero, che vengano risolte in modo tempestivo.

- **Rischio 2 (BASSO)**: Sia gli access token i refresh token sono memorizzati lato client in modo sicuro ma, se un attaccante riuscisse ad avere accesso fisico al client (ex: [Remote Access Trojan](https://www.malwarebytes.com/blog/threats/remote-access-trojan-rat) / [USB RubberDucky](https://shop.hak5.org/products/usb-rubber-ducky)), potrebbe clonare entrambi i token di access permettendo all'attaccante (nel peggiore dei casi) 30 giorni di accesso all'applicazione (la durata di vita del refresh token è di default 30 giorni). Questo rischio è stato classificato come basso, in quanto se un attaccante riuscisse ad avere accesso fisico al client, potrebbe anche installare un keylogger e ottenere le credenziali dell'utente, che potrebbe utilizzare per accedere all'applicazione senza aver bisogno di clonare alcun token.

- **Rischio 3 (MEDIO)**: Manca una protezione contro attacchi di tipo bruteforce. Se un attaccante potrebbe utilizzare un attacco di tipo bruteforce per provare un gran numero di combinazioni di password al fine di ottenere con la forza bruta (*bruteforce*) l'accesso all'account di un determinato utente. Per ovviare a questo rischio, si dovrebbe implementare un sistema di protezione contro gli attacchi di tipo bruteforce, come ad esempio l'utilizzo di un sistema di autenticazione a più fattori, la limitazione del numero di tentativi di accesso non riusciti (come fanno tutti gli smartphone) o la temporizzazione dell'accesso dopo un numero specifico di tentativi falliti.

- **Rischio 4 (MEDIO)**: Gli attacchi DDoS sono attacchi che mirano a saturare il server con richieste in modo da impedire l'accesso ai servizi offerti dal server stesso. Questo potrebbe essere fatto richiamando un gran numero di volte una determinata API, oppure richiamando un gran numero di API diverse. Per ovviare a questo rischio, si dovrebbe implementare un sistema di protezione contro gli attacchi DDoS, come ad esempio l'utilizzo di un sistema di caching, l'utilizzo di un sistema di rate limiting o l'utilizzo di un sistema di protezione DDoS come ad esempio [Cloudflare](https://www.cloudflare.com/).

## 3. Getting Started

### 3.1 Prerequisiti

- Node.js v14.17.0 or superiore
- Yarn v1.22.10 or superiore
- PostgreSQL v13.3 or superiore

### 3.2 Configurazione

#### 3.2.1 Installare pacchetti Node.js

```sh
yarn install
```

Oppure, se si utilizza `npm`:

```sh
npm install
```

#### 3.2.2. (Opzionale) Creare un nuovo container Docker per PostgreSQL
  
```sh
docker run --name nextjs-customer-auth -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres
```

#### 3.2.3. Rinominare file `.env.example`  in `.env` e modificare le variabili d'ambiente

```sh
cp .env.example .env
```

#### 3.2.4. Push schema database e seeding aggiuntivo
  
```sh
yarn prisma db push
```

### 3.2.5. Seeding manuale del database

Dato che il lo script di seeding è enorme (15631 inserimenti) ed è difficile gestirlo attraverso Prisma ho preferito utilizzare il comando `psql` offerto da PostgreSQL (molto più performante).

Per eseguire il seeding senza preoccupazioni / problemi all'interno del container Docker creato al punto **3.2.2**, ho creato uno script bash che automatizza il processo. Per eseguirlo, basta eseguire il seguente comando:

```sh
bash ./prisma/sql/import-toolkit.sh nextjs-customer-auth ./prisma/sql/chinook-postgres.sql
```

#### 3.2.5. Start the development server

```sh
yarn dev
```

## 4. Risposta a domande richieste

### 4.1 

## 4. Demo del progetto

Per rendere il progetto disponibile online senza dover pagare un hosting, ho utilizzato 

Il progetto è stato deployato su un server self-hosted a casa mia