import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Study Folder | Interactive Flashcards',
    description: 'Study your flashcards with interactive code execution and spaced repetition.',
    icons: '/favicon.png',
    keywords: [
        'flashcards study',
        'code practice',
        'learning folder',
        'interactive flashcards',
        'spaced repetition',
        'programming study',
        'code editor flashcards'
    ],
    authors: [{ name: 'Bhavishya Sahdev' }],
    openGraph: {
        title: 'Study Folder | Interactive Flashcards',
        description: 'Study your flashcards with interactive code execution and spaced repetition.',
        images: 'https://media.licdn.com/dms/image/v2/D4D03AQELzkUlqIL7IA/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1681539369602?e=1757548800&v=beta&t=qqPkLnukNCdXAlqBoVnECW4tSAbeujj3azLjIx0saP8',
        url: 'https://bhavishya.dev/folders',
        type: 'website',
        siteName: 'Bhavishya Sahdev',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Study Folder | Interactive Flashcards',
        description: 'Study your flashcards with interactive code execution and spaced repetition.',
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

export default function FoldersLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return children;
}