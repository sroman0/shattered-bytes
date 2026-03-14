# Proposte "Serious Game" per Computer Forensics and Cyber Crime Analysis

Di seguito sono presentate 6 proposte progettuali per lo sviluppo del *Serious Game* richiesto come progetto integrativo per il corso. Ogni proposta è pensata per coprire in modo originale ed efficace uno dei pilastri della Computer Forensics, rispettando i vincoli di originalità, interattività e fattibilità tecnica.

---

## Proposta 1: L'arte del Data Carving "Manuale"
**Titolo e Concetto Core:** *Shattered Bytes: Frammenti Digitali*  
Si focalizza sul **Data Carving** e l'analisi dei file system (FAT/NTFS). L'obbiettivo è recuperare prove cancellate senza l'ausilio di tool automatici o dove la File Allocation Table è corrotta.

* **Meccanica di Gioco (Serious Game):** Puzzle logico basato su un Hex Editor semplificato. L'utente visualizza dei blocchi di memoria "crudi" in esadecimale. Deve riconoscere visivamente le firme dei file (*magic numbers* come i primi byte di in un PDF, JPEG, ecc.), isolare gli *header* e i *footer*, ed estrarre il blocco corretto scartando i settori "spazzatura". I livelli avanzati introducono frammentazione (il file è diviso in blocchi non contigui).
* **Modalità di Sviluppo Consigliata:** Sviluppo ex-novo via **Web-app interattiva** (React/Vanilla JS + CSS moderno) o un Jupyter Notebook molto interattivo tramite moduli ad hoc.
* **Valore Aggiunto:** Rende tangibile e visiva l'operazione di *carving*, che solitamente viene delegata a strumenti come Autopsy/Photorec. Capire visivamente come appaiono i dati a basso livello aiuta a comprendere i limiti chirurgici delle operazioni forensi su dischi gravemente compromessi.

---

## Proposta 2: Simulatore di Chain of Custody e First Response
**Titolo e Concetto Core:** *First Responder: La Scena del Crimine Digitale*  
Si concentra sugli **Aspetti legali, Catena di Custodia e Ordine di Volatilità** (Identificazione e acquisizione delle prove).

* **Meccanica di Gioco (Serious Game):** Scenario a bivi decisionali (Stile "Visual Novel" investigativa / Choose Your Own Adventure) in tempo reale. L'utente è il primo a intervenire in un ufficio sotto attacco Ransomware. Ha un budget di tempo limitato; ogni azione brucia secondi preziosi. Deve decidere in che ordine acquisire le prove (es. fotografare lo schermo, isolare la rete, fare il dump della RAM prima di scollegare la presa, o fare l'immagine del disco?). Scelte errate generano la contaminazione delle prove o l'invalidazione in fase di tribunale.
* **Modalità di Sviluppo Consigliata:** **Piattaforma No-Code** orientata allo storytelling a bivi (Twinery, Base44) oppure un engine come Ren'Py (in Python). Alta focalizzazione sulla scrittura dello scenario.
* **Valore Aggiunto:** Le procedure (es. RFC 3227) rischiano di risultare mnemoniche. Un gioco decisionale stressante, simulando un incidente reale, forza lo studente a introiettare la logica dietro l'ordine di volatilità piuttosto che limitarsi a impararlo a memoria.

---

## Proposta 3: Memory Forensics e Process Hiding
**Titolo e Concetto Core:** *Ghost in the RAM: Il Malware Invisibile*  
Sfrutta la **Memory Forensics** per evidenziare tecniche di elusione ed evasione, come i rootkit che nascondono processi di sistema illegittimi (Process Hiding o DLL Injection).

* **Meccanica di Gioco (Serious Game):** Simulazione di Terminale investigativo (tipo gioco hacking). Il giocatore interpreta l'analista che deve scovare il malware in un *memory dump* fittizio. Digitando ricalchi simulati di comandi alla `Volatility` (es. `pslist`, `netscan`, `malfind`), raccoglie l'output formattato. Il gioco richiede all'utente di scovare l'increspatura logica: incrociare la lista dei processi attivi con la ricostruzione del VAD (Virtual Address Descriptor) o gli unlinked process per trovare un processo che la macchina non dichiara di avere.
* **Modalità di Sviluppo Consigliata:** **Script interattivo Python** basato su Console (es. usando interfacce di testo belle come Rich o Textual per Python), creando una pseudo-shell isolata e reattiva.
* **Valore Aggiunto:** Distilla la competenza più avanzata dell'analisi di memoria nel fare correlazione manuale tra strutture kernel differenti, aiutando a de-mistificare come la RAM tiene traccia delle esecuzioni.

---

## Proposta 4: Infiltrazione e Network Forensics
**Titolo e Concetto Core:** *Packet Detective: I Sussurri della Rete*  
Focalizzato sulla **Network Forensics**, per individuare traffico anomalo orientato alla Command & Control (C2) ed esfiltrazione di dati sotto mentite spoglie.

* **Meccanica di Gioco (Serious Game):** Interfaccia a filtri dinamici (in stile cruscotto / mini-Wireshark). L'utente ha davanti pacchetti (pre-generati logici) e deve progressivamente attivare filtri semantici. Trova un DNS Tunneling, estrae il traffico anomalo che sembra una query ma in realtà è Base64 codificato, per poi ricostruire il pacchetto esfiltrato assemblando i payload dei pacchetti in un puzzle visivo combinatorio.
* **Modalità di Sviluppo Consigliata:** Scenario per la **CyberForensics Arena** (se modulabile visualmente), in alternativa Mini-gioco Web (HTML+JS) focalizzato sulla manipolazione e parsing visivo di un finto file `.pcap`.
* **Valore Aggiunto:** Passare dai concetti crudi dei protocolli a un vero "metodo" investigativo per scovare le anomalie statistiche nel traffico. Decodificare interattivamente il payload dà un livello pratico e soddisfacente allo scenario.

---

## Proposta 5: Mobile Forensics e Basi di Dati
**Titolo e Concetto Core:** *Shattered Screen: I Segreti di SQLite*  
Progetto di **Mobile Forensics**, centrato sul recupero manuale di messaggi da archivi di app mobile (es. Telegram/WhatsApp) e sull'ispezione della persistenza locale, tra cui l'analisi del Read-Ahead Log (WAL).

* **Meccanica di Gioco (Serious Game):** Interazione SQL combinata ad un database puzzle. L'utente riceve il filesystem estratto di un telefono. Deve costruire "a mano" vere *query* SQLite per incrociare tabelle (contatti + blob messaggi). Il twist investigativo: deve recuperare messaggi apparentemente cancellati spulciando i file di ripristino o lo spazio non allocato del DB per l'overwriting non ancora effettuato dei righi SQLite.
* **Modalità di Sviluppo Consigliata:** Sviluppo ex-novo Web App che si appoggia ad un DB in-browser (SQL.js / SQLite3 in WebAssembly) per mantenere tutto client-side ed estremamente rapido ed interattivo.
* **Valore Aggiunto:** Disassembla il ruolo dei tool proprietari e oscurati che dominano l'estrazione mobile (Cellebrite, Oxygen). Mostra empiricamente perché un messaggio "cancellato" su uno smartphone molto spesso non sparisce mai istantaneamente dal filesystem sottostante. 

---

## Proposta 6: MACE e Super Timeline Analysis
**Titolo e Concetto Core:** *Chronos Task: La Linea del Tempo Manipolata*  
Core focalizzato sull'**Analisi su File System NTFS e incident assessment**, specificamente incentrato sul tracciamento visivo degli attributi MAC/MACE e sul *Timestomping*.

* **Meccanica di Gioco (Serious Game):** Puzzle "Drag & Drop". Sulla dashboard sono presenti decine di eventi sparsi: file creati, log di sicurezza Windows, permessi modificati. L'utente deve disporli e sincronizzarli su un'unica linea del tempo (Super Timeline). La complessità sopraggiunge quando il giocatore deve rendersi conto che l'attaccante ha alterato orari retrodatando un binario (*timestomping*), e deve individuare un mismatch logico tra la Creation Time in `$STANDARD_INFORMATION` rispetto ai record di MFT `$FILE_NAME`.
* **Modalità di Sviluppo Consigliata:** Ottimo per integrazione **CyberForensics Arena** o come applicativo Web-app molto grafico basato su UI drag-and-drop.
* **Valore Aggiunto:** La costruzione e l'interpretazione delle Timeline è l'operazione che "risolve" gran parte degli incidenti ma è estremamente cervellotica. Un game visivo fissa definitivamente in testa l'utilizzo delle differenze tra vari tipi di timestamp su filesystem Windows (NTFS).
