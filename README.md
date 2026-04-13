# Biluthyrning Frontend

En React-baserad frontend för biluthyrning som stödjer:

- Bokningsregistrering med kundnummer, fordonskategori, tid, mätarställning och tilläggstjänster
- Återlämning med prisberäkning för uthyrningsdagar, körda kilometer, premiummavgift, tillägg och förseningsavgift
- Integration mot API:er på `http://localhost:8080`

## Kom igång

1. Installera beroenden:

```bash
npm install
```

2. Starta utvecklingsservern:

```bash
npm run dev
```

3. För att testa utan backend, använd mock-API:et som redan är aktiverat i `.env`:

```bash
VITE_USE_MOCK_API=true npm run dev
```

4. Kör tester:

```bash
npm test
```

## Struktur

- `src/App.tsx`: UI och formulärlogik
- `src/api.ts`: kommunikation med backend
- `src/utils/pricing.ts`: affärslogik för prisberäkning
- `src/App.css`: styling
- `src/utils/pricing.test.ts`: enhetstester för prisberäkning
