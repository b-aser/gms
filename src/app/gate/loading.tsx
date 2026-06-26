import { Skeleton } from "@/components/ui/skeleton";

export default function GateLoading() {
  return (
    <div className="space-y-6 pt-4">
      <div className="text-center space-y-2 pt-4">
        <Skeleton className="h-8 w-40 mx-auto" />
        <Skeleton className="h-4 w-56 mx-auto" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-44 rounded-xl" />
        <Skeleton className="h-44 rounded-xl" />
      </div>
    </div>
  );
}