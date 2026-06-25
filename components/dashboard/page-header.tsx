import { Design06RibbonWaves } from "@/components/layout/design06-ribbon-waves";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  badge?: string;
}

export function PageHeader({ title, description, action, badge }: PageHeaderProps) {
  return (
    <div className="page-header-band relative overflow-hidden p-5 sm:p-6">
      <Design06RibbonWaves variant="compact" />

      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {badge && (
            <span className="mb-2 inline-flex items-center rounded-full bg-[#6D5EF7]/10 px-3 py-1 text-xs font-semibold text-[#6D5EF7]">
              {badge}
            </span>
          )}
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
          {description && (
            <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {action && (
          <div className="flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}
