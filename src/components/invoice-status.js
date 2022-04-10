function InvoiceDefaultStatus({ status }) {
  return (
    <div className="d-flex mt-2">
      <div className="ml-3 text-muted" style={{ fontWeight: "600" }}>
        {status}
      </div>
    </div>
  );
}

function InvoiceConfirmedStatus({ status }) {
  return (
    <div className="d-flex mt-2">
      <div className="ml-3 text-success" style={{ fontWeight: "600" }}>
        {status}
      </div>
    </div>
  );
}

function InvoiceFailedStatus({ status }) {
  return (
    <div className="d-flex mt-2">
      <div className="ml-3 text-danger" style={{ fontWeight: "600" }}>
        {status}
      </div>
    </div>
  );
}

export default function InvoiceStatus({ variant, status }) {
  switch (variant) {
    case "confirmed":
      return <InvoiceConfirmedStatus status={status} />;
    case "failed":
      return <InvoiceFailedStatus status={status} />;
    default:
      return <InvoiceDefaultStatus status={status} />;
  }
}
