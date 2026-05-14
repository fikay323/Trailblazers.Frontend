export interface GalleryImage {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string; // Optional: for custom spans if needed
}

export const galleryImages: GalleryImage[] = [
  {
    src: "/images/image-5.jpeg",
    alt: "Trailblazers Academy building exterior",
    className: "md:row-span-2 h-125"
  },
  {
    src: "/images/image-1.jpeg",
    alt: "Students in a modern classroom setting",
    className: "h-62.5"
  },
  {
    src: "/images/image-2.jpeg",
    alt: "Students working on coding projects",
    className: "h-62.5"
  },
  {
    src: "/images/image-3.jpeg",
    alt: "Student studying in the academy library",
    className: "md:col-span-2 h-62.5"
  },
  {
    src: "/images/image-4.jpeg",
    alt: "Science laboratory equipment and students",
    className: "md:row-span-2 h-75"
  },
  {
    src: "/images/image-6.jpeg",
    alt: "Outdoor campus area for students",
    className: "h-62.5"
  },
  {
    src: "/images/image-7.jpeg",
    alt: "Collaborative workspace for group projects",
    className: "h-62.5"
  },
  {
    src: "/images/image-8.jpeg",
    alt: "Students engaged in a seminar",
    className: "md:col-span-2 h-62.5"
  },
  {
    src: "/images/image-9.jpeg",
    alt: "Modern technology lab",
    className: "md:col-span-2 h-62.5"
  },
  {
    src: "/images/image-10.jpeg",
    alt: "Sports and recreational facilities",
    className: "h-62.5"
  },
  {
    src: "/images/image-11.jpeg",
    alt: "Student lounge and relaxation area",
    className: "md:col-span-3 h-62.5 "
  }
];
