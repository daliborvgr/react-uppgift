# Kort dokumentation av antaganden och avgränsningar

## Antaganden

- Backend-API:et finns tillgängligt på `http://localhost:8080`.
- Fordonskategorier är fasta och kan representeras med ett `id` och en `category`.
- Körsträcka anges i hela kilometer.
- Alla tider skickas som tidsstämplar i samma tidszon.
- Premiumavgift gäller endast för kategorin `Premium` och beräknas per dag.
- Tillvalspriser är fasta och beroende av typ av tjänst.

## Avgränsningar

- Frontend hanterar endast bokning och återlämning, inte betalning eller fakturering.
- Det finns ingen användarautentisering i den här lösningen.
- Endast en fordonskategori visas per typ i användargränssnittet.
- Det finns inget verkligt lagerhanteringssystem för fordonstillgänglighet.
- Systemet tar inte hänsyn till olika prisnivåer beroende på säsong eller plats.
- Inga avancerade valideringar görs på personnummer utöver att fältet är ifyllt.
- Mock-data används för test innan backend är färdig.
