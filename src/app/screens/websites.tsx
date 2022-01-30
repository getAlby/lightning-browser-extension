import Container from "../components/Container";
import UsedCard from "../components/WebsitesUsedCard";
import m1 from "/static/assets/icons/makers1.svg";
import m2 from "/static/assets/icons/makers2.svg";
import FlashList from "../components/FlashList";
import OtherCard from "../components/OtherCard";
import lnmarket from "/static/assets/icons/lnmarket.svg";
import kollider from "/static/assets/icons/kollider.png";
import loft from "/static/assets/icons/loft.svg";
import lngames from "/static/assets/icons/lngames.svg";
import lightiningpoker from "/static/assets/icons/lightningpoker.svg";
import lnblackjack from "/static/assets/icons/lnblackjack.svg";
import lightiningroulette from "/static/assets/icons/lightningroulette.svg";
import stacker from "/static/assets/icons/stacker.news.svg";
import bitrefill from "/static/assets/icons/bitrefil.svg";
import lightiningnetworkscores from "/static/assets/icons/lightningnetworkscores.svg";
import sparkshot from "/static/assets/icons/spackshot.svg";
import satsforlikes from "/static/assets/icons/satsforlikes.svg";
import inshort from "/static/assets/icons/inshort.it.svg";

function Websites() {
  const usedcard = [
    {
      title: "makers bolt",
      url: "makersbolt.fun",
      payment: "1",
      logo: m1,
    },
    {
      title: "makers bolt",
      url: "makersbolt.fun",
      payment: "1",
      logo: m2,
      to: "",
    },
  ];

  const list = [
    {
      title: "Trading",
      data: [
        {
          title: "LNMarkets",
          subtitle: "Instant Bitcoin derivatives trading",
          logo: lnmarket,
          to: "https://testnet.lnmarkets.com/",
        },
        {
          title: "Kollider",
          subtitle: "Instant Bitcoin derivatives trading",
          logo: kollider,
          shadow: true,
          to: "https://kollider.xyz/",
        },
        {
          title: "LOFT",
          shadow: true,
          subtitle: "Trade investment products in Bitcoin",
          logo: loft,
          to: "https://loft.trade/",
        },
      ],
    },

    {
      title: "gaming",
      data: [
        {
          title: "LNGames",
          subtitle: "Simple Lightning Network games",
          logo: lngames,
          to: "https://lightningnetwork.plus/nodes/03952f8756c036669440e06c782c7f21732886ccf04052e0e6e792f8f5a490f6aa",
        },
        {
          title: "Lightining Poker",
          subtitle: "Play Poker with Bitcoin",
          logo: lightiningpoker,
          to: "https://lightning-poker.com/",
        },
        {
          title: "LNBlackJack",
          subtitle: "Play Blackjack with Bitcoin",
          logo: lnblackjack,
          to: "https://www.lnblackjack.com/",
        },
        {
          title: "Lightining Roulette",
          subtitle: "Play Roulette with Bitcoin",
          logo: lightiningroulette,
          to: "https://www.gentingcasino.com/en-ROW/live-casino/game-shows/lightning-roulette/",
        },
      ],
    },
    {
      title: "Entertaiment",
      data: [
        {
          title: "Stacker.New",
          subtitle: "Lightning powered Bitcoin news site",
          logo: stacker,
          to: "https://stacker.news/",
        },
      ],
    },

    {
      title: "miscellaneous",
      data: [
        {
          title: "Spackshot",
          subtitle: "Art created and funded by the community ",
          logo: sparkshot,
          to: "",
        },
        {
          title: "Sats for Likes",
          subtitle: "Earn sats for accomplishing tasks",
          logo: satsforlikes,
          to: "https://kriptode.com/satsforlikes/index.html",
        },
        {
          title: "lnshort.it",
          subtitle: "Service to redirect URLs and generate QR codes ",
          logo: inshort,
          shadow: true,
          to: "https://lnshort.it/",
        },
      ],
    },
    {
      title: "shopping",
      data: [
        {
          title: "Bitrefill",
          subtitle: "Buy vouchers, refill your phone or pay your bills",
          logo: bitrefill,
          to: "https://www.bitrefill.com/?hl=en",
        },
        {
          title: "Lightning Network Stores",
          shadow: true,
          subtitle:
            "Collection of stores and websites accepting Bitcoin payments",
          logo: lightiningnetworkscores,
          to: "https://cointelegraph.com/tags/lightning-network",
        },
      ],
    },
    {
      title: "miscellaneous",
      data: [
        {
          title: "Spackshot",
          subtitle: "Art created and funded by the community ",
          logo: sparkshot,
          to: "",
        },
        {
          title: "Sats for Likes",
          subtitle: "Earn sats for accomplishing tasks",
          logo: satsforlikes,
          to: "https://kriptode.com/satsforlikes/index.html",
        },
        {
          title: "lnshort.it",
          subtitle: "Service to redirect URLs and generate QR codes ",
          logo: inshort,
          shadow: true,
          to: "https://lnshort.it/",
        },
      ],
    },
  ];

  return (
    <Container>
      <div className="mt-8">
        <FlashList
          used
          prefix="Your"
          suffix="websites"
          subtitle="Websites where you have used Alby before"
        />
      </div>
      <div className=" ">
        {usedcard.map(({ title, payment, logo, url }) => (
          <UsedCard
            title={title}
            url={url}
            payment={payment}
            logo={logo}
            key={logo}
          />
        ))}
      </div>
      <div className="mt-8">
        <FlashList
          used
          prefix="Other"
          suffix="websites"
          subtitle="Websites where you can use Alby"
        />
      </div>
      <div>
        {list.map(({ title, data }) => (
          <div key={title}>
            {" "}
            <FlashList prefix={title} image="" />
            <div className=" grid gap-4 md:grid-cols-4">
              {data.map(({ title, subtitle, logo, to, shadow }) => (
                <OtherCard
                  title={title}
                  subtitle={subtitle}
                  logo={logo}
                  to={to}
                  shadow={shadow}
                  key={title}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
}

export default Websites;
