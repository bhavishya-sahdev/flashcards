import { Metadata } from "next";
import { DSARoadmap } from "@/components/flashcards/DSARoadmap";

export const metadata: Metadata = {
    title: 'DSA Roadmap | Interactive Learning Path',
    description: 'Master Data Structures and Algorithms with our structured learning roadmap and interactive flashcards.',
    icons: '/favicon.png',
    keywords: [
        'DSA roadmap',
        'data structures',
        'algorithms',
        'learning path',
        'computer science',
        'programming interview',
        'coding practice',
        'software engineering'
    ],
    authors: [{ name: 'Bhavishya Sahdev' }],
    openGraph: {
        title: 'DSA Roadmap | Interactive Learning Path',
        description: 'Master Data Structures and Algorithms with our structured learning roadmap and interactive flashcards.',
        images: 'https://media.licdn.com/dms/image/v2/D4D03AQELzkUlqIL7IA/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1681539369602?e=1757548800&v=beta&t=qqPkLnukNCdXAlqBoVnECW4tSAbeujj3azLjIx0saP8',
        url: 'https://bhavishya.dev/roadmap',
        type: 'website',
        siteName: 'Bhavishya Sahdev',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'DSA Roadmap | Interactive Learning Path',
        description: 'Master Data Structures and Algorithms with our structured learning roadmap and interactive flashcards.',
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

export default function RoadmapPage() {
    return <DSARoadmap />;
}