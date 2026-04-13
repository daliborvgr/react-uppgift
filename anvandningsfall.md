# Kort dokumentation av användningsfall

## A1. Bokningsregistrering

Beskrivning:
När en säljare ska registrera en kunds fordonsbokning ska systemet kunna skapa en ny bokning.

Steg:
1. Säljaren anger kundens personnummer.
2. Säljaren väljer fordonskategori.
3. Säljaren anger starttid och planerad återlämningstid.
4. Säljaren anger mätarställning vid uthyrning.
5. Säljaren väljer eventuella tilläggstjänster.
6. Systemet skickar en bokningsförfrågan till backend och returnerar ett bokningsnummer.

Resultat:
- Bokningen sparas och ett bokningsnummer genereras.
- Information om kund, fordon, tidsintervall, mätarställning och tillägg registreras.

## A2. Återlämning av fordon

Beskrivning:
När en säljare registrerar att ett fordon har återlämnats ska systemet kunna beräkna kostnaden och skapa en återlämningspost.

Steg:
1. Säljaren anger bokningsnummer.
2. Säljaren anger faktisk återlämningstid.
3. Säljaren anger mätarställning vid återlämning.
4. Systemet beräknar uthyrningsdagar, körda kilometer, grundpris, premiumavgift, tilläggsavgifter och eventuellt förseningsavgift.
5. Systemet returnerar en sammanställning av priset.

Resultat:
- Återlämningen registreras.
- Sammanställning av hyrestid, körda kilometer och totalpris presenteras.
