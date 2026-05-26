export default function SchoolConfirmPage({ params }: { params: { qrToken: string } }) {
  return (
    <div className="p-6 text-muted-foreground">
      School Confirmation — loading token: {params.qrToken}
    </div>
  );
}
