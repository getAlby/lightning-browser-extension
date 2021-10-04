import React from "react";
import browser from "webextension-polyfill";
import * as dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import utils from "../../../common/lib/utils";
import { getFiatFromSatoshi } from "../../../common/utils/helpers";

import Button from "../../components/Button";
import Navbar from "../../components/Navbar";
import TransactionsTable from "../../components/TransactionsTable";
import UserMenu from "../../components/UserMenu";

import Loading from "../../components/Loading";
import PublisherCard from "../../components/PublisherCard";
import Progressbar from "../../components/Progressbar";

dayjs.extend(relativeTime);

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      allowance: null,
      currency: "USD",
      payments: {},
      loadingPayments: true,
      lnData: [],
    };
  }

  loadLightningDataFromCurrentWebsite() {
    // Enhancement data is loaded asynchronously (for example because we need to fetch additional data).
    // Sadly we can not get return values from async code through executeScript()
    // To work around this we write the enhancement data into a variable in the content script and access that variable here.
    // Due to the async execution the variable could potentially not yet be loaded
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      const [currentTab] = tabs;
      browser.tabs
        .executeScript(currentTab.id, {
          code: "window.LBE_LIGHTNING_DATA;",
        })
        .then((data) => {
          // data is an array, see: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/executeScript#return_value
          // we execute it only in the current Tab. Thus the array has only one entry
          if (data[0]) {
            this.setState({ lnData: data[0] });
          }
        });
    });
  }

  loadAllowance = () => {
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      const [currentTab] = tabs;
      const url = new URL(currentTab.url);
      utils.call("getAllowance", { host: url.host }).then((result) => {
        if (result.enabled) {
          this.setState({ allowance: result });
        }
      });
    });
  };

  loadAccountInfo() {
    utils.call("accountInfo").then((response) => {
      this.setState({
        alias: response.info?.alias,
        balance: parseInt(response.balance?.balance),
      });
      getFiatFromSatoshi(this.state.currency, this.state.balance).then(
        (fiat) => {
          this.setState({ balanceFiat: fiat });
        }
      );
    });
  }

  loadPayments() {
    utils.call("getPayments").then((result) => {
      this.setState({
        payments: result?.payments,
        loadingPayments: false,
      });
    });
  }

  initialize() {
    this.loadAccountInfo();
    this.loadPayments();
    this.loadAllowance();
  }

  componentDidMount() {
    this.initialize();
    this.loadLightningDataFromCurrentWebsite();
  }

  renderAllowanceView() {
    const { allowance } = this.state;
    return (
      <>
        <PublisherCard title={allowance.name} image={allowance.imageURL} />
        <div className="px-5 pb-5">
          {parseInt(allowance.totalBudget) > 0 ? (
            <div className="flex justify-between items-center py-3">
              <dl className="mb-0">
                <dt className="text-sm">Allowance</dt>
                <dd className="mb-0 text-sm text-gray-500">
                  {allowance.usedBudget} / {allowance.totalBudget} Sats
                </dd>
              </dl>
              <div className="w-24">
                <Progressbar percentage={allowance.percentage} />
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center py-3"></div>
          )}

          {allowance.payments && (
            <TransactionsTable
              transactions={allowance.payments.map((payment) => ({
                ...payment,
                type: "sent",
                date: dayjs(payment.createdAt).fromNow(),
                // date: dayjs.unix(payment.createdAt),
                title: (
                  <p>
                    <a
                      target="_blank"
                      title={payment.name}
                      href={`options.html#/publishers`}
                      rel="noreferrer"
                    >
                      {payment.description}
                    </a>
                  </p>
                ),
                subTitle: (
                  <p className="truncate">
                    <a
                      target="_blank"
                      title={payment.name}
                      href={`options.html#/publishers`}
                      rel="noreferrer"
                    >
                      {payment.host}
                    </a>
                  </p>
                ),
              }))}
            />
          )}
        </div>
      </>
    );
  }

  renderDefaultView() {
    const { payments } = this.state;
    return (
      <div className="p-5">
        <hr></hr>
        {this.state.loadingPayments ? (
          <div className="pt-4 flex justify-center">
            <Loading />
          </div>
        ) : (
          <TransactionsTable
            transactions={payments.map((payment) => ({
              ...payment,
              type: "sent",
              date: dayjs(payment.createdAt).fromNow(),
              title: (
                <p>
                  <a
                    target="_blank"
                    title={payment.name}
                    href={`options.html#/publishers`}
                    rel="noreferrer"
                  >
                    {payment.description}
                  </a>
                </p>
              ),
              subTitle: (
                <p className="truncate">
                  <a
                    target="_blank"
                    title={payment.name}
                    href={`options.html#/publishers`}
                    rel="noreferrer"
                  >
                    {payment.host}
                  </a>
                </p>
              ),
            }))}
          />
        )}
      </div>
    );
  }

  render() {
    const { alias, allowance, balance, lnData } = this.state;

    return (
      <div>
        <Navbar
          title={alias}
          subtitle={typeof balance === "number" ? `${balance} Sats` : ""}
          right={
            <UserMenu
              onAccountSwitch={() => {
                this.initialize();
              }}
            />
          }
        />
        {!allowance && lnData.length > 0 && (
          <PublisherCard title={lnData[0].name} image={lnData[0].icon}>
            <Button
              onClick={async () => {
                await utils.call(
                  "lnurl",
                  {
                    lnurlEncoded: lnData[0].recipient,
                  },
                  {
                    origin: {
                      external: true,
                      name: lnData[0].name,
                      description: lnData[0].description,
                      icon: lnData[0].icon,
                    },
                  }
                );
              }}
              label="⚡️ Send Sats ⚡️"
              primary
            />
          </PublisherCard>
        )}
        {allowance ? this.renderAllowanceView() : this.renderDefaultView()}
      </div>
    );
  }
}

export default Home;
