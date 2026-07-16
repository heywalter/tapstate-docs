import { RefreshCw, Rows3 } from 'lucide-react';
import { Children, cloneElement, Fragment, isValidElement, useId, type ReactElement, type ReactNode } from 'react';

type SourceMode = 'snapshot' | 'snapshot-cdc';

type SourceModeTabProps = {
  value: SourceMode;
  children: ReactNode;
  label?: string;
  description?: string;
  mode?: SourceMode;
  panelId?: string;
  labelId?: string;
};

type SourceModeCopy = {
  label: string;
  description: string;
};

const fallbackCopy: Record<SourceMode, SourceModeCopy> = {
  snapshot: {
    label: 'Full load (Snapshot)',
    description: 'Copy existing rows once',
  },
  'snapshot-cdc': {
    label: 'Full load + CDC',
    description: 'Copy existing rows, then stay in sync',
  },
};

const checkedControlClass: Record<SourceMode, string> = {
  snapshot: 'peer-checked/snapshot:bg-fd-card peer-checked/snapshot:shadow-sm',
  'snapshot-cdc': 'peer-checked/snapshot-cdc:bg-fd-card peer-checked/snapshot-cdc:shadow-sm',
};

const inputClass: Record<SourceMode, string> = {
  snapshot: 'peer/snapshot sr-only',
  'snapshot-cdc': 'peer/snapshot-cdc sr-only',
};

const panelClass: Record<SourceMode, string> = {
  snapshot: 'peer-checked/snapshot:block',
  'snapshot-cdc': 'peer-checked/snapshot-cdc:block',
};

/**
 * A native radio group for source preparation paths. It works without client-side JavaScript so
 * the selected path and its preparation steps remain usable in exported documentation.
 */
export function SourceModeTabs({
  children,
  label = 'Choose the source read mode',
}: {
  children: ReactNode;
  label?: string;
}) {
  const tabsetId = useId();
  const modes = Children.toArray(children).filter(isValidElement<SourceModeTabProps>) as Array<
    ReactElement<SourceModeTabProps>
  >;
  const modeCopy = (value: SourceMode) => {
    const tab = modes.find((child) => child.props.value === value);
    const fallback = fallbackCopy[value];
    return {
      label: tab?.props.label ?? fallback.label,
      description: tab?.props.description ?? fallback.description,
    };
  };

  return (
    <section
      aria-label={label}
      className="not-prose my-5 grid grid-cols-2 overflow-hidden rounded-xl border border-fd-border bg-fd-card"
      role="radiogroup"
    >
      {(['snapshot', 'snapshot-cdc'] as const).map((mode) => {
        const copy = modeCopy(mode);
        const isSnapshot = mode === 'snapshot';
        const Icon = isSnapshot ? Rows3 : RefreshCw;
        const tone = isSnapshot
          ? 'peer-checked/snapshot:border-sky-200 peer-checked/snapshot:text-sky-800 dark:peer-checked/snapshot:border-sky-900 dark:peer-checked/snapshot:text-sky-200'
          : 'peer-checked/snapshot-cdc:border-cyan-200 peer-checked/snapshot-cdc:text-cyan-800 dark:peer-checked/snapshot-cdc:border-cyan-900 dark:peer-checked/snapshot-cdc:text-cyan-200';
        const iconTone = isSnapshot
          ? 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
          : 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300';
        const inputId = `${tabsetId}-${mode}-input`;
        const labelId = `${tabsetId}-${mode}-label`;

        return (
          <Fragment key={mode}>
            <input
              className={inputClass[mode]}
              defaultChecked={mode === 'snapshot'}
              id={inputId}
              name={`${tabsetId}-mode`}
              type="radio"
              value={mode}
            />
            <label
              className={`cursor-pointer border-b border-transparent bg-fd-muted/35 px-3 py-3 text-left transition-colors duration-200 hover:bg-fd-muted/60 ${checkedControlClass[mode]} ${tone}`}
              htmlFor={inputId}
              id={labelId}
            >
              <span className="flex items-center gap-2.5">
                <span className={`flex size-8 shrink-0 items-center justify-center rounded-md ${iconTone}`}>
                  <Icon aria-hidden="true" className="size-4" strokeWidth={2} />
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold text-fd-foreground">{copy.label}</span>
                  <span className="hidden text-xs font-normal text-fd-muted-foreground sm:block">{copy.description}</span>
                </span>
              </span>
            </label>
          </Fragment>
        );
      })}
      {modes.map((child) =>
        cloneElement(child, {
          labelId: `${tabsetId}-${child.props.value}-label`,
          mode: child.props.value,
          panelId: `${tabsetId}-${child.props.value}-panel`,
        }),
      )}
    </section>
  );
}

export function SourceModeTab({
  children,
  labelId,
  mode = 'snapshot',
  panelId,
}: SourceModeTabProps) {
  return (
    <div
      aria-labelledby={labelId}
      className={`col-span-2 hidden bg-transparent p-4 sm:p-5 ${panelClass[mode]}`}
      id={panelId}
      role="region"
    >
      {children}
    </div>
  );
}

/** A semantic ordered procedure for preparation paths with substantial step content. */
export function PreparationSteps({ children }: { children: ReactNode }) {
  return (
    <ol className="my-5 list-decimal space-y-6 pl-6 marker:font-semibold marker:text-fd-primary">
      {children}
    </ol>
  );
}

export function PreparationStep({ children, title }: { children: ReactNode; title: string }) {
  return (
    <li className="pl-1">
      <p className="mt-0 font-semibold text-fd-foreground">{title}</p>
      <div className="mt-3 [&>*:last-child]:mb-0">{children}</div>
    </li>
  );
}
