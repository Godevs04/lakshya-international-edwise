/**
 * Maps loan status chart segment labels to filtered student list URLs.
 */
export function loanStatusChartHref(chartName: string): string {
  const status = chartName.trim().toLowerCase().replace(/\s+/g, "_");

  if (status === "documents_pending") {
    return "/dashboard/students?workflow=docs_pending";
  }
  if (status === "sanctioned") {
    return "/dashboard/students?workflow=sanctioned";
  }
  if (status === "disbursed") {
    return "/dashboard/students?workflow=disbursed";
  }
  if (status === "rejected") {
    return "/dashboard/students?status=rejected";
  }

  return `/dashboard/students?status=${encodeURIComponent(status)}`;
}
