# rancher-offline-docs Helm Chart

Deployt Offline-Dokumentation für das Rancher-Produkt-Portfolio in einem Kubernetes-Cluster mit Rancher Manager.

## Übersicht

Jedes Produkt wird als eigenständiges Deployment mit Service und Rancher NavLink deployed. Nach der Installation erscheinen alle aktivierten Produkte unter **Explore Cluster → Offline Docs** im Rancher Manager.

Die Container lauschen auf Port 8080 (Chainguard nginx, non-root).

## Voraussetzungen

- Kubernetes Cluster
- Rancher Manager ≥ v2.7 (für NavLinks und Extension-Integration)
- Helm ≥ v3.8 (OCI Registry Support)
- Zugriff auf `ghcr.io` oder eigene Registry mit gespiegelten Images

## Installation

```bash
# Aktuellste Version installieren
helm install rancher-offline-docs \
  oci://ghcr.io/tuxpeople/charts/rancher-offline-docs \
  --namespace rancher-docs-system \
  --create-namespace

# Spezifische Version
helm install rancher-offline-docs \
  oci://ghcr.io/tuxpeople/charts/rancher-offline-docs \
  --version 2026.4.1 \
  --namespace rancher-docs-system \
  --create-namespace
```

## Konfiguration

### Eigene Registry

Alle Images aus einer eigenen Registry beziehen (z.B. nach einem airgapped Mirror):

```bash
helm install rancher-offline-docs \
  oci://ghcr.io/tuxpeople/charts/rancher-offline-docs \
  --set registry=registry.example.com/rancher-docs
```

### Produkte deaktivieren

```bash
# Harvester und Rancher Desktop deaktivieren
helm install rancher-offline-docs \
  oci://ghcr.io/tuxpeople/charts/rancher-offline-docs \
  --set docs.harvester.enabled=false \
  --set docs.rancherdesktop.enabled=false
```

### values.yaml

```yaml
namespace: rancher-docs-system

# Registry-Prefix für alle Images
registry: ghcr.io/tuxpeople

docs:
  rancher:
    enabled: true
    image: rancher-docs
    tag: latest         # upstream Docs-Repo HEAD SHA, z.B. "a3f9c12"

  rke2:
    enabled: true
    image: rke2-docs
    tag: latest

  k3s:
    enabled: true
    image: k3s-docs
    tag: latest

  longhorn:
    enabled: true
    image: longhorn-docs
    tag: latest

  fleet:
    enabled: true
    image: fleet-docs
    tag: latest

  kubewarden:
    enabled: true
    image: kubewarden-docs
    tag: latest

  harvester:
    enabled: true
    image: harvester-docs
    tag: latest

  rancherdesktop:
    enabled: true
    image: rancher-desktop-docs
    tag: latest
```

> **Hinweis:** Das `tag`-Feld wird durch die CI-Pipeline automatisch auf den HEAD Commit-SHA des jeweiligen upstream Docs-Repos gesetzt. Manuell anpassen ist nicht nötig, ausser beim Pinnen auf eine bestimmte Version.

## Images spiegeln (airgapped)

Für vollständig airgapped Umgebungen müssen die Images in eine eigene Registry gespiegelt werden.

Mit `helm template` die genutzten Images auflisten:

```bash
helm template rancher-offline-docs \
  oci://ghcr.io/tuxpeople/charts/rancher-offline-docs \
  | grep 'image:' | sort -u
```

Dann mit `skopeo` oder `crane` in die eigene Registry kopieren:

```bash
skopeo copy \
  docker://ghcr.io/tuxpeople/rke2-docs:a3f9c12 \
  docker://registry.example.com/rancher-docs/rke2-docs:a3f9c12
```

Beim Install die eigene Registry setzen:

```bash
helm install rancher-offline-docs \
  oci://ghcr.io/tuxpeople/charts/rancher-offline-docs \
  --set registry=registry.example.com/rancher-docs \
  --set docs.rke2.tag=a3f9c12
```

## Upgrade

```bash
helm upgrade rancher-offline-docs \
  oci://ghcr.io/tuxpeople/charts/rancher-offline-docs \
  --version 2026.5.1
```

## Deinstallation

```bash
helm uninstall rancher-offline-docs -n rancher-docs-system
kubectl delete namespace rancher-docs-system
```

## Versionsschema

Der Chart nutzt **CalVer** (`YYYY.M.D`). Eine neue Chart-Version wird automatisch nach jedem Build auf `main` publiziert. Die Version beschreibt den Zeitpunkt des Snapshots, nicht die Version der enthaltenen Software.

## Ressourcen

Die Containers sind schlank (statisches HTML + nginx), aber die Gesamtlast summiert sich bei 8 aktiven Produkten. Ungefähre Werte:

| Ressource | Pro Container | Total (8 Produkte) |
|-----------|--------------|-------------------|
| CPU (idle) | ~1m | ~8m |
| Memory | ~10–20 Mi | ~80–160 Mi |
| Image-Grösse | ~50–200 MB | ~800 MB–1.6 GB |

Für ressourcenbeschränkte Umgebungen empfiehlt sich, nur die benötigten Produkte zu aktivieren.
