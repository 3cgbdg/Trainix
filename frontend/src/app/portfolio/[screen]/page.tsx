import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TrainixShowcase, trainixScreens, type TrainixScreen } from "@/components/portfolio/TrainixShowcase";

export const metadata: Metadata = {
  title: "Product showcase",
  robots: { index: false, follow: false },
};

export function generateStaticParams() {
  return trainixScreens.map((screen) => ({ screen }));
}

export default async function PortfolioScreen({ params }: { params: Promise<{ screen: string }> }) {
  const { screen } = await params;
  if (!trainixScreens.includes(screen as TrainixScreen)) notFound();
  return <TrainixShowcase screen={screen as TrainixScreen} />;
}
