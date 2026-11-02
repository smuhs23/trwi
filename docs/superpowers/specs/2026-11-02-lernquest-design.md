# LernQuest: Quest-Abenteuer mit eigener Werkstatt

Stand: 02.11.2026. Status: Entwurf zur Freigabe, noch keine implementierte App.

## Ziel und bestätigte Richtung

Eine installierbare PWA soll die Vorbereitung auf TRGI und TRWI spielerisch gestalten. Bestätigt sind Quests, Level, Herausforderungen und Belohnungen sowie die Kombination aus Quest-Abenteuer und Werkstatt-Simulator. Fachwissen muss zum Lösen der Spielaufgaben gebraucht werden. Kurze, verständliche Interaktionen und ein leichter Wiedereinstieg haben Vorrang.

Alle nachfolgenden konkreten Zahlen, technischen Entscheidungen und Umfangsgrenzen sind Vorschläge des Entwurfs.

## Betrachtete Ansätze

1. Quest-Abenteuer: schneller Einstieg und klarer Fortschritt, aber wenig bleibende Veränderung außerhalb der Karte.
2. Werkstatt-Simulator: sichtbarer Aufbau und zusammenhängende Aufträge, aber höherer Umfang und Gefahr ablenkender Betriebsverwaltung.
3. Gewählte Kombination: Eine Quest-Kampagne verdient Belohnungen für eine sichtbare Werkstatt. Die Werkstatt bleibt übersichtlich und verursacht keine laufenden Kosten oder Verwaltungsarbeit.

## Spielwelt und Ablauf

Die Spielfigur übernimmt einen kleinen virtuellen Fachbetrieb. Eine Karte zeigt Kundenaufträge in den Bereichen Gas und Wasser. Abgeschlossene Aufträge entwickeln die Werkstatt sichtbar weiter.

Die zentrale Schleife lautet: Auftrag auswählen, drei bis fünf Aufgaben lösen, kurze fachliche Rückmeldungen erhalten, den Auftrag abschließen, XP und Werkstattmarken erhalten, einen Ausbau auswählen.

Eine normale Quest dauert ungefähr drei bis fünf Minuten. Ein Kapitel endet mit einer Boss-Mission, die bereits geübte Fähigkeiten in einem Kundenfall kombiniert. Boss-Missionen dürfen länger sein und bleiben pausierbar. Ein Beispiel ist ein virtueller Technikraum, in dem Auffälligkeiten erkannt, Bauteile zugeordnet und Arbeitsschritte geordnet werden. Es werden keine echten Anlagen gesteuert.

## Erste spielbare Version

Ein durchgängiges TRGI-Einstiegskapitel mit vier normalen Quests und einer Boss-Mission, insgesamt ungefähr 20 bis 25 eigenständig formulierten Aufgaben. Es erprobt die gesamte Schleife einschließlich einer ausbaubaren Werkstatt. Es behauptet keine vollständige Prüfungsabdeckung.

Die Kapitelstruktur ist für acht TRGI-Themen vorgesehen. TRWI bleibt sichtbar als angekündigter Bereich, bis geeignete Inhalte vorliegen. Der erste Prototyp kann mit klar markierten Demo-Inhalten funktionieren; ungeprüfte Aufgaben zählen nicht zum fachlichen Fortschritt. Der Ausbau auf beide vollständigen Fachbereiche bleibt das Projektziel.

Drei Aufgabenformen in der ersten Version:

- Eine oder mehrere Antworten auswählen, mit expliziter Kennzeichnung der erwarteten Auswahlform.
- Elemente per Tippen zuordnen oder Schritte ordnen; Tastaturbedienung und Schaltflächen bieten Alternativen zum Ziehen.
- Fehler in einer eigens erstellten schematischen Szene finden; eine gleichwertige textuelle Variante ist verfügbar.

Schrittweise Rechenaufgaben folgen im nächsten Inhaltsausbau und sind für die vollständige Vorbereitung erforderlich. Sie gehören nicht zur ersten spielbaren Runde. Freie Textantworten mit KI-Bewertung sind zunächst ausgeschlossen.

## Ansichten und Bedienung

Vier Hauptbereiche: Aufträge, Werkstatt, Fortschritt und Einstellungen. Die App startet mit einem klaren Weiterspielen-Einstieg und höchstens drei empfohlenen Aufträgen. Der Quest-Bildschirm zeigt eine Aufgabe, den Fortschritt der Runde und eine Hinweisfunktion. Nach jeder Antwort erscheint eine kurze Erklärung; weitere Details sind ausklappbar.

Eine stilisierte, erwachsene 2D-Gestaltung mit klaren Symbolen, gut lesbarer Schrift und kurzen Belohnungsanimationen ist der vorgeschlagene Stil. Werkstatt und Karte werden zunächst mit HTML, CSS und SVG dargestellt. Eine 3D-Engine ist nicht erforderlich. Bewegung kann reduziert werden, Ton ist standardmäßig aus. Farben allein transportieren keine Antwortzustände.

## Fortschritt und Belohnungen

Vorgeschlagenes Start-Balancing, als Daten konfigurierbar:

- Erster Abschluss einer normalen Quest: 100 XP und 20 Werkstattmarken; Boss-Mission: 200 XP und 40 Marken.
- Spielerlevel: 1 + ganzzahliger Anteil von Gesamt-XP geteilt durch 200.
- Drei sichtbare erste Ausbauten für jeweils 20, 40 und 60 Marken: Werkzeugwand, Werkbank und Diagnoseplatz.
- Ausbauten sind kosmetisch. Sie kaufen weder richtige Antworten noch fachliche Freischaltungen.
- Wiederholungen werden als eigene Sessions gespeichert. Eine fällige Wiederholungsquest vergibt einmal 30 XP und 5 Marken; freie Wiederholung bereits erledigter Aufgaben bleibt möglich, ohne weitere Währung.
- Rewards werden über eindeutige Abschluss-IDs nur einmal verbucht. Neuladen, Doppelklick und Wiederherstellung einer Session dürfen sie nicht vervielfachen.

Eine Quest ist nach Bearbeitung und Rückmeldung zu allen Aufgaben abgeschlossen. Fehler kosten weder Leben noch Währung. Die nächste normale Quest öffnet nach Abschluss der vorherigen. Die Boss-Mission öffnet nach den vier normalen Quests. Trainingswiederholungen bleiben frei zugänglich. Spielerlevel ist eine Spielbelohnung und kein Prüfungsreife-Nachweis.

## Lernen im Spiel

Fachlicher Fortschritt wird getrennt von XP pro Lernziel erfasst: neu, in Übung und gefestigt. Nur fachlich freigegebene Aufgaben zählen. Vorgeschlagenes Kriterium für gefestigt: zwei selbstständige richtige Lösungen in verschiedenen Sessions an unterschiedlichen Tagen, mit unterschiedlichen Aufgabenvarianten zum selben Lernziel. Reichen Varianten nicht aus, bleibt der Status in Übung.

Hinweise, Lösungseinblendungen und korrigierte Antworten helfen beim Lernen, zählen aber nicht als selbstständiger Erfolg. Ein Fehler setzt das Lernziel zurück auf in Übung. Wiederholungen werden nach einem erfolgreichen Abruf zunächst für den nächsten Tag, dann nach drei und nach sieben Tagen vorgesehen; Fehler oder Hilfen machen eine Wiederholung am Folgetag fällig. Nach sieben Tagen wird weiter im Siebentagesabstand wiederholt. Fällige Ziele erhalten Priorität bei empfohlenen Quests, erzwingen aber keinen täglichen Besuch. Der Scheduler verwendet gespeicherte Zeitstempel und lokale Kalendertage und wird unabhängig von der Oberfläche getestet.

Es gibt keine verlorenen Serien, täglichen Pflichten, Lootboxen, Käufe oder Energiebegrenzungen. Hinweise bleiben jederzeit zugänglich. Kein Countdown im Lernmodus. Ein späterer Prüfungsmodus erhält erst nach Bestätigung der tatsächlichen Bedingungen einen Timer und eine Bewertung.

## Inhalte, Quellen und Veröffentlichung

Die fachliche Ausgangsbasis für TRGI sind die bereitgestellten Lehrbriefe, Begleitbögen, Lösungen und die Abschlussübung. Diese wurden bislang auf Struktur und ausgewählte Seiten geprüft, nicht vollständig fachlich ausgewertet. TRWI-Kursunterlagen liegen noch nicht vor. Der Dateiname eines Uploads belegt keinen aktuellen Regelwerksstand; einzelne Lehrbriefe nennen eine Überarbeitung von 2019.

Vor der fachlichen Freigabe wird jede Aufgabe gegen die Fundstelle und, bei veränderlichen Vorgaben, gegen aktuelle Primärquellen geprüft. Ein Datensatz enthält stabile ID, Fachbereich, Kapitel, Lernziel, Aufgabenart, Inhalt, Bewertungsregel, Erklärung, Quellenfundstelle, Regelwerksausgabe, Prüfstatus und Inhaltsversion. Statuswerte sind demo, Entwurf und fachlich geprüft. Eine technische Validierung kann die fachliche Prüfung nicht ersetzen. Fachliche Freigaben benötigen dokumentierte Prüfung durch eine entsprechend qualifizierte Person; bis dahin ist die Spielrunde ausdrücklich eine Demo.

Das öffentliche Repository erhält Programmcode, selbst erstellte Grafiken und eigenständig formulierte Inhalte mit geeigneter Quellenbasis. Hochgeladene Lehrbriefe, Originalfragen, Lösungsbögen und persönliche Kursdaten werden nicht veröffentlicht. Vollständige Übereinstimmung mit der LIA-Prüfung, Bestehensgrenzen und Prüfungstermine sind noch offen. Das blockiert den Spielprototyp nicht, wohl aber Aussagen zur Prüfungsreife und den authentischen Prüfungsmodus.

## Technik und Daten

Vorschlag: React, TypeScript und Vite; PWA mit Web-App-Manifest und Service Worker; IndexedDB für Sessions, XP, Inventar, Lernstand und Content-Versionen. Start ohne Login, Backend, Analytik oder KI-Dienst. Kein Geräteabgleich in Version 1. Inhalte werden als versionierte statische Daten ausgeliefert, nicht zur Laufzeit frei generiert.

Offline-Nutzung nach dem ersten erfolgreichen Laden. Updates werden angekündigt und nicht mitten in einer Mission aktiviert. Laufende Sessions speichern ihre Inhaltsversion. Fehlt diese nach einem Update, wird die Runde mit verständlichem Hinweis neu gestartet, bereits verbuchte Belohnungen bleiben erhalten. Datenmigrationen erhalten den bisherigen Stand. Export und Import erfolgen als versioniertes JSON mit Strukturprüfung und Vorschau vor dem Ersetzen. Bei Speicherfehlern darf kein erfolgreicher Speicherstatus erscheinen.

Zielgeräte: iPhone in Safari und als installierte PWA sowie aktuelle Desktop-Browser. Hosting auf einer HTTPS-fähigen statischen Plattform bleibt frei; öffentliche Bereitstellung ist ein separater Schritt. Bis zur Auswahl wird lokale Vorschau verwendet. Build und Routing müssen einen konfigurierbaren Unterpfad unterstützen, damit das Repository später beispielsweise unter /trwi/ bereitgestellt werden kann.

## Abnahme der ersten Version

- Ein neuer Spieler kann ohne Konto die erste Quest starten, fünf Missionen durchspielen und die Werkstatt dreimal sichtbar ausbauen.
- Neuladen setzt die aktuelle Mission fort. Doppelte Abschlussereignisse erzeugen keine doppelten Belohnungen. Ein Kauf kann das Guthaben nicht negativ machen.
- Hinweise und Wiederholungsfehler beeinflussen fachlichen Fortschritt korrekt; Demo-Aufgaben bleiben daraus ausgeschlossen.
- Nach dem Erstladen funktioniert die Runde offline. Export und Import erhalten den Stand; ungültige Dateien verändern ihn nicht.
- Auf schmalen Displays ist alles bedienbar; Tastatur, reduzierte Bewegung und die textuelle Szenenalternative funktionieren.
- Noch nicht vorhandene Kapitel, Fachbereiche und Prüfungsfunktionen sind klar als ausstehend gekennzeichnet.

## Bewusst später und freie Umsetzungsentscheidungen

Später: weitere TRGI-Kapitel, TRWI-Inhalte, Rechenaufgaben, Prüfungsmodus, freiwillige Tagesquests, zusätzliche Ausbauten und Avatar-Kosmetik. Kein Multiplayer, keine globale Rangliste, keine Wirtschafts- oder Mitarbeitersimulation im ersten Umfang.

Der Umsetzung überlassen: genaue Farbpalette, Komponentenstruktur, Bibliotheken innerhalb des vorgeschlagenen Stacks, einzelne Texte und Namen sowie Feinanpassung des Balancings nach dem ersten Spieltest. Sicherheitsrelevante Inhalte und offizielle Prüfungsbedingungen dürfen dabei nicht erfunden werden.
