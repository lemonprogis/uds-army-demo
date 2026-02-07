{{/*
Selector labels for the application.
Used by deployment, service, and authservice enablement.
*/}}
{{- define "compat.selectorLabels" -}}
app: {{ .Chart.Name }}
{{- end -}}
