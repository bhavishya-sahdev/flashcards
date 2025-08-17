import { Metadata } from "next";
import { RoadmapAnalyticsPage } from "@/components/flashcards/RoadmapAnalyticsPage";

export const metadata: Metadata = {
    title: 'Roadmap Analytics | Learning Progress',
    description: 'Track your learning progress across all roadmaps with detailed analytics and insights.',
    icons: '/favicon.png',
    keywords: [
        'learning analytics',
        'progress tracking',
        'study statistics',
        'roadmap progress',
        'learning insights',
        'study metrics',
        'educational analytics'
    ],
    authors: [{ name: 'Bhavishya Sahdev' }],
    openGraph: {
        title: 'Roadmap Analytics | Learning Progress',
        description: 'Track your learning progress across all roadmaps with detailed analytics and insights.',
        images: 'https://media.licdn.com/dms/image/v2/D4D03AQELzkUlqIL7IA/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1681539369602?e=1757548800&v=beta&t=qqPkLnukNCdXAlqBoVnECW4tSAbeujj3azLjIx0saP8',
        url: 'https://bhavishya.dev/roadmap/analytics',
        type: 'website',
        siteName: 'Bhavishya Sahdev',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Roadmap Analytics | Learning Progress',
        description: 'Track your learning progress across all roadmaps with detailed analytics and insights.',
        images: 'https://media.licdn.com/dms/image/v2/D4D03AQELzkUlqIL7IA/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1681539369602?e=1757548800&v=beta&t=qqPkLnukNCdXAlqBoVnECW4tSAbeujj3azLjIx0saP8',
        creator: '@bhavishyasahdev',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
};

export default function RoadmapAnalyticsRoute() {
    return <RoadmapAnalyticsPage />;
}