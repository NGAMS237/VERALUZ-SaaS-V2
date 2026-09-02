/**
 * src/app/t/[tenantSlug]/loading.tsx
 * Squelette du shell pendant la résolution du tenant et de la session.
 */

export default function TenantLoading(): React.JSX.Element {
  return (
    <div className="vlz-shell">
      <div className="vlz-sidebar" aria-hidden="true">
        <div className="vlz-sidebar-brand">
          <span className="vlz-skeleton vlz-skeleton-icon" />
          <span className="vlz-skeleton vlz-skeleton-title" />
        </div>
      </div>
      <div className="vlz-shell-main">
        <div className="vlz-header">
          <span className="vlz-skeleton vlz-skeleton-header-title" />
        </div>
        <div className="vlz-shell-content">
          <span className="vlz-skeleton vlz-skeleton-hero" />
          <div className="vlz-metrics-grid">
            <span className="vlz-skeleton vlz-skeleton-metric" />
            <span className="vlz-skeleton vlz-skeleton-metric" />
            <span className="vlz-skeleton vlz-skeleton-metric" />
          </div>
        </div>
      </div>
    </div>
  );
}
