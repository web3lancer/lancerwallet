import Skeleton from "../components/Skeleton";

export default function DeFiPage() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">DeFi</h2>
      <Skeleton height={40} className="mb-4" />
      <Skeleton height={80} />
    </div>
  );
}
