# Avanti – Website-Terminbuchung (Kundenvorschau)

Vorbereitung für die Website V9.2. Die vollständigen statischen Website-Dateien müssen noch aus dem vorbereiteten ZIP-Archiv in das Repository-Hauptverzeichnis hochgeladen werden (nicht das ZIP selbst).

GitHub Pages: Settings → Pages → Deploy from a branch → main → / (root).

Nur Design- und Funktionsdemo mit fiktiven Mitarbeiterprofilen und lokal simulierten Terminen. Keine echten Buchungen und keine produktive Supabase-Anbindung. Die ALL-INKL-Livewebsite bleibt unverändert.


## Testbuchung – Bedienstand 23.11.2026
- Sechs Leistungen nach demselben Testkatalog wie im Studio-Manager: Herrenhaarschnitt 30 Min. / 19 €, Damen-Trockenhaarschnitt 45 Min. / 30 €, Kinder bis 3 Jahre 30 Min. / 10 €, Kinder bis 16 Jahre 30 Min. / 15 €, Augenbrauen zupfen 15 Min. / 6 €, Wimpern färben 30 Min. / 10 €.
- Zwei frühere 20-Minuten-Testdauern wurden auf 30 Minuten gerundet, damit sie ins 15-Minuten-Raster passen. **Preise und Dauern sind nicht vom Salon freigegeben.**
- Kunden können **Egal welche Mitarbeiterin** wählen. Die lokale Vorschau zeigt freie Slots aller fünf Profile und ordnet einen ausgewählten Testtermin einer verfügbaren Mitarbeiterin zu.
- Der Bestätigungsdialog enthält Name, Test-E-Mail (Pflichtfeld) und optionale Testtelefonnummer. Es wird nichts versendet: Die Bestätigung ist ausschließlich lokal. Kontaktdaten werden nicht in der lokalen Slot-Simulation gespeichert.
- Keine produktive Supabase-Schnittstelle. GitHub-Pages-Testversion **nicht mit echten Kundendaten** verwenden.
