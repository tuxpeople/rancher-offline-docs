# rancher-offline-docs

Offline-fähige Dokumentation für das Rancher-Produkt-Portfolio — als Container-Images und Helm Chart.

Jede Produktdokumentation wird als eigenständiger Container bereitgestellt (statische Website in einem [Chainguard nginx](https://images.chainguard.dev/directory/image/nginx/overview)). Die Images werden automatisch aus den öffentlichen upstream Dokumentations-Repos gebaut und nach GHCR gepusht.

---

## Enthaltene Produkte

| Produkt | Upstream Repo | Image |
|---------|--------------|-------|
| Rancher Manager | [rancher/rancher-docs](https://github.com/rancher/rancher-docs) | `ghcr.io/tuxpeople/rancher-docs` |
| RKE2 | [rancher/rke2-docs](https://github.com/rancher/rke2-docs) | `ghcr.io/tuxpeople/rke2-docs` |
| k3s | [k3s-io/docs](https://github.com/k3s-io/docs) | `ghcr.io/tuxpeople/k3s-docs` |
| Longhorn | [longhorn/website](https://github.com/longhorn/website) | `ghcr.io/tuxpeople/longhorn-docs` |
| Fleet | [rancher/fleet-docs](https://github.com/rancher/fleet-docs) | `ghcr.io/tuxpeople/fleet-docs` |
| Kubewarden | [kubewarden/docs](https://github.com/kubewarden/docs) | `ghcr.io/tuxpeople/kubewarden-docs` |
| Harvester | [harvester/docs](https://github.com/harvester/docs) | `ghcr.io/tuxpeople/harvester-docs` |
| Rancher Desktop | [rancher-sandbox/docs.rancherdesktop.io](https://github.com/rancher-sandbox/docs.rancherdesktop.io) | `ghcr.io/tuxpeople/rancher-desktop-docs` |

---

## Konzept

Das Prinzip ist bewusst simpel: Jedes upstream Docs-Repo wird geklont, als statische Website gebaut (Docusaurus oder Hugo) und in einem minimalen nginx-Container verpackt. Die Container laufen vollständig ohne Internetzugriff — ideal für airgapped Umgebungen.

Die Idee ist inspiriert von [Rancher Government Carbide](https://rancherfederal.github.io/carbide-docs/docs/airgapped-docs/introduction), das eine ähnliche Offline-Dokumentationslösung für US-Regierungskunden anbietet. Diese Implementierung ist offen, lizenzfrei und nutzt ausschliesslich öffentliche upstream Repos.

---

## Image-Tags und Versionierung

Image-Tags entsprechen dem **HEAD Commit-SHA des upstream Docs-Repos** zum Zeitpunkt des Builds (z.B. `a3f9c12`). Das Tag beschreibt damit exakt welchen Stand der Upstream-Dokumentation das Image enthält — nicht die Version der Software selbst.

Zusätzlich wird `latest` immer auf den neusten main-Build gesetzt.

```
ghcr.io/tuxpeople/rke2-docs:a3f9c12   # upstream SHA → pinned
ghcr.io/tuxpeople/rke2-docs:latest    # immer aktuell
```

Der Helm Chart nutzt **CalVer** (`YYYY.M.D`) als Versions-Schema, weil ein Datum besser beschreibt was der Chart ist — ein Snapshot zu einem bestimmten Zeitpunkt.

---

## CI/CD Pipeline

Der Build-Workflow läuft bei jedem Push auf `main` und baut alle Images parallel:

```
push to main
  ├── discover          Alle Ordner mit Dockerfile finden
  └── lint              Alle Dockerfiles mit hadolint prüfen
       └── build ×N     Pro Image parallel (wartet auf discover + lint):
            ├── upstream HEAD SHA holen (git ls-remote)
            ├── Image bauen + pushen  →  ghcr.io/tuxpeople/<n>-docs:<sha>
            ├── SBOM als OCI-Attestation (BuildKit/Syft)
            └── SLSA Provenance Level 1
                 └── collect-digests
                      ├── provenance   SLSA Level 3 Signatur
                      └── update-chart
                           ├── values.yaml: pro Produkt den neuen SHA eintragen
                           ├── Chart.yaml: CalVer-Version setzen
                           ├── Helm Chart → oci://ghcr.io/tuxpeople/charts/rancher-offline-docs
                           └── Commit zurück zu main  [skip ci]
```

### Security

- **Hadolint**: Alle Dockerfiles werden bei jedem Build gelintet. Konfiguration in `.hadolint.yaml`. Lint-Fehler blockieren den Build.
- **SBOM**: Jedes Image enthält ein Software Bill of Materials als OCI-Attestation, generiert durch Syft während dem Build (kein nachträgliches Scannen)
- **SLSA Level 3**: Signierte Provenance für alle Images via [slsa-framework/slsa-github-generator](https://github.com/slsa-framework/slsa-github-generator)
- **Distroless nginx**: Alle Images basieren auf `cgr.dev/chainguard/nginx` — minimale Angriffsfläche, läuft non-root auf Port 8080
- **Renovate**: Automatische Updates für Action-Versionen und Dependencies

---

## Helm Chart

Der Chart deployt die Docs als Deployments + Services + Rancher NavLinks direkt im Rancher Manager.

### Voraussetzungen

- Kubernetes Cluster mit Rancher Manager ≥ v2.7
- Zugriff auf GHCR (oder Images in eigene Registry gespiegelt)

### Installation

```bash
helm install rancher-offline-docs \
  oci://ghcr.io/tuxpeople/charts/rancher-offline-docs \
  --version 2026.4.1 \
  --namespace rancher-docs-system \
  --create-namespace
```

Mit eigener Registry:

```bash
helm install rancher-offline-docs \
  oci://ghcr.io/tuxpeople/charts/rancher-offline-docs \
  --version 2026.4.1 \
  --namespace rancher-docs-system \
  --create-namespace \
  --set registry=registry.example.com/myproject
```

Einzelne Produkte deaktivieren (z.B. in ressourcenbeschränkten Umgebungen):

```bash
helm install rancher-offline-docs \
  oci://ghcr.io/tuxpeople/charts/rancher-offline-docs \
  --version 2026.4.1 \
  --set docs.harvester.enabled=false \
  --set docs.rancherdesktop.enabled=false
```

Nach der Installation erscheint die Dokumentation unter **Explore Cluster → Offline Docs** im Rancher Manager.

### Verfügbare Versionen

```bash
helm show chart oci://ghcr.io/tuxpeople/charts/rancher-offline-docs
```

---

## Lokaler Build

Ein einzelnes Image lokal bauen:

```bash
docker build rke2/ -t rke2-docs:local
docker run -p 8080:8080 rke2-docs:local
# → http://localhost:8080
```

Alle Images bauen:

```bash
find . -name Dockerfile | while read -r f; do
  dir=$(dirname "$f")
  name=$(basename "$dir")
  docker build "$dir" -t "${name}-docs:local"
done
```

---

## Neues Produkt hinzufügen

1. Neuen Ordner anlegen (Name wird zum Image-Namen):
   ```
   mkdir meinprodukt
   ```

2. `Dockerfile` erstellen — das Pattern ist immer gleich:
   ```dockerfile
   FROM node:24 AS base
   RUN git clone https://github.com/upstream/meinprodukt-docs /home/node/app
   WORKDIR /home/node/app
   RUN npm install
   RUN npm run build

   FROM cgr.dev/chainguard/nginx AS deploy
   COPY --from=base /home/node/app/build /usr/share/nginx/html/
   ```
   > Für Hugo-basierte Docs (wie Longhorn): `node:24-alpine` als Basis, `apk add --no-cache git hugo`, dann `RUN hugo` statt `npm run build`

3. In `charts/rancher-offline-docs/values.yaml` eintragen:
   ```yaml
   docs:
     meinprodukt:
       enabled: true
       image: meinprodukt-docs
       tag: latest  # wird automatisch durch CI gesetzt
   ```

4. In `charts/rancher-offline-docs/templates/` Deployment, Service und NavLink ergänzen (analog zu bestehenden Einträgen).

5. Push auf `main` — CI lintet, baut, setzt den upstream SHA als Tag und aktualisiert den Chart.

---

## Repo-Struktur

```
rancher-offline-docs/
├── <produkt>/
│   └── Dockerfile          # Build-Rezept: clone → build → nginx
├── charts/
│   └── rancher-offline-docs/
│       ├── Chart.yaml
│       ├── values.yaml     # wird durch CI automatisch aktualisiert
│       └── templates/
│           ├── _helpers.tpl
│           ├── deployment.yaml
│           ├── service.yaml
│           └── navlink.yaml
├── .github/
│   └── workflows/
│       ├── docker-image.yml  # Haupt-Pipeline: Lint + Build + SBOM + SLSA + Chart-Update
│       └── release.yml       # Superseded — Chart-Publish ist in docker-image.yml
├── .hadolint.yaml            # Hadolint-Konfiguration (projektspezifische Ignore-Rules)
└── renovate.json
```

---

## Verwandte Projekte

- [Rancher Government Carbide](https://rancherfederal.github.io/carbide-docs/) — kommerzielle Offline-Docs für US-Regierungskunden (Lizenz erforderlich)
- [clemenko/carbide-offline-docs](https://github.com/clemenko/carbide-offline-docs) — originales Proof-of-Concept von dem dieses Projekt inspiriert ist
