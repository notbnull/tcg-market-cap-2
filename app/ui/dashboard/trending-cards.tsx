import { TrendingCard } from "@/app/lib/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/ui/components/card";
export default function TrendingCards({ data }: { data: TrendingCard[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Trending Cards</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {data.map((card) => (
            <Card key={card.id} className="overflow-hidden">
              <img
                src={card.image}
                alt={card.name}
                className="w-full h-48 object-cover"
              />
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-2">{card.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {card.set} ({card.year})
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    Rank #{card.popularityRank}
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      card.priceChange >= 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {card.priceChange >= 0 ? "+" : ""}
                    {card.priceChange}%
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t">
                  <p className="text-sm">
                    <span className="font-medium">PSA:</span> $
                    {card.marketCap.PSA.toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
