export type JourneyMilestone = {
  slug: string;
  title: string;
  dateLabel: string;
  levelLabel: string;
  summary: string;
  story: string;
  photoPrompt: string;
  photoSrc: string;
  photoAlt: string;
  colors: {
    sky: number;
    hill: number;
    accent: number;
  };
};

export const milestones: JourneyMilestone[] = [
  {
    slug: "student-arrival",
    title: "Arrived in Australia as a student",
    dateLabel: "18 Feb 2020",
    levelLabel: "Arrival runway",
    summary:
      "A new country, new routines, and the first brave step into an unfamiliar future.",
    story:
      "This chapter begins with arrival: carrying ambition, uncertainty, and the courage to start over in a new country.",
    photoPrompt: "Airport arrival or early student life photo",
    photoSrc: "/assets/photos/01-student-arrival.webp",
    photoAlt: "Sravya arriving in Australia as a student",
    colors: {
      sky: 0xf7d8a8,
      hill: 0xeca35f,
      accent: 0x7f3b4d,
    },
  },
  {
    slug: "graduate-engineer",
    title: "Started as a graduate engineer at Sage Group",
    dateLabel: "Dec 2021",
    levelLabel: "First role sprint",
    summary:
      "Study transformed into professional momentum through the first engineering role.",
    story:
      "The second chapter marks the shift from student ambition to professional contribution, where theory met real systems and teams.",
    photoPrompt: "First day at work or office milestone photo",
    photoSrc: "/assets/photos/02-graduate-engineer.webp",
    photoAlt: "Sravya starting as a graduate engineer at Sage Group",
    colors: {
      sky: 0xc9e6ef,
      hill: 0x71adc5,
      accent: 0x1d5878,
    },
  },
  {
    slug: "masters-graduation",
    title: "Graduated from the University of Melbourne",
    dateLabel: "May 2022",
    levelLabel: "Graduation climb",
    summary:
      "A master’s degree in electrical engineering became a visible milestone earned through persistence.",
    story:
      "Graduation is the summit of the academic chapter, proof that long effort, sacrifice, and focus turned into a formal achievement.",
    photoPrompt: "Graduation ceremony photo",
    photoSrc: "/assets/photos/03-masters-graduation.webp",
    photoAlt: "Sravya graduating from the University of Melbourne",
    colors: {
      sky: 0xd9d2ff,
      hill: 0xa79de5,
      accent: 0x56438b,
    },
  },
  {
    slug: "promotion-control-systems",
    title: "Promoted to control systems engineer",
    dateLabel: "2023",
    levelLabel: "Promotion bridge",
    summary:
      "Recognition arrived in the form of greater trust, responsibility, and technical leadership.",
    story:
      "This promotion chapter reflects growth: not only doing the work, but being trusted to shape it with confidence and expertise.",
    photoPrompt: "Promotion announcement or proud work photo",
    photoSrc: "/assets/photos/04-promotion-control-systems.webp",
    photoAlt: "Sravya promoted to control systems engineer",
    colors: {
      sky: 0xcde5d0,
      hill: 0x79a980,
      accent: 0x325c39,
    },
  },
  {
    slug: "first-home",
    title: "Bought a house",
    dateLabel: "15 Dec 2023",
    levelLabel: "Home keys horizon",
    summary:
      "A place of her own turned years of effort into something tangible, steady, and deeply personal.",
    story:
      "The home chapter is about stability and belonging, where achievement becomes a physical space built for the future.",
    photoPrompt: "House keys or new home photo",
    photoSrc: "/assets/photos/05-first-home.webp",
    photoAlt: "Sravya with her first home",
    colors: {
      sky: 0xf6d7b3,
      hill: 0xd98745,
      accent: 0x8b4d21,
    },
  },
  {
    slug: "first-car",
    title: "Bought her first car",
    dateLabel: "25 Jun 2024",
    levelLabel: "Open road launch",
    summary:
      "Another symbol of independence, movement, and confidence in the life she built.",
    story:
      "Buying the first car marks mobility and freedom, another practical milestone that also carries emotional weight.",
    photoPrompt: "First car photo",
    photoSrc: "/assets/photos/06-first-car.webp",
    photoAlt: "Sravya with her first car",
    colors: {
      sky: 0xc7ddf8,
      hill: 0x6a95c8,
      accent: 0x29486f,
    },
  },
  {
    slug: "permanent-residency",
    title: "Received Permanent Residency",
    dateLabel: "12 Aug 2024",
    levelLabel: "Residency gates",
    summary:
      "A defining legal and personal milestone that changed possibility into permanence.",
    story:
      "Permanent residency is one of the biggest turning points in the journey, reshaping the future with security, recognition, and relief.",
    photoPrompt: "Permanent residency confirmation or celebration photo",
    photoSrc: "/assets/photos/07-permanent-residency.webp",
    photoAlt: "Sravya receiving permanent residency",
    colors: {
      sky: 0xd4f1e7,
      hill: 0x6cb39a,
      accent: 0x1c6751,
    },
  },
  {
    slug: "citizenship",
    title: "Received Australian Citizenship",
    dateLabel: "16 Apr 2026",
    levelLabel: "Citizenship summit",
    summary:
      "The journey reaches its highest point with a sense of belonging fully claimed and celebrated.",
    story:
      "Citizenship is the closing chapter of this first arc: a moment of pride, permanence, and recognition for everything it took to get here.",
    photoPrompt: "Citizenship ceremony photo",
    photoSrc: "/assets/photos/08-citizenship.webp",
    photoAlt: "Sravya at her Australian citizenship ceremony",
    colors: {
      sky: 0xffddb7,
      hill: 0xf09a5e,
      accent: 0xa53f2f,
    },
  },
];