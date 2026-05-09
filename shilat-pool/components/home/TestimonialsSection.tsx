import { prisma } from "@/lib/prisma";
import TestimonialsCarousel from "./TestimonialsCarousel";

export default async function TestimonialsSection() {
  const testimonials = await prisma.testimonial.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  if (testimonials.length === 0) return null;

  return <TestimonialsCarousel testimonials={testimonials} />;
}
