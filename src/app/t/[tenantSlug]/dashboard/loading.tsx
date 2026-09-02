export default function DashboardLoading(): React.JSX.Element {
  return (
    <>
      <span className="vlz-skeleton vlz-skeleton-hero" />
      <div className="vlz-metrics-grid">
        <span className="vlz-skeleton vlz-skeleton-metric" />
        <span className="vlz-skeleton vlz-skeleton-metric" />
        <span className="vlz-skeleton vlz-skeleton-metric" />
      </div>
    </>
  );
}
