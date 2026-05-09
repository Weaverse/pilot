interface StoreInfoProps {
  addressTitle: string;
  storeAddress: string;
  storeEmail: string;
}

export function StoreInfo({
  addressTitle,
  storeAddress,
  storeEmail,
}: StoreInfoProps) {
  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-base font-medium">{addressTitle}</h3>
      <div className="space-y-2">
        <p>{storeAddress}</p>
        <p>Email: {storeEmail}</p>
      </div>
    </div>
  );
}
