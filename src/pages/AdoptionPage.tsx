import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { PawPrint, MapPin } from "lucide-react";
import { PageHero } from "@/components/GuideBlocks";
import { PageMeta } from "@/components/PageMeta";
import { getAvailablePetListings } from "@/lib/mockApi";
import { PetImage } from "@/components/PetImage";
import type { PetListing } from "@/types/modules";

const STATUS_LABEL: Record<PetListing["status"], string> = {
  available: "Available",
  pending: "Pending",
  adopted: "Adopted",
};

export function AdoptionPage() {
  const [pets, setPets] = useState<PetListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAvailablePetListings().then((data) => {
      setPets(data);
      setLoading(false);
    });
  }, []);

  return (
    <>
      <PageMeta
        title="Pet Adoption — PawPath"
        description="Browse pets available for adoption. List, adopt, and match with loving homes."
      />
      <PageHero
        eyebrow="Adopt"
        title="Find your new best friend"
        subtitle="Every pet below is looking for a loving home. Read their story and send a request when you're ready."
      />
      <section className="max-w-6xl mx-auto px-6 py-12">
        {loading ? (
          <p className="text-center text-muted-foreground">Loading listings…</p>
        ) : pets.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No pets available right now. Check back soon!
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pets.map((pet) => (
              <Link
                key={pet.id}
                to={`/adoption/${pet.id}`}
                className="group rounded-2xl border border-border bg-card overflow-hidden shadow-[var(--shadow-card)] hover:-translate-y-1 transition"
              >
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  <PetImage
                    src={pet.images[0]}
                    alt={pet.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-lg">{pet.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {pet.breed} · {pet.age}
                      </p>
                    </div>
                    <span className="text-xs font-medium rounded-full bg-primary/10 text-primary px-2 py-0.5">
                      {STATUS_LABEL[pet.status]}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {pet.description}
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {pet.pickup.address}
                  </div>
                  <div className="mt-3 inline-flex items-center gap-1 text-sm text-primary font-medium">
                    <PawPrint className="h-4 w-4" /> View & adopt
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
