import Head from "next/head";

function Seo({ title }: { title: string }) {
  return (
    <Head>
      <title>{title}</title>
    </Head>
  );
}

export default Seo;
