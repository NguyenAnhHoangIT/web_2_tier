# Implementation Plan: Lab 3 - Kubernetes Manifests & ArgoCD Application

This plan covers setting up the Kubernetes manifests and GitOps config files to deploy the metrics application via ArgoCD and scrape telemetry using Prometheus.

## Proposed Changes

We will create a new directory structure `k8s-api` and `argocd/apps` containing the Kubernetes configs.

### Kubernetes Manifests

#### [NEW] [api.yaml](file:///d:/aws/web2tier/k8s-api/api.yaml)
Create a unified Kubernetes file declaring both the **Rollout** and the **Service** resources:
- **Rollout**: Uses `argoproj.io/v1alpha1` API, configures 4 replicas, runs the `w9-api:1` image, injects `ERROR_RATE=0` and `VERSION=v1` env variables, and establishes `/healthz` readiness checks. Includes the specified canary steps.
- **Service**: Standard Kubernetes service mapping port 8080 of the cluster to targetPort 8080 of the api pods.

#### [NEW] [servicemonitor.yaml](file:///d:/aws/web2tier/k8s-api/servicemonitor.yaml)
Create the Prometheus telemetry scrap configuration:
- Uses `monitoring.coreos.com/v1` API.
- Configured in the `demo` namespace.
- Targets service pods with label `app: api` at path `/metrics` every 15 seconds.

### GitOps Application Configuration

#### [NEW] [api.yaml](file:///d:/aws/web2tier/argocd/apps/api.yaml)
Create the ArgoCD Application manifest:
- Declares `kind: Application` in the `argocd` namespace.
- Sources the local path `k8s-api` from the git repository `https://github.com/NguyenAnhHoangIT/web_2_tier.git`.
- Deploys resources into the destination namespace `demo`.

---

## Open Questions

> [!IMPORTANT]
> - Is the repository URL `https://github.com/NguyenAnhHoangIT/web_2_tier.git` correct for your ArgoCD configuration, or would you like to use another one?
> - Is your ArgoCD server deployed in the standard `argocd` namespace?

---

## Verification Plan

We will verify that the files are syntactically correct and describe how to verify deployment:

1. **Verify Manifest Syntax Locally**:
   Run dry-runs against the active Minikube cluster:
   ```bash
   kubectl apply --dry-run=client -f k8s-api/api.yaml
   kubectl apply --dry-run=client -f k8s-api/servicemonitor.yaml
   kubectl apply --dry-run=client -f argocd/apps/api.yaml
   ```

2. **ArgoCD Deployment & Telemetry Verification (Manual)**:
   - Commit and push files to GitHub.
   - Trigger sync in ArgoCD.
   - Run busybox load generation:
     ```bash
     kubectl -n demo run load --image=busybox --restart=Never -- sh -c "while true; do wget -qO- api:8080/; done"
     ```
   - Port-forward Prometheus and query `flask_http_request_total{namespace="demo"}` to watch metrics increment.
