# TRWI · LernQuest

Geplante Progressive Web App zur spielerischen Vorbereitung auf TRWI und TRGI im Umfeld der Handwerkskammer Düsseldorf.

**Status:** Projektvorbereitung. Dieses Repository enthält derzeit die Projektbeschreibung, noch keine lauffähige App. Funktionen und Technik unten sind Vorschläge für die Umsetzung, keine bereits implementierten Eigenschaften.

## Ziel

Fachwissen zu Trinkwasser- und Gasinstallationen in kurzen, abwechslungsreichen Missionen verstehen, anwenden und langfristig behalten. Der Einstieg soll leicht sein, Fortschritt sichtbar werden und Wiederholen sich wie Spielen anfühlen.

Die App soll auf dem Smartphone und am Computer funktionieren und sich auf dem Startbildschirm installieren lassen. Sie ist ein unabhängiges Lernprojekt, kein offizielles Angebot der HWK oder des Landesinstallateurausschusses.

## Vorgeschlagenes Spielerlebnis

- **Kurze Missionen:** Eine Runde dauert ungefähr 3 bis 5 Minuten; jederzeit pausierbar.
- **Eine Aufgabe pro Bildschirm:** Klare Sprache, wenig Ablenkung und ein eindeutiger nächster Schritt.
- **Praxisfälle:** An einer Beispielanlage Fehler erkennen und Entscheidungen begründen.
- **Abwechslung:** Begriffe zuordnen, Abläufe sortieren, Rechenwege bearbeiten und Fragen beantworten.
- **Direkte Rückmeldung:** Eine kurze Erklärung zeigt, warum eine Antwort richtig ist und wo der Denkfehler liegt.
- **Fortschritt:** Erfahrungspunkte, freigeschaltete Missionen und sichtbare Themenfortschritte.
- **Wiederholungen:** Unsichere Inhalte kommen gezielt wieder; sichere Inhalte in größeren Abständen.
- **Pausen ohne Strafe:** Keine verlorenen Serien, Leben oder Punkte durch Auszeiten.
- **Reizarme Bedienung:** Animationen und Sound abschaltbar; Lernrunden standardmäßig ohne Zeitlimit.
- **Prüfungstraining:** Ein eigener Modus nach bestätigten Prüfungsbedingungen.

Punkte sind Spielbelohnungen. Sie sind kein Nachweis der Prüfungsreife. Der fachliche Fortschritt soll sich aus wiederholt selbstständig gelösten Aufgaben ergeben.

## Fachlicher Rahmen

Die öffentlich beschriebenen Fernlehrgänge der HWK Düsseldorf dienen als erste Themenorientierung. Die öffentlich zugänglichen Beschreibungen ersetzen keinen vollständigen Prüfungsplan.

### TRGI: Gas

Die acht Lehrbriefe behandeln Grundlagen, Sicherheit und Begriffe, Werkstoffe, Leitungsdimensionierung, Leitungsanlagen, Geräteanschluss und Verbrennungsluft, Gerätetechnik und Abgasführung sowie sicherheitstechnische Bewertung und Inbetriebnahme.

### TRWI: Trinkwasser

Die zehn Lehrbriefe behandeln Versorgung und Begriffe, Werkstoffe, Dimensionierung, Leitungsanlagen, Trinkwasserschutz, Warmwasseranlagen, Prüfung und Inbetriebnahme, besondere Versorgungsanlagen, Bewässerung und den Schutz der Entwässerungsanlagen.

### Lehrgang und Prüfung unterscheiden

Die HWK beschreibt für TRGI einen schriftlichen Leistungsnachweis im Fernlehrgang. Die gesonderte Prüfung des Landesinstallateurausschusses NRW gehört ausdrücklich nicht zum Fernlehrgang. Für die App müssen deshalb der konkrete Abschluss, die aktuellen Prüfungsbedingungen und die verwendeten Regelwerksausgaben bestätigt werden.

**Noch offen:** konkreter Kurs, Prüfungstermin, Umfang und Form der Prüfung, zulässige Hilfsmittel, Bewertung, aktuelle Lehrbriefe und freigegebene Übungsaufgaben.

### Quellen

Recherchiert am 02.11.2026:

- [HWK Düsseldorf: TRGI – Gastechnik](https://www.hwk-duesseldorf.de/artikel/trgi-gastechnik-31%2C0%2C539.html)
- [HWK Düsseldorf: TRWI – Wassertechnik](https://www.hwk-duesseldorf.de/artikel/trwi-wassertechnik-31%2C0%2C538.html)
- [HWK Düsseldorf: Fernlehrgänge](https://www.hwk-duesseldorf.de/artikel/fernlehrgaenge-flexibel-zu-hause-lernen-31%2C0%2C778.html)

## Qualität der Lerninhalte

Jede spätere Fachaufgabe soll Thema, Lernziel, Erklärung, Quelle mit Fundstelle, Regelwerksstand und Prüfstatus enthalten.

- Selbst erstellte Übungsaufgaben dürfen nicht als offizielle Prüfungsfragen bezeichnet werden.
- Fachliche Werte und sicherheitsrelevante Aussagen benötigen eine belastbare Quelle und fachliche Prüfung.
- Ungeprüfte Beispielaufgaben werden als solche gekennzeichnet und zählen nicht zur Prüfungsabdeckung.
- Originale Lehrbriefe, Normtexte und Prüfungsunterlagen werden nur mit entsprechenden Nutzungsrechten übernommen. Ein öffentliches Repository ist kein Ablageort für geschützte Kursunterlagen.
- Prüfungsbereitschaft oder vollständige Stoffabdeckung werden erst ausgewiesen, wenn ein bestätigter Prüfungsrahmen mit dem geprüften Aufgabenbestand abgeglichen wurde.

## Vorschlag für die erste Version

1. **Grundlagen klären:** Kursunterlagen und Prüfungsziel zu einer Themen- und Lernzielübersicht zuordnen.
2. **Spielbare Lernrunde:** Themenauswahl Gas/Wasser, kurze Mission, Antwortauswertung, Erklärung und Rundenabschluss.
3. **Fortschritt sichern:** Lokale Speicherung, gezielte Wiederholungen sowie Export und Import des Lernstands.
4. **PWA ergänzen:** Installation, Offline-Nutzung bereits gespeicherter Inhalte und nachvollziehbare Updates.
5. **Inhalte ausbauen:** Fachlich geprüfte Praxisfälle, Rechenaufgaben und unterschiedliche Aufgabenformen.
6. **Prüfungstraining ergänzen:** Format, Dauer, Bewertung und Hilfsmittel nach dem bestätigten Prüfungsrahmen.

### Technischer Vorschlag

React, TypeScript und Vite für die Oberfläche; ein Service Worker für Offline-Nutzung; IndexedDB für Lernstand und Inhalte. Zum Start ohne Konto und ohne Backend. Geräteübergreifende Synchronisation wäre ein späterer, gesonderter Ausbau.

Die technische Entscheidung und das konkrete Spielkonzept sind noch abzustimmen.

## Nächster Schritt

Das Missionskonzept und den verfügbaren Lernstoff konkretisieren. Danach folgen ein überprüfbarer Entwurf und die Umsetzung der ersten spielbaren Runde.
