import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import * as dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Modal from "react-modal";
import CrossIcon from "@bitcoin-design/bitcoin-icons/svg/outline/cross.svg";
import { DotsHorizontalIcon } from "@heroicons/react/solid";

import utils from "../../common/lib/utils";
import Button from "../components/Button";
import Container from "../components/Container";
import Menu from "../components/Menu";
import PublisherCard from "../components/PublisherCard";
import Progressbar from "../components/Progressbar";
import TransactionsTable from "../components/TransactionsTable";
import CurrencyInput from "../components/Form/CurrencyInput";

dayjs.extend(relativeTime);

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
  },
};

function Publisher() {
  const [allowance, setAllowance] = useState({
    host: "",
    imageURL: "",
    remainingBudget: 0,
    usedBudget: 0,
    totalBudget: 0,
    payments: [],
  });
  const [modalIsOpen, setIsOpen] = useState(false);
  const { id } = useParams();
  const history = useHistory();
  const [budget, setBudget] = useState(0);

  async function fetchData() {
    try {
      const response = await utils.call("getAllowanceById", {
        id: parseInt(id),
      });
      console.log(response);
      setAllowance(response);
    } catch (e) {
      console.log(e.message);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  function openModal() {
    setBudget(allowance.totalBudget);
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

  async function updateAllowance() {
    const result = await utils.call("updateAllowance", {
      id: parseInt(id),
      totalBudget: budget,
    });
    await fetchData();
    closeModal();
  }

  async function deleteAllowance() {
    const result = await utils.call("deleteAllowance", { id: parseInt(id) });
    history.replace("/publishers");
  }

  return (
    <div>
      <PublisherCard
        title={allowance.host}
        image={allowance.imageURL}
        url={`https://${allowance.host}`}
      />
      <Container>
        <div className="flex justify-between items-center pt-8 pb-4">
          <dl>
            <dt className="text-sm font-medium text-gray-500">Allowance</dt>
            <dd className="flex items-center font-bold text-xl">
              {allowance.usedBudget} / {allowance.totalBudget} sats
              <div className="ml-3 w-24">
                <Progressbar percentage={allowance.percentage} />
              </div>
            </dd>
          </dl>

          <Menu>
            <Menu.Button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <DotsHorizontalIcon className="h-5 w-5" aria-hidden="true" />
            </Menu.Button>
            <Menu.List>
              <Menu.Item onClick={openModal}>Edit</Menu.Item>
              <Menu.Item
                onClick={() => {
                  if (
                    window.confirm(
                      "Are you sure you want to delete this publisher?"
                    )
                  ) {
                    deleteAllowance();
                  }
                }}
              >
                Delete
              </Menu.Item>
            </Menu.List>
          </Menu>
          <Modal
            closeTimeoutMS={200}
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            style={customStyles}
            contentLabel="Allowance Options"
            overlayClassName="bg-black bg-opacity-25 fixed inset-0"
            className="absolute rounded-lg bg-white w-full max-w-lg"
          >
            <div className="p-5 flex justify-between">
              <h2 className="text-2xl font-bold">Edit Allowance</h2>
              <button onClick={closeModal}>
                <img
                  className="w-6 h-6"
                  src={CrossIcon}
                  alt=""
                  aria-hidden="true"
                />
              </button>
            </div>
            <div className="p-5 border-t border-b border-gray-200">
              <label
                htmlFor="budget"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Budget
              </label>
              <div className="w-60">
                <CurrencyInput
                  id="budget"
                  name="budget"
                  placeholder="sats"
                  value={budget}
                  onChange={(event) => {
                    setBudget(event.target.value);
                  }}
                />
              </div>
            </div>
            <div className="flex justify-end p-5">
              <Button onClick={updateAllowance} label="Save" primary />
            </div>
          </Modal>
        </div>

        <div>
          <TransactionsTable
            transactions={allowance.payments.map((payment) => ({
              ...payment,
              type: "sent",
              date: dayjs(payment.createdAt).fromNow(),
              // date: dayjs.unix(payment.createdAt),
              title: payment.description,
              subTitle: (
                <p className="truncate">
                  {payment.name} @{" "}
                  <a target="_blank" href={payment.location} rel="noreferrer">
                    {payment.location}
                  </a>
                </p>
              ),
            }))}
          />
        </div>
      </Container>
    </div>
  );
}

export default Publisher;
