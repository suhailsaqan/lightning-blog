import Layout from "../components/Layout";
import BasicMeta from "../components/meta/BasicMeta";
import OpenGraphMeta from "../components/meta/OpenGraphMeta";
import TwitterCardMeta from "../components/meta/TwitterCardMeta";
import { SocialList } from "../components/SocialList";

export default function Index() {
  return (
    <Layout>
      <BasicMeta url={"/"} />
      <OpenGraphMeta url={"/"} />
      <TwitterCardMeta url={"/"} />
      <div className="container">
        <div>
          <h1>
            Suhail's Lightning Paywalled Blog
            <span className="fancy">.</span>
          </h1>
          <span className="handle">@suhailsaqan</span>
          <h2>
            Self-host your own blog with a lightning paywall - no censorship!
          </h2>
          <SocialList />
        </div>
      </div>
      <style jsx>{`
        .container {
          display: flex;
          margin: 0 auto;
          max-width: 80%;
          width: calc(80% - 1.5rem);
        }
        h1 {
          font-size: 2.5rem;
          margin: 0;
          font-weight: 500;
        }
        h2 {
          font-size: 1.75rem;
          font-weight: 400;
          line-height: 1.25;
        }
        .fancy {
          color: #15847d;
        }
        .handle {
          display: inline-block;
          margin-top: 0.275em;
          color: #9b9b9b;
          letter-spacing: 0.05em;
        }

        // @media (min-width: 769px) {
        //   h1 {
        //     font-size: 3rem;
        //   }
        //   h2 {
        //     font-size: 2.25rem;
        //   }
        // }
        @media (max-width: 769px) {
          .container {
            max-width: 100%;
          }
        }
      `}</style>
    </Layout>
  );
}
