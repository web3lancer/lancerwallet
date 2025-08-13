import Skeleton from "../components/Skeleton";

export default function SendPage() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Send / Receive</h2>
      <Skeleton height={40} className="mb-4" />
      <Skeleton height={80} />
    </div>
  );
}
