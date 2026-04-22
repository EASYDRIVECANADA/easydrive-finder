import { Link } from "@tanstack/react-router";
import { LISTING_TYPE_STYLES, type Vehicle } from "@/data/vehicles";
import { Gauge, Fuel, Settings2 } from "lucide-react";

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const lt = LISTING_TYPE_STYLES[vehicle.listingType];
  return (
    <Link
      to="/inventory/$vehicleId"
      params={{ vehicleId: vehicle.id }}
      className="group overflow-hidden rounded-2xl border border-border bg-card transition hover:shadow-lg"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <img
          src={vehicle.image}
          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow ${lt.chip}`}>
          {lt.label}
        </span>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-lg font-semibold leading-tight">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h3>
            <p className="text-sm text-muted-foreground">{vehicle.trim}</p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-foreground">
              ${vehicle.salePrice.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground line-through">
              ${vehicle.listPrice.toLocaleString()}
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Gauge className="h-3.5 w-3.5" /> {vehicle.odometer.toLocaleString()} km
          </span>
          <span className="inline-flex items-center gap-1">
            <Settings2 className="h-3.5 w-3.5" /> {vehicle.transmission}
          </span>
          <span className="inline-flex items-center gap-1">
            <Fuel className="h-3.5 w-3.5" /> {vehicle.fuel}
          </span>
        </div>
        <div className="mt-3 text-xs text-muted-foreground">Sold by {vehicle.sellerName}</div>
      </div>
    </Link>
  );
}
