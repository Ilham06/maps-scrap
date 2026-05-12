import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingState({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="flex flex-col">
          <CardHeader className="pb-3">
            <Skeleton className="h-6 w-3/4" />
            <div className="flex gap-1.5 mt-2">
              <Skeleton className="h-5 w-14 rounded-full" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pb-3">
            <div className="space-y-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-2 w-full" />
            </div>
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </CardContent>
          <CardFooter className="pt-0">
            <Skeleton className="h-9 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
