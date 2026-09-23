/**
 * Licensed stock photographs for the home hero / life band.
 * Hosted locally (CSP img-src 'self'). Not customers, not testimonials.
 */
export type HomeMediaItem = {
  src: string;
  alt: string;
  width: number;
  height: number;
  photographer: string;
  sourceUrl: string;
  license: string;
};

export const HOME_MEDIA = {
  phone: {
    src: "/media/home/office-phone.webp",
    alt: "Stock photograph: a person on a mobile phone at a desk with a laptop. Not a customer, not a live receptionist.",
    width: 640,
    height: 426,
    photographer: "Pexels contributor",
    sourceUrl: "https://www.pexels.com/photo/3760263/",
    license: "Pexels License",
  },
  trade: {
    src: "/media/home/site-trade.webp",
    alt: "Stock photograph: a tradesperson in a hard hat working at a wall-mounted electrical box. Not a dispatched contractor.",
    width: 640,
    height: 426,
    photographer: "Unsplash contributor",
    sourceUrl: "https://unsplash.com/photos/_2AlIm-F6pw",
    license: "Unsplash License",
  },
  row: {
    src: "/media/home/uk-row.webp",
    alt: "Stock photograph: a row of pale gabled houses under a blue sky. Not a MaintenanceOS customer estate or live portfolio.",
    width: 1280,
    height: 1156,
    photographer: "Max",
    sourceUrl: "https://unsplash.com/photos/83w1pQgZ5bs",
    license: "Unsplash License",
  },
} as const satisfies Record<string, HomeMediaItem>;

export const HOME_MEDIA_HONESTY =
  "Stock photographs · not customers · not a live job";
