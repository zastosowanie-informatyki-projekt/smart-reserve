# Smart-reserve

Aplikacja do zarządzania restauracjami i rezerwacjami, zbudowana w Next.js (App Router).

## Stack technologiczny

- **Framework:** Next.js 16 (App Router)
- **Baza danych:** PostgreSQL + Prisma ORM
- **Autentykacja:** Better Auth (logowanie przez Google)
- **UI:** shadcn/ui + Tailwind CSS
- **AI:** Groq (chat, copilot planu sali)

## Wymagania

- **Node.js** 20 lub nowszy
- **npm** (lub yarn/pnpm)
- **PostgreSQL** — lokalna baza lub zdalna (np. Neon, Supabase)
- **Konto Google Cloud** — logowanie przez Google OAuth
- **Klucz API Groq** — opcjonalnie, potrzebny do funkcji AI (chat, copilot planu sali)

## Uruchomienie

### 1. Sklonuj repozytorium

```bash
git clone https://github.com/zastosowanie-informatyki-projekt/smart-reserve
cd smart-reserve
```

### 2. Utwórz plik `.env`

W katalogu głównym projektu utwórz plik `.env`:

```env
DATABASE_URL="postgresql://USER:HASLO@localhost:5432/NAZWA_BAZY"

BETTER_AUTH_SECRET="losowy-sekret-minimum-32-znaki"
BETTER_AUTH_URL="http://localhost:3000"

GOOGLE_ID="twoj-google-client-id"
GOOGLE_SECRET="twoj-google-client-secret"

GROQ_API_KEY="twoj-klucz-groq"
GROQ_MODEL="openai/gpt-oss-120b"
```

| Zmienna                       | Opis                                                                              |
| ----------------------------- | --------------------------------------------------------------------------------- |
| `DATABASE_URL`                | Connection string do PostgreSQL                                                   |
| `BETTER_AUTH_SECRET`          | Sekret do szyfrowania sesji (min. 32 znaki). Wygeneruj: `openssl rand -base64 32` |
| `BETTER_AUTH_URL`             | Bazowy URL aplikacji                                                              |
| `GOOGLE_ID` / `GOOGLE_SECRET` | Dane OAuth z Google Cloud Console                                                 |
| `GROQ_API_KEY`                | Klucz API Groq — bez niego funkcje AI nie działają                                |
| `GROQ_MODEL`                  | Opcjonalny model Groq (domyślnie: `openai/gpt-oss-120b`)                          |

W Google Cloud Console ustaw redirect URI: `http://localhost:3000/api/auth/callback/google`

### 3. Zainstaluj zależności

```bash
npm install
```

### 4. Uruchom migracje bazy danych

```bash
npx prisma migrate dev
```

Polecenie utworzy tabele w PostgreSQL i wygeneruje klienta Prisma.

### 5. Uruchom serwer deweloperski

```bash
npm run dev
```

Aplikacja będzie dostępna pod adresem [http://localhost:3000](http://localhost:3000).

## Produkcja

```bash
npm run build
npm start
```

`npm start` uruchamia zbudowaną wersję produkcyjną. Do codziennej pracy używaj `npm run dev`.

## Przydatne komendy

| Komenda                  | Opis                             |
| ------------------------ | -------------------------------- |
| `npm run dev`            | Serwer deweloperski              |
| `npm run build`          | Budowanie aplikacji produkcyjnej |
| `npm start`              | Uruchomienie zbudowanej wersji   |
| `npm run lint`           | Sprawdzenie ESLint               |
| `npx prisma migrate dev` | Migracje bazy danych (dev)       |
| `npx prisma studio`      | GUI do przeglądania bazy         |
