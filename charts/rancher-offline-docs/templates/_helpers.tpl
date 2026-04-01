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
Selector labels for a given component
Usage: include "rancher-offline-docs.selectorLabels" (list . "rke2")
*/}}
{{- define "rancher-offline-docs.selectorLabels" -}}
{{- $component := index . 1 -}}
app: {{ $component }}-offline-docs
{{- end }}

{{/*
Full image reference for a product
Usage: include "rancher-offline-docs.image" (list . "rke2")
*/}}
{{- define "rancher-offline-docs.image" -}}
{{- $root := index . 0 -}}
{{- $key := index . 1 -}}
{{- $product := index $root.Values.docs $key -}}
{{- printf "%s/%s:%s" $root.Values.registry $product.image $root.Values.image.tag -}}
{{- end }}
