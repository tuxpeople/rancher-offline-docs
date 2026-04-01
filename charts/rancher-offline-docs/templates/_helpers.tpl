{{/*
Expand the name of the chart.
*/}}
{{- define "rancher-offline-docs.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "rancher-offline-docs.labels" -}}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Full image reference for a product.
Each product carries its own tag (= upstream docs repo HEAD SHA at build time).
Usage: include "rancher-offline-docs.image" (list . "rke2")
*/}}
{{- define "rancher-offline-docs.image" -}}
{{- $root := index . 0 -}}
{{- $key := index . 1 -}}
{{- $product := index $root.Values.docs $key -}}
{{- printf "%s/%s:%s" $root.Values.registry $product.image $product.tag -}}
{{- end }}
