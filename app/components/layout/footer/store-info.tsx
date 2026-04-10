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
      <div className="text-base">{addressTitle}</div>
      <div className="space-y-2">
        <p>{storeAddress}</p>
        <p>Email: {storeEmail}</p>
      </div>
    </div>
  );
}
