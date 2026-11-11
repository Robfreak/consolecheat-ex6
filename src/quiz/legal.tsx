import { useState } from "react";
import type { Copy } from "./messages.ts";

function Slot({ children }: { children: string }) {
  return <span className="legal-slot">{children}</span>;
}

export function LegalPage({
  page,
  homeHref,
  onHome,
  text,
  onDeleteAll,
}: {
  page: "impressum" | "datenschutz";
  homeHref: string;
  onHome: (event: { preventDefault: () => void }) => void;
  text: Copy;
  onDeleteAll: () => boolean;
}) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <p>
        <a href={homeHref} onClick={onHome} className="text-sm font-medium text-steel underline-offset-4 hover:underline">
          {text.title}
        </a>
      </p>
      {page === "impressum" ? <Impressum /> : <Datenschutz text={text} onDeleteAll={onDeleteAll} />}
    </main>
  );
}

function Impressum() {
  return (
    <article id="impressum" className="mt-6">
      <h1 className="font-display text-4xl font-semibold tracking-tight">Impressum</h1>
      <p className="mt-3 text-lg text-muted">Legal notice</p>
      <div lang="de" className="mt-8 flex flex-col gap-4 text-base leading-relaxed text-muted">
        <p className="panel rounded-xl px-4 py-4 text-fg">
          Platzhalter. Die markierten Felder sind keine echten Angaben. Es sind keine Namen, Adressen oder
          Kontaktdaten erfunden. Die betreibende Person setzt hier die eigenen Angaben ein.
        </p>
        <p>
          Anbieter: <Slot>[Name einsetzen]</Slot>
        </p>
        <p>
          Anschrift: <Slot>[Straße und Hausnummer einsetzen]</Slot>
        </p>
        <p>
          <Slot>[Postleitzahl und Ort einsetzen]</Slot>
        </p>
        <p>
          <Slot>[Land einsetzen]</Slot>
        </p>
        <p>
          E-Mail: <Slot>[E-Mail-Adresse einsetzen]</Slot>
        </p>
        <p>
          Telefon: <Slot>[Telefonnummer einsetzen]</Slot>
        </p>
        <p>
          Weitere Angaben, nur falls vorhanden (Registereintrag, Umsatzsteuer-ID, vertretungsberechtigte Person):{" "}
          <Slot>[falls vorhanden einsetzen]</Slot>
        </p>
        <p>Diese Seite ist ein inoffizielles Werkzeug. Nicht von Sony.</p>
      </div>
      <div lang="en" className="mt-10 flex flex-col gap-4 border-t border-line pt-8 text-base leading-relaxed text-muted">
        <p className="text-fg">
          Placeholders. The marked fields are not real details. No name, address, or contact was invented. The operator
          replaces them with their own details.
        </p>
        <p>
          Provider: <Slot>[insert name]</Slot>
        </p>
        <p>
          Address: <Slot>[insert street and house number]</Slot>
        </p>
        <p>
          <Slot>[insert postal code and city]</Slot>
        </p>
        <p>
          <Slot>[insert country]</Slot>
        </p>
        <p>
          Email: <Slot>[insert email address]</Slot>
        </p>
        <p>
          Phone: <Slot>[insert phone number]</Slot>
        </p>
        <p>
          Further details, only if they exist (register, VAT id, person authorized to represent):{" "}
          <Slot>[insert if applicable]</Slot>
        </p>
        <p>This site is an unofficial tool. Not Sony.</p>
      </div>
    </article>
  );
}

function Datenschutz({ text, onDeleteAll }: { text: Copy; onDeleteAll: () => boolean }) {
  const [confirming, setConfirming] = useState(false);
  const [notice, setNotice] = useState("");

  function confirmDelete() {
    const ok = onDeleteAll();
    setConfirming(false);
    setNotice(ok ? text.deleted : text.deleteFailed);
  }

  return (
    <article id="datenschutz" className="mt-6">
      <h1 className="font-display text-4xl font-semibold tracking-tight">Datenschutz</h1>
      <p className="mt-3 text-lg text-muted">Privacy</p>
      <div lang="de" className="mt-8 flex flex-col gap-4 text-base leading-relaxed text-muted">
        <p>
          Diese Seite ist das PS-Plus-Quiz, eine statische Website. Die Dateien liegen auf GitHub Pages. Ein eigenes
          Backend gibt es nicht. Sie liegt vorübergehend im selben Projekt wie die Spiele-Merkliste, bis sie ein
          eigenes Projekt ist.
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-fg">Keine Konten, keine Cookies, kein Tracking</h2>
        <p>Die Seite setzt keine Cookies. Es gibt keine Analyse, kein Werbenetz und kein Tracking.</p>
        <p>
          Es gibt keine Anmeldung und kein Benutzerkonto. Es werden keine personenbezogenen Daten eingegeben,
          hochgeladen oder an dieses Projekt, an Sony oder an Dritte gesendet. Antworten bleiben in diesem Tab. Die
          Ergebniskarte wird hier im Browser gezeichnet. Herunterladen und, falls vorhanden, die Teilen-Funktion des
          Browsers geben die PNG-Datei nur an dieses Gerät oder an die Teilen-Ansicht. Diese Seite lädt die Datei
          nicht hoch.
        </p>
        <p>
          Die Fragen stammen aus einem Abzug, der mit dieser Seite ausgeliefert wird. Während des Spiels geht keine
          Anfrage an das PS-Plus-Archiv. Ein Link dorthin ist ein normaler Link und wird erst beim Klick geladen.
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-fg">Was im Browser bleibt</h2>
        <p>
          Ein Sitzungsspeicher (<span className="font-mono text-fg">sessionStorage</span>) wird nicht verwendet.
        </p>
        <p>
          Bestleistung und beste Serie liegen im <span className="font-mono text-fg">localStorage</span> unter{" "}
          <span className="font-mono text-fg">consolecheat-quiz-best-v1</span>. Der Schlüssel entsteht, wenn ein
          beendeter Durchgang eine neue Bestleistung setzt. Fehlt der Schlüssel, wird er nicht angelegt, bis das
          passiert. Eine unlesbare Fassung oder eine andere Version bleibt liegen, bis du eine neue Bestleistung setzt
          oder die Bestleistung zurücksetzt. Zurücksetzen entfernt nur diesen Schlüssel. Die Daten verlassen den Browser nicht.
        </p>
        <p>
          Sprache und Erscheinungsbild liegen, wie bei den anderen consolecheat-Werkzeugen auf diesem Host, im{" "}
          <span className="font-mono text-fg">localStorage</span> unter{" "}
          <span className="font-mono text-fg">consolecheat-lang</span> und{" "}
          <span className="font-mono text-fg">consolecheat-theme</span>. Weitere Schlüssel schreibt diese Seite nicht.
          Die Merkliste (<span className="font-mono text-fg">consolecheat-ex6-merkliste-v1</span>) und das letzte
          Testbild (<span className="font-mono text-fg">consolecheat-bildschirm-pattern</span>) werden von dieser Seite
          weder gelesen noch verändert.
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-fg">Löschen</h2>
        <p>
          Der Knopf bei der Bestleistung entfernt nur <span className="font-mono text-fg">consolecheat-quiz-best-v1</span>.
          Der Knopf unten entfernt nach einer zweiten Bestätigung den Schlüssel der Bestleistung und die beiden
          Schlüssel für Sprache und Erscheinungsbild. Die Merkliste und das letzte Testbild bleiben. Dieselben Daten
          lassen sich auch in den Einstellungen des Browsers für diese Website löschen.
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-fg">Schriften</h2>
        <p>
          Die Schriften Outfit und Source Sans 3 liegen auf demselben Host wie diese Seite. Beim Laden geht keine
          Anfrage an Google oder an einen anderen Dritten. Dieselben Schriften werden geladen, bevor die Ergebniskarte
          gezeichnet wird.
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-fg">Hosting</h2>
        <p>
          GitHub liefert die Dateien über GitHub Pages aus. GitHub kann als Host Verbindungsdaten verarbeiten,
          insbesondere die IP-Adresse, den Zeitpunkt und die aufgerufene Adresse. Dieses Projekt betreibt keinen
          eigenen Server und erhält diese Protokolle nicht.{" "}
          <a
            href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement"
            className="text-steel underline-offset-4 hover:underline"
          >
            Datenschutzerklärung von GitHub
          </a>
          .
        </p>
        <p>
          Rechtsgrundlage für diese Verbindungsdaten ist Art. 6 Abs. 1 lit. f DSGVO. Das berechtigte Interesse ist der
          technische Betrieb und die Absicherung des Hostings. Verarbeitet werden sie vom Host, nicht von diesem
          Projekt. Die Bestleistung bleibt lokal, verlässt den Browser nicht und wird von diesem Projekt nicht
          verarbeitet.
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-fg">Ihre Rechte</h2>
        <p>
          Sie haben das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung, das Recht auf
          Widerspruch sowie das Recht auf Beschwerde bei einer Aufsichtsbehörde. Solange im Impressum nur Platzhalter
          stehen, ist hier keine verantwortliche Stelle benannt. Anfragen zu den Hosting-Protokollen gehen an den Host.
          Eine Beschwerde richtet sich an die zuständige Aufsichtsbehörde.
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-fg">Verantwortliche Stelle</h2>
        <p>
          Name und Anschrift stehen im Impressum. Solange dort nur Platzhalter stehen, sind hier absichtlich keine
          echten Kontaktdaten eingetragen.
        </p>
      </div>
      <div lang="en" className="mt-10 flex flex-col gap-4 border-t border-line pt-8 text-base leading-relaxed text-muted">
        <p>
          This page is the PS Plus quiz, a static website. The files are hosted on GitHub Pages. There is no separate
          backend. It temporarily lives in the same project as the game backlog, until it has its own project.
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-fg">No accounts, no cookies, no tracking</h2>
        <p>This site does not set cookies. There is no analytics, no ad network, and no tracking.</p>
        <p>
          There is no sign-in and no account. No personal data is entered, uploaded, or sent to this project, to Sony,
          or to anyone else. Answers stay in this tab. The result card is drawn in this browser. Download and, when
          the browser has it, the Web Share API hand the PNG only to this device or to the share sheet. This page does not upload the file.
        </p>
        <p>
          The questions come from a snapshot shipped with this page. Playing does not request the PS Plus archive. A
          link to it is an ordinary link and loads only when clicked.
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-fg">What stays in the browser</h2>
        <p>
          <span className="font-mono text-fg">sessionStorage</span> is not used.
        </p>
        <p>
          The best score and best streak use the <span className="font-mono text-fg">localStorage</span> key{" "}
          <span className="font-mono text-fg">consolecheat-quiz-best-v1</span>. The key is created when a finished run
          sets a new best. If the key is missing, it is not created until that happens. A value that does not parse, or
          a different version, is left in place until you set a new best or reset the best score. Reset removes only
          that key. The data never leaves the browser.
        </p>
        <p>
          Language and appearance use <span className="font-mono text-fg">localStorage</span> keys{" "}
          <span className="font-mono text-fg">consolecheat-lang</span> and{" "}
          <span className="font-mono text-fg">consolecheat-theme</span>, the same keys as the other consolecheat tools on
          this host. This page writes no other keys. It does not read or change the backlog (
          <span className="font-mono text-fg">consolecheat-ex6-merkliste-v1</span>) or the last screen-test pattern (
          <span className="font-mono text-fg">consolecheat-bildschirm-pattern</span>).
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-fg">Deleting</h2>
        <p>
          The button next to the best score removes only{" "}
          <span className="font-mono text-fg">consolecheat-quiz-best-v1</span>. The button below removes the best-score
          key and the language and appearance keys after a second confirmation. The backlog and the last pattern stay.
          The same data can also be cleared in the browser settings for this site.
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-fg">Fonts</h2>
        <p>
          Outfit and Source Sans 3 are served from the same host as this page. Loading the page does not contact Google
          or any other third party. Those same fonts are loaded before the result card is drawn.
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-fg">Hosting</h2>
        <p>
          GitHub serves the files through GitHub Pages. As the host, GitHub can process connection data, in particular
          the IP address, the time, and the requested address. This project does not run its own server and does not
          receive those logs.{" "}
          <a
            href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement"
            className="text-steel underline-offset-4 hover:underline"
          >
            GitHub Privacy Statement
          </a>
          .
        </p>
        <p>
          The legal basis for those connection logs is Article 6 (1) (f) GDPR (Art. 6 Abs. 1 lit. f DSGVO): legitimate
          interest in running and securing the hosting. The host processes them, not this project. The best score stays
          local, never leaves the browser, and is not processed by this project.
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-fg">Your rights</h2>
        <p>
          You have the right of access, rectification, erasure, and restriction of processing, the right to object, and
          the right to lodge a complaint with a supervisory authority. While the Impressum only has placeholders, no
          controller is named here. Requests about the hosting logs go to the host. A complaint goes to the competent
          supervisory authority.
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-fg">Who is responsible</h2>
        <p>
          The name and address belong in the Impressum. While that page only has placeholders, no real contact details
          are published here on purpose.
        </p>
      </div>
      <div className="mt-8 flex flex-col gap-3 border-t border-line pt-8">
        {confirming ? (
          <div role="alertdialog" aria-labelledby="delete-ask" className="panel flex flex-col gap-3 rounded-xl px-4 py-4">
            <p id="delete-ask" className="text-base leading-relaxed text-fg">
              {text.deleteAsk}
            </p>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn btn-bad" onClick={confirmDelete}>
                {text.deleteYes}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setConfirming(false)}>
                {text.deleteNo}
              </button>
            </div>
          </div>
        ) : (
          <button type="button" className="btn btn-bad self-start" onClick={() => setConfirming(true)}>
            {text.deleteAll}
          </button>
        )}
        {notice ? (
          <p role="status" className="text-sm text-muted">
            {notice}
          </p>
        ) : null}
      </div>
    </article>
  );
}
