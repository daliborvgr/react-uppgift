# UC01: Bokningsregistrering (A1)
Detta användningsfall beskriver hur en ny uthyrning registreras i systemet när en kund bokar och hämtar ut ett fordon.
Resultatet blir att en aktiv bokning skapas i databasen med ett unikt bokningsnummer och alla nödvändiga startvärden.
## Aktör
- Användare (Personal via gränssnitt)
- API-anrop
## Förutsättningar
- Det specifika fordonet finns tillgängligt (antagande)
- Fordonskategorin är definierad i systemet
## Input
- Kundens födelsedatum
- Vald fordonskategori
- Tid och datum för uthyrning (start)
- Planerad tid och datum för återlämning (slut)
- Mätarställning vid uthyrning (km)
- Valda tilläggstjänster (Barnstol, GPS, Extra förare) (avvaktar denna)
## Huvudflöde
1. Systemet genererar ett unikt bokningsnummer.
2. Systemet validerar indata (t.ex. att mätarställning inte är negativ).
3. Systemet mappar valda tilläggstjänster till bokningen.
4. Systemet sparar bokningen i databasen med status "Aktiv".
5. Systemet bekräftar att registreringen lyckats och visar bokningsnumret.
## Alternativflöden och felflöden
- 1a.1 Ogiltig fordonskategori.
  - Systemet meddelar att kategorin inte existerar och avbryter processen.
- 1a.2 Planerad återlämning ligger före uthyrningstidpunkt.
  - Systemet returnerar ett felmeddelande om ogiltigt datumintervall.
---
# UC02: Återlämnande av fordon (A2)
Detta användningsfall beskriver processen när en kund lämnar tillbaka fordonet och slutnotan ska beräknas.
Resultatet blir att bokningen avslutas, faktiskt pris beräknas och totalbeloppet presenteras.
## Aktör
- Användare (Personal via gränssnitt)
## Förutsättningar
- En aktiv bokning med gällande bokningsnummer finns i systemet
## Input
- Bokningsnummer
- Tid och datum för faktisk återlämning
- Mätarställning vid återlämning (km)
## Huvudflöde
1. Systemet hämtar bokningsdata baserat på bokningsnummer.
2. Systemet beräknar körda kilometer (slutmätarställning - startmätarställning).
3. Systemet beräknar antal hyresdygn (påbörjade 24-timmarsperioder).
4. Systemet utför prisberäkning:
   - 4.1 Beräknar grundpris baserat på fordonskategorins formel.
   - 4.2 Beräknar pris för valda tilläggstjänster.
   - 4.3 Kontrollerar om förseningsavgift ska tas ut (> 60 min försenat).
   - 4.4 Adderar eventuell premiumavgift (1000 SEK om kategori är Premium).
5. Systemet summerar de avrundade delbeloppen till ett totalpris.
6. Systemet loggar återlämningen, uppdaterar bokningen till status "Avslutad" och returnerar prisdetaljerna.
## Alternativflöden och felflöden
- 2a.1 Bokningsnumret hittas inte.
  - Systemet returnerar "NotFound" och ber användaren kontrollera numret.
- 2a.2 Mätarställning vid återlämning är lägre än vid uthyrning.
  - Systemet ger ett felmeddelande och kräver korrigering av mätarställning.
