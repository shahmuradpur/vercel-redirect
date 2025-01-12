import { useRouter } from "next/router";
import Head from "next/head";

export default function Redirect({ metadata }) {
    const router = useRouter();
    const { slug } = router.query;

    if (!metadata) {
        return <p>Loading...</p>;
    }

    return (
        <>
            <Head>
                <meta property="og:title" content={metadata.title} />
                <meta property="og:description" content={metadata.description} />
                <meta property="og:image" content={metadata.image} />
                <meta property="og:url" content={metadata.url} />
                <meta http-equiv="refresh" content={`0;url=${metadata.url}`} />
            </Head>
            <p>Redirecting...</p>
        </>
    );
}

export async function getServerSideProps(context) {
    const { slug } = context.params;
    const response = await fetch(`${process.env.GRAPHQL_ENDPOINT}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            query: `
                query GetPostBySlug($slug: String!) {
                    postBy(slug: $slug) {
                        title
                        excerpt
                        featuredImage {
                            node {
                                sourceUrl
                            }
                        }
                        uri
                    }
                }
            `,
            variables: { slug },
        }),
    });

    const data = await response.json();
    const post = data.data.postBy;

    if (!post) {
        return {
            notFound: true,
        };
    }

    return {
        props: {
            metadata: {
                title: post.title,
                description: post.excerpt,
                image: post.featuredImage.node.sourceUrl,
                url: post.uri,
            },
        },
    };
}
