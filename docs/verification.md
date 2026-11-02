# Prüfung der ersten spielbaren Version

Stand: 02.11.2026.

## Ergebnis

- 15 Unit-Tests bestanden: Belohnungen, Käufe, Antwortbewertung, Demo-Ausschluss vom Fachfortschritt, Wiederholungsintervalle, sichere Importprüfung und atomare Speicherung.
- 7 Browser-Tests bestanden: kompletter Quest-Durchlauf mit drei Käufen, Fortsetzen nach Neuladen, Tastaturbedienung, mobile Darstellung, ungültige Imports, Offline-Neuladen, Wiederherstellung nach beschädigtem Speicher, Inhaltsmigration und eindeutiger Wiedereinstieg.
- TypeScript-Prüfung und Produktionsbuild bestanden.
- Build mit Unterpfad `/trwi/` ebenfalls erfolgreich. Der Unterpfad wurde gebaut, nicht auf GitHub Pages veröffentlicht oder dort im Browser geprüft.
- Desktop- und Mobil-Screenshots wurden visuell geprüft; siehe `docs/screenshots/`.

## Unabhängiger Review und Korrekturen

Ein unabhängiger Reviewer untersuchte den Branch gegen Entwurf und Plan. Zwei wichtige Fehler wurden reproduziert und korrigiert:

1. Bei beschädigtem lokalem Speicher verschwand die Bestätigung eines gültigen Imports. Ein eigener Zustand für den Ladefehler hält die Wiederherstellung bedienbar.
2. Ein manipuliertes Wiederholungs-Belohnungskennzeichen konnte eine importierte Mission beim Abschluss blockieren. Die Importprüfung weist semantisch unzulässige Kennzeichen nun zurück.

Zusätzlich wurden zwei Nutzerführungsprobleme korrigiert: Die Rücksetzung einer alten Inhaltsversion zeigt einen Hinweis; während einer pausierten Mission sind andere Missionsstarts ausdrücklich gesperrt. Beide wurden als wichtig für verständlichen Wiedereinstieg behandelt. Regressionstests scheiterten vor der Korrektur und bestanden danach. Die gesamte Suite ist anschließend grün. Kein offener Review-Befund wurde zurückgestellt.

## Umsetzungsentscheidungen

- Native Umsetzung in einem eigenen Entwicklungszweig; abschließender unabhängiger Review. Der genehmigte Umfang blieb unverändert.
- Erste Inhalte bleiben vollständig als Demo markiert. Das verhindert einen unberechtigten Fachkenntnis-Nachweis, bedeutet aber, dass diese Version noch keine vollständige Prüfungsvorbereitung liefert.
- Eine angefangene Mission wird abgeschlossen, bevor eine andere gestartet werden kann. So bleibt der Wiedereinstieg eindeutig; ein freier Wechsel zwischen mehreren laufenden Missionen ist nicht enthalten.
- Veröffentlichung als Website und Zusammenführung in `main` sind separate Schritte. Der Pull Request liefert den überprüfbaren Programmstand.

## Testumgebung und Grenzen

Node 24, Vitest und Chromium. Der reguläre Browser-Download war in dieser Umgebung nicht nutzbar. Ein Chromium-Binary aus einem npm-Paket wurde ausschließlich für lokale Tests verwendet; sieben getrennte Worker vermeiden ein Problem dieses Headless-Browsers beim Wiederverwenden von Kontexten. Das Testpaket wurde anschließend aus den Projektabhängigkeiten entfernt. CI verwendet den regulären Playwright-Browser.

Noch nicht bestätigt: physisches iPhone/Safari, Verhalten bei Betriebssystem-Speicherbereinigung, tatsächlicher Update-Wechsel zwischen zwei veröffentlichten Versionen und öffentlicher Hostingbetrieb. Die Fachrichtigkeit der vollständigen Kursinhalte, offizielle Prüfungsabdeckung und zukünftige freigegebene Aufgaben sind nicht Gegenstand der technischen Demo-Abnahme. Die nicht durch den Reviewer geprüften Punkte bleiben ausdrücklich offen und begründen keine Aussage zur Prüfungsreife.

## Course expansion 2026-11-02

172 course questions across 29 added missions, original 22 introduction questions preserved. 25 logic/storage/component/content tests and 8 Chromium scenarios cover migration of a completed demo, lesson persistence, source/answer schema, stable shuffled options, due-topic replay and duplicate reward prevention. Full campaign is exercised automatically. Production typecheck/build passes. Mobile course screenshot reviewed at 390px width; real iPhone/Safari remains untested. Source review is a full question skim plus selected source-page checks, not independent professional approval or complete exam equivalence. A same-session assisted-answer scheduling defect found during review was fixed with regression coverage.
