import React from "react";
export function RedactedErrorBoundary() {
  const [hasError, setHasError] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  return hasError ? (
    <div className="p-6 text-center text-muted">
      <p className="font-medium text-accent">
        Something went wrong. Our team has been automatically notified.
      </p>
    </div>
  ) : null;
}
