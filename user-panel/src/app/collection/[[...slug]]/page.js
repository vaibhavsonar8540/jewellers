import React, { Suspense } from "react";
import ShopClient from "@/components/ShopClient";
import { Loader2 } from "lucide-react";
import { getCollectionMetadata } from "@/utils/pageMeta";

export async function generateMetadata({ params }) {
  const resolvedParams = params ? await params : { slug: [] };
  const slug = resolvedParams?.slug || [];

  return getCollectionMetadata(slug);
}

export default async function CollectionPage({ params }) {
  const resolvedParams = params ? await params : { slug: [] };
  const slug = resolvedParams?.slug || [];

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center space-y-3 p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-black" />
          <p className="text-xs font-semibold text-gray-500">Loading jewelry collections...</p>
        </div>
      }
    >
      <ShopClient slugParams={slug} />
    </Suspense>
  );
}
