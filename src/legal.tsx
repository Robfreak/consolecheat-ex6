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
          Diese Seite ist die Spiele-Merkliste, eine statische Website. Die Dateien liegen auf GitHub Pages. Ein
          eigenes Backend gibt es nicht.
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-fg">Keine Konten, keine Cookies, kein Tracking</h2>
        <p>Die Seite setzt keine Cookies. Es gibt keine Analyse, kein Werbenetz und kein Tracking.</p>
        <p>
          Es gibt keine Anmeldung und kein Benutzerkonto. Die Listen werden nicht hochgeladen und nicht an dieses
          Projekt, an Sony oder an die verlinkten Werkzeuge gesendet.
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-fg">Was im Browser bleibt</h2>
        <p>
          Alles, was hier eingetragen wird, bleibt nur in diesem Browser, im{" "}
          <span className="font-mono text-fg">localStorage</span>. Der Schlüssel{" "}
          <span className="font-mono text-fg">consolecheat-ex6-merkliste-v1</span> enthält die vier Listen. Ein Eintrag
          speichert die Title-IDs und den Namen aus dem mitgelieferten Katalog und eine kurze Notiz. Erscheinungsbild
          und Sprache liegen unter <span className="font-mono text-fg">consolecheat-theme</span> und{" "}
          <span className="font-mono text-fg">consolecheat-lang</span>.
        </p>
        <p>
          Export schreibt eine JSON-Datei auf das eigene Gerät. Import liest eine Datei, die selbst ausgewählt wird,
          und ändert vorhandene Listen erst nach einer ausdrücklichen Bestätigung (Zusammenführen oder Ersetzen). Der
          Titelkatalog ist eine Datei dieser Website. Die Seite fragt dafür keinen anderen Server ab.
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-fg">Löschen</h2>
        <p>
          Der Knopf unten entfernt die drei Schlüssel nach einer zweiten Bestätigung. Danach sind die Listen weg. Das
          gilt nur für diesen Browser auf diesem Gerät. Eine exportierte Datei, die behalten wurde, bleibt unberührt.
          Dieselben Daten lassen sich auch in den Einstellungen des Browsers für diese Website löschen.
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-fg">Schriften</h2>
        <p>
          Die Schriften Outfit und Source Sans 3 liegen auf demselben Host wie diese Seite. Beim Laden geht keine
          Anfrage an Google oder an einen anderen Dritten.
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
          Projekt. Die Merklisten selbst verlassen den Browser nicht und werden von diesem Projekt nicht verarbeitet.
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
          This page is the game backlog, a static website. The files are hosted on GitHub Pages. There is no separate
          backend.
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-fg">No accounts, no cookies, no tracking</h2>
        <p>This site does not set cookies. There is no analytics, no ad network, and no tracking.</p>
        <p>
          There is no sign-in and no account. The lists are not uploaded and are not sent to this project, to Sony, or
          to the linked tools.
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-fg">What stays in the browser</h2>
        <p>
          Everything entered here stays only in this browser, in{" "}
          <span className="font-mono text-fg">localStorage</span>. The key{" "}
          <span className="font-mono text-fg">consolecheat-ex6-merkliste-v1</span> holds the four lists. An entry stores
          the title IDs and the name from the bundled catalog, plus a short note. Appearance and language use{" "}
          <span className="font-mono text-fg">consolecheat-theme</span> and{" "}
          <span className="font-mono text-fg">consolecheat-lang</span>.
        </p>
        <p>
          Export writes a JSON file onto your own device. Import reads a file you choose and changes existing lists
          only after an explicit confirmation (merge or replace). The title catalog is a file of this site. The page
          does not ask another server for it.
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-fg">Deleting</h2>
        <p>
          The button below removes the three keys after a second confirmation. The lists are gone after that. This
          applies only to this browser on this device. An export you kept is untouched. The same data can also be
          cleared in the browser settings for this site.
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-fg">Fonts</h2>
        <p>
          Outfit and Source Sans 3 are served from the same host as this page. Loading the page does not contact Google
          or any other third party.
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
          interest in running and securing the hosting. The host processes them, not this project. The lists themselves
          never leave the browser and are not processed by this project.
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
